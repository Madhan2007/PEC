import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  Sparkles,
  Bell,
  Globe,
  Database,
  Layers,
  ChevronDown,
  LogOut,
  User,
  Building2,
  FileCheck2,
  ShieldAlert,
  Check,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    currentUser,
    currentRole,
    switchRole,
    logout,
    notifications,
    unreadNotifsCount,
    markNotificationsAsRead,
    language,
    setLanguage,
    t,
    setIsDigiLockerModalOpen,
    setIsBlockchainModalOpen,
    resetAllData,
    setSelectedClaimForDetail,
    claims,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const rolesList: { id: UserRole; label: string; sub: string; icon: any; color: string }[] = [
    {
      id: 'patient',
      label: 'Patient Portal',
      sub: 'Track & Submit Claims',
      icon: User,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      id: 'hospital',
      label: 'Hospital TPA Desk',
      sub: 'Cashless & IPD Admissions',
      icon: Building2,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'insurance',
      label: 'Insurance Adjudicator',
      sub: 'AI RAG & Underwriting',
      icon: FileCheck2,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      id: 'admin',
      label: 'Admin Operations',
      sub: 'System & Fraud Analytics',
      icon: ShieldAlert,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  const languages = [
    { code: 'en', label: 'English (US)', flag: '🇺🇸' },
    { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'es', label: 'Español (ES)', flag: '🇪🇸' },
    { code: 'fr', label: 'Français (FR)', flag: '🇫🇷' },
  ];

  const activeRoleObj = rolesList.find((r) => r.id === currentRole) || rolesList[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-sidebar"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => switchRole(currentRole)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-sky-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <ShieldCheck size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 bg-clip-text text-transparent">
                    ClaimEase
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-100/80 text-teal-800 text-[10px] font-bold tracking-wide uppercase border border-teal-200/60">
                    <Sparkles size={10} className="text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
                    AI Core
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Next-Gen Health Insurance Engine
                </p>
              </div>
            </div>
          </div>

          {/* Center: Quick Role Switcher Pill */}
          <div className="relative">
            <button
              id="role-switcher-btn"
              onClick={() => {
                setIsRoleMenuOpen(!isRoleMenuOpen);
                setIsLangMenuOpen(false);
                setIsNotifMenuOpen(false);
                setIsUserMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-sm ${activeRoleObj.color}`}
            >
              <activeRoleObj.icon size={15} />
              <span className="font-bold">{activeRoleObj.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/80 font-medium text-slate-600 hidden md:inline">
                Live Switcher
              </span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Role Dropdown */}
            {isRoleMenuOpen && (
              <div
                id="role-dropdown-menu"
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Portal View</span>
                  <span className="text-[10px] text-slate-400">4 Integrated Roles</span>
                </div>
                <div className="space-y-1 mt-1">
                  {rolesList.map((role) => {
                    const isSelected = currentRole === role.id;
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        id={`switch-to-${role.id}`}
                        onClick={() => {
                          switchRole(role.id);
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                          isSelected ? 'bg-slate-100 font-semibold text-slate-900 border border-slate-200' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${role.color}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{role.label}</p>
                            <p className="text-[11px] text-slate-500">{role.sub}</p>
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="text-teal-600 font-bold" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* DigiLocker Sync Button (Future Scope) */}
            {/* Backend Live Database Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200" title="Connected to Django Backend REST API & Database">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Django DB Live</span>
            </div>

            {/* DigiLocker Sync Button */}
            <button
              id="btn-header-digilocker"
              onClick={() => setIsDigiLockerModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors"
              title="DigiLocker & ABDM Health Records Sync"
            >
              <Database size={13} className="text-sky-600" />
              <span>DigiLocker</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>

            {/* Blockchain Audit Explorer Button */}
            <button
              id="btn-header-blockchain"
              onClick={() => setIsBlockchainModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
              title="Immutable Blockchain Audit Trail"
            >
              <Layers size={13} className="text-indigo-600" />
              <span>Ledger</span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                id="btn-lang-switcher"
                onClick={() => {
                  setIsLangMenuOpen(!isLangMenuOpen);
                  setIsRoleMenuOpen(false);
                  setIsNotifMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Switch Language"
              >
                <Globe size={18} />
              </button>

              {isLangMenuOpen && (
                <div
                  id="lang-dropdown-menu"
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50"
                >
                  <p className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase">Language</p>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        language === l.code ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {language === l.code && <Check size={14} className="text-teal-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Flyout */}
            <div className="relative">
              <button
                id="btn-notif-bell"
                onClick={() => {
                  setIsNotifMenuOpen(!isNotifMenuOpen);
                  setIsRoleMenuOpen(false);
                  setIsLangMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {isNotifMenuOpen && (
                <div
                  id="notif-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Notifications</span>
                      {unreadNotifsCount > 0 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markNotificationsAsRead}
                        className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 my-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">No notifications</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.claimId) {
                              const found = claims.find((c) => c.id === n.claimId);
                              if (found) setSelectedClaimForDetail(found);
                            }
                            setIsNotifMenuOpen(false);
                          }}
                          className={`p-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.read ? 'bg-slate-50/80 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900">{n.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Account Dropdown */}
            <div className="relative">
              <button
                id="btn-user-avatar"
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsRoleMenuOpen(false);
                  setIsLangMenuOpen(false);
                  setIsNotifMenuOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-200 transition-all"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-xs"
                />
              </button>

              {isUserMenuOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50"
                >
                  <div className="p-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize border border-slate-200">
                        {currentRole}
                      </span>
                      {currentUser?.policyNumber && (
                        <span className="text-[10px] text-slate-500 truncate font-mono">
                          {currentUser.policyNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      resetAllData();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <RotateCcw size={14} className="text-slate-400" />
                    <span>Reset Demo Data</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
