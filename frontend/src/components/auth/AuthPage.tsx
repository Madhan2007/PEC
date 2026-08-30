import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { DEMO_USERS } from '../../data/initialData';
import {
  ShieldCheck,
  Sparkles,
  User,
  Building2,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  KeyRound,
  X,
  HeartPulse,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Fingerprint,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, showToast } = useApp();
  
  // Auth Tab: 'signin' | 'signup' | 'abha'
  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'abha'>('signin');
  
  // Sign-in state
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [identifier, setIdentifier] = useState(DEMO_USERS.patient.email);
  const [password, setPassword] = useState('Password123#');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // ABHA Login state
  const [abhaId, setAbhaId] = useState('91-4820-9921-1029');
  const [abhaOtpSent, setAbhaOtpSent] = useState(false);
  const [abhaOtp, setAbhaOtp] = useState('');

  // Password reset modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'patient' as UserRole,
    policyOrHospital: '',
    abhaId: '',
    password: '',
    confirmPassword: '',
    termsAccepted: true,
  });

  const roles = [
    {
      id: 'patient' as UserRole,
      title: 'Patient & Family',
      desc: 'Submit claims, track cashless pre-auth & review OCR itemized bills',
      icon: User,
      badge: 'Individual / Policyholder',
      color: 'border-teal-500 bg-teal-50/70 text-teal-900',
      activeBg: 'bg-teal-600',
      demoUser: DEMO_USERS.patient,
    },
    {
      id: 'hospital' as UserRole,
      title: 'Hospital TPA Desk',
      desc: 'Process cashless requests, upload discharge notes & resolve alerts',
      icon: Building2,
      badge: 'Network Healthcare Provider',
      color: 'border-sky-500 bg-sky-50/70 text-sky-900',
      activeBg: 'bg-sky-600',
      demoUser: DEMO_USERS.hospital,
    },
    {
      id: 'insurance' as UserRole,
      title: 'Insurance Adjudicator',
      desc: 'AI RAG clause verification, fraud scoring & 1-click approvals',
      icon: FileCheck2,
      badge: 'Underwriting & TPA Claims',
      color: 'border-indigo-500 bg-indigo-50/70 text-indigo-900',
      activeBg: 'bg-indigo-600',
      demoUser: DEMO_USERS.insurance,
    },
    {
      id: 'admin' as UserRole,
      title: 'System Operations Admin',
      desc: 'Executive analytics, AI neural accuracy telemetry & fraud radar',
      icon: ShieldAlert,
      badge: 'Operations & SecOps',
      color: 'border-purple-500 bg-purple-50/70 text-purple-900',
      activeBg: 'bg-purple-600',
      demoUser: DEMO_USERS.admin,
    },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier(DEMO_USERS[role].email);
    setPassword('Password123#');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      showToast('error', 'Please enter your email or user identifier');
      return;
    }
    login(selectedRole, { email: identifier });
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    login(role);
  };

  const handleAbhaOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaId) {
      showToast('error', 'Please enter your 14-digit ABHA ID or mobile number');
      return;
    }
    setAbhaOtpSent(true);
    showToast('info', 'ABHA OTP Sent', 'Demo OTP is: 8492');
  };

  const handleAbhaLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (abhaOtp === '8492' || abhaOtp.length === 4) {
      login('patient', {
        name: 'Rajesh Kumar (ABHA Verified)',
        abhaId: abhaId,
      });
    } else {
      showToast('error', 'Invalid OTP', 'Please enter OTP 8492');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpStep) {
      if (!resetEmail) {
        showToast('error', 'Please enter your registered email/phone');
        return;
      }
      setOtpStep(true);
      showToast('info', 'Verification code sent', 'Use demo OTP: 4492 to reset');
    } else {
      if (otpValue === '4492' || otpValue.length === 4) {
        showToast('success', 'Password reset successful', 'You can now log in with your new credentials');
        setIsForgotModalOpen(false);
        setOtpStep(false);
        setOtpValue('');
      } else {
        showToast('error', 'Invalid OTP', 'Please enter 4492');
      }
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.name || !signupData.email) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    if (signupData.password && signupData.password !== signupData.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }

    login(signupData.role, {
      name: signupData.name,
      email: signupData.email,
      phone: signupData.phone || '+91 98450 00000',
      abhaId: signupData.abhaId || (signupData.role === 'patient' ? '91-5542-8820-9901' : undefined),
      policyNumber: signupData.role === 'patient' ? (signupData.policyOrHospital || 'CS-NEW-48201') : undefined,
      hospitalName: signupData.role === 'hospital' ? (signupData.policyOrHospital || 'City Super Specialty Hospital') : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Brand Bar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <ShieldCheck size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                ClaimEase <span className="text-teal-600 font-black">AI</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                v4.2 Production
              </span>
            </div>
            <span className="text-xs text-slate-500 block font-medium">Enterprise Healthcare Claims & Adjudication Cloud</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ABDM & IRDAI Secure Gateway
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Banner Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold mb-3 border border-teal-200 shadow-xs">
            <Sparkles size={14} className="text-teal-600" />
            <span>AI-Driven Sub-Second Health Insurance Adjudication</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Universal Healthcare Claims Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
            Choose your role or authenticate using email, policy number, or Ayushman Bharat Health Account (ABHA).
          </p>
        </div>

        {/* 1-Click Role Quick Login Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Select Portal / 1-Click Demo Login
            </span>
            <span className="text-xs text-slate-500">Instant access with preloaded sample data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {roles.map((r) => {
              const isSelected = selectedRole === r.id;
              const Icon = r.icon;
              return (
                <div
                  key={r.id}
                  id={`role-card-${r.id}`}
                  onClick={() => handleRoleSelect(r.id)}
                  className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between ${
                    isSelected
                      ? `${r.color} shadow-md shadow-teal-500/10 scale-[1.01]`
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-white shadow-xs text-teal-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                        {r.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mb-1">{r.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{r.desc}</p>
                  </div>

                  <button
                    type="button"
                    id={`btn-demo-login-${r.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickDemoLogin(r.id);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-2 ${
                      isSelected
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>1-Click Login</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Central Auth Container with Mode Switcher */}
        <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
          {/* Tabs: Sign In / Sign Up / ABHA Fast Sign-In */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 mb-6 border border-slate-200">
            <button
              id="tab-btn-signin"
              type="button"
              onClick={() => setAuthTab('signin')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authTab === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>

            <button
              id="tab-btn-signup"
              type="button"
              onClick={() => setAuthTab('signup')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authTab === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus size={15} />
              <span>Sign Up / Register</span>
            </button>

            <button
              id="tab-btn-abha"
              type="button"
              onClick={() => setAuthTab('abha')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authTab === 'abha'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fingerprint size={15} />
              <span>ABHA ID</span>
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {authTab === 'signin' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Sign in as {roles.find((r) => r.id === selectedRole)?.title}
                  </h2>
                  <p className="text-xs text-slate-500">Enter your credentials or use the role switcher above</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 capitalize">
                  {selectedRole}
                </span>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address / User ID
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="input-auth-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. rajesh.kumar@healthmail.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      id="btn-forgot-password"
                      onClick={() => {
                        setResetEmail(identifier);
                        setIsForgotModalOpen(true);
                      }}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="input-auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-[11px] text-slate-400">256-bit TLS Encrypted</span>
                </div>

                <button
                  id="btn-auth-submit"
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn size={16} />
                  <span>Authenticate & Enter Portal</span>
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">New to ClaimEase AI?</span>
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className="font-bold text-teal-600 hover:text-teal-700"
                >
                  Create an account →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN UP / REGISTER */}
          {authTab === 'signup' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-extrabold text-slate-900">Create New ClaimEase Account</h2>
                <p className="text-xs text-slate-500">Register as a patient, hospital provider, or insurance desk</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'patient' as UserRole, label: 'Patient' },
                      { id: 'hospital' as UserRole, label: 'Hospital Desk' },
                      { id: 'insurance' as UserRole, label: 'Insurance Desk' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSignupData({ ...signupData, role: opt.id })}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                          signupData.role === opt.id
                            ? 'border-teal-500 bg-teal-50 text-teal-900'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {signupData.role === 'hospital' ? 'Hospital / Administrator Name' : 'Full Legal Name'}
                  </label>
                  <input
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="e.g. Dr. Priya Nair or Aditya Rao"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="name@email.com"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      placeholder="+91 98450 00000"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {signupData.role === 'patient' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ABHA Health ID (Optional) / Policy Number
                    </label>
                    <input
                      type="text"
                      value={signupData.policyOrHospital}
                      onChange={(e) => setSignupData({ ...signupData, policyOrHospital: e.target.value })}
                      placeholder="e.g. CS-GOLD-89204 or 91-4820-9921-1029"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    />
                  </div>
                )}

                {signupData.role === 'hospital' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Provider Name</label>
                    <input
                      type="text"
                      value={signupData.policyOrHospital}
                      onChange={(e) => setSignupData({ ...signupData, policyOrHospital: e.target.value })}
                      placeholder="e.g. Aster CMI Super Specialty Hospital"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="Create password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600 pt-1">
                  <input
                    type="checkbox"
                    checked={signupData.termsAccepted}
                    onChange={(e) => setSignupData({ ...signupData, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500"
                    required
                  />
                  <span>
                    I agree to the IRDAI & HIPAA data processing policies and DigiLocker health records linkage.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <UserPlus size={16} />
                  <span>Create Account & Sign In</span>
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Already registered?</span>
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className="font-bold text-teal-600 hover:text-teal-700"
                >
                  Sign in to existing account →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ABHA DIGITAL HEALTH ID LOGIN */}
          {authTab === 'abha' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-teal-100 text-teal-800">
                    <Fingerprint size={18} />
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">ABHA Digital Health Login</h2>
                    <p className="text-xs text-slate-500">Ayushman Bharat Digital Mission (ABDM) authentication</p>
                  </div>
                </div>
              </div>

              {!abhaOtpSent ? (
                <form onSubmit={handleAbhaOtpRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      14-Digit ABHA Health ID or Linked Mobile
                    </label>
                    <input
                      type="text"
                      value={abhaId}
                      onChange={(e) => setAbhaId(e.target.value)}
                      placeholder="e.g. 91-4820-9921-1029"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      An instant Aadhaar-linked OTP will be transmitted to your registered mobile number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Send ABHA OTP</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAbhaLoginSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <BadgeCheck size={16} className="text-teal-700" />
                      <span>OTP Sent via ABDM Gateway</span>
                    </div>
                    <p className="text-[11px] text-teal-800">
                      Please enter simulated demo OTP: <strong>8492</strong> for ABHA ID <strong>{abhaId}</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Enter 4-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={abhaOtp}
                      onChange={(e) => setAbhaOtp(e.target.value)}
                      placeholder="8492"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center font-mono text-xl font-extrabold tracking-widest focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <BadgeCheck size={16} />
                    <span>Verify OTP & Enter Patient Portal</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setAbhaOtpSent(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      ← Change ABHA Number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2025 ClaimEase AI. Intelligent Healthcare Insurance Claims Management.</span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>ABDM Compliant</span>
            <span>•</span>
            <span>256-bit ZK-Rollup Proofs</span>
            <span>•</span>
            <span>IRDAI Standard</span>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">Reset Account Password</h3>
              </div>
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setOtpStep(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
              {!otpStep ? (
                <>
                  <p className="text-xs text-slate-600">
                    Enter your registered email or mobile to receive a 4-digit verification code.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email or Mobile</label>
                    <input
                      type="text"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. rajesh.kumar@healthmail.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700"
                  >
                    Send OTP Verification Code
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900">
                    <p className="font-bold">Demo Verification Code</p>
                    <p className="mt-0.5">Please enter <strong>4492</strong> to verify identity.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enter 4-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      placeholder="4492"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-center font-mono text-lg font-bold tracking-widest focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700"
                  >
                    Verify & Reset Password
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
