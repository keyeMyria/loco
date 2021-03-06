import json, requests, polyline, pytz
from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.utils.cache import patch_response_headers
from django.shortcuts import get_object_or_404
from django.shortcuts import render_to_response

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.views import APIView

from loco import utils as loco_utils
from loco.services import cache

from . import utils, analyzer
from .filters import is_noise, is_stop_point, get_speed
from .models import UserLocation, UserAnalyzedLocation
from .serializers import UserLocationSerializer

from accounts.models import User
from teams.models import Team, TeamMembership
from teams.permissions import IsTeamMember, IsAdminOrReadOnly, IsAdminOrMe, IsAdminManagerOrReadOnly
from teams import constants as team_constants
from morty.services import subscribe_location, unsubscribe_location

def get_snapped_mp(locations, loc_type):
    if loc_type == 'mp':
        url = 'https://api.mapbox.com/matching/v5/mapbox/driving/{0}?access_token=pk.eyJ1Ijoicm9oaXQ3NzciLCJhIjoiY2o4cXA2bG1zMHM0ajJ3bjNydG9nOHpwMiJ9.WhA9bgtcw570J68P_5YIoQ'
    else:
        url = 'http://localhost:5000/match/v1/driving/{0}'

    results = {
        'original': [(l.latitude, l.longitude) for l in locations]
    }

    locations = [str(l.longitude)+','+str(l.latitude) for l in locations]
    path = ";".join(locations)
    query = url.format(path)
    response = requests.get(query)
    response = response.json()

    response = response.get('matchings', [])
    if response:
        matching = response[0]
        matching = polyline.decode(matching['geometry'])
        results['matching'] = [{"lat": r[0], "lng": r[1]} for r in matching]

    # response = response.get('matchings', [])
    # for matching in response:
    #     results += polyline.decode(matching['geometry'])

    # results = [{"lat": r[0], "lng": r[1]} for r in results]

    return results

def snap_mp(locations, loc_type='mp'):
    results = []
    for i in range(0, len(locations), 50):
        sample = locations[i:(i+50)-2]
        results.append(get_snapped_mp(sample, loc_type))
    return results

def new_user_maps(request):
    uid = request.GET.get('uid')
    start = request.GET.get('start')
    end = request.GET.get('end')
    locations = list(UserLocation.objects.filter(user_id=uid, timestamp__gte=start, timestamp__lte=end))
    filtered_locations = []

    for i in range(1, len(locations)):
        filtered_locations.append(locations[i])
        if not is_noise(locations[i], locations[i-1]):
            filtered_locations.append(locations[i])


    # snapped_locations_mp = snap_mp(filtered_locations)
    snapped_locations_os = snap_mp(filtered_locations)
    snapped_locations_os_or = snapped_locations_os
    snapped_locations_os = json.dumps(snapped_locations_os)


    len_locations = len(filtered_locations)
    filtered_locations = json.dumps([(l.latitude, l.longitude) for l in filtered_locations])

    context = {
        'locations': filtered_locations, 
        # 'snapped_locations_mp': snapped_locations_mp,
        'snapped_locations_os': snapped_locations_os,
        'snapped_locations_os_or': snapped_locations_os_or,
        'len_locations': len_locations, 
    }
    return render_to_response('maps.html', context)

def raw_user_maps(request):
    uid = request.GET.get('uid')
    start = request.GET.get('start')
    end = request.GET.get('end')
    filter_noise = request.GET.get('filter_noise', False)
    show_stops = request.GET.get('show_stops', False)
    reduce_density = request.GET.get('reduce_density', False)
    filter_dis = float(request.GET.get('filter_dis', 0.1))
    locations = list(
        UserLocation.objects.filter(
            user_id=uid, timestamp__gte=start,
            timestamp__lte=end).exclude(
            latitude__isnull=True).exclude(
            latitude=0).order_by('timestamp'
        )
    )
    # locations = locations[1:]
    last_valid_location = locations[0]
    # filtered_locations = [(last_valid_location.latitude, last_valid_location.longitude, False, last_valid_location.accuracy, str(last_valid_location.timestamp))]
    filtered_locations = []
    print (last_valid_location.latitude, last_valid_location.longitude, last_valid_location.timestamp, last_valid_location.accuracy)


    for i in range(1, len(locations)):
        l = locations[i]
        if filter_noise and not is_noise(l, last_valid_location):
            # print (len(filtered_locations), False)
            # print (l.id, l.latitude, l.longitude, l.timestamp, l.created, l.accuracy)
            # print (get_speed(l, last_valid_location))
            # print (is_history_noise(l, last_valid_location, locations[i-1]))
            last_valid_location = l
            filtered_locations.append(l)
        elif not filter_noise:
            filtered_locations.append(l)


    if show_stops:
        filtered_locations = analyzer.aggregate_pitstops(filtered_locations)
        # filtered_locations = analyzer.re_aggregate_pitstops(filtered_locations)

    if reduce_density:
        filtered_locations = analyzer.reduce_density(filtered_locations)

    results = []
    for l in filtered_locations:
        if l.get_type() == 1:
            results.append((l.latitude, l.longitude, True, l.accuracy, str(l.timestamp), str(l.get_end_time())))
        else:
            results.append((l.latitude, l.longitude, False, l.accuracy, str(l.timestamp)))

    final_locations = [(l[:3]) for l in results]

    context = {
        'draw_locations': json.dumps(final_locations),
        'data_locations': results, 
    }
    return render_to_response('maps_raw.html', context)

