"""
apps/users/serializers.py - DRF serializers for accounts.

Serializers convert between Python objects (Django models) and JSON.
Think of them as the form validation layer for your API.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

User = get_user_model()


def check_password_rules(password, user=None):
    """Run Django's password rules and turn errors into DRF errors."""
    try:
        validate_password(password, user=user)
    except DjangoValidationError as exc:
        raise serializers.ValidationError({"password": list(exc.messages)})


class RegisterSerializer(serializers.ModelSerializer):
    """Accepts email + password, creates a new user."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "password", "first_name", "last_name"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, data):
        # Not too common, not all numbers, not too similar to the email or name.
        check_password_rules(data["password"], User(**{k: v for k, v in data.items() if k != "password"}))
        return data

    def create(self, validated_data):
        # Use create_user so the password is properly hashed
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    """The logged-in user's profile. Only the names can be changed."""

    has_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "date_joined", "has_password"]
        read_only_fields = ["id", "email", "date_joined", "has_password"]

    def get_has_password(self, obj):
        # False for accounts created with Google only.
        return obj.has_usable_password()


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context["request"].user
        # Google-only accounts have no current password yet, so they can set one.
        if user.has_usable_password() and not user.check_password(data.get("current_password", "")):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})
        try:
            validate_password(data["new_password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)})
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)


class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField()  # the ID token from Google's button
