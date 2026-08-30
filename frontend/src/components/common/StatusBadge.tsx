import React from 'react';
import { ClaimStatus } from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileSearch,
  Sparkles,
  DollarSign,
  ShieldAlert,
  Send,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ClaimStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  switch (status) {
    case 'submitted':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}
        >
          {showIcon && <Send size={iconSizes[size]} className="text-slate-500" />}
          Submitted
        </span>
      );
    case 'ocr_extracted':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses[size]}`}
        >
          {showIcon && <FileSearch size={iconSizes[size]} className="text-indigo-500" />}
          OCR Extracted
        </span>
      );
    case 'ai_verified':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses[size]}`}
        >
          {showIcon && <Sparkles size={iconSizes[size]} className="text-teal-600" />}
          AI Pre-Verified
        </span>
      );
    case 'under_review':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses[size]}`}
        >
          {showIcon && <Clock size={iconSizes[size]} className="text-blue-500" />}
          Under Review
        </span>
      );
    case 'action_required':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-750 border border-amber-300 text-amber-800 ${sizeClasses[size]}`}
        >
          {showIcon && <AlertTriangle size={iconSizes[size]} className="text-amber-600 animate-pulse" />}
          Action Required
        </span>
      );
    case 'approved':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}
        >
          {showIcon && <CheckCircle2 size={iconSizes[size]} className="text-emerald-600" />}
          Approved
        </span>
      );
    case 'paid_out':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-300 ${sizeClasses[size]}`}
        >
          {showIcon && <DollarSign size={iconSizes[size]} className="text-cyan-600" />}
          Settled / Paid
        </span>
      );
    case 'rejected':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}
        >
          {showIcon && <XCircle size={iconSizes[size]} className="text-rose-500" />}
          Rejected
        </span>
      );
    case 'flagged':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-800 border border-red-300 ${sizeClasses[size]}`}
        >
          {showIcon && <ShieldAlert size={iconSizes[size]} className="text-red-600" />}
          Flagged for SIU Audit
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 ${sizeClasses[size]}`}>
          {status}
        </span>
      );
  }
};

export const RiskBadge: React.FC<{ tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; score: number }> = ({
  tier,
  score,
}) => {
  if (tier === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Low Risk ({score}/100)
      </span>
    );
  }
  if (tier === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Moderate Risk ({score}/100)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
      High Risk Flag ({score}/100)
    </span>
  );
};
