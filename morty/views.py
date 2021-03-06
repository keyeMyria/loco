# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser

from loco.services import cache, kafka

from .parsers import XmlParser
from .permissions import IsSuperUser
from .serializers import AttendanceSerializer, UserLocationSerializer, parse_message, MessageUpdateSerializer

from accounts.models import User
from accounts.serializers import UserSerializer
from attendance.serializers import PunchSerializer
from teams.models import Team, Message
from teams.serializers import TeamMembershipSerializer, MessageSerializer
from notifications.tasks import send_chat_gcm_async

def _clean_ping_data(ping_data):
    result = {}
    for key in ping_data:
        if key == 'id':
            continue
        elif key=='user':
            result[key] = ping_data['user'].id
        elif key=='team':
            result[key] = ping_data['team'].id
        else:
            result[key] = str(ping_data[key])
    return result

@api_view(['GET'])
@permission_classes((permissions.IsAuthenticated, IsSuperUser))
def get_chats(request, team_id, user_id, format=None):
    team = get_object_or_404(Team, id=team_id)
    user = get_object_or_404(User, id=user_id)
    chat_members = team.get_chat_targets(user)
    serializer = TeamMembershipSerializer(chat_members, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes((permissions.IsAuthenticated, IsSuperUser))
def set_user_location(request, format=None):
    serializer = UserLocationSerializer(data=request.data)
    if serializer.is_valid():
        ping_data = serializer.validated_data
        ping_data = _clean_ping_data(ping_data)
        cache.set_user_ping(ping_data['user'], ping_data)
        latitude = serializer.validated_data.get('latitude')
        location = serializer.save()
        if latitude:
            data = serializer.data
            data['user'] = UserSerializer(location.user).data
            cache.set_last_known_location(location.user.id, data)
        
        return Response()

    return Response(data=serializer.errors, status=400)

@api_view(['POST'])
@permission_classes((permissions.IsAuthenticated, IsSuperUser))
def set_user_attendance(request, format=None):
    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        try:        
            attendance = serializer.save()
            if attendance.action_type==attendance.ACTION_SIGNIN:
                cache.set_user_signin_status(attendance.user.id, True, attendance.timestamp)
            else:
                cache.set_user_signin_status(attendance.user.id, False, attendance.timestamp)
        except IntegrityError:
            pass

        return Response()

    return Response(data=serializer.errors, status=400)

class MessageList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsSuperUser)
    parser_classes = (JSONParser, XmlParser)

    def get(self, request, format=None):
        PARAM_TARGET = 'target'
        PARAM_TEAM = 'team'
        PARAM_STATUS = 'status'

        target = request.query_params.get(PARAM_TARGET)
        team = request.query_params.get(PARAM_TEAM)
        status = request.query_params.get(PARAM_STATUS)

        messages = Message.objects.filter(
            target=target, team=team, status=status).order_by('created')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        message_data, error = parse_message(request.data)
        new_message = False
        if not message_data:
            return Response(data=error, status=400)

        kafka.send_message(message_data)

        message = Message.objects.filter(id=message_data.get('id'))
        if message:
            message = message[0]
            if not message.validate_next_status(message_data.get('status')):
                return Response()

            serializer = MessageUpdateSerializer(message, message_data)
        else:
            new_message = True
            serializer = MessageSerializer(data=message_data)

        if serializer.is_valid():
            message = serializer.save()
            if new_message:
                send_chat_gcm_async.delay(message.target.gcm_token)
            return Response(status=201)

        return Response(data=serializer.errors, status=400)  

class PunchList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsSuperUser)

    def post(self, request, team_id, format=None):
        PARAM_USER_ID = "user"
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        serializer = PunchSerializer(data=request.data)
        user_id = request.query_params.get(PARAM_USER_ID)
        user = User.objects.get(id=user_id)

        if serializer.is_valid():
            log = serializer.save(team=team, user=user)
            cache.set_user_log_status(user.id,
                    team.id, log.action_type, log.timestamp)
            return Response()

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 