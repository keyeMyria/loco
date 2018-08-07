from django.db import models
from django.conf import settings

class BaseModel(models.Model):
	created = models.DateTimeField(auto_now_add=True)
	updated = models.DateTimeField(auto_now=True)
	is_deleted = models.BooleanField(default=False)

	class Meta:
		abstract = True

class BaseLocationModel(BaseModel):
	LOCATION_TYPE = -1

	latitude = models.FloatField()
	longitude = models.FloatField()
	timestamp = models.DateTimeField()
	accuracy = models.FloatField()
	spoofed = models.BooleanField()
	battery = models.IntegerField()
	session = models.CharField(max_length=32, blank=True, null=True)
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)

	class Meta:
		abstract = True

	def get_type(self):
		return self.LOCATION_TYPE

	def get_start_time(self):
		return self.timestamp

	def get_end_time(self):
		return self.timestamp