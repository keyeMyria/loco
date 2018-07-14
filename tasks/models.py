from __future__ import absolute_import

import uuid
from django.conf import settings
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from loco.models import BaseModel

from teams.models import Team
from accounts.models import User
from crm.models import Merchant, Item

class Task(BaseModel):
    STATUS_CREATED = 'created'
    STATUS_ACCEPTED = 'accepted'
    STATUS_PROGRESS = 'progress'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELED = 'canceled'
    STATUS_DELETED = 'deleted'

    PRIORITY_MAP = {
        STATUS_CREATED: 1,
        STATUS_ACCEPTED: 2,
        STATUS_PROGRESS: 3,
        STATUS_DELIVERED: 4,
        STATUS_CANCELED: 5,
        STATUS_DELETED: 6
    }

    STATUS_CHOICES = (
        (STATUS_CREATED , 'created'),
        (STATUS_ACCEPTED , 'accepted'),
        (STATUS_PROGRESS , 'progress'),
        (STATUS_DELIVERED , 'delivered'),
        (STATUS_CANCELED , 'canceled'),
        (STATUS_DELETED , 'deleted')
    )

    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, 
        null=True, related_name="assigned_tasks", on_delete=models.DO_NOTHING)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, 
        null=True, related_name="created_tasks", on_delete=models.DO_NOTHING)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_CREATED)
    status_priority = models.PositiveIntegerField()
    content_type = models.ForeignKey(ContentType, on_delete=models.DO_NOTHING,
        blank=True, null=True)
    object_id = models.PositiveIntegerField(blank=True, null=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    def save(self, *args, **kwargs):
        self.status_priority = self.PRIORITY_MAP.get(self.status, 0)
        super(Task, self).save(*args, **kwargs)

    def update_value(self, key, value):
        if not key or not value:
            return

        setattr(self, key, value)
        self.save()

    def update_assigned_to(self, user):
        self.assigned_to = user
        self.save()

class TaskSnapshot(BaseModel):
    task = models.ForeignKey(Task, on_delete=models.DO_NOTHING)
    content = models.TextField()

def task_media_path(instance, filename):
    return 'teams/{0}/users/{1}/tasks/{2}/{3}'.format(
        instance.team.id, instance.created_by.id, instance.unique_id, filename)

class TaskMedia(BaseModel):
    task = models.ForeignKey(
        Task, on_delete=models.DO_NOTHING, related_name="media", blank=True, null=True)
    team = models.ForeignKey(Team)
    media = models.FileField(upload_to=task_media_path)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

class TaskHistory(BaseModel):
    ACTION_CREATED = 'created'
    ACTION_ASSIGNED = 'assigned'
    ACTION_STATUS = 'status'
    ACTION_CONTENT = 'content'

    ACTION_CHOICES = (
        (ACTION_CREATED, 'created'),
        (ACTION_ASSIGNED , 'assigned'),
        (ACTION_STATUS , 'status'),
        (ACTION_CONTENT , 'content'),
    )

    task = models.ForeignKey(
        Task, on_delete=models.DO_NOTHING, related_name="history")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    action = models.TextField()
    action_type = models.CharField(max_length=16, choices=ACTION_CHOICES)

    def __str__(self):
        return "{} {}".format(self.actor.name, self.action)

class DeliveryTaskContent(BaseModel):
    order_id = models.CharField(max_length=140)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True)
    name = models.CharField(max_length=80, blank=True)
    address = models.TextField(max_length=10, blank=True)

    def update_value(self, key, value):
        if not key or not value:
            return

        setattr(self, key, value)
        self.save()

class SalesTaskContent(BaseModel):
    description = models.TextField(blank=True)
    merchant = models.ForeignKey(Merchant, on_delete=models.DO_NOTHING)
    items = models.ManyToManyField(Item,
        through='SalesTaskItems', related_name="items",
        through_fields=('sales_task_content', 'item'))
    amount = models.DecimalField(max_digits=11, decimal_places=2, default=0)

    def copy_items(self):
        for item in self.items.all():
            SalesTaskItems.objects.create(item=item, sales_task_content=self)

    def get_items(self):
        return SalesTaskItems.objects.filter(sales_task_content=self)

class SalesTaskItems(BaseModel):
    item = models.ForeignKey(Item)
    sales_task_content = models.ForeignKey(SalesTaskContent, on_delete=models.DO_NOTHING)
    quantity = models.PositiveIntegerField(default=1)