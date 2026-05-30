import React, { useState } from 'react';
import { SME } from '../../types';
import { Shield, Send, Sparkles, User, Briefcase, Calendar, CheckSquare, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react';

interface FinancialPassportViewerProps {
  sme: SME;
  onBack: () => void;
}

interface ChatMessage {
  sender: 'analyst' | 'ai';
  text: string;
}

export const FinancialPassportViewer: React.FC<FinancialPassportViewerProps> = ({ sme, onBack }) => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: 'ai', text: `Vula Risk Analyst v2.5 Online. Ask me anything about ${sme.businessName}'s credit profile, transaction records, or cashflow stability.` }
  ]);
  const [typing, setTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query.trim();
    setChatHistory(prev => [...prev, { sender: 'analyst', text: userMessage }]);
    setQuery('');
    setTyping(true);

    // AI logic responding dynamically to SME traits
    setTimeout(() => {
      let responseText = '';
      const textLower = userMessage.toLowerCase();

      if (textLower.includes('risky') || textLower.includes('risk') || textLower.includes('why')) {
        if (sme.riskLevel === 'Low') {
          responseText = `**AI Underwriting Assessment for ${sme.businessName}:**
- **Overall Rating:** LOW RISK (${sme.trustScore} Credit Score).
- **Positive Ratios:** Stable cash flow buffers with a net margin of **${((sme.profit / sme.monthlyRevenue) * 100).toFixed(0)}%**.
- **Historical Consistency:** Active ledger age of **${sme.monthsActive} months** with high transaction density (**${sme.transactionCount} verified records**).
- **Risk Flag:** Extremely minor. Seasonal agricultural fluctuations could affect cash flows briefly, but pre-export liquid assets offset working capital risk. Highly recommended for funding.`;
        } else if (sme.riskLevel === 'Medium') {
          responseText = `**AI Underwriting Assessment for ${sme.businessName}:**
- **Overall Rating:** MEDIUM RISK (${sme.trustScore} Credit Score).
- **Ratios:** Profit margin of **${((sme.profit / sme.monthlyRevenue) * 100).toFixed(0)}%** is healthy but highly volatile depending on supply logistics.
- **Credit Depth:** **${sme.monthsActive} active months** is moderate.
- **Specific Risk Drivers:** 
  1. Operating capital is tightly bound to fabric supplier imports.
  2. Transaction frequency drops by 15% during off-peak trade seasons.
- **Recommendation:** Approve with structured covenant: fund directly to fabric suppliers rather than raw cash dispatch.`;
        } else {
          responseText = `**AI Underwriting Assessment for ${sme.businessName} (CRITICAL REVIEW REQUIRED):**
- **Overall Rating:** HIGH RISK (${sme.trustScore} Credit Score).
- **Core Drivers:**
  1. Operating profile is very young (**only ${sme.monthsActive} months** in registry).
  2. Transaction history is thin (**${sme.transactionCount} logs**), failing to demonstrate seasonal resiliency.
  3. Operating cash-flow margin is critically narrow (**${((sme.profit / sme.monthlyRevenue) * 100).toFixed(1)}%** profit ratio).
- **Recommendation:** Do not issue clean term loans. Request 100% receivables-backed invoice discounting or SACCO group co-guarantees to proceed.`;
        }
      } else if (textLower.includes('revenue') || textLower.includes('revenue') || textLower.includes('profit')) {
        responseText = `**Financial Flow breakdown for ${sme.businessName}:**
- **Monthly Revenue:** ${sme.monthlyRevenue.toLocaleString()} ETB (OCR-verified).
- **Monthly Outflows:** ${sme.monthlyExpenses.toLocaleString()} ETB.
- **Net Operating Surplus:** ${sme.profit.toLocaleString()} ETB.
- **Ledger Health:** Cash flow is positive. 85% of transactions are executed digitally through verified Vula AI partners.`;
      } else {
        responseText = `Based on my background scan of **${sme.businessName}**, they have been active in the B2B ecosystem for **${sme.monthsActive} months** with **${sme.transactionCount} verified ledger transactions**. 

Their current score is **${sme.trustScore} (${sme.riskLevel} Risk)**. If you need specific risk-benefit breakdowns, ask me: *"Why is this SME risky?"* or *"Analyze their revenue indicators."*`;
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: responseText }]);
      setTyping(false);
    }, 850);
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'Low') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (risk === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors p-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to B2B SME Directory</span>
      </button>

      {/* Grid: Financial Passport Details & AI Risk Analyst Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Passport Details (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
          
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Immutable Ledger ID
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-1.5">{sme.businessName}</h2>
              <p className="text-slate-400 text-xs mt-0.5">Managing Representative: {sme.ownerName}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[9px] text-slate-500 uppercase font-bold">Credit Rating</p>
                <p className="text-lg font-extrabold text-indigo-400 mt-0.5">{sme.trustScore}</p>
              </div>
              <span className={`inline-flex border font-bold px-2.5 py-1 rounded text-xs ${getRiskColor(sme.riskLevel)}`}>
                {sme.riskLevel}
              </span>
            </div>
          </div>

          {/* Underwriting Indicators Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Credit Indicators</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 text-center">
                <span className="text-[10px] text-slate-500 block">Verified Revenue (ETB)</span>
                <span className="text-base font-extrabold text-slate-200 mt-1.5 block">{(sme.monthlyRevenue).toLocaleString()}</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 text-center">
                <span className="text-[10px] text-slate-500 block">Verified Expenses (ETB)</span>
                <span className="text-base font-extrabold text-slate-200 mt-1.5 block">{(sme.monthlyExpenses).toLocaleString()}</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 text-center">
                <span className="text-[10px] text-slate-500 block">Verified Net Margin</span>
                <span className="text-base font-extrabold text-emerald-400 mt-1.5 block">{(sme.profit).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Business Stability details */}
          <div className="border-t border-slate-800/60 pt-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Registry Integrity Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                <span className="text-slate-400">Months Active on Registry</span>
                <span className="font-bold text-slate-200">{sme.monthsActive} months</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                <span className="text-slate-400">Total Verified Transactions</span>
                <span className="font-bold text-indigo-400">{sme.transactionCount} records</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                <span className="text-slate-400">Registered Sector classification</span>
                <span className="font-bold text-slate-200">{sme.sector}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                <span className="text-slate-400">Regional HQ Jurisdiction</span>
                <span className="font-bold text-slate-200">{sme.location}, Ethiopia</span>
              </div>
            </div>
          </div>

          {/* Contact Node Info */}
          <div className="border-t border-slate-800/60 pt-4 text-xs text-slate-500 flex flex-col sm:flex-row gap-4 justify-between">
            <p>Ecosystem Email: <span className="text-slate-300 font-semibold">{sme.email}</span></p>
            <p>Verified Mobile Node: <span className="text-slate-300 font-semibold">{sme.phone}</span></p>
          </div>

        </div>

        {/* RIGHT: AI Risk Analyst Chat Tool (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col h-[520px] justify-between">
          
          {/* Panel Header */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">AI Risk Analyst Chat</h3>
              <p className="text-[10px] text-slate-500">Instant B2B automated underwriting query</p>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'analyst' ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-slate-500 font-bold mb-1 uppercase tracking-wide">
                  {msg.sender === 'analyst' ? 'Risk Analyst' : 'Vula AI engine'}
                </span>
                <div className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${
                  msg.sender === 'analyst'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800/60 text-slate-300 rounded-tl-none whitespace-pre-line'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex flex-col items-start animate-pulse">
                <span className="text-[9px] text-slate-500 font-bold mb-1">Vula AI engine</span>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl rounded-tl-none text-slate-500 italic">
                  Compiling ledger risk matrices...
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions suggestion */}
          <div className="pt-2 border-t border-slate-800/60 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setQuery('Why is this SME risky?')}
                className="bg-slate-950 hover:bg-slate-800 text-[10px] text-indigo-400 border border-indigo-500/10 px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
              >
                Why is this SME risky?
              </button>
              <button
                type="button"
                onClick={() => setQuery('Analyze their profit margins')}
                className="bg-slate-950 hover:bg-slate-800 text-[10px] text-indigo-400 border border-indigo-500/10 px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
              >
                Analyze profit margins
              </button>
            </div>

            {/* Form Input */}
            <form onSubmit={handleSend} className="relative mt-2">
              <input
                type="text"
                placeholder="Ask: Why is this SME risky?..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-3.5 pr-12 py-3 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-600 min-h-[44px]"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
