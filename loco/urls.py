"""loco URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from accounts import views, web_views as accounts_web_views
from teams import web_views as teams_web_views
from crm import web_views as crm_web_views
from tasks import web_views as tasks_web_views
from teams import web_views as teams_web_views
from attendance import web_views as attendance_web_views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
]

#API urls
urlpatterns += [
    url(r'^users/', include('accounts.urls')),
    url(r'^teams/', include('teams.urls')),
    url(r'^sapi/', include('morty.urls')),
    url(r'^locations/', include('locations.urls')),
    url(r'^groups/', include('groups.urls')),
    url(r'^tasks/', include('tasks.urls')),
    url(r'^crm/', include('crm.urls')),
    url(r'^attendance/', include('attendance.urls')),
    url(r'^dump', views.UserDumpView.as_view()),
    url(r'^download', views.get_download_link),
]


#Web urls
urlpatterns += [
    url(r'^/?$', accounts_web_views.home),
    url(r'^web/login/?$', accounts_web_views.login),
    url(r'^web/signup/?$', accounts_web_views.signup),
    url(r'^web/password/?$', accounts_web_views.password),
    url(r'^web/teams/?$', teams_web_views.teams),
    url(r'^web/teams/create/?$', teams_web_views.teams),
    url(r'^web/teams/join/?$', teams_web_views.teams),
    url(r'^web/teams/(?P<team_id>[0-9]+)/items/download/$', crm_web_views.items_download),
    url(r'^web/teams/(?P<team_id>[0-9]+)/merchants/download/$', crm_web_views.merchants_download),
    url(r'^web/teams/(?P<team_id>[0-9]+)/tasks/download/$', tasks_web_views.tasks_download),
    url(r'^web/teams/(?P<team_id>[0-9]+)/logs/download/$', teams_web_views.user_logs_download),
    url(r'^web/teams/(?P<team_id>[0-9]+)/attendance/download/$', attendance_web_views.user_attendance_download),
    url(r'^web/teams/(?P<team_id>[0-9]+)/plans/download/$', teams_web_views.user_plans_download),
    url(r'^web/teams/(?P<team_id>[^/]+)/(.*)?$', teams_web_views.dashboard),
]


if settings.DEBUG:
    urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + urlpatterns