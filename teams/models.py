import uuid, random
from datetime import timedelta

from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from django.db import models, connection

from rest_framework.authtoken.models import Token

from loco.models import BaseModel, BaseLocationModel

from . import constants
from .managers import MessageManager

from accounts.models import User

_CODE_BASE = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

def get_team_code(size=6):
    code = ''
    secure_random = random.SystemRandom()
    for i in range(size):
        code += secure_random.choice(_CODE_BASE)

    return code

class Team(BaseModel):
    name = models.CharField(max_length=60)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='creator', on_delete=models.DO_NOTHING)
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='admin', on_delete=models.DO_NOTHING)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        through='TeamMembership',
        through_fields=('team', 'user'),
    )
    code = models.CharField(max_length=10, default=get_team_code, unique=True)

    def save(self, *args, **kwargs):
        newly_created = True
        if self.id:
            newly_created = False
        else:
            admin_phone = get_team_code(10)
            self.admin = User.objects.create(name="Admin", phone=admin_phone)

        super(Team, self).save(*args, **kwargs)

        if newly_created:
            TeamMembership.objects.create(
                team = self,
                user = self.created_by,
                created_by = self.created_by,
                role = TeamMembership.ROLE_ADMIN,
                status = constants.STATUS_ACCEPTED
            )

            Token.objects.create(user=self.admin)

    def is_member(self, user):
        return TeamMembership.objects.filter(team=self, user=user).exists()

    def is_admin_account(self, user):
        return user.id == self.admin.id

    def is_admin(self, user):
        return TeamMembership.objects.filter(
            team=self, user=user, role=TeamMembership.ROLE_ADMIN).exists()

    def is_manager(self, user):
        return TeamMembership.objects.filter(
            team=self, user=user, role=TeamMembership.ROLE_MANAGER).exists()

    def add_member(self, user, created_by):
        membership = TeamMembership.objects.filter(team=self, user=user)
        if not membership.exists():
            membership = TeamMembership.objects.create(
                team = self,
                user = user,
                created_by = created_by,
                role = TeamMembership.ROLE_MEMBER,
                status = constants.STATUS_INVITED
            )
        else:
            membership = membership[0]
            membership.is_deleted = False
            membership.save()

        return membership

    # def get_chat_members(self, user):
    #     try:
    #         membership = TeamMembership.objects.get(user=user, team=self)
    #         if membership.role == TeamMembership.ROLE_ADMIN:
    #             return TeamMembership.objects.filter(team=self, user__is_active=True).exclude(user=user)
    #         elif membership.role == TeamMembership.ROLE_MANAGER:
    #             return TeamMembership.objects.filter(team=self, user__is_active=True, role=TeamMembership.ROLE_MEMBER)
    #         elif membership.role == TeamMembership.ROLE_MEMBER:
    #             return TeamMembership.objects.filter(team=self, user__is_active=True, role=TeamMembership.ROLE_ADMIN)
    #     except ObjectDoesNotExist:
    #         pass

    #     return []

    def get_chat_members(self, user):
        try:
            return TeamMembership.objects.filter(
                team=self, user__is_active=True).exclude(user=user)
        except ObjectDoesNotExist:
            pass

        return []

    def get_chat_targets(self, user):
        try:
            membership = TeamMembership.objects.get(user=user, team=self)
            if membership.role == TeamMembership.ROLE_ADMIN:
                return TeamMembership.objects.filter(team=self, user__is_active=True, role=TeamMembership.ROLE_ADMIN).exclude(user=user)
            elif membership.role == TeamMembership.ROLE_MEMBER:
                return TeamMembership.objects.filter(team=self, user__is_active=True, role=TeamMembership.ROLE_ADMIN)
        except ObjectDoesNotExist:
            pass

        return []

    def _sort_events(self, events):
        events.sort(key=lambda e: e.timestamp, reverse=True)
        return events

    def _fetch_location_set(self, location_set, start_time):
        if not location_set:
            return

        end_time = start_time + timedelta(days=1)

        locations = location_set.filter(
            timestamp__gte=start_time).filter(
            timestamp__lt=end_time).exclude(
            latitude__isnull=True).exclude(
            latitude=0)

        data = [l for l in locations]
        return data

    def get_visible_events_by_date(self, user, date):
        try:
            phone_events = []
            attendance = self._fetch_location_set(user.attendance_set,date)
            checkins = self._fetch_location_set(user.checkin_set,date)
            location_events = self._fetch_location_set(user.locationstatus_set,date)
            # phone_events = user.phonestatus_set.filter(timestamp__date=date)
            events = attendance + checkins + location_events + phone_events
            return self._sort_events(events)

        except ObjectDoesNotExist:
            pass

        return []

    def get_visible_events_by_page(self, user, start, limit):
        try:
            phone_events = []
            attendance = user.attendance_set.all().order_by('-timestamp')[0:start+limit]
            checkins = user.checkin_set.all().order_by('-timestamp')[0:start+limit]
            location_events = user.locationstatus_set.all().order_by('-timestamp')[0:start+limit]
            # phone_events = user.phonestatus_set.all().order_by('-timestamp')[0:start+limit]
            events = list(attendance) + list(checkins) + list(location_events) + list(phone_events)
            events = self._sort_events(events)
            return events[start:start+limit]

        except ObjectDoesNotExist:
            pass

        return []

