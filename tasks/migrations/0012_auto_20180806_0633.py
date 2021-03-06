# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-08-06 06:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0011_auto_20180714_0030'),
    ]

    operations = [
        migrations.AddField(
            model_name='deliverytaskcontent',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='salestaskcontent',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='salestaskitems',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='task',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='taskhistory',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='taskmedia',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='tasksnapshot',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
