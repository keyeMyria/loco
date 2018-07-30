from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404

from loco.services import solr
from loco import utils
from teams.models import Team

@login_required
def items_download(request, team_id):
    team = Team.objects.get(id=team_id)
    if not team.is_member(request.user) and not team.is_admin_account(request.user):
        raise Http404

    PARAM_QUERY = 'query'
    PARAM_FILTERS = 'filters'
    PARAM_FORMAT = 'format'

    download_format = request.GET.get(PARAM_FORMAT, 'csv')
    search_options = {}
    query = request.GET.get(PARAM_QUERY)
    if query:
        search_options['query'] = query

    filters = request.GET.get(PARAM_FILTERS, '')
    if filters:
        search_options['filters'] = filters

    start, limit = utils.get_query_start_limit_dj(request)
    items = solr.download_items(team.id, search_options, start, limit, download_format)
    response = HttpResponse(items)
    response['content_type'] = 'application/{0}'.format(download_format)
    response['Content-Disposition'] = 'attachment;filename=items.{0}'.format(download_format)
    return response

@login_required
def merchants_download(request, team_id):
    team = Team.objects.get(id=team_id)
    if not team.is_member(request.user) and not team.is_admin_account(request.user):
        raise Http404

    PARAM_QUERY = 'query'
    PARAM_FILTERS = 'filters'
    PARAM_FORMAT = 'format'

    download_format = request.GET.get(PARAM_FORMAT, 'csv')
    search_options = {}
    query = request.GET.get(PARAM_QUERY)
    if query:
        search_options['query'] = query

    filters = request.GET.get(PARAM_FILTERS, '')
    if filters:
        search_options['filters'] = filters

    start, limit = utils.get_query_start_limit_dj(request)
    merchants = solr.download_merchants(team.id, search_options, start, limit, download_format)
    response = HttpResponse(merchants)
    response['content_type'] = 'application/{0}'.format(download_format)
    response['Content-Disposition'] = 'attachment;filename=merchants.{0}'.format(download_format)
    return response