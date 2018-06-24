from rest_framework import permissions

class IsTaskTeamMember(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.team.is_member(request.user)
    
class IsTaskOwnerOrTeamAdmin(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
    	# return  obj.team.is_admin(request.user) or obj.assigned_to == request.user
    	return True