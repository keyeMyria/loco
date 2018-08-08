from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from loco import utils
from loco.services import solr

from . import serializers, models, tasks
from . import permissions as crm_permissions

from accounts.models import User
from teams.models import Team, TeamMembership
from teams.permissions import IsTeamMember, IsAdminOrReadOnly, IsAdmin, IsMe

class MerchantList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, format=None):
        PARAM_QUERY = 'query'
        filter_query = request.query_params.get(PARAM_QUERY)

        start, limit = utils.get_query_start_limit(request)
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        merchants = team.merchant_set.filter(is_deleted=False)
        if filter_query:
            merchants = merchants.filter(name__icontains=filter_query)

        merchants = merchants.order_by('-created')[start:start+limit]
        serialized_merchants = serializers.MerchantSerializer(merchants, many=True).data
        return Response(serialized_merchants)

    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        serializer = serializers.MerchantSerializer(data=request.data)
        if serializer.is_valid():
            merchant = serializer.save(team=team, 
                created_by=request.user)
            tasks.update_merchant_index_async.delay()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MerchantDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, crm_permissions.IsMerchantTeamMember)

    def get(self, request, merchant_id, format=None):
        merchant = get_object_or_404(models.Merchant, id=merchant_id, is_deleted=False)
        self.check_object_permissions(request, merchant)
        serializer = serializers.DeepMerchantSerializer(merchant)
        return Response(serializer.data)

    def put(self, request, merchant_id, format=None):
        merchant = get_object_or_404(models.Merchant, id=merchant_id, is_deleted=False)
        self.check_object_permissions(request, merchant)
        serializer = serializers.MerchantSerializer(merchant, data=request.data)
        if serializer.is_valid():
            merchant = serializer.save()
            tasks.update_merchant_index_async.delay()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, merchant_id, format=None):
        merchant = get_object_or_404(models.Merchant, id=merchant_id, is_deleted=False)
        self.check_object_permissions(request, merchant)
        merchant.is_deleted = True
        merchant.save()
        tasks.update_merchant_index_async.delay()
        return Response()

class MerchantUpload(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)
    parser_classes = (MultiPartParser, )

    def get(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        jobs = models.MerchantUpload.objects.filter(team=team).order_by('-created')
        serializer = serializers.MerchantUploadSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        serializer = serializers.MerchantUploadSerializer(data=request.data)
        if serializer.is_valid():
            upload = serializer.save(created_by=request.user, team=team)
            tasks.upload_merchants_async.delay(upload.id)
            return Response(serializer.data)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MerchantSearch(APIView):
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
        merchants = solr.search_merchants(team.id, search_options, start, limit)
        if merchants.get('data'):
            merchants['csv'] = utils.get_csv_url('merchants', team.id, 0,
                merchants.get('count'), query, filters)
        else:
            merchants['csv'] = ''
            
        return Response(merchants)
        
class ItemList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, format=None):
        PARAM_QUERY = 'query'
        filter_query = request.query_params.get(PARAM_QUERY)

        start, limit = utils.get_query_start_limit(request)
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        items = team.item_set.filter(is_deleted=False)
        if filter_query:
            items = items.filter(name__icontains=filter_query)

        items = items.order_by('-created')[start:start+limit]
        serialized_items = serializers.ItemSerializer(items, many=True).data
        return Response(serialized_items)

    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        serializer = serializers.ItemSerializer(data=request.data)
        if serializer.is_valid():
            item = serializer.save(team=team, 
                created_by=request.user)
            tasks.update_item_index_async.delay()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ItemDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, crm_permissions.IsItemTeamMember)

    def get(self, request, item_id, format=None):
        item = get_object_or_404(models.Item, id=item_id, is_deleted=False)
        self.check_object_permissions(request, item)
        serializer = serializers.ItemSerializer(item)
        return Response(serializer.data)

    def put(self, request, item_id, format=None):
        item = get_object_or_404(models.Item, id=item_id, is_deleted=False)
        self.check_object_permissions(request, item)
        serializer = serializers.ItemSerializer(item, data=request.data)
        if serializer.is_valid():
            item = serializer.save()
            tasks.update_item_index_async.delay()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, item_id, format=None):
        item = get_object_or_404(models.Item, id=item_id)
        self.check_object_permissions(request, item)
        item.is_deleted = True
        item.save()
        tasks.update_item_index_async.delay()
        return Response()

class ItemUpload(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)
    parser_classes = (MultiPartParser, )

    def get(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        jobs = models.ItemUpload.objects.filter(team=team).order_by('-created')
        serializer = serializers.ItemUploadSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        serializer = serializers.ItemUploadSerializer(data=request.data)
        if serializer.is_valid():
            upload = serializer.save(created_by=request.user, team=team)
            tasks.upload_items_async.delay(upload.id)
            return Response(serializer.data)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ItemSearch(APIView):
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
        items = solr.search_items(team.id, search_options, start, limit)
        if items.get('data'):
            items['csv'] = utils.get_csv_url('items', team.id, 0,
                items.get('count'), query, filters)
        else:
            items['csv'] = ''

        return Response(items)

class StateList(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None):
        states = models.State.objects.all().order_by('name')
        data = serializers.StateSerializer(states, many=True).data
        return Response(data)

class CityList(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None):
        PARAM_STATE = 'state'
        filter_state = request.query_params.get(PARAM_STATE)
        PARAM_QUERY = 'query'
        query = request.query_params.get(PARAM_QUERY)

        start, limit = utils.get_query_start_limit(request)
        cities = models.City.objects.all()
        if filter_state:
            cities = cities.filter(state__name__icontains=filter_state)

        if query:
            cities = cities.filter(name__icontains=query)

        cities = cities.order_by('-created')[start:start+limit]
        data = serializers.CitySerializer(cities, many=True).data
        return Response(data)