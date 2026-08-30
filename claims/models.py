from django.db import models
from django.contrib.auth.models import User


class Patient(models.Model):
    """
    Unified Patient Entity for the healthcare platform.
    Ensures patient ID consistency across all modules.
    """
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    patient_id = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='patient_profiles'
    )
    name = models.CharField(max_length=200)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    policy_number = models.CharField(max_length=100, blank=True, null=True)
    insurance_provider = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_id} - {self.name}"


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
        ("under_review", "Under Review"),
    ]
    dataset_claim_id = models.CharField(max_length=50, unique=True, null=True, blank=True, db_index=True)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="claims"
    )
    patient_name = models.CharField(max_length=200)
    patient_age = models.PositiveIntegerField(null=True, blank=True)
    patient_gender = models.CharField(max_length=20, null=True, blank=True)

    hospital_name = models.CharField(max_length=200)
    hospital_id = models.CharField(max_length=50, null=True, blank=True)
    doctor_id = models.CharField(max_length=50, null=True, blank=True)

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

    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Claim #{self.id} ({self.dataset_claim_id or 'Local'}) - {self.patient_name}"


class Document(models.Model):
    DOCUMENT_TYPES = [
        ("bill", "Hospital Bill"),
        ("discharge", "Discharge Summary"),
        ("prescription", "Prescription"),
        ("insurance", "Insurance Document"),
        ("lab_report", "Lab Report"),
        ("other", "Other"),
    ]

    OCR_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
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
    
    # OCR and Intelligence Fields
    extracted_text = models.TextField(blank=True, null=True)
    ocr_status = models.CharField(
        max_length=20,
        choices=OCR_STATUS_CHOICES,
        default="pending"
    )
    extracted_data = models.JSONField(default=dict, blank=True)
    match_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_document_type_display()} - Claim #{self.claim.id}"


class MedicalRecord(models.Model):
    """
    Patient Clinical Encounters and Medical History
    """
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="medical_records"
    )
    claim = models.ForeignKey(
        Claim,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="medical_records"
    )
    hospital_name = models.CharField(max_length=200)
    doctor_name = models.CharField(max_length=200, blank=True, null=True)
    admission_date = models.DateField(null=True, blank=True)
    discharge_date = models.DateField(null=True, blank=True)
    diagnosis = models.CharField(max_length=300)
    procedure = models.CharField(max_length=300, blank=True, null=True)
    prescriptions = models.TextField(blank=True, null=True)
    lab_results = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record for {self.patient.name} - {self.diagnosis} ({self.created_at.strftime('%Y-%m-%d')})"


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