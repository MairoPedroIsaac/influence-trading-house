"""
apps/journal/mt5.py - Automatic trade sync from MetaTrader 5.

  GET    /api/v1/mt5/key/     do I have a key? (login needed)
  POST   /api/v1/mt5/key/     make a new key, shown once (login needed)
  DELETE /api/v1/mt5/key/     remove my key (login needed)
  POST   /api/v1/mt5/trades/  the ITH Reporter EA sends one trade here.
                              Auth: header "X-ITH-Key: <key>". No login.

The EA sends a trade when it opens and again when it closes. Trades are
matched by their MT5 position ticket, so sending the same trade twice
just updates it.
"""

from decimal import Decimal

from django.utils import timezone
from rest_framework import permissions, serializers, status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import MT5Key, Trade
from .serializers import TradeSerializer

# Magic numbers our EAs use, so trades get the right strategy name.
MAGIC_STRATEGY = {260001: "BTMM", 260101: "InfluenceX"}


class MT5KeyAuthentication(BaseAuthentication):
    """Logs the request in as the owner of the X-ITH-Key header."""

    def authenticate(self, request):
        raw = request.headers.get("X-ITH-Key", "").strip()
        if not raw:
            return None
        try:
            key = MT5Key.objects.select_related("user").get(key_hash=MT5Key.hash(raw))
        except MT5Key.DoesNotExist:
            raise AuthenticationFailed("This MT5 key is not valid. Make a new one on your ITH profile page.")
        if not key.user.is_active:
            raise AuthenticationFailed("This account is not active.")
        MT5Key.objects.filter(pk=key.pk).update(last_used_at=timezone.now())
        return (key.user, key)

    def authenticate_header(self, request):
        return "X-ITH-Key"


class KeyView(APIView):
    def get(self, request):
        key = MT5Key.objects.filter(user=request.user).first()
        if not key:
            return Response({"exists": False})
        return Response({
            "exists": True,
            "prefix": key.prefix,
            "created_at": key.created_at,
            "last_used_at": key.last_used_at,
        })

    def post(self, request):
        raw = MT5Key.issue(request.user)
        return Response({"key": raw, "prefix": raw[:12]}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        MT5Key.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MT5TradeIn(serializers.Serializer):
    ticket = serializers.IntegerField(min_value=1)
    symbol = serializers.CharField(max_length=20)
    side = serializers.ChoiceField(choices=["BUY", "SELL"])
    lots = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal("0.01"))
    entry_price = serializers.DecimalField(max_digits=12, decimal_places=5)
    stop_loss = serializers.DecimalField(max_digits=12, decimal_places=5, required=False, allow_null=True)
    take_profit = serializers.DecimalField(max_digits=12, decimal_places=5, required=False, allow_null=True)
    opened_at = serializers.DateTimeField()
    closed = serializers.BooleanField(default=False)
    exit_price = serializers.DecimalField(max_digits=12, decimal_places=5, required=False, allow_null=True)
    closed_at = serializers.DateTimeField(required=False, allow_null=True)
    profit = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    magic = serializers.IntegerField(required=False, default=0)
    comment = serializers.CharField(max_length=64, required=False, allow_blank=True, default="")


def strategy_name(magic, comment):
    if magic in MAGIC_STRATEGY:
        return MAGIC_STRATEGY[magic]
    comment = (comment or "").strip()
    for name in MAGIC_STRATEGY.values():
        if comment.lower().startswith(name.lower()):
            return name
    return "Manual"


class TradeSyncView(APIView):
    authentication_classes = [MT5KeyAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "mt5"

    def post(self, request):
        data = MT5TradeIn(data=request.data)
        data.is_valid(raise_exception=True)
        d = data.validated_data

        # MT5 sends 0 when there is no stop loss / take profit.
        sl = d.get("stop_loss") or None
        tp = d.get("take_profit") or None

        values = {
            "symbol": d["symbol"].strip().upper(),
            "side": d["side"],
            "lots": d["lots"],
            "entry_price": d["entry_price"],
            "stop_loss": sl,
            "take_profit": tp,
            "opened_at": d["opened_at"],
            "source": Trade.Source.MT5,
        }
        if d["closed"]:
            profit = d.get("profit") or Decimal("0")
            values.update({
                "exit_price": d.get("exit_price"),
                "closed_at": d.get("closed_at") or timezone.now(),
                "profit": profit,
                "status": Trade.Status.WIN if profit > 0 else Trade.Status.LOSS if profit < 0 else Trade.Status.BREAKEVEN,
            })
        else:
            values.update({"status": Trade.Status.OPEN, "exit_price": None, "closed_at": None, "profit": None})

        trade = Trade.objects.filter(user=request.user, mt5_ticket=d["ticket"]).first()
        if trade is None:
            values["strategy"] = strategy_name(d["magic"], d["comment"])
            trade = Trade.objects.create(user=request.user, mt5_ticket=d["ticket"], **values)
            code = status.HTTP_201_CREATED
        else:
            # Keep the strategy and notes the user may have edited in ITH.
            for k, v in values.items():
                setattr(trade, k, v)
            trade.save()
            code = status.HTTP_200_OK
        return Response(TradeSerializer(trade).data, status=code)
