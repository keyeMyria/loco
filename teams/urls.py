from __future__ import absolute_import, unicode_literals

from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns

from . import views
from locations import views as location_views
from groups import views as groups_views
from tasks import views as tasks_views
from crm import views as crm_views


urlpatterns = [
	url(r'^$', views.TeamList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/$', views.TeamDetail.as_view()),
	url(r'^(?P<team_id>[0-9]+)/chats/$', views.get_chats),
	url(r'^join/$', views.join_team),
	url(r'^(?P<team_id>[0-9]+)/status/$', views.TeamMembershipStatus.as_view()),
	url(r'^(?P<team_id>[0-9]+)/members/$', views.TeamMembershipList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/members/(?P<user_id>[0-9]+)/$', views.TeamMemberDetail.as_view()),
	url(r'^(?P<team_id>[0-9]+)/memberships/(?P<user_id>[0-9]+)/$', views.TeamMembershipDetail.as_view()),
	url(r'^(?P<team_id>[0-9]+)/memberships/search/$', views.TeamMembershipSearch.as_view()),
	url(r'^(?P<team_id>[0-9]+)/checkins/$', views.CheckinList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/checkins/(?P<checkin_id>[0-9]+)$', views.CheckinDetail.as_view()),
	url(r'^(?P<team_id>[0-9]+)/events/$', views.EventList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/users/(?P<user_id>[0-9]+)/events/$', views.get_user_events),
	url(r'^(?P<team_id>[0-9]+)/users/(?P<user_id>[0-9]+)/locations/$', location_views.UserLocationList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/users/(?P<user_id>[0-9]+)/locations1/$', location_views.UserLocationList1.as_view()),
	url(r'^(?P<team_id>[0-9]+)/users/(?P<user_id>[0-9]+)/attendance/$', location_views.UserAttendanceList.as_view()),
    url(r'^(?P<team_id>[0-9]+)/media$', views.user_media_upload),
    url(r'^(?P<team_id>[0-9]+)/media/checkins$', views.checkin_media_upload),
	url(r'^(?P<team_id>[0-9]+)/subscriptions/$', location_views.LocationSubscriptionList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/threads/$', views.MessagesList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/threads/(?P<thread_id>.+)$', views.MessagesDetail.as_view()),
	url(r'^(?P<team_id>[0-9]+)/groups/$', groups_views.GroupList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/logs/$', views.UserLogList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/sync/$', views.TeamSync.as_view()),
	url(r'^(?P<team_id>[0-9]+)/plans/$', views.TourPlanList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/plans/(?P<plan_id>[0-9]+)$', views.TourPlanDetail.as_view()),
	url(r'^(?P<team_id>[0-9]+)/tasks/$', tasks_views.TaskList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/tasks/files/$', tasks_views.task_media_upload),
	url(r'^(?P<team_id>[0-9]+)/tasks/search/$', tasks_views.TaskSearch.as_view()),
	url(r'^(?P<team_id>[0-9]+)/merchants/$', crm_views.MerchantList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/merchants/upload/$', crm_views.MerchantUpload.as_view()),
	url(r'^(?P<team_id>[0-9]+)/merchants/search/$', crm_views.MerchantSearch.as_view()),
	url(r'^(?P<team_id>[0-9]+)/items/$', crm_views.ItemList.as_view()),
	url(r'^(?P<team_id>[0-9]+)/items/upload/$', crm_views.ItemUpload.as_view()),
	url(r'^(?P<team_id>[0-9]+)/items/search/$', crm_views.ItemSearch.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
