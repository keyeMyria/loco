import uuid, random
from datetime import timedelta

from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from django.db import models

from loco.models import BaseModel
from teams.models import Team
from accounts.models import User


class Punch(BaseModel):
    ACTION_SIGNIN = 'signin'
    ACTION_SIGNOUT = 'signout'

    ACTION_CHOICES = (
        (ACTION_SIGNIN, 'signin'),
        (ACTION_SIGNOUT, 'signout'),
    )

    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    action_type = models.CharField(max_length=10, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField()
    

class Leave(BaseModel):
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_DISAPPROVED = 'disapproved'

    STATUS_CHOICES = (
        (STATUS_PENDING, 'pending'),
        (STATUS_APPROVED, 'approved'),
        (STATUS_DISAPPROVED, 'disapproved'),
    )

    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
