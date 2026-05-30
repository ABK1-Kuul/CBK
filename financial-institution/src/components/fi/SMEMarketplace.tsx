import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppContext';
import { SME, RiskLevel } from '../../types';
import { Filter, Search, MapPin, DollarSign, Activity, AlertCircle, ChevronRight } from 'lucide-react';

interface SMEMarketplaceProps {
  onSelectSME: (sme: SME) => void;
}

export const SMEMarketplace: React.FC<SMEMarketplaceProps> = ({ onSelectSME }) => {
  const { smes } = useAppState();

  // Filter local states
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [revenueFilter, setRevenueFilter] = useState('All');

  // Compute unique filters dynamically
  const uniqueSectors = useMemo(() => ['All', ...new Set(smes.map(s => s.sector))], [smes]);
  const uniqueLocations = useMemo(() => ['All', ...new Set(smes.map(s => s.location))], [smes]);

  const filteredSMEs = useMemo(() => {
    return smes.filter(sme => {
      // Search
      const matchesSearch = sme.businessName.toLowerCase().includes(search.toLowerCase()) || 
                            sme.ownerName.toLowerCase().includes(search.toLowerCase());
      
      // Sector
      const matchesSector = sectorFilter === 'All' || sme.sector === sectorFilter;
      
      // Location
      const matchesLocation = locationFilter === 'All' || sme.location === locationFilter;
      
      // Risk
      const matchesRisk = riskFilter === 'All' || sme.riskLevel === riskFilter;

      // Score
      let matchesScore = true;
      if (scoreFilter !== 'All') {
        const score = sme.trustScore;
        if (scoreFilter === '700+') matchesScore = score >= 700;
        else if (scoreFilter === '600-700') matchesScore = score >= 600 && score < 700;
        else if (scoreFilter === 'lt-600') matchesScore = score < 600;
      }

      // Revenue
      let matchesRevenue = true;
      if (revenueFilter !== 'All') {
        const rev = sme.monthlyRevenue;
        if (revenueFilter === '500k+') matchesRevenue = rev >= 500000;
        else if (revenueFilter === '250k-500k') matchesRevenue = rev >= 250000 && rev < 500000;
        else if (revenueFilter === 'lt-250k') matchesRevenue = rev < 250000;
      }

      return matchesSearch && matchesSector && matchesLocation && matchesRisk && matchesScore && matchesRevenue;
    });
  }, [smes, search, sectorFilter, locationFilter, riskFilter, scoreFilter, revenueFilter]);

  const getScoreBadge = (score: number) => {
    if (score >= 700) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 600) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getRiskColor = (risk: RiskLevel) => {
    if (risk === 'Low') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (risk === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Quick Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">B2B SME Ledger Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and filter verified SME financial passports from our credit pipeline network.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search SME or Owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Responsive Filters Grid */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Sector Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Sector</label>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Location Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Location</label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Risk Level Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Risk Rating</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Risks</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

        {/* Credit Score Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Credit Score</label>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Scores</option>
            <option value="700+">Prime (700+)</option>
            <option value="600-700">Sub-Prime (600-700)</option>
            <option value="lt-600">{"High Yield (<600)"}</option>
          </select>
        </div>

        {/* Revenue Range Filter */}
        <div className="col-span-2 md:col-span-1 space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Monthly Revenue</label>
          <select
            value={revenueFilter}
            onChange={(e) => setRevenueFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Ranges</option>
            <option value="500k+">{"Large (>500k ETB)"}</option>
            <option value="250k-500k">Mid (250k-500k ETB)</option>
            <option value="lt-250k">{"Small (<250k ETB)"}</option>
          </select>
        </div>
      </div>

      {/* Directory Grid (Desktop Table / Mobile Cards) */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
        
        {/* DESKTOP VIEWPORT: Dense Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6 font-semibold">Business Name</th>
                <th className="py-4 px-6 font-semibold">Sector</th>
                <th className="py-4 px-6 font-semibold">HQ Location</th>
                <th className="py-4 px-6 font-semibold">Ecosystem Age</th>
                <th className="py-4 px-6 font-semibold">Monthly Revenue</th>
                <th className="py-4 px-6 font-semibold">Credit Score</th>
                <th className="py-4 px-6 font-semibold">Risk Class</th>
                <th className="py-4 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSMEs.map((sme) => (
                <tr
                  key={sme.id}
                  onClick={() => onSelectSME(sme)}
                  className="border-b border-slate-800/40 hover:bg-slate-900/60 cursor-pointer transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-200 text-sm">{sme.businessName}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">ID: V-SME-{sme.id.toUpperCase()} • Owner: {sme.ownerName}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-medium">{sme.sector}</td>
                  <td className="py-4 px-6 text-slate-400 font-medium flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{sme.location}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">{sme.monthsActive} months</td>
                  <td className="py-4 px-6 font-bold text-slate-100">{(sme.monthlyRevenue).toLocaleString()} ETB</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center border font-bold px-2.5 py-0.5 rounded text-[11px] ${getScoreBadge(sme.trustScore)}`}>
                      {sme.trustScore}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center border font-semibold px-2 py-0.5 rounded text-[10px] ${getRiskColor(sme.riskLevel)}`}>
                      {sme.riskLevel}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="bg-indigo-600/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 text-indigo-400 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-all flex items-center gap-1 ml-auto">
                      <span>View Passport</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSMEs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 italic">
                    No credit applicants matching current filters in this ledger node.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEWPORT: Fluid Cards */}
        <div className="md:hidden divide-y divide-slate-800/60 p-4 space-y-4">
          {filteredSMEs.map((sme) => (
            <div
              key={sme.id}
              onClick={() => onSelectSME(sme)}
              className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3 active:bg-slate-900 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">{sme.businessName}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">{sme.sector} • {sme.location}</p>
                </div>
                <span className={`inline-flex items-center border font-semibold px-2 py-0.5 rounded text-[10px] ${getRiskColor(sme.riskLevel)}`}>
                  {sme.riskLevel} Risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/30 p-2 rounded border border-slate-800/40">
                  <span className="text-slate-500 block">Monthly Revenue</span>
                  <span className="font-bold text-slate-200 mt-0.5 block">{(sme.monthlyRevenue).toLocaleString()} ETB</span>
                </div>
                <div className="bg-slate-900/30 p-2 rounded border border-slate-800/40">
                  <span className="text-slate-500 block">Trust score</span>
                  <span className={`font-bold mt-0.5 block ${sme.trustScore >= 700 ? 'text-emerald-400' : sme.trustScore >= 600 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {sme.trustScore}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-500">Active Months: {sme.monthsActive}</span>
                <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                  <span>Open Passport</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
          {filteredSMEs.length === 0 && (
            <div className="py-12 text-center text-slate-500 italic text-xs">
              No credit applicants matching current filters in this ledger node.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
