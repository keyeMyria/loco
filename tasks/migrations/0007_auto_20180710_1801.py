# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-07-10 18:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0006_auto_20180710_1000'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salestaskcontent',
            name='description',
            field=models.TextField(blank=True),
        ),
    ]
