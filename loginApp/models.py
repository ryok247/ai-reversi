# loginApp/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class CustomUser(AbstractUser):
    pass

class Game(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    player_color = models.CharField(max_length=5, choices=[('black', 'Black'), ('white', 'White')])
    ai_level = models.IntegerField()
    game_datetime = models.DateTimeField(default=timezone.now)
    is_favorite = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Move(models.Model):
    game = models.ForeignKey(Game, related_name='moves', on_delete=models.CASCADE)
    move_number = models.PositiveIntegerField()
    row = models.PositiveIntegerField()
    col = models.PositiveIntegerField()
    is_pass = models.BooleanField(default=False)
    comment = models.TextField(blank=True)

    def __str__(self):
        return f"{self.game.name} - Move {self.move_number}"
