from datetime import datetime
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from loco import utils
from loco.services import cache, solr

from . import constants, tasks
from .models import Team, TeamMembership, Checkin, CheckinMedia, Message, UserLog, TourPlan
from .serializers import TeamSerializer, TeamMembershipSerializer, CheckinSerializer,\
    UserMediaSerializer, CheckinMediaSerializer, serialize_events, UserLogSerializer, \
    MessageSerializer, ConversationMessageSerializer, TYPE_LAST_LOCATION, TourPlanSerializer
from .permissions import IsTeamMember, IsAdminOrReadOnly, IsAdmin, IsMe, IsTeamAdmin

from accounts.models import User
from accounts.serializers import UserSerializer
from notifications.tasks import send_checkin_gcm_async

class TeamList(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request, format=None):
        memberships = TeamMembership.objects.filter(user=request.user).exclude(status=constants.STATUS_REJECTED)
        serializer = TeamMembershipSerializer(memberships, many=True)
        return Response(data=serializer.data)

    def post(self, request, format=None):
        PARAM_MEMBERSHIP = 'membership'
        result_membership = request.query_params.get(PARAM_MEMBERSHIP, False)
        serializer = TeamSerializer(data=request.data)
        if serializer.is_valid():
            team = serializer.save(created_by=request.user)
            if result_membership:
                membership = TeamMembership.objects.get(team=team, user=request.user)
                serializer = TeamMembershipSerializer(membership)

            return Response(serializer.data)

        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TeamDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember, IsAdminOrReadOnly)

    def get(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        data = TeamSerializer(team).data
        if team.is_admin(request.user):
            data['code'] = team.code
            
        return Response(data=data)

    def put(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        serializer = TeamSerializer(team, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        team.delete()
        return Response(status=204)

class TeamMembershipList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember, IsAdminOrReadOnly)

    def get(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        memberships = TeamMembership.objects.filter(team=team, user__is_active=True).exclude(status=constants.STATUS_REJECTED)
        serializer = TeamMembershipSerializer(memberships, many=True, context={'team': team})
        return Response(serializer.data)

    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        phone = request.data.get('phone')

        if not utils.validate_phone(phone):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.get_or_create_dummy(phone)
        membership = team.add_member(user, request.user)
        if membership:
            serializer = TeamMembershipSerializer(membership)
            return Response(serializer.data)

        return Response({})


@api_view(['PUT'])
@permission_classes((permissions.IsAuthenticated,))
def join_team(request, format=None):
    team = get_object_or_404(Team, code=request.data.get('code'))
    membership = team.add_member(request.user, request.user)
    tasks.update_user_index_async.delay()
    if membership:
        serializer = TeamMembershipSerializer(membership)
        return Response(serializer.data)

    return Response(status=status.HTTP_400_BAD_REQUEST)

class TeamMembershipDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember, IsAdminOrReadOnly)

    def get(self, request, team_id, user_id, format=None):
        membership = get_object_or_404(TeamMembership, user_id=user_id, team_id=team_id)
        team = membership.team
        self.check_object_permissions(self.request, team)
        serializer = TeamMembershipSerializer(membership)
        return Response(data=serializer.data)

class TeamMemberDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminOrReadOnly)

    def get(self, request, team_id, user_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        user = get_object_or_404(User, id=user_id)
        serializer = UserSerializer(user)
        return Response(data=serializer.data)

    def put(self, request, team_id, user_id, format=None):
        membership = get_object_or_404(TeamMembership, user_id=user_id, team_id=team_id)
        team = membership.team
        self.check_object_permissions(self.request, team)
        serializer = TeamMembershipSerializer(membership, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, team_id, user_id, format=None):
        membership = get_object_or_404(TeamMembership, user_id=user_id, team_id=team_id)
        team = membership.team
        self.check_object_permissions(self.request, team)
        membership.delete()
        return Response(status=204)

class TeamMembershipSearch(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        PARAM_QUERY = 'query'
        PARAM_FILTERS = 'filters'
        search_options = {}
        query = request.query_params.get(PARAM_QUERY)
        if query:
            search_options['query'] = query

        filters = request.query_params.get(PARAM_FILTERS, '')
        if filters:
            search_options['filters'] = filters

        start, limit = utils.get_query_start_limit(request)
        merchants = solr.search_members(team.id, search_options, start, limit)
        if merchants.get('data'):
            merchants['csv'] = utils.get_csv_url('members', team.id, 0,
                merchants.get('count'), query, filters)
        else:
            merchants['csv'] = ''
            
        return Response(merchants)

class TeamMembershipStatus(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def put(self, request, team_id, format=None):
        membership = get_object_or_404(TeamMembership, user=request.user, team=team_id)
        self.check_object_permissions(self.request, membership)
        membership.accept()
        serializer = TeamMembershipSerializer(membership)
        return Response(data=serializer.data)

    def delete(self, request, team_id, format=None):
        membership = get_object_or_404(TeamMembership, user=request.user, team=team_id)
        self.check_object_permissions(self.request, membership)
        membership.reject()
        serializer = TeamMembershipSerializer(membership)
        return Response(status=204)

@api_view(['GET'])
@permission_classes((permissions.IsAuthenticated,))
def get_chats(request, team_id, format=None):
    team = get_object_or_404(Team, id=team_id)
    # permissions
    if not team.is_member(request.user):
        return Response(status=403)

    chat_members = team.get_chat_members(request.user)
    serializer = TeamMembershipSerializer(chat_members, many=True)
    return Response(serializer.data)

class CheckinList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)
    #TODO permissions not complete

    def add_media(self, checkin, media):
        if media and isinstance(media, list):
            uuids = [m.get('unique_id') for m in media if m.get('unique_id')]
            media = CheckinMedia.objects.filter(unique_id__in=uuids)
            checkin.media.add(*media)

    def get(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        checkins = team.checkin_set.all()
        serializer = CheckinSerializer(checkins, many=True)
        return Response(serializer.data)

    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        serializer = CheckinSerializer(data=request.data)

        if serializer.is_valid():
            checkin = serializer.save(team=team, user=request.user)
            media = request.data.get('media')
            self.add_media(checkin, media)
            send_checkin_gcm_async.delay(checkin.id)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckinDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, IsAdmin, IsMe)

    def get(self, request, team_id, checkin_id, format=None):
        checkin = get_object_or_404(Checkin, id=checkin_id, team=team_id)
        self.check_object_permissions(request, checkin)
        serializer = CheckinSerializer(checkin)
        return Response(serializer.data)

    def put(self, request, team_id, checkin_id, format=None):
        checkin = get_object_or_404(Checkin, id=checkin_id, team=team_id)
        self.check_object_permissions(request, checkin)
        serializer = CheckinSerializer(checkin, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, team_id, checkin_id, format=None):
        checkin = get_object_or_404(Checkin, id=checkin_id, team=team_id)
        self.check_object_permissions(request, checkin)
        checkin.delete()
        return Response(status=204)

@api_view(['POST'])
@permission_classes((permissions.IsAuthenticated, ))
@parser_classes((MultiPartParser,))
def media_upload(request):
    serializer = UserMediaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data)
    else:
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes((permissions.IsAuthenticated, ))
@parser_classes((MultiPartParser,))
def checkin_media_upload(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    if not team.is_member(request.user):
        return Response(status=403)

    serializer = CheckinMediaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, team=team)
        return Response(serializer.data)
    else:
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EventList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        timestamp = utils.get_query_datetime(request)
        if timestamp:
            events = team.get_visible_events_by_date(request.user, timestamp)
        else:
            start, limit = utils.get_query_start_limit(request)
            events = team.get_visible_events_by_page(request.user, start, limit)

        data = serialize_events(events)
        return Response(data)

@api_view(['GET'])
@permission_classes((permissions.IsAuthenticated,))
def get_user_events(request, team_id, user_id, format=None):
    team = get_object_or_404(Team, id=team_id)
    if not team.is_admin(request.user):
        return Response(status=403)

    add_last_location = False
    user = team.members.get(id=user_id)
    timestamp = utils.get_query_datetime(request)

    if timestamp:
        events = team.get_visible_events_by_date(user, timestamp)
        if timestamp.date() == datetime.now().date():
            add_last_location = True
    else:
        start, limit = utils.get_query_start_limit(request)
        events = team.get_visible_events_by_page(user, start, limit)
        if start in [0, '0']:
            add_last_location = True

    data = serialize_events(events)
    if add_last_location:
        last_location = cache.get_user_last_location(user.id)
        if last_location:
            last_location['type'] = TYPE_LAST_LOCATION
            data.insert(0, last_location)

    return Response(data)

@api_view(['POST'])
@permission_classes((permissions.IsAuthenticated, ))
@parser_classes((MultiPartParser,))
def user_media_upload(request, team_id):
    team = get_object_or_404(Team, id=team_id)
    if not team.is_member(request.user):
        return Response(status=403)

    serializer = UserMediaSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, team=team)
        return Response(serializer.data)
    else:
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessagesList(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        messages = Message.objects.get_conversations(
            user_id=request.user.id, team_id=team.id)
        serializer = ConversationMessageSerializer(messages, many=True)
        return Response(data=serializer.data)

class MessagesDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, thread_id, format=None):
        PARAM_START = 'start'
        PARAM_LIMIT = 'limit'
        start = request.query_params.get(PARAM_START)
        start = start or datetime.now()
        limit = request.query_params.get(PARAM_LIMIT, 10)

        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        messages = Message.objects.filter(
            thread=thread_id, created__lt=start).order_by('-created')[:10]
        serializer = MessageSerializer(messages, many=True)
        return Response(data=serializer.data)

class UserLogList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, format=None):
        PARAM_USER_ID = "user"
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        start, limit = utils.get_query_start_limit(request)
        start = int(start)
        limit = int(limit)
        user_id = request.query_params.get(PARAM_USER_ID)
        logs = UserLog.objects.filter(user__id=user_id, team=team).order_by("-created")
        data = UserLogSerializer(logs[start:start+limit], many=True).data
        count = logs.count()
        csv_url = ''
        if count > 0:
            csv_url = "/web/teams/{0}/logs/download/?user={1}&start={2}&limit={3}&format=csv".format(
        team_id, user_id, 0, count)

        response = {
            'data':data,
            'count':count,
            'csv': csv_url
        }
        
        return Response(data=response)


    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        serializer = UserLogSerializer(data=request.data)

        if serializer.is_valid():
            last_log = UserLog.objects.filter(user=request.user, team=team).last()
            if not last_log or (last_log and not serializer.validated_data['action_type'] == last_log.action_type):
                log = serializer.save(team=team, user=request.user)
                cache.set_user_log_status(request.user.id,
                    team.id, log.action_type, log.created)
            return Response()

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TourPlanList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, format=None):
        PARAM_USER_ID = "user"
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        start, limit = utils.get_query_start_limit(request)
        start = int(start)
        limit = int(limit)
        user_id = request.query_params.get(PARAM_USER_ID)
        plans = TourPlan.objects.filter(user__id=user_id, team=team).order_by("-dated")
        data = TourPlanSerializer(plans[start:start+limit], many=True).data
        count = plans.count()
        csv_url = ''
        if count > 0:
            csv_url = "/web/teams/{0}/plans/download/?user={1}&start={2}&limit={3}&format=csv".format(
        team_id, user_id, 0, count)

        response = {
            'data':data,
            'count':count,
            'csv': csv_url
        }

        return Response(data=response)


    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        serializer = TourPlanSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(team=team, user=request.user)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TourPlanDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, plan_id, format=None):
        plan = get_object_or_404(TourPlan, id=plan_id, team=team_id)
        self.check_object_permissions(request, plan.team)
        serializer = TourPlanSerializer(plan)
        return Response(serializer.data)

    def put(self, request, team_id, plan_id, format=None):
        plan = get_object_or_404(TourPlan, id=plan_id, team=team_id)
        self.check_object_permissions(request, plan.team)
        serializer = TourPlanSerializer(plan, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, team_id, plan_id, format=None):
        plan = get_object_or_404(TourPlan, id=plan_id, team=team_id)
        self.check_object_permissions(request, plan.team)
        plan.delete()
        return Response(status=204)

class TeamSync(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        log_status = cache.get_user_log_status(request.user.id, team.id)
        data = {
            'log_status': log_status == 'signin',
            'min_app_version': 28
        }
        
        return Response(data=data)
