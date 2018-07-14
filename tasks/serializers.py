
import json
from rest_framework import serializers
from .models import Task, TaskMedia, DeliveryTaskContent, TaskHistory, SalesTaskContent, SalesTaskItems

from accounts.serializers import UserSerializer
from teams.serializers import TeamSerializer
from crm.models import Merchant, City, State, Item
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
                ser = crm_serializers.MerchantSerializer(data=merchant)
                if ser.is_valid():
                    merchant_id = ser.save(team=team).id
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

class SalesTaskItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesTaskItems
        fields = '__all__'
        read_only_fields = ('created', 'updated')

class SalesTaskContentSerializer(serializers.ModelSerializer):
    items = SalesTaskItemsSerializer(source="get_items", many=True, read_only=True)

    class Meta:
        model = SalesTaskContent
        fields = '__all__'
        read_only_fields = ('created', 'updated')

    def create(self, validated_data):
        content_object = SalesTaskContent.objects.create(**validated_data)
        if "items" in self.initial_data:
            items = self.initial_data.get('items')
            for item in items:
                item['item'] = Item.objects.get(id=item.get('item'))
                item['sales_task_content'] = content_object
                SalesTaskItems.objects.create(**item)

        return content_object

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

class DeepSalesTaskItemsSerializer(serializers.ModelSerializer):
    item = crm_serializers.ItemSerializer(read_only=True)

    class Meta:
        model = SalesTaskItems
        fields = '__all__'
        read_only_fields = ('created', 'updated')

class DeepSalesTaskContentSerializer(serializers.ModelSerializer):
    items = DeepSalesTaskItemsSerializer(source="get_items", many=True, read_only=True)
    merchant = crm_serializers.MerchantSerializer(read_only=True)

    class Meta:
        model = SalesTaskContent
        fields = '__all__'
        read_only_fields = ('created', 'updated')

    def create(self, validated_data):
        content_object = SalesTaskContent.objects.create(**validated_data)
        if "items" in self.initial_data:
            items = self.initial_data.get('items')
            for item in items:
                item['item'] = Item.objects.get(id=item.get('item'))
                item['sales_task_content'] = content_object
                SalesTaskItems.objects.create(**item)

        return content_object

class DeepContentObjectRelatedField(serializers.RelatedField):

    def to_representation(self, value):

        if isinstance(value, DeliveryTaskContent):
            serializer = DeliveryTaskContentSerializer(value)
        elif isinstance(value, SalesTaskContent):
            serializer = DeepSalesTaskContentSerializer(value)
        else:
            raise Exception('Unexpected task content type')

        return serializer.data


class DeepTaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    content = DeepContentObjectRelatedField(source='content_object', read_only=True)
    content_type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ('created', 'updated')

    def get_content_type(seld, obj):
        if obj.content_type:
            return obj.content_type.model