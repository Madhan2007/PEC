import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { AuthPage } from './components/auth/AuthPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { InsuranceDashboard } from './components/insurance/InsuranceDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SubmitClaimWizard } from './components/claims/SubmitClaimWizard';
import { ClaimDetailModal } from './components/claims/ClaimDetailModal';
import { DigiLockerModal } from './components/modals/DigiLockerModal';
import { BlockchainModal } from './components/modals/BlockchainModal';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    currentUser,
    currentRole,
    isNewClaimModalOpen,
    setIsNewClaimModalOpen,
    selectedClaimForDetail,
    setSelectedClaimForDetail,
    toasts,
    removeToast,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Reset tab to dashboard on role change
  useEffect(() => {
    setActiveTab('dashboard');
    setIsSidebarOpen(false);
  }, [currentRole]);

  // If user is not logged in, show AuthPage
  if (!currentUser) {
    return <AuthPage />;
  }

  // Render role-specific dashboard based on current active role
  const renderRoleDashboard = () => {
    switch (currentRole) {
      case 'patient':
        return <PatientDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'hospital':
        return <HospitalDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'insurance':
        return <InsuranceDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'admin':
        return <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      default:
        return <PatientDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800 selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderRoleDashboard()}
        </main>
      </div>

      {/* Global Modals */}
      {isNewClaimModalOpen && (
        <SubmitClaimWizard onClose={() => setIsNewClaimModalOpen(false)} />
      )}

      {selectedClaimForDetail && (
        <ClaimDetailModal
          claim={selectedClaimForDetail}
          onClose={() => setSelectedClaimForDetail(null)}
        />
      )}

      <DigiLockerModal />
      <BlockchainModal />

      {/* Global Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-70 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-white border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-white border-rose-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertTriangle size={18} className="text-rose-400 mt-0.5 shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info size={18} className="text-sky-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
