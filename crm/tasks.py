from __future__ import absolute_import, unicode_literals

from celery import shared_task

from . import uploader
from loco.services import solr

@shared_task
def upload_merchants_async(upload_id):
	uploader.upload_merchants(upload_id)
	solr.update_merchant_index()
	solr.update_merchant_index()

@shared_task
def upload_items_async(upload_id):
	uploader.upload_items(upload_id)
	solr.update_item_index()
	solr.update_item_index()
    
@shared_task
def update_item_index_async():
	solr.update_item_index()
	solr.update_item_index()

@shared_task
def update_merchant_index_async():
	solr.update_merchant_index()
	solr.update_merchant_index()