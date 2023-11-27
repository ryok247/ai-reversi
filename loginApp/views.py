# loginApp/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages

def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Invalid login credentials.')
    return render(request, 'login.html')

def user_logout(request):
    logout(request)
    return redirect('login')

# loginApp/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from .forms import RegistrationForm

def index(request):
    return render(request, 'index.html')

home = index

def user_registration(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            # フォームが妥当な場合はユーザーを作成
            user = form.save()
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Invalid registration data.')
    else:
        form = RegistrationForm()

    return render(request, 'registration.html', {'form': form})