import json
from decimal import Decimal
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse

from claims.models import Claim
from fraud_detection.models import FraudAnalysis
from fraud_detection.services import calculate_fraud_risk, analyze_claim_data, get_fraud_analytics_overview


class FraudDetectionTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username="analyst_user",
            email="analyst@health.gov",
            password="SecurePassword123"
        )
        self.client.login(username="analyst_user", password="SecurePassword123")

    def test_low_risk_clean_claim(self):
        """Test clean claim receives low risk score and no fraud detected."""
        claim = Claim.objects.create(
            user=self.user,
            patient_name="Ananya Rao",
            hospital_name="MIOT Hospital",
            procedure="Cataract Surgery",
            amount=Decimal("60000.00"),
            previous_claims=1,
            duplicate_claim=False,
            diagnosis_procedure_match=True,
            documents_verified=True,
        )
        result = calculate_fraud_risk(claim)
        self.assertEqual(result["risk_level"], "low")
        self.assertFalse(result["fraud_detected"])
        self.assertEqual(result["recommended_action"], "approve")

    def test_high_risk_duplicate_and_inflated_claim(self):
        """Test duplicate claim with inflated amount is flagged high risk."""
        claim = Claim.objects.create(
            user=self.user,
            patient_name="Suspicious Claimant",
            hospital_name="Apex Hospital",
            procedure="Cataract Surgery",
            amount=Decimal("350000.00"), # High amount for cataract
            duplicate_claim=True,        # Duplicate flag
            diagnosis_procedure_match=False,
            documents_verified=False,
            previous_claims=9,
        )
        result = calculate_fraud_risk(claim)
        self.assertEqual(result["risk_level"], "high")
        self.assertTrue(result["fraud_detected"])
        self.assertEqual(result["recommended_action"], "reject")
        self.assertGreaterEqual(result["risk_score"], Decimal("80.00"))

    def test_direct_ai_analyze_api(self):
        """Test POST /api/fraud/analyze/ with raw JSON payload."""
        payload = {
            "patient_name": "Vikram Seth",
            "procedure": "Heart Surgery",
            "amount": 140000.00,
            "duplicate_claim": False,
            "diagnosis_procedure_match": True,
            "documents_verified": True,
        }
        response = self.client.post(
            reverse("api_analyze_fraud"),
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["code"], "ANALYSIS_COMPLETE")
        self.assertIn("risk_score", data["data"])

    def test_fraud_stats_api(self):
        """Test GET /api/fraud/stats/ returns summary metrics."""
        response = self.client.get(reverse("api_fraud_stats"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("total_claims", data["data"])
