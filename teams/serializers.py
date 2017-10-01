from rest_framework import serializers
from .models import Team, TeamMembership

class TeamSerializer(serializers.ModelSerializer):

    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ('created_by', 'members', 'created', 'updated')

    def create(self, validated_data):
        return Team.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        return instance

class TeamMembershipSerializer(serializers.ModelSerializer):

    class Meta:
        model = TeamMembership
        fields = '__all__'
        read_only_fields = ('created_by', 'created', 'updated', 'team')

    def create(self, validated_data):
        return Team.objects.create(**validated_data)