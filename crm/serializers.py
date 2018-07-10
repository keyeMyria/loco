from rest_framework import serializers
from . import models

from accounts.serializers import UserSerializer
from teams.serializers import TeamSerializer

class StateSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.State
		fields = "__all__"
        read_only_fields = ('id', 'created', 'updated')

class CitySerializer(serializers.ModelSerializer):
	class Meta:
		model = models.City
		fields = "__all__"
        read_only_fields = ('id', 'created', 'updated')

class MerchantSerializer(serializers.ModelSerializer):
	team = TeamSerializer(read_only=True)
	state = StateSerializer(read_only=True)
	city = CitySerializer(read_only=True)

	class Meta:
		model = models.Merchant
		exclude = ("created_by", )
        read_only_fields = ('id', 'created', 'updated', 'team')

class ItemSerializer(serializers.ModelSerializer):
	team = TeamSerializer(read_only=True)

	class Meta:
		model = models.Item
		exclude = ("created_by", )
        read_only_fields = ('id', 'created', 'updated', 'team')

class MerchantUploadSerializer(serializers.ModelSerializer):
	team = TeamSerializer(read_only=True)

	class Meta:
		model = models.MerchantUpload
		fields = '__all__'
        read_only_fields = ('id', 'created', 'updated', 'team', 'unique_id', 'created_by')

class ItemUploadSerializer(serializers.ModelSerializer):
	team = TeamSerializer(read_only=True)

	class Meta:
		model = models.ItemUpload
		fields = '__all__'
        read_only_fields = ('id', 'created', 'updated', 'team', 'unique_id', 'created_by')


class StateSerializer(serializers.ModelSerializer):
	class Meta:
		model = models.State
		fields = "__all__"

class CitySerializer(serializers.ModelSerializer):
	class Meta:
		model = models.City
		fields = "__all__"