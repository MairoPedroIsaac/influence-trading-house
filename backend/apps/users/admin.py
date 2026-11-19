"""
apps/users/admin.py — Register the custom User model with Django admin.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin panel configuration for the custom User model."""

    ordering = ["email"]
    list_display = ["email", "first_name", "last_name", "is_staff", "is_active", "date_joined"]
    search_fields = ["email", "first_name", "last_name"]

    # Fieldsets for the edit/detail view
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "avatar")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    readonly_fields = ["date_joined", "last_login"]

    # Fieldsets for the "add user" form in admin
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "is_staff", "is_active"),
        }),
    )
