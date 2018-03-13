from rest_framework import serializers
from .models import Group, GroupMembership

from accounts.serializers import UserSerializer

class GroupSerializer(serializers.ModelSerializer):
    ADD_MEMBERS_COUNT = 'add_members_count'
    members = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = '__all__'
        read_only_fields = ('created_by', 'created', 'updated', 'team')

    def get_members(self, obj):
        if self.context.get(self.ADD_MEMBERS_COUNT):
            return obj.members.count()

class GroupMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    group = GroupSerializer(read_only=True)

    class Meta:
        model = GroupMembership
        exclude = ('created_by',)
        read_only_fields = ('created', 'updated', 'group', 'user')
        depth = 1

