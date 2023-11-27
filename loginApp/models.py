# loginApp/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    registration_username = models.CharField(max_length=255, default='username')
    registration_password = models.CharField(max_length=255, default='password')
