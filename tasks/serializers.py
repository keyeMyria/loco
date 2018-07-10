import json
from rest_framework import serializers
from .models import Task, TaskMedia, DeliveryTaskContent, TaskHistory, SalesTaskContent

from accounts.serializers import UserSerializer
from teams.serializers import TeamSerializer
from crm.models import Merchant, City, State
from crm import serializers as crm_serializers

def get_content_serializer(content_type, **kwargs):
    team = kwargs.pop('team')
    if content_type == DeliveryTaskContent.__name__.lower():
        return (DeliveryTaskContentSerializer(**kwargs), None)
    elif content_type == SalesTaskContent.__name__.lower():
        data = kwargs.get("data")
        merchant = data.get('merchant')
        if isinstance(merchant, dict):
            local_id = merchant.get('local_id')
            if not local_id:
                return (None, "No local id")

            existing_merchant = Merchant.objects.filter(local_id=local_id)
            if existing_merchant:
                merchant_id = existing_merchant[0].id
            else:
                city_id = merchant.get('city', 0)
                if city_id:
                    city = City.objects.filter(id=city_id)
                    if not city:
                        return (None, "Could not find city for id {}".format(city_id))

                    city = city[0]
                else:
                    city = None

                merchant['city'] = city

                state_id = merchant.get('state', 0)
                if state_id:
                    state = State.objects.filter(id=state_id)
                    if not state:
                        return (None, "Could not find state for id {}".format(state_id))

                    state = state[0]
                else:
                    state = None

                merchant['state'] = state
                merchant['team'] = team
                ser = crm_serializers.MerchantSerializer(data=merchant)
                if ser.is_valid():
                    merchant_id = ser.save(team=team, city=city, state=state).id
                else:
                    return (None, ser.errors)

            data['merchant'] = merchant_id
        
        return (SalesTaskContentSerializer(**kwargs), None)

    return(None, "Bad data in content")

class DeliveryTaskContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryTaskContent
        fields = '__all__'
        read_only_fields = ('created', 'updated')

class SalesTaskContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesTaskContent
        fields = '__all__'
        read_only_fields = ('created', 'updated')

class ContentObjectRelatedField(serializers.RelatedField):

    def to_representation(self, value):

        if isinstance(value, DeliveryTaskContent):
            serializer = DeliveryTaskContentSerializer(value)
        elif isinstance(value, SalesTaskContent):
            serializer = SalesTaskContentSerializer(value)
        else:
            raise Exception('Unexpected task content type')

        return serializer.data

class TaskMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskMedia
        exclude = ('team', 'created_by')
        read_only_fields = ('created', 'updated', 'unique_id')

class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    content = ContentObjectRelatedField(source='content_object', read_only=True)
    content_type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Task
        fields = ( 'created', 'updated', 'team', 'id', 'assigned_to',
            'created_by', 'status', 'content', 'content_type')
        read_only_fields = ('created', 'updated')

    def get_content_type(seld, obj):
        if obj.content_type:
            return obj.content_type.model

class TaskHistorySerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = TaskHistory
        fields = ('id', 'created', 'updated', 'actor', 'action', 'task')
        read_only_fields = ('created', 'updated')
