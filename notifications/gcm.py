from __future__ import absolute_import

import requests, json
from  oauth2client.service_account import ServiceAccountCredentials

from teams.models import Checkin, TeamMembership
from teams.serializers import CheckinSerializer
from tasks.models import TaskHistory

url = 'https://fcm.googleapis.com/v1/projects/bd-tracker/messages:send'

def _get_access_token():
  credentials = ServiceAccountCredentials.from_json_keyfile_name(
      '../keys/service.json', 'https://www.googleapis.com/auth/firebase.messaging')
  access_token_info = credentials.get_access_token()
  return access_token_info.access_token

headers = {
  'Authorization': 'Bearer ' + _get_access_token(),
  'Content-Type': 'application/json; UTF-8',
}

GCM_TYPE_CHAT = 'chat'
GCM_TYPE_CHECKIN = 'checkin'
GCM_TYPE_TASK = 'task'

def send_message_gcm(gcm_token, message_data):
	data= {
	  	"message":{
		    "token" : gcm_token,
		    "data": message_data
	   }
	}

	res = requests.post(url, headers=headers, json=data)
	if res.status_code >= 400:
		raise Exception("GCMError")

def send_notification_gcm(gcm_token, message, message_data=''):
	data= {
	  	"message":{
		    "token" : gcm_token,
		    "notification" : {
		      "body" : "",
		      "title" : message,
		    }
	   }
	}

	if message_data:
		data['message']['data'] = message_data
		
	res = requests.post(url, headers=headers, json=data)
	if res.status_code >= 400:
		raise Exception("GCMError")

def send_checkin_gcm(checkin_id):
	checkin = Checkin.objects.get(id=checkin_id)
	author = checkin.user
	targets =TeamMembership.objects.filter(
		team=checkin.team, role=TeamMembership.ROLE_ADMIN).exclude(user=checkin.user)
	message = "{0} checked in".format(author.name.title())
	data = {'checkin_id': str(checkin.id)}
	data['team_id'] = str(checkin.team.id)
	data['type'] = GCM_TYPE_CHECKIN

	for target in targets:
		send_notification_gcm(target.user.gcm_token, message, data)

def send_task_gcm(task_histroy_id):
	task_histroy = TaskHistory.objects.get(id=task_histroy_id)
	task = task_histroy.task
	author = task_histroy.actor
	targets = [task.assigned_to, task.created_by]
	message = "{0} {1}".format(author.name.title(), task_histroy.action)
	data = {'task_id': str(task.id)}
	data['team_id'] = str(task.team.id)
	data['type'] = GCM_TYPE_TASK

	for target in targets:
		send_notification_gcm(target.gcm_token, message, data)

def send_chat_gcm(gcm_token):
	data = {}
	data['type'] = GCM_TYPE_CHAT
	send_message_gcm(gcm_token, data)