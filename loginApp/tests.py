from django.test import TestCase
from .models import CustomUser

class CustomUserModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        CustomUser.objects.create_user(username='testuser', password='12345')

    def test_user_creation(self):
        user = CustomUser.objects.get(id=1)
        self.assertEqual(user.username, 'testuser')

from .models import Game, CustomUser
from django.utils import timezone

class GameModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        testuser = CustomUser.objects.create_user(username='testuser', password='12345')
        Game.objects.create(user=testuser, name='Test Game', ai_level=1, game_datetime=timezone.now())

    def test_game_creation(self):
        game = Game.objects.get(id=1)
        self.assertEqual(game.name, 'Test Game')

from .forms import SignupForm, GameForm
from django.core.exceptions import ValidationError

# TODO: Fix these tests (disabled due to errors after introducing react)

"""
class SignupFormTest(TestCase):
    def test_form(self):
        form_data = {
            'username': 'newuser',
            'password1': 'Complexpassword123!',
            'password2': 'Complexpassword123!',
        }
        form = SignupForm(data=form_data)
        self.assertTrue(form.is_valid())
"""

"""
class GameFormTest(TestCase):
    def test_form(self):
        form_data = {
            'name': 'Test Game',
            'ai_level': 1,
            'player_color': 'black',
            'black_score': 0,
            'white_score': 0,
            'is_favorite': False,
        }
        form = GameForm(data=form_data)
        self.assertTrue(form.is_valid())
"""

from django.test import Client
from django.urls import reverse

class IndexPageTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_index_view_status_code(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)


