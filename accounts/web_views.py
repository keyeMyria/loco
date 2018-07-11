import json

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

@login_required
def home(request):
    return redirect('/web/teams')

def login(request):
    context = {
        'baseProps' : json.dumps({}),
        'pageProps': json.dumps({}),
        "page_name": "loginpage",   
    }

    return render(request, "login.html", context)