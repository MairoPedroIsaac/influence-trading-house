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


class MT5SyncTests(APITestCase):
    """The ITH Reporter EA sends trades with an X-ITH-Key header."""

    def setUp(self):
        self.mairo = User.objects.create_user(email="mairo@test.com", password="pass12345")
        self.other = User.objects.create_user(email="other@test.com", password="pass12345")
        self.client.force_authenticate(user=self.mairo)
        self.key = self.client.post("/api/v1/mt5/key/").data["key"]
        self.client.force_authenticate(user=None)

    def send(self, body, key=None):
        return self.client.post(
            "/api/v1/mt5/trades/", body, format="json", HTTP_X_ITH_KEY=key or self.key
        )

    OPEN = {
        "ticket": 555, "symbol": "usdjpy", "side": "SELL", "lots": "4.64",
        "entry_price": "159.906", "stop_loss": "159.978", "take_profit": "159.720",
        "opened_at": "2026-11-19T15:00:00Z", "magic": 260001, "comment": "BTMM",
    }

    def test_key_is_shown_once_and_only_hash_saved(self):
        from .models import MT5Key
        saved = MT5Key.objects.get(user=self.mairo)
        self.assertTrue(self.key.startswith("ith_"))
        self.assertNotEqual(saved.key_hash, self.key)
        self.client.force_authenticate(user=self.mairo)
        info = self.client.get("/api/v1/mt5/key/").data
        self.assertTrue(info["exists"])
        self.assertNotIn("key", info)

    def test_no_key_or_wrong_key_is_refused(self):
        res = self.client.post("/api/v1/mt5/trades/", self.OPEN, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        res = self.send(self.OPEN, key="ith_wrong")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_open_then_close_updates_same_trade(self):
        res = self.send(self.OPEN)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["status"], "OPEN")
        self.assertEqual(res.data["strategy"], "BTMM")
        self.assertEqual(res.data["source"], "MT5")

        closed = {**self.OPEN, "closed": True, "exit_price": "159.720",
                  "closed_at": "2026-11-19T15:36:52Z", "profit": "540.35"}
        res = self.send(closed)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "WIN")
        self.assertEqual(Trade.objects.filter(user=self.mairo).count(), 1)

    def test_loss_and_missing_stop_loss(self):
        body = {**self.OPEN, "ticket": 777, "stop_loss": 0, "take_profit": 0, "magic": 0, "comment": "",
                "closed": True, "exit_price": "160.000", "profit": "-120.50"}
        res = self.send(body)
        self.assertEqual(res.data["status"], "LOSS")
        self.assertIsNone(res.data["stop_loss"])
        self.assertIsNone(res.data["risk_reward"])
        self.assertEqual(res.data["strategy"], "Manual")

    def test_trades_go_to_the_key_owner_only(self):
        self.send(self.OPEN)
        self.assertEqual(Trade.objects.filter(user=self.other).count(), 0)

    def test_new_key_replaces_old_one(self):
        self.client.force_authenticate(user=self.mairo)
        new_key = self.client.post("/api/v1/mt5/key/").data["key"]
        self.client.force_authenticate(user=None)
        self.assertEqual(self.send(self.OPEN).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.send(self.OPEN, key=new_key).status_code, status.HTTP_201_CREATED)
