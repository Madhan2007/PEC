import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, RiskBadge } from '../common/StatusBadge';
import {
  Building2,
  FilePlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  FileText,
  Activity,
  UserCheck,
  Zap,
} from 'lucide-react';

interface HospitalDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ activeTab = 'dashboard', setActiveTab }) => {
  const {
    currentUser,
    claims,
    setSelectedClaimForDetail,
    setIsNewClaimModalOpen,
    setIsDigiLockerModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const hospitalClaims = claims; // Show all inpatient hospital queue

  const filteredClaims = hospitalClaims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.treatingDoctor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && (claim.status === 'approved' || claim.status === 'paid_out')) ||
      (statusFilter === 'PENDING' && (claim.status === 'submitted' || claim.status === 'ocr_extracted' || claim.status === 'ai_verified' || claim.status === 'under_review')) ||
      (statusFilter === 'ACTION_REQUIRED' && claim.status === 'action_required') ||
      (statusFilter === 'FLAGGED' && claim.status === 'flagged');

    return matchesSearch && matchesStatus;
  });

  const totalClaimsCount = hospitalClaims.length;
  const pendingCount = hospitalClaims.filter((c) => c.status === 'submitted' || c.status === 'ocr_extracted' || c.status === 'ai_verified' || c.status === 'under_review').length;
  const approvedCount = hospitalClaims.filter((c) => c.status === 'approved' || c.status === 'paid_out').length;
  const actionRequiredCount = hospitalClaims.filter((c) => c.status === 'action_required').length;
  const totalSettledRevenue = hospitalClaims
    .filter((c) => c.status === 'approved' || c.status === 'paid_out')
    .reduce((sum, c) => sum + (c.approvedAmount || c.eligibleAmount), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hospital TPA Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hospital TPA & Cashless Billing Desk
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              NABH Tier-1 Partner
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentUser?.hospitalName || 'Apollo Super Specialty Hospital, Bangalore'} (Code: {currentUser?.hospitalId || 'HOSP-BLR-0042'})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-hospital-submit-claim"
            onClick={() => setIsNewClaimModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FilePlus size={16} />
            <span>New Inpatient Cashless Request</span>
          </button>
        </div>
      </div>

      {/* Subviews for preauth and missing_docs */}
      {activeTab === 'missing_docs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Document Deficiency & Compliance Alerts</h2>
                  <p className="text-xs text-slate-500">Underwriter queries requiring TPA desk stamp verification or line-item receipts</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                {claims.filter((c) => c.status === 'action_required').length} Pending Requests
              </span>
            </div>

            <div className="space-y-3">
              {claims
                .filter((c) => c.status === 'action_required')
                .map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaimForDetail(claim)}
                    className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 hover:border-amber-300 transition-colors cursor-pointer space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-900 text-sm">{claim.claimNumber}</span>
                        <StatusBadge status={claim.status} size="sm" />
                        <span className="text-slate-700 font-semibold">{claim.patientName}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-900 text-sm">₹{claim.claimedAmount.toLocaleString()}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-amber-100 space-y-1">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Deficiency Notice:</span>
                      <p className="text-slate-700">Missing treating physician registration stamp and original pharmacy batch tax invoices for OT medications.</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">Admitted: {claim.admissionDate} • Dr. {claim.treatingDoctor}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClaimForDetail(claim);
                        }}
                        className="text-amber-800 font-bold hover:text-amber-950 flex items-center gap-1"
                      >
                        <span>Upload Deficient Files</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preauth' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                  <Activity size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Cashless Pre-Authorization Desk</h2>
                  <p className="text-xs text-slate-500">Instant initial sanction intimation under 15 minutes via ABDM Gateway</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewClaimModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs"
              >
                <FilePlus size={16} />
                <span>Create New Pre-Auth</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                <span className="text-blue-900 font-bold block mb-1">Average Turnaround Time</span>
                <span className="text-2xl font-extrabold font-mono text-blue-950">4.2 Mins</span>
                <p className="text-[11px] text-blue-700 mt-1">94% automated straight-through approvals</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-emerald-900 font-bold block mb-1">Initial Sanctions Issued (Today)</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-950">₹8,40,000</span>
                <p className="text-[11px] text-emerald-700 mt-1">Across 6 inpatient admissions</p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
                <span className="text-teal-900 font-bold block mb-1">ABDM Health Record Match</span>
                <span className="text-2xl font-extrabold font-mono text-teal-950">100% Verified</span>
                <p className="text-[11px] text-teal-700 mt-1">Zero manual paperwork required</p>
              </div>
            </div>

            {/* Active Pre-Auth Pipeline */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900">Active Pre-Admission Approvals</h3>
              <div className="space-y-2.5">
                {hospitalClaims.slice(0, 3).map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaimForDetail(claim)}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-900">{claim.claimNumber}</span>
                        <StatusBadge status={claim.status} size="sm" />
                        <span className="text-slate-500 font-medium">Dr. {claim.treatingDoctor}</span>
                      </div>
                      <p className="font-semibold text-slate-800 mt-1">{claim.patientName} — {claim.diagnosis}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Sanction Amount</span>
                        <span className="font-bold font-mono text-slate-900 text-sm">₹{claim.eligibleAmount.toLocaleString()}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Inpatients</span>
            <Building2 size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{totalClaimsCount}</p>
          <p className="text-[11px] text-slate-400">Total hospital admissions</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Pre-Auth Pending</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono">{pendingCount}</p>
          <p className="text-[11px] text-amber-700">AI Pre-Verification in progress</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Approved Cashless</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">{approvedCount}</p>
          <p className="text-[11px] text-emerald-700">₹{totalSettledRevenue.toLocaleString()} settled</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Document Alerts</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">{actionRequiredCount}</p>
          <p className="text-[11px] text-rose-700">Requires TPA re-upload</p>
        </div>
      </div>

      {/* Missing Documents Smart Alert Banner */}
      {actionRequiredCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                Action Required: {actionRequiredCount} Claims with Missing Compliance Documents
              </h4>
              <p className="text-[11px] text-amber-800">
                Underwriters require doctor registration seal on discharge summaries or itemized pharmacy batch receipts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('ACTION_REQUIRED')}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-xs shrink-0"
          >
            Review Missing Items
          </button>
        </div>
      )}

      {/* Hospital Claims Registry */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Hospital Claims & Cashless Worklist</h2>
            <p className="text-xs text-slate-500">Live OCR extraction & pre-authorization adjudication stream</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, doctor, claim #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 sm:w-60 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="ALL">All Claims ({hospitalClaims.length})</option>
              <option value="PENDING">Pending TPA ({pendingCount})</option>
              <option value="APPROVED">Approved ({approvedCount})</option>
              <option value="ACTION_REQUIRED">Action Required ({actionRequiredCount})</option>
              <option value="FLAGGED">Flagged / Audit</option>
            </select>
          </div>
        </div>

        {/* Claims Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Claim ID & Patient</th>
                <th className="py-3 px-4">Diagnosis & Treating Doctor</th>
                <th className="py-3 px-4">Type & Dates</th>
                <th className="py-3 px-4 text-right">Billed Amount</th>
                <th className="py-3 px-4">AI Risk & Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredClaims.map((claim) => (
                <tr
                  key={claim.id}
                  id={`hospital-row-${claim.id}`}
                  onClick={() => setSelectedClaimForDetail(claim)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 font-mono block">
                      {claim.claimNumber}
                    </span>
                    <span className="text-slate-600 font-semibold">
                      {claim.patientName} ({claim.patientAge}y, {claim.patientGender})
                    </span>
                    {claim.digilockerVerified && (
                      <span className="text-[10px] text-teal-700 font-bold block">
                        ✓ ABHA Verified
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-slate-800 truncate">{claim.diagnosis}</p>
                    <p className="text-[11px] text-slate-500">{claim.treatingDoctor}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ICD: {claim.icdCode}</p>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700 mb-1">
                      {claim.admissionType}
                    </span>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {claim.admissionDate} → {claim.dischargeDate}
                    </p>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="font-bold font-mono text-slate-900 block">
                      ₹{claim.claimedAmount.toLocaleString()}
                    </span>
                    {claim.approvedAmount > 0 ? (
                      <span className="text-[11px] font-mono text-emerald-600 font-bold">
                        Apprv: ₹{claim.approvedAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Elig: ₹{claim.eligibleAmount.toLocaleString()}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 space-y-1">
                    <StatusBadge status={claim.status} size="sm" />
                    <div>
                      <RiskBadge tier={claim.aiAnalysis.riskTier} score={claim.aiAnalysis.overallRiskScore} />
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClaimForDetail(claim);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
