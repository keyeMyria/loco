from __future__ import absolute_import

from django.db import models

from loco.models import BaseModel

from teams.models import Team
from accounts.models import User

class State(BaseModel):
    name = models.CharField(max_length=100)
    name_lower = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        if self.name:
            self.name_lower = self.name.lower()

        super(State, self).save(*args, **kwargs)

class City(BaseModel):
    name = models.CharField(max_length=100)
    name_lower = models.CharField(max_length=100)
    state = models.ForeignKey(State)

    def save(self, *args, **kwargs):
        if self.name:
            self.name_lower = self.name.lower()
            
        super(City, self).save(*args, **kwargs)

class Merchant(BaseModel):
    team = models.ForeignKey(Team)
    created_by = models.ForeignKey(User, blank=True, null=True)
    name = models.CharField(max_length=100)
    state = models.ForeignKey(State, blank=True, null=True)
    city = models.ForeignKey(City, blank=True, null=True)
    address = models.TextField(blank=True)

class Item(BaseModel):
    team = models.ForeignKey(Team)
    created_by = models.ForeignKey(User, blank=True, null=True)
    name = models.CharField(max_length=140)
    price = models.DecimalField(max_digits=11, decimal_places=2)
    serial_number = models.CharField(max_length=50, blank=True)
