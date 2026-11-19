"""
apps/users/models.py — Custom User model using email as the login field.

Why a custom model?
  Django's built-in User uses 'username'. We want email-based auth.
  This model must exist BEFORE the first `python manage.py migrate` is run.
  Changing AUTH_USER_MODEL after the first migrate is very painful.

AbstractBaseUser gives us full control over authentication fields.
PermissionsMixin adds groups, permissions, and is_superuser.
BaseUserManager gives us the helpers to create users/superusers via the CLI.
"""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

from django.db import models


class UserManager(BaseUserManager):
    """Custom manager: email is the unique identifier, no username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("An email address is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


def avatar_path(instance, filename):
    """Each upload gets a new random name, so old links never show a new photo."""
    return f"avatars/{instance.pk}/{uuid.uuid4().hex}.webp"


class User(AbstractBaseUser, PermissionsMixin):
    """
    Platform user. Identified by email, no username field.
    All timestamps are stored in UTC (enforced by USE_TZ=True in settings).
    """

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    avatar = models.ImageField(upload_to=avatar_path, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)   # can access Django admin

    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    # Tell Django to use email for login instead of username
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # email + password already required by default

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email
