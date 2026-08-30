import os
import json
import logging
from decimal import Decimal
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Claim, Document, Patient, MedicalRecord
from .services import validate_claim, process_claim_pipeline, get_or_create_patient_for_claim
from .forms import ClaimForm
from .ingestion import ingest_external_claim
from .ocr_service import process_document_ocr, MedicalOCREngine
from .serializers import (
    ClaimSerializer, ClaimCreateSerializer, DocumentSerializer,
    PatientSerializer, MedicalRecordSerializer
)
from fraud_detection.services import calculate_fraud_risk

logger = logging.getLogger(__name__)


# ==========================================
# Web Views (HTML Templates)
# ==========================================

@login_required
def claim_list(request):
    """
    List claims with search, status filters, and risk filters.
    Admins and Auditors can view all claims; Patients see their own.
    """
    profile = getattr(request.user, 'profile', None)
    is_admin = profile.is_admin_or_auditor if profile else request.user.is_staff

    query = request.GET.get("q", "").strip()
    status_filter = request.GET.get("status", "").strip()

    if is_admin:
        claims = Claim.objects.all()
    else:
        claims = Claim.objects.filter(user=request.user)

    if query:
        claims = claims.filter(
            Q(patient_name__icontains=query) |
            Q(hospital_name__icontains=query) |
            Q(procedure__icontains=query) |
            Q(dataset_claim_id__icontains=query)
        )

    if status_filter:
        claims = claims.filter(status=status_filter)

    claims = claims.order_by("-created_at")[:100]

    return render(
        request,
        "claims/claim_list.html",
        {
            "claims": claims,
            "query": query,
            "status_filter": status_filter,
            "is_admin": is_admin,
        }
    )


@login_required
def create_claim(request):
    """
    Create a new insurance claim with patient and procedure details.
    """
    if request.method == "POST":
        form = ClaimForm(request.POST)

        if form.is_valid():
            claim = form.save(commit=False)
            claim.user = request.user
            claim.status = "draft"
            
            # Optional extra fields from request
            claim.patient_age = request.POST.get("patient_age") or None
            claim.patient_gender = request.POST.get("patient_gender") or None
            claim.diagnosis = request.POST.get("diagnosis", "").strip() or None
            claim.insurance_type = request.POST.get("insurance_type", "Health Insurance")
            claim.admission_date = request.POST.get("admission_date") or None
            claim.discharge_date = request.POST.get("discharge_date") or None
            
            claim.save()
            get_or_create_patient_for_claim(claim)

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
    """
    Detailed Claim view showing patient history, documents with OCR status,
    AI fraud assessment, and workflow actions.
    """
    profile = getattr(request.user, 'profile', None)
    is_admin = profile.is_admin_or_auditor if profile else request.user.is_staff

    if is_admin:
        claim = get_object_or_404(Claim, id=claim_id)
    else:
        claim = get_object_or_404(Claim, id=claim_id, user=request.user)

    # Re-evaluate fraud risk
    fraud_result = calculate_fraud_risk(claim)
    validation_result = validate_claim(claim)

    return render(
        request,
        "claims/claim_detail.html",
        {
            "claim": claim,
            "fraud_result": fraud_result,
            "validation_result": validation_result,
            "is_admin": is_admin,
        }
    )


@login_required
def upload_document(request, claim_id):
    """
    Upload document for a claim and immediately trigger OCR entity extraction.
    """
    profile = getattr(request.user, 'profile', None)
    is_admin = profile.is_admin_or_auditor if profile else request.user.is_staff

    if is_admin:
        claim = get_object_or_404(Claim, id=claim_id)
    else:
        claim = get_object_or_404(Claim, id=claim_id, user=request.user)

    if request.method == "POST":
        file_obj = request.FILES.get("file")
        doc_type = request.POST.get("document_type", "other")

        if file_obj:
            document = claim.documents.create(
                file=file_obj,
                document_type=doc_type,
            )
            # Process OCR immediately
            process_document_ocr(document)

        return redirect("claim_detail", claim_id=claim.id)

    return render(
        request,
        "claims/upload_document.html",
        {"claim": claim}
    )


@login_required
def submit_claim(request, claim_id):
    """
    Submit draft claim for processing.
    """
    profile = getattr(request.user, 'profile', None)
    is_admin = profile.is_admin_or_auditor if profile else request.user.is_staff

    if is_admin:
        claim = get_object_or_404(Claim, id=claim_id)
    else:
        claim = get_object_or_404(Claim, id=claim_id, user=request.user)

    if claim.status == "draft":
        claim.status = "submitted"
        claim.save(update_fields=["status"])

    return redirect("claim_detail", claim_id=claim.id)


@login_required
def process_claim(request, claim_id):
    """
    Runs the end-to-end processing pipeline:
    OCR Reconciliation -> Clinical Rules -> AI Fraud Risk -> Status Update
    """
    profile = getattr(request.user, 'profile', None)
    is_admin = profile.is_admin_or_auditor if profile else request.user.is_staff

    if is_admin:
        claim = get_object_or_404(Claim, id=claim_id)
    else:
        claim = get_object_or_404(Claim, id=claim_id, user=request.user)

    # Process through master pipeline
    pipeline_res = process_claim_pipeline(claim)

    return render(
        request,
        "claims/validation_result.html",
        {
            "claim": claim,
            "result": pipeline_res["validation_result"],
            "fraud_result": pipeline_res["fraud_result"],
        }
    )


