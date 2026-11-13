"""
config/urls.py — Root URL configuration.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # API v1 — more apps will be added in Step 2
    path("api/v1/", include("apps.users.urls")),
]
