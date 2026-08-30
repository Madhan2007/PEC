"""
End-to-End Live Workflow Verification Script
Executes all 9 real workflows against the running Django platform and validates responses.
"""

import os
import sys
import json
from decimal import Decimal
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from django.test import Client
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from authentication.models import UserProfile
from claims.models import Claim, Document, Patient, MedicalRecord
from fraud_detection.models import FraudAnalysis
from fraud_detection.services import calculate_fraud_risk, get_fraud_analytics_overview

def run_workflow_test():
    print("=" * 70)
    print(">>> PEC HACKATHON HEALTHCARE PLATFORM - END-TO-END WORKFLOW TEST")
    print("=" * 70)

    client = Client()
    workflow_results = []

    # -------------------------------------------------------------
    # STEP 1: AUTHENTICATION & ROLE-BASED ACCESS WORKFLOW
    # -------------------------------------------------------------
    print("\n[STEP 1] Testing Centralized Authentication & RBAC...")
    # Clean up old test user if exists
    User.objects.filter(username="workflow_dr_arun").delete()

    reg_payload = {
        "username": "workflow_dr_arun",
        "email": "dr.arun@apollo.org",
        "password": "DoctorSecurePass123",
        "role": "doctor",
        "organization": "Apollo Super Specialty Hospital",
        "phone_number": "+91-9876543210"
    }
    
    # 1.1 Register via REST API
    res_reg = client.post("/api/auth/register/", data=reg_payload, content_type="application/json")
    print(f"  -> POST /api/auth/register/: Status {res_reg.status_code}")
    assert res_reg.status_code == 201, f"Registration failed: {res_reg.content}"
    reg_data = res_reg.json()
    assert reg_data["success"] is True
    assert reg_data["data"]["profile"]["role"] == "doctor"
    print(f"     [OK] Registered Doctor user '{reg_data['data']['username']}' with role: {reg_data['data']['profile']['role']}")

    # 1.2 Login via REST API
    login_payload = {"username": "workflow_dr_arun", "password": "DoctorSecurePass123"}
    res_login = client.post("/api/auth/login/", data=login_payload, content_type="application/json")
    print(f"  -> POST /api/auth/login/: Status {res_login.status_code}")
    assert res_login.status_code == 200, f"Login failed: {res_login.content}"
    login_data = res_login.json()
    assert login_data["success"] is True
    print(f"     [OK] Authentication Token/Session established successfully")

    # 1.3 Fetch User Profile
    res_user = client.get("/api/auth/user/")
    assert res_user.status_code == 200
    print(f"     [OK] GET /api/auth/user/ verified profile for: {res_user.json()['data']['username']}")
    workflow_results.append(("1. Centralized Authentication & RBAC", "PASSED"))

    # -------------------------------------------------------------
    # STEP 2: CLAIM CREATION & PATIENT LINKING WORKFLOW
    # -------------------------------------------------------------
    print("\n[STEP 2] Testing Healthcare Claim Intake & Patient Identity...")
    claim_payload = {
        "patient_name": "Kavitha Sundaram",
        "patient_age": 42,
        "patient_gender": "Female",
        "hospital_name": "Apollo Super Specialty Hospital",
        "hospital_id": "H001",
        "doctor_id": "D015",
        "diagnosis": "Cholecystitis",
        "procedure": "Gallbladder Removal",
        "amount": "85000.00",
        "admission_date": "2026-08-10",
        "discharge_date": "2026-08-15",
        "days_admitted": 5,
        "insurance_type": "Corporate Insurance",
        "previous_claims": 1,
        "previous_claim_amount": "25000.00",
        "duplicate_claim": False,
        "diagnosis_procedure_match": True,
    }

    res_claim = client.post("/api/claims/", data=claim_payload, content_type="application/json")
    print(f"  -> POST /api/claims/: Status {res_claim.status_code}")
    assert res_claim.status_code == 201, f"Claim creation failed: {res_claim.content}"
    claim_data = res_claim.json()
    claim_id = claim_data["data"]["id"]
    assert claim_data["data"]["status"] == "draft"
    print(f"     [OK] Created Claim #{claim_id} for Patient '{claim_data['data']['patient_name']}' with Status: {claim_data['data']['status']}")

    # Verify Unified Patient Entity
    patient = Patient.objects.get(name="Kavitha Sundaram")
    print(f"     [OK] Unified Patient Profile verified: ID [{patient.patient_id}] Policy [{patient.policy_number}]")
    workflow_results.append(("2. Claim Intake & Universal Patient Linking", "PASSED"))

    # -------------------------------------------------------------
    # STEP 3: DOCUMENT UPLOAD & OCR ENTITY EXTRACTION WORKFLOW
    # -------------------------------------------------------------
    print("\n[STEP 3] Testing Document Upload & Medical OCR Intelligence...")
    hospital_bill_sample = (
        "=====================================================\n"
        "APOLLO SUPER SPECIALTY HOSPITAL - DISCHARGE BILL\n"
        "=====================================================\n"
        "Patient Name: Kavitha Sundaram\n"
        "Attending Doctor: Dr. D015 (Gastroenterology)\n"
        "Hospital: Apollo Super Specialty Hospital\n"
        "Admission Date: 2026-08-10\n"
        "Discharge Date: 2026-08-15\n"
        "Diagnosis: Cholecystitis\n"
        "Procedure: Gallbladder Removal\n"
        "Room and Inpatient Charges: Rs. 25000.00\n"
        "Surgical and Theater Fees: Rs. 45000.00\n"
        "Pharmacy and Lab Panels:   Rs. 15000.00\n"
        "-----------------------------------------------------\n"
        "Total Amount: Rs. 85000.00\n"
        "Status: Digitally Verified Medical Inpatient Record\n"
        "=====================================================\n"
    ).encode('utf-8')

    file_upload = SimpleUploadedFile("apollo_hospital_bill.txt", hospital_bill_sample, content_type="text/plain")

    res_doc = client.post(
        f"/api/claims/{claim_id}/documents/",
        data={"file": file_upload, "document_type": "bill"},
        format="multipart"
    )
    print(f"  -> POST /api/claims/{claim_id}/documents/: Status {res_doc.status_code}")
    assert res_doc.status_code == 201, f"Document upload failed: {res_doc.content}"
    doc_data = res_doc.json()
    assert doc_data["data"]["ocr_status"] == "completed"
    assert doc_data["ocr_result"]["extracted_data"]["patient_name"] == "Kavitha Sundaram"
    assert doc_data["ocr_result"]["extracted_data"]["total_amount"] == 85000.0
    print(f"     [OK] Document #{doc_data['data']['id']} processed through OCR engine")
    print(f"     [OK] Extracted Entities: Patient='{doc_data['ocr_result']['extracted_data']['patient_name']}', Amount=INR {doc_data['ocr_result']['extracted_data']['total_amount']}, Hospital='{doc_data['ocr_result']['extracted_data']['hospital_name']}'")
    print(f"     [OK] Cross-Verification Match Score: {doc_data['ocr_result']['match_score']}%")
    workflow_results.append(("3. Document OCR & Clinical Entity Extraction", "PASSED"))

    # -------------------------------------------------------------
    # STEP 4: CLAIM SUBMISSION WORKFLOW
    # -------------------------------------------------------------
    print("\n[STEP 4] Testing Claim Submission Lifecycle Transition...")
    res_submit = client.post(f"/api/claims/{claim_id}/submit/")
    print(f"  -> POST /api/claims/{claim_id}/submit/: Status {res_submit.status_code}")
    assert res_submit.status_code == 200
    assert res_submit.json()["status"] == "submitted"
    print(f"     [OK] Claim #{claim_id} transitioned: draft --> submitted")
    workflow_results.append(("4. Claim Submission Lifecycle", "PASSED"))

    # -------------------------------------------------------------
    # STEP 5: MASTER PROCESSING PIPELINE (VALIDATION + AI FRAUD RISK)
    # -------------------------------------------------------------
    print("\n[STEP 5] Testing Master Pipeline (Clinical Rules + AI Fraud Risk Engine)...")
    res_process = client.post(f"/api/claims/{claim_id}/process/")
    print(f"  -> POST /api/claims/{claim_id}/process/: Status {res_process.status_code}")
    assert res_process.status_code == 200, f"Processing pipeline failed: {res_process.content}"
    proc_data = res_process.json()
    print(f"     [OK] Claim #{claim_id} Final Status: [{proc_data['status'].upper()}]")
    print(f"     [OK] Clinical Validation: Valid={proc_data['validation']['is_valid']}")
    print(f"     [OK] AI Fraud Score: {proc_data['fraud_analysis']['risk_score']}/100 (Risk Level: {proc_data['fraud_analysis']['risk_level'].upper()})")
    print(f"     [OK] Auditor Recommendation: [{proc_data['fraud_analysis']['recommended_action'].upper()}]")
    assert proc_data["status"] == "validated"
    workflow_results.append(("5. Master Pipeline (OCR + Validation + AI Fraud)", "PASSED"))

    # -------------------------------------------------------------
    # STEP 6: HIGH-RISK FRAUD ANOMALY SCENARIO TEST
    # -------------------------------------------------------------
    print("\n[STEP 6] Testing High-Risk Anomaly Scenario (Duplicate & Cost Inflation)...")
    fraudulent_claim_payload = {
        "patient_name": "Kavitha Sundaram",
        "hospital_name": "Apollo Super Specialty Hospital",
        "procedure": "Cataract Surgery",
        "amount": 350000.00,       # 5x typical benchmark
        "previous_claims": 10,     # Excessive claims spike
        "previous_claim_amount": 250000.00,
        "duplicate_claim": True,   # Duplicate flag
        "diagnosis_procedure_match": False,
        "documents_verified": False,
        "hospital_claim_count": 220,
    }

    res_ai = client.post("/api/fraud/analyze/", data=fraudulent_claim_payload, content_type="application/json")
    print(f"  -> POST /api/fraud/analyze/: Status {res_ai.status_code}")
    assert res_ai.status_code == 200
    ai_data = res_ai.json()
    risk = ai_data["data"]
    print(f"     [OK] Anomaly Score: {risk['risk_score']}/100 | Risk Level: {risk['risk_level'].upper()} | Fraud Detected: {risk['fraud_detected']}")
    print(f"     [OK] Triggered Risk Reasons ({len(risk['reasons'])}):")
    for r in risk["reasons"]:
        print(f"        [WARN] {r}")
    print(f"     [OK] Recommended Action: [{risk['recommended_action'].upper()}]")
    assert risk["risk_level"] == "high"
    assert risk["fraud_detected"] is True
    assert risk["recommended_action"] == "reject"
    workflow_results.append(("6. AI High-Risk Fraud Anomaly Detection", "PASSED"))

    # -------------------------------------------------------------
    # STEP 7: EXTERNAL CLAIM INGESTION WEBHOOK
    # -------------------------------------------------------------
    print("\n[STEP 7] Testing External Ingestion Webhook API (/api/external-claim/)...")
    user_first = User.objects.first()
    external_payload = {
        "user_id": user_first.id,
        "patient_name": "Suresh Raina",
        "hospital_name": "Fortis Hospital",
        "procedure": "Orthopedic Surgery",
        "amount": 72000.00
    }
    res_ext = client.post("/api/external-claim/", data=json.dumps(external_payload), content_type="application/json")
    print(f"  -> POST /api/external-claim/: Status {res_ext.status_code}")
    assert res_ext.status_code == 201
    ext_data = res_ext.json()
    assert ext_data["success"] is True
    print(f"     [OK] Ingested External Claim #{ext_data['claim_id']} for '{external_payload['patient_name']}'")
    workflow_results.append(("7. External Ingestion Webhook", "PASSED"))

    # -------------------------------------------------------------
    # STEP 8: DASHBOARD, ANALYTICS & PATIENT HISTORY LOOKUP
    # -------------------------------------------------------------
    print("\n[STEP 8] Testing Analytics & Patient History Lookup...")
    res_stats = client.get("/api/fraud/stats/")
    assert res_stats.status_code == 200
    stats = res_stats.json()["data"]
    print(f"     [OK] System Analytics: Total Claims={stats['total_claims']}, Total Volume=INR {stats['total_amount']:,.2f}")
    print(f"     [OK] Risk Tiers: High Risk={stats['high_risk_count']}, Medium Risk={stats['medium_risk_count']}, Low Risk={stats['low_risk_count']}")

    res_pat_records = client.get(f"/api/patients/{patient.patient_id}/records/")
    assert res_pat_records.status_code == 200
    pat_records = res_pat_records.json()
    print(f"     [OK] Patient Clinical Encounters Retrieved: {len(pat_records['records'])} record(s) for {patient.name}")

    # Test Web Pages Rendering
    assert client.get("/dashboard/").status_code == 200
    assert client.get("/claims/").status_code == 200
    assert client.get(f"/claims/{claim_id}/").status_code == 200
    assert client.get("/fraud/radar/").status_code == 200
    assert client.get("/claims/ocr-scanner/").status_code == 200
    assert client.get("/claims/patients/").status_code == 200
    assert client.get("/claims/api-explorer/").status_code == 200
    print(f"     [OK] All 7 Web Dashboard and Portal views rendered with 200 OK")
    workflow_results.append(("8. Analytics & Web Dashboard Rendering", "PASSED"))

    # -------------------------------------------------------------
    # STEP 9: SYSTEM HEALTH & ERROR HANDLING
    # -------------------------------------------------------------
    print("\n[STEP 9] Testing System Health & Structured Error Handling...")
    res_health = client.get("/api/health/")
    assert res_health.status_code == 200
    print(f"     [OK] Health Status: {res_health.json()['status']} (DB: {res_health.json()['database']})")

    # Error handling tests
    res_404 = client.get("/api/claims/999999/")
    assert res_404.status_code == 404
    assert res_404.json()["code"] == "CLAIM_NOT_FOUND"

    res_400 = client.post("/api/auth/login/", data={}, content_type="application/json")
    assert res_400.status_code == 400
    assert res_400.json()["code"] == "MISSING_CREDENTIALS"

    res_405 = client.get("/api/external-claim/")
    assert res_405.status_code == 405
    assert res_405.json()["code"] == "METHOD_NOT_ALLOWED"
    print(f"     [OK] Structured Error Handling verified: 400, 404, 405 handled cleanly")
    workflow_results.append(("9. System Health & Error Handling", "PASSED"))

    # -------------------------------------------------------------
    # FINAL SUMMARY
    # -------------------------------------------------------------
    print("\n" + "=" * 70)
    print("WORKFLOW TEST SUMMARY")
    print("=" * 70)
    all_passed = True
    for name, status_txt in workflow_results:
        print(f"  [{status_txt}] {name}")
        if status_txt != "PASSED":
            all_passed = False
    print("=" * 70)
    if all_passed:
        print("ALL 9 CORE WORKFLOWS PASSED WITH 100% SUCCESS!")
    else:
        print("SOME WORKFLOWS FAILED.")
    print("=" * 70)

if __name__ == "__main__":
    run_workflow_test()
