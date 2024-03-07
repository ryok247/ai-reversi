from .models import Game, Move
from .forms import SignupForm
from django.db.models import Count, Case, When, IntegerField, F, Min
from django.shortcuts import render
from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView
from django.views.generic import TemplateView, CreateView
from django.utils import timezone

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from django.core.paginator import Paginator
from loginProject import settings

from django.contrib.auth.models import User

from typing import Any, Dict, List, Optional
from datetime import date
import json

from decouple import config
from openai import OpenAI,RateLimitError

def index(request: HttpRequest) -> HttpResponse:
    """Renders the main index page"""
    return render(request, 'index.html')

# Alias for the index view
home = index

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CheckAuthStatusView(CreateView):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return JsonResponse({
                "isAuthenticated": True,
                "user": {
                    "username": request.user.username,
                }
            })
        else:
            return JsonResponse({"isAuthenticated": False}, status=401)

@method_decorator(csrf_protect, name='dispatch')
class MySignupView(CreateView):
    def post(self, request, *args, **kwargs):
        # JSONデータをパースしてフォームに渡す
        data = json.loads(request.body)
        # カスタムフォーム`SignupForm`を使用
        form = SignupForm(data)
        if form.is_valid():
            user = form.save()
            # ユーザーをログインさせる
            login(request, user)
            return JsonResponse({"status": "success"}, status=200)
        else:
            # フォームのエラーを返す
            return JsonResponse({"status": "error", "errors": form.errors}, status=400)
        
class MyLoginView(LoginView):
    def form_valid(self, form):
        login(self.request, form.get_user())
        return JsonResponse({"status": "success"}, status=200)

    def form_invalid(self, form):
        return JsonResponse({"status": "error", "errors": form.errors}, status=400)

class MyLogoutView(CreateView):
    def get(self, request, *args, **kwargs):
        logout(request)
        return JsonResponse({"status": "success"}, status=200)

#@method_decorator(csrf_exempt, name='dispatch')
class SaveGameView(CreateView):
    def post(self, request: HttpRequest, *args: Any, **kwargs: Any) -> JsonResponse:
        data: Dict[str, Any] = json.loads(request.body)

        # Compute total duration by summing up the duration of each move
        total_user_duration: int = sum(move.get('duration', 0) for move in data['moves'] if move.get('duration', 0) >= 0)

        # Create a new game record
        game: Game = Game.objects.create(
            user=request.user if request.user.is_authenticated else None,
            name=data['name'],
            description=data['description'],
            player_color=data['player_color'],
            ai_level=data['ai_level'],
            game_datetime=data['game_datetime'],
            black_score=data['black_score'],
            white_score=data['white_score'],
            is_favorite=data['is_favorite'],
            total_user_duration=total_user_duration,
        )

        # Save each move of the game
        for move in data['moves']:
            Move.objects.create(
                game=game,
                move_number=move['move_number'],
                row=move['row'],
                col=move['col'],
                is_pass=move['is_pass'],
                comment=move['comment'],
                duration=move.get('duration', 0)
            )

        return JsonResponse({'status': 'success', 'game_id': game.id})

    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> JsonResponse:
        """Returns error response for GET requests"""
        return JsonResponse({'status': 'error'}, status=400)
 
class GameDetailsView(CreateView):
    """View for retrieving game details"""
    def get(self, request: HttpRequest, game_id: int) -> JsonResponse:
        try:
            game: Game = Game.objects.get(id=game_id)
            return JsonResponse(create_game_record(game))
        except Game.DoesNotExist:
            # Game not found response
            return JsonResponse({'error': 'Game not found'}, status=404)
    
class UpdateGameRecordsView(CreateView):
    """View for updating game records"""
    def post(self, request: HttpRequest, *args: Any, **kwargs: Any) -> JsonResponse:
        """Handles POST request for updating game records"""
        data: Dict[str, Any] = json.loads(request.body)
        game_ids: List[int] = data.get('game_ids', [])
        if request.user.is_authenticated:
            Game.objects.filter(id__in=game_ids).update(user=request.user)
            return JsonResponse({'status': 'success'})
        return JsonResponse({'status': 'error', 'message': 'User not authenticated'}, status=403)
        
