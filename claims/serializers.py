from rest_framework import serializers
from .models import Claim, Document, Patient, MedicalRecord, FraudLabel
from fraud_detection.models import FraudAnalysis


class DocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'claim', 'file', 'file_url', 'document_type',
            'document_type_display', 'ocr_status', 'match_score',
            'extracted_text', 'extracted_data', 'uploaded_at'
        ]
        read_only_fields = ['id', 'ocr_status', 'match_score', 'extracted_text', 'extracted_data', 'uploaded_at']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class FraudAnalysisSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudAnalysis
        fields = [
            'risk_score', 'risk_level', 'fraud_detected',
            'reasons', 'rule_flags', 'ml_confidence',
            'recommended_action', 'analyzed_at'
        ]


class FraudLabelSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudLabel
        fields = ['is_fraud', 'fraud_type', 'risk_level']


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'name', 'age', 'gender',
            'contact_phone', 'email', 'blood_group',
            'policy_number', 'insurance_provider', 'created_at'
        ]


class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'patient_name', 'claim',
            'hospital_name', 'doctor_name', 'admission_date',
            'discharge_date', 'diagnosis', 'procedure',
            'prescriptions', 'lab_results', 'notes', 'created_at'
        ]


class ClaimSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    fraud_analysis = FraudAnalysisSummarySerializer(read_only=True)
    fraud_label = FraudLabelSummarySerializer(read_only=True)
    patient_details = PatientSerializer(source='patient', read_only=True)

    class Meta:
        model = Claim
        fields = [
            'id', 'dataset_claim_id', 'user', 'patient', 'patient_details',
            'patient_name', 'patient_age', 'patient_gender',
            'hospital_name', 'hospital_id', 'doctor_id',
            'diagnosis', 'procedure', 'amount',
            'claim_date', 'admission_date', 'discharge_date', 'days_admitted',
            'insurance_type', 'previous_claims', 'previous_claim_amount',
            'documents_verified', 'duplicate_claim', 'diagnosis_procedure_match',
            'hospital_claim_count', 'patient_claim_count',
            'status', 'status_display', 'notes', 'documents',
            'fraud_analysis', 'fraud_label', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at']


class ClaimCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = [
            'dataset_claim_id', 'patient_name', 'patient_age', 'patient_gender',
            'hospital_name', 'hospital_id', 'doctor_id',
            'diagnosis', 'procedure', 'amount',
            'claim_date', 'admission_date', 'discharge_date', 'days_admitted',
            'insurance_type', 'previous_claims', 'previous_claim_amount',
            'duplicate_claim', 'diagnosis_procedure_match',
            'hospital_claim_count', 'patient_claim_count', 'notes'
        ]
