from __future__ import absolute_import

import uuid

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
    TYPE_RETAILER = 'retailer'
    TYPE_STOCKIST = 'stockist'
    TYPE_DISTRIBUTOR = 'distributor'

    TYPE_CHOICES = (
        (TYPE_RETAILER, 'retail'),
        (TYPE_STOCKIST, 'stockist'),
        (TYPE_DISTRIBUTOR,'distributor')
    )

    team = models.ForeignKey(Team)
    created_by = models.ForeignKey(User, blank=True, null=True)
    name = models.CharField(max_length=100)
    local_id = models.CharField(max_length=16, blank=True, default="")
    state = models.ForeignKey(State, blank=True, null=True)
    city = models.ForeignKey(City, blank=True, null=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=10, blank=True)
    merchant_type = models.CharField(max_length=16, choices=TYPE_CHOICES, blank=True)

def upload_csv_path(instance, filename):
    return 'teams/{0}/uploads/merchants/{1}/{2}'.format(
        instance.team.id, instance.unique_id, filename)

class MerchantUpload(BaseModel):
    STATUS_CREATED = 'created'
    STATUS_PROGRESS = 'progress'
    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = (
        ('created', 'created'),
        ('progress', 'progress'),
        ('success', 'success'),
        ('failed', 'failed')
    )

    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_CREATED)
    team = models.ForeignKey(Team)
    data = models.FileField(upload_to=upload_csv_path)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_by = models.ForeignKey(User, blank=True, null=True)
    message = models.TextField(blank=True)

class Item(BaseModel):
    team = models.ForeignKey(Team)
    created_by = models.ForeignKey(User, blank=True, null=True)
    name = models.CharField(max_length=140)
    price = models.DecimalField(max_digits=11, decimal_places=2)
    mrp = models.DecimalField(max_digits=11, decimal_places=2, blank=True, null=True)
    composition = models.TextField(blank=True)
    serial_number = models.CharField(max_length=50, blank=True)

def upload_item_csv_path(instance, filename):
    return 'teams/{0}/uploads/items/{1}/{2}'.format(
        instance.team.id, instance.unique_id, filename)

class ItemUpload(BaseModel):
    STATUS_CREATED = 'created'
    STATUS_PROGRESS = 'progress'
    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = (
        ('created', 'created'),
        ('progress', 'progress'),
        ('success', 'success'),
        ('failed', 'failed')
    )

    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_CREATED)
    team = models.ForeignKey(Team)
    data = models.FileField(upload_to=upload_item_csv_path)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_by = models.ForeignKey(User, blank=True, null=True)
    message = models.TextField(blank=True)

