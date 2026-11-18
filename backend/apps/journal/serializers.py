"""
apps/journal/serializers.py - Converts trades to and from JSON.
"""

from rest_framework import serializers

from .models import Trade


class TradeSerializer(serializers.ModelSerializer):
    risk_reward = serializers.FloatField(read_only=True)

    class Meta:
        model = Trade
        fields = [
            "id", "strategy", "symbol", "side", "lots",
            "entry_price", "stop_loss", "take_profit", "exit_price",
            "opened_at", "closed_at", "status", "profit",
            "notes", "screenshot", "source", "mt5_ticket",
            "risk_reward", "created_at", "updated_at",
        ]
        # The owner is never sent by the client; it comes from the login.
        read_only_fields = ["id", "risk_reward", "created_at", "updated_at"]

    def validate_symbol(self, value):
        return value.strip().upper()

    def validate(self, data):
        # Use existing values when only some fields are sent (PATCH).
        get = lambda f: data.get(f, getattr(self.instance, f, None))
        side, entry = get("side"), get("entry_price")
        sl, tp = get("stop_loss"), get("take_profit")
        if None not in (side, entry, sl, tp):
            if side == Trade.Side.BUY and not (sl < entry < tp):
                raise serializers.ValidationError(
                    "For a BUY, stop loss must be below entry and take profit above it."
                )
            if side == Trade.Side.SELL and not (tp < entry < sl):
                raise serializers.ValidationError(
                    "For a SELL, stop loss must be above entry and take profit below it."
                )
        if data.get("lots") is not None and data["lots"] <= 0:
            raise serializers.ValidationError({"lots": "Lots must be more than 0."})
        return data
