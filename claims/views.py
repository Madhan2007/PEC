from django.shortcuts import render, redirect, get_object_or_404
from .models import Claim
from .services import validate_claim
from .forms import ClaimForm
from django.contrib.auth.decorators import login_required
import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User

from .ingestion import ingest_external_claim
from fraud_detection.services import calculate_fraud_risk


@login_required
def claim_list(request):
    claims = Claim.objects.filter(
        user=request.user
    ).order_by("-created_at")

    return render(
        request,
        "claims/claim_list.html",
        {"claims": claims}
    )
    
@login_required
def create_claim(request):
    if request.method == "POST":
        form = ClaimForm(request.POST)

        if form.is_valid():
            claim = form.save(commit=False)
            claim.user = request.user
            claim.status = "draft"
            claim.save()

            return redirect("claim_detail", claim_id=claim.id)

    else:
        form = ClaimForm()

    return render(
        request,
        "claims/submit_claim.html",
        {"form": form}
    )
    
@login_required
def claim_detail(request, claim_id):
    claim = get_object_or_404(
        Claim,
        id=claim_id,
        user=request.user
    )

    fraud_result = calculate_fraud_risk(claim)

    return render(
        request,
        "claims/claim_detail.html",
        {
            "claim": claim,
            "fraud_result": fraud_result,
        }
    )
    
@login_required
def upload_document(request, claim_id):
    claim = get_object_or_404(
        Claim,
        id=claim_id,
        user=request.user
    )

    if request.method == "POST":
        claim.documents.create(
            file=request.FILES["file"],
            document_type=request.POST["document_type"],
        )

        return redirect("claim_detail", claim_id=claim.id)

    return render(
        request,
        "claims/upload_document.html",
        {"claim": claim}
    )
  
@login_required
def process_claim(request, claim_id):
    claim = get_object_or_404(
        Claim,
        id=claim_id,
        user=request.user
    )

    if claim.status != "submitted":
        return redirect("claim_detail", claim_id=claim.id)

    claim.status = "processing"
    claim.save()

    # Existing claim validation
    validation_result = validate_claim(claim)

    # Fraud risk analysis
    fraud_result = calculate_fraud_risk(claim)

    # Final claim status
    if validation_result["is_valid"] and not fraud_result["fraud_detected"]:
        claim.status = "validated"
    else:
        claim.status = "rejected"

    claim.save()

    return render(
        request,
        "claims/validation_result.html",
        {
            "claim": claim,
            "result": validation_result,
            "fraud_result": fraud_result,
        }
    )

@login_required
def submit_claim(request, claim_id):
    claim = get_object_or_404(
        Claim,
        id=claim_id,
        user=request.user
    )

    if claim.status == "draft":
        claim.status = "submitted"
        claim.save()

    return redirect("claim_detail", claim_id=claim.id)

@csrf_exempt
def external_claim_api(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST requests are allowed"},
            status=405
        )

    try:
        data = json.loads(request.body)

        user_id = data.pop("user_id", None)

        if not user_id:
            return JsonResponse(
                {"error": "user_id is required"},
                status=400
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"error": "User not found"},
                status=404
            )

        claim = ingest_external_claim(user, data)

        return JsonResponse(
            {
                "message": "Claim ingested successfully",
                "claim_id": claim.id,
                "status": claim.status,
            },
            status=201
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    except ValueError as e:
        return JsonResponse(
            {"error": str(e)},
            status=400
        )

