from decimal import Decimal


def calculate_fraud_risk(claim):
    """
    Rule-based baseline fraud risk engine.

    Returns:
        risk_score: 0-100
        risk_level: low/medium/high
        fraud_detected: True/False
        reasons: list of triggered risk indicators
    """

    score = Decimal("0.00")
    reasons = []

    # 1. Duplicate claim — very strong fraud indicator
    if claim.duplicate_claim:
        score += Decimal("80")
        reasons.append("Possible duplicate claim")

    # 2. Diagnosis/procedure mismatch — strong fraud indicator
    if not claim.diagnosis_procedure_match:
        score += Decimal("70")
        reasons.append("Diagnosis and procedure mismatch")

    # 3. High claim amount
    if claim.amount >= Decimal("300000"):
        score += Decimal("70")
        reasons.append("Extremely high claim amount")
    elif claim.amount >= Decimal("200000"):
        score += Decimal("60")
        reasons.append("High claim amount")

    # 4. Excessive previous claims
    if claim.previous_claims >= 8:
        score += Decimal("70")
        reasons.append("Excessive previous claims")
    elif claim.previous_claims >= 5:
        score += Decimal("40")
        reasons.append("High number of previous claims")

    # 5. High previous claim amount
    if claim.previous_claim_amount >= Decimal("200000"):
        score += Decimal("20")
        reasons.append("High previous claim amount")
    elif claim.previous_claim_amount >= Decimal("100000"):
        score += Decimal("10")
        reasons.append("Significant previous claim amount")

    # 6. Unverified documents
    if not claim.documents_verified:
        score += Decimal("15")
        reasons.append("Documents not verified")

    # 7. Suspicious provider activity
    if claim.hospital_claim_count >= 200:
        score += Decimal("70")
        reasons.append("Very high hospital claim volume")
    elif claim.hospital_claim_count >= 150:
        score += Decimal("40")
        reasons.append("High hospital claim volume")

    # 8. High patient claim count
    if claim.patient_claim_count >= 8:
        score += Decimal("15")
        reasons.append("High patient claim frequency")

    # Keep score between 0 and 100
    score = min(score, Decimal("100"))

    # Risk classification
    if score >= 60:
        risk_level = "high"
        fraud_detected = True
    elif score >= 30:
        risk_level = "medium"
        fraud_detected = False
    else:
        risk_level = "low"
        fraud_detected = False

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "fraud_detected": fraud_detected,
        "reasons": reasons,
    }