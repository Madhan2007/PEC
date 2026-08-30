import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Database,
  CheckCircle2,
  FileText,
  ShieldCheck,
  DownloadCloud,
  ExternalLink,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const DigiLockerModal: React.FC = () => {
  const { isDigiLockerModalOpen, setIsDigiLockerModalOpen, showToast, currentUser } = useApp();
  const [syncing, setSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(3);

  if (!isDigiLockerModalOpen) return null;

  const handleSyncABDM = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncedCount(4);
      showToast('success', 'ABDM Health Records Synced', 'Retrieved latest hospital discharge summary and lab reports via ABDM gateway.');
    }, 1200);
  };

  const records = [
    {
      id: 'REC-ABDM-01',
      title: 'Discharge Summary - Appendectomy',
      facility: 'Apollo Super Specialty Hospital',
      date: '14 Jan 2025',
      type: 'Hospital Discharge Summary',
      verified: true,
      hash: 'sha256:4a8b...99c1',
    },
    {
      id: 'REC-ABDM-02',
      title: 'CBC & Serum Electrolytes Diagnostic Report',
      facility: 'Dr. Lal PathLabs',
      date: '14 Jan 2025',
      type: 'Diagnostic Report',
      verified: true,
      hash: 'sha256:e310...bfa2',
    },
    {
      id: 'REC-ABDM-03',
      title: 'Aadhaar e-KYC Identity Certificate',
      facility: 'UIDAI (Government of India)',
      date: 'Verified',
      type: 'Demographic Credential',
      verified: true,
      hash: 'sha256:c981...112e',
    },
  ];

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>DigiLocker & ABDM Integration</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Live Gateway
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                ABHA ID: <strong className="font-mono text-slate-700">{currentUser?.abhaId || '91-4820-9921-1029'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDigiLockerModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Box */}
        <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-teal-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">National Digital Health Mission (NDHM) Consent Artifact</p>
            <p className="text-[11px] text-teal-700 mt-0.5">
              Securely pulls tamper-proof, digitally signed health records directly from hospital HIP nodes.
            </p>
          </div>
        </div>

        {/* Synced Records List */}
        <div className="space-y-2.5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Available Verified EHR Records ({records.length})
          </p>

          {records.map((rec) => (
            <div
              key={rec.id}
              className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{rec.title}</p>
                  <p className="text-[11px] text-slate-500">{rec.facility} • {rec.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Verified
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-mono">Gateway: ABDM-PROD-IND</span>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDigiLockerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              onClick={handleSyncABDM}
              disabled={syncing}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <DownloadCloud size={14} className={syncing ? 'animate-bounce' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Health Locker'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
