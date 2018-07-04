from dateutil.parser import parse
import pytz

from datetime import timedelta, datetime

from .models import UserLocation, UserStopLocation, UserAnalyzedLocation
from .filters import is_noise, is_stop_point, get_speed
import polyline, utils

def to_rich_polyline(locations):
    if not locations:
        return ''

    points = [
        [location.latitude, 
        location.longitude, 
        location.get_start_time().isoformat(),
        location.get_end_time().isoformat(),
        location.get_type()] for location in locations
    ]

    return polyline.encode_time_aware_polyline(points)
   
def merge_location_points(locations):
    if not locations:
        return

    latitude = 0
    longitude = 0
    accuracy = 0
    count = 0
    start_time = locations[0].timestamp
    end_time = locations[0].timestamp

    for location in locations:
        timestamp = location.timestamp
        if start_time > timestamp:
            start_time = timestamp
        if end_time < timestamp:
            end_time = timestamp

        if location.accuracy<25:
            latitude += location.latitude
            longitude += location.longitude
            accuracy += location.accuracy
            count += 1

    if count == 0 and len(locations):
        stop_point = locations[0]
    elif len(locations) < 5 or end_time-start_time < timedelta(minutes=10):
        stop_point = UserLocation()
        stop_point.latitude = latitude/count
        stop_point.longitude = longitude/count
        stop_point.timestamp = start_time
        stop_point.accuracy = accuracy/count
    else:
        stop_point = UserStopLocation()
        stop_point.latitude = latitude/count
        stop_point.longitude = longitude/count
        stop_point.timestamp = start_time
        stop_point.end_timestamp = end_time
        stop_point.accuracy = accuracy/count

    return stop_point

def process_special_locations(init, locations):
    if not locations:
        return []

    special_locations = []
    for j in range(init, len(locations)):
        test_location = locations[j]
        special_locations.append(test_location)
        if test_location.get_type() == UserLocation.LOCATION_TYPE:
            last_valid_location = test_location
            break

    return special_locations

def aggregate_pitstops(locations):
    if not locations:
        return []
        
    filtered_locations = []
    counter = 0

    special_locations = process_special_locations(counter, locations)
    if special_locations:
        filtered_locations += special_locations
        last_valid_location = filtered_locations[-1]
        counter += len(special_locations)

    stop_point_holder = []
    while counter < len(locations):
        test_location = locations[counter]
        last_location = locations[counter-1]
        counter += 1

        if test_location.get_type() != UserLocation.LOCATION_TYPE:
            if stop_point_holder:
                midpoint = merge_location_points(stop_point_holder)
                filtered_locations.append(midpoint)
                stop_point_holder = []

            special_locations = process_special_locations(counter-1, locations)
            if special_locations:
                filtered_locations += special_locations
                last_valid_location = filtered_locations[-1]
                counter += len(special_locations)

            continue
        elif is_stop_point(test_location, last_valid_location):
            if not stop_point_holder and filtered_locations:
                stop_point_holder.append(filtered_locations.pop())

            stop_point_holder.append(test_location)
        else:
            if stop_point_holder:
                midpoint = merge_location_points(stop_point_holder)
                filtered_locations.append(midpoint)
                stop_point_holder = []
            filtered_locations.append(test_location)
        
        last_valid_location = test_location

    if stop_point_holder:
        midpoint = merge_location_points(stop_point_holder)
        filtered_locations.append(midpoint)
        stop_point_holder = []

    return filtered_locations

def converge_stop_points(locations):
    if not locations:
        return

    latitude = 0
    longitude = 0
    accuracy = 0
    count = len(locations)

    for location in locations:
        latitude += location.latitude
        longitude += location.longitude
        accuracy += location.accuracy

    stop_point = UserStopLocation()
    stop_point.latitude = latitude/count
    stop_point.longitude = longitude/count
    stop_point.timestamp = locations[0].timestamp
    stop_point.end_timestamp = locations[-1].get_end_time()
    stop_point.accuracy = accuracy/count
    return stop_point

def collapse_stop_window(locations):
    if not locations:
        return

    location_window = []
    stop_points = []
    for location in locations:
        if location.get_type() == UserStopLocation.LOCATION_TYPE:
            stop_points.append(location)
            location_window = []
        else:
            location_window.append(location)

    if stop_points:
        location_window.insert(0, converge_stop_points(stop_points))

    return location_window

def re_aggregate_pitstdops(locations):
    if not locations:
        return []

    stop_points = [location for location in locations if location.get_type() == UserStopLocation.LOCATION_TYPE]
    last_stop_location = None
    stop_point_window = []
    results = []
    for location in stop_points:
        if not last_stop_location:
            last_stop_location = location
            continue

        distance = utils.get_distance(location, last_stop_location)
        time_diff = location.timestamp - last_stop_location.get_end_time()
        if time_diff <= timedelta(minutes=10) and distance < 120:
            # last_stop_location = merge_stop_points(location, last_stop_location)
            if not stop_point_window:
                stop_point_window.append(last_stop_location)
            stop_point_window.append(location)
            last_stop_location = location
        else:
            if stop_point_window:
                mid_point = merge_stop_points(stop_point_window)
                results.append(last_stop_location)
                stop_point_window = []
            else:
                results.append(last_stop_location)

            last_stop_location = location

    if stop_point_window:
        midpoint = merge_stop_points(stop_point_window)
        results.append(midpoint)
    elif last_stop_location:
        results.append(last_stop_location)

    return results

