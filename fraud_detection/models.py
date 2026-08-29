from django.db import models
from claims.models import Claim


class FraudAnalysis(models.Model):
    claim = models.OneToOneField(
        Claim,
        on_delete=models.CASCADE,
        related_name="fraud_analysis"
    )

    risk_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    RISK_LEVELS = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    risk_level = models.CharField(
        max_length=10,
        choices=RISK_LEVELS,
        default="low"
    )

    fraud_detected = models.BooleanField(default=False)

    reasons = models.JSONField(default=list, blank=True)

    analyzed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Fraud Analysis - Claim #{self.claim.id}"