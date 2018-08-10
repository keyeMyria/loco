from __future__ import absolute_import, unicode_literals

from celery import shared_task

from loco.services import solr
import time

@shared_task
def update_task_index_async():
	solr.update_task_index()
	time.sleep(10)
	solr.update_task_index()