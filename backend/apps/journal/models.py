"""
apps/journal/models.py - One row per trade.

Trades are entered by hand for now. Later the MT5 indicator/EA will post
them to the API, so the fields match what the BTMM alert gives us.
"""

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
    stop_loss = models.DecimalField(max_digits=12, decimal_places=5)
    take_profit = models.DecimalField(max_digits=12, decimal_places=5)
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
    mt5_ticket = models.BigIntegerField(null=True, blank=True, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-opened_at"]

    def __str__(self):
        return f"{self.side} {self.symbol} {self.entry_price} ({self.status})"

    @property
    def risk_reward(self):
        """Planned reward divided by planned risk, e.g. 2.0 for 2R."""
        risk = abs(self.entry_price - self.stop_loss)
        reward = abs(self.take_profit - self.entry_price)
        return round(float(reward / risk), 2) if risk else None
