from django.contrib import admin

from .models import MT5Key, Trade


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ("opened_at", "symbol", "side", "lots", "entry_price",
                    "stop_loss", "take_profit", "status", "profit", "strategy")
    list_filter = ("status", "side", "symbol", "strategy", "source")
    search_fields = ("symbol", "notes")


@admin.register(MT5Key)
class MT5KeyAdmin(admin.ModelAdmin):
    list_display = ("user", "prefix", "created_at", "last_used_at")
    readonly_fields = ("key_hash", "prefix", "created_at", "last_used_at")
