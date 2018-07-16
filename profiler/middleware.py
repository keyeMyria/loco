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
        try:
            request.profiler = ProfilingRecord().start()
        except Exception as e:
            pass

    def process_response(self, request, response):
        try:
            if not hasattr(request, 'profiler'):
                logger.error("Profiler not set for", request.path)
                return response

            current_view = resolve(request.path)
            if not hasattr(current_view, 'view_name'):
                return response

            api_name = current_view.view_name
            api_name = api_name.split('.')[-1]
            profiler = request.profiler
            profiler.stop(response_status_code=response.status_code, api_name=api_name)
            return response
        except Exception as e:

            return response