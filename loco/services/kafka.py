from __future__ import absolute_import

import json
from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers='anuvad.io:9092')

def send_message(message):
	if not message:
		return
	message = json.dumps(message).encode('utf-8')
	producer.send('ack', message)