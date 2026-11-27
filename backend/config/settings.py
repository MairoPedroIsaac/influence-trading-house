"""
config/settings.py — Influence Trading House backend configuration.

All secrets are read from the .env file via python-decouple.
Never hard-code credentials here.
"""

from pathlib import Path
from decouple import config, Csv

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Security ─────────────────────────────────────────────────────────────────
SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost", cast=Csv())

# ─── Application definition ───────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",  # lets logout kill a refresh token
    "storages",  # S3 file storage (local RustFS or AWS S3)
    "corsheaders",
    # Local
    "apps.users",
    "apps.journal",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ─── Database — PostgreSQL ────────────────────────────────────────────────────
# Reads credentials from .env; never falls back to SQLite.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("POSTGRES_DB"),
        "USER": config("POSTGRES_USER"),
        "PASSWORD": config("POSTGRES_PASSWORD"),
        "HOST": config("POSTGRES_HOST", default="localhost"),
        "PORT": config("POSTGRES_PORT", default="5432"),
    }
}

# ─── Custom User Model ────────────────────────────────────────────────────────
# Must be set BEFORE the first migration.
AUTH_USER_MODEL = "users.User"

# ─── Password validation ──────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"          # All timestamps stored and returned in UTC
USE_I18N = True
USE_TZ = True

# ─── Static files ─────────────────────────────────────────────────────────────
STATIC_URL = "static/"

# ─── Uploaded files (profile photos) ─────────────────────────────────────────
# USE_S3=True: files go to an S3 bucket. Locally that is RustFS in Docker
# (AWS_S3_ENDPOINT_URL set, with keys). On AWS: no endpoint and no keys,
# the server's IAM role gives access. The bucket stays private: the API hands
# out signed links that expire after 1 hour.
# USE_S3=False: files are saved in backend/media (used by tests and CI).
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
USE_S3 = config("USE_S3", default=False, cast=bool)

if USE_S3:
    _default_storage = {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "bucket_name": config("AWS_STORAGE_BUCKET_NAME"),
            "endpoint_url": config("AWS_S3_ENDPOINT_URL", default="") or None,
            "access_key": config("AWS_ACCESS_KEY_ID", default="") or None,
            "secret_key": config("AWS_SECRET_ACCESS_KEY", default="") or None,
            "region_name": config("AWS_S3_REGION_NAME", default="us-east-1"),
            "addressing_style": "path",
            "signature_version": "s3v4",
            "default_acl": None,          # private objects
            "querystring_auth": True,     # signed links
            "querystring_expire": 3600,   # 1 hour
            "file_overwrite": False,
        },
    }
else:
    _default_storage = {"BACKEND": "django.core.files.storage.FileSystemStorage"}

STORAGES = {
    "default": _default_storage,
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}

# Largest profile photo accepted, in bytes (2 MB).
AVATAR_MAX_BYTES = 2 * 1024 * 1024
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── Django REST Framework ────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    # Rate limits for sensitive endpoints (per IP), to slow down password guessing.
    "DEFAULT_THROTTLE_RATES": {
        "auth": "10/min",
        "password_reset": "5/hour",
        "upload": "20/hour",
        "mt5": "120/min",
    },
}

# ─── SimpleJWT ────────────────────────────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="http://localhost:5173", cast=Csv())


# ─── Email ────────────────────────────────────────────────────────────────────
# Development: emails are printed in the runserver terminal (console backend).
# Production (AWS): switch to SMTP / Amazon SES through .env.
EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = config("EMAIL_HOST", default="")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="Influence Trading House <no-reply@localhost>")

# Where the React app lives (used to build password reset links).
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:5173")

# Password reset links expire after 1 hour.
PASSWORD_RESET_TIMEOUT = 60 * 60

# ─── Google sign in ───────────────────────────────────────────────────────────
# OAuth client ID from Google Cloud Console (Credentials > OAuth client ID > Web).
GOOGLE_CLIENT_ID = config("GOOGLE_CLIENT_ID", default="")
