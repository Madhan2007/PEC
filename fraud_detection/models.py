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
        default=0.00
    )

    RISK_LEVELS = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    ACTION_CHOICES = [
        ("approve", "Auto-Approve"),
        ("review", "Manual Review Required"),
        ("reject", "Auto-Reject"),
    ]

    risk_level = models.CharField(
        max_length=10,
        choices=RISK_LEVELS,
        default="low"
    )

    fraud_detected = models.BooleanField(default=False)
    reasons = models.JSONField(default=list, blank=True)
    rule_flags = models.JSONField(default=dict, blank=True)
    ml_confidence = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00
    )
    recommended_action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        default="approve"
    )

    analyzed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Fraud Analysis - Claim #{self.claim.id} (Score: {self.risk_score})"