# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-08-06 06:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_userdump_file'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdump',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='userotp',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
