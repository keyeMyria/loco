# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-04-28 17:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0017_auto_20180405_2058'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='attachment',
            field=models.TextField(blank=True),
        ),
    ]