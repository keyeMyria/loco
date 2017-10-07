from rest_framework import serializers
from .models import Team, TeamMembership, Checkin, CheckinMedia, Attendance, UserMedia

from accounts.serializers import UserSerializer

class TeamSerializer(serializers.ModelSerializer):

    class Meta:
        model = Team
        exclude = ('members', )
        read_only_fields = ('created_by', 'created', 'updated')

    def create(self, validated_data):
        return Team.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        return instance

class TeamMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = TeamMembership
        exclude = ('created_by',)
        read_only_fields = ('created', 'updated', 'team', 'user')
        depth = 1

    def create(self, validated_data):
        return Team.objects.create(**validated_data)

class CheckinSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = Checkin
        fields = '__all__'
        read_only_fields = ('created', 'updated', 'team', 'user', 'unique_id')

class CheckinMediaSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = CheckinMedia
        fields = '__all__'
        read_only_fields = ('created', 'updated', 'team', 'user')

class AttendanceSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ('team','user', 'created', 'updated')


class UserMediaSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = UserMedia
        fields = '__all__'
        read_only_fields = ('created', 'updated', 'team', 'user', 'unique_id')
