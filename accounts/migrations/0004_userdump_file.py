# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-04-19 08:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_user_photo'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdump',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to=b'file_dump/'),
        ),
    ]