import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Battery, Wifi, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
}

export default function MobileFrame({ children, activeTab, setActiveTab, isLoggedIn }: MobileFrameProps) {
  const [isMobileMode, setIsMobileMode] = useState(true);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-start p-2 sm:p-6 transition-all duration-300">
      {/* Device Emulator Controls */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between mb-4 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping" />
          <div>
            <h1 className="font-bold text-sm tracking-wide text-slate-200">SME CreditBook™</h1>
            <p className="text-[11px] text-slate-400">AI Bookkeeping & Credit Assessment</p>
          </div>
        </div>
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setIsMobileMode(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isMobileMode
                ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-100 border border-slate-600 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile View (390x844)
          </button>
          <button
            onClick={() => setIsMobileMode(false)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              !isMobileMode
                ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-100 border border-slate-600 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Responsive Desktop
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`relative transition-all duration-500 ${
          isMobileMode
            ? 'w-[390px] h-[844px] rounded-[50px] border-[12px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col ring-4 ring-slate-900/50 scale-100'
            : 'w-full max-w-5xl h-auto min-h-[780px] rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col'
        }`}
      >
        {/* Mobile Mockup Status Bar */}
        {isMobileMode && (
          <div className="w-full bg-slate-950 text-slate-300 h-11 px-6 flex items-center justify-between select-none shrink-0 z-50 border-b border-slate-900/40">
            {/* Left: Time */}
            <span className="text-xs font-semibold tracking-tight">{currentTime.split(' ')[0]}</span>

            {/* Middle: Speaker Notch */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-32 h-6 bg-slate-950 rounded-b-2xl flex items-center justify-center border-x border-b border-slate-850">
              <div className="w-12 h-1 bg-slate-800 rounded-full mb-1" />
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full absolute right-4 mb-1" />
            </div>

            {/* Right: Network & Battery */}
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-slate-200" />
            </div>
          </div>
        )}

        {/* Dynamic App Content Body */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative bg-slate-950">
          {children}
        </div>

        {/* Mobile Navigation Bar - Standard View (Bottom Tabs) */}
        {isLoggedIn && (
          <div className={`shrink-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 z-40 ${
            isMobileMode ? 'pb-6' : 'pb-2.5'
          }`}>
            <div className="max-w-md mx-auto flex justify-between items-center select-none">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center justify-center gap-1.5 transition-colors duration-150 min-h-[48px] min-w-[48px] px-1 rounded-xl ${
                  activeTab === 'dashboard' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
                <span className="text-[10px] font-medium tracking-wide">Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('bookkeeping')}
                className={`flex flex-col items-center justify-center gap-1.5 transition-colors duration-150 min-h-[48px] min-w-[48px] px-1 rounded-xl ${
                  activeTab === 'bookkeeping' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-[10px] font-medium tracking-wide">Bookkeeping</span>
              </button>

              <button
                onClick={() => setActiveTab('credit')}
                className={`flex flex-col items-center justify-center gap-1.5 transition-colors duration-150 min-h-[48px] min-w-[48px] px-1 rounded-xl ${
                  activeTab === 'credit' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[10px] font-medium tracking-wide">Credit Score</span>
              </button>

              <button
                onClick={() => setActiveTab('passport')}
                className={`flex flex-col items-center justify-center gap-1.5 transition-colors duration-150 min-h-[48px] min-w-[48px] px-1 rounded-xl ${
                  activeTab === 'passport' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[10px] font-medium tracking-wide">Passport</span>
              </button>
            </div>
            
            {/* Apple Home Indicator Bar for Mobile Frame */}
            {isMobileMode && (
              <div className="w-36 h-1 bg-slate-700/60 rounded-full mx-auto mt-3" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
