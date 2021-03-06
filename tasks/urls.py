from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns

from . import views, web_views


urlpatterns = [
	url(r'^(?P<task_id>[0-9]+)/$', views.TaskDetail.as_view()),
	url(r'^(?P<task_id>[0-9]+)/history$', views.TaskHistoryList.as_view()),
	url(r'^(?P<task_id>[0-9]+)/pdf$', web_views.tasks_pdf),
]

urlpatterns = format_suffix_patterns(urlpatterns)
