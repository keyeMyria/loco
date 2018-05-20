import uuid
from django.conf import settings
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from loco.models import BaseModel

from teams.models import Team

class Task(BaseModel):
    STATUS_CREATED = 'created'
    STATUS_ACCEPTED = 'accepted'
    STATUS_PROGRESS = 'progress'
    STATUS_DELIVERED = 'delivered'
    STATUS_CANCELED = 'canceled'
    STATUS_DELETED = 'deleted'

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
    title = models.CharField(max_length=140)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES)
    content_type = models.ForeignKey(ContentType, on_delete=models.DO_NOTHING,
        blank=True, null=True)
    object_id = models.PositiveIntegerField(blank=True, null=True)
    content_object = GenericForeignKey('content_type', 'object_id')

def task_media_path(instance, filename):
    return 'teams/{0}/users/{1}/tasks/{2}/{3}'.format(
        instance.team.id, instance.user.id, instance.unique_id, filename)

class TaskMedia(BaseModel):
    task = models.ForeignKey(
        Task, on_delete=models.DO_NOTHING, related_name="media")
    media = models.FileField(upload_to=task_media_path)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

class TaskHistory(BaseModel):
    task = models.ForeignKey(
        Task, on_delete=models.DO_NOTHING, related_name="history")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    action = models.TextField()

class DeliveryTaskContent(BaseModel):
    order_id = models.CharField(max_length=16)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    name = models.CharField(max_length=10, blank=True, null=True)
    address = models.CharField(max_length=10, blank=True, null=True)