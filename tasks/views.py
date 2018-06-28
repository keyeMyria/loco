from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from rest_framework.exceptions import ValidationError

from loco import utils

from . import serializers, models
from . import permissions as task_permissions

from accounts.models import User
from teams.models import Team, TeamMembership
from teams.permissions import IsTeamMember, IsAdminOrReadOnly, IsAdmin, IsMe
from notifications.tasks import send_task_gcm_async

def get_status_rank(status):
    if status == models.Task.STATUS_CREATED:
        return 1
    elif status == models.Task.STATUS_ACCEPTED:
        return 2
    elif status == models.Task.STATUS_PROGRESS:
        return 3
    elif status == models.Task.STATUS_DELIVERED:
        return 4
    elif status == models.Task.STATUS_CANCELED:
        return 5
    elif status == models.Task.STATUS_DELETED:
        return 6
    else:
        return 1000

class TaskList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember, IsAdminOrReadOnly)

    def get(self, request, team_id, format=None):
        PARAM_ASSIGNED_TO = 'assigned_to'
        PARAM_STATUS = 'status'
        filter_assigned_to = request.query_params.get(PARAM_ASSIGNED_TO)
        filter_status = request.query_params.get(PARAM_STATUS)

        start, limit = utils.get_query_start_limit(request)
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        tasks = team.task_set.exclude(status=models.Task.STATUS_DELETED)
        if filter_assigned_to:
            if filter_assigned_to == "0" or filter_assigned_to == 0:
                tasks = tasks.filter(assigned_to__isnull=True)
            else:
                tasks = tasks.filter(assigned_to=filter_assigned_to)
        if filter_status:
            tasks = tasks.filter(status=filter_status)

        tasks = tasks.order_by('status_priority', '-created')[start:start+limit]
        serialized_tasks = serializers.TaskSerializer(tasks, many=True).data
        return Response(serialized_tasks)

    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        assigned_to_user = None
        assigned_to = request.data.get('assigned_to')
        if assigned_to:
            assigned_to_id = assigned_to.get('id')
            assigned_to_user = TeamMembership.objects.get(
                user__id=assigned_to_id, team=team).user

        content_object = None
        content = request.data.get('content')
        content_type = request.data.get('content_type')
        if content:
            content_serializer = serializers.get_content_serializer(content_type, data=content)
            if not content_serializer:
                return Response(
                    {"error": "Bad data in content_type"}, 
                    status=status.HTTP_400_BAD_REQUEST)
            if content_serializer.is_valid():
                content_object = content_serializer.save()
            else:
                return Response(content_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = serializers.TaskSerializer(data=request.data)

        if serializer.is_valid():
            task = serializer.save(team=team, 
                created_by=request.user, 
                content_object=content_object,
                assigned_to=assigned_to_user)
            history = models.TaskHistory.objects.create(
                actor=request.user,
                task=task,
                action="Created task",
                action_type=models.TaskHistory.ACTION_CREATED
            )
            send_task_gcm_async.delay(history.id)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, task_permissions.IsTaskTeamMember)

    def assert_single_key(self, data):
        try:
            return len(data.keys()) == 1
        except:
            return False

    def edit_content(self, request_data, task, actor):
        content = request_data.get('content')
        content_type = request_data.get('content_type')

        if not self.assert_single_key(content):
            raise ValidationError({"errors": "One key can be edited at a time"})
            
        content_serializer = serializers.get_content_serializer(content_type)
        if not content_serializer:
            raise ValidationError({"error": "Bad data in content_type"})

        for key, value in content.items():
            pass

        ser_field = content_serializer.fields.get(key)
        if not ser_field:
            raise ValidationError({"error": "Could not find field {}".format(key)})

        validated_value = ser_field.run_validation(value)
        task.content_object.update_value(key, validated_value)
        history = models.TaskHistory.objects.create(
            actor=actor,
            task=task,
            action="Changed {0} to {1}".format(key, value),
            action_type=models.TaskHistory.ACTION_CONTENT
        )
        send_task_gcm_async.delay(history.id)

    def get(self, request, task_id, format=None):
        task = get_object_or_404(models.Task, id=task_id)
        self.check_object_permissions(request, task)
        serializer = serializers.TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, task_id, format=None):
        task = get_object_or_404(models.Task, id=task_id)
        self.check_object_permissions(request, task)

        request_data = request.data
        if 'content' in request_data:
            self.edit_content(request_data, task, request.user)
            return Response()

        if not self.assert_single_key(request_data):
            return Response(
                {"errors": "One key can be edited at a time"}, status=status.HTTP_400_BAD_REQUEST)

        for key, value in request_data.items():
            pass

        if key == 'assigned_to':
            assigned_to_id = value.get("id", '')
            if not assigned_to_id:
                return Response({"error": "Missing field id"}, status=400)

            user = None
            if not assigned_to_id == "0":
                user = get_object_or_404(User, id=assigned_to_id)

            task.update_assigned_to(user)
            history = models.TaskHistory.objects.create(
                actor=request.user,
                task=task,
                action="Assigned to {}".format(user.name.title() if user else "Unassigned"),
                action_type=models.TaskHistory.ACTION_ASSIGNED
            )
            send_task_gcm_async.delay(history.id)
            return Response()

        task_serializer = serializers.TaskSerializer()
        ser_field = task_serializer.fields.get(key)
        if not ser_field:
            return Response({"error": "Could not find field {}".format(key)}, status=400)

        validated_value = ser_field.run_validation(value)
        task.update_value(key, validated_value)
        history = models.TaskHistory.objects.create(
            actor=request.user,
            task=task,
            action="Changed {0} to {1}".format(key, value.title()),
            action_type=models.TaskHistory.ACTION_STATUS
        )
        send_task_gcm_async.delay(history.id)
        return Response()

    def delete(self, request, task_id, format=None):
        task = get_object_or_404(models.Task, id=task_id)
        self.check_object_permissions(request, task)
        task.status = models.Task.STATUS_DELETED
        task.save()
        return Response(status=204)

@api_view(['POST'])
@permission_classes((permissions.IsAuthenticated, ))
@parser_classes((MultiPartParser,))
def task_media_upload(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    if not team.is_member(request.user):
        return Response(status=403)

    serializer = serializers.TaskMediaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user, team=team)
        return Response(serializer.data)
    else:
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskHistoryList(APIView):
    permission_classes = (permissions.IsAuthenticated, task_permissions.IsTaskTeamMember)

    def get(self, request, task_id, format=None):
        start, limit = utils.get_query_start_limit(request)
        task = get_object_or_404(models.Task, id=task_id)
        self.check_object_permissions(self.request, task)
        history = task.history.all()
        history = history.order_by('-created')[start:start+limit]
        data = serializers.TaskHistorySerializer(history, many=True).data
        return Response(data)