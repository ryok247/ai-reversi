from .forms import SignupForm
from .forms import SignupForm, LoginForm
from django.shortcuts import render
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import TemplateView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin

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
        context['users'] = User.objects.exclude(username=self.request.user.username)
        return context