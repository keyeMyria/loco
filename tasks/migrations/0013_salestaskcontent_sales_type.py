# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-08-06 20:00
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0012_auto_20180806_0633'),
    ]

    operations = [
        migrations.AddField(
            model_name='salestaskcontent',
            name='sales_type',
            field=models.CharField(choices=[(b'buy', b'buy'), (b'sell', b'sell')], default='buy', max_length=16),
            preserve_default=False,
        ),
    ]