def get_team_members(team_id, date, search=None):
    query = "select CASE WHEN a.action_type is NULL THEN 'Sign-Absent' ELSE a.action_type END, b.role, b.user_id, c.name  from ( select *  from attendance_punch  where id in  ( select max(id)  from attendance_punch  where team_id={0}  and date(CONVERT_TZ(timestamp,'+00:00','+05:30'))='{1}' group by user_id) ) as a  right join teams_teammembership as b  on a.user_id = b.user_id  join accounts_user as c on b.user_id = c.id where b.team_id={0} and b.is_deleted=False {2} order by a.action_type desc"
    search_query = ''
    if search:
        search_query = "and c.name like '%{0}%'".format(search)

    query = query.format(team_id, date, search_query)
    with connection.cursor() as cursor:
        cursor.execute(query)
        rows = cursor.fetchall()

    return rows

class TeamMembership(BaseModel):
    ROLE_MEMBER = 'member'
    ROLE_ADMIN = 'admin'
    ROLE_MANAGER = 'manager'

    ROLE_CHOICES = (
        (ROLE_MEMBER, 'member'),
        (ROLE_ADMIN, 'admin'),
        (ROLE_MANAGER, 'manager'),
    )

    STATUS_CHOICES = (
        (constants.STATUS_INVITED, 'invited'),
        (constants.STATUS_ACCEPTED, 'accepted'),
        (constants.STATUS_REJECTED, 'rejected'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="invites", on_delete=models.DO_NOTHING)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_MEMBER)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=constants.STATUS_INVITED)

    def accept(self):
        self.status = constants.STATUS_ACCEPTED
        self.save()

    def reject(self):
        self.status = constants.STATUS_REJECTED
        self.save()

class Checkin(BaseLocationModel):
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    description = models.TextField(blank=True)

    def get_type(self):
        return 8

def checkin_media_path(instance, filename):
    return 'teams/{0}/users/{1}/checkins/{2}/{3}'.format(
        instance.team.id, instance.user.id, instance.unique_id, filename)

class CheckinMedia(BaseModel):
    checkin = models.ForeignKey(
        Checkin, null=True, on_delete=models.DO_NOTHING, related_name="media")
    media = models.FileField(upload_to=checkin_media_path)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

class Attendance(BaseLocationModel):
    ACTION_SIGNIN = 'signin'
    ACTION_SIGNOUT = 'signout'

    ACTION_CHOICES = (
        (ACTION_SIGNIN, 'signin'),
        (ACTION_SIGNOUT, 'signout'),
    )

    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    action_type = models.CharField(max_length=10, choices=ACTION_CHOICES)
    message_id = models.CharField(max_length=40, unique=True)

    def get_type(self):
        if self.action_type == self.ACTION_SIGNIN:
            return 6
            
        return 7

def user_media_path(instance, filename):
    return 'teams/{0}/users/{1}/{2}/{3}'.format(
        instance.team.id, instance.user.id, instance.unique_id, filename)

class UserMedia(BaseModel):
    media = models.FileField(upload_to=user_media_path)
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

class Message(BaseModel):
    STATUS_SENT = 'sent'
    STATUS_DELIVERED = 'delivered'
    STATUS_READ = 'read'

    STATUS_CHOICES = (
        (STATUS_SENT, 'sent'),
        (STATUS_DELIVERED, 'delivered'),
        (STATUS_READ, 'read'),
    )

    id = models.CharField(max_length=16, primary_key=True, editable=False)
    original_id = models.CharField(max_length=16, blank=True)
    thread = models.CharField(max_length=32)
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    group = models.ForeignKey("groups.Group", on_delete=models.DO_NOTHING, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="sent_messages")
    target = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="recv_messages")
    body = models.TextField(blank=True)
    attachment = models.TextField(blank=True)
    original = models.TextField()

    objects = MessageManager()

    def validate_next_status(self, status):
        if self.status == self.STATUS_SENT and status != self.STATUS_SENT:
            return status
        elif self.status == self.STATUS_DELIVERED and status == self.STATUS_READ:
            return status


class UserLog(BaseModel):
    ACTION_SIGNIN = 'signin'
    ACTION_SIGNOUT = 'signout'

    ACTION_CHOICES = (
        (ACTION_SIGNIN, 'signin'),
        (ACTION_SIGNOUT, 'signout'),
    )

    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    action_type = models.CharField(max_length=10, choices=ACTION_CHOICES)

class TourPlan(BaseModel):
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    data = models.TextField(blank=True)
    dated = models.DateField()
    