import requests
from uuid import uuid4
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
					<message id="{message_id}" type="chat">
				    <body>{action_message}</body>
				    <thread>group_chat_{group_id}</thread>
				    <team xmlns="urn:xmpp:magicpin:3" id="{team_id}" name="{team_name}" />
				    <time xmlns="urn:xmpp:magicpin:3" sent_time="{sent_time}" />
				    {action_details}
					</message>'''

GROUP_LEFT_MESSAGE = {'action_message': '{actor_name} left the group',
	'action_details': '<left_group xmlns="urn:xmpp:groups:3" id="{actor_id}" name="{actor_name}" />'}
GROUP_ADDED_MESSAGE = {'action_message': '{actor_name} added {target_name}',
	'action_details': '<joined_group xmlns="urn:xmpp:groups:3" id="{target_id}" name="{target_name}" />'}
GROUP_ADMIN_MESSAGE = {'action_message': '{actor_name} is admin',
	'action_details': '<admin_group xmlns="urn:xmpp:groups:3" id="{actor_id}" name="{actor_name}" />'}
GROUP_NAMED_MESSAGE = {'action_message': '{actor_name} changed group name to {group_name}',
	'action_details': '<named_group xmlns="urn:xmpp:groups:3" id="{group_id}" name="{group_name}" />'}
GROUP_REMOVED_MESSAGE = {'action_message': '{actor_name} removed {target_name}',
	'action_details': '<named_group xmlns="urn:xmpp:groups:3" id="{target_id}" name="{target_name}" />'}

def send_group_message(message_template, group, actor, target=None):
	if settings.DEBUG:
		return

	sent_time = timezone.now().isoformat()
	message = GROUP_BASE_MESSAGE.format(
			sent_time=sent_time,
			group_id=group.id,
			message_id=str(uuid4())[:16],
			team_id=group.team.id,
			team_name=group.team.name,
			**message_template)

	message = {'to':"{group_id}@groupchat", 
		'from':"0@localhost",
		'stanza': message}

	send_message(message)

def send_added_group(group, actor, target):
	template = GROUP_ADDED_MESSAGE
	for key in template:
		template[key] = template[key].format(
				actor_id=actor.id,
				actor_name=actor.name,
				target_id=target.id,
				target_name=target.name
			)
	send_group_message(template, group, actor, target)

def send_left_group(group, actor):
	template = GROUP_LEFT_MESSAGE
	for key in template:
		template[key] = template[key].format(
				actor_id=actor.id,
				actor_name=actor.name
			)
	send_group_message(template, group, actor)

def send_admin_group(group, actor):
	template = GROUP_ADMIN_MESSAGE
	for key in template:
		template[key] = template[key].format(
				actor_id=actor.id,
				actor_name=actor.name
			)
	send_group_message(template, group, actor)

def send_named_group(group, actor):
	template = GROUP_NAMED_MESSAGE
	for key in template:
		template[key] = template[key].format(
				group_id=group.id,
				group_name=group.name,
				actor_name=actor.name
			)
	send_group_message(template, group, actor)

def send_removed_group(group, actor, target):
	template = GROUP_REMOVED_MESSAGE
	for key in template:
		template[key] = template[key].format(
				actor_id=actor.id,
				actor_name=actor.name,
				target_name=target.name,
				target_id=target.id
			)
	send_group_message(template, group, actor, target)

APP_CACHE_BASE_MESSAGE = '''<?xml version="1.0" encoding="UTF-8"?>
						<message to="{target_id}@localhost" from="0@localhost" id="{message_id}" type="chat">
						<body></body>
						<thread></thread>
						<time xmlns="urn:xmpp:magicpin:3" sent_time="{sent_time}" />
						{action}
						</message>'''

APP_CACHE_TEAM_NAME_ACTION = '''<named_team xmlns="urn:xmpp:groups:3">
							<team xmlns="urn:xmpp:magicpin:3" id="{team_id}" name="{team_name}" />
							</named_team>'''
APP_CACHE_MEMBERSHIP_ACTION = '''<membership xmlns="urn:xmpp:groups:3">
						<team xmlns="urn:xmpp:magicpin:3" id="{team_id}" name="{team_name}" />
						<user xmlns="urn:xmpp:magicpin:3" id="{user_id}" name="{user_name}" role="{role}" />
						</membership>''' 

def send_app_db_update(message_template, user):
	if settings.DEBUG:
		return

	sent_time = timezone.now().isoformat()
	message = APP_CACHE_BASE_MESSAGE.format(action=message_template)
	message = message.format(
			sent_time=sent_time,
			message_id=str(uuid4())[:16],
			target_id=user.id)
	send_message(message)

def send_team_update(team, user):
	template = APP_CACHE_TEAM_NAME_ACTION.format(
				team_name=team.name,
				team_id=team.id)
	send_app_db_update(template, user)

def send_membership_update(membership, user):
	team = membership.team
	template = APP_CACHE_MEMBERSHIP_ACTION.format(
				team_name=team.name,
				team_id=team.id,
				user_id=membership.user.id,
				user_name=membership.user.name,
				role=membership.role)
	send_app_db_update(template, user)