from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from authentication.models import UserProfile


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username="testdoctor",
            email="doctor@hospital.org",
            password="SecurePassword123"
        )
        self.profile = UserProfile.objects.get(user=self.user)
        self.profile.role = "doctor"
        self.profile.save()

    def test_user_profile_auto_created(self):
        """Test that UserProfile is automatically created via signals."""
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.profile)
        self.assertEqual(self.user.profile.role, "doctor")

    def test_web_login(self):
        """Test Web form login."""
        response = self.client.post(reverse("login"), {
            "username": "testdoctor",
            "password": "SecurePassword123"
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse("dashboard"))

    def test_api_login_success(self):
        """Test POST /api/auth/login/ returns success JSON."""
        response = self.client.post(
            reverse("api_login"),
            data={"username": "testdoctor", "password": "SecurePassword123"},
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["user"]["username"], "testdoctor")
        self.assertEqual(data["data"]["user"]["profile"]["role"], "doctor")

    def test_api_login_invalid_credentials(self):
        """Test POST /api/auth/login/ with wrong password."""
        response = self.client.post(
            reverse("api_login"),
            data={"username": "testdoctor", "password": "WrongPassword"},
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertFalse(data["success"])
        self.assertEqual(data["code"], "INVALID_CREDENTIALS")

    def test_api_register_new_user(self):
        """Test POST /api/auth/register/ creates user and profile."""
        payload = {
            "username": "newauditor",
            "email": "auditor@insurance.com",
            "password": "AuditorPassword123",
            "role": "auditor",
            "organization": "National Health Agency"
        }
        response = self.client.post(
            reverse("api_register"),
            data=payload,
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["username"], "newauditor")
        self.assertEqual(data["data"]["profile"]["role"], "auditor")
