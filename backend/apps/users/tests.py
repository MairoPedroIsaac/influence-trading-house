"""
apps/users/tests.py - Tests for accounts: sign up, login, profile, Google,
password change / forgot / reset, logout.
"""

import re
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()
GOOD = "Strong-pass-2026"


class AuthTestCase(APITestCase):
    def setUp(self):
        cache.clear()  # reset rate limits between tests

    def make_user(self, email="mairo@test.com", password=GOOD):
        return User.objects.create_user(email=email, password=password)

    def login(self, email="mairo@test.com", password=GOOD):
        return self.client.post("/api/v1/auth/login/", {"email": email, "password": password}, format="json")


class RegisterTests(AuthTestCase):
    url = "/api/v1/auth/register/"

    def test_register_with_good_password(self):
        res = self.client.post(self.url, {"email": "New@Test.com", "password": GOOD}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertNotIn("password", res.data)
        self.assertTrue(User.objects.filter(email="new@test.com").exists())

    def test_common_password_rejected(self):
        res = self.client.post(self.url, {"email": "a@test.com", "password": "password123"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_numbers_only_password_rejected(self):
        res = self.client.post(self.url, {"email": "b@test.com", "password": "84736251"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email_rejected(self):
        self.make_user()
        res = self.client.post(self.url, {"email": "MAIRO@test.com", "password": "Another-pass-2026"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(AuthTestCase):
    def test_login_and_me(self):
        self.make_user()
        res = self.login()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        me = self.client.get("/api/v1/auth/me/")
        self.assertEqual(me.data["email"], "mairo@test.com")
        self.assertTrue(me.data["has_password"])

    def test_wrong_password(self):
        self.make_user()
        self.assertEqual(self.login(password="wrong-pass").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_too_many_login_attempts_are_blocked(self):
        self.make_user()
        codes = [self.login(password="wrong-pass").status_code for _ in range(11)]
        self.assertEqual(codes[-1], status.HTTP_429_TOO_MANY_REQUESTS)


class ProfileTests(AuthTestCase):
    def test_update_name_but_not_email(self):
        user = self.make_user()
        self.client.force_authenticate(user)
        res = self.client.patch("/api/v1/auth/me/", {"first_name": "Mairo", "email": "hack@test.com"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.first_name, "Mairo")
        self.assertEqual(user.email, "mairo@test.com")


class LogoutTests(AuthTestCase):
    def test_refresh_token_dies_after_logout(self):
        self.make_user()
        tokens = self.login().data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        res = self.client.post("/api/v1/auth/logout/", {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        again = self.client.post("/api/v1/auth/refresh/", {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(again.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangePasswordTests(AuthTestCase):
    url = "/api/v1/auth/password/change/"

    def test_change_password(self):
        user = self.make_user()
        self.client.force_authenticate(user)
        res = self.client.post(self.url, {"current_password": GOOD, "new_password": "New-strong-pass-77"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.client.force_authenticate(None)
        self.assertEqual(self.login(password="New-strong-pass-77").status_code, status.HTTP_200_OK)

    def test_wrong_current_password(self):
        user = self.make_user()
        self.client.force_authenticate(user)
        res = self.client.post(self.url, {"current_password": "nope", "new_password": "New-strong-pass-77"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_must_be_logged_in(self):
        res = self.client.post(self.url, {"current_password": GOOD, "new_password": "New-strong-pass-77"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class ForgotAndResetTests(AuthTestCase):
    def forgot(self, email):
        return self.client.post("/api/v1/auth/password/forgot/", {"email": email}, format="json")

    def test_unknown_email_gets_same_answer_and_no_email(self):
        self.make_user()
        known = self.forgot("mairo@test.com")
        unknown = self.forgot("nobody@test.com")
        self.assertEqual(known.status_code, unknown.status_code)
        self.assertEqual(known.data, unknown.data)
        self.assertEqual(len(mail.outbox), 1)

    def test_full_reset_flow(self):
        self.make_user()
        self.forgot("mairo@test.com")
        link = re.search(r"uid=(\S+)&token=(\S+)", mail.outbox[0].body)
        uid, token = link.group(1), link.group(2)
        url = "/api/v1/auth/password/reset/"
        res = self.client.post(url, {"uid": uid, "token": token, "new_password": "Brand-new-pass-88"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(self.login(password="Brand-new-pass-88").status_code, status.HTTP_200_OK)
        # The same link cannot be used twice.
        again = self.client.post(url, {"uid": uid, "token": token, "new_password": "Other-new-pass-99"}, format="json")
        self.assertEqual(again.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bad_token_rejected(self):
        self.make_user()
        res = self.client.post(
            "/api/v1/auth/password/reset/",
            {"uid": "MQ", "token": "fake-token", "new_password": "Brand-new-pass-88"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(GOOGLE_CLIENT_ID="test-client-id")
class GoogleLoginTests(AuthTestCase):
    url = "/api/v1/auth/google/"

    @patch("apps.users.views.verify_google_token")
    def test_new_google_user_is_created(self, verify):
        verify.return_value = {"email": "G.User@Gmail.com", "email_verified": True, "given_name": "Ada"}
        res = self.client.post(self.url, {"credential": "x"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertIn("access", res.data)
        user = User.objects.get(email="g.user@gmail.com")
        self.assertFalse(user.has_usable_password())
        self.assertEqual(user.first_name, "Ada")

    @patch("apps.users.views.verify_google_token")
    def test_existing_user_logs_in(self, verify):
        self.make_user(email="mairo@gmail.com")
        verify.return_value = {"email": "mairo@gmail.com", "email_verified": True}
        res = self.client.post(self.url, {"credential": "x"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(email="mairo@gmail.com").count(), 1)

    @patch("apps.users.views.verify_google_token", side_effect=ValueError("bad"))
    def test_fake_token_rejected(self, verify):
        res = self.client.post(self.url, {"credential": "fake"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("apps.users.views.verify_google_token")
    def test_unverified_email_rejected(self, verify):
        verify.return_value = {"email": "x@gmail.com", "email_verified": False}
        res = self.client.post(self.url, {"credential": "x"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
