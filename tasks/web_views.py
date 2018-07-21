import json
from decimal import Decimal
from datetime import datetime, timedelta
from io import BytesIO
from xhtml2pdf import pisa

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404
from django.shortcuts import render, redirect
from django.template.loader import get_template

from loco.services import solr
from loco import utils

from . import models

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

    start, limit = utils.get_query_start_limit_dj(request)
    tasks = solr.csv_tasks(team.id, search_options, start, limit)
    response = HttpResponse(tasks)
    response['content_type'] = 'application/csv'
    response['Content-Disposition'] = 'attachment;filename=tasks.csv'
    return response

def render_to_pdf(template_src, context_dict={}):
    template = get_template(template_src)
    html  = template.render(context_dict)
    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html.encode("ISO-8859-1")), result)
    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type='application/pdf')
    return None

@login_required
def tasks_pdf(request, task_id):
    task = models.TaskSnapshot.objects.get(task__id=task_id)
    order_details = json.loads(task.content)
    created = datetime.strptime(
        order_details['created'],
        "%Y-%m-%dT%H:%M:%S.%fZ"
    )
    created += timedelta(hours=5, minutes=30)
    order_details['created'] = created.strftime('%b %d %Y, %-I:%M %p')

    for item in order_details['content']['items']:
        item['item']['price'] = Decimal(item['item']['price'])
        item['total'] = item['item']['price']*item['quantity']

    context = {
        'task': order_details,
        'pagesize':'A4',   
    }

    pdf = render_to_pdf('task_pdf.html', context)
    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment;filename=order_{}.pdf'.format(task_id)
    return response