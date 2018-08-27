import requests, time
from datadog import statsd

def _record_timing(service_name, duration):
    print ("duration {0}:{1}".format(service_name, duration))
    metric = 'availability.timing.%s' % service_name
    statsd.timing(metric, duration)

def _record_success(service_name):
    print ("success {0}".format(service_name))
    metric = 'availability.success.%s' % service_name
    statsd.histogram(metric, 1)

def _record_errors(service_name):
    print ("Error {0}".format(service_name))
    metric = 'availability.errors.%s' % service_name
    statsd.histogram(metric, 1)

def check_solr():
    SERVICE_NAME = 'solr'
    start = time.time()
    try:
        url = "http://anuvad.io:8983/solr/task/select/?q=*:*&fq=team_id:61"
        response = requests.get(url)
        if response.status_code != 200:
            _record_errors(SERVICE_NAME)

        count = None
        response = response.json()
        if 'response' in response:
            response = response.get('response')
            if 'numFound' in response:
                count = response.get('numFound')
                if not count > 60:
                    _record_errors(SERVICE_NAME)
    except:
        _record_errors(SERVICE_NAME)

    _record_success(SERVICE_NAME)
    duration = time.time() - start
    _record_timing(SERVICE_NAME, duration)

def main():
    SERVICE_NAME = 'all'
    start = time.time()
    check_solr()
    duration = time.time() - start
    _record_timing(SERVICE_NAME, duration)

main()