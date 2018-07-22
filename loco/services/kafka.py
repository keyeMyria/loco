from __future__ import absolute_import

import json
from kafka import KafkaProducer

from django.conf import settings

SERVER = 'localhost:9092'
if settings.DEBUG:
	SERVER = 'anuvad.io:9092'

producer = KafkaProducer(bootstrap_servers=SERVER)

def send_message(message):
	if not message:
		return
	message = json.dumps(message).encode('utf-8')
	producer.send('ack', message)