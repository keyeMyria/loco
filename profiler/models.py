# -*- coding: utf-8 -*-
from datadog import statsd
from django.contrib.auth.models import User
from django.db import models
from django.urls import resolve
from django.utils import timezone
from django.conf import settings

from loco.services.logger import logger


class ProfilingRecord(models.Model):
    user_id = models.CharField(max_length=10, blank=True, null=True)
    start_ts = models.DateTimeField(db_index=True, verbose_name="Request started at")
    end_ts = models.DateTimeField(db_index=True, verbose_name="Request ended at")
    duration = models.FloatField(verbose_name="Request duration (sec)")
    http_method = models.CharField(max_length=10)
    request_uri = models.URLField(verbose_name="Request path")
    request_data_get = models.TextField()
    request_data_post = models.TextField()
    remote_addr = models.CharField(max_length=100)
    view_name = models.CharField(db_index=True, max_length=200, blank=True, null=True)
    http_user_agent = models.CharField(max_length=400)
    http_referer = models.CharField(max_length=400, default=u"")
    response_status_code = models.IntegerField(db_index=True)
    record_type = models.CharField(max_length=10, default="api")
    response_content_length = models.IntegerField()

    def __init__(self, *args, **kwargs):
        super(ProfilingRecord, self).__init__(*args, **kwargs)
        self.tags = None

    def __unicode__(self):
        return u"Request for '%s' took %ss" % (self.request_uri, self.duration)

    def __str__(self):
        return str(self, 'utf-8')

    def __repr__(self):
        return (
            u"<ProfilingRecord id=%s, request_uri='%s', duration='%s'>" % (
                self.id,
                self.request_uri,
                self.duration
            )
        )

    def _record_timing(self, api_name):
        if settings.DEBUG:
            logger.info('Record Timing - %s:%s', api_name, self.duration)

        tags = ['%s:%s' % (k, self.tags.get(k)) for k in self.tags] if self.tags else None
        metric = 'apiserver.timing.%s' % api_name
        statsd.timing(metric, self.duration, tags=tags)

        metric_timing_all = 'apiserver.timing.all'
        statsd.timing(metric_timing_all, self.duration, tags=["api_name:%s" % api_name])

    def _record_success_count(self, api_name):
        metric = 'apiserver.success.%s' % api_name
        statsd.histogram(metric, 1)

    def _record_api_error(self, api_name, error_name):
        if settings.DEBUG:
            logger.info('Record Timing - %s:%s', api_name, error_name)

        metric = 'apiserver.errors.%s.%s' % (error_name, api_name)
        statsd.histogram(metric, 1)

        metric_all_errors = 'apiserver.errors.%s.all' % error_name
        statsd.histogram(metric_all_errors, 1, tags=["api_name:%s" % api_name])

    def save(self, *args, **kwargs):
        api_name = self.view_name
        if not api_name:
            return

        if api_name in ['TemplateView', 'content_data', 'dump_data', 'login_data']:
            return

        api_name = api_name.split('.')[-1]
        if 'v1' in self.view_name:
            api_name = 'v1_' + api_name

        api_name = api_name.replace(" ", "")
        api_name = api_name.replace("[", "__")
        api_name = api_name.replace("]", "__")

        if self.response_status_code == 200:
            self._record_timing(api_name)
        elif self.response_status_code == 599:
            self._record_api_error(api_name, 'timeout')
        elif self.response_status_code >= 500:
            self._record_api_error(api_name, '5xx')

    def start(self):
        """Set start_ts from current datetime."""
        self.start_ts = timezone.now()
        self.end_ts = None
        self.duration = None
        return self

    @property
    def elapsed(self):
        """Calculated time elapsed so far."""
        assert self.start_ts is not None, u"You must 'start' before you can get elapsed time."
        return (timezone.now() - self.start_ts).total_seconds()

    def set_request(self, request):
        """Extract values from HttpRequest and store locally."""
        self.request = request
        self.http_method = request.method
        self.request_uri = request.path

        try:
            resolution = resolve(request.path)
            self.view_name = resolution.view_name
        except Exception as e:
            print(e)

        self.request_data_get = request.GET
        # self.request_data_post = request.body
        self.request_data_post = ''
        self.http_user_agent = request.META.get('HTTP_USER_AGENT', u'')[:400]
        # we care about the domain more than the URL itself, so truncating
        # doesn't lose much useful information
        self.http_referer = request.META.get('HTTP_REFERER', u'')[:400]
        # X-Forwarded-For is used by convention when passing through
        # load balancers etc., as the REMOTE_ADDR is rewritten in transit
        self.remote_addr = (
            request.META.get('HTTP_X_FORWARDED_FOR')
            if 'HTTP_X_FORWARDED_FOR' in request.META
            else request.META.get('REMOTE_ADDR')
        )
        # NB you can't store AnonymouseUsers, so don't bother trying
        if hasattr(request, 'user') and request.user.is_authenticated():
            self.user_id = request.user.id
        return self

    def set_response(self, response):
        """Extract values from HttpResponse and store locally."""
        self.response = response
        self.response_status_code = response.status_code
        self.response_content_length = len(response.content)
        return self

    def stop(self):
        """Set end_ts and duration from current datetime."""
        assert self.start_ts is not None, u"You must 'start' before you can 'stop'"  # noqa
        self.end_ts = timezone.now()
        duration = (self.end_ts - self.start_ts).total_seconds()
        self.duration = round(duration, 2)
        if hasattr(self, 'response'):
            self.response['X-Profiler-Duration'] = self.duration
        return self

    def cancel(self):
        """Cancel the profile by setting is_cancelled to True."""
        self.start_ts = None
        self.end_ts = None
        self.duration = None
        self.is_cancelled = True
        return self

    def capture(self):
        """Call stop() and save() on the profile if is_cancelled is False."""
        if getattr(self, 'is_cancelled', False) is True:
            logger.debug(u"%r has been cancelled.", self)
            return self
        else:
            return self.stop().save()
