import redis, pickle, logging
from datetime import timedelta
from dateutil.parser import parse
from django.conf import settings
from django.utils import timezone
from locations.models import LocationStatus, PhoneStatus
from accounts.models import User
from teams.models import Team


logger = logging.getLogger('custom')

CACHE_LOCATION = 'localhost'
if settings.DEBUG:
    CACHE_LOCATION = 'anuvad.io'
    
CACHE_PORT = 6174
CACHE_DB = 0

host = CACHE_LOCATION
port = CACHE_PORT
db = CACHE_DB
pool = redis.ConnectionPool(host=host, port=port, db=db, password="lokopass")
cache = redis.Redis(connection_pool=pool)

KEY_PING = "ping_"
KEY_LAST_LOCATION = "last_location_"
KEY_STATUS = "status_"
KEY_STATUS_SIGNIN = "signin"
KEY_TIME_SIGNIN = "signin_time_"
KEY_STATUS_LOCATION = "location"
KEY_LOG_STATUS = "log_"
KEY_LOG_TIME = "log_time_"
KEY_GROUP_MEMBERS = 'members_'

USER_STATUS_SIGNEDIN = "signedin" 
USER_STATUS_SIGNEDOUT = "signedout" 
USER_STATUS_LOCATIONOFF = "locationoff" 
USER_STATUS_UNREACHABLE = "unreachable" 

def _hydrate_user(ping_data):
    if not ping_data:
        return {}

    if 'user' in ping_data and not isinstance(ping_data['user'], User):
        user_id = ping_data['user']
        ping_data['user'] = User.objects.get(id=user_id)
    if 'team' in ping_data and not isinstance(ping_data['team'], Team):
        team_id = ping_data['team']
        ping_data['team'] = Team.objects.get(id=team_id)

    return ping_data

def get_user_ping(user_id):
    if not user_id:
        return 

    key = KEY_PING+str(user_id)
    ping = cache.get(key)
    if ping:
        return pickle.loads(cache.get(key))

    return {}

def get_user_status(user_id):
    if not user_id:
        return 

    key = KEY_STATUS + str(user_id)
    status = cache.hgetall(key)
    last_ping = get_user_ping(user_id)
    if not status.get(KEY_STATUS_SIGNIN) == 'True' or not last_ping:
        return USER_STATUS_SIGNEDOUT
    else:
        last_ping_time = parse(last_ping.get('timestamp'))
        if timezone.now() - last_ping_time > timedelta(minutes=10):
            return USER_STATUS_UNREACHABLE

        if status.get(KEY_STATUS_LOCATION) == 'False':
            return USER_STATUS_LOCATIONOFF

    return USER_STATUS_SIGNEDIN

def set_user_signin_status(user_id, status, timestamp):
    if settings.DEBUG:
        raise Exception("Cannot use cache in developement")

    if not user_id:
        return
        
    key = KEY_STATUS + str(user_id)
    cache.hset(key, KEY_STATUS_SIGNIN, status)

    key = KEY_TIME_SIGNIN + str(user_id)
    cache.set(key, timestamp)

def set_user_log_status(user_id, team_id, status, timestamp):
    if settings.DEBUG:
        raise Exception("Cannot use cache in developement")

    if not user_id or not team_id:
        return
        
    key = KEY_LOG_STATUS + str(user_id) + "_" + str(team_id)
    cache.set(key, status)

    key = KEY_LOG_TIME + str(user_id) + "_" + str(team_id)
    cache.set(key, timestamp)

def get_user_log_status(user_id, team_id):
    if not user_id or not team_id:
        return
        
    key = KEY_LOG_STATUS + str(user_id) + "_" + str(team_id)
    return cache.get(key)

def get_user_signin_timestamp(user_id):
    if not user_id:
        return
        
    key = KEY_TIME_SIGNIN + str(user_id)
    return cache.get(key)

def set_user_location_status(user_id, status):
    if settings.DEBUG:
        raise Exception("Cannot use cache in developement")

    if not user_id:
        return
        
    key = KEY_STATUS + str(user_id)
    cache.hset(key, KEY_STATUS_LOCATION, status)

def get_user_location_status(user_id):
    if not user_id:
        return
        
    key = KEY_STATUS + str(user_id)
    return cache.hget(key, KEY_STATUS_LOCATION)

def update_phone_status(new_ping, last_ping, user_id):
    try:
        new_ping_time = new_ping.get('timestamp')
        last_ping_time = last_ping.get('timestamp')
        signin_time = get_user_signin_timestamp(user_id)

        if not new_ping_time or not last_ping_time or not signin_time:
            return

        new_ping_time = parse(new_ping_time)
        last_ping_time = parse(last_ping_time)
        signin_time = parse(signin_time)

        if new_ping_time - last_ping_time > timedelta(minutes=6) and new_ping_time - signin_time > timedelta(minutes=6):
            PhoneStatus.objects.create(action_type=PhoneStatus.ACTION_OFF, **_hydrate_user(last_ping))
            PhoneStatus.objects.create(action_type=PhoneStatus.ACTION_ON, **_hydrate_user(new_ping))
    except Exception as e:
        logger.error("Failed to update phone status for user_id: {0}".format(user_id),
            exc_info=True, extra={'new_ping': new_ping, 'last_ping': last_ping})

def update_location_status(new_ping, last_ping, user_id):
    try:
        current_location_status = get_user_location_status(user_id)
        if new_ping.get('latitude') == '0.0' and current_location_status != 'False':
            set_user_location_status(user_id, False)
            LocationStatus.objects.create(action_type=LocationStatus.ACTION_OFF, **_hydrate_user(last_ping))
        elif new_ping.get('latitude') != '0.0' and current_location_status == 'False':
            set_user_location_status(user_id, True)
            LocationStatus.objects.create(action_type=LocationStatus.ACTION_ON, **_hydrate_user(new_ping))
    except Exception as e:
        logger.error("Failed to update location status for user_id: {0}".format(user_id),
            exc_info=True, extra={'new_ping': new_ping})

def set_user_ping(user_id, new_ping):
    if settings.DEBUG:
        raise Exception("Cannot use cache in developement")

    if not user_id or not new_ping:
        return
    
    last_ping = get_user_ping(user_id)
    key = KEY_PING + str(user_id)
    cache.set(key, pickle.dumps(new_ping))
    if not last_ping:
        return

    update_phone_status(new_ping, last_ping, user_id)
    update_location_status(new_ping, last_ping, user_id)

def set_last_known_location(user_id, location_data):
    if settings.DEBUG:
        raise Exception("Cannot use cache in developement")

    if not user_id or not location_data:
        return
        
    key = KEY_LAST_LOCATION + str(user_id)
    cache.set(key, pickle.dumps(location_data))

def get_users_last_location(user_ids):
    if not user_ids:
        return []

    keys = [KEY_LAST_LOCATION+str(id) for id in user_ids]
    rows = cache.mget(keys)
    locations = [pickle.loads(row) for row in rows if row]
    for location in locations:
        if 'user' in location:
            location['user']['status'] = get_user_status(location['user']['id'])

    return locations

def get_user_last_location(user_id):
    if not user_id:
        return

    last_location = get_users_last_location([user_id])
    if last_location:
        last_location = last_location[0]
        return last_location

def set_group_members(group_id, members):
    if settings.DEBUG:
        raise Exception("Cannot use cache in developement")
        
    if not group_id or not members:
        return

    key = KEY_GROUP_MEMBERS + str(group_id)
    cache.delete(key)
    cache.sadd(key, *members)
