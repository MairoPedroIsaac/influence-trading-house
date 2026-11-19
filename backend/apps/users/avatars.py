"""
apps/users/avatars.py - Checks and cleans an uploaded profile photo.

Every photo is opened with Pillow (so fake or broken files are rejected),
turned the right way up, cropped to a square, shrunk to 256 x 256 and saved
as WebP. Re-saving also removes hidden photo data such as GPS location.
"""

from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
SIZE = 256
MAX_PIXELS = 40_000_000  # refuse giant images that could use too much memory


class AvatarError(ValueError):
    """A message that is safe to show the user."""


def process_avatar(upload) -> ContentFile:
    if upload.size > settings.AVATAR_MAX_BYTES:
        raise AvatarError("Photo is too big. The limit is 2 MB.")
    try:
        image = Image.open(upload)
        if image.format not in ALLOWED_FORMATS:
            raise AvatarError("Use a JPG, PNG or WebP photo.")
        if image.width * image.height > MAX_PIXELS:
            raise AvatarError("Photo is too large in size. Use a smaller photo.")
        image.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise AvatarError("This file is not a valid image.")

    image = ImageOps.exif_transpose(image)
    image = image.convert("RGBA" if image.mode in ("RGBA", "LA", "P") else "RGB")
    image = ImageOps.fit(image, (SIZE, SIZE), Image.Resampling.LANCZOS)

    out = BytesIO()
    image.save(out, format="WEBP", quality=85, method=6)
    return ContentFile(out.getvalue(), name="avatar.webp")
