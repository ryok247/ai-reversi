from . import views
from django.urls import path, re_path
from django.conf.urls.static import static
from loginProject import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.static import serve

urlpatterns = [
    path('', views.index, name='index'),
    path('home/', views.home, name='home'),
    path('api/signup/', views.MySignupView.as_view(), name='signup'),
    path('api/login/', views.MyLoginView.as_view(), name='login'),
    path('api/logout/', views.MyLogoutView.as_view(), name='logout'),
    path('api/save_game/', views.SaveGameView.as_view(), name='save_game'),
    path('api/get_game_details/<int:game_id>/', views.GameDetailsView.as_view(), name='game_details'),
    path('api/update_game_records/', views.UpdateGameRecordsView.as_view(), name='update_game_records'),
    path('api/user_games/', views.UserGamesView.as_view(), name='user_games'),
    path('api/favorite_games/', views.FavoriteGamesView.as_view(), name='favorite_games'),
    path('api/toggle_favorite/<int:game_id>/', views.ToggleFavoriteView.as_view(), name='toggle_favorite'),
    path('api/get_moves/<int:game_id>/', views.GetMovesView.as_view(), name='get_moves'),
    #path('past_replay/<int:game_id>/', views.PastReplayView.as_view(), name='past_replay'),
    path('api/dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('api/update_game_name/<int:game_id>/', views.UpdateGameNameView.as_view(), name='update_game_name'),
    path('api/update_game_description/<int:game_id>/', views.UpdateGameDescriptionView.as_view(), name='update_game_description'),
    path('api/settings', views.SettingsView.as_view(), name='api-settings'),
    path('api/csrf/', views.CSRFTokenView.as_view(), name='csrf'),
    path('api/check-auth-status/', views.CheckAuthStatusView.as_view(), name='check_auth_status'),
    path('api/get-openai-comment/', views.GetOpenAICommentView.as_view(), name='get_openai_comment'),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# 開発環境での静的ファイルのサーブ
urlpatterns += staticfiles_urlpatterns()

# SPA用のキャッチオールルートを最後に追加
urlpatterns += [
    re_path(r'^(?!api/).*$', views.SPAView.as_view(), name='spa'),
]