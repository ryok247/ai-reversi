from .forms import SignupForm
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
    return render(request, 'index.html')

home = index

class MySignupView(CreateView):
    template_name = 'signup.html'
    form_class = SignupForm
    success_url = '/'
    
    def form_valid(self, form):
        result = super().form_valid(form)
        user = self.object
        login(self.request, user)
        return result

class MyLoginView(LoginView):
    template_name = 'login.html'
    form_class = LoginForm

    def get_success_url(self):
        """ ユーザーがログイン後にリダイレクトされるURLを指定 """
        return self.request.GET.get('next', '/')

class MyLogoutView(CreateView):
    def get(self, request):
        logout(request)
        return redirect('/')

class MyUserView(LoginRequiredMixin, TemplateView):
    template_name = 'user.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context

class MyOtherView(LoginRequiredMixin, TemplateView):
    template_name = 'other.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['users'] = CustomUser.objects.exclude(username=self.request.user.username)
        return context

#@method_decorator(csrf_exempt, name='dispatch')
class SaveGameView(CreateView):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)

        # ゲームデータの作成
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

        # 各ムーブの保存
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
        return JsonResponse({'status': 'error'}, status=400)

class GameDetailsView(CreateView):
    def get(self, request, game_id):
        try:
            game = Game.objects.get(id=game_id)
            return JsonResponse({
                'player_color': game.player_color,
                'game_datetime': game.game_datetime.isoformat(),
                'ai_level': game.ai_level,
                'black_score': game.black_score,
                'white_score': game.white_score
            })
        except Game.DoesNotExist:
            return JsonResponse({'error': 'Game not found'}, status=404)
        
class UpdateGameRecordsView(CreateView):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        game_ids = data.get('game_ids', [])
        if request.user.is_authenticated:
            Game.objects.filter(id__in=game_ids).update(user=request.user)
            return JsonResponse({'status': 'success'})
        return JsonResponse({'status': 'error', 'message': 'User not authenticated'}, status=403)

class UserGamesView(TemplateView):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            games = Game.objects.filter(user=request.user).order_by('-game_datetime')
            paginator = Paginator(games, 10)  # 1ページあたりのアイテム数

            page_number = request.GET.get('page', 1)
            page_obj = paginator.get_page(page_number)

            games_data = []
            for game in page_obj:
                # 必要なゲームデータを整形してgames_dataに追加
                games_data.append({
                    'id': game.id,
                    'player_color': game.player_color,
                    'game_datetime': game.game_datetime.isoformat(),
                    'ai_level': game.ai_level,
                    'black_score': game.black_score,
                    'white_score': game.white_score,
                    # その他必要なデータ
                })

            return JsonResponse({
                'games': games_data,
                'has_next': page_obj.has_next(),
                'next_page_number': page_obj.next_page_number() if page_obj.has_next() else None
            })

        else:
            return JsonResponse({'error': 'Not authenticated'}, status=403)
