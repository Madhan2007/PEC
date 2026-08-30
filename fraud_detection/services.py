import os
import sys
from decimal import Decimal
from pathlib import Path
from django.db.models import Avg, Count, Sum, Q
from .models import FraudAnalysis

# Add Identity_Verification module to path
IDENTITY_VERIF_PATH = Path(r"C:\Users\LOQ\OneDrive\Desktop\Identity_Verification\PEC\modules\fraud-risk")
if str(IDENTITY_VERIF_PATH) not in sys.path and IDENTITY_VERIF_PATH.exists():
    sys.path.insert(0, str(IDENTITY_VERIF_PATH))

try:
    from app.models.schemas import (
        HospitalDocument,
        InsuranceDocument,
        AadhaarDocument,
        DecisionStatus,
    )
    from app.verification.aadhaar import AadhaarVerifier, normalize_aadhaar
    from app.verification.hospital import HospitalVerifier
    from app.verification.insurance import InsuranceVerifier
    from app.verification.verification_engine import VerificationEngine
    from app.decision.decision_engine import DecisionEngine
    IDENTITY_ENGINE_AVAILABLE = True
except Exception:
    IDENTITY_ENGINE_AVAILABLE = False

# Benchmark Procedure Average Costs for Anomaly Detection (in INR)
PROCEDURE_BENCHMARKS = {
    "Cataract Surgery": Decimal("65000.00"),
    "Heart Surgery": Decimal("150000.00"),
    "Orthopedic Surgery": Decimal("75000.00"),
    "Diabetes Management": Decimal("45000.00"),
    "Appendectomy": Decimal("65000.00"),
    "Tumor Removal": Decimal("160000.00"),
    "Gallbladder Removal": Decimal("85000.00"),
    "Knee Replacement": Decimal("180000.00"),
}


