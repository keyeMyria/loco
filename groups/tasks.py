from __future__ import absolute_import, unicode_literals
import json

from celery import shared_task

from loco.services.cache import set_group_members

from morty import service as morty_service
from .models import GroupMembership, Group
from accounts.models import User

@shared_task
def update_group_members_async(group_id):
    memberships = GroupMembership.objects.filter(group=group_id)
    members = [m.user.id for m in memberships]
    set_group_members(group_id, members)

@shared_task
def send_added_group_async(group_id, actor_id, target_id):
	group = Group.objects.get(id=group_id)
	actor = User.objects.get(id=actor_id)
	target = User.objects.get(id=target_id)
	morty_service.send_added_group(group, actor, target)

@shared_task
def send_removed_group_async(group_id, actor_id, target_id):
	group = Group.objects.get(id=group_id)
	actor = User.objects.get(id=actor_id)
	target = User.objects.get(id=target_id)
	if actor.id == target.id:
		morty_service.send_left_group(group, actor)
	else:
		morty_service.send_removed_group(group, actor, target)

@shared_task
def send_admin_group_async(group_id, actor_id):
	group = Group.objects.get(id=group_id)
	actor = User.objects.get(id=actor_id)
	morty_service.send_admin_group(group, actor)

@shared_task
def send_named_group_async(group_id, actor_id):
	group = Group.objects.get(id=group_id)
	actor = User.objects.get(id=actor_id)
	morty_service.send_named_group(group, actor)
