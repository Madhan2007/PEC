from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from claims.models import Claim
from .models import FraudAnalysis
from .services import calculate_fraud_risk, analyze_claim_data, get_fraud_analytics_overview
from .serializers import FraudAnalysisSerializer, DirectAIAnalyzeInputSerializer


# ==========================================
# Web Views (AI Fraud Radar)
# ==========================================

@login_required
def fraud_radar_view(request):
    """
    Dedicated AI Fraud Radar Dashboard showing high risk anomalies,
    risk breakdowns, and audit queues.
    """
    profile = getattr(request.user, 'profile', None)
    is_admin = profile.is_admin_or_auditor if profile else request.user.is_staff

    analytics = get_fraud_analytics_overview()
    high_risk_analyses = FraudAnalysis.objects.filter(risk_level="high").select_related('claim').order_by("-risk_score")[:20]
    medium_risk_analyses = FraudAnalysis.objects.filter(risk_level="medium").select_related('claim').order_by("-risk_score")[:20]

    context = {
        "analytics": analytics,
        "high_risk_analyses": high_risk_analyses,
        "medium_risk_analyses": medium_risk_analyses,
        "is_admin": is_admin,
    }
    return render(request, "fraud_detection/fraud_radar.html", context)


# ==========================================
# REST API Endpoints (/api/fraud/...)
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def api_analyze_fraud(request):
    """
    POST /api/fraud/analyze/ or /api/ai/analyze/
    Analyzes fraud risk for either:
    1. An existing claim by ID: { "claim_id": 101 }
    2. A raw claim payload: { "patient_name": "John", "amount": 250000, "procedure": "Heart Surgery", ... }
    """
    claim_id = request.data.get('claim_id')

    if claim_id:
        try:
            claim = Claim.objects.get(id=claim_id)
            result = calculate_fraud_risk(claim)
            return Response({
                "success": True,
                "claim_id": claim.id,
                "dataset_claim_id": claim.dataset_claim_id,
                "patient_name": claim.patient_name,
                "data": result,
                "code": "ANALYSIS_COMPLETE"
            })
        except Claim.DoesNotExist:
            return Response({
                "success": False,
                "error": f"Claim #{claim_id} not found",
                "code": "CLAIM_NOT_FOUND"
            }, status=status.HTTP_404_NOT_FOUND)

    # Otherwise analyze raw data payload
    serializer = DirectAIAnalyzeInputSerializer(data=request.data)
    if serializer.is_valid():
        result = analyze_claim_data(serializer.validated_data)
        return Response({
            "success": True,
            "message": "AI Fraud Risk Analysis completed",
            "data": result,
            "code": "ANALYSIS_COMPLETE"
        })

    return Response({
        "success": False,
        "error": "Invalid input payload",
        "details": serializer.errors,
        "code": "VALIDATION_ERROR"
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_fraud_stats(request):
    """
    GET /api/fraud/stats/
    Returns system-wide fraud indicators, risk distribution, and metrics.
    """
    stats = get_fraud_analytics_overview()
    return Response({
        "success": True,
        "data": stats,
        "code": "FRAUD_STATS"
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_fraud_analysis_detail(request, claim_id):
    """
    GET /api/fraud/analysis/<claim_id>/
    Get saved fraud analysis record for a claim.
    """
    try:
        analysis = FraudAnalysis.objects.get(claim_id=claim_id)
        serializer = FraudAnalysisSerializer(analysis)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except FraudAnalysis.DoesNotExist:
        # Generate on the fly
        try:
            claim = Claim.objects.get(id=claim_id)
            result = calculate_fraud_risk(claim)
            return Response({
                "success": True,
                "data": result
            })
        except Claim.DoesNotExist:
            return Response({
                "success": False,
                "error": "Claim not found",
                "code": "NOT_FOUND"
            }, status=404)
