# -*- coding: utf-8 -*-
from django.contrib.auth.models import AnonymousUser
from django.urls import resolve
from django.utils.deprecation import MiddlewareMixin

from .models import ProfilingRecord



class ProfilingMiddleware(MiddlewareMixin):

    def match_rules(self, request, rules):
        user = getattr(request, 'user', AnonymousUser())
        return [r for r in rules if r.match_uri(request.path) and r.match_user(user)]  # noqa

    def process_request(self, request):
        request.profiler = ProfilingRecord().start()

    def process_response(self, request, response):
        assert getattr(request, 'profiler', None) is not None, (
            u"Request has no profiler attached."
        )

        if '/admin' in request.path:
            return response

        profiler = request.profiler.set_request(request).set_response(response)
        profiler.capture()
        profiler.set_response(response)
        return response