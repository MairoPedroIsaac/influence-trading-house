"""
apps/journal/tests.py - Tests for the Trade API.
Run with: python manage.py test
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Trade

User = get_user_model()

SELL_TRADE = {
    "symbol": "eurusd",
    "side": "SELL",
    "lots": "1.00",
    "entry_price": "1.10002",
    "stop_loss": "1.10250",
    "take_profit": "1.09500",
    "opened_at": "2026-11-17T12:00:00Z",
}


class TradeApiTests(APITestCase):
    def setUp(self):
        self.mairo = User.objects.create_user(email="mairo@test.com", password="pass12345")
        self.other = User.objects.create_user(email="other@test.com", password="pass12345")
        self.url = "/api/v1/trades/"

    def login(self, user):
        self.client.force_authenticate(user=user)

    def test_must_be_logged_in(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_trade_belongs_to_me(self):
        self.login(self.mairo)
        res = self.client.post(self.url, SELL_TRADE, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        trade = Trade.objects.get(id=res.data["id"])
        self.assertEqual(trade.user, self.mairo)
        self.assertEqual(trade.symbol, "EURUSD")
        self.assertEqual(res.data["risk_reward"], 2.02)

    def test_i_only_see_my_trades(self):
        self.login(self.mairo)
        self.client.post(self.url, SELL_TRADE, format="json")
        self.login(self.other)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_cannot_open_or_edit_someone_elses_trade(self):
        self.login(self.mairo)
        trade_id = self.client.post(self.url, SELL_TRADE, format="json").data["id"]
        self.login(self.other)
        detail = f"{self.url}{trade_id}/"
        self.assertEqual(self.client.get(detail).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            self.client.patch(detail, {"notes": "hack"}, format="json").status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertEqual(self.client.delete(detail).status_code, status.HTTP_404_NOT_FOUND)

    def test_sell_with_wrong_stop_loss_is_rejected(self):
        self.login(self.mairo)
        bad = {**SELL_TRADE, "stop_loss": "1.09000"}  # below entry on a SELL
        res = self.client.post(self.url, bad, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_close_a_trade(self):
        self.login(self.mairo)
        trade_id = self.client.post(self.url, SELL_TRADE, format="json").data["id"]
        res = self.client.patch(
            f"{self.url}{trade_id}/",
            {"status": "WIN", "exit_price": "1.09500",
             "closed_at": "2026-11-18T08:00:00Z", "profit": "502.00"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data["status"], "WIN")

    def test_filter_by_status(self):
        self.login(self.mairo)
        self.client.post(self.url, SELL_TRADE, format="json")
        self.assertEqual(len(self.client.get(self.url + "?status=open").data), 1)
        self.assertEqual(len(self.client.get(self.url + "?status=win").data), 0)
