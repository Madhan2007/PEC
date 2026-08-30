import json
from decimal import Decimal
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile

from claims.models import Claim, Document, Patient, MedicalRecord
from claims.services import validate_claim, process_claim_pipeline, get_or_create_patient_for_claim
from claims.ocr_service import MedicalOCREngine, process_document_ocr


class ClaimsIntegrationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username="patient_priya",
            email="priya@example.com",
            password="TestPassword123"
        )
        self.client.login(username="patient_priya", password="TestPassword123")

        self.claim = Claim.objects.create(
            user=self.user,
            patient_name="Priya Sharma",
            patient_age=34,
            patient_gender="Female",
            hospital_name="Apollo Hospital",
            hospital_id="H001",
            doctor_id="D010",
            procedure="Appendectomy",
            diagnosis="Acute Appendicitis",
            amount=Decimal("65000.00"),
            status="draft",
        )

    def test_claim_validation_success(self):
        """Test clinical rules validation on a valid claim."""
        result = validate_claim(self.claim)
        self.assertTrue(result["is_valid"])
        self.assertTrue(all(c["passed"] for c in result["conditions"]))

    def test_claim_validation_invalid_amount(self):
        """Test validation fails when amount is non-positive."""
        self.claim.amount = Decimal("0.00")
        result = validate_claim(self.claim)
        self.assertFalse(result["is_valid"])

    def test_patient_entity_linking(self):
        """Test that get_or_create_patient_for_claim links a unified Patient record."""
        patient = get_or_create_patient_for_claim(self.claim)
        self.assertIsNotNone(patient)
        self.assertEqual(patient.name, "Priya Sharma")
        self.assertEqual(self.claim.patient, patient)

    def test_document_ocr_and_reconciliation(self):
        """Test document upload, OCR text parsing, and auto-reconciliation."""
        bill_content = (
            b"APOLLO HOSPITAL - INPATIENT BILL\n"
            b"Patient Name: Priya Sharma\n"
            b"Procedure: Appendectomy\n"
            b"Total Amount: Rs. 65000.00\n"
            b"Attending Doctor: Dr. D010\n"
        )
        file_obj = SimpleUploadedFile("hospital_bill.txt", bill_content, content_type="text/plain")

        doc = Document.objects.create(
            claim=self.claim,
            file=file_obj,
            document_type="bill"
        )

        ocr_result = process_document_ocr(doc)
        self.assertTrue(ocr_result["success"])
        self.assertEqual(doc.ocr_status, "completed")
        self.assertGreaterEqual(doc.match_score, Decimal("70.00"))
        
        # Check claim documents_verified was set to True
        self.claim.refresh_from_db()
        self.assertTrue(self.claim.documents_verified)

    def test_process_claim_pipeline(self):
        """Test end-to-end processing pipeline updating status to validated."""
        self.claim.status = "submitted"
        self.claim.save()

        res = process_claim_pipeline(self.claim)
        self.assertEqual(res["status"], "validated")
        self.assertEqual(self.claim.status, "validated")
        self.assertTrue(hasattr(self.claim, 'fraud_analysis'))

    def test_external_claim_ingestion_api(self):
        """Test POST /api/external-claim/ creates and validates claim."""
        payload = {
            "user_id": self.user.id,
            "patient_name": "Ravi Shankar",
            "hospital_name": "Fortis Hospital",
            "procedure": "Cataract Surgery",
            "amount": 45000.00
        }
        response = self.client.post(
            reverse("external_claim_api"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("claim_id", data)

    def test_rest_api_claims_list(self):
        """Test GET /api/claims/ returns JSON list of claims."""
        response = self.client.get(reverse("api_claims_list_create"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(len(data["data"]), 1)

    def test_system_health_endpoint(self):
        """Test GET /api/health/ returns operational status."""
        response = self.client.get(reverse("api_system_health"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["status"], "operational")
