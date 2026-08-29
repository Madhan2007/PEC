from django.db import models


class Claim(models.Model):
    user = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="claims",
    )

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("processing", "Processing"),
        ("validated", "Validated"),
        ("rejected", "Rejected"),
    ]
    dataset_claim_id = models.CharField(max_length=20,unique=True,null=True,blank=True)
    patient_name = models.CharField(max_length=200)
    patient_age = models.PositiveIntegerField(null=True, blank=True)
    patient_gender = models.CharField(max_length=20, null=True, blank=True)

    hospital_name = models.CharField(max_length=200)
    hospital_id = models.CharField(max_length=20, null=True, blank=True)
    doctor_id = models.CharField(max_length=20, null=True, blank=True)

    diagnosis = models.CharField(max_length=300, null=True, blank=True)
    procedure = models.CharField(max_length=300)

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    claim_date = models.DateField(null=True, blank=True)
    admission_date = models.DateField(null=True, blank=True)
    discharge_date = models.DateField(null=True, blank=True)
    days_admitted = models.PositiveIntegerField(null=True, blank=True)

    insurance_type = models.CharField(max_length=100, null=True, blank=True)

    previous_claims = models.PositiveIntegerField(default=0)
    previous_claim_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    documents_verified = models.BooleanField(default=False)
    duplicate_claim = models.BooleanField(default=False)
    diagnosis_procedure_match = models.BooleanField(default=True)

    hospital_claim_count = models.PositiveIntegerField(default=0)
    patient_claim_count = models.PositiveIntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Claim #{self.id} - {self.patient_name}"


class Document(models.Model):
    DOCUMENT_TYPES = [
        ("bill", "Hospital Bill"),
        ("discharge", "Discharge Summary"),
        ("prescription", "Prescription"),
        ("insurance", "Insurance Document"),
        ("other", "Other"),
    ]

    claim = models.ForeignKey(
        Claim,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    file = models.FileField(upload_to="claims/")
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPES,
        default="other"
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document_type} - Claim #{self.claim.id}"

class FraudLabel(models.Model):
    claim = models.OneToOneField(
        Claim,
        on_delete=models.CASCADE,
        related_name="fraud_label"
    )

    is_fraud = models.BooleanField(default=False)

    FRAUD_TYPES = [
        ("none", "None"),
        ("duplicate", "Duplicate Claim"),
        ("inflated_amount", "Inflated Amount"),
        ("suspicious_provider", "Suspicious Provider"),
        ("excessive_claims", "Excessive Claims"),
        ("diagnosis_mismatch", "Diagnosis/Procedure Mismatch"),
    ]

    fraud_type = models.CharField(
        max_length=50,
        choices=FRAUD_TYPES,
        default="none"
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

    def __str__(self):
        return f"Fraud Label - Claim #{self.claim.id}"