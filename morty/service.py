import requests
from django.conf import settings
from django.utils import timezone

URL = 'http://loco.masterpeace.in:5280/api/send_stanza'
HEADERS = {'Content-Type': 'application/xml', 'X-Admin': 'true'}
AUTH = ('admin@localhost', 'temppass')

def send_message(data):
	response = requests.post(URL, data=data, headers=HEADERS, auth=AUTH)
	if response.status_code >= 400:
		raise Exception("Failed to send message via XMPP")

	return response

GROUP_BASE_MESSAGE = '''<?xml version="1.0" encoding="UTF-8"?>
					<message to="{group_id}@groupchat" from="0@localhost" id="{message_id}" type="chat">
				    <body>{action_message}</body>
				    <thread>group_chat_{group_id}</thread>
				    <team xmlns="urn:xmpp:magicpin:3" id="{team_id}" name="{team_name}" />
				    <time xmlns="urn:xmpp:magicpin:3" sent_time="{sent_time}" />
				    {action_details}
					</message>'''

GROUP_LEFT_MESSAGE = {'action_message': '{actor_name} left the group',
	'action_details': '<left_group xmlns="urn:xmpp:groups:3" id="{actor_id}" name="{actor_name}" />'}
GROUP_ADDED_MESSAGE = {'action_message': '{actor_name} added {target_name}',
	'action_details': '<joined_group xmlns="urn:xmpp:groups:3" id="{actor_id}" name="{actor_name}" />'}
GROUP_ADMIN_MESSAGE = {'action_message': '{actor_name} is admin',
	'action_details': '<admin_group xmlns="urn:xmpp:groups:3" id="{actor_id}" name="{actor_name}" />'}
GROUP_NAMED_MESSAGE = {'action_message': '{actor_name} changed group name to {group_name}',
	'action_details': '<named_group xmlns="urn:xmpp:groups:3" id="{actor_id}" name="{actor_name}" />'}
GROUP_REMOVED_MESSAGE = {'action_message': '{actor_name} removed {target_name}',
	'action_details': '<named_group xmlns="urn:xmpp:groups:3" id="{actor_id}" name="{actor_name}" />'}

def send_group_message(message_template, group, actor, target=None):
	if settings.DEBUG:
		return

	sent_time = timezone.now().isoformat()
	message = GROUP_BASE_MESSAGE.format(**message_template)
	message = message.format(
			sent_time=sent_time,
			group_id=group.id,
			group_name=group.name,
			message_id='TODO',
			team_id=group.team.id,
			team_name=group.team.name,
			actor_name=actor.name,
			actor_id=actor.id)
	if target:
		message.format(target_name=target.name, target_id=target.id)

	send_message(message)

def send_added_group(group, actor, target):
	send_group_message(GROUP_ADDED_MESSAGE, group, actor, target)

def send_left_group(group, actor):
	send_group_message(GROUP_LEFT_MESSAGE, group, actor)

def send_admin_group(group, actor):
	send_group_message(GROUP_ADMIN_MESSAGE, group, actor)

def send_named_group(group, actor):
	send_group_message(GROUP_NAMED_MESSAGE, group, actor)

def send_removed_group(group, actor, target):
	send_group_message(GROUP_REMOVED_MESSAGE, group, actor, target)