import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, RiskBadge } from '../common/StatusBadge';
import {
  ShieldAlert,
  Cpu,
  PieChart,
  TrendingUp,
  Database,
  Layers,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  UserCheck,
  Building2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface AdminDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab = 'dashboard', setActiveTab }) => {
  const {
    claims,
    currentUser,
    setSelectedClaimForDetail,
    setIsBlockchainModalOpen,
    setIsDigiLockerModalOpen,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState('ALL');

  const totalClaimsCount = claims.length;
  const totalClaimedValue = claims.reduce((sum, c) => sum + c.claimedAmount, 0);
  const totalSettledValue = claims
    .filter((c) => c.status === 'approved' || c.status === 'paid_out')
    .reduce((sum, c) => sum + (c.approvedAmount || c.eligibleAmount), 0);
  const flaggedCount = claims.filter((c) => c.status === 'flagged' || c.aiAnalysis.riskTier === 'HIGH').length;

  const filteredClaims = claims.filter((c) => {
    const matchSearch =
      c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchHospital =
      selectedHospitalFilter === 'ALL' || c.hospitalName.includes(selectedHospitalFilter);

    return matchSearch && matchHospital;
  });

  const handleExportCSV = () => {
    showToast('success', 'Exporting Master Claims Registry', 'Generated encrypted CSV audit dump (ISO/IEC 27001 compliant)');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Enterprise AI Claims & System Operations
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              System Admin Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operations Lead: <span className="font-bold text-slate-700">{currentUser?.name || 'Vikramaditya Sengupta'}</span> • National Health Claims Clearinghouse
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Subviews for ai_health, fraud_radar, and users */}
      {activeTab === 'ai_health' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                  <Cpu size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Neural OCR & Vision Model Health</h2>
                  <p className="text-xs text-slate-500">Multimodal pipeline latency, drift metrics, and confidence distributions</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">All Systems Nominal</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block">OCR Inference Latency</span>
                <span className="text-2xl font-black font-mono text-slate-900">1.24s</span>
                <p className="text-[11px] text-teal-700">p99 latency under 2.8s</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block">Medical Entity Extraction (NER)</span>
                <span className="text-2xl font-black font-mono text-emerald-700">99.4% F1</span>
                <p className="text-[11px] text-slate-500">ICD-10 & CPT code mapping</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold block">Model Concept Drift</span>
                <span className="text-2xl font-black font-mono text-indigo-700">&lt; 0.04 PSI</span>
                <p className="text-[11px] text-slate-500">Zero retraining requirement</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fraud_radar' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Fraud & Billing Anomaly Radar</h2>
                  <p className="text-xs text-slate-500">Provider collusion cluster mapping and geographic billing outlier detector</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                1 Outlier Flagged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-950">City Care Clinic (Cluster B-12)</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-200 text-rose-900 rounded-md">Critical Flag</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Detected repeated duplicate invoice templates with exact font artifact alignment and pre-dated admission timestamps across multiple patient policies.
                </p>
                <div className="pt-2 border-t border-rose-200 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-rose-800">Risk Score: 88/100</span>
                  <span className="font-semibold text-rose-900">Forwarded to Legal SIU</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Apollo Super Specialty (NABH)</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">Green Trust Tier</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Historical anomaly rate is 0.02%. Auto-settlement threshold elevated to ₹10,00,000 with real-time biometric patient verification.
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-700">Trust Score: 99.8/100</span>
                  <span className="font-semibold text-teal-700">Pre-Auth Priority Route</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                  <UserCheck size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Role-Based User & Hospital Access Directory</h2>
                  <p className="text-xs text-slate-500">Manage OAuth2 permissions, ABDM Bridge credentials and TPA desk tokens</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                4 Active Roles
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                { name: 'Rajesh Kumar', role: 'Patient / Policyholder', email: 'rajesh.k@gmail.com', policy: 'CS-GOLD-89204', abha: '91-4820-9921-1029', status: 'Active' },
                { name: 'Dr. Ramesh Gupta', role: 'Hospital TPA Desk', email: 'tpa.desk@apollohospitals.com', policy: 'Apollo Super Specialty', abha: 'HOSP-BLR-0042', status: 'Active' },
                { name: 'Dr. Sarah Jenkins', role: 'Insurance Adjudicator', email: 's.jenkins@careshield.com', policy: 'CareShield Underwriting', abha: 'IRDAI-ADJ-992', status: 'Active' },
                { name: 'Vikramaditya Sengupta', role: 'System Super Admin', email: 'admin@claimease.ai', policy: 'Platform Operations', abha: 'SEC-ADMIN-01', status: 'Active' },
              ].map((u, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{u.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{u.email} • ID: {u.abha}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Macro System Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Intake Value</span>
            <TrendingUp size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            ₹{(totalClaimedValue / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-400">{totalClaimsCount} total claim records</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Settled Payouts</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">
            ₹{(totalSettledValue / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-emerald-700">Sub-minute NEFT settlement</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>AI Auto-Settlement</span>
            <Sparkles size={16} className="text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-600 font-mono">68.4%</p>
          <p className="text-[11px] text-teal-700">Zero-touch straight-through</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Fraud Prevention Rate</span>
            <ShieldAlert size={16} className="text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">98.2%</p>
          <p className="text-[11px] text-rose-700">₹1.42 Cr loss prevented</p>
        </div>
      </div>

      {/* AI Telemetry & Model Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Model Accuracy Card */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Cpu size={20} className="text-teal-400" />
              <h3 className="text-sm font-extrabold">Neural Engine Telemetry</h3>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              v4.2 PROD
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>OCR Entity Recognition (F1-Score)</span>
                <span className="text-emerald-400 font-bold font-mono">99.2%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[99.2%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>RAG Policy Clause Compliance F1</span>
                <span className="text-teal-400 font-bold font-mono">98.4%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-[98.4%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Median Document Latency</span>
                <span className="text-sky-400 font-bold font-mono">1.8s / doc</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-[85%]"></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Uptime: 99.98%</span>
            <span className="text-teal-400 font-semibold">Zero Unhandled Exceptions</span>
          </div>
        </div>

        {/* Diagnostic Distribution Visual */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Claims by Specialty & ICD-10
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Surgical / Laparoscopy (K35, K80)</span>
              <span className="font-bold text-teal-700 font-mono">42%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Cardiology & Stents (I25.10)</span>
              <span className="font-bold text-indigo-700 font-mono">26%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Ophthalmology Day Care (H25.12)</span>
              <span className="font-bold text-sky-700 font-mono">18%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Orthopedics & ACL (S83.51)</span>
              <span className="font-bold text-amber-700 font-mono">14%</span>
            </div>
          </div>
        </div>

        {/* Fraud Radar Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Suspicious Provider Radar
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
              Active Watch
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200 text-xs text-red-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-red-950">
              <ShieldAlert size={16} className="text-red-600" />
              <span>CareMax Clinic (Non-Network)</span>
            </div>
            <p className="text-[11px] text-red-800 leading-relaxed">
              Flagged for predated pharmacy billing (+62% above city benchmark) and low OCR confidence.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Apollo & Max Healthcare</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              100% GIPSA tariff compliance and ABHA digital cryptographic signing.
            </p>
          </div>
        </div>
      </div>

      {/* Master Claims Registry Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Master Claims Registry</h2>
            <p className="text-xs text-slate-500">System-wide immutable ledger logs & AI decisions</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search master claims database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-56 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Claim ID & Patient</th>
                <th className="py-3 px-4">Hospital & Doctor</th>
                <th className="py-3 px-4">Diagnosis & ICD</th>
                <th className="py-3 px-4 text-right">Claimed vs Approved</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredClaims.map((claim) => (
                <tr
                  key={claim.id}
                  id={`admin-row-${claim.id}`}
                  onClick={() => setSelectedClaimForDetail(claim)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <span className="font-extrabold font-mono text-slate-900 block">{claim.claimNumber}</span>
                    <span className="text-slate-700 font-semibold">{claim.patientName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">TX: {claim.blockchainTxHash.substring(0, 10)}...</span>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-slate-800 truncate">{claim.hospitalName}</p>
                    <p className="text-[11px] text-slate-500">{claim.treatingDoctor}</p>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-slate-800 truncate">{claim.diagnosis}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ICD: {claim.icdCode}</p>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="font-bold font-mono text-slate-900 block">₹{claim.claimedAmount.toLocaleString()}</span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">
                      ₹{(claim.approvedAmount || claim.eligibleAmount).toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <RiskBadge tier={claim.aiAnalysis.riskTier} score={claim.aiAnalysis.overallRiskScore} />
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={claim.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClaimForDetail(claim);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors"
                    >
                      Audit
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
