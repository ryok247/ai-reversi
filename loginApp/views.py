from .forms import SignupForm
from .forms import SignupForm, LoginForm
from .models import CustomUser, Game, Move
from django.shortcuts import render
from django.contrib.auth import login
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import TemplateView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

def index(request):
    return render(request, 'index.html')

home = index

class MySignupView(CreateView):
    template_name = 'signup.html'
    form_class = SignupForm
    success_url = '/user/'
    
    def form_valid(self, form):
        result = super().form_valid(form)
        user = self.object
        login(self.request, user)
        return result

class MyLoginView(LoginView):
    template_name = 'login.html'
    form_class = LoginForm

class MyLogoutView(LogoutView):
    template_name = 'logout.html'

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

        return JsonResponse({'status': 'success'})

    def get(self, request, *args, **kwargs):
        return JsonResponse({'status': 'error'}, status=400)

