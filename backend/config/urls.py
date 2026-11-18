"""
config/urls.py — Root URL configuration.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # API v1
    path("api/v1/", include("apps.users.urls")),
    path("api/v1/", include("apps.journal.urls")),
]
