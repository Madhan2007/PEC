from django.urls import path
from authentication import views as auth_views
from claims import views as claim_views
from fraud_detection import views as fraud_views

urlpatterns = [
    # Authentication & RBAC APIs
    path("auth/login/", auth_views.api_login, name="api_login"),
    path("auth/register/", auth_views.api_register, name="api_register"),
    path("auth/user/", auth_views.api_user_profile, name="api_user_profile"),
    path("auth/logout/", auth_views.api_logout, name="api_logout"),

    # Claims Management APIs
    path("claims/", claim_views.api_claims_list_create, name="api_claims_list_create"),
    path("claims/<int:claim_id>/", claim_views.api_claim_detail, name="api_claim_detail"),
    path("claims/<int:claim_id>/submit/", claim_views.api_claim_submit, name="api_claim_submit"),
    path("claims/<int:claim_id>/process/", claim_views.api_claim_process, name="api_claim_process"),
    path("claims/<int:claim_id>/documents/", claim_views.api_claim_documents, name="api_claim_documents"),

    # Document Intelligence & OCR APIs
    path("documents/<int:document_id>/ocr/", claim_views.api_document_ocr, name="api_document_ocr"),

    # Patient Directory & Encounters APIs
    path("patients/", claim_views.api_patient_list_create, name="api_patient_list_create"),
    path("patients/<str:patient_id>/", claim_views.api_patient_detail, name="api_patient_detail"),
    path("patients/<str:patient_id>/records/", claim_views.api_patient_records, name="api_patient_records"),

    # AI Fraud Detection & Anomaly Radar APIs
    path("fraud/analyze/", fraud_views.api_analyze_fraud, name="api_analyze_fraud"),
    path("ai/analyze/", fraud_views.api_analyze_fraud, name="api_ai_analyze"),
    path("fraud/stats/", fraud_views.api_fraud_stats, name="api_fraud_stats"),
    path("fraud/analysis/<int:claim_id>/", fraud_views.api_fraud_analysis_detail, name="api_fraud_analysis_detail"),

    # External Claims Ingestion Webhook
    path("external-claim/", claim_views.external_claim_api, name="external_claim_api"),

    # System Health
    path("health/", claim_views.api_system_health, name="api_system_health"),
]
