from django.core.management.base import BaseCommand
from claims.models import Claim, Patient, MedicalRecord
from claims.services import get_or_create_patient_for_claim, create_encounter_for_claim
from fraud_detection.services import calculate_fraud_risk
from fraud_detection.models import FraudAnalysis


class Command(BaseCommand):
    help = "Sync unified Patient entities, Medical Records, and AI Fraud Analyses across all claims."

    def handle(self, *args, **options):
        claims = Claim.objects.all()
        total_claims = claims.count()

        if total_claims == 0:
            self.stdout.write(self.style.WARNING("No claims found in database to sync."))
            return

        synced_patients = 0
        synced_records = 0
        synced_analyses = 0

        self.stdout.write(f"Syncing platform entities for {total_claims} claims...")

        for claim in claims:
            # 1. Sync Patient
            if not claim.patient:
                get_or_create_patient_for_claim(claim)
                synced_patients += 1

            # 2. Sync Encounter / Medical Record
            if not MedicalRecord.objects.filter(claim=claim).exists():
                create_encounter_for_claim(claim)
                synced_records += 1

            # 3. Populate Fraud Analysis if missing
            if not hasattr(claim, 'fraud_analysis') or claim.fraud_analysis is None:
                calculate_fraud_risk(claim)
                synced_analyses += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Platform Data Sync Complete:\n"
                f" - Total Claims: {total_claims}\n"
                f" - Unique Patients in System: {Patient.objects.count()}\n"
                f" - Encounters / Medical Records: {MedicalRecord.objects.count()}\n"
                f" - AI Fraud Analyses: {FraudAnalysis.objects.count()}"
            )
        )
