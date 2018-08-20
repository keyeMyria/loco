import json, io, csv

from django.http import Http404, HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

from .models import Team, TeamMembership, UserLog, TourPlan

from loco import utils

@login_required
def teams(request):
    context = {
        'baseProps' : json.dumps({}),
        'pageProps': json.dumps({}),
        "page_name": "loginpage",   
    }

    return render(request, "teams.html", context)

@login_required
def dashboard(request, team_id):
    if not team_id:
        raise Http404

    membership = TeamMembership.objects.get(team__id=team_id, user=request.user)
    if membership.role != TeamMembership.ROLE_ADMIN:
        return HttpResponse("You are not allowed to view this page. Please ask team admin to grant you admin permission in order to continue")
    
    team = membership.team
    context = {
        'baseProps' : json.dumps({}),
        'pageProps': json.dumps({
            "team_id": team.id,
            "team_name": team.name,
            "team_code": team.code,
        }),
        "page_name": "dashboardpage",   
    }

    return render(request, "dashboard.html", context)

@login_required
def user_logs_download(request, team_id):
    PARAM_USER_ID = "user"
    PARAM_FORMAT = "format"
    team = Team.objects.get(id=team_id)
    if not team.is_member(request.user) and not team.is_admin_account(request.user):
        raise Http404

    download_format = request.GET.get(PARAM_FORMAT, 'csv')
    start, limit = utils.get_query_start_limit_dj(request)
    if limit > 400:
        limit = 400

    user_id = request.GET.get(PARAM_USER_ID)
    logs = UserLog.objects.filter(user__id=user_id, team=team)[start:limit]
    output = io.BytesIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Action"])
    for log in logs:
        writer.writerow([log.created.strftime("%Y-%m-%d %H:%M"), log.action_type])

    output = output.getvalue()

    response = HttpResponse(output)
    response['content_type'] = 'application/{0}'.format(download_format)
    response['Content-Disposition'] = 'attachment;filename=attendance.{0}'.format(download_format)
    return response

@login_required
def user_plans_download(request, team_id):
    PARAM_USER_ID = "user"
    PARAM_FORMAT = "format"
    team = Team.objects.get(id=team_id)
    if not team.is_member(request.user) and not team.is_admin_account(request.user):
        raise Http404

    download_format = request.GET.get(PARAM_FORMAT, 'csv')
    start, limit = utils.get_query_start_limit_dj(request)
    if limit > 400:
        limit = 400

    user_id = request.GET.get(PARAM_USER_ID)
    plan = TourPlan.objects.filter(user__id=user_id, team=team)[start:limit]
    output = io.BytesIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Action"])
    for plan in plan:
        writer.writerow([plan.dated, plan.data])

    response = HttpResponse(output.getvalue())
    response['content_type'] = 'application/{0}'.format(download_format)
    response['Content-Disposition'] = 'attachment;filename=plans.{0}'.format(download_format)
    return response