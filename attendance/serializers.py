import json
from rest_framework import serializers
from . import models


class PunchSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Punch
        fields = "__all__"
        read_only_fields = ('created', 'updated', 'user', 'team')

class LeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Leave
        fields = "__all__"
        read_only_fields = ('created', 'updated', 'user', 'team')