def app_user_maps(request):
    uid = request.GET.get('uid')
    start = request.GET.get('start')
    end = request.GET.get('end')
    filter_noise = request.GET.get('filter_noise', False)
    show_stops = request.GET.get('show_stops', False)
    reduce_density = request.GET.get('reduce_density', False)
    filter_dis = float(request.GET.get('filter_dis', 0.1))
    

    user = User.objects.get(id=uid)
    filtered_locations = analyzer.get_user_locations(user, start, end)
    if filter_noise:
        filtered_locations = analyzer.filter_noise(filtered_locations)

    if show_stops and show_stops != '1':
        filtered_locations = analyzer.aggregate_pitstops(filtered_locations)
        filtered_locations = analyzer.re_aggregate_pitstops(filtered_locations)

    if show_stops and show_stops== '1':
        filtered_locations = analyzer.aggregate_pitstops_old(filtered_locations)
        # filtered_locations = analyzer.re_aggregate_pitstops(filtered_locations)

    if reduce_density:
        filtered_locations = analyzer.reduce_density(filtered_locations)

    results = []
    for l in filtered_locations:
        if l.get_type() == 1:
            results.append((l.latitude, l.longitude, 1, l.accuracy, str(l.timestamp), str(l.get_end_time())))
        else:
            results.append((l.latitude, l.longitude, l.get_type(), l.accuracy, str(l.timestamp)))

    final_locations = [(l[:3]) for l in results]

    context = {
        'draw_locations': json.dumps(final_locations),
        'data_locations': results, 
    }
    return render_to_response('maps_raw.html', context)

class LocationSubscriptionList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember, IsAdminManagerOrReadOnly)

    def put(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        user_ids = request.data.get('user_ids', [])
        memberships = TeamMembership.objects.filter(
            team=team,
            user__id__in=user_ids)
        if request.user.teammembership_set.get(team=team).role==TeamMembership.ROLE_MANAGER:
            memberships = [m for m in memberships 
            if m.role==TeamMembership.ROLE_MEMBER or m.user.id==request.user.id]

        users = [m.user for m in memberships]
        subscribe_location(request.user, users)
        locations = cache.get_users_last_location([u.id for u in users])
        if locations:
            locations = [l for l in locations if l]
            
        return Response(locations)

    def delete(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        user_ids = request.data.get('user_ids', [])
        users = team.members.filter(id__in=user_ids)
        unsubscribe_location(request.user, users)
        return Response()

class UserLocationList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminOrMe)

    def get(self, request, team_id, user_id, format=None):
        membership = get_object_or_404(TeamMembership, team=team_id, user=user_id)
        self.check_object_permissions(self.request, membership)

        date = loco_utils.get_query_date(request, datetime.now().date())
        user = membership.user
        locations = user.userlocation_set.filter(
            timestamp__date=date).exclude(
            latitude__isnull=True).exclude(
            latitude=0).order_by('timestamp')
        if not locations:
            return Response({'polyline': ''})

        first_location = utils.flatten_location(locations[0])
        filtered_locations = []
        last_valid_location = locations[0]
        pitstops = []
        for i in range(1, len(locations)):
            test_location = locations[i]
            last_location = locations[i-1]

            if is_noise(test_location, last_valid_location):
                continue

            if is_stop_point(test_location, last_valid_location):
                if not pitstops and filtered_locations:
                    pitstops.append(filtered_locations.pop())

                pitstops.append(utils.flatten_location(test_location))
            else:
                if pitstops:
                    midpoint = utils.aggregate_stop_points(pitstops)
                    filtered_locations.append(midpoint)
                    pitstops = []
                filtered_locations.append(utils.flatten_location(test_location))
            
            last_valid_location = test_location

        if pitstops:
            midpoint = utils.aggregate_stop_points(pitstops)
            filtered_locations.append(midpoint)
            pitstops = []

        polyline = utils.to_polyline(filtered_locations)
        rich_polyline = utils.to_rich_polyline(filtered_locations)
        return Response({'polyline': polyline, 'rich_polyline': rich_polyline})

class UserLocationList1(APIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminOrMe)

    def get(self, request, team_id, user_id, format=None):
        membership = get_object_or_404(TeamMembership, team=team_id, user=user_id)
        self.check_object_permissions(self.request, membership)

        PARAM_DATE = 'date'
        date = request.query_params.get(PARAM_DATE, str(datetime.now().date()))
        rich_polyline, is_cached = analyzer.get_analyzed_user_location(membership.user, date)
        response = Response({'rich_polyline': rich_polyline})
        if is_cached:
            patch_response_headers(response, 2592000)

        return response

class UserAttendanceList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminOrMe)

    def get(self, request, team_id, user_id, format=None):
        membership = get_object_or_404(TeamMembership, team=team_id, user=user_id)
        self.check_object_permissions(self.request, membership)

        PARAM_POLYLINE = 'polyline'
        include_polyline = request.query_params.get(PARAM_POLYLINE, 0)

        start, limit = loco_utils.get_query_start_limit(request)
        start = int(start)
        limit = int(limit)

        timezone = pytz.timezone('Asia/Kolkata')
        end_date = datetime.now(timezone) 
        if start:
            end_date -= relativedelta(months=start - 1)
            end_date = end_date.replace(day=1)
            end_date -= relativedelta(days=1)

        start_date = end_date - relativedelta(months=limit-1)
        start_date = start_date.replace(day=1, hour=0, minute=0, second=0)

        locations = analyzer.get_analyzed_user_locations(membership.user, start_date, end_date)
        dates = {l[0]:analyzer.remove_location_events(l[1]) for l in locations if l[1]}
        if include_polyline:
            response = Response(dates)
        else:
            response = Response(dates.keys())
            
        patch_response_headers(response, 3600*10)
        return response
