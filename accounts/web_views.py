import json
from django.shortcuts import render, redirect


def home(request):
    context = {
        'baseProps' : json.dumps({}),
        'pageProps': json.dumps({}),
        "page_name": "homepage",   
    }

    return render(request, "home.html", context)