def calculate_fraud_risk(claim):
    """
    Hybrid AI/ML & Rule-based Fraud Intelligence Engine.
    Combines rule-based risk triggers with statistical cost anomaly detection.

    Returns:
        dict:
            risk_score (Decimal: 0-100)
            risk_level (str: low/medium/high)
            fraud_detected (bool)
            reasons (list of str)
            rule_flags (dict)
            ml_confidence (float)
            recommended_action (str: approve/review/reject)
    """
    score = Decimal("0.00")
    reasons = []
    rule_flags = {}

    # 1. Duplicate claim — Critical indicator
    if getattr(claim, 'duplicate_claim', False):
        score += Decimal("80.00")
        reasons.append("Identified as duplicate claim matching prior submission")
        rule_flags["duplicate_claim"] = True
    else:
        rule_flags["duplicate_claim"] = False

    # 2. Diagnosis/procedure mismatch — Critical clinical indicator
    if not getattr(claim, 'diagnosis_procedure_match', True):
        score += Decimal("70.00")
        reasons.append("Clinical mismatch detected between diagnosis and procedure")
        rule_flags["clinical_mismatch"] = True
    else:
        rule_flags["clinical_mismatch"] = False

    # 3. High claim amount & Statistical Procedure Inflation Check
    claim_amount = Decimal(str(claim.amount or 0))
    procedure_name = str(claim.procedure or "").strip()
    
    if procedure_name in PROCEDURE_BENCHMARKS:
        benchmark = PROCEDURE_BENCHMARKS[procedure_name]
        if claim_amount > (benchmark * Decimal("1.8")):
            score += Decimal("45.00")
            reasons.append(f"Amount (₹{claim_amount:,.0f}) significantly exceeds typical benchmark (₹{benchmark:,.0f}) for {procedure_name}")
            rule_flags["inflated_procedure_cost"] = True

    if claim_amount >= Decimal("300000"):
        score += Decimal("70.00")
        reasons.append("Extremely high claim amount exceeding ₹3,00,000 threshold")
        rule_flags["high_amount"] = True
    elif claim_amount >= Decimal("200000"):
        score += Decimal("40.00")
        reasons.append("High claim amount exceeding ₹2,00,000 threshold")
        rule_flags["high_amount"] = True
    else:
        rule_flags["high_amount"] = False

    # 4. Excessive previous claims frequency
    prev_claims = int(getattr(claim, 'previous_claims', 0) or 0)
    if prev_claims >= 8:
        score += Decimal("50.00")
        reasons.append(f"Excessive previous claims history ({prev_claims} claims)")
        rule_flags["excessive_claims"] = True
    elif prev_claims >= 5:
        score += Decimal("30.00")
        reasons.append(f"High previous claims history ({prev_claims} claims)")
        rule_flags["excessive_claims"] = True
    else:
        rule_flags["excessive_claims"] = False

    # 5. High previous claim cumulative amount
    prev_amount = Decimal(str(getattr(claim, 'previous_claim_amount', 0) or 0))
    if prev_amount >= Decimal("200000"):
        score += Decimal("20.00")
        reasons.append(f"High cumulative prior claims value (₹{prev_amount:,.0f})")
    elif prev_amount >= Decimal("100000"):
        score += Decimal("10.00")
        reasons.append(f"Significant cumulative prior claims value (₹{prev_amount:,.0f})")

    # 6. Unverified documents / missing proofs
    docs_verified = getattr(claim, 'documents_verified', False)
    if not docs_verified:
        score += Decimal("15.00")
        reasons.append("Supporting documents have not completed digital verification")
        rule_flags["unverified_documents"] = True
    else:
        rule_flags["unverified_documents"] = False

    # 7. Suspicious hospital volume spike
    hosp_count = int(getattr(claim, 'hospital_claim_count', 0) or 0)
    if hosp_count >= 200:
        score += Decimal("50.00")
        reasons.append(f"Provider exhibits anomalous claim volume spike ({hosp_count} claims)")
        rule_flags["provider_spike"] = True
    elif hosp_count >= 150:
        score += Decimal("30.00")
        reasons.append(f"High provider claim volume ({hosp_count} claims)")
        rule_flags["provider_spike"] = True
    else:
        rule_flags["provider_spike"] = False

    # 8. High patient frequency
    pat_count = int(getattr(claim, 'patient_claim_count', 0) or 0)
    if pat_count >= 8:
        score += Decimal("15.00")
        reasons.append(f"Frequent claimant pattern ({pat_count} claims submitted)")
        rule_flags["patient_frequency"] = True

    # 9. Identity & Aadhaar Verification Engine (Identity_Verification module)
    aadhaar_num = None
    if hasattr(claim, 'documents') and claim.documents.exists():
        for doc in claim.documents.all():
            if isinstance(doc.extracted_data, dict) and doc.extracted_data.get("aadhaar_number"):
                aadhaar_num = doc.extracted_data.get("aadhaar_number")
                break
            elif doc.extracted_text:
                import re
                aadh_m = re.search(r'\b([2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4})\b', doc.extracted_text)
                if aadh_m:
                    aadhaar_num = re.sub(r'\D', '', aadh_m.group(1))
                    break

    if IDENTITY_ENGINE_AVAILABLE and aadhaar_num:
        try:
            a_verifier = AadhaarVerifier()
            a_doc = AadhaarDocument(
                aadhaar_number=aadhaar_num,
                patient_name=str(claim.patient_name or "")
            )
            a_res = a_verifier.verify(a_doc)
            if not a_res.is_valid:
                score += Decimal("75.00")
                reasons.extend(a_res.rejection_reasons or ["Aadhaar card verification failed"])
                rule_flags["aadhaar_verified"] = False
                rule_flags["aadhaar_failure"] = True
            else:
                rule_flags["aadhaar_verified"] = True
                rule_flags["aadhaar_failure"] = False
        except Exception as e:
            rule_flags["aadhaar_verified"] = False

    # Normalize score strictly between 0 and 100
    final_score = min(score, Decimal("100.00"))

    # Apply Identity_Verification DecisionEngine logic
    if IDENTITY_ENGINE_AVAILABLE:
        try:
            de = DecisionEngine()
            if final_score <= Decimal(str(de.AUTO_APPROVE_MAX_SCORE)):
                risk_level = "low"
                fraud_detected = False
                recommended_action = "approve"
            elif final_score <= Decimal(str(de.MANUAL_REVIEW_MAX_SCORE)):
                risk_level = "medium"
                fraud_detected = False
                recommended_action = "review"
            else:
                risk_level = "high"
                fraud_detected = True
                recommended_action = "reject"
        except Exception:
            if final_score >= Decimal("60.00"):
                risk_level = "high"
                fraud_detected = True
                recommended_action = "reject"
            elif final_score >= Decimal("30.00"):
                risk_level = "medium"
                fraud_detected = False
                recommended_action = "review"
            else:
                risk_level = "low"
                fraud_detected = False
                recommended_action = "approve"
    else:
        if final_score >= Decimal("60.00"):
            risk_level = "high"
            fraud_detected = True
            recommended_action = "reject"
        elif final_score >= Decimal("30.00"):
            risk_level = "medium"
            fraud_detected = False
            recommended_action = "review"
        else:
            risk_level = "low"
            fraud_detected = False
            recommended_action = "approve"

    # ML confidence estimation based on feature signal density
    active_flags = sum(1 for v in rule_flags.values() if v)
    confidence = Decimal(str(min(0.99, max(0.65, 0.65 + (active_flags * 0.06)))))

    result = {
        "risk_score": final_score,
        "risk_level": risk_level,
        "fraud_detected": fraud_detected,
        "reasons": reasons,
        "rule_flags": rule_flags,
        "ml_confidence": confidence,
        "recommended_action": recommended_action,
    }

    # Automatically persist or update the FraudAnalysis record for this claim if saved
    if hasattr(claim, 'id') and claim.id:
        try:
            FraudAnalysis.objects.update_or_create(
                claim=claim,
                defaults={
                    "risk_score": final_score,
                    "risk_level": risk_level,
                    "fraud_detected": fraud_detected,
                    "reasons": reasons,
                    "rule_flags": rule_flags,
                    "ml_confidence": confidence,
                    "recommended_action": recommended_action,
                }
            )
        except Exception:
            pass

    return result


