from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    # Registration removed per product decision
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Activation (HTTP Email flow)
    path('activate/request/', views.ActivationRequestView.as_view(), name='activate_request'),
    path('activate/confirm/', views.ActivationConfirmView.as_view(), name='activate_confirm'),
    
    # Profile Management
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('avatar/', views.AvatarUploadView.as_view(), name='avatar_upload'),
    
    # Password Reset - Temporarily commented out
    # path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    # path('reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),
    
    # Health Check
    path('health/', views.health_check, name='health_check'),
]
