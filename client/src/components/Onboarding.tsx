import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { Building2, Mail, Lock, ArrowRight, ArrowLeft, Calendar, DollarSign, Briefcase, Sparkles, Landmark, ShieldCheck } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: BusinessProfile) => void;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function Onboarding({ onComplete, showToast }: OnboardingProps) {
  const [step, setStep] = useState<'auth' | 'industry' | 'revenue' | 'longevity'>('auth');
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industryType, setIndustryType] = useState('Retail');
  const [revenue, setRevenue] = useState<number>(45000);
  const [joinedDate, setJoinedDate] = useState('2025-05-15'); // default to 1 year ago relative to 2026

  // Local Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAuth = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (isRegister && !businessName) {
      newErrors.businessName = 'Business name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAuth()) {
      showToast(isRegister ? 'Business Account created! Let\'s tailor your profile.' : 'Authenticated! Adjusting your dashboard...', 'success');
      setStep('industry');
    } else {
      showToast('Please correct the validation errors below', 'error');
    }
  };

  const handleNextStep = () => {
    if (step === 'industry') {
      setStep('revenue');
    } else if (step === 'revenue') {
      setStep('longevity');
    }
  };

  const handleBackStep = () => {
    if (step === 'industry') {
      setStep('auth');
    } else if (step === 'revenue') {
      setStep('industry');
    } else if (step === 'longevity') {
      setStep('revenue');
    }
  };

  const handleFinalize = () => {
    const profile: BusinessProfile = {
      businessName: businessName || 'My SME Enterprise Ltd',
      industryType,
      monthlyRevenueEstimate: revenue,
      joinedDate,
      email: email || 'sme-owner@example.com'
    };
    onComplete(profile);
    showToast('Onboarding complete! Dynamic FinTech workspace ready.', 'success');
  };

  const longevityOptions = [
    { label: 'Just Joined (New Account)', value: '2026-05-15', desc: 'No baseline transaction logs' },
    { label: '3 Months (Operational)', value: '2026-02-15', desc: 'Initial baseline records established' },
    { label: '1 Year (Strong Longevity)', value: '2025-05-15', desc: 'Continuous operation history' },
    { label: '2 Years+ (Premium Trust)', value: '2024-05-15', desc: 'Historic ledger records' },
  ];

  const industryOptions = [
    { label: 'Retail & E-commerce', value: 'Retail', desc: 'Stores, merchants, and digital shopping' },
    { label: 'Technology & SaaS', value: 'Technology', desc: 'Software platforms, development, agency' },
    { label: 'Hospitality & Dining', value: 'Hospitality', desc: 'Restaurants, hotels, cafes, trade' },
    { label: 'Construction & Logistics', value: 'Construction', desc: 'Trading, freight, build contracting' },
    { label: 'Professional Advisory', value: 'Consulting', desc: 'Legal, marketing, advisory services' },
  ];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-950 overflow-hidden">
      
      {/* BRANDING GRAPHICS PANEL (Visible on lg viewports and up - Left Side) */}
      <section className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-primary via-primary/95 to-slate-950 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-850">
        {/* Glow effect */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-goldaccent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-xl">
            <Landmark className="w-6 h-6 text-white stroke-[2]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase">CreditBook™</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">SME Capital Engine</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10 max-w-sm">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            Combine AI-Driven Bookkeeping with Capital Access
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Upload vendor invoices, generate structural ledgers, and establish real-time verified credit trust to unlock capital lines of up to $250,000.
          </p>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                <CheckCircleIcon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-200">Continuous AI Audit Trail</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                <CheckCircleIcon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-200">Verified Credit Trust Passport</span>
            </div>
          </div>
        </div>

        {/* Footer hash */}
        <div className="text-[10px] text-slate-400 font-bold relative z-10">
          SECURE PROTOCOL v2.4 • AES-256 ENCRYPTED
        </div>
      </section>

      {/* COMPACT AUTH & PROFILE FORM PANEL (Right Side - Centers itself fluidly) */}
      <section className="flex-1 lg:col-span-7 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12 relative">
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-goldaccent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full mx-auto relative z-10">
          
          {/* Logo header for mobile screens */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8 text-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-slate-100 shadow-md">
              <Landmark className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-sm tracking-tight text-white block">CreditBook™</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block">SME Capital Engine</span>
            </div>
          </div>

          {/* Progress bar (Multi-step wizard status) */}
          {step !== 'auth' && (
            <div className="mb-8">
              <div className="flex justify-between text-[11px] text-slate-400 font-bold mb-2">
                <span className="text-primary-100 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-goldaccent" />
                  Business Setup Wizard
                </span>
                <span>
                  {step === 'industry' ? 'Step 1 of 3' : step === 'revenue' ? 'Step 2 of 3' : 'Step 3 of 3'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-success transition-all duration-300"
                  style={{ 
                    width: step === 'industry' ? '33%' : step === 'revenue' ? '66%' : '100%' 
                  }}
                />
              </div>
            </div>
          )}

          {/* VIEW 1: AUTHENTICATION FORM (Login / Register) */}
          {step === 'auth' && (
            <form onSubmit={handleAuthSubmit} className="space-y-5 bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-850 backdrop-blur-sm shadow-xl">
              <div>
                <h3 className="text-lg font-black text-slate-200">
                  {isRegister ? 'Register your SME Account' : 'Sign in to SME Workspace'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Acquire lender credentials by registering your enterprise ledger.</p>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business / Legal Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Acme Trading Company Ltd"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-950/80 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 transition-all duration-200 min-h-[48px] ${
                        errors.businessName ? 'border-danger focus:ring-danger/30' : 'border-slate-850 focus:border-primary focus:ring-primary/20'
                      }`}
                    />
                  </div>
                  {errors.businessName && <p className="text-danger text-[10px] mt-1 font-semibold">{errors.businessName}</p>}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Corporate Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="finance@acmetrading.com"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-950/80 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 transition-all duration-200 min-h-[48px] ${
                      errors.email ? 'border-danger focus:ring-danger/30' : 'border-slate-850 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-danger text-[10px] mt-1 font-semibold">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Secure Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-950/80 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 transition-all duration-200 min-h-[48px] ${
                      errors.password ? 'border-danger focus:ring-danger/30' : 'border-slate-850 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                </div>
                {errors.password && <p className="text-danger text-[10px] mt-1 font-semibold">{errors.password}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 shadow-lg shadow-primary/20 mt-2 min-h-[48px]"
              >
                <span>{isRegister ? 'Begin Setup Wizard' : 'Authenticate & Enter'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="text-center pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setErrors({});
                  }}
                  className="text-xs text-primary-100 hover:text-white font-bold underline min-h-[44px] px-4"
                >
                  {isRegister ? 'Already registered? Sign In' : "New entity? Register SME Business"}
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: INDUSTRY SETUP (Step 1) */}
          {step === 'industry' && (
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-850 backdrop-blur-sm shadow-xl space-y-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Briefcase className="text-primary w-5 h-5" />
                  Select Industry Sector
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enables our AI parser to target specific standard charts of accounts matching your industry.
                </p>
              </div>

              <div className="space-y-3">
                {industryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIndustryType(opt.value)}
                    className={`w-full text-left p-3.5 rounded-2xl border flex flex-col justify-start transition-all duration-200 min-h-[58px] ${
                      industryType === opt.value
                        ? 'bg-primary/10 border-primary shadow-md shadow-primary/5'
                        : 'bg-slate-950/60 border-slate-850 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="font-bold text-xs text-white">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBackStep}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 min-h-[48px] text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 min-h-[48px] text-xs"
                >
                  Next
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: REVENUE SETUP (Step 2) */}
          {step === 'revenue' && (
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-850 backdrop-blur-sm shadow-xl space-y-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <DollarSign className="text-primary w-5 h-5" />
                  Estimated Monthly Inflows
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust slider to match average recurring receipts. Used to estimate leverage ratio thresholds.
                </p>
              </div>

              <div className="py-6 px-4 bg-slate-950/80 rounded-2xl border border-slate-850 text-center">
                <span className="text-3xl font-extrabold text-success">
                  ${revenue.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block mt-1">average monthly inflows</span>

                <input
                  type="range"
                  min={5000}
                  max={250000}
                  step={5000}
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                  className="w-full accent-primary bg-slate-900 h-2 rounded-lg mt-6 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-2.5 font-bold">
                  <span>$5,000</span>
                  <span>$125,000</span>
                  <span>$250,000+</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBackStep}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 min-h-[48px] text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 min-h-[48px] text-xs"
                >
                  Next
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW 4: JOINEDDATE LONGEVITY SETUP (Step 3) */}
          {step === 'longevity' && (
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-850 backdrop-blur-sm shadow-xl space-y-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Calendar className="text-primary w-5 h-5" />
                  Set Platform Longevity
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Longevity built on system is heavily weighted in SME underwriter models. Select a starting history baseline.
                </p>
              </div>

              <div className="space-y-3">
                {longevityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setJoinedDate(opt.value)}
                    className={`w-full text-left p-3.5 rounded-2xl border flex flex-col justify-start transition-all duration-200 min-h-[58px] ${
                      joinedDate === opt.value
                        ? 'bg-primary/10 border-primary shadow-md shadow-primary/5'
                        : 'bg-slate-950/60 border-slate-850 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-xs text-white">{opt.label}</span>
                      {joinedDate === opt.value && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBackStep}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 min-h-[48px] text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleFinalize}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 min-h-[48px] text-xs shadow-lg shadow-primary/15"
                >
                  Finalize Setup
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}

// Inline placeholder icon to avoid import issues
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}
