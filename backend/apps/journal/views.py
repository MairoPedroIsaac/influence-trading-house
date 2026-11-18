"""
apps/journal/views.py - Trade API.

  GET    /api/v1/trades/        list my trades (filters: ?status=OPEN&symbol=EURUSD)
  POST   /api/v1/trades/        add a trade
  GET    /api/v1/trades/<id>/   one trade
  PATCH  /api/v1/trades/<id>/   update (for example close it)
  DELETE /api/v1/trades/<id>/   delete

Login (JWT) is required. A user only ever sees their own trades:
another user's trade id returns 404, not 403, so ids are not leaked.
"""

from rest_framework import permissions, viewsets

from .models import Trade
from .serializers import TradeSerializer


class TradeViewSet(viewsets.ModelViewSet):
    serializer_class = TradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Trade.objects.filter(user=self.request.user)
        params = self.request.query_params
        if params.get("status"):
            qs = qs.filter(status=params["status"].upper())
        if params.get("symbol"):
            qs = qs.filter(symbol=params["symbol"].upper())
        if params.get("strategy"):
            qs = qs.filter(strategy__iexact=params["strategy"])
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
