import utils
from datetime import timedelta

NOISE_TIME = 10
NOISE_DISTANCE = 0.010
NOISE_SPEED = 170
NOISE_ACCURACY = 200

def is_time_noise(test_location, last_location):
    return (test_location.timestamp - last_location.timestamp).total_seconds() < NOISE_TIME

def is_distance_noise(test_location, last_location):
    return utils.get_distance(test_location, last_location) < NOISE_DISTANCE

def is_less_accurate(test_location):
    return test_location.accuracy > NOISE_ACCURACY

def is_speed_noise(test_location, last_location):
    distance =  utils.get_distance(test_location, last_location)
    time = test_location.timestamp - last_location.timestamp
    if time.total_seconds() == 0:
        return True

    speed = (distance*60*60)/time.total_seconds()
    return speed > NOISE_SPEED

# def is_history_noise(test_location, last_valid_location, last_location):
#     distance =  utils.get_distance(test_location, last_valid_location)
#     time = test_location.timestamp - last_location.timestamp
#     if time.total_seconds() == 0:
#         return True

#     speed = (distance, time.total_seconds(), (distance*60*60)/time.total_seconds())
#     if speed < 100:
#         return False

#     distance =  utils.get_distance(test_location, last_location)
#     distance_valid =  utils.get_distance(test_location, last_valid_location)
#     return distance_valid > 5*distance
 
def get_speed(test_location, last_location):
    distance =  utils.get_distance(test_location, last_location)
    time = test_location.timestamp - last_location.timestamp
    if time.total_seconds() == 0:
        return True

    return (distance, time.total_seconds(), (distance*60*60)/time.total_seconds())

def is_closer_to_noise(test_location, last_valid_location, last_location):
    distance =  utils.get_distance(test_location, last_location)
    distance_valid =  utils.get_distance(test_location, last_valid_location)
    return distance_valid > 5*distance
 

def is_noise(test_location, last_location):
    return is_time_noise(test_location, last_location) or is_distance_noise(test_location, last_location) or is_speed_noise(test_location, last_location) or is_less_accurate(test_location)

def is_stop_point(test_location, last_location):
    distance =  utils.get_distance(test_location, last_location)
    time = test_location.timestamp - last_location.timestamp
    distance = distance - (test_location.accuracy + last_location.accuracy)/1000

    if time.total_seconds() == 0:
        return True
        
    speed = (distance*60*60)/time.total_seconds()
    return speed < 3

def are_close_stop_points(test_location, last_location):
    distance = utils.get_distance(test_location, last_location)
    time_diff = test_location.timestamp - last_location.get_end_time()
    return time_diff <= timedelta(minutes=15) and distance < .120
