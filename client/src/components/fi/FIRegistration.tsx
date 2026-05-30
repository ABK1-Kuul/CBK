import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { Shield, Sparkles, Building2, Landmark, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { InstitutionType, RiskLevel } from '../../types';

export const FIRegistration: React.FC = () => {
  const { registerInstitution, currentInstitution } = useAppState();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const [type, setType] = useState<InstitutionType>('Commercial Bank');
  const [riskAppetite, setRiskAppetite] = useState<RiskLevel>('Medium');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !license) return;

    registerInstitution({
      name,
      licenseNumber: license,
      type,
      riskAppetite
    });

    setStep(3); // success step
  };

  return (
    <div className="max-w-xl mx-auto my-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
      
      {/* Wizard Header Progress Indicator */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold text-slate-100">Institution Gateway Portal</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-indigo-400' : 'bg-slate-800'}`}></span>
          <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-indigo-400' : 'bg-slate-800'}`}></span>
          <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-indigo-400' : 'bg-slate-800'}`}></span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-slate-100">Verify Your Institution Credentials</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vula Ledger AI enforces strict B2B credit infrastructure parameters. Enter your legally authorized banking license details below.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Official Institution Name</label>
              <input
                type="text"
                placeholder="e.g. Commercial Bank of Ethiopia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">National License Reference Code</label>
              <input
                type="text"
                placeholder="e.g. LIC-CBE-984021"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (name && license) setStep(2);
            }}
            disabled={!name || !license}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all min-h-[44px]"
          >
            <span>Configure Risk appetite Parameters</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-slate-100">Underwriting Parameters</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our automated matching algorithms utilize these filters to pre-score credit applicants matching your yield parameters.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Institution Operating Classification</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['Commercial Bank', 'MFI', 'SACCO', 'Investor'] as InstitutionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`p-3 text-left border rounded-xl font-medium transition-all flex items-center gap-2 ${
                      type === t 
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300 shadow-indigo-600/5' 
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Lending Risk Tolerance Threshold</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Low', 'Medium', 'High'] as RiskLevel[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRiskAppetite(r)}
                    className={`p-3 text-center border rounded-xl font-bold transition-all ${
                      riskAppetite === r
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{r} Risk</span>
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1.5">
                {riskAppetite === 'Low' && 'Low: Automatically filters out SMEs with Credit Scores below 700.'}
                {riskAppetite === 'Medium' && 'Medium: Automatically targets credit scores above 600 with moderate collateral criteria.'}
                {riskAppetite === 'High' && 'High: Yield optimized. Evaluates microenterprises with high volatility margins.'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl text-xs transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all shadow-lg shadow-emerald-600/10"
            >
              <Sparkles className="w-4 h-4" />
              <span>Complete Onboarding Configuration</span>
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-6 space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-emerald-300">Onboarding Complete</h3>
            <p className="text-slate-200 font-semibold text-sm">{currentInstitution?.name}</p>
            <p className="text-slate-400 text-xs">Licence: {currentInstitution?.licenseNumber} • Classification: {currentInstitution?.type}</p>
          </div>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
            Your risk appetite has been updated to **{currentInstitution?.riskAppetite}**. Automated matching vectors are now sorting the marketplace database...
          </p>
          <button
            onClick={() => setStep(1)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline block mx-auto"
          >
            Reconfigure Profile Parameters
          </button>
        </div>
      )}

    </div>
  );
};
