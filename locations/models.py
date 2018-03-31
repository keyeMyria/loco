from django.db.models import F, Max
from django.conf import settings
from django.db import models

from loco.models import BaseLocationModel, BaseModel
from teams.models import Team

class UserLocation(BaseLocationModel):
    LOCATION_TYPE = 0
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING, null=True, blank=True)

    def get_type(self):
        return self.LOCATION_TYPE

class UserStopLocation(BaseLocationModel):
    LOCATION_TYPE = 1
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING, null=True, blank=True)
    end_timestamp = models.DateTimeField()

    def get_type(self):
        return self.LOCATION_TYPE

    def get_end_time(self):
        return self.end_timestamp

class LocationStatus(BaseLocationModel):
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING, null=True, blank=True)
    ACTION_ON = 'on'
    ACTION_OFF = 'off'

    ACTION_CHOICES = (
        (ACTION_ON, 'on'),
        (ACTION_OFF, 'off'),
    )

    action_type = models.CharField(max_length=10, choices=ACTION_CHOICES)

    def get_type(self):
        if self.action_type == self.ACTION_ON:
            return 2

        return 3

class PhoneStatus(BaseLocationModel):
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING, null=True, blank=True)
    ACTION_ON = 'on'
    ACTION_OFF = 'off'

    ACTION_CHOICES = (
        (ACTION_ON, 'on'),
        (ACTION_OFF, 'off'),
    )

    action_type = models.CharField(max_length=10, choices=ACTION_CHOICES)

    def get_type(self):
        if self.action_type == self.ACTION_ON:
            return 4
            
        return 5

class UserAnalyzedLocation(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    polyline = models.TextField()
    date = models.DateField()

    class Meta:
        unique_together = ('user', 'date',)
