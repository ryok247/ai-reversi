from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from .models import CustomUser, Game, Move

CustomUser = get_user_model()

class SignupForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = [CustomUser.USERNAME_FIELD] + CustomUser.REQUIRED_FIELDS + ['password1', 'password2']

class LoginForm(AuthenticationForm):
    pass

class GameForm(forms.ModelForm):
    class Meta:
        model = Game
        fields = ['user', 'name', 'description', 'player_color', 'ai_level', 'is_favorite']

class MoveForm(forms.ModelForm):
    class Meta:
        model = Move
        fields = ['game', 'move_number', 'row', 'col', 'is_pass', 'comment']

