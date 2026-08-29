import csv
import os
from datetime import date

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from claims.models import Claim


class Command(BaseCommand):
    help = "Import healthcare claim dataset into the Claim model"

    def handle(self, *args, **options):
        file_path = os.path.join(
            "dataset",
            "sarakshan_claim_fraud_dataset_v2.csv"
        )

        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(
                    f"Dataset not found: {file_path}"
                )
            )
            return

        user = User.objects.first()

        if not user:
            self.stdout.write(
                self.style.ERROR(
                    "No user exists. Create a Django user first."
                )
            )
            return

        imported = 0

        with open(file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                Claim.objects.create(
                    dataset_claim_id=row["claim_id"],
                    user=user,
                    patient_name=row["patient_name"],
                    patient_age=int(row["patient_age"]),
                    patient_gender=row["patient_gender"],
                    hospital_name=row["hospital_name"],
                    hospital_id=row["hospital_id"],
                    doctor_id=row["doctor_id"],
                    diagnosis=row["diagnosis"],
                    procedure=row["procedure"],
                    amount=row["claim_amount"],
                    claim_date=row["claim_date"],
                    admission_date=row["admission_date"],
                    discharge_date=row["discharge_date"],
                    days_admitted=int(row["days_admitted"]),
                    insurance_type=row["insurance_type"],
                    previous_claims=int(row["previous_claims"]),
                    previous_claim_amount=row["previous_claim_amount"],
                    documents_verified=(
                        row["documents_verified"].lower() == "yes"
                    ),
                    duplicate_claim=(
                        row["duplicate_claim"].lower() == "yes"
                    ),
                    diagnosis_procedure_match=(
                        row["diagnosis_procedure_match"].lower() == "yes"
                    ),
                    hospital_claim_count=int(
                        row["hospital_claim_count"]
                    ),
                    patient_claim_count=int(
                        row["patient_claim_count"]
                    ),
                    status="draft",
                )

                imported += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully imported {imported} claims."
            )
        )