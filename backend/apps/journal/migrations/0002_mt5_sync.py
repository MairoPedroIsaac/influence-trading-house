from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("journal", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name="trade",
            name="stop_loss",
            field=models.DecimalField(blank=True, decimal_places=5, max_digits=12, null=True),
        ),
        migrations.AlterField(
            model_name="trade",
            name="take_profit",
            field=models.DecimalField(blank=True, decimal_places=5, max_digits=12, null=True),
        ),
        migrations.AlterField(
            model_name="trade",
            name="mt5_ticket",
            field=models.BigIntegerField(blank=True, null=True),
        ),
        migrations.AddConstraint(
            model_name="trade",
            constraint=models.UniqueConstraint(fields=("user", "mt5_ticket"), name="unique_mt5_ticket_per_user"),
        ),
        migrations.CreateModel(
            name="MT5Key",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key_hash", models.CharField(max_length=64, unique=True)),
                ("prefix", models.CharField(max_length=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("last_used_at", models.DateTimeField(blank=True, null=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="mt5_key",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