@login_required
def patient_list_view(request):
    """
    Unified Patient Records Directory
    """
    patients = Patient.objects.all().order_by("-created_at")[:50]
    return render(
        request,
        "claims/patient_list.html",
        {"patients": patients}
    )


@login_required
def ocr_scanner_view(request):
    """
    Live Interactive Document OCR Scanner page for testing bills/prescriptions
    """
    extracted_data = None
    raw_text = None
    if request.method == "POST" and request.FILES.get("document_file"):
        uploaded = request.FILES["document_file"]
        import tempfile
        ext = os.path.splitext(uploaded.name)[1].lower() or ".tmp"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            for chunk in uploaded.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            raw_text = MedicalOCREngine.extract_text_from_file(tmp_path)
            extracted_data = MedicalOCREngine.parse_entities_from_text(raw_text)
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    return render(
        request,
        "claims/ocr_scanner.html",
        {
            "extracted_data": extracted_data,
            "raw_text": raw_text,
        }
    )


@login_required
def api_explorer_view(request):
    """
    Interactive API Explorer & Documentation page for Hackathon judges & developers
    """
    return render(request, "claims/api_explorer.html")


# ==========================================
# External Ingestion Webhook (100% Backward Compatible)
# ==========================================

@csrf_exempt
def external_claim_api(request):
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "error": "Only POST requests are allowed", "code": "METHOD_NOT_ALLOWED"},
            status=405
        )

    try:
        data = json.loads(request.body)
        user_id = data.pop("user_id", None)

        if not user_id:
            return JsonResponse(
                {"success": False, "error": "user_id is required", "code": "MISSING_USER_ID"},
                status=400
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse(
                {"success": False, "error": "User not found", "code": "USER_NOT_FOUND"},
                status=404
            )

        claim = ingest_external_claim(user, data)
        get_or_create_patient_for_claim(claim)

        return JsonResponse(
            {
                "success": True,
                "message": "Claim ingested successfully",
                "claim_id": claim.id,
                "dataset_claim_id": claim.dataset_claim_id,
                "status": claim.status,
            },
            status=201
        )

    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "error": "Invalid JSON", "code": "INVALID_JSON"},
            status=400
        )
    except ValueError as e:
        return JsonResponse(
            {"success": False, "error": str(e), "code": "VALIDATION_ERROR"},
            status=400
        )


