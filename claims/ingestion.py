from decimal import Decimal
from .models import Claim

def ingest_external_claim(user, data):
    """
    Receive external claim data, validate it,
    normalize it, and store it as a Claim.
    """

    required_fields = [
        "patient_name",
        "hospital_name",
        "procedure",
        "amount",
    ]

    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")

    try:
        amount = Decimal(str(data["amount"]))
    except (ValueError, TypeError):
        raise ValueError("Amount must be a valid number")

    if amount <= 0:
        raise ValueError("Amount must be greater than zero")

    claim = Claim.objects.create(
        user=user,
        patient_name=str(data["patient_name"]).strip(),
        hospital_name=str(data["hospital_name"]).strip(),
        procedure=str(data["procedure"]).strip(),
        amount=amount,
        status="draft",
    )

    return claim