class UserGamesView(TemplateView):
    """View for listing games of a logged-in user"""
    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> JsonResponse:
        if request.user.is_authenticated:
            games: 'QuerySet[Game]' = Game.objects.filter(user=request.user).order_by('-game_datetime')
            paginator: Paginator = Paginator(games, 10) # Number of items per page

            page_number: str = request.GET.get('page', '1')
            page_obj = paginator.get_page(page_number)

            # Formatting necessary game data to be added to games_data
            games_data: List[Dict[str, Any]] = [create_game_record(game) for game in page_obj]

            return JsonResponse({
                'games': games_data,
                'has_next': page_obj.has_next(),
                'next_page_number': page_obj.next_page_number() if page_obj.has_next() else None,
                'total_pages': paginator.num_pages,
            })
        else:
            # Not authenticated error response
            return JsonResponse({'error': 'Not authenticated'}, status=403)
        
class FavoriteGamesView(TemplateView):
    """View for listing favorite games of a logged-in user"""
    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> JsonResponse:
        if request.user.is_authenticated:
            games: 'QuerySet[Game]' = Game.objects.filter(user=request.user, is_favorite=True).order_by('-game_datetime')
            paginator: Paginator = Paginator(games, 10) # Number of items per page

            page_number: str = request.GET.get('page', '1')
            page_obj = paginator.get_page(page_number)

            # Formatting necessary game data to be added to games_data
            games_data: List[Dict[str, Any]] = [create_game_record(game) for game in page_obj]

            return JsonResponse({
                'games': games_data,
                'has_next': page_obj.has_next(),
                'next_page_number': page_obj.next_page_number() if page_obj.has_next() else None,
                'total_pages': paginator.num_pages,
            })
        else:
            # Not authenticated error response
            return JsonResponse({'error': 'Not authenticated'}, status=403)
        
def create_game_record(game: Game) -> Dict[str, Any]:
    """Takes a game instance and returns a dictionary with its relevant data."""

    return {
        'id': game.id,
        'name': game.name,
        'description': game.description,
        'player_color': game.player_color,
        'game_datetime': game.game_datetime.isoformat(),
        'ai_level': game.ai_level,
        'black_score': game.black_score,
        'white_score': game.white_score,
        'is_favorite': game.is_favorite,
        'total_user_duration': game.total_user_duration,
    }
        
class ToggleFavoriteView(CreateView):
    """View to toggle the favorite status of a game"""
    def post(self, request: HttpRequest, game_id: int) -> JsonResponse:
        """Handles POST request to toggle favorite status"""
        if request.user.is_authenticated:
            try:
                game: Game = Game.objects.get(id=game_id, user=request.user)
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
    """View to get moves of a game"""
    def get(self, request: HttpRequest, game_id: int) -> JsonResponse:
        """Handles GET request to get moves of a game"""
        try:
            game: Game = Game.objects.get(id=game_id)
            # Formatting necessary move data to be added to moves_data
            moves: 'QuerySet[Move]' = game.moves.all().order_by('move_number')
            moves_data: List[Dict[str, Any]] = [{
                'move_number': move.move_number,
                'row': move.row,
                'col': move.col,
                'is_pass': move.is_pass,
                'duration': move.duration,
                'comment': move.comment,
            } for move in moves]
            return JsonResponse({'moves': moves_data})
        except Game.DoesNotExist:
            # Game not found error response
            return JsonResponse({'error': 'Game not found'}, status=404)
    
class PastReplayView(CreateView):
    def get(self, request: HttpRequest, game_id: int) -> HttpResponse:
        return render(request, 'past-replay.html', {'game_id': game_id})

def get_ai_results_for_period(user: User, start_date: date, end_date: Optional[date] = None) -> List[Dict[str, Any]]:
    """Gets the results of AI wins, losses, draws, and fastest win for the specified user and period."""

    games: 'QuerySet[Game]' = Game.objects.filter(user=user, game_datetime__gte=start_date)
    if end_date:
        games = games.filter(game_datetime__lte=end_date)

    results: 'QuerySet[Dict[str, Any]]' = games.values('ai_level').annotate(
        wins=Count(
            Case(
                When(player_color='black', black_score__gt=F('white_score'), then=1),
                When(player_color='white', white_score__gt=F('black_score'), then=1),
                output_field=IntegerField(),
            )
        ),
        losses=Count(
            Case(
                When(player_color='black', black_score__lt=F('white_score'), then=1),
                When(player_color='white', white_score__lt=F('black_score'), then=1),
                output_field=IntegerField(),
            )
        ),
        draws=Count(
            Case(
                When(black_score=F('white_score'), then=1),
                output_field=IntegerField(),
            )
        ),
        fastest_win=Min(
            Case(
                When(player_color='black', black_score__gt=F('white_score'), then=F('total_user_duration')),
                When(player_color='white', white_score__gt=F('black_score'), then=F('total_user_duration')),
                output_field=IntegerField(),
            )
        )
    )
    return list(results)

