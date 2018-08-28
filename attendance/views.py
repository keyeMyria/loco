from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.views import APIView

from loco import utils
from loco.services import cache

from . import models, serializers

from teams import permissions as team_permissions
from teams.models import Team

class PunchList(APIView):
    permission_classes = (permissions.IsAuthenticated, team_permissions.IsTeamMember)

    def get(self, request, team_id, format=None):
        PARAM_USER_ID = "user"
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        start, limit = utils.get_query_start_limit(request)
        start = int(start)
        limit = int(limit)
        user_id = request.query_params.get(PARAM_USER_ID)
        punches = models.Punch.objects.filter(user__id=user_id, team=team).order_by("-created")
        data = serializers.PunchSerializer(punches[start:start+limit], many=True).data
        count = punches.count()
        csv_url = ''
        if count > 0:
            csv_url = "/web/teams/{0}/attendance/download/?user={1}&start={2}&limit={3}&format=csv".format(
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
        serializer = serializers.PunchSerializer(data=request.data)

        if serializer.is_valid():
            last_punch = models.Punch.objects.filter(user=request.user, team=team).last()
            if not last_punch or (last_punch and not serializer.validated_data['action_type'] == last_punch.action_type):
                punch = serializer.save(team=team, user=request.user)
                cache.set_user_log_status(request.user.id,
                    team.id, punch.action_type, punch.created)
            return Response()

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
