import json

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

@login_required
def teams(request):
    context = {
        'baseProps' : json.dumps({}),
        'pageProps': json.dumps({}),
        "page_name": "loginpage",   
    }

    return render(request, "teams.html", context)

def dashboard(request):
    context = {
        'baseProps' : json.dumps({}),
        'pageProps': json.dumps({}),
        "page_name": "dashboardpage",   
    }

    return render(request, "dashboard.html", context)