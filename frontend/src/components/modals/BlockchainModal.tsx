import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Cpu,
  Hash,
} from 'lucide-react';

export const BlockchainModal: React.FC = () => {
  const { isBlockchainModalOpen, setIsBlockchainModalOpen, selectedClaimForDetail, claims } = useApp();

  if (!isBlockchainModalOpen) return null;

  const currentClaim = selectedClaimForDetail || claims[0];

  const blocks = [
    {
      step: 'Claim Intake Block #8,941,202',
      txHash: currentClaim?.blockchainTxHash || '0x71c9a482b13f892a0149e8bc19d38104882194ad',
      timestamp: '2025-01-14 10:30:12 IST',
      validator: 'Node-1 (IRDAI National Clearing Gateway)',
      status: 'Mined & Finalized (128 Confirmations)',
    },
    {
      step: 'AI OCR & Policy RAG Proof Block #8,941,208',
      txHash: '0x39a1d94f2910cba77218491823719284102941aa',
      timestamp: '2025-01-14 10:30:45 IST',
      validator: 'Node-3 (CareShield Adjudication Oracle)',
      status: 'Mined & Finalized (122 Confirmations)',
    },
    {
      step: 'Smart Contract Payout Execution Block #8,941,250',
      txHash: '0xbf92a104829102cba81029410283019284019281',
      timestamp: '2025-01-14 10:34:00 IST',
      validator: 'Node-2 (RBI NPCI Settlement Bridge)',
      status: 'Final State Settled',
    },
  ];

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span>Immutable Blockchain Audit Ledger</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  PoA Consensus
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Claim: <strong className="font-mono text-slate-700">{currentClaim?.claimNumber}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBlockchainModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contract Info Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Lock size={13} className="text-indigo-600" />
              Smart Contract Audit Address
            </span>
            <span className="text-[10px] font-mono bg-indigo-200/70 text-indigo-900 px-2 py-0.5 rounded">
              ERC-7579 Claims Standard
            </span>
          </div>
          <p className="font-mono text-[11px] text-indigo-800 break-all">
            0x4b78912A3490FdcE1892Bcf19283719A014829cD
          </p>
        </div>

        {/* Ledger Blocks */}
        <div className="space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Cryptographic Block Sequence
          </p>

          <div className="space-y-2.5">
            {blocks.map((blk, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    {blk.step}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{blk.timestamp}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono">
                  <Hash size={11} className="text-slate-400" />
                  <span className="truncate">{blk.txHash}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>{blk.validator}</span>
                  <span className="text-emerald-700 font-semibold">{blk.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">Zero-Knowledge State Proof Verified</span>
          <button
            onClick={() => setIsBlockchainModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
