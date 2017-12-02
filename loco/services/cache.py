import redis, pickle
from datetime import timedelta
from dateutil.parser import parse
from django.conf import settings
from django.utils import timezone

CACHE_LOCATION = 'loco.masterpeace.in'
CACHE_PORT = 6174
CACHE_DB = 0

host = CACHE_LOCATION
port = CACHE_PORT
db = CACHE_DB
pool = redis.ConnectionPool(host=host, port=port, db=db, password="lokopass")
cache = redis.Redis(connection_pool=pool)

KEY_LOCATION = "location_"
KEY_STATUS = "status_"

USER_STATUS_SIGNEDIN = "signedin" 
USER_STATUS_SIGNEDOUT = "signedout" 
USER_STATUS_LOCATIONOFF = "locationoff" 
USER_STATUS_UNREACHABLE = "unreachable" 

def get_users_location(user_ids):
	if not user_ids:
		return 

	keys = [KEY_LOCATION+str(id) for id in user_ids]
	rows = cache.mget(keys)
	return [pickle.loads(row) if row else None for row in rows]

def get_user_status(user_id):
	if not user_id:
		return 

	key = KEY_STATUS + str(user_id)
	status = cache.get(key)
	last_location = get_users_location([user_id])[0]
	if  status == USER_STATUS_SIGNEDOUT or not last_location:
		return status

	last_location_time = parse(last_location.get('updated'))
	if timezone.now() - last_location_time > timedelta(minutes=10):
		return USER_STATUS_UNREACHABLE

	status = status or ''
	return status

def set_user_status(user_id, status):
	if not user_id or not status:
		return
		
	key = KEY_STATUS + str(user_id)
	last_status = get_user_status(user_id)
	if last_status != USER_STATUS_SIGNEDOUT:
		cache.set(key, status)

def set_user_location(user_id, location_data):
	if not user_id or not location_data:
		return
		
	key = KEY_LOCATION + str(user_id)
	cache.set(key, pickle.dumps(location_data))

	last_location = get_users_location([user_id])[0]
	if not last_location:
		return

	if not location_data.get('latitude') and last_location.get('latitude'):
		set_user_status(user_id, USER_STATUS_LOCATIONOFF)
	elif location_data.get('latitude') and not last_location.get('latitude'):
		set_user_status(user_id, USER_STATUS_SIGNEDIN)