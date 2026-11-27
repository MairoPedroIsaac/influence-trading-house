from django.urls import path
from rest_framework.routers import DefaultRouter

from .mt5 import KeyView, TradeSyncView
from .views import TradeViewSet

router = DefaultRouter()
router.register("trades", TradeViewSet, basename="trade")

urlpatterns = [
    path("mt5/key/", KeyView.as_view(), name="mt5-key"),
    path("mt5/trades/", TradeSyncView.as_view(), name="mt5-trades"),
] + router.urls
