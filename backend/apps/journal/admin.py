from django.contrib import admin

from .models import Trade


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ("opened_at", "symbol", "side", "lots", "entry_price",
                    "stop_loss", "take_profit", "status", "profit", "strategy")
    list_filter = ("status", "side", "symbol", "strategy", "source")
    search_fields = ("symbol", "notes")
