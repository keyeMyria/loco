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
            print('Record Timing - %s:%s', api_name, self.duration)

        metric = 'apiserver.timing.%s' % api_name
        statsd.timing(metric, self.duration)
        metric_timing_all = 'apiserver.timing.all'
        statsd.timing(metric_timing_all, self.duration, tags=["api_name:%s" % api_name])

    def _record_success_count(self, api_name):
        if settings.DEBUG:
            print('Record Success - %s:%s', api_name)

        metric = 'apiserver.success.%s' % api_name
        statsd.histogram(metric, 1)
        metric_success_all = 'apiserver.success.all'
        statsd.histogram(metric_success_all, 1, tags=["api_name:%s" % api_name])


    def _record_api_error(self, api_name, error_name):
        if settings.DEBUG:
            print('Record Error - %s:%s', api_name, error_name)

        metric = 'apiserver.errors.%s.%s' % (error_name, api_name)
        statsd.histogram(metric, 1)
        metric_all_errors = 'apiserver.errors.%s.all' % error_name
        statsd.histogram(metric_all_errors, 1, tags=["api_name:%s" % api_name])

    def save(self, *args, **kwargs):
        api_name = self.view_name
        if not api_name:
            return

        if self.response_status_code == 200:
            self._record_timing(api_name)
            self._record_success_count(api_name)
        elif self.response_status_code == 599:
            self._record_api_error(api_name, 'timeout')
        elif self.response_status_code >= 500:
            self._record_api_error(api_name, '5xx')
        elif self.response_status_code >= 400:
            self._record_api_error(api_name, '4xx')

    def start(self, metric='all'):
        self.start_ts = timezone.now()
        self.end_ts = None
        self.duration = None
        self.view_name = metric
        return self

    def stop(self, response_status_code = 200, api_name=''):
        if not self.start_ts:
            return self

        if api_name:
            self.view_name = api_name

        self.end_ts = timezone.now()
        duration = (self.end_ts - self.start_ts).total_seconds()
        self.duration = round(duration, 2)
        self.response_status_code = response_status_code
        self.save()
        return self