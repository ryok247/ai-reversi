from .forms import SignupForm, LoginForm
from .models import CustomUser, Game, Move
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import TemplateView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.paginator import Paginator

import json

def index(request):
    # Renders the main index page
    return render(request, 'index.html')

# Alias for the index view
home = index

class MySignupView(CreateView):
    # View for user signup
    template_name = 'signup.html'
    form_class = SignupForm
    success_url = '/'
    
    def form_valid(self, form):
        # Handles a valid form submission
        result = super().form_valid(form)
        user = self.object
        login(self.request, user)  # Logs in the user
        return result

class MyLoginView(LoginView):
    # View for user login
    template_name = 'login.html'
    form_class = LoginForm

    def get_success_url(self):
        # Redirects user after successful login
        return self.request.GET.get('next', '/')

class MyLogoutView(CreateView):
    # View for user logout
    def get(self, request):
        logout(request)
        return redirect('/')

class MyUserView(LoginRequiredMixin, TemplateView):
    # View for displaying user-related data
    template_name = 'user.html'
    
    def get_context_data(self, **kwargs):
        # Adds user context to the view
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context

class MyOtherView(LoginRequiredMixin, TemplateView):
    # View for displaying data related to other users
    template_name = 'other.html'

    def get_context_data(self, **kwargs):
        # Adds other users' context to the view
        context = super().get_context_data(**kwargs)
        context['users'] = CustomUser.objects.exclude(username=self.request.user.username)
        return context

#@method_decorator(csrf_exempt, name='dispatch')
class SaveGameView(CreateView):
    # View for saving a game
    def post(self, request, *args, **kwargs):
        # Handles POST request to save a game
        data = json.loads(request.body)

        # Create game record
        game = Game.objects.create(
            user=request.user if request.user.is_authenticated else None,
            name=data['name'],
            description=data['description'],
            player_color=data['player_color'],
            ai_level=data['ai_level'],
            game_datetime=data['game_datetime'],
            black_score=data['black_score'],
            white_score=data['white_score'],
            is_favorite=data['is_favorite']
        )

        # Save each move of the game
        for move in data['moves']:
            Move.objects.create(
                game=game,
                move_number=move['move_number'],
                row=move['row'],
                col=move['col'],
                is_pass=move['is_pass'],
                comment=move['comment']
            )

        return JsonResponse({'status': 'success', 'game_id': game.id})

    def get(self, request, *args, **kwargs):
        # Returns error response for GET requests
        return JsonResponse({'status': 'error'}, status=400)

class GameDetailsView(CreateView):
    # View for retrieving game details
    def get(self, request, game_id):
        # Handles GET request to fetch game details
        try:
            game = Game.objects.get(id=game_id)
            return JsonResponse({
                'id': game_id,
                'player_color': game.player_color,
                'game_datetime': game.game_datetime.isoformat(),
                'ai_level': game.ai_level,
                'black_score': game.black_score,
                'white_score': game.white_score
            })
        except Game.DoesNotExist:
            # Game not found response
            return JsonResponse({'error': 'Game not found'}, status=404)

class UpdateGameRecordsView(CreateView):
    # View for updating game records
    def post(self, request, *args, **kwargs):
        # Handles POST request for updating game records
        data = json.loads(request.body)
        game_ids = data.get('game_ids', [])
        if request.user.is_authenticated:
            Game.objects.filter(id__in=game_ids).update(user=request.user)
            return JsonResponse({'status': 'success'})
        return JsonResponse({'status': 'error', 'message': 'User not authenticated'}, status=403)

class UserGamesView(TemplateView):
    # View for listing games of a logged-in user
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            games = Game.objects.filter(user=request.user).order_by('-game_datetime')
            paginator = Paginator(games, 10)  # Number of items per page

            page_number = request.GET.get('page', 1)
            page_obj = paginator.get_page(page_number)

            games_data = []
            for game in page_obj:
                # Formatting necessary game data to be added to games_data
                games_data.append({
                    'id': game.id,
                    'player_color': game.player_color,
                    'game_datetime': game.game_datetime.isoformat(),
                    'ai_level': game.ai_level,
                    'black_score': game.black_score,
                    'white_score': game.white_score,
                    'is_favorite': game.is_favorite,
                })

            return JsonResponse({
                'games': games_data,
                'has_next': page_obj.has_next(),
                'next_page_number': page_obj.next_page_number() if page_obj.has_next() else None
            })
        else:
            # Not authenticated error response
            return JsonResponse({'error': 'Not authenticated'}, status=403)

class FavoriteGamesView(TemplateView):
    # View for listing favorite games of a logged-in user
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            games = Game.objects.filter(user=request.user, is_favorite=True).order_by('-game_datetime')
            paginator = Paginator(games, 10)  # Number of items per page

            page_number = request.GET.get('page', 1)
            page_obj = paginator.get_page(page_number)

            games_data = []
            for game in page_obj:
                # Formatting necessary game data to be added to games_data
                games_data.append({
                    'id': game.id,
                    'player_color': game.player_color,
                    'game_datetime': game.game_datetime.isoformat(),
                    'ai_level': game.ai_level,
                    'black_score': game.black_score,
                    'white_score': game.white_score,
                    'is_favorite': game.is_favorite,
                })

            return JsonResponse({
                'games': games_data,
                'has_next': page_obj.has_next(),
                'next_page_number': page_obj.next_page_number() if page_obj.has_next() else None
            })
        else:
            # Not authenticated error response
            return JsonResponse({'error': 'Not authenticated'}, status=403)

class ToggleFavoriteView(CreateView):
    # View to toggle the favorite status of a game
    def post(self, request, game_id):
        # Handles POST request to toggle favorite status
        if request.user.is_authenticated:
            try:
                game = Game.objects.get(id=game_id, user=request.user)
                game.is_favorite = not game.is_favorite
                game.save()
                return JsonResponse({'status': 'success', 'is_favorite': game.is_favorite})
            except Game.DoesNotExist:
                # Game not found error response
                return JsonResponse({'error': 'Game not found'}, status=404)
        else:
            # Not authenticated error response
            return JsonResponse({'error': 'Not authenticated'}, status=403)

class GetMovesView(CreateView):
    # View to get moves of a game
    def get(self, request, game_id):
        # Handles GET request to get moves of a game
        try:
            game = Game.objects.get(id=game_id)
            moves = game.moves.all().order_by('move_number')
            moves_data = []
            for move in moves:
                # Formatting necessary move data to be added to moves_data
                moves_data.append({
                    'move_number': move.move_number,
                    'row': move.row,
                    'col': move.col,
                    'is_pass': move.is_pass,
                    'comment': move.comment
                })
            return JsonResponse({'moves': moves_data})
        except Game.DoesNotExist:
            # Game not found error response
            return JsonResponse({'error': 'Game not found'}, status=404)
