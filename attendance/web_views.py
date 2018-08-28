import io, csv

from django.http import Http404, HttpResponse
from django.contrib.auth.decorators import login_required

from loco import utils

from . import models
from teams.models import Team


@login_required
def user_attendance_download(request, team_id):
    PARAM_USER_ID = "user"
    PARAM_FORMAT = "format"
    team = Team.objects.get(id=team_id)
    if not team.is_member(request.user) and not team.is_admin_account(request.user):
        raise Http404

    download_format = request.GET.get(PARAM_FORMAT, 'csv')
    start, limit = utils.get_query_start_limit_dj(request)
    if limit > 400:
        limit = 400

    user_id = request.GET.get(PARAM_USER_ID)
    logs = models.Punch.objects.filter(user__id=user_id, team=team)[start:limit]
    output = io.BytesIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Action"])
    for log in logs:
        writer.writerow([log.created.strftime("%Y-%m-%d %H:%M"), log.action_type])

    output = output.getvalue()

    response = HttpResponse(output)
    response['content_type'] = 'application/{0}'.format(download_format)
    response['Content-Disposition'] = 'attachment;filename=attendance.{0}'.format(download_format)
    return response