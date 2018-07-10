from __future__ import absolute_import, unicode_literals

from celery import shared_task

from . import uploader



@shared_task
def upload_merchants_async(upload_id):
	uploader.upload_merchants(upload_id)

@shared_task
def upload_items_async(upload_id):
	uploader.upload_items(upload_id)
    
