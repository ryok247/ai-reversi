from . import views
from django.urls import path
from django.conf.urls.static import static
from loginProject import settings

urlpatterns = [
    path('', views.index, name='index'),
    path('home/', views.home, name='home'),
    path('signup/', views.MySignupView.as_view(), name='signup'),
    path('login/', views.MyLoginView.as_view(), name='login'),
    path('logout/', views.MyLogoutView.as_view(), name='logout'),
    path('user/', views.MyUserView.as_view(), name='user'),
    path('other/', views.MyOtherView.as_view(), name='other'),
    path('save_game/', views.SaveGameView.as_view(), name='save_game'),
    path('get_game_details/<int:game_id>/', views.GameDetailsView.as_view(), name='game_details'),
    path('update_game_records/', views.UpdateGameRecordsView.as_view(), name='update_game_records'),
    path('user_games/', views.UserGamesView.as_view(), name='user_games'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)