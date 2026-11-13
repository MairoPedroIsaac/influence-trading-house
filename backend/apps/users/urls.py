"""
apps/users/urls.py — URL routes for the users app.

These are included at /api/v1/ by config/urls.py.
Final URLs will be:
  POST /api/v1/auth/register/   → create account
  POST /api/v1/auth/login/      → get access + refresh tokens (SimpleJWT)
  POST /api/v1/auth/refresh/    → get a new access token using a refresh token
  GET  /api/v1/auth/me/         → current user's profile
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MeView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
]
