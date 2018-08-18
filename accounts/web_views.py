import json

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

@login_required
def home(request):
    return redirect('/web/teams')

def login(request):
    if request.user.is_authenticated:
        redirect("/")

    context = {
        'baseProps' : json.dumps({}),
        'pageProps': json.dumps({}),
        "page_name": "loginpage",   
    }

    return render(request, "login.html", context)

def signup(request):
    if request.user.is_authenticated:
        redirect("/")

    context = {
        'baseProps' : json.dumps({}),
        'pageProps': json.dumps({}),
        "page_name": "signuppage",   
    }

    return render(request, "signup.html", context)

def password(request):
    if request.user.is_authenticated:
        redirect("/")

    if not request.user.is_active:
        redirect('/web/signup/')

    context = {
        'baseProps' : json.dumps({}),
        'pageProps': json.dumps({}),
        "page_name": "passwordpage",   
    }

    return render(request, "password.html", context)