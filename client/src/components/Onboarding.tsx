import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { registerUser, loginUser, createBusinessProfile } from '../api';
import { Building2, Mail, Lock, ArrowRight, ArrowLeft, Calendar, Sparkles, Landmark, MapPin, User } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: BusinessProfile) => void;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function Onboarding({ onComplete, showToast }: OnboardingProps) {
  const [step, setStep] = useState<'auth' | 'business_setup'>('auth');
  const [isRegister, setIsRegister] = useState(false);

  // User Auth Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('SME_USER');

  // Business Profile Fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Retail');
  const [location, setLocation] = useState('Addis Ababa, Ethiopia');
  const [joinedDate, setJoinedDate] = useState(() => new Date().toISOString().substring(0, 10));

  // Local Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAuth = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (isRegister && !fullName) {
      newErrors.fullName = 'Full Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAuth()) {
      showToast('Please correct the validation errors below', 'error');
      return;
    }
    try {
      if (isRegister) {
        // Register Real User with dynamic role selected
        const { registerUser: apiRegister } = await import('../api');
        const data = await apiRegister(fullName, email, "", password, role);
        localStorage.setItem('vula_jwt_token', data.token);
        localStorage.setItem('vula_user_id', data.userId);
        localStorage.setItem('vula_user_role', data.role || role);
        showToast("User Account created successfully!", "success");

        // SME_VENDORS and BANK_LENDER do not need business setup profile onboarding!
        if (role === 'SME_VENDORS' || role === 'BANK_LENDER') {
          const profile: BusinessProfile = {
            businessName: role === 'SME_VENDORS' ? "Almaz Bulk Supply" : "Lending Partner",
            industryType: role === 'SME_VENDORS' ? "Wholesale" : "Lending",
            monthlyRevenueEstimate: 45000,
            joinedDate: new Date().toISOString().substring(0, 10),
            email: email || 'gutu@vula.com'
          };
          localStorage.setItem('sme_profile', JSON.stringify(profile));
          onComplete(profile);
          showToast(`Onboarding completed successfully!`, 'success');
          return;
        }

        setStep('business_setup');
      } else {
        // Login Real User
        const data = await loginUser(email, password);
        localStorage.setItem('vula_jwt_token', data.token);
        localStorage.setItem('vula_user_id', data.userId);
        localStorage.setItem('vula_user_role', data.role || 'SME_USER');

        const activeRole = data.role || 'SME_USER';

        // SME_VENDORS and BANK_LENDER do not need business setup profile onboarding!
        if (activeRole === 'SME_VENDORS' || activeRole === 'BANK_LENDER') {
          const profile: BusinessProfile = {
            businessName: activeRole === 'SME_VENDORS' ? "Almaz Bulk Supply" : "Lending Partner",
            industryType: activeRole === 'SME_VENDORS' ? "Wholesale" : "Lending",
            monthlyRevenueEstimate: 45000,
            joinedDate: new Date().toISOString().substring(0, 10),
            email: email || data.email || 'gutu@vula.com'
          };
          localStorage.setItem('sme_profile', JSON.stringify(profile));
          onComplete(profile);
          showToast('Login successful! Welcome back directly to your dashboard.', 'success');
          return;
        }
        
        // Check if the user already has an existing business registered
        const { getBusinessByUserId } = await import('../api');
        try {
          const businesses = await getBusinessByUserId(Number(data.userId));
          if (businesses && businesses.length > 0) {
            const biz = businesses[0];
            localStorage.setItem('vula_business_id', biz.id.toString());

            const profile: BusinessProfile = {
              businessName: biz.businessName,
              industryType: biz.businessType,
              monthlyRevenueEstimate: 45000,
              joinedDate: biz.startDate,
              email: email || 'gutu@vula.com'
            };

            localStorage.setItem('sme_profile', JSON.stringify(profile));
            onComplete(profile);
            showToast('Login successful! Welcome back directly to your dashboard.', 'success');
            return;
          }
        } catch (bizErr) {
          console.warn('Could not retrieve existing business profile:', bizErr);
        }

        showToast('Login successful! Let\'s configure your business profile.', 'success');
        setStep('business_setup');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed. Please check your credentials.', 'error');
    }
  };

  const validateBusiness = () => {
    const newErrors: Record<string, string> = {};
    if (!businessName.trim()) {
      newErrors.businessName = 'Business Legal Name is required';
    }
    if (!joinedDate) {
      newErrors.joinedDate = 'Operational Start Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBusiness()) {
      showToast('Please complete the business profile details', 'error');
      return;
    }
    try {
      const data = await createBusinessProfile(
        businessName,
        businessType,
        location,
        joinedDate
      );
      
      localStorage.setItem('vula_business_id', data.id);

      const profile: BusinessProfile = {
        businessName: data.businessName,
        industryType: data.businessType,
        monthlyRevenueEstimate: 45000,
        joinedDate: data.startDate,
        email: email || 'gutu@vula.com'
      };
      
      localStorage.setItem('sme_profile', JSON.stringify(profile));
      onComplete(profile);
      showToast('Onboarding completed! Your dynamic Vula trust profile is live.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create business profile', 'error');
    }
  };

  const industryOptions = [
    { label: 'Retail & E-commerce', value: 'Retail' },
    { label: 'Technology & SaaS', value: 'Technology' },
    { label: 'Hospitality & Dining', value: 'Hospitality' },
    { label: 'Construction & Logistics', value: 'Construction' },
    { label: 'Professional Advisory', value: 'Consulting' },
    { label: 'Agricultural Trading', value: 'Agriculture' }
  ];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-950 overflow-hidden">
      
      {/* BRANDING GRAPHICS PANEL */}
      <section className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-primary via-primary/95 to-slate-950 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-850">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-goldaccent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-xl">
            <Landmark className="w-6 h-6 text-white stroke-[2]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase">Vula Ledger AI</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">SME Credit Engine</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10 max-w-sm">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            Combine AI-Driven Bookkeeping with Capital Access
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Upload vendor invoices, generate structural ledgers, and establish real-time verified credit trust to unlock institutional lender lines.
          </p>
        </div>

        <div className="text-[10px] text-slate-400 font-bold relative z-10">
          SECURE PROTOCOL • AES-256 ENCRYPTED
        </div>
      </section>

      {/* COMPACT AUTH & PROFILE SETUP PANEL */}
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
              <span className="font-extrabold text-sm tracking-tight text-white block">Vula Ledger AI</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block">SME Credit Engine</span>
            </div>
          </div>

          {/* VIEW 1: AUTHENTICATION FORM */}
          {step === 'auth' && (
            <form onSubmit={handleAuthSubmit} className="space-y-5 bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-850 backdrop-blur-sm shadow-xl">
              <div>
                <h3 className="text-lg font-black text-slate-200">
                  {isRegister ? 'Register your SME Account' : 'Sign in to SME Workspace'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Acquire lender credentials by registering your enterprise ledger.</p>
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Gutu Daniel Geleta"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-850 focus:border-primary rounded-xl text-xs text-white focus:outline-none min-h-[48px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ecosystem Member Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-850 focus:border-primary rounded-xl text-xs text-white focus:outline-none px-3 py-3 min-h-[48px]"
                    >
                      <option value="SME_USER">SME User (Business Owner / Underwriter Access)</option>
                      {/* <option value="SME_VENDORS">SME Vendor (Bulk Supplier / Merchant Distributor)</option> */}
                      <option value="BANK_LENDER">Bank Lender (Institutional Credit Evaluator)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gutu@vula.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-850 focus:border-primary rounded-xl text-xs text-white focus:outline-none min-h-[48px]"
                  />
                </div>
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-850 focus:border-primary rounded-xl text-xs text-white focus:outline-none min-h-[48px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-150 shadow-lg shadow-primary/20 mt-2 min-h-[48px]"
              >
                <span>{isRegister ? 'Begin Registration' : 'Authenticate & Enter'}</span>
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

          {/* VIEW 2: BUSINESS PROFILE SETUP CARD */}
          {step === 'business_setup' && (
            <form onSubmit={handleCreateBusiness} className="bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-850 backdrop-blur-sm shadow-xl space-y-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="text-primary w-5 h-5" />
                  Business Profile Setup
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your business identity to establish a real-time trust rating.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Addis Grain Supply"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-850 focus:border-primary rounded-xl text-xs text-white focus:outline-none min-h-[48px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Business Sector</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-850 focus:border-primary rounded-xl text-xs text-white focus:outline-none px-3 py-3 min-h-[48px]"
                    >
                      {industryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Date (Longevity)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        required
                        value={joinedDate}
                        onChange={(e) => setJoinedDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-850 focus:border-primary rounded-xl text-xs text-white focus:outline-none min-h-[48px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Geographic Location HQ</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Addis Ababa, Ethiopia"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-850 focus:border-primary rounded-xl text-xs text-white focus:outline-none min-h-[48px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('auth')}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 min-h-[48px] text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 min-h-[48px] text-xs shadow-lg shadow-primary/15"
                >
                  Create Profile
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </form>
          )}

        </div>
      </section>

    </div>
  );
}
