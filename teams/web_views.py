import json

from django.http import Http404, HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

from .models import TeamMembership

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
        }),
        "page_name": "dashboardpage",   
    }

    return render(request, "dashboard.html", context)