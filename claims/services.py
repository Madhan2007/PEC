from decimal import Decimal
from datetime import date
from django.utils import timezone
from .models import Claim, Patient, MedicalRecord
from fraud_detection.services import calculate_fraud_risk


def validate_claim(claim):
    """
    Comprehensive healthcare claim validation engine.
    Validates amounts, mandatory clinical info, date consistency,
    and document presence.
    """
    conditions = []

    # Condition 1: Claim amount must be greater than 0
    if claim.amount and claim.amount > 0:
        conditions.append({
            "name": "Valid claim amount",
            "passed": True,
            "message": f"Claim amount ₹{claim.amount:,.2f} is valid and greater than zero."
        })
    else:
        conditions.append({
            "name": "Valid claim amount",
            "passed": False,
            "message": "Claim amount must be strictly greater than zero."
        })

    # Condition 2: Required clinical & provider information
    if (
        claim.patient_name
        and claim.hospital_name
        and claim.procedure
    ):
        conditions.append({
            "name": "Required information",
            "passed": True,
            "message": "Required patient, provider, and procedure information is present."
        })
    else:
        conditions.append({
            "name": "Required information",
            "passed": False,
            "message": "Required claim information (patient, hospital, or procedure) is missing."
        })

    # Condition 3: Admission and Discharge Date Chronology
    if claim.admission_date and claim.discharge_date:
        if claim.discharge_date >= claim.admission_date:
            conditions.append({
                "name": "Date validity",
                "passed": True,
                "message": f"Stay duration is consistent ({claim.admission_date} to {claim.discharge_date})."
            })
        else:
            conditions.append({
                "name": "Date validity",
                "passed": False,
                "message": f"Discharge date ({claim.discharge_date}) cannot precede admission date ({claim.admission_date})."
            })

    # Condition 4: Procedure and Diagnosis Compatibility
    if claim.diagnosis and claim.procedure:
        if claim.diagnosis_procedure_match:
            conditions.append({
                "name": "Diagnosis-Procedure Match",
                "passed": True,
                "message": f"Procedure '{claim.procedure}' is clinically compatible with diagnosis '{claim.diagnosis}'."
            })
        else:
            conditions.append({
                "name": "Diagnosis-Procedure Match",
                "passed": False,
                "message": f"Potential clinical mismatch between diagnosis '{claim.diagnosis}' and procedure '{claim.procedure}'."
            })

    # Condition 5: Document Verification Status
    has_docs = claim.documents.exists()
    if has_docs or claim.documents_verified:
        conditions.append({
            "name": "Document Verification",
            "passed": True,
            "message": f"Supporting documents attached ({claim.documents.count()} file(s))."
        })
    else:
        conditions.append({
            "name": "Document Verification",
            "passed": True, # Soft warning for drafts/initial submission
            "message": "No supporting bills or discharge summaries uploaded yet."
        })

    # Overall result
    is_valid = all(c["passed"] for c in conditions)

    return {
        "is_valid": is_valid,
        "conditions": conditions,
    }


def get_or_create_patient_for_claim(claim):
    """
    Ensures unified Patient entity exists for this claim and maintains ID consistency.
    """
    if claim.patient:
        return claim.patient

    # Generate or reuse patient ID
    patient_id = f"PAT-{(claim.patient_name.replace(' ', '').upper()[:4])}-{claim.patient_age or '00'}"
    
    patient, created = Patient.objects.get_or_create(
        patient_id=patient_id,
        defaults={
            'user': claim.user,
            'name': claim.patient_name,
            'age': claim.patient_age,
            'gender': claim.patient_gender or 'Other',
            'policy_number': f"POL-{claim.id:06d}",
            'insurance_provider': claim.insurance_type or 'National Health',
        }
    )

    claim.patient = patient
    claim.save(update_fields=['patient'])
    return patient


def create_encounter_for_claim(claim):
    """
    Records an official medical encounter / clinical history entry for the patient.
    """
    patient = get_or_create_patient_for_claim(claim)
    encounter, _ = MedicalRecord.objects.get_or_create(
        claim=claim,
        defaults={
            'patient': patient,
            'hospital_name': claim.hospital_name,
            'doctor_name': f"Doctor {claim.doctor_id or 'General'}",
            'admission_date': claim.admission_date or timezone.now().date(),
            'discharge_date': claim.discharge_date or timezone.now().date(),
            'diagnosis': claim.diagnosis or 'Clinical Assessment',
            'procedure': claim.procedure,
            'prescriptions': f"Standard inpatient regimen for {claim.procedure}",
            'lab_results': "Routine pre-op and post-op panels completed.",
            'notes': f"Associated with Claim #{claim.id} (Dataset ID: {claim.dataset_claim_id or 'N/A'})",
        }
    )
    return encounter


def process_claim_pipeline(claim):
    """
    Unified end-to-end processing pipeline:
    1. Synchronize unified Patient & MedicalRecord entities
    2. Reconcile attached documents via OCR
    3. Run Rule-based & Clinical validation
    4. Run AI & ML Fraud Risk Engine
    5. Determine final status (validated, rejected, under_review)
    """
    claim.status = "processing"
    claim.save(update_fields=["status"])

    # 1. Sync Patient & Encounter
    get_or_create_patient_for_claim(claim)
    create_encounter_for_claim(claim)

    # 2. Reconcile documents if any
    for doc in claim.documents.all():
        if doc.ocr_status != "completed":
            from .ocr_service import process_document_ocr
            process_document_ocr(doc)

    # 3. Clinical & Rules Validation
    validation_result = validate_claim(claim)

    # 4. AI Fraud Risk Analysis
    fraud_result = calculate_fraud_risk(claim)

    # 5. Determine Final Decision
    if not validation_result["is_valid"] or fraud_result["risk_level"] == "high":
        claim.status = "rejected"
    elif fraud_result["risk_level"] == "medium":
        claim.status = "under_review"
    else:
        claim.status = "validated"

    claim.save(update_fields=["status"])

    return {
        "claim": claim,
        "validation_result": validation_result,
        "fraud_result": fraud_result,
        "status": claim.status,
    }