from .models import Claim


def validate_claim(claim):
    conditions = []

    # Condition 1: Claim amount must be greater than 0
    if claim.amount > 0:
        conditions.append({
            "name": "Valid claim amount",
            "passed": True,
            "message": "Claim amount is valid."
        })
    else:
        conditions.append({
            "name": "Valid claim amount",
            "passed": False,
            "message": "Claim amount must be greater than zero."
        })

    # Condition 2: Required claim information
    if (
        claim.patient_name
        and claim.hospital_name
        and claim.procedure
    ):
        conditions.append({
            "name": "Required information",
            "passed": True,
            "message": "Required claim information is present."
        })
    else:
        conditions.append({
            "name": "Required information",
            "passed": False,
            "message": "Required claim information is missing."
        })

    # Overall result
    is_valid = all(condition["passed"] for condition in conditions)

    return {
        "is_valid": is_valid,
        "conditions": conditions,
    }