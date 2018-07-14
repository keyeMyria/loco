import requests, urllib
from django.conf import settings
from logger import logger
from profiler.models import ProfilingRecord


METRIC = "solr_"

if settings.DEBUG:
    SOLR_HOST = 'http://anuvad.io:8983/solr/'
else:
    SOLR_HOST = 'http://localhost:8983/solr/'


def process_solr_response(response, query):
    if response.status_code >=400:
        logger.error("Solr API failure: %s \nResponse - %s", query, response.content, exc_info=True, extra={'response': response,})
        return None

    data = None
    count = None
    response = response.json()
    if 'response' in response:
        response = response.get('response')
        if 'numFound' in response:
            count = response.get('numFound')

        if 'docs' in response:
            data = response.get('docs')

    return (data, count)

def get_query_solr(query, query_name='', metric='solr_all'):
    try:
        profiler = ProfilingRecord().start(metric)
        response = requests.get(query)
        profiler.stop(response.status_code)
        return process_solr_response(response, query)
    except:
        profiler.stop(500)
        return None

def get_group_solr(query, group_field, query_name='', metric='solr_all'):
    try:
        profiler= ProfilingRecord().start(metric)
        response = requests.get(query)
        profiler.stop(response.status_code)
    except:
        profiler.stop(500)
        logger.error("Solr API failure: %s", query, exc_info=True, extra={'response': response, 'group': group})
        return None

    if response.status_code >=400:
        logger.error("Solr API failure: %s", query, exc_info=True, extra={'response': response,})
        return None

    response = response.json()
    if 'grouped' in response:
        if 'customer_user_id' in response.get('grouped'):
            if 'groups' in response.get('grouped').get(group_field):
                return response.get('grouped').get(group_field).get('groups')[0].get('doclist').get('docs')

def get_facet_solr(query, facet, query_name='', metric='solr_all'):
    try:
        profiler= ProfilingRecord().start(metric)
        response = requests.get(query)
        profiler.stop(response.status_code)
    except:
        profiler.stop(500)
        logger.error("Solr API failure: %s", query, exc_info=True, extra={'response': response, 'facet': facet})
        return None

    if response.status_code >=400:
        logger.error("Solr API failure: %s", query, exc_info=True, extra={'response': response,})
        return None

    response = response.json()
    if 'facet_counts' in response:
        if 'facet_fields' in response.get('facet_counts'):
            return response.get('facet_counts').get('facet_fields').get(facet)

def get_stats_solr(query, stats_field, query_name='', metric='solr_all'):
    try:
        profiler= ProfilingRecord().start(metric)
        response = requests.get(query)
        profiler.stop(response.status_code)
    except:
        profiler.stop(500)
        logger.error("Solr API failure: %s", query, exc_info=True, extra={'response': response})
        return None

    if response.status_code >=400:
        logger.error("Solr API failure: %s", query, exc_info=True, extra={'response': response,})
        return None

    response = response.json()
    if 'stats' in response:
        if 'stats_fields' in response.get('stats'):
            return response.get('stats').get('stats_fields').get(stats_field)

def get_facet_query_solr(query, query_name='', metric='solr_all'):
    try:
        profiler= ProfilingRecord().start(metric)
        response = requests.get(query)
        profiler.stop(response.status_code)
    except:
        profiler.stop(500)
        logger.error("Solr API failure: %s", query, exc_info=True, extra={'response': response, 'facet': facet})
        return None

    if response.status_code >=400:
        logger.error("Solr API failure: %s", query, exc_info=True, extra={'response': response,})
        return None

    response = response.json()
    if 'facet_counts' in response:
        if 'facet_queries' in response.get('facet_counts'):
            return response.get('facet_counts').get('facet_queries')

def update_item_index():
    url1 = SOLR_HOST + "item/dataimport?command=delta-import"
    url2 = SOLR_HOST + "admin/cores?action=RELOAD&core=item"
    metric = METRIC + "update_item_index"

    try:
        profiler = ProfilingRecord().start(metric)
        response1 = requests.get(url1)
        if response1.status_code != 200:
            profiler.stop(response1.status_code)
        else:
            response2 = requests.get(url2)
            profiler.stop(response2.status_code)
    except Exception as e:
        raise e
        profiler.stop(500)
        return None

def update_merchant_index():
    url1 = SOLR_HOST + "merchant/dataimport?command=delta-import"
    url2 = SOLR_HOST + "admin/cores?action=RELOAD&core=merchant"
    metric = METRIC + "update_merchant_index"

    try:
        profiler = ProfilingRecord().start(metric)
        response1 = requests.get(url1)
        if response1.status_code != 200:
            profiler.stop(response1.status_code)
        else:
            response2 = requests.get(url2)
            profiler.stop(response2.status_code)
    except:
        profiler.stop(500)
        return None

def search_merchants(team_id, search_options, start, limit):
    query = SOLR_HOST + 'merchant/select?q=[[QUERY]]&wt=json&start=[[START]]&rows=[[LIMIT]]'
    query = query.replace("[[START]]", str(start)).replace("[[LIMIT]]", str(limit))

    search_text = search_options.get('query')
    if search_text:
        search_text = "*" + str(search_text) + "*"
    else:
        search_text = "*"

    query = query.replace("[[QUERY]]", search_text)

    filters = search_options.get('filters')
    if filters:
        filters += " AND team_id:" + str(team_id)
    else:
        filters = "team_id:" + str(team_id)

    query += "&fq="+filters
    data, count = get_query_solr(query)
    return {'data': data, 'count': count}

def search_items(team_id, search_options, start, limit):
    query = SOLR_HOST + 'item/select?q=[[QUERY]]&wt=json&start=[[START]]&rows=[[LIMIT]]'
    query = query.replace("[[START]]", str(start)).replace("[[LIMIT]]", str(limit))

    search_text = search_options.get('query')
    if search_text:
        search_text = "*" + str(search_text) + "*"
    else:
        search_text = "*"

    query = query.replace("[[QUERY]]", search_text)

    filters = search_options.get('filters')
    if filters:
        filters += " AND team_id:" + str(team_id)
    else:
        filters = "team_id:" + str(team_id)

    query += "&fq="+filters
    data, count = get_query_solr(query)
    return {'data': data, 'count': count}

def search_tasks(team_id, search_options, start, limit):
    query = SOLR_HOST + 'task/select?q=[[QUERY]]&wt=json&start=[[START]]&rows=[[LIMIT]]'
    query = query.replace("[[START]]", str(start)).replace("[[LIMIT]]", str(limit))

    search_text = search_options.get('query')
    if search_text:
        search_text = "*" + str(search_text) + "*"
    else:
        search_text = "*"

    query = query.replace("[[QUERY]]", search_text)

    filters = search_options.get('filters')
    if filters:
        filters += " AND team_id:" + str(team_id)
    else:
        filters = "team_id:" + str(team_id)

    query += "&fq="+filters
    data, count = get_query_solr(query)
    return {'data': data, 'count': count}