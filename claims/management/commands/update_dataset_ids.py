import csv
import os

from django.core.management.base import BaseCommand
from claims.models import Claim


class Command(BaseCommand):
    help = "Assign dataset claim IDs to existing imported claims"

    def handle(self, *args, **options):
        file_path = os.path.join(
            "dataset",
            "sarakshan_claim_fraud_dataset.csv"
        )

        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(
                    f"Dataset not found: {file_path}"
                )
            )
            return

        updated = 0

        claims = Claim.objects.filter(
            dataset_claim_id__isnull=True
        ).order_by("id")

        with open(file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            for row, claim in zip(reader, claims):
                claim.dataset_claim_id = row["claim_id"]
                claim.save(update_fields=["dataset_claim_id"])
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Updated {updated} claims with dataset IDs."
            )
        )