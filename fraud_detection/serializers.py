from rest_framework import serializers
from .models import FraudAnalysis


class FraudAnalysisSerializer(serializers.ModelSerializer):
    claim_patient = serializers.CharField(source='claim.patient_name', read_only=True)
    claim_amount = serializers.DecimalField(source='claim.amount', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = FraudAnalysis
        fields = [
            'id', 'claim', 'claim_patient', 'claim_amount',
            'risk_score', 'risk_level', 'fraud_detected',
            'reasons', 'rule_flags', 'ml_confidence',
            'recommended_action', 'analyzed_at'
        ]


class DirectAIAnalyzeInputSerializer(serializers.Serializer):
    claim_id = serializers.IntegerField(required=False)
    patient_name = serializers.CharField(required=False, default="Anonymous")
    patient_age = serializers.IntegerField(required=False, default=45)
    patient_gender = serializers.CharField(required=False, default="Male")
    hospital_name = serializers.CharField(required=False, default="General Hospital")
    procedure = serializers.CharField(required=False, default="Medical Treatment")
    diagnosis = serializers.CharField(required=False, allow_blank=True, default="")
    amount = serializers.DecimalField(required=False, max_digits=12, decimal_places=2, default=50000.00)
    previous_claims = serializers.IntegerField(required=False, default=0)
    previous_claim_amount = serializers.DecimalField(required=False, max_digits=12, decimal_places=2, default=0.00)
    hospital_claim_count = serializers.IntegerField(required=False, default=20)
    patient_claim_count = serializers.IntegerField(required=False, default=1)
    duplicate_claim = serializers.BooleanField(required=False, default=False)
    diagnosis_procedure_match = serializers.BooleanField(required=False, default=True)
    documents_verified = serializers.BooleanField(required=False, default=True)
