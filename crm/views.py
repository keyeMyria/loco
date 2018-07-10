from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from loco import utils

from . import serializers, models
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
        merchants = team.merchant_set.all()
        if filter_query:
            merchants = merchants.filter(name__icontains=filter_query)

        merchants = merchants.order_by('-created')[start:start+limit]
        serialized_merchants = serializers.MerchantSerializer(merchants, many=True).data
        return Response(serialized_merchants)

    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        city = request.data.get('city', {})
        if city:
            city = get_object_or_404(models.City, id=city.get('id', 0))
        else:
            city = None

        state = request.data.get('state', {})
        if state:
            state = get_object_or_404(models.State, id=state.get('id', 0))
        else:
            state = None

        serializer = serializers.MerchantSerializer(data=request.data)
        if serializer.is_valid():
            merchant = serializer.save(team=team, 
                created_by=request.user,
                city=city,
                state=state)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MerchantDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, crm_permissions.IsMerchantTeamMember)

    def get(self, request, merchant_id, format=None):
        merchant = get_object_or_404(models.Merchant, id=merchant_id)
        self.check_object_permissions(request, merchant)
        serializer = serializers.MerchantSerializer(merchant)
        return Response(serializer.data)

    def put(self, request, merchant_id, format=None):
        merchant = get_object_or_404(models.Merchant, id=merchant_id)
        self.check_object_permissions(request, merchant)

        city = request.data.get('city', {})
        if city:
            city = get_object_or_404(models.City, id=city.get('id', 0))
        else:
            city = None

        state = request.data.get('state', {})
        if state:
            state = get_object_or_404(models.State, id=state.get('id', 0))
        else:
            state = None

        serializer = serializers.MerchantSerializer(merchant, data=request.data)
        if serializer.is_valid():
            merchant = serializer.save(
                city=city,
                state=state)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MerchantUpload(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)
    parser_classes = (MultiPartParser, )

    def validate_rows(self, team, rows):
        if not rows:
            return ([], None)

        merchants = []
        states = []
        cities = []
        results = []

        counter = 0
        for row in rows:
            counter += 1
            entries = row.strip().split(",") + [None]*4
            name, state, city, address = entries[:4]
            if not name:
                return (None, "Empty name at row: {0}".format(counter))

            if city:
                city = city.lower()
                cities.append(city)
            else:
                city = None

            if state:
                state = state.lower()
                states.append(state)
            else:
                state = None

            merchants.append({
                'name': name,
                'city': city,
                'state': state,
                'address': address if address else "",
                'team': team
                })

        states_list = models.State.objects.filter(name_lower__in=set(states))
        state_map = {s.name_lower: s for s in states_list}
        cities_list = models.City.objects.filter(name_lower__in=set(cities))
        city_map = {c.name_lower: c for c in cities_list}

        for merchant in merchants:
            merchant_state = merchant.get('state')
            if merchant_state:
                state = state_map.get(merchant_state)
                if not state:
                    return (None, "Invalid state {}".format(merchant_state))

                merchant['state'] = state

            merchant_city = merchant.get('city')
            if merchant_city:
                city = city_map.get(merchant_city)
                if not city:
                    return (None, "Invalid city {}".format(merchant_city))

                merchant['city'] = city

            results.append(models.Merchant(**merchant))

        return (results, None)


    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        file = request.FILES.get("data")
        file_data = file.readlines()
        results, err = self.validate_rows(team, file_data)

        if err:
            return Response(err, status=status.HTTP_400_BAD_REQUEST)

        merchants = models.Merchant.objects.bulk_create(results)
        ser = serializers.MerchantSerializer(merchants, many=True)
        return Response(ser.data)
        

class ItemList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)

    def get(self, request, team_id, format=None):
        PARAM_QUERY = 'query'
        filter_query = request.query_params.get(PARAM_QUERY)

        start, limit = utils.get_query_start_limit(request)
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        items = team.item_set.all()
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
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, crm_permissions.IsItemTeamMember)

    def get(self, request, item_id, format=None):
        item = get_object_or_404(models.Item, id=item_id)
        self.check_object_permissions(request, item)
        serializer = serializers.ItemSerializer(item)
        return Response(serializer.data)

    def put(self, request, item_id, format=None):
        item = get_object_or_404(models.Item, id=item_id)
        self.check_object_permissions(request, item)
        serializer = serializers.ItemSerializer(item, data=request.data)
        if serializer.is_valid():
            item = serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemUpload(APIView):
    permission_classes = (permissions.IsAuthenticated, IsTeamMember)
    parser_classes = (MultiPartParser, )

    def validate_rows(self, team, rows):
        if not rows:
            return ([], None)

        items = []
        results = []

        counter = 0
        for row in rows:
            counter += 1
            entries = row.strip().split(",") + [None]*3
            name, price, serial_number = entries[:3]
            if not name:
                return (None, "Empty name at row: {0}".format(counter))

            if not price:
                return (None, "Empty price at row: {0}".format(counter))

            item = {
                'name': name,
                'price': price,
                'serial_number': serial_number if serial_number else "",
                'team': team
                }

            serializer = serializers.ItemSerializer(data=item)
            if not serializer.is_valid():
                return (None, "Error in row {0} {1}".format(counter, serializer.errors))

            items.append(item)

        for item in items:
            results.append(models.Item(**item))

        return (results, None)


    def post(self, request, team_id, format=None):
        team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)

        file = request.FILES.get("data")
        file_data = file.readlines()
        results, err = self.validate_rows(team, file_data)

        if err:
            return Response(err, status=status.HTTP_400_BAD_REQUEST)

        merchants = models.Item.objects.bulk_create(results)
        ser = serializers.ItemSerializer(merchants, many=True)
        return Response(ser.data)
