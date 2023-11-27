# loginApp/urls.py
from django.urls import path
from .views import index, home, user_login, user_logout, user_registration

urlpatterns = [
    path('', index, name='index'),
    path('home/', home, name='home'),
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('register/', user_registration, name='register'),
]