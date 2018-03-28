from dateutil.parser import parse
import pytz

from datetime import timedelta

from .models import UserLocation, UserStopLocation, UserAnalyzedLocation
from .filters import is_noise, is_stop_point
import polyline

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
   
def merge_stop_points(locations):
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

    if count == 0:
        count = 1

    if count < 5 or end_time-start_time < timedelta(minutes=10):
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
    filtered_locations = []
    counter = 0

    special_locations = process_special_locations(counter, locations)
    if special_locations:
        filtered_locations += special_locations
        last_valid_location = filtered_locations[-1]
        counter += len(special_locations) + 1

    stop_point_holder = []
    while counter < len(locations):
        test_location = locations[counter]
        last_location = locations[counter-1]
        counter += 1

        if test_location.get_type() != UserLocation.LOCATION_TYPE:
            if stop_point_holder:
                midpoint = merge_stop_points(stop_point_holder)
                filtered_locations.append(midpoint)
                stop_point_holder = []

            special_locations = process_special_locations(counter-1, locations)
            if special_locations:
                filtered_locations += special_locations
                last_valid_location = filtered_locations[-1]
                counter += len(special_locations) + 1

            continue
        elif is_stop_point(test_location, last_valid_location):
            if not stop_point_holder and filtered_locations:
                stop_point_holder.append(filtered_locations.pop())

            stop_point_holder.append(test_location)
        else:
            if stop_point_holder:
                midpoint = merge_stop_points(stop_point_holder)
                filtered_locations.append(midpoint)
                stop_point_holder = []
            filtered_locations.append(test_location)
        
        last_valid_location = test_location

    if stop_point_holder:
        midpoint = merge_stop_points(stop_point_holder)
        filtered_locations.append(midpoint)
        stop_point_holder = []

    return filtered_locations

def filter_noise(locations):
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

def fetch_location_set(location_set, start_time):
    if not location_set:
        return

    end_time = start_time + timedelta(days=1)

    locations = location_set.filter(
        timestamp__gte=start_time).filter(
        timestamp__lt=end_time).exclude(
        latitude__isnull=True).exclude(
        latitude=0)

    return [l for l in locations]

def analyze_user_locations(user, timestamp):
    locations = []

    locations += fetch_location_set(user.attendance_set, timestamp)
    locations += fetch_location_set(user.checkin_set, timestamp)
    locations += fetch_location_set(user.locationstatus_set, timestamp)
    locations += fetch_location_set(user.phonestatus_set, timestamp)
    locations += fetch_location_set(user.userlocation_set, timestamp)

    locations.sort(key=lambda x: x.timestamp)
    locations = filter_noise(locations)
    locations = aggregate_pitstops(locations)
    polyline = to_rich_polyline(locations)
    return polyline

def get_analyzed_user_locations(user, date):
    timezone = pytz.timezone('Asia/Kolkata')
    date = parse(date)
    date = timezone.localize(date)
    try:
        polyline = UserAnalyzedLocation.objects.get(user=user, date=date.date()).polyline
    except UserAnalyzedLocation.DoesNotExist:
        polyline = analyze_user_locations(user, date)
        UserAnalyzedLocation.objects.create(
            user=user,
            date=date.date(),
            polyline=polyline)

    return polyline


