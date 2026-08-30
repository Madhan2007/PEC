import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClaimDocument, DocumentType, ItemizedCharge, AIAnalysisResult } from '../../types';
import confetti from 'canvas-confetti';
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Scan,
  Database,
  Building2,
  User,
  DollarSign,
  Layers,
  Edit2,
  Trash2,
  Plus,
  Info,
} from 'lucide-react';

interface SubmitClaimWizardProps {
  onClose: () => void;
}

export const SubmitClaimWizard: React.FC<SubmitClaimWizardProps> = ({ onClose }) => {
  const { currentUser, currentRole, addClaim, showToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Form State
  const [patientName, setPatientName] = useState(
    currentRole === 'patient' ? currentUser?.name || 'Rajesh Kumar' : 'Arunachalam Sundaram'
  );
  const [patientAge, setPatientAge] = useState<number>(44);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState(currentUser?.phone || '+91 98450 12345');
  const [patientEmail, setPatientEmail] = useState(currentUser?.email || 'patient@healthmail.com');
  const [abhaId, setAbhaId] = useState(currentUser?.abhaId || '91-4820-9921-1029');
  const [digilockerVerified, setDigilockerVerified] = useState(true);

  // Policy Info
  const [policyNumber, setPolicyNumber] = useState(currentUser?.policyNumber || 'CS-GOLD-89204');
  const [policyName, setPolicyName] = useState(currentUser?.policyName || 'CareShield Complete Health Guard');
  const [insurerName] = useState('CareShield General Insurance Co.');
  const [sumInsured] = useState(1500000);
  const [remainingCover] = useState(1120000);

  // Hospital & Treatment
  const [hospitalName, setHospitalName] = useState(
    currentRole === 'hospital' ? currentUser?.hospitalName || 'Apollo Super Specialty Hospital, Bangalore' : 'Apollo Super Specialty Hospital, Bangalore'
  );
  const [hospitalCity, setHospitalCity] = useState('Bangalore, KA');
  const [admissionType, setAdmissionType] = useState<'Emergency' | 'Planned' | 'Day Care'>('Planned');
  const [admissionDate, setAdmissionDate] = useState('2025-08-26');
  const [dischargeDate, setDischargeDate] = useState('2025-08-28');
  const [treatingDoctor, setTreatingDoctor] = useState('Dr. Suresh Rao (MS, MCh)');
  const [doctorRegistrationNo, setDoctorRegistrationNo] = useState('KMC-54210');
  const [diagnosis, setDiagnosis] = useState('Laparoscopic Cholecystectomy for Symptomatic Cholelithiasis');
  const [icdCode, setIcdCode] = useState('K80.20 - Gallbladder Calculus');

  const [rawFiles, setRawFiles] = useState<File[]>([]);

  // Documents
  const [documents, setDocuments] = useState<ClaimDocument[]>([
    {
      id: 'doc_init_1',
      name: 'Discharge_Summary_Signed.pdf',
      type: 'discharge_summary',
      size: '1.6 MB',
      uploadDate: 'Just now',
      ocrConfidence: 99.1,
      status: 'verified',
      extractedTextSnippet: 'Patient underwent elective Laparoscopic Cholecystectomy. Multiple cholesterol gallstones removed. Recovery uneventful.',
    },
    {
      id: 'doc_init_2',
      name: 'Itemized_Final_Hospital_Bill.pdf',
      type: 'hospital_bill',
      size: '2.1 MB',
      uploadDate: 'Just now',
      ocrConfidence: 98.4,
      status: 'verified',
      extractedTextSnippet: 'Total Billed: ₹1,12,000. OT Charges: ₹40,000, Room (Twin Bed): ₹14,000, Pharmacy: ₹28,000, Consumables: ₹5,000.',
    },
  ]);

  // Itemized Charges from OCR
  const [itemizedCharges, setItemizedCharges] = useState<ItemizedCharge[]>([
    { category: 'Room & Nursing', description: 'Twin Sharing Room (2 days @ ₹7,000/day)', claimedAmount: 14000, eligibleAmount: 14000, isCovered: true },
    { category: 'OT & Surgeon Fees', description: 'Laparoscopic OT, Anesthesia & Surgeon', claimedAmount: 52000, eligibleAmount: 52000, isCovered: true },
    { category: 'Pharmacy & IV Fluids', description: 'Post-op Antibiotics & Analgesics', claimedAmount: 26000, eligibleAmount: 26000, isCovered: true },
    { category: 'Diagnostic Labs & USG', description: 'USG Whole Abdomen & Blood Profile', claimedAmount: 15000, eligibleAmount: 15000, isCovered: true },
    { category: 'Non-Medical Overhead', description: 'Gloves, PPE, Admission Kit, Food Tray', claimedAmount: 5000, eligibleAmount: 0, isCovered: false, deductionReason: 'IRDAI non-payable items schedule' },
  ]);

  const totalClaimed = itemizedCharges.reduce((sum, item) => sum + item.claimedAmount, 0);
  const totalEligible = itemizedCharges.reduce((sum, item) => sum + item.eligibleAmount, 0);
  const nonMedicalTotal = itemizedCharges.filter(i => !i.isCovered).reduce((sum, i) => sum + i.claimedAmount, 0);

  // Real File Input Handler
  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setRawFiles((prev) => [...prev, ...fileList]);

    fileList.forEach((file) => {
      const newDoc: ClaimDocument = {
        id: 'doc_' + Date.now() + Math.random().toString(36).substring(2, 6),
        name: file.name,
        type: file.name.toLowerCase().includes('bill') ? 'hospital_bill' : 'discharge_summary',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: 'Just now',
        ocrConfidence: 98.6,
        status: 'verified',
        extractedTextSnippet: `Attached document ${file.name} ready for Django OCR extraction.`,
      };
      setDocuments((prev) => [...prev, newDoc]);
    });

    showToast('success', `${fileList.length} File(s) Selected`, 'Ready for AI OCR & validation pipeline');
  };

  // Trigger simulated OCR scanning animation
  const runOCRSimulation = () => {
    setIsScanningOCR(true);
    setOcrProgress(10);
    const interval = setInterval(() => {
      setOcrProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningOCR(false);
          setStep(3);
          showToast('success', 'Neural OCR Extraction Complete', 'Parsed line-items with 98.7% confidence');
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const handleAddSampleDoc = (type: DocumentType, name: string) => {
    const newDoc: ClaimDocument = {
      id: 'doc_' + Date.now(),
      name,
      type,
      size: (Math.random() * 1.5 + 0.8).toFixed(1) + ' MB',
      uploadDate: 'Just now',
      ocrConfidence: +(97 + Math.random() * 2.8).toFixed(1),
      status: 'verified',
      extractedTextSnippet: `Verified ${name} matching ICD ${icdCode} with Doctor Reg ${doctorRegistrationNo}.`,
    };
    setDocuments((prev) => [...prev, newDoc]);
    showToast('info', 'Document attached', name);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleChargeChange = (index: number, field: keyof ItemizedCharge, val: any) => {
    const updated = [...itemizedCharges];
    updated[index] = { ...updated[index], [field]: val };
    if (field === 'claimedAmount' && updated[index].isCovered) {
      updated[index].eligibleAmount = Number(val) || 0;
    }
    setItemizedCharges(updated);
  };

  const handleAddNewCharge = () => {
    setItemizedCharges([
      ...itemizedCharges,
      {
        category: 'Doctor Consultations',
        description: 'Physician visit charges',
        claimedAmount: 5000,
        eligibleAmount: 5000,
        isCovered: true,
      },
    ]);
  };

  const handleRemoveCharge = (index: number) => {
    setItemizedCharges(itemizedCharges.filter((_, i) => i !== index));
  };

  const handleSubmitFinal = async () => {
    // Generate AI analysis
    const aiAnalysis: AIAnalysisResult = {
      overallRiskScore: 6,
      riskTier: 'LOW',
      confidenceScore: 98.8,
      aiRecommendation: 'APPROVE',
      aiReasoningSummary: `Surgical procedure for ${diagnosis} (ICD ${icdCode}) fully corroborated by ultrasound and surgical discharge summary. Network hospital rates verified. ₹${nonMedicalTotal.toLocaleString()} non-medical overhead deducted per schedule.`,
      matchedClauses: [
        {
          clauseId: 'SEC-3.1',
          clauseTitle: 'Inpatient Surgical Hospitalization',
          excerpt: 'Laparoscopic Cholecystectomy for gallstones is 100% covered after 30-day initial waiting period.',
          isCompliant: true,
          statusText: 'Fully Compliant',
          impactExplanation: '100% eligible surgical payout.',
        },
        {
          clauseId: 'SEC-8.4',
          clauseTitle: 'Non-Medical Consumables',
          excerpt: 'IRDAI non-payable list items excluded.',
          isCompliant: true,
          statusText: 'Deduction Applied',
          impactExplanation: `₹${nonMedicalTotal.toLocaleString()} deducted for non-medical consumables.`,
        },
      ],
      validationChecks: [
        { id: 'v1', name: 'ABHA & KYC Identity Validation', category: 'identity', status: 'passed', detail: 'DigiLocker direct cryptographic signature matched UIDAI records.' },
        { id: 'v2', name: 'Policy Active & Premium In-Force', category: 'policy', status: 'passed', detail: `Active through 2026. Sum insured balance ₹${remainingCover.toLocaleString()} sufficient.` },
        { id: 'v3', name: 'Network Hospital Accreditation & Geo-IP', category: 'medical', status: 'passed', detail: 'Apollo Hospital Bangalore is Tier-1 Preferred Network Partner.' },
        { id: 'v4', name: 'Medical Necessity & Histopathology Match', category: 'medical', status: 'passed', detail: 'USG Report confirmed acute cholelithiasis requiring surgical removal.' },
        { id: 'v5', name: 'Duplicate Invoice Hash Check', category: 'fraud', status: 'passed', detail: 'Unique invoice hash passed national anti-duplicate ledger check.' },
      ],
      missingDocuments: [],
      riskFlags: [],
      suggestedApprovedAmount: totalEligible,
    };

    await addClaim({
      patientId: currentUser?.id || 'usr_pat_101',
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      abhaId,
      digilockerVerified,
      policyNumber,
      policyName,
      insurerName,
      sumInsured,
      remainingCover,
      policyExpiry: '2026-03-31',
      hospitalId: 'HOSP-BLR-0042',
      hospitalName,
      hospitalCity,
      isNetworkHospital: true,
      admissionDate,
      dischargeDate,
      admissionType,
      treatingDoctor,
      doctorRegistrationNo,
      diagnosis,
      icdCode,
      claimedAmount: totalClaimed,
      eligibleAmount: totalEligible,
      roomRentDeduction: 0,
      copayAmount: 0,
      nonMedicalDeduction: nonMedicalTotal,
      approvedAmount: totalEligible,
      status: 'ai_verified',
      submissionChannel: currentRole === 'hospital' ? 'Hospital TPA Desk' : 'Patient Web',
      documents,
      itemizedCharges,
      aiAnalysis,
    }, rawFiles);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#0284c7', '#10b981', '#6366f1'],
      });
    } catch (e) {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 via-sky-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {currentRole === 'hospital' ? 'Hospital Cashless Pre-Auth & Intake' : 'Submit Health Insurance Claim'}
              </h2>
              <p className="text-xs text-slate-500">
                Step {step} of 4: {step === 1 && 'Patient & Hospital Details'}
                {step === 2 && 'Upload Medical Documents'}
                {step === 3 && 'Neural OCR & Extracted Itemization'}
                {step === 4 && 'AI RAG Verification & Final Review'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-claim-wizard"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { num: 1, label: 'Patient & Details' },
            { num: 2, label: 'Upload Documents' },
            { num: 3, label: 'OCR & Itemization' },
            { num: 4, label: 'AI Check & Submit' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                step === s.num
                  ? 'text-teal-700'
                  : step > s.num
                  ? 'text-emerald-700'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                  step === s.num
                    ? 'bg-teal-600 text-white shadow-xs'
                    : step > s.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > s.num ? <CheckCircle2 size={14} /> : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
              {s.num < 4 && <span className="text-slate-300 ml-1">→</span>}
            </div>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Patient & Hospital Details */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* ABHA / DigiLocker Auto-fill Bar */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Database size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-sky-950">ABHA Health ID & DigiLocker Sync</p>
                    <p className="text-[11px] text-sky-700">
                      Auto-pull verified Aadhaar KYC and hospital electronic health records
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-sky-900 bg-white px-2.5 py-1 rounded-lg border border-sky-300">
                    {abhaId}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ABHA Verified ✓
                  </span>
                </div>
              </div>

              {/* Patient Fields Grid */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  1. Patient & Policy Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age & Gender</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="w-20 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Health Policy Number</label>
                    <input
                      type="text"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Treatment & Hospital Details */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  2. Hospitalization & Medical Diagnosis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Treating Hospital</label>
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Admission Type</label>
                    <select
                      value={admissionType}
                      onChange={(e) => setAdmissionType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    >
                      <option value="Emergency">Emergency Hospitalization</option>
                      <option value="Planned">Planned Surgical Inpatient</option>
                      <option value="Day Care">Day Care Procedure (&lt;24 hrs)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={admissionDate}
                      onChange={(e) => setAdmissionDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Discharge Date</label>
                    <input
                      type="date"
                      value={dischargeDate}
                      onChange={(e) => setDischargeDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Treating Doctor & Reg No.</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={treatingDoctor}
                        onChange={(e) => setTreatingDoctor(e.target.value)}
                        placeholder="Dr. Name"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={doctorRegistrationNo}
                        onChange={(e) => setDoctorRegistrationNo(e.target.value)}
                        placeholder="Reg No"
                        className="w-28 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Diagnosis & ICD-10 Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={icdCode}
                        onChange={(e) => setIcdCode(e.target.value)}
                        className="w-32 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Document Uploads & Neural OCR trigger */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Upload Claim Documents</h3>
                  <p className="text-xs text-slate-500">
                    Upload Discharge Summary, Itemized Hospital Bill, Prescriptions and Diagnostic Reports.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSampleDoc('diagnostic_report', 'Ultrasound_Abdomen_Color_Doppler.pdf')}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add Diagnostic Lab Report</span>
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div className="border-2 border-dashed border-teal-300 rounded-3xl p-6 text-center bg-teal-50/30 hover:bg-teal-50/50 transition-colors relative">
                <input
                  type="file"
                  id="claim-file-upload-input"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={handleRealFileUpload}
                  className="hidden"
                />
                <label htmlFor="claim-file-upload-input" className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse files or drag and drop PDF / JPG / TXT bills
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports medical bills & discharge summaries • Live Django OCR Auto-Parsing enabled
                  </p>
                </label>

                {/* Quick Add Presets */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-teal-100">
                  <span className="text-[11px] font-semibold text-slate-500">Quick samples:</span>
                  <label
                    htmlFor="claim-file-upload-input"
                    className="px-2.5 py-1 rounded-lg bg-teal-600 text-white cursor-pointer text-[11px] font-bold hover:bg-teal-700 shadow-xs"
                  >
                    📁 Select Local File
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddSampleDoc('prescription', 'Doctor_Discharge_Prescriptions.pdf')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    + Add Sample Prescription
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSampleDoc('implant_invoice', 'Surgical_Mesh_Implant_Sticker.pdf')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    + Add Implant Sticker
                  </button>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Attached Documents ({documents.length})
                </p>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-teal-700 flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {doc.size} • Uploaded {doc.uploadDate} •{' '}
                          <span className="text-teal-700 font-semibold">OCR Confidence {doc.ocrConfidence}%</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* OCR Scanning Overlay Animation */}
              {isScanningOCR && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Scan size={20} className="text-teal-400 animate-spin" />
                      <div>
                        <p className="text-xs font-bold">ClaimEase Neural OCR Engine</p>
                        <p className="text-[11px] text-teal-200">
                          Extracting hospital billing entities, ICD-10 mapping & non-medical items...
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-300">{ocrProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-sky-400 h-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Editable OCR Data & Itemized Charges */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal-950">OCR Extraction & Automated Entity Mapping</p>
                    <p className="text-[11px] text-teal-700">
                      All itemized charges extracted with 98.7% confidence. You can edit any value before submission.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewCharge}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 flex items-center gap-1 shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add Line Item</span>
                </button>
              </div>

              {/* Charges Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Description / Details</th>
                        <th className="py-2.5 px-4">Claimed (₹)</th>
                        <th className="py-2.5 px-4">Coverage Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {itemizedCharges.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-800">
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => handleChargeChange(index, 'category', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold"
                            />
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleChargeChange(index, 'description', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            <input
                              type="number"
                              value={item.claimedAmount}
                              onChange={(e) => handleChargeChange(index, 'claimedAmount', e.target.value)}
                              className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                const newCovered = !item.isCovered;
                                handleChargeChange(index, 'isCovered', newCovered);
                                handleChargeChange(index, 'eligibleAmount', newCovered ? item.claimedAmount : 0);
                              }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                item.isCovered
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {item.isCovered ? 'Covered (Payable)' : 'Non-Payable (Deduction)'}
                            </button>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveCharge(index)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div className="bg-slate-50/80 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-slate-500">Claimed Total: </span>
                      <span className="font-extrabold text-slate-900 text-sm font-mono">
                        ₹{totalClaimed.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Non-Medical Deductions: </span>
                      <span className="font-bold text-rose-700 font-mono">
                        -₹{nonMedicalTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 px-3 rounded-xl bg-emerald-100 text-emerald-950 font-bold border border-emerald-200">
                    <span>Estimated Eligible Amount: </span>
                    <span className="text-sm font-mono font-extrabold text-emerald-800">
                      ₹{totalEligible.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AI Pre-Validation Check & Review */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">AI Pre-Flight Validation Passed (98.8% Confidence)</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Your claim meets all standard policy eligibility rules, diagnosis coding (ICD K80.20), and network hospital tariffs.
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient & Hospital</p>
                  <p className="text-sm font-bold text-slate-900">{patientName} ({patientAge} yrs, {patientGender})</p>
                  <p className="text-xs text-slate-600 font-mono">ABHA ID: {abhaId}</p>
                  <p className="text-xs text-slate-600 font-semibold">{hospitalName}</p>
                  <p className="text-xs text-slate-500">
                    {admissionDate} to {dischargeDate} • {admissionType}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial Breakdown</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Total Billed Amount:</span>
                    <span className="font-mono font-bold text-slate-900">₹{totalClaimed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-rose-600">
                    <span>Non-Medical Deductions:</span>
                    <span className="font-mono font-bold">-₹{nonMedicalTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-200 text-teal-900">
                    <span>Net Eligible Payout:</span>
                    <span className="font-mono text-base text-teal-700">₹{totalEligible.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security & Blockchain Stamp */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-indigo-600" />
                  <span>Will be recorded on Immutable Blockchain Audit Trail with ZK-Proof.</span>
                </div>
                <span className="font-mono text-indigo-700 font-semibold">Block #4.89M</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              id="btn-claim-step-back"
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 && (
            <button
              id="btn-claim-step-1-next"
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 flex items-center gap-2"
            >
              <span>Continue to Documents</span>
              <ArrowRight size={16} />
            </button>
          )}

          {step === 2 && (
            <button
              id="btn-trigger-ocr"
              type="button"
              disabled={isScanningOCR}
              onClick={runOCRSimulation}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 shadow-md shadow-teal-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Scan size={16} />
              <span>{isScanningOCR ? 'Scanning Documents...' : 'Extract & Parse via Neural OCR'}</span>
              <ArrowRight size={16} />
            </button>
          )}

          {step === 3 && (
            <button
              id="btn-claim-step-3-next"
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 flex items-center gap-2"
            >
              <span>Run AI Pre-Validation</span>
              <ArrowRight size={16} />
            </button>
          )}

          {step === 4 && (
            <button
              id="btn-claim-final-submit"
              type="button"
              onClick={handleSubmitFinal}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg shadow-teal-500/25 flex items-center gap-2"
            >
              <Sparkles size={16} />
              <span>Submit Claim to Underwriting</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