# ==========================================
# REST API Endpoints (/api/claims/...)
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_claims_list_create(request):
    """
    GET /api/claims/ - List all claims with pagination and query filters
    POST /api/claims/ - Create a new claim
    """
    if request.method == 'GET':
        claims = Claim.objects.all().order_by('-created_at')
        status_param = request.GET.get('status')
        if status_param:
            claims = claims.filter(status=status_param)

        search = request.GET.get('q')
        if search:
            claims = claims.filter(
                Q(patient_name__icontains=search) |
                Q(hospital_name__icontains=search) |
                Q(procedure__icontains=search)
            )

        # Pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(claims, request)
        if page is not None:
            serializer = ClaimSerializer(page, many=True)
            return Response({
                "success": True,
                "count": paginator.page.paginator.count,
                "data": serializer.data,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link()
            })

        serializer = ClaimSerializer(claims[:50], many=True)
        return Response({
            "success": True,
            "count": claims.count(),
            "data": serializer.data
        })

    elif request.method == 'POST':
        user = request.user if request.user.is_authenticated else User.objects.first()
        if not user:
            return Response({
                "success": False,
                "error": "No default user available to attach claim",
                "code": "USER_REQUIRED"
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ClaimCreateSerializer(data=request.data)
        if serializer.is_valid():
            claim = serializer.save(user=user, status='draft')
            get_or_create_patient_for_claim(claim)
            return Response({
                "success": True,
                "message": "Claim created successfully",
                "data": ClaimSerializer(claim).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            "success": False,
            "error": "Invalid claim data",
            "details": serializer.errors,
            "code": "VALIDATION_ERROR"
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def api_claim_detail(request, claim_id):
    """
    GET /api/claims/<id>/ - Detailed claim information
    PUT/PATCH /api/claims/<id>/ - Update claim fields or status
    DELETE /api/claims/<id>/ - Remove claim
    """
    try:
        claim = Claim.objects.get(id=claim_id)
    except Claim.DoesNotExist:
        return Response({
            "success": False,
            "error": f"Claim with ID {claim_id} not found",
            "code": "CLAIM_NOT_FOUND"
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ClaimSerializer(claim)
        return Response({
            "success": True,
            "data": serializer.data
        })

    elif request.method in ['PUT', 'PATCH']:
        # Handle status update or field update
        new_status = request.data.get('status')
        if new_status and new_status in dict(Claim.STATUS_CHOICES):
            claim.status = new_status
        
        notes = request.data.get('notes')
        if notes:
            claim.notes = notes

        serializer = ClaimCreateSerializer(claim, data=request.data, partial=True)
        if serializer.is_valid():
            claim = serializer.save()
            if new_status:
                claim.status = new_status
                claim.save(update_fields=['status'])
            return Response({
                "success": True,
                "message": "Claim updated successfully",
                "data": ClaimSerializer(claim).data
            })
        return Response({
            "success": False,
            "error": "Update failed",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        claim.delete()
        return Response({
            "success": True,
            "message": f"Claim #{claim_id} deleted successfully"
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def api_claim_submit(request, claim_id):
    """
    POST /api/claims/<id>/submit/ - Submit draft claim
    """
    try:
        claim = Claim.objects.get(id=claim_id)
    except Claim.DoesNotExist:
        return Response({"success": False, "error": "Claim not found", "code": "NOT_FOUND"}, status=404)

    claim.status = "submitted"
    claim.save(update_fields=["status"])
    return Response({
        "success": True,
        "message": f"Claim #{claim_id} submitted for processing",
        "status": claim.status
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def api_claim_process(request, claim_id):
    """
    POST /api/claims/<id>/process/ - Execute complete validation & AI fraud engine
    """
    try:
        claim = Claim.objects.get(id=claim_id)
    except Claim.DoesNotExist:
        return Response({"success": False, "error": "Claim not found", "code": "NOT_FOUND"}, status=404)

    result = process_claim_pipeline(claim)
    return Response({
        "success": True,
        "message": f"Claim #{claim_id} processed successfully",
        "status": claim.status,
        "validation": result["validation_result"],
        "fraud_analysis": result["fraud_result"]
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_claim_documents(request, claim_id):
    """
    GET /api/claims/<id>/documents/ - List attached documents
    POST /api/claims/<id>/documents/ - Upload document and run OCR
    """
    try:
        claim = Claim.objects.get(id=claim_id)
    except Claim.DoesNotExist:
        return Response({"success": False, "error": "Claim not found", "code": "NOT_FOUND"}, status=404)

    if request.method == 'GET':
        docs = claim.documents.all()
        serializer = DocumentSerializer(docs, many=True)
        return Response({"success": True, "data": serializer.data})

    elif request.method == 'POST':
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"success": False, "error": "File is required", "code": "MISSING_FILE"}, status=400)

        doc_type = request.data.get('document_type', 'other')
        document = claim.documents.create(file=file_obj, document_type=doc_type)
        
        # Trigger OCR
        ocr_result = process_document_ocr(document)
        serializer = DocumentSerializer(document)

        return Response({
            "success": True,
            "message": "Document uploaded and OCR processed",
            "data": serializer.data,
            "ocr_result": ocr_result
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_document_ocr(request, document_id):
    """
    POST /api/documents/<id>/ocr/ - Manually trigger OCR reprocessing
    """
    try:
        document = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        return Response({"success": False, "error": "Document not found", "code": "NOT_FOUND"}, status=404)

    ocr_result = process_document_ocr(document)
    return Response(ocr_result)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def api_patient_list_create(request):
    """
    GET /api/patients/ - List unified patients
    POST /api/patients/ - Create new patient record
    """
    if request.method == 'GET':
        patients = Patient.objects.all().order_by('-created_at')
        serializer = PatientSerializer(patients[:50], many=True)
        return Response({"success": True, "count": patients.count(), "data": serializer.data})

    elif request.method == 'POST':
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            patient = serializer.save()
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"success": False, "error": serializer.errors}, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_patient_detail(request, patient_id):
    """
    GET /api/patients/<patient_id>/ - Get patient profile
    """
    try:
        patient = Patient.objects.get(Q(patient_id=patient_id) | Q(id=patient_id if patient_id.isdigit() else 0))
    except Patient.DoesNotExist:
        return Response({"success": False, "error": "Patient not found", "code": "NOT_FOUND"}, status=404)

    serializer = PatientSerializer(patient)
    return Response({"success": True, "data": serializer.data})


@api_view(['GET'])
@permission_classes([AllowAny])
def api_patient_records(request, patient_id):
    """
    GET /api/patients/<patient_id>/records/ - Get patient medical history & clinical encounters
    """
    try:
        patient = Patient.objects.get(Q(patient_id=patient_id) | Q(id=patient_id if patient_id.isdigit() else 0))
    except Patient.DoesNotExist:
        return Response({"success": False, "error": "Patient not found", "code": "NOT_FOUND"}, status=404)

    records = patient.medical_records.all().order_by('-created_at')
    serializer = MedicalRecordSerializer(records, many=True)
    return Response({"success": True, "patient": patient.name, "records": serializer.data})


@api_view(['GET'])
@permission_classes([AllowAny])
def api_system_health(request):
    """
    GET /api/health/ - Platform Health Check
    """
    from django.db import connection
    db_status = "healthy"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return Response({
        "success": True,
        "service": "PEC Healthcare & Claims Platform",
        "status": "operational",
        "database": db_status,
        "version": "1.0.0-hackathon-release"
    })
