from rest_framework import serializers
from loco.services import cache
from .models import User, UserDump


class UserSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    log_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'phone','name', 'email', 'latitude', 'longitude', 'status', 'photo', 'log_status')
        read_only_fields = ('id', 'phone', 'latitude', 'longitude', 'status')

    def get_status(self, obj):
        return cache.get_user_status(obj.id)

    def get_log_status(self, obj):
        if 'team' in self.context:
            team = self.context['team']
            return cache.get_user_log_status(obj.id, team.id)

class UserBioSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'name', 'photo')

class UserDumpSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserDump
        fields = '__all__'