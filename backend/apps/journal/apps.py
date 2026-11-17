"""
apps/journal/apps.py - App configuration for the trade journal.
"""

from django.apps import AppConfig


class JournalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.journal"
    verbose_name = "Trade Journal"
