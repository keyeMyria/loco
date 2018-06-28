from __future__ import absolute_import, unicode_literals
import json

from celery import shared_task

from .gcm import send_checkin_gcm, send_chat_gcm, send_task_gcm


@shared_task
def send_checkin_gcm_async(checkin_id):
    send_checkin_gcm(checkin_id)

@shared_task
def send_task_gcm_async(task_history_id):
    send_task_gcm(task_history_id)

@shared_task
def send_chat_gcm_async(gcm_token):
    send_chat_gcm(gcm_token)

@shared_task
def addnum(x,y):
    return x+y