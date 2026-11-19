"""
apps/users/views.py - Account API: sign up, profile, Google sign in,
password change / forgot / reset, and logout.

SimpleJWT provides the login and token-refresh views; we add a rate limit.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.contrib.auth.password_validation import validate_password
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .avatars import AvatarError, process_avatar
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    GoogleLoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)

User = get_user_model()


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class AuthThrottleMixin:
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class RegisterView(AuthThrottleMixin, generics.CreateAPIView):
    """POST /api/v1/auth/register/ - open, no login needed."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(AuthThrottleMixin, TokenObtainPairView):
    """POST /api/v1/auth/login/ - email + password, returns access + refresh."""


class RefreshView(TokenRefreshView):
    """POST /api/v1/auth/refresh/ - new access (and refresh) token."""


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/v1/auth/me/  - my profile
    PATCH /api/v1/auth/me/  - change my first / last name
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch"]

    def get_object(self):
        return self.request.user


class AvatarView(APIView):
    """
    POST   /api/v1/auth/me/avatar/  (form field "avatar")  upload or replace my photo
    DELETE /api/v1/auth/me/avatar/                          remove my photo
    Both return my updated profile.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "upload"

    def post(self, request):
        upload = request.FILES.get("avatar")
        if not upload:
            return Response({"avatar": "Choose a photo to upload."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            cleaned = process_avatar(upload)
        except AvatarError as exc:
            return Response({"avatar": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        old = user.avatar.name if user.avatar else None
        user.avatar.save(cleaned.name, cleaned, save=True)
        if old:
            user.avatar.storage.delete(old)
        return Response(UserSerializer(user).data)

    def delete(self, request):
        user = request.user
        if user.avatar:
            name = user.avatar.name
            user.avatar = None
            user.save(update_fields=["avatar"])
            user._meta.get_field("avatar").storage.delete(name)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ {refresh} - the refresh token stops working."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            RefreshToken(request.data.get("refresh", "")).blacklist()
        except TokenError:
            pass  # already expired or invalid: the user is logged out anyway
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    """POST /api/v1/auth/password/change/ {current_password, new_password}"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password changed."})


class ForgotPasswordView(APIView):
    """
    POST /api/v1/auth/password/forgot/ {email}
    Always answers the same way, so nobody can test which emails have accounts.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            send_mail(
                subject="Reset your Influence Trading House password",
                message=(
                    "Someone asked to reset the password for your Influence Trading House account.\n\n"
                    f"Open this link to choose a new password (it works for 1 hour):\n{link}\n\n"
                    "If this was not you, you can ignore this email. Your password has not changed."
                ),
                from_email=None,
                recipient_list=[user.email],
            )
        return Response({"detail": "If an account exists for that email, a reset link has been sent."})


class ResetPasswordView(APIView):
    """POST /api/v1/auth/password/reset/ {uid, token, new_password}"""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        bad_link = Response(
            {"detail": "This reset link is invalid or has expired. Ask for a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(data["uid"])))
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return bad_link
        if not default_token_generator.check_token(user, data["token"]):
            return bad_link
        try:
            validate_password(data["new_password"], user=user)
        except DjangoValidationError as exc:
            return Response({"new_password": list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)
        # Setting the password also makes this link (and any older ones) stop working.
        user.set_password(data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password reset. You can now log in."})


def verify_google_token(credential):
    """Checks the token really came from Google for OUR app. Returns its data."""
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token

    return id_token.verify_oauth2_token(credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID)


class GoogleLoginView(AuthThrottleMixin, APIView):
    """
    POST /api/v1/auth/google/ {credential}
    Signs in (or signs up) with a Google account. Returns access + refresh.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not settings.GOOGLE_CLIENT_ID:
            return Response({"detail": "Google sign in is not set up."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            info = verify_google_token(serializer.validated_data["credential"])
        except ValueError:
            return Response({"detail": "Google sign in failed. Try again."}, status=status.HTTP_400_BAD_REQUEST)
        if not info.get("email") or not info.get("email_verified"):
            return Response({"detail": "Your Google email is not verified."}, status=status.HTTP_400_BAD_REQUEST)

        email = info["email"].strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.create_user(
                email=email,
                password=None,  # Google-only account: no password until they set one
                first_name=info.get("given_name", "")[:150],
                last_name=info.get("family_name", "")[:150],
            )
        if not user.is_active:
            return Response({"detail": "This account is disabled."}, status=status.HTTP_403_FORBIDDEN)
        return Response(tokens_for(user))
