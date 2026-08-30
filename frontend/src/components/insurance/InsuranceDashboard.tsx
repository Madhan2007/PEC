import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, RiskBadge } from '../common/StatusBadge';
import {
  FileCheck2,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Zap,
  TrendingDown,
  Layers,
  ArrowRight,
  HelpCircle,
  DollarSign,
  Activity,
} from 'lucide-react';

interface InsuranceDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const InsuranceDashboard: React.FC<InsuranceDashboardProps> = ({ activeTab = 'dashboard', setActiveTab }) => {
  const {
    claims,
    currentUser,
    setSelectedClaimForDetail,
    adjudicateClaim,
    setIsBlockchainModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      riskFilter === 'ALL' || claim.aiAnalysis.riskTier === riskFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && (claim.status === 'submitted' || claim.status === 'ocr_extracted' || claim.status === 'ai_verified' || claim.status === 'under_review')) ||
      (statusFilter === 'FLAGGED' && claim.status === 'flagged') ||
      (statusFilter === 'ACTION_REQUIRED' && claim.status === 'action_required') ||
      (statusFilter === 'APPROVED' && (claim.status === 'approved' || claim.status === 'paid_out'));

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const totalInQueue = claims.filter(
    (c) => c.status !== 'approved' && c.status !== 'paid_out' && c.status !== 'rejected'
  ).length;
  const flaggedCount = claims.filter((c) => c.status === 'flagged' || c.aiAnalysis.riskTier === 'HIGH').length;
  const autoApprovableCount = claims.filter(
    (c) => c.aiAnalysis.overallRiskScore < 10 && c.status !== 'approved' && c.status !== 'paid_out'
  ).length;
  const totalSettledCount = claims.filter((c) => c.status === 'approved' || c.status === 'paid_out').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Insurance Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Insurance Adjudication & Underwriting Center
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              CareShield TPA Core
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Adjudicator: <span className="font-bold text-slate-700">{currentUser?.name || 'Sarah Jenkins, MD'}</span> • Real-Time RAG Policy Compliance Engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
            <Sparkles size={14} className="text-teal-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span>AI Auto-Settlement Active</span>
          </div>
        </div>
      </div>

      {/* Subviews for flagged and rag_rules */}
      {activeTab === 'flagged' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Special Investigation Unit (SIU) Fraud Queue</h2>
                  <p className="text-xs text-slate-500">Automated multi-modal forensic risk analysis and duplicate bill hasher</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
                {claims.filter((c) => c.status === 'flagged' || c.aiAnalysis.riskTier === 'HIGH').length} High-Risk Flags
              </span>
            </div>

            <div className="space-y-3">
              {claims
                .filter((c) => c.status === 'flagged' || c.aiAnalysis.riskTier === 'HIGH')
                .map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaimForDetail(claim)}
                    className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-900 text-sm">{claim.claimNumber}</span>
                        <RiskBadge tier={claim.aiAnalysis.riskTier} score={claim.aiAnalysis.overallRiskScore} size="sm" />
                        <span className="text-slate-600 font-medium">{claim.patientName}</span>
                      </div>
                      <span className="font-bold font-mono text-rose-900 text-sm">₹{claim.claimedAmount.toLocaleString()} Claimed</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-rose-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Forensic Anomaly Trigger:</span>
                      <p className="text-slate-700 font-medium">{claim.aiAnalysis.reasoning}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {claim.aiAnalysis.flags.map((flag, idx) => (
                          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                            ⚠ {flag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">{claim.hospitalName} • Dr. {claim.treatingDoctor}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClaimForDetail(claim);
                        }}
                        className="text-rose-700 font-bold hover:text-rose-900 flex items-center gap-1"
                      >
                        <span>Open Forensic Audit View</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rag_rules' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                  <Layers size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">RAG Policy Clause Knowledge Base</h2>
                  <p className="text-xs text-slate-500">Vectorized IRDAI standard terms & multi-policy clause matching engine</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                14 Policies Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                {
                  section: 'Section 4.2: Room Rent Capping',
                  desc: 'Standard floater cap set at 1% of Sum Insured per day for Normal Room, 2% for ICU. Proportionate deductions automatically applied to surgeon & anesthesia fees on exceed.',
                  policy: 'CareShield Gold / Platinum',
                  status: 'Active Rule',
                },
                {
                  section: 'Section 3.1: 24-Month Waiting Period on Specific Ailments',
                  desc: 'Covers Hernia, Hydrocele, Piles, Sinusitis, Knee Replacements after 24 continuous months of coverage without lapse. Cross-referenced against policy inception timestamp.',
                  policy: 'Universal Health Guard',
                  status: 'Active Rule',
                },
                {
                  section: 'Section 8.4: Non-Medical Expense Exclusions (List I)',
                  desc: 'Gloves, PPE kits, thermometers, administrative discharge registration charges are strictly non-payable under IRDAI non-medical schedules unless Bronze Rider attached.',
                  policy: 'All In-Force Policies',
                  status: 'Active Rule',
                },
                {
                  section: 'Section 6.3: Day-Care Treatment Criteria',
                  desc: 'Covers surgical procedures undertaken under general/local anesthesia requiring less than 24 hours of hospitalization due to advanced technological equipment.',
                  policy: 'CareShield Complete',
                  status: 'Active Rule',
                },
              ].map((rule, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs">{rule.section}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                      {rule.status}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rule.desc}</p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Applicable: {rule.policy}</span>
                    <span className="text-indigo-600 font-semibold">Semantic Match Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Telemetry & KPI Deck */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Pending Worklist</span>
            <FileCheck2 size={16} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{totalInQueue}</p>
          <p className="text-[11px] text-slate-400">Active claims in triage</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Auto-Approve Ready</span>
            <Sparkles size={16} className="text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-600 font-mono">{autoApprovableCount}</p>
          <p className="text-[11px] text-teal-700">Risk Score &lt; 10 / 100</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>High Risk / SIU Flagged</span>
            <ShieldAlert size={16} className="text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">{flaggedCount}</p>
          <p className="text-[11px] text-rose-700">Anomalies & Predated bills</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Turnaround Time</span>
            <Zap size={16} className="text-sky-600" />
          </div>
          <p className="text-2xl font-black text-sky-600 font-mono">3.8 mins</p>
          <p className="text-[11px] text-sky-700">vs 7.2 days industry avg</p>
        </div>
      </div>

      {/* Flagged Claims High-Alert Notice (if any) */}
      {flaggedCount > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <ShieldAlert size={22} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-red-950 uppercase tracking-wide">
                Special Investigation Unit (SIU) Queue: {flaggedCount} High-Risk Claims
              </h4>
              <p className="text-[11px] text-red-800">
                Neural anomaly detection caught pre-dated pharmacy invoices and unverified non-network clinic rates.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setRiskFilter('HIGH');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-bold hover:bg-red-800 shadow-xs shrink-0"
          >
            Review SIU Queue
          </button>
        </div>
      )}

      {/* Adjudication Worklist Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Claims Adjudication Worklist</h2>
            <p className="text-xs text-slate-500">
              Inspect OCR line-items, RAG policy matches, non-medical deductions & issue decisions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Risk filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setRiskFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    riskFilter === lvl
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Triage</option>
              <option value="FLAGGED">Flagged / SIU</option>
              <option value="ACTION_REQUIRED">Action Required</option>
              <option value="APPROVED">Approved / Settled</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-40 sm:w-48 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Worklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Claim ID & Patient</th>
                <th className="py-3 px-4">Diagnosis & Hospital</th>
                <th className="py-3 px-4 text-right">Claimed vs Eligible</th>
                <th className="py-3 px-4">AI Risk & Recommendation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Adjudication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredClaims.map((claim) => (
                <tr
                  key={claim.id}
                  id={`insurance-row-${claim.id}`}
                  onClick={() => setSelectedClaimForDetail(claim)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 font-mono block">
                      {claim.claimNumber}
                    </span>
                    <span className="text-slate-700 font-semibold">
                      {claim.patientName} ({claim.patientAge}y)
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Pol: {claim.policyNumber}
                    </span>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-slate-900 truncate">{claim.diagnosis}</p>
                    <p className="text-[11px] text-slate-500 truncate">{claim.hospitalName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ICD: {claim.icdCode}</p>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="font-bold font-mono text-slate-900 block">
                      ₹{claim.claimedAmount.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">
                      Payable: ₹{claim.eligibleAmount.toLocaleString()}
                    </span>
                    {claim.nonMedicalDeduction > 0 && (
                      <span className="text-[10px] font-mono text-rose-500 block">
                        -₹{claim.nonMedicalDeduction.toLocaleString()} non-med
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 space-y-1">
                    <RiskBadge tier={claim.aiAnalysis.riskTier} score={claim.aiAnalysis.overallRiskScore} />
                    <span className="text-[10px] font-bold block text-slate-600">
                      AI: {claim.aiAnalysis.aiRecommendation.replace('_', ' ')} ({claim.aiAnalysis.confidenceScore}%)
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={claim.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClaimForDetail(claim);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={12} />
                        <span>AI Verify</span>
                      </button>
                    </div>
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
