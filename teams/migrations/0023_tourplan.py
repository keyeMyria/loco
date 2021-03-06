# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-08-19 00:50
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('teams', '0022_userlog'),
    ]

    operations = [
        migrations.CreateModel(
            name='TourPlan',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('is_deleted', models.BooleanField(default=False)),
                ('data', models.TextField(blank=True)),
                ('dated', models.DateField()),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='teams.Team')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
