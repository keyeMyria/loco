# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-05-03 12:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0018_message_attachment'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='original_id',
            field=models.CharField(blank=True, max_length=16),
        ),
    ]