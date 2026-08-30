import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClaimItem, DocumentType } from '../../types';
import { StatusBadge, RiskBadge } from '../common/StatusBadge';
import {
  X,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSearch,
  DollarSign,
  Layers,
  ChevronRight,
  Database,
  Building2,
  User,
  HelpCircle,
  UploadCloud,
  Send,
  Lock,
  ExternalLink,
  Info,
} from 'lucide-react';

interface ClaimDetailModalProps {
  claim: ClaimItem;
  onClose: () => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({ claim, onClose }) => {
  const {
    currentRole,
    currentUser,
    adjudicateClaim,
    uploadAdditionalDocument,
    setIsBlockchainModalOpen,
    setIsDigiLockerModalOpen,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ai_suite' | 'ocr_charges' | 'documents' | 'timeline'>('ai_suite');

  // Adjudication action states
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Non-medical procedure exclusion under Section 12.b');
  const [rejectionNote, setRejectionNote] = useState('');

  const [isRequestDocsModalOpen, setIsRequestDocsModalOpen] = useState(false);
  const [selectedDocsToRequest, setSelectedDocsToRequest] = useState<string[]>([
    'Signed & Stamped Final Discharge Summary (with Doctor Reg No.)',
    'Itemized Hospital Pharmacy Bill with Medicine Names and Batch Numbers',
  ]);

  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [customApprovedAmount, setCustomApprovedAmount] = useState<number>(claim.eligibleAmount);
  const [approvalNote, setApprovalNote] = useState('Auto-approved following AI RAG policy compliance.');

  // Patient missing doc upload
  const [uploadDocName, setUploadDocName] = useState('Signed_Discharge_Summary_DoctorStamp.pdf');

  const handleApproveSubmit = () => {
    adjudicateClaim(claim.id, 'approve', {
      approvedAmount: customApprovedAmount,
      notes: approvalNote,
    });
    setIsApproveConfirmOpen(false);
  };

  const handleRejectSubmit = () => {
    adjudicateClaim(claim.id, 'reject', {
      rejectionReason,
      notes: rejectionNote || `Claim rejected due to: ${rejectionReason}`,
    });
    setIsRejectModalOpen(false);
  };

  const handleRequestDocsSubmit = () => {
    adjudicateClaim(claim.id, 'request_docs', {
      missingDocsList: selectedDocsToRequest,
      notes: `Requested ${selectedDocsToRequest.length} supporting documents from patient/hospital.`,
    });
    setIsRequestDocsModalOpen(false);
  };

  const handleUploadMissingDoc = (e: React.FormEvent) => {
    e.preventDefault();
    uploadAdditionalDocument(claim.id, {
      name: uploadDocName,
      type: 'discharge_summary',
      extractedTextSnippet: 'Physician seal and itemized pharmacy records verified.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-teal-50/20 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                  {claim.claimNumber}
                </h2>
                <StatusBadge status={claim.status} size="md" />
                <RiskBadge tier={claim.aiAnalysis.riskTier} score={claim.aiAnalysis.overallRiskScore} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {claim.patientName} ({claim.patientAge}y, {claim.patientGender}) • {claim.hospitalName} • Submitted {claim.submittedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Blockchain Transaction link */}
            <button
              onClick={() => setIsBlockchainModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              title="Inspect on Immutable Blockchain"
            >
              <Layers size={13} className="text-indigo-600" />
              <span className="font-mono text-[11px] truncate max-w-[90px]">{claim.blockchainTxHash.substring(0, 10)}...</span>
            </button>

            <button
              id="btn-close-claim-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex gap-4 overflow-x-auto text-xs font-bold text-slate-500">
          <button
            id="tab-ai-suite"
            onClick={() => setActiveTab('ai_suite')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'ai_suite'
                ? 'border-teal-600 text-teal-900 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles size={16} className={activeTab === 'ai_suite' ? 'text-teal-600' : 'text-slate-400'} />
            <span>AI Verification Suite & RAG</span>
          </button>

          <button
            id="tab-ocr-charges"
            onClick={() => setActiveTab('ocr_charges')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'ocr_charges'
                ? 'border-teal-600 text-teal-900 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileSearch size={16} className={activeTab === 'ocr_charges' ? 'text-teal-600' : 'text-slate-400'} />
            <span>OCR Itemized Charges ({claim.itemizedCharges.length})</span>
          </button>

          <button
            id="tab-documents"
            onClick={() => setActiveTab('documents')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'documents'
                ? 'border-teal-600 text-teal-900 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText size={16} className={activeTab === 'documents' ? 'text-teal-600' : 'text-slate-400'} />
            <span>Medical Documents ({claim.documents.length})</span>
          </button>

          <button
            id="tab-timeline"
            onClick={() => setActiveTab('timeline')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'timeline'
                ? 'border-teal-600 text-teal-900 font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock size={16} className={activeTab === 'timeline' ? 'text-teal-600' : 'text-slate-400'} />
            <span>Audit Timeline ({claim.timeline.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: AI Verification Suite */}
          {activeTab === 'ai_suite' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Financial Adjudication Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-700/60 gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                      Adjudication Financial Summary
                    </span>
                    <h3 className="text-lg font-extrabold tracking-tight mt-0.5">
                      Diagnosis: {claim.diagnosis}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono">ICD-10: {claim.icdCode}</p>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-xs text-slate-400">Net Approved Payout</span>
                    <p className="text-2xl font-black font-mono text-emerald-400">
                      ₹{claim.status === 'rejected' ? '0' : (claim.approvedAmount || claim.eligibleAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Total Claimed</span>
                    <span className="font-bold text-white font-mono text-sm">
                      ₹{claim.claimedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Room Rent Deduction</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">
                      -₹{claim.roomRentDeduction.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Non-Medical Deductions</span>
                    <span className="font-bold text-rose-400 font-mono text-sm">
                      -₹{claim.nonMedicalDeduction.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Co-Pay / Deductible</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">
                      -₹{claim.copayAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* "Why AI Recommends This Decision" Explainable AI Card */}
              <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-teal-950 uppercase tracking-wider">
                        Why AI Recommends This Decision
                      </h4>
                      <p className="text-[11px] text-teal-700">
                        Neural Policy Clause Cross-Matching (Confidence {claim.aiAnalysis.confidenceScore}%)
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                      claim.aiAnalysis.aiRecommendation === 'APPROVE'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : claim.aiAnalysis.aiRecommendation === 'FLAG_FRAUD'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    AI Recommendation: {claim.aiAnalysis.aiRecommendation.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-teal-100">
                  {claim.aiAnalysis.aiReasoningSummary}
                </p>

                {claim.aiAnalysis.riskFlags && claim.aiAnalysis.riskFlags.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-rose-800">
                      <AlertTriangle size={14} className="text-rose-600" />
                      Detected Risk Anomalies ({claim.aiAnalysis.riskFlags.length})
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 pl-1">
                      {claim.aiAnalysis.riskFlags.map((rf, idx) => (
                        <li key={idx}>{rf}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* RAG Policy Clauses Matching Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  RAG Policy Clauses Matched Against Schedule
                </h4>
                <div className="space-y-2.5">
                  {claim.aiAnalysis.matchedClauses.map((clause, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                            {clause.clauseId}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{clause.clauseTitle}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            clause.isCompliant
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {clause.statusText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                        "{clause.excerpt}"
                      </p>
                      <p className="text-xs text-teal-800 font-medium">
                        <strong>Adjudication Impact: </strong>
                        {clause.impactExplanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automated Validation Checks Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Automated Pre-Adjudication Rule Checks ({claim.aiAnalysis.validationChecks.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {claim.aiAnalysis.validationChecks.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-2.5"
                    >
                      {chk.status === 'passed' && (
                        <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      )}
                      {chk.status === 'warning' && (
                        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                      )}
                      {chk.status === 'failed' && (
                        <XCircle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{chk.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{chk.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Documents Alert Box (if action_required) */}
              {claim.aiAnalysis.missingDocuments.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <span>Missing Required Documents ({claim.aiAnalysis.missingDocuments.length})</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-amber-800 space-y-1 pl-1">
                    {claim.aiAnalysis.missingDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>

                  {(currentRole === 'patient' || currentRole === 'hospital') && claim.status === 'action_required' && (
                    <form onSubmit={handleUploadMissingDoc} className="pt-2 border-t border-amber-200 flex gap-2">
                      <input
                        type="text"
                        value={uploadDocName}
                        onChange={(e) => setUploadDocName(e.target.value)}
                        placeholder="Document name to upload..."
                        className="w-full px-3 py-1.5 rounded-xl border border-amber-300 text-xs bg-white"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shrink-0"
                      >
                        Upload & Re-Verify
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OCR Extracted Charges */}
          {activeTab === 'ocr_charges' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Expense Category</th>
                        <th className="py-3 px-4">Line Item Description</th>
                        <th className="py-3 px-4 text-right">Claimed (₹)</th>
                        <th className="py-3 px-4 text-right">Eligible (₹)</th>
                        <th className="py-3 px-4">Coverage & Audit Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {claim.itemizedCharges.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{item.category}</td>
                          <td className="py-3 px-4 text-slate-600">{item.description}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            ₹{item.claimedAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            ₹{item.eligibleAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {item.isCovered ? (
                              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Covered under Policy
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                                <XCircle size={12} /> {item.deductionReason || 'Non-Payable item'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500">OCR Extraction Engine Accuracy: <strong>98.7%</strong></span>
                  <div className="flex gap-4">
                    <span className="text-slate-600">
                      Total Billed: <strong className="font-mono text-slate-900">₹{claim.claimedAmount.toLocaleString()}</strong>
                    </span>
                    <span className="text-teal-900">
                      Total Payable: <strong className="font-mono text-teal-700 text-sm">₹{claim.eligibleAmount.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Documents Viewer */}
          {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {claim.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{doc.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {doc.size} • {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        OCR {doc.ocrConfidence}%
                      </span>
                    </div>

                    {doc.extractedTextSnippet && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic">
                        "{doc.extractedTextSnippet}"
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 capitalize">{doc.type.replace('_', ' ')}</span>
                      <button
                        onClick={() => showToast('info', 'Opening Document Scan', doc.name)}
                        className="text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1"
                      >
                        <span>View OCR Scan</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {claim.timeline.map((evt, idx) => (
                  <div key={idx} className="relative group">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                        evt.status === 'done'
                          ? 'bg-emerald-500 text-white'
                          : evt.status === 'warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-teal-600 text-white animate-pulse'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{evt.step}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600">{evt.note}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Actor: {evt.actor} ({evt.actorRole})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar (Role-Specific) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Current Status: <strong className="text-slate-800 capitalize">{claim.status.replace('_', ' ')}</strong>
          </div>

          {/* Insurance / Admin Adjudicator Action Buttons */}
          {(currentRole === 'insurance' || currentRole === 'admin') && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="btn-adjudicate-flag"
                onClick={() => adjudicateClaim(claim.id, 'flag_fraud')}
                className="px-3 py-2 rounded-xl bg-red-100 text-red-800 border border-red-300 text-xs font-bold hover:bg-red-200 flex items-center gap-1.5"
              >
                <AlertTriangle size={14} />
                <span>Flag for SIU Audit</span>
              </button>

              <button
                id="btn-adjudicate-request-docs"
                onClick={() => setIsRequestDocsModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 flex items-center gap-1.5"
              >
                <HelpCircle size={14} />
                <span>Request Documents</span>
              </button>

              <button
                id="btn-adjudicate-reject"
                onClick={() => setIsRejectModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs flex items-center gap-1.5"
              >
                <XCircle size={14} />
                <span>Reject Claim</span>
              </button>

              <button
                id="btn-adjudicate-approve"
                onClick={() => {
                  setCustomApprovedAmount(claim.eligibleAmount);
                  setIsApproveConfirmOpen(true);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>Approve & Settle Payout</span>
              </button>
            </div>
          )}

          {/* Patient / Hospital View */}
          {(currentRole === 'patient' || currentRole === 'hospital') && (
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {isApproveConfirmOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Confirm Claim Approval</h3>
                <p className="text-xs text-slate-500">Initiates instant NEFT / UPI settlement</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Approved Payout Amount (₹)</label>
              <input
                type="number"
                value={customApprovedAmount}
                onChange={(e) => setCustomApprovedAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-base font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adjudication Note</label>
              <textarea
                rows={2}
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsApproveConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
              >
                Confirm Approval & Execute Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Reject Claim</h3>
                <p className="text-xs text-slate-500">Provide official clause repudiation grounds</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Repudiation Clause Grounds</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              >
                <option value="Non-medical procedure exclusion under Section 12.b">Section 12.b: Cosmetic / Aesthetic Exclusions</option>
                <option value="Pre-existing Disease (PED) Waiting Period Violation">Section 6.1: 24-Month PED Waiting Period Active</option>
                <option value="Fraudulent / Altered Predated Invoices Detected">Section 14.1: Material Misrepresentation & Predated Bills</option>
                <option value="Hospitalization not medically indicated (<24 hrs non-daycare)">Section 2.1: Non-Daycare Admission Under 24 Hours</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Repudiation Letter Comment</label>
              <textarea
                rows={3}
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Detailed rejection remarks to be delivered to policyholder..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Issue Formal Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Documents Modal */}
      {isRequestDocsModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Request Additional Documents</h3>
                <p className="text-xs text-slate-500">Dispatch action request to Patient and Hospital</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                'Signed & Stamped Final Discharge Summary (with Doctor Reg No.)',
                'Itemized Hospital Pharmacy Bill with Medicine Names and Batch Numbers',
                'Diagnostic Lab Reports (Ultrasound / Histopathology Biopsy)',
                'Original OT Notes & Intra-Operative Arthroscopy Photographs',
              ].map((docName, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocsToRequest.includes(docName)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocsToRequest([...selectedDocsToRequest, docName]);
                      } else {
                        setSelectedDocsToRequest(selectedDocsToRequest.filter((d) => d !== docName));
                      }
                    }}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-slate-800 font-medium">{docName}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRequestDocsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDocsSubmit}
                className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
              >
                Dispatch Document Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
