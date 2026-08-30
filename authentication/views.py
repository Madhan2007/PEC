import json
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile
from .serializers import UserSerializer, RegisterSerializer


# ==========================================
# Web Views (HTML Templates)
# ==========================================

def login_user(request):
    """Web login view."""
    if request.user.is_authenticated:
        return redirect("dashboard")

    if request.method == "POST":
        username_input = request.POST.get("username", "").strip()
        password_input = request.POST.get("password", "")

        user = authenticate(
            request,
            username=username_input,
            password=password_input
        )

        if user is not None:
            login(request, user)
            next_url = request.GET.get('next', 'dashboard')
            return redirect(next_url)

        return render(
            request,
            "login.html",
            {"error": "Invalid username or password"}
        )

    return render(request, "login.html")


def logout_user(request):
    """Web logout view."""
    logout(request)
    return redirect("login")


def register(request):
    """Web registration view with role selection."""
    if request.user.is_authenticated:
        return redirect("dashboard")

    if request.method == "POST":
        form = UserCreationForm(request.POST)
        role = request.POST.get("role", "patient")
        organization = request.POST.get("organization", "")

        if form.is_valid():
            user = form.save()
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.role = role
            profile.organization = organization
            profile.save()

            login(request, user)
            return redirect("dashboard")
    else:
        form = UserCreationForm()

    return render(
        request,
        "register.html",
        {
            "form": form,
            "roles": UserProfile.ROLE_CHOICES,
        }
    )


@login_required
def dashboard(request):
    """
    Unified Main Dashboard
    Combines analytics, recent claims, fraud indicators, and quick action cards.
    """
    from claims.models import Claim, Patient
    from fraud_detection.models import FraudAnalysis
    from fraud_detection.services import get_fraud_analytics_overview

    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)

    # Role-based query scoping
    if profile.is_admin_or_auditor:
        claims = Claim.objects.all().order_by("-created_at")[:10]
        total_claims_count = Claim.objects.count()
    else:
        claims = Claim.objects.filter(user=user).order_by("-created_at")[:10]
        total_claims_count = Claim.objects.filter(user=user).count()

    analytics = get_fraud_analytics_overview()

    # User specific stats
    user_stats = {
        "total_claims": total_claims_count,
        "validated_claims": Claim.objects.filter(user=user, status="validated").count() if not profile.is_admin_or_auditor else Claim.objects.filter(status="validated").count(),
        "pending_claims": Claim.objects.filter(user=user, status__in=["submitted", "processing", "under_review"]).count() if not profile.is_admin_or_auditor else Claim.objects.filter(status__in=["submitted", "processing", "under_review"]).count(),
        "rejected_claims": Claim.objects.filter(user=user, status="rejected").count() if not profile.is_admin_or_auditor else Claim.objects.filter(status="rejected").count(),
    }

    context = {
        "user": user,
        "profile": profile,
        "claims": claims,
        "analytics": analytics,
        "user_stats": user_stats,
    }

    return render(request, "dashboard.html", context)


# ==========================================
# REST API Endpoints (/api/auth/...)
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """
    POST /api/auth/login/
    Authenticates user and returns session and user profile.
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response({
            "success": False,
            "error": "Both username and password are required",
            "code": "MISSING_CREDENTIALS"
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        serializer = UserSerializer(user)
        return Response({
            "success": True,
            "message": "Login successful",
            "code": "AUTH_SUCCESS",
            "data": {
                "user": serializer.data,
                "session_id": request.session.session_key,
            }
        }, status=status.HTTP_200_OK)

    return Response({
        "success": False,
        "error": "Invalid username or password",
        "code": "INVALID_CREDENTIALS"
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    """
    POST /api/auth/register/
    Registers a new user with role and profile metadata.
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_serializer = UserSerializer(user)
        return Response({
            "success": True,
            "message": "User registered successfully",
            "code": "REGISTER_SUCCESS",
            "data": user_serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response({
        "success": False,
        "error": "Registration failed",
        "code": "VALIDATION_ERROR",
        "details": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user_profile(request):
    """
    GET /api/auth/user/
    Returns current authenticated user details and role.
    """
    serializer = UserSerializer(request.user)
    return Response({
        "success": True,
        "data": serializer.data,
        "code": "USER_PROFILE"
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    """
    POST /api/auth/logout/
    Logs out the user session.
    """
    logout(request)
    return Response({
        "success": True,
        "message": "Logged out successfully",
        "code": "LOGOUT_SUCCESS"
    })