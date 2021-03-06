import datetime, pytz
from dateutil.parser import parse


def is_int(s):
    if s is None:
        return False

    try:
        int(s)
        return True
    except ValueError:
        return False

def validate_otp(otp):
    if not otp:
        return False

    otp = str(otp)
    if len(otp) != 4 or not is_int(otp):
        return False

    return True

def validate_phone(phone):
    if not phone:
        return False

    phone = str(phone)
    if len(phone) != 10 or not is_int(phone):
        return False

    return True

def get_query_datetime(request, default=None):
    PARAM_DATE = 'date'
    date = request.query_params.get(PARAM_DATE)

    try:
        timestamp = parse(date)
        tz = pytz.timezone('Asia/Kolkata')
        return tz.localize(timestamp)
    except:
        pass

    return default

def get_query_date(request, default=None):
    timestamp = get_query_datetime(request, default)
    if timestamp:
        return timestamp.date()

    return timestamp

def get_query_start_limit(request):
    PARAM_START = 'start'
    PARAM_LIMIT = 'limit'
    start = request.query_params.get(PARAM_START, 0)
    limit = request.query_params.get(PARAM_LIMIT, 10)
    return (int(start), int(limit))

def get_query_start_limit_dj(request):
    PARAM_START = 'start'
    PARAM_LIMIT = 'limit'
    start = request.GET.get(PARAM_START, 0)
    limit = request.GET.get(PARAM_LIMIT, 10)
    return (int(start), int(limit))

def get_csv_url(entity, team_id, start, total_count, query='', filters=''):
    url = "/web/teams/{0}/{1}/download/?start={2}&limit={3}&format=csv".format(
        team_id, entity, start, total_count)

    if query:
        url += "&query=" + query

    if filters:
        url += "&filters=" + filters

    return url