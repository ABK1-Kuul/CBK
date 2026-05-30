import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { SME } from '../../types';

// FI Portal Components
import { FIRegistration } from '../fi/FIRegistration';
import { FIDashboard } from '../fi/FIDashboard';
import { SMEMarketplace } from '../fi/SMEMarketplace';
import { FinancialPassportViewer } from '../fi/FinancialPassportViewer';
import { FundingEligibility } from '../fi/FundingEligibility';
import { DealPipeline } from '../fi/DealPipeline';
import { PortfolioAnalytics } from '../fi/PortfolioAnalytics';

// Navigation Icons
import {
  Sparkles,
  LayoutDashboard,
  Landmark,
  Database,
  Shuffle,
  LineChart,
  Menu,
  X
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const {
    currentInstitution
  } = useAppState();

  // Navigation states for FI view
  const [fiSubView, setFiSubView] = useState<'dashboard' | 'setup' | 'marketplace' | 'eligibility' | 'pipeline' | 'analytics'>('dashboard');

  // Selected SME for deep passport viewing on FI side
  const [selectedSmeForViewer, setSelectedSmeForViewer] = useState<SME | null>(null);

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectSMEForViewer = (sme: SME) => {
    setSelectedSmeForViewer(sme);
    setFiSubView('marketplace'); // Make sure we are on the page to render the viewer
  };

  const renderActiveView = () => {
    if (selectedSmeForViewer && fiSubView === 'marketplace') {
      return (
        <FinancialPassportViewer
          sme={selectedSmeForViewer}
          onBack={() => setSelectedSmeForViewer(null)}
        />
      );
    }

    switch (fiSubView) {
      case 'dashboard':
        return <FIDashboard />;
      case 'setup':
        return <FIRegistration />;
      case 'marketplace':
        return <SMEMarketplace onSelectSME={handleSelectSMEForViewer} />;
      case 'eligibility':
        return <FundingEligibility onSelectSME={handleSelectSMEForViewer} />;
      case 'pipeline':
        return <DealPipeline />;
      case 'analytics':
        return <PortfolioAnalytics />;
      default:
        return <FIDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* MASTER TOP NAVBAR */}
      <header className="bg-slate-900 border-b border-slate-800/80 sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-slate-100 tracking-tight block text-sm sm:text-base">VULA LEDGER AI</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block -mt-0.5">Credit Infrastructure Layer</span>
            </div>
          </div>

          <div className="hidden sm:block text-xs text-slate-400 font-bold px-3 py-1.5 bg-slate-950 border border-slate-800/80 rounded-lg">
            <span>FI Workstation Portal</span>
          </div>

          {/* MOBILE NAV BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800/60 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </header>

      {/* PORTAL NAV STRIPS FOR MOBILE */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3 animate-slide-down">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2">Navigation</p>
          
          <div className="flex flex-col gap-1 text-xs">
            <button
              onClick={() => {
                setFiSubView('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-2 ${
                fiSubView === 'dashboard' ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-400 hover:bg-slate-950'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Executive Dashboard</span>
            </button>
            <button
              onClick={() => {
                setFiSubView('setup');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-2 ${
                fiSubView === 'setup' ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-400 hover:bg-slate-950'
              }`}
            >
              <Landmark className="w-4 h-4 text-indigo-400" />
              <span>Institution Setup Wizard</span>
            </button>
            <button
              onClick={() => {
                setFiSubView('marketplace');
                setSelectedSmeForViewer(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-2 ${
                fiSubView === 'marketplace' ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-400 hover:bg-slate-950'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span>SME Directory Grid</span>
            </button>
            <button
              onClick={() => {
                setFiSubView('eligibility');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-2 ${
                fiSubView === 'eligibility' ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-400 hover:bg-slate-950'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Eligibility Matcher</span>
            </button>
            <button
              onClick={() => {
                setFiSubView('pipeline');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-2 ${
                fiSubView === 'pipeline' ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-400 hover:bg-slate-950'
              }`}
            >
              <Shuffle className="w-4 h-4 text-indigo-400" />
              <span>Deal Pipeline CRM</span>
            </button>
            <button
              onClick={() => {
                setFiSubView('analytics');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-2 ${
                fiSubView === 'analytics' ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-400 hover:bg-slate-950'
              }`}
            >
              <LineChart className="w-4 h-4 text-indigo-400" />
              <span>Telemetry Analytics</span>
            </button>
          </div>
        </div>
      )}

      {/* MASTER CONTAINER BODY */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* DESKTOP SIDEBAR - Hidden on mobile, takes 3 columns on large screen */}
          <aside className="hidden lg:block lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sticky top-24 space-y-4">
            
            {/* Context Widget info */}
            <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-xl space-y-2">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Active Identity</p>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  {currentInstitution?.name || 'Commercial Bank of Ethiopia'}
                </p>
                <p className="text-[10px] text-indigo-400 font-medium">Verified underwriter</p>
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-4 space-y-1 text-xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2.5 mb-2">Controls Navigation</p>
              
              <button
                onClick={() => setFiSubView('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  fiSubView === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Executive Dashboard</span>
              </button>

              <button
                onClick={() => setFiSubView('setup')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  fiSubView === 'setup'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Landmark className="w-4 h-4 shrink-0" />
                <span>Institution Setup Wizard</span>
              </button>

              <button
                onClick={() => {
                  setFiSubView('marketplace');
                  setSelectedSmeForViewer(null);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  fiSubView === 'marketplace' && !selectedSmeForViewer
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Database className="w-4 h-4 shrink-0" />
                <span>SME Directory Grid</span>
              </button>

              <button
                onClick={() => setFiSubView('eligibility')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  fiSubView === 'eligibility'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>AI Eligibility Matcher</span>
              </button>

              <button
                onClick={() => setFiSubView('pipeline')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  fiSubView === 'pipeline'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Shuffle className="w-4 h-4 shrink-0" />
                <span>Deal Pipeline CRM</span>
              </button>

              <button
                onClick={() => setFiSubView('analytics')}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  fiSubView === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <LineChart className="w-4 h-4 shrink-0" />
                <span>Telemetry Analytics</span>
              </button>
            </div>

          </aside>

          {/* ACTIVE PORTAL SCREEN SECTION - Stretches fluidly on mobile, takes 9 columns on large desktop */}
          <div className="col-span-1 lg:col-span-9 animate-fade-in">
            {renderActiveView()}
          </div>

        </div>
      </main>

      {/* MASTER FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 text-slate-600 text-xs py-6 mt-12">
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <p className="font-semibold text-slate-400">Vula Ledger AI • B2B Credit Infrastructure Platform</p>
            <p className="text-[10px] text-slate-500 mt-1">Empowering East African Micro-Enterprises with verified bookkeeping and capital marketplace linkages.</p>
          </div>
          <div className="text-[10px] text-slate-500">
            © {new Date().getFullYear()} Vula AI Technologies. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};
