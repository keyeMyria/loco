from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.views import APIView

import tasks
from .models import Group, GroupMembership
from .serializers import GroupSerializer, GroupMembershipSerializer
from .permissions import IsGroupMember, IsGroupAdminOrReadOnly, CanAlterGroupMembership

from accounts.models import User
from teams.models import Team, TeamMembership
from teams import permissions as team_permissions

class GroupList(APIView):
    permission_classes = (permissions.IsAuthenticated, team_permissions.IsTeamMember)

    def add_members(self, request, group):
        user_ids = request.data.get('members')
        if not user_ids:
            return

        if not isinstance(user_ids, list):
            user_ids = [user_ids]

        group.add_members(user_ids, request.user)

    def post(self, request, team_id, format=None):
    	team = get_object_or_404(Team, id=team_id)
        self.check_object_permissions(self.request, team)
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            group = serializer.save(created_by=request.user, team=team)
            self.add_members(request, group)
            return Response(serializer.data)

        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GroupDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, IsGroupMember, IsGroupAdminOrReadOnly)

    def get(self, request, group_id, format=None):
        group = get_object_or_404(Group, id=group_id)
        self.check_object_permissions(self.request, group)
        data = GroupSerializer(group, context={GroupSerializer.ADD_MEMBERS_COUNT:True}).data            
        return Response(data=data)

    def put(self, request, group_id, format=None):
        group = get_object_or_404(Group, id=group_id)
        self.check_object_permissions(self.request, group)
        serializer = GroupSerializer(group, data=request.data)
        
        if serializer.is_valid():
            group = serializer.save()
            tasks.send_named_group_async.delay(group.id, request.user.id)
            return Response(data=serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, group_id, format=None):
        group = get_object_or_404(Group, id=group_id)
        self.check_object_permissions(self.request, group)
        group.delete()
        return Response(status=204)

class GroupMembershipList(APIView):
    permission_classes = (permissions.IsAuthenticated, IsGroupMember, IsGroupAdminOrReadOnly)

    def get(self, request, group_id, format=None):
        group = get_object_or_404(Group, id=group_id)
        self.check_object_permissions(self.request, group)
        memberships = GroupMembership.objects.filter(group=group)
        serializer = GroupMembershipSerializer(memberships, many=True)
        return Response(serializer.data)

    def post(self, request, group_id, format=None):
        group = get_object_or_404(Group, id=group_id)
        self.check_object_permissions(self.request, group)
        user_ids = request.data.get('members')
        if not isinstance(user_ids, list):
            user_ids = [user_ids]

        group_memberships = group.add_members(user_ids, request.user)
        if group_memberships:
            tasks.update_group_members_async.delay(group_id)
            for membership in group_memberships:
                tasks.send_added_group_async.delay(group.id, request.user.id, membership.user.id)

            serializer = GroupMembershipSerializer(group_memberships, many=True)
            return Response(serializer.data)

        return Response({})

class GroupMembershipDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, CanAlterGroupMembership)

    def put(self, request, group_id, user_id, format=None):
        membership = get_object_or_404(GroupMembership, user_id=user_id, group_id=group_id)
        self.check_object_permissions(self.request, membership)
        serializer = GroupMembershipSerializer(membership, data=request.data, partial=True)
        
        if serializer.is_valid():
            membership = serializer.save()
            if membership.role == GroupMembership.ROLE_ADMIN:
                tasks.send_admin_group_async.delay(membership.group.id, membership.user.id)
            return Response(data=serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, group_id, user_id, format=None):
        membership = get_object_or_404(GroupMembership, user_id=user_id, group_id=group_id)
        self.check_object_permissions(self.request, membership)
        group_id = membership.group.id
        membership.delete()
        tasks.update_group_members_async.delay(group_id)
        tasks.send_removed_group_async.delay(membership.group.id, request.user.id, membership.user.id)
        return Response(status=204)