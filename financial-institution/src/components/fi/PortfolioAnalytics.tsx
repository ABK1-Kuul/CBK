import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { AreaChart, TrendingUp, ShieldAlert, BarChart3, PieChart, Info, HelpCircle } from 'lucide-react';

export const PortfolioAnalytics: React.FC = () => {
  const { smes, investments } = useAppState();

  const [selectedSmeId, setSelectedSmeId] = useState(smes[0]?.id || '');

  // Find currently selected SME for the history line chart
  const selectedSme = smes.find(s => s.id === selectedSmeId) || smes[0];

  // Calculations for portfolio aggregates
  const totalSmesCount = smes.length;
  const lowCount = smes.filter(s => s.riskLevel === 'Low').length;
  const medCount = smes.filter(s => s.riskLevel === 'Medium').length;
  const highCount = smes.filter(s => s.riskLevel === 'High').length;

  const lowPct = Math.round((lowCount / (totalSmesCount || 1)) * 100);
  const medPct = Math.round((medCount / (totalSmesCount || 1)) * 100);
  const highPct = Math.round((highCount / (totalSmesCount || 1)) * 100);

  // Sector Exposure aggregates
  const sectorMap: { [key: string]: number } = {};
  smes.forEach(s => {
    sectorMap[s.sector] = (sectorMap[s.sector] || 0) + 1;
  });
  const sectorList = Object.keys(sectorMap).map(sector => ({
    name: sector,
    count: sectorMap[sector],
    percentage: Math.round((sectorMap[sector] / totalSmesCount) * 100)
  }));

  // Line chart SVG computation
  const historyData = selectedSme?.historyScores || [];
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 30;

  // Map scores (300 to 850) to Y axis (height - padding to padding)
  // Map indices to X axis (padding to width - padding)
  const getX = (index: number) => {
    if (historyData.length <= 1) return padding;
    return padding + (index * (svgWidth - 2 * padding)) / (historyData.length - 1);
  };

  const getY = (score: number) => {
    const minS = 300;
    const maxS = 850;
    const range = maxS - minS;
    const scoreFrac = (score - minS) / range;
    return svgHeight - padding - scoreFrac * (svgHeight - 2 * padding);
  };

  // Build the SVG path
  let linePath = '';
  let fillPath = '';
  if (historyData.length > 0) {
    historyData.forEach((point, idx) => {
      const x = getX(idx);
      const y = getY(point.score);
      if (idx === 0) {
        linePath += `M ${x} ${y}`;
        fillPath += `M ${x} ${svgHeight - padding} L ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
        fillPath += ` L ${x} ${y}`;
      }
    });
    // close the fill shape at the bottom
    fillPath += ` L ${getX(historyData.length - 1)} ${svgHeight - padding} Z`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Portfolio & Risk Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Comprehensive underwriting telemetry covering risk bands, sector exposures, and individual borrower scoring pathways.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Risk & Sector Breakdowns (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Risk Distribution */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Ecosystem Risk Distribution
            </h2>

            <div className="space-y-3">
              {/* Low Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold">Low Risk Tier</span>
                  <span className="text-slate-400">{lowCount} SMEs ({lowPct}%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${lowPct}%` }}></div>
                </div>
              </div>

              {/* Medium Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold">Medium Risk Tier</span>
                  <span className="text-slate-400">{medCount} SMEs ({medPct}%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${medPct}%` }}></div>
                </div>
              </div>

              {/* High Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold">High Risk / High Yield</span>
                  <span className="text-slate-400">{highCount} SMEs ({highPct}%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${highPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Sector Exposure */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Sectors & Exposures Analysis
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="pb-2 font-semibold">Sector Category</th>
                    <th className="pb-2 font-semibold text-center">Active Borrowers</th>
                    <th className="pb-2 text-right font-semibold">Exposure Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {sectorList.map((sect) => (
                    <tr key={sect.name}>
                      <td className="py-2.5 font-bold text-slate-200">{sect.name}</td>
                      <td className="py-2.5 text-center text-slate-400 font-semibold">{sect.count}</td>
                      <td className="py-2.5">
                        <div className="flex items-center justify-end gap-3">
                          <span className="font-bold text-slate-200">{sect.percentage}%</span>
                          <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${sect.percentage}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT: Individual Score Tracking Line Chart (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <AreaChart className="w-4 h-4 text-indigo-400" />
                Score Tracking Telemetry
              </h2>
              {/* SME Dropdown Selector */}
              <select
                value={selectedSmeId}
                onChange={(e) => setSelectedSmeId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-[11px] text-indigo-400 rounded-xl px-2 py-1.5 focus:outline-none focus:border-indigo-500 font-bold"
              >
                {smes.map(s => <option key={s.id} value={s.id}>{s.businessName}</option>)}
              </select>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Track MoM credit score movements derived from accounting logs. Green/Amber spikes correlate with invoice receipt filings.
            </p>
          </div>

          {selectedSme ? (
            <div className="space-y-4">
              {/* Responsive SVG Line Chart */}
              <div className="w-full bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                  {/* Grid Lines */}
                  {[300, 450, 600, 750, 850].map((gridS, gIdx) => {
                    const y = getY(gridS);
                    return (
                      <g key={gIdx}>
                        <line
                          x1={padding}
                          y1={y}
                          x2={svgWidth - padding}
                          y2={y}
                          stroke="#1e293b"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={padding - 5}
                          y={y + 4}
                          fill="#475569"
                          fontSize="9"
                          textAnchor="end"
                          className="font-bold font-mono"
                        >
                          {gridS}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area under Curve */}
                  <path
                    d={fillPath}
                    fill="url(#grad-blue)"
                    className="opacity-25"
                  />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Line Curve */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="animate-dash"
                  />

                  {/* Score Dots */}
                  {historyData.map((pt, idx) => {
                    const x = getX(idx);
                    const y = getY(pt.score);
                    return (
                      <g key={idx} className="group cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r="4.5"
                          className="fill-indigo-500 stroke-slate-950 stroke-2"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          fill="#f8fafc"
                          fontSize="9"
                          textAnchor="middle"
                          className="font-black font-mono"
                        >
                          {pt.score}
                        </text>
                        {/* Month Label */}
                        <text
                          x={x}
                          y={svgHeight - padding + 14}
                          fill="#64748b"
                          fontSize="9"
                          textAnchor="middle"
                          className="font-bold"
                        >
                          {pt.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Mini Info Footer */}
              <div className="flex justify-between text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-semibold uppercase">Current Score Metrics</span>
                <span className="text-slate-200 font-bold">
                  {selectedSme.businessName}: <span className="text-indigo-400 font-extrabold">{selectedSme.trustScore} ({selectedSme.riskLevel} Risk)</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 italic text-xs">
              Configure directory parameters to view score histories.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
