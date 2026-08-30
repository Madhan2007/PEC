import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FilePlus,
  Files,
  ShieldCheck,
  Building2,
  PieChart,
  UserCheck,
  Sparkles,
  Database,
  Layers,
  HelpCircle,
  Activity,
  Cpu,
  Lock,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const {
    currentRole,
    setIsNewClaimModalOpen,
    setIsDigiLockerModalOpen,
    setIsBlockchainModalOpen,
    claims,
    logout,
  } = useApp();

  // Role-specific navigation items
  const getNavItems = () => {
    switch (currentRole) {
      case 'patient':
        return [
          { id: 'dashboard', label: 'My Health Dashboard', icon: LayoutDashboard },
          { id: 'claims', label: 'My Claims & Status', icon: Files, badge: claims.filter(c => c.patientId === 'usr_pat_101').length },
          { id: 'policy', label: 'Policy & Coverage', icon: ShieldCheck },
          { id: 'hospitals', label: 'Network Hospitals', icon: Building2 },
        ];
      case 'hospital':
        return [
          { id: 'dashboard', label: 'Hospital TPA Overview', icon: LayoutDashboard },
          { id: 'claims', label: 'Inpatient Claims Queue', icon: Files, badge: claims.length },
          { id: 'preauth', label: 'Cashless Pre-Auth', icon: Activity },
          { id: 'missing_docs', label: 'Document Alerts', icon: HelpCircle, badge: claims.filter(c => c.status === 'action_required').length },
        ];
      case 'insurance':
        return [
          { id: 'dashboard', label: 'Adjudication Center', icon: LayoutDashboard },
          { id: 'claims', label: 'Claims Worklist', icon: Files, badge: claims.filter(c => c.status !== 'approved' && c.status !== 'rejected' && c.status !== 'paid_out').length },
          { id: 'flagged', label: 'High Risk / SIU Queue', icon: Lock, badge: claims.filter(c => c.status === 'flagged').length },
          { id: 'rag_rules', label: 'RAG Policy Clauses', icon: Sparkles },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Executive Analytics', icon: LayoutDashboard },
          { id: 'claims', label: 'Master Claims Registry', icon: Files, badge: claims.length },
          { id: 'ai_health', label: 'AI Telemetry & Models', icon: Cpu },
          { id: 'fraud_radar', label: 'Fraud & Risk Radar', icon: PieChart },
          { id: 'users', label: 'Role & Hospital Access', icon: UserCheck },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Quick Submit CTA (For Patient & Hospital) */}
          {(currentRole === 'patient' || currentRole === 'hospital') && (
            <button
              id="btn-sidebar-new-claim"
              onClick={() => {
                setIsNewClaimModalOpen(true);
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 shadow-md shadow-teal-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <FilePlus size={18} />
              <span>{currentRole === 'patient' ? 'Submit New Claim' : 'New Cashless Claim'}</span>
            </button>
          )}

          {/* Main Nav Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Main Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={isActive ? 'text-teal-600' : 'text-slate-400'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-teal-200 text-teal-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Future Innovations Showcase Links */}
          <div className="pt-3 border-t border-slate-100 space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <span>Next-Gen Modules</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">PRO</span>
            </p>

            <button
              onClick={() => {
                setIsDigiLockerModalOpen(true);
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Database size={16} className="text-sky-500 group-hover:scale-110 transition-transform" />
                <span>DigiLocker ABDM Sync</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            <button
              onClick={() => {
                setIsBlockchainModalOpen(true);
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Layers size={16} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                <span>Blockchain Audit Trail</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">#4.8M</span>
            </button>
          </div>
        </div>

        {/* Bottom AI Status Card & Logout */}
        <div className="space-y-2">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </span>
                <span className="text-xs font-bold tracking-tight">AI Neural Engine</span>
              </div>
              <span className="text-[10px] font-mono text-teal-300 font-semibold">v4.2 Active</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span>OCR Accuracy</span>
                <span className="font-semibold text-emerald-400">99.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Processing</span>
                <span className="font-semibold text-sky-400">3.8 mins</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out to Login Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};
