import json
from rest_framework import serializers
from .models import Team, TeamMembership, Checkin, CheckinMedia, Attendance, UserMedia, Message

from accounts.serializers import UserSerializer, UserBioSerializer
from groups.serializers import GroupSerializer
from locations.models import PhoneStatus, LocationStatus
from locations.serializers import PhoneStatusSerializer, LocationStatusSerializer

TEAM_CONF_FEAT_CHAT = 'chat'
TEAM_CONF_FEAT_MAP = 'map'
TEAM_CONF_FEAT_EVENTS = 'events'

class TeamSerializer(serializers.ModelSerializer):

    class Meta:
        model = Team
        exclude = ('members', 'code')
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

    def get_configuration(self, role):
        configuration = {
            "home": "featured", 
            "features": [TEAM_CONF_FEAT_CHAT]
        }

        if role == TeamMembership.ROLE_ADMIN:
            configuration["features"].insert(0, TEAM_CONF_FEAT_MAP)

        return configuration

    def to_representation(self, obj):
        data = super(TeamMembershipSerializer, self).to_representation(obj)
        role = data.get('role')
        if role == TeamMembership.ROLE_ADMIN:
            data['team']['code'] = obj.team.code

        data['team']['configuration'] = self.get_configuration(role)
        return data

class CheckinMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckinMedia
        exclude = ('team', 'user')
        read_only_fields = ('created', 'updated', 'unique_id')

class CheckinSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    media = CheckinMediaSerializer(read_only=True, many=True)

    class Meta:
        model = Checkin
        fields = ('latitude', 'longitude', 'timestamp', 'accuracy', 'created', 'updated',
            'spoofed', 'battery', 'session', 'user', 'media', 'team', 'description', 'id')
        read_only_fields = ('created', 'updated')

class AttendanceSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = "__all__"
        read_only_fields = ('created', 'updated')

class UserMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMedia
        exclude = ('team', 'user', 'checkin')
        read_only_fields = ('created', 'updated', 'unique_id')


TYPE_CHECKIN = 'checkin'
TYPE_ATTENDANCE = 'attendance'
TYPE_LOCATION_STATUS = 'location_status'
TYPE_PHONE_STATUS = 'phone_status'
TYPE_LAST_LOCATION = 'last_location'

def serialize_events(events):
    results = []
    for event in events:
        if isinstance(event, Checkin):
            data = CheckinSerializer(event).data
            data['type'] = TYPE_CHECKIN
        elif isinstance(event, Attendance):
            data = AttendanceSerializer(event).data
            data['type'] = TYPE_ATTENDANCE
        elif isinstance(event, LocationStatus):
            data = LocationStatusSerializer(event).data
            data['type'] = TYPE_LOCATION_STATUS
        elif isinstance(event, PhoneStatus):
            data = PhoneStatusSerializer(event).data
            data['type'] = TYPE_PHONE_STATUS
        else:
            continue

        results.append(data)

    return results

class MessageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(max_length=16)
    attachment = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ('created', 'updated')

    def validate_body(self, value):
        if not value:
            return ''

        return value.strip().encode('utf-8')

    def get_attachment(self, obj):
        if obj:
            try:
                return json.loads(obj)
            except:
                pass

        return ''

class ConversationMessageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(max_length=16)
    sender = UserBioSerializer(read_only=True)
    target = UserBioSerializer(read_only=True)
    group = GroupSerializer(required=False)

    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ('created', 'updated')

    def validate_body(self, value):
        if not value:
            return ''

        return value.strip().encode('utf-8')