import csv
import os

from django.core.management.base import BaseCommand
from claims.models import Claim, FraudLabel


class Command(BaseCommand):
    help = "Import ground-truth fraud labels for existing claims"

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

        created = 0
        skipped = 0

        with open(file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                claim = Claim.objects.filter(
                    dataset_claim_id=row["claim_id"]
                ).first()

                if not claim:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Claim not found for {row['claim_id']}"
                        )
                    )
                    skipped += 1
                    continue

                fraud_type_map = {
                    "None": "none",
                    "Duplicate Claim": "duplicate",
                    "Inflated Amount": "inflated_amount",
                    "Suspicious Provider": "suspicious_provider",
                    "Excessive Claims": "excessive_claims",
                    "Diagnosis/Procedure Mismatch": "diagnosis_mismatch",
                }

                FraudLabel.objects.update_or_create(
                    claim=claim,
                    defaults={
                        "is_fraud": row["is_fraud"] == "1",
                        "fraud_type": fraud_type_map[
                            row["fraud_type"]
                        ],
                        "risk_level": row["risk_level"].lower(),
                    },
                )

                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Processed {created} fraud labels."
            )
        )

        if skipped:
            self.stdout.write(
                self.style.WARNING(
                    f"Skipped {skipped} claims."
                )
            )