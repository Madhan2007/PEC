import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, RiskBadge } from '../common/StatusBadge';
import { ClaimItem } from '../../types';
import {
  ShieldCheck,
  FilePlus,
  Files,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Database,
  Building2,
  ExternalLink,
  ChevronRight,
  HeartPulse,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';

interface PatientDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ activeTab = 'dashboard', setActiveTab }) => {
  const {
    currentUser,
    claims,
    setSelectedClaimForDetail,
    setIsNewClaimModalOpen,
    setIsDigiLockerModalOpen,
    setIsBlockchainModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter claims for this patient
  const myClaims = claims.filter(
    (c) => c.patientId === currentUser?.id || c.patientName.toLowerCase().includes('rajesh') || true
  );

  const filteredClaims = myClaims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && (claim.status === 'approved' || claim.status === 'paid_out')) ||
      (statusFilter === 'PENDING' && (claim.status === 'submitted' || claim.status === 'ocr_extracted' || claim.status === 'ai_verified' || claim.status === 'under_review')) ||
      (statusFilter === 'ACTION_REQUIRED' && claim.status === 'action_required') ||
      (statusFilter === 'FLAGGED' && claim.status === 'flagged');

    return matchesSearch && matchesStatus;
  });

  const totalSumInsured = currentUser?.sumInsured || 1500000;
  const remainingCover = currentUser?.remainingCover || 1120000;
  const usedCoverage = totalSumInsured - remainingCover;
  const usedPercent = Math.min(100, Math.round((usedCoverage / totalSumInsured) * 100));

  const totalSettledAmount = myClaims
    .filter((c) => c.status === 'approved' || c.status === 'paid_out')
    .reduce((sum, c) => sum + (c.approvedAmount || c.eligibleAmount), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome back, {currentUser?.name || 'Rajesh'}</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Policy In-Force
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            CareShield Policy <span className="font-mono font-bold text-slate-700">{currentUser?.policyNumber || 'CS-GOLD-89204'}</span> • DigiLocker ABDM Synced
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-patient-submit-claim"
            onClick={() => setIsNewClaimModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FilePlus size={16} />
            <span>Submit New Claim</span>
          </button>
        </div>
      </div>

      {/* Tab Conditionals */}
      {activeTab === 'policy' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">{currentUser?.policyName || 'CareShield Complete Health Guard'}</h2>
                  <p className="text-xs text-slate-500 font-mono">Policy No: {currentUser?.policyNumber || 'CS-GOLD-89204'} • UIN: IRDAI/HLT/CS-2024/09</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Active In-Force</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Base Sum Insured</span>
                <span className="text-xl font-bold font-mono text-slate-900">₹{totalSumInsured.toLocaleString()}</span>
                <p className="text-[11px] text-teal-700 mt-1">100% Restore Benefit Enabled</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">No-Claim Bonus (NCB)</span>
                <span className="text-xl font-bold font-mono text-emerald-700">+₹3,00,000 (20%)</span>
                <p className="text-[11px] text-slate-500 mt-1">Accumulated for 2 claim-free years</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Co-Payment Requirement</span>
                <span className="text-xl font-bold font-mono text-indigo-700">0% (Zero Deductible)</span>
                <p className="text-[11px] text-slate-500 mt-1">Valid across all Tier-1 network hospitals</p>
              </div>
            </div>

            {/* Clauses and Waiting Periods */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Policy Waiting Periods & Riders Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Initial 30-Day Waiting Period: COMPLETED</strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">All sudden illnesses & emergency hospitalizations fully covered.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">24-Month Specific Ailments (Hernia, Cataract, Gallstones): COMPLETED</strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">Surgical treatments 100% eligible with no sub-limits.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Day-Care Procedures (540+ Types): INCLUDED</strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">Dialysis, Chemotherapy, Arthroscopy, Laparoscopic surgeries covered without 24hr stay.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Pre & Post Hospitalization: 60 Days / 90 Days</strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">Medical investigations, pharmacy, and doctor consultations reimbursable.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hospitals' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Network Hospital Locator & Cashless Desks</h2>
                <p className="text-xs text-slate-500">12,400+ cashless empanelled hospitals with instant ABDM digital admission</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                Tier-1 Preferred Network
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Apollo Super Specialty Hospital', city: 'Bangalore, KA', address: '154/11 Bannerghatta Road', cashless: 'Instant Auto-Approve', rating: 4.8, beds: 500 },
                { name: 'Fortis Memorial Research Institute', city: 'Gurgaon, HR', address: 'Sector 44, Opp City Centre', cashless: 'Instant Auto-Approve', rating: 4.9, beds: 400 },
                { name: 'Manipal Hospital', city: 'Bangalore, KA', address: 'HAL Airport Road', cashless: 'Instant Auto-Approve', rating: 4.7, beds: 600 },
                { name: 'Max Super Specialty Hospital', city: 'New Delhi, DL', address: '1, 2 Press Enclave Marg, Saket', cashless: 'Instant Auto-Approve', rating: 4.8, beds: 450 },
                { name: 'Narayana Health City', city: 'Bangalore, KA', address: '258/A, Bommasandra Ind. Area', cashless: 'Instant Auto-Approve', rating: 4.6, beds: 1000 },
                { name: 'Aster CMI Hospital', city: 'Bangalore, KA', address: 'No. 43/42, NH 44, Hebbal', cashless: 'Instant Auto-Approve', rating: 4.7, beds: 500 },
              ].map((h, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{h.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md shrink-0">
                        {h.cashless}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{h.address}, {h.city}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-mono">{h.beds} Beds • ★ {h.rating}</span>
                    <button
                      onClick={() => setIsNewClaimModalOpen(true)}
                      className="text-xs font-bold text-teal-700 hover:text-teal-900"
                    >
                      Pre-Auth Request →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Policy Card & Summary Stats Grid (Show on Dashboard) */}
      {(activeTab === 'dashboard' || activeTab === 'claims') && (
        <>
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Active Policy Card */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Active Health Cover</p>
                        <h3 className="font-bold text-base text-white">{currentUser?.policyName || 'CareShield Complete Health Guard'}</h3>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-teal-300">
                      Floater Plan
                    </span>
                  </div>

                  {/* Coverage Balances */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-5">
                    <div>
                      <span className="text-xs text-slate-400 block">Total Sum Insured</span>
                      <span className="text-xl font-extrabold text-white font-mono">
                        ₹{totalSumInsured.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Available Balance</span>
                      <span className="text-xl font-extrabold text-teal-400 font-mono">
                        ₹{remainingCover.toLocaleString()}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-xs text-slate-400 block">Policy Expiry</span>
                      <span className="text-sm font-bold text-slate-200 mt-1 block">
                        31 Mar 2026
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Coverage utilized: {usedPercent}%</span>
                      <span>Remaining: ₹{remainingCover.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-teal-400 to-sky-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${usedPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Bottom Badges */}
                <div className="pt-4 mt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">ABHA Health ID:</span>
                    <span className="font-mono font-bold text-teal-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {currentUser?.abhaId || '91-4820-9921-1029'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDigiLockerModalOpen(true)}
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <span>DigiLocker Records Sync</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>

              {/* Quick Claims Metrics Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
                    My Claim Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/70 border border-teal-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-teal-950">Settled Reimbursements</p>
                          <p className="text-[11px] text-teal-700">Direct Bank Payouts</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-teal-800 font-mono text-sm">
                        ₹{totalSettledAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-950">Active in Review</p>
                          <p className="text-[11px] text-blue-700">AI Verified & Underwriting</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-blue-800 font-mono text-sm">
                        {myClaims.filter((c) => c.status !== 'approved' && c.status !== 'paid_out' && c.status !== 'rejected').length} Claims
                      </span>
                    </div>

                    {myClaims.some((c) => c.status === 'action_required') && (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200 animate-pulse">
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle size={18} className="text-amber-600" />
                          <div>
                            <p className="text-xs font-bold text-amber-900">Action Required</p>
                            <p className="text-[11px] text-amber-700">Upload missing doctor stamp</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                          1 Action
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Network Hospitals</span>
                  <span className="font-bold text-teal-700">12,400+ Cashless</span>
                </div>
              </div>
            </div>
          )}

      {/* Recent Claims Section with Filter and Search */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">My Claims & Status Timeline</h2>
            <p className="text-xs text-slate-500">Track real-time neural OCR parsing and AI adjudication milestones</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search claim, hospital, diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 sm:w-60 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved / Settled</option>
              <option value="PENDING">Pending Review</option>
              <option value="ACTION_REQUIRED">Action Required</option>
            </select>
          </div>
        </div>

        {/* Claims Table / Cards */}
        {filteredClaims.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Files size={32} className="mx-auto mb-2 opacity-50" />
            <p>No claims found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                id={`patient-claim-row-${claim.id}`}
                onClick={() => setSelectedClaimForDetail(claim)}
                className="py-4 hover:bg-slate-50/80 rounded-2xl px-3 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 mt-1">
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 font-mono">
                        {claim.claimNumber}
                      </span>
                      <StatusBadge status={claim.status} size="sm" />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {claim.admissionType}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      {claim.diagnosis}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{claim.hospitalName}</span>
                      <span>•</span>
                      <span>Adm: {claim.admissionDate}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Claimed / Approved</span>
                    <p className="text-xs font-bold text-slate-900 font-mono">
                      ₹{claim.claimedAmount.toLocaleString()}
                      {claim.approvedAmount > 0 && (
                        <span className="text-emerald-600 ml-1">
                          (₹{claim.approvedAmount.toLocaleString()})
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      OCR {claim.aiAnalysis.confidenceScore}% Acc
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClaimForDetail(claim);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};
