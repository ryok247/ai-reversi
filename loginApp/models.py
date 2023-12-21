# loginApp/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

from loginProject import settings

class CustomUser(AbstractUser):
    pass

class Game(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=settings.MAX_TITLE_LENGTH)
    description = models.TextField(max_length=settings.MAX_DESCRIPTION_LENGTH, blank=True)
    player_color = models.CharField(max_length=5, choices=[('black', 'Black'), ('white', 'White')])
    ai_level = models.IntegerField()
    game_datetime = models.DateTimeField(default=timezone.now)
    black_score = models.PositiveIntegerField(default=0)
    white_score = models.PositiveIntegerField(default=0)
    is_favorite = models.BooleanField(default=False)
    total_user_duration = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class Move(models.Model):
    game = models.ForeignKey(Game, related_name='moves', on_delete=models.CASCADE)
    move_number = models.PositiveIntegerField()
    row = models.PositiveIntegerField()
    col = models.PositiveIntegerField()
    is_pass = models.BooleanField(default=False)
    comment = models.TextField(blank=True)
    duration = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.game.name} - Move {self.move_number}"
