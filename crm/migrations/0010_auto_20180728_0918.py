# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-07-28 09:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0009_auto_20180726_1746'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='composition',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='item',
            name='mrp',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=11, null=True),
        ),
        migrations.AlterField(
            model_name='merchant',
            name='merchant_type',
            field=models.CharField(blank=True, choices=[(b'retailer', b'retail'), (b'stockist', b'stockist'), (b'distributor', b'distributor')], max_length=16),
        ),
    ]