def analyze_claim_data(data):
    """
    Direct AI analysis helper for raw JSON payload without requiring a saved Claim model.
    Enables instant API evaluation at /api/fraud/analyze/ or /api/ai/analyze/.
    """
    class MockClaim:
        def __init__(self, d):
            self.id = None
            self.amount = Decimal(str(d.get("amount", d.get("claim_amount", 0))))
            self.patient_name = d.get("patient_name", "Anonymous")
            self.patient_age = int(d.get("patient_age", 40))
            self.patient_gender = d.get("patient_gender", "Male")
            self.hospital_name = d.get("hospital_name", "General Hospital")
            self.procedure = d.get("procedure", "Medical Treatment")
            self.diagnosis = d.get("diagnosis", "")
            self.previous_claims = int(d.get("previous_claims", 0))
            self.previous_claim_amount = Decimal(str(d.get("previous_claim_amount", 0)))
            self.hospital_claim_count = int(d.get("hospital_claim_count", 0))
            self.patient_claim_count = int(d.get("patient_claim_count", 0))
            self.duplicate_claim = bool(d.get("duplicate_claim", False))
            self.diagnosis_procedure_match = bool(d.get("diagnosis_procedure_match", True))
            self.documents_verified = bool(d.get("documents_verified", True))

    mock = MockClaim(data)
    return calculate_fraud_risk(mock)


def get_fraud_analytics_overview():
    """
    Computes system-wide fraud metrics and statistical breakdowns for the dashboard.
    """
    from claims.models import Claim, FraudLabel
    
    total_claims = Claim.objects.count()
    total_amount = Claim.objects.aggregate(Sum('amount'))['amount__sum'] or Decimal("0.00")
    
    fraud_labels_count = FraudLabel.objects.filter(is_fraud=True).count()
    analyses_count = FraudAnalysis.objects.count()
    high_risk_analyses = FraudAnalysis.objects.filter(risk_level="high").count()
    medium_risk_analyses = FraudAnalysis.objects.filter(risk_level="medium").count()
    low_risk_analyses = FraudAnalysis.objects.filter(risk_level="low").count()

    # Fraud types distribution
    fraud_types = list(FraudLabel.objects.exclude(fraud_type="none").values("fraud_type").annotate(count=Count("id")).order_by("-count"))

    # Status distribution
    status_distribution = list(Claim.objects.values("status").annotate(count=Count("id")))

    return {
        "total_claims": total_claims,
        "total_amount": float(total_amount),
        "fraud_cases_count": fraud_labels_count or high_risk_analyses,
        "high_risk_count": high_risk_analyses,
        "medium_risk_count": medium_risk_analyses,
        "low_risk_count": low_risk_analyses,
        "fraud_types": fraud_types,
        "status_distribution": status_distribution,
    }