# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-01-29 19:40
from __future__ import unicode_literals

from django.db import migrations, models
import teams.models


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0014_team_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='code',
            field=models.CharField(default=teams.models.get_team_code, max_length=10, unique=True),
        ),
    ]