def re_aggregate_pitstops(locations):
    if not locations:
        return []

    last_stop_location = None
    stop_point_window = []
    results = []
    for location in locations:
        if location.get_type() != UserStopLocation.LOCATION_TYPE:
            if not stop_point_window:
                results.append(location)
                continue

            stop_point_window.append(location)    
        else:
            if not last_stop_location:
                last_stop_location = location
                stop_point_window.append(last_stop_location)
                continue

            distance = utils.get_distance(location, last_stop_location)
            time_diff = location.timestamp - last_stop_location.get_end_time()
            print (distance*1000, time_diff.seconds)
            if time_diff <= timedelta(minutes=15) and distance < 120:
                stop_point_window.append(location)
                last_stop_location = location
            else:
                if stop_point_window:
                    results += collapse_stop_window(stop_point_window)
                    stop_point_window = [location]
                    last_stop_location = location
                else:
                    raise Exception("Unexpected code flow")


    if stop_point_window:
        results += collapse_stop_window(stop_point_window)

    return results

def reduce_density(locations):
    results = []
    last_location = ''
    for location in locations:
        if not location.get_type() == UserLocation.LOCATION_TYPE:
            results.append(location)
            continue

        if not last_location:
            last_location = location
            results.append(location)
            continue

        if location.timestamp - last_location.timestamp > timedelta(seconds=20):
            results.append(location)
            last_location = location

    return results

def filter_noise(locations):
    if not locations:
        return []

    filtered_locations = [locations[0]]
    last_valid_location = locations[0]

    for i in range(1, len(locations)):
        test_location = locations[i]
        last_location = locations[i-1]
        noise_check = is_noise(test_location, last_valid_location)

        if not noise_check:
            filtered_locations.append(test_location)
            last_valid_location = test_location
        elif test_location.get_type() != UserLocation.LOCATION_TYPE:
            test_location.latitude = last_valid_location.latitude
            test_location.longitude = last_valid_location.longitude
            filtered_locations.append(test_location)
          

    return filtered_locations

def fetch_location_set(location_set, start_time, end_time):
    if not location_set:
        return

    locations = location_set.filter(
        timestamp__gte=start_time).filter(
        timestamp__lt=end_time).exclude(
        latitude__isnull=True).exclude(
        latitude=0)

    return [l for l in locations]

def get_user_locations(user, start_time, end_time):
    if not user or not start_time or not end_time:
        return ''

    locations = []
    locations += fetch_location_set(user.attendance_set, start_time, end_time)
    locations += fetch_location_set(user.checkin_set, start_time, end_time)
    locations += fetch_location_set(user.locationstatus_set, start_time, end_time)
    locations += fetch_location_set(user.phonestatus_set, start_time, end_time)
    locations += fetch_location_set(user.userlocation_set, start_time, end_time)
    locations.sort(key=lambda x: x.timestamp)
    return locations

def analyze_user_locations(user, start_time, return_polyline=True):
    if not user or not start_time:
        return ''

    end_time = start_time + timedelta(days=1)

    locations = get_user_locations(user, start_time, end_time)
    locations = filter_noise(locations)
    results = aggregate_pitstops(locations)
    if return_polyline:
        results = to_rich_polyline(locations)
        
    return results

def parse_localize_date(date):
    if not date:
        date = datetime.now()
    elif not isinstance(date, datetime):
        date = parse(date)

    if not date.tzinfo:
        timezone = pytz.timezone('Asia/Kolkata')
        date = timezone.localize(date)

    return date

def get_analyzed_user_location(user, date):
    date = parse_localize_date(date)
    timezone = pytz.timezone('Asia/Kolkata')
    if datetime.now(timezone) - date < timedelta(days=1, minutes=10):
        return (analyze_user_locations(user, date), False)

    is_cached = False
    try:
        polyline = UserAnalyzedLocation.objects.get(user=user, date=date.date()).polyline
        is_cached = True
    except UserAnalyzedLocation.DoesNotExist:
        polyline = analyze_user_locations(user, date)
        try:
            UserAnalyzedLocation.objects.create(
                user=user,
                date=date.date(),
                polyline=polyline)
        except:
            pass

    return (polyline, is_cached)

def get_analyzed_user_locations(user, start_date, end_date):
    results = []
    rows = UserAnalyzedLocation.objects.filter(user=user,
        date__gte=start_date, date__lte=end_date)
    locations = {str(row.date):row.polyline for row in rows}
    dates_found = locations.keys()
    date_counter = start_date
    while date_counter <= end_date:
        str_date_counter = str(date_counter.date())
        if str_date_counter in dates_found:
            polyline = locations[str_date_counter]
        else:
            polyline, is_cached = get_analyzed_user_location(user, date_counter)

        results.append((str_date_counter, polyline))
        date_counter += timedelta(days=1)

    return results

def remove_location_events(input_polyline):
    if not input_polyline:
        return ''

    points = polyline.decode_time_aware_polyline(input_polyline)
    points = [p for p in points if p[-1] != UserLocation.LOCATION_TYPE]
    return polyline.encode_time_aware_polyline(points)