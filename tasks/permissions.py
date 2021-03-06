from rest_framework import permissions

class IsTaskTeamMember(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.team.is_member(request.user) or obj.team.is_admin_account(request.user)