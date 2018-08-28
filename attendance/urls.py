from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns

from . import views


urlpatterns = [
	url(r'^leaves/(?P<leave_id>[0-9]+)/$', views.LeaveDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
