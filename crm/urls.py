from django.conf.urls import url, include
from rest_framework.urlpatterns import format_suffix_patterns

from . import views


urlpatterns = [
	url(r'^merchants/(?P<merchant_id>[0-9]+)/$', views.MerchantDetail.as_view()),
	url(r'^items/(?P<item_id>[0-9]+)/$', views.ItemDetail.as_view()),
	url(r'^states/$', views.StateList.as_view()),
	url(r'^cities/$', views.CityList.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
