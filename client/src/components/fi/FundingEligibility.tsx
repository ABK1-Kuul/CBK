import React from 'react';
import { useAppState } from '../../context/AppContext';
import { Sparkles, CheckCircle, ShieldCheck, ChevronRight, Percent, Award } from 'lucide-react';
import { SME } from '../../types';

interface FundingEligibilityProps {
  onSelectSME: (sme: SME) => void;
}

export const FundingEligibility: React.FC<FundingEligibilityProps> = ({ onSelectSME }) => {
  const { smes, currentInstitution } = useAppState();

  // Smart matching algorithm based on institution risk appetite
  const matchedSMEs = smes.filter(sme => {
    const risk = currentInstitution?.riskAppetite || 'Medium';
    if (risk === 'Low') return sme.riskLevel === 'Low';
    if (risk === 'Medium') return sme.riskLevel === 'Low' || sme.riskLevel === 'Medium';
    return true; // High appetite matches everyone
  });

  const getReasoning = (sme: SME) => {
    if (sme.trustScore >= 750) {
      return {
        factor: 'Elite Credit Score',
        desc: 'SME exhibits pristine cash ledger ratios, zero defaults, and extremely healthy profit margins matching prime institutional bank risk standards.',
        yieldRate: '10.5%'
      };
    }
    if (sme.trustScore >= 650) {
      return {
        factor: 'Excellent Ledger Depth',
        desc: 'With over 12 months active transaction counts, cash reserves easily cover interest obligations by over 3.2x buffer capacity.',
        yieldRate: '12.0%'
      };
    }
    if (sme.trustScore >= 550) {
      return {
        factor: 'Consistent Working Capital',
        desc: 'Exhibits steady monthly revenue. Recommended for collateralized invoice factoring or accounts receivable credit booster products.',
        yieldRate: '14.5%'
      };
    }
    return {
      factor: 'High-Yield Microfinance Candidate',
      desc: 'SME is in high growth early operational stage. Cash balances fluctuate. Recommended for SACCO-guaranteed term microloans.',
      yieldRate: '16.0%'
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          AI Funding Eligibility Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated loan matching engine recommending qualified borrowers based on your configured lending profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matchedSMEs.map((sme) => {
          const matchingDetails = getReasoning(sme);
          return (
            <div
              key={sme.id}
              className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Auto-Eligible Match
                  </span>
                  <h3 className="text-lg font-bold text-slate-200 mt-1">{sme.businessName}</h3>
                  <p className="text-xs text-slate-400">{sme.sector} • {sme.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Matching Rate</p>
                  <p className="text-lg font-extrabold text-indigo-400">{matchingDetails.yieldRate}</p>
                </div>
              </div>

              {/* Matching Factor Reason */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs border-b border-slate-800 pb-1.5">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Match Driver: {matchingDetails.factor}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {matchingDetails.desc}
                </p>
              </div>

              {/* Ratios row */}
              <div className="grid grid-cols-3 gap-2 text-center border-t border-b border-slate-800/60 py-3 text-xs">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Credit Score</p>
                  <p className="font-extrabold text-emerald-400 mt-1">{sme.trustScore}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Verified Revenue</p>
                  <p className="font-extrabold text-slate-200 mt-1">{(sme.monthlyRevenue / 1000).toFixed(0)}k ETB</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Ledger Age</p>
                  <p className="font-extrabold text-indigo-400 mt-1">{sme.monthsActive} Mo</p>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onSelectSME(sme)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
              >
                <span>Initiate Credit Evaluation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {matchedSMEs.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 italic">
            No credit applicants match your restrictive low risk tolerance parameters. Reconfigure your profile to medium or high appetite to unlock applicant recommendations.
          </div>
        )}
      </div>
    </div>
  );
};
