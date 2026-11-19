"""
config/urls.py — Root URL configuration.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # API v1
    path("api/v1/", include("apps.users.urls")),
    path("api/v1/", include("apps.journal.urls")),
]

# Development only: serve files saved in backend/media (when USE_S3=False).
if settings.DEBUG and not settings.USE_S3:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
