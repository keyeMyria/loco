from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from loco import utils

from .models import Task, TaskMedia
from .serializers import TaskSerializer, TaskMediaSerializer, get_content_serializer
from .permissions import IsTaskOwnerOrTeamAdmin

from accounts.models import User
from teams.models import Team
from teams.permissions import IsTeamMember, IsAdminOrReadOnly, IsAdmin, IsMe
# from notifications.tasks import send_task_gcm_async

def get_status_rank(status):
    if status == Task.STATUS_CREATED:
        return 1
    elif status == Task.STATUS_ACCEPTED:
        return 2
    elif status == Task.STATUS_PROGRESS:
        return 3
    elif status == Task.STATUS_DELIVERED:
        return 4
    elif status == Task.STATUS_CANCELED:
        return 5
    elif status == Task.STATUS_DELETED:
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
        tasks = team.task_set.exclude(status=Task.STATUS_DELETED)
        if filter_assigned_to:
            tasks = tasks.filter(assigned_to=filter_assigned_to)
        if filter_status:
            tasks = tasks.filter(status=filter_status)

        tasks = tasks.order_by('-created')[start:start+limit]
        serialized_tasks = TaskSerializer(tasks, many=True).data
        serialized_tasks.sort(key=lambda x: get_status_rank(x['status']))
        return Response(serialized_tasks)

    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        content_object = None
        content = request.data.get('content')
        content_type = request.data.get('content_type')
        if content:
            content_serializer = get_content_serializer(content_type, content)
            if not content_serializer:
                return Response({"error": "Bad data in content_type"}, status=status.HTTP_400_BAD_REQUEST)
            if content_serializer.is_valid():
                content_object = content_serializer.save()
            else:
                return Response(content_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            task = serializer.save(team=team, created_by=request.user, content_object=content_object)
            # send_task_gcm_async.delay(task.id)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTaskOwnerOrTeamAdmin)

    def get(self, request, task_id, format=None):
        task = get_object_or_404(Task, id=task_id)
        self.check_object_permissions(request, task)
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    def put(self, request, task_id, format=None):
        task = get_object_or_404(Task, id=task_id)
        self.check_object_permissions(request, task)
        serializer = TaskSerializer(task, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, task_id, format=None):
        task = get_object_or_404(Task, id=task_id)
        self.check_object_permissions(request, task)
        task.status = Task.STATUS_DELETED
        task.save()
        return Response(status=204)

@api_view(['POST'])
@permission_classes((permissions.IsAuthenticated, ))
@parser_classes((MultiPartParser,))
def task_media_upload(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    if not team.is_member(request.user):
        return Response(status=403)

    serializer = TaskMediaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user, team=team)
        return Response(serializer.data)
    else:
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
