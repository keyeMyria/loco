# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-10-29 00:20
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('morty', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userlocation',
            name='user',
        ),
        migrations.DeleteModel(
            name='UserLocation',
        ),
    ]
