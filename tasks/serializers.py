import json
from rest_framework import serializers
from .models import Task, TaskMedia, DeliveryTaskContent, TaskHistory, SalesTaskContent

from accounts.serializers import UserSerializer
from teams.serializers import TeamSerializer

def get_content_serializer(content_type, **kwargs):
    if content_type == DeliveryTaskContent.__name__.lower():
        return DeliveryTaskContentSerializer(**kwargs)
    elif content_type == SalesTaskContent.__name__.lower():
        return SalesTaskContentSerializer(**kwargs)

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