class DashboardView(CreateView):
    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> JsonResponse:
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=403)

        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        total_results = get_ai_results_for_period(request.user, start_date=timezone.datetime.min)
        today_results = get_ai_results_for_period(request.user, start_date=today)
        month_results = get_ai_results_for_period(request.user, start_date=start_of_month, end_date=today)

        return JsonResponse({
            'today': today_results,
            'this_month': month_results,
            'total': total_results,
        })

@method_decorator(csrf_exempt, name='dispatch')
class UpdateGameNameView(CreateView):
    def post(self, request: HttpRequest, game_id: int) -> JsonResponse:
        try:
            game: Game = Game.objects.get(id=game_id, user=request.user)
            data: Dict[str, Any] = json.loads(request.body)
            game.name = data.get('name', '')
            game.save()
            return JsonResponse({'status': 'success'})
        except Game.DoesNotExist:
            return JsonResponse({'error': 'Game not found'}, status=404)

@method_decorator(csrf_exempt, name='dispatch')
class UpdateGameDescriptionView(CreateView):
    def post(self, request: HttpRequest, game_id: int) -> JsonResponse:
        try:
            game: Game = Game.objects.get(id=game_id, user=request.user)
            data: Dict[str, Any] = json.loads(request.body)
            description: str = data.get('description', '')
            if len(description) <= settings.MAX_DESCRIPTION_LENGTH:
                game.description = description
                game.save()
                return JsonResponse({'status': 'success'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Description is too long'}, status=400)
        except Game.DoesNotExist:
            return JsonResponse({'error': 'Game not found'}, status=404)

class SettingsView(CreateView):
    def get(self, request: HttpRequest, *args: Any, **kwargs: Any) -> JsonResponse:
        return JsonResponse({
            'max_title_length': settings.MAX_TITLE_LENGTH,
            'max_description_length': settings.MAX_DESCRIPTION_LENGTH
        })

class CSRFTokenView(CreateView):
    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        return JsonResponse({'detail': 'CSRF cookie set'})

class SPAView(CreateView):
    def get(self, request, *args, **kwargs):
        with open(str(settings.FRONTEND_BUILD_PATH / 'index.html'), 'r') as file:
            return HttpResponse(file.read())

class GetOpenAICommentView(CreateView):
    def post(self, request, *args, **kwargs):
        # リクエストからリバーシの対局データを取得
        data = json.loads(request.body)
        game_data = data.get('game_data')
        language = data.get('language')

        system_prompt = ""
        user_prompt = ""

        if language == "en":
            system_prompt = "As a highly accomplished reversi player and an insightful coach, your expertise lies in providing in-depth analysis of reversi games, pinpointing critical strategic positions, offering astute recommendations for improvement, and imparting advanced tactical knowledge to help players elevate their skills."
            user_prompt = f"I would like to present a reversi game I recently played, detailed in the following game data: {game_data}. Would you be so kind as to analyze the game from a strategic perspective, sharing your insights and wisdom on how I might refine my play and take my abilities to the next level? Your expert guidance would be greatly appreciated."
        elif language == "ja":
            system_prompt = "あなたは、リバーシにおいて非常に優れた実力を持つプレイヤーであり、洞察力に富んだコーチです。あなたの専門知識は、リバーシの試合に関する深い分析、重要な戦略的局面の特定、改善のための鋭い提言、そしてプレイヤーのスキルを向上させるための高度な戦術知識の伝授にあります。"
            user_prompt = f"私が最近行ったリバーシの対局データを提示させていただきます: {game_data}。この対局を戦略的な観点から分析していただき、私のプレイを磨き、能力を次のレベルに引き上げるためのご見解と知恵を共有していただけませんでしょうか？あなたの専門的なご指導に深く感謝いたします。"
        else:
            assert False, "Unsupported language"

        # OpenAI APIを呼び出し、コメントを取得
        try:
            client = OpenAI(
            api_key=config('OPENAI_API_KEY', default='your_default_api_key'),
            )

            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )

            return JsonResponse({'comment': completion.choices[0].message.content})
        except RateLimitError as e:
            return JsonResponse({'error': 'OpenAI Comment is currently unavailable.'}, status=500)
        except:
            return JsonResponse({'error': 'OpenAI Comment is currently unavailable.'}, status=500)

