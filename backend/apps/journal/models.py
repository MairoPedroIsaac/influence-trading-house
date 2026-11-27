"""
apps/journal/models.py - One row per trade.

Trades are entered by hand, or sent automatically by the ITH Reporter EA
in MT5 (see mt5.py). MT5 trades are matched by their position ticket.
"""

import hashlib
import secrets

from django.conf import settings
from django.db import models


class Trade(models.Model):
    class Side(models.TextChoices):
        BUY = "BUY", "Buy"
        SELL = "SELL", "Sell"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        WIN = "WIN", "Win"
        LOSS = "LOSS", "Loss"
        BREAKEVEN = "BE", "Breakeven"

    class Source(models.TextChoices):
        MANUAL = "MANUAL", "Manual"
        MT5 = "MT5", "MT5"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trades"
    )
    strategy = models.CharField(max_length=30, default="BTMM")
    symbol = models.CharField(max_length=20)
    side = models.CharField(max_length=4, choices=Side.choices)
    lots = models.DecimalField(max_digits=8, decimal_places=2)

    entry_price = models.DecimalField(max_digits=12, decimal_places=5)
    # Empty when the trade was opened in MT5 without a stop loss / take profit.
    stop_loss = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    take_profit = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)
    exit_price = models.DecimalField(max_digits=12, decimal_places=5, null=True, blank=True)

    opened_at = models.DateTimeField()
    closed_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=4, choices=Status.choices, default=Status.OPEN)
    profit = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="Money result in account currency, from MT5.",
    )
    notes = models.TextField(blank=True)
    screenshot = models.URLField(blank=True)

    source = models.CharField(max_length=6, choices=Source.choices, default=Source.MANUAL)
    mt5_ticket = models.BigIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-opened_at"]
        constraints = [
            # The same MT5 ticket can exist for two users on different brokers.
            models.UniqueConstraint(fields=["user", "mt5_ticket"], name="unique_mt5_ticket_per_user"),
        ]

    def __str__(self):
        return f"{self.side} {self.symbol} {self.entry_price} ({self.status})"

    @property
    def risk_reward(self):
        """Planned reward divided by planned risk, e.g. 2.0 for 2R."""
        if self.stop_loss is None or self.take_profit is None:
            return None
        risk = abs(self.entry_price - self.stop_loss)
        reward = abs(self.take_profit - self.entry_price)
        return round(float(reward / risk), 2) if risk else None


class MT5Key(models.Model):
    """Secret key the ITH Reporter EA uses to send trades for one user.

    Only a hash is stored. The full key is shown once, when it is made.
    """

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mt5_key")
    key_hash = models.CharField(max_length=64, unique=True)
    prefix = models.CharField(max_length=12)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    @staticmethod
    def hash(raw):
        return hashlib.sha256(raw.encode()).hexdigest()

    @classmethod
    def issue(cls, user):
        """Make a new key for this user (replacing any old one). Returns the raw key."""
        raw = "ith_" + secrets.token_urlsafe(32)
        cls.objects.update_or_create(user=user, defaults={"key_hash": cls.hash(raw), "prefix": raw[:12]})
        return raw

    def __str__(self):
        return f"MT5 key {self.prefix}... for {self.user}"
