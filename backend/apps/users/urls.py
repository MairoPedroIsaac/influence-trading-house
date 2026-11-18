"""
apps/users/urls.py - Account routes, included at /api/v1/.

  POST  auth/register/          create account
  POST  auth/login/             email + password -> access + refresh
  POST  auth/refresh/           new access token
  POST  auth/logout/            kill the refresh token
  POST  auth/google/            sign in / sign up with Google
  GET   auth/me/                my profile
  PATCH auth/me/                change my name
  POST  auth/password/change/   change password (logged in)
  POST  auth/password/forgot/   email me a reset link
  POST  auth/password/reset/    set a new password from the link
"""

from django.urls import path

from .views import (
    ChangePasswordView,
    ForgotPasswordView,
    GoogleLoginView,
    LoginView,
    LogoutView,
    MeView,
    RefreshView,
    RegisterView,
    ResetPasswordView,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", RefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/google/", GoogleLoginView.as_view(), name="google_login"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/password/change/", ChangePasswordView.as_view(), name="password_change"),
    path("auth/password/forgot/", ForgotPasswordView.as_view(), name="password_forgot"),
    path("auth/password/reset/", ResetPasswordView.as_view(), name="password_reset"),
]
