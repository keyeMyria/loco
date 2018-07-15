from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404

from loco.services import solr
from teams.models import Team

@login_required
def tasks_csv(request, team_id):
    team = Team.objects.get(id=team_id)
    if not team.is_member(request.user) and not team.is_admin_account(request.user):
        raise Http404

    PARAM_QUERY = 'query'
    PARAM_FILTERS = 'filters'
    search_options = {}
    query = request.GET.get(PARAM_QUERY)
    if query:
        search_options['query'] = query

    filters = request.GET.get(PARAM_FILTERS, '')
    if filters:
        search_options['filters'] = filters

    tasks = solr.csv_tasks(team.id, search_options)
    response = HttpResponse(tasks)
    response['content_type'] = 'application/csv'
    response['Content-Disposition'] = 'attachment;filename=tasks.csv'
    return response