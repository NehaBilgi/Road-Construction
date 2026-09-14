import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Hammer,
  Calculator,
  Box,
  Layers,
  Info,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';

type RCCTab = 'FOOTING' | 'COLUMN' | 'BEAM' | 'SLAB' | 'MIX_DESIGN';

export const RCCCalculators: React.FC = () => {
  const [activeRCCTab, setActiveRCCTab] = useState<RCCTab>('SLAB');

  // --- 1. SLAB STATE & CALCULATIONS ---
  const [slabLength, setSlabLength] = useState<number>(20.0);
  const [slabWidth, setSlabWidth] = useState<number>(10.0);
  const [slabThickness, setSlabThickness] = useState<number>(0.15); // 150mm
  const [slabGrade, setSlabGrade] = useState<string>('M25');
  const [slabMainDia, setSlabMainDia] = useState<number>(10);
  const [slabMainSpacingMm, setSlabMainSpacingMm] = useState<number>(150);
  const [slabDistDia, setSlabDistDia] = useState<number>(8);
  const [slabDistSpacingMm, setSlabDistSpacingMm] = useState<number>(175);

  const slabVolumeM3 = slabLength * slabWidth * slabThickness; // e.g. 20 * 10 * 0.15 = 30 m3
  const slabDryVolumeM3 = slabVolumeM3 * 1.54;

  // Mix design ratios for M25 (1:1:2 -> sum 4)
  const slabCementBags = Math.round((slabDryVolumeM3 * (1 / 4) * 1440) / 50); // ~11.1 bags/m3 -> ~330 bags
  const slabSandM3 = Number(((slabDryVolumeM3 * 1) / 4).toFixed(2));
  const slabAggM3 = Number(((slabDryVolumeM3 * 2) / 4).toFixed(2));

  // Steel calculation for slab
  const slabNumMainBars = Math.floor((slabWidth * 1000) / slabMainSpacingMm) + 1;
  const slabMainBarLength = slabLength + 0.3; // with hooks
  const slabMainSteelKg = Number((slabNumMainBars * slabMainBarLength * ((slabMainDia * slabMainDia) / 162)).toFixed(1));

  const slabNumDistBars = Math.floor((slabLength * 1000) / slabDistSpacingMm) + 1;
  const slabDistBarLength = slabWidth + 0.3;
  const slabDistSteelKg = Number((slabNumDistBars * slabDistBarLength * ((slabDistDia * slabDistDia) / 162)).toFixed(1));
  const slabTotalSteelKg = slabMainSteelKg + slabDistSteelKg;

  // --- 2. COLUMN STATE & CALCULATIONS ---
  const [colCount, setColCount] = useState<number>(12);
  const [colWidth, setColWidth] = useState<number>(0.30); // 300mm
  const [colBreadth, setColBreadth] = useState<number>(0.60); // 600mm
  const [colHeight, setColHeight] = useState<number>(3.30); // 3.3m floor to floor
  const [colMainBarsCount, setColMainBarsCount] = useState<number>(8);
  const [colMainDia, setColMainDia] = useState<number>(20);
  const [colStirrupDia, setColStirrupDia] = useState<number>(8);
  const [colStirrupSpacingMm, setColStirrupSpacingMm] = useState<number>(150);

  const colSingleVolume = colWidth * colBreadth * colHeight;
  const colTotalVolumeM3 = colCount * colSingleVolume;
  const colDryVolumeM3 = colTotalVolumeM3 * 1.54;
  const colCementBags = Math.round((colDryVolumeM3 * (1 / 3.5) * 1440) / 50); // M30
  const colSandM3 = Number(((colDryVolumeM3 * 1) / 3.5).toFixed(2));
  const colAggM3 = Number(((colDryVolumeM3 * 1.5) / 3.5).toFixed(2));

  // Column Steel
  const colMainBarLength = colHeight + 0.8; // lap & footing bend
  const colTotalMainSteelKg = Number(
    (colCount * colMainBarsCount * colMainBarLength * ((colMainDia * colMainDia) / 162)).toFixed(1)
  );
  const colPerimeter = 2 * (colWidth - 0.08 + (colBreadth - 0.08)) + 0.20; // 40mm clear cover + hooks
  const colStirrupsPerCol = Math.floor((colHeight * 1000) / colStirrupSpacingMm) + 1;
  const colTotalStirrupsSteelKg = Number(
    (colCount * colStirrupsPerCol * colPerimeter * ((colStirrupDia * colStirrupDia) / 162)).toFixed(1)
  );
  const colGrandSteelKg = colTotalMainSteelKg + colTotalStirrupsSteelKg;

  // --- 3. BEAM STATE & CALCULATIONS ---
  const [beamCount, setBeamCount] = useState<number>(8);
  const [beamLength, setBeamLength] = useState<number>(6.0);
  const [beamWidth, setBeamWidth] = useState<number>(0.23); // 230mm
  const [beamDepth, setBeamDepth] = useState<number>(0.45); // 450mm
  const [beamTopBars, setBeamTopBars] = useState<number>(2);
  const [beamTopDia, setBeamTopDia] = useState<number>(16);
  const [beamBottomBars, setBeamBottomBars] = useState<number>(3);
  const [beamBottomDia, setBeamBottomDia] = useState<number>(20);
  const [beamStirrupDia, setBeamStirrupDia] = useState<number>(8);
  const [beamStirrupSpacingMm, setBeamStirrupSpacingMm] = useState<number>(125);

  const beamTotalVolumeM3 = beamCount * (beamLength * beamWidth * beamDepth);
  const beamDryVol = beamTotalVolumeM3 * 1.54;
  const beamCementBags = Math.round((beamDryVol * (1 / 4) * 1440) / 50);
  const beamSandM3 = Number(((beamDryVol * 1) / 4).toFixed(2));
  const beamAggM3 = Number(((beamDryVol * 2) / 4).toFixed(2));

  const beamTopSteelKg = Number(
    (beamCount * beamTopBars * (beamLength + 0.5) * ((beamTopDia * beamTopDia) / 162)).toFixed(1)
  );
  const beamBottomSteelKg = Number(
    (beamCount * beamBottomBars * (beamLength + 0.5) * ((beamBottomDia * beamBottomDia) / 162)).toFixed(1)
  );
  const beamStirrupPerim = 2 * (beamWidth - 0.05 + (beamDepth - 0.05)) + 0.15;
  const beamStirrupCount = Math.floor((beamLength * 1000) / beamStirrupSpacingMm) + 1;
  const beamStirrupSteelKg = Number(
    (beamCount * beamStirrupCount * beamStirrupPerim * ((beamStirrupDia * beamStirrupDia) / 162)).toFixed(1)
  );
  const beamTotalSteelKg = beamTopSteelKg + beamBottomSteelKg + beamStirrupSteelKg;

  // --- 4. FOOTING STATE & CALCULATIONS ---
  const [ftgCount, setFtgCount] = useState<number>(16);
  const [ftgLength, setFtgLength] = useState<number>(2.4);
  const [ftgWidth, setFtgWidth] = useState<number>(2.4);
  const [ftgDepth, setFtgDepth] = useState<number>(0.6); // 600mm
  const [ftgMeshDia, setFtgMeshDia] = useState<number>(12);
  const [ftgMeshSpacingMm, setFtgMeshSpacingMm] = useState<number>(150);

  const ftgTotalVolumeM3 = ftgCount * (ftgLength * ftgWidth * ftgDepth);
  const ftgDryVol = ftgTotalVolumeM3 * 1.54;
  const ftgCementBags = Math.round((ftgDryVol * (1 / 4) * 1440) / 50);
  const ftgSandM3 = Number(((ftgDryVol * 1) / 4).toFixed(2));
  const ftgAggM3 = Number(((ftgDryVol * 2) / 4).toFixed(2));

  const ftgBarsBothWays = (Math.floor((ftgLength * 1000) / ftgMeshSpacingMm) + 1) * 2;
  const ftgTotalSteelKg = Number(
    (ftgCount * ftgBarsBothWays * (ftgLength + 0.4) * ((ftgMeshDia * ftgMeshDia) / 162)).toFixed(1)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              STRUCTURAL RCC DESIGN SUITE
            </span>
            <span className="text-xs text-slate-400">IS 456 Compliant Quantity Survey</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            RCC Member Quantity & Rebar Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automatic derivation of Wet/Dry Concrete Volume, OPC/PPC Cement Bags, Sand, Aggregates, and Steel Reinforcement weight ($d^2/162$).
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
          {(['SLAB', 'COLUMN', 'BEAM', 'FOOTING', 'MIX_DESIGN'] as RCCTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRCCTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeRCCTab === tab
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* --- TAB 1: SLAB CALCULATOR --- */}
      {activeRCCTab === 'SLAB' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
              <Calculator className="h-4 w-4 text-cyan-400" />
              Slab Geometry & Rebar Grid
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Length (m)</label>
                  <input
                    type="number"
                    value={slabLength}
                    onChange={(e) => setSlabLength(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Width (m)</label>
                  <input
                    type="number"
                    value={slabWidth}
                    onChange={(e) => setSlabWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Thickness (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={slabThickness}
                    onChange={(e) => setSlabThickness(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-cyan-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Concrete Grade</label>
                  <select
                    value={slabGrade}
                    onChange={(e) => setSlabGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-slate-200"
                  >
                    <option value="M20">M20 (1:1.5:3)</option>
                    <option value="M25">M25 (1:1:2)</option>
                    <option value="M30">M30 (Design Mix)</option>
                    <option value="M35">M35 (High Early)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Steel Reinforcement Detailing
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Main Bar Dia (mm)</label>
                    <select
                      value={slabMainDia}
                      onChange={(e) => setSlabMainDia(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    >
                      <option value={8}>8 mm</option>
                      <option value={10}>10 mm</option>
                      <option value={12}>12 mm</option>
                      <option value={16}>16 mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Main Spacing (mm)</label>
                    <input
                      type="number"
                      value={slabMainSpacingMm}
                      onChange={(e) => setSlabMainSpacingMm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Dist Bar Dia (mm)</label>
                    <select
                      value={slabDistDia}
                      onChange={(e) => setSlabDistDia(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    >
                      <option value={6}>6 mm</option>
                      <option value={8}>8 mm</option>
                      <option value={10}>10 mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Dist Spacing (mm)</label>
                    <input
                      type="number"
                      value={slabDistSpacingMm}
                      onChange={(e) => setSlabDistSpacingMm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
                <Box className="h-4 w-4 text-emerald-400" />
                Slab Material Bill of Quantities (BOQ Output)
              </h3>

              {/* Hero Big Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Concrete Wet Volume ({slabLength}m × {slabWidth}m × {slabThickness}m)
                  </span>
                  <div className="text-3xl font-extrabold text-white font-mono my-1">
                    {slabVolumeM3.toFixed(1)} <span className="text-sm font-normal text-slate-400">m³</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Dry Mix Volume: <strong className="text-slate-200">{slabDryVolumeM3.toFixed(2)} m³</strong>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                    Total TMT Steel Required
                  </span>
                  <div className="text-3xl font-extrabold text-cyan-300 font-mono my-1">
                    {slabTotalSteelKg.toLocaleString()} <span className="text-sm font-normal text-cyan-400/80">kg</span>
                  </div>
                  <span className="text-xs text-cyan-300/80">
                    ({(slabTotalSteelKg / 1000).toFixed(2)} Tonnes Fe550D)
                  </span>
                </div>
              </div>

              {/* Raw Material Output Breakdown */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Cement (50kg Bags)</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">{slabCementBags} Bags</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">~{(slabCementBags * 50) / 1000} Tonnes</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Sand / M-Sand</span>
                  <span className="text-lg font-bold text-slate-200 font-mono">{slabSandM3} m³</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Zone II Sand</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Aggregate (10/20mm)</span>
                  <span className="text-lg font-bold text-slate-200 font-mono">{slabAggM3} m³</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Crushed Basalt</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Formula Example: 20m × 10m × 0.15m = <strong>30 m³</strong> approved slab pour
              </span>
              <span className="font-bold text-cyan-400">IS 456 Standard</span>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: COLUMN CALCULATOR --- */}
      {activeRCCTab === 'COLUMN' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
              <Calculator className="h-4 w-4 text-cyan-400" />
              Column Schedule & Reinforcement
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Number of Columns</label>
                  <input
                    type="number"
                    value={colCount}
                    onChange={(e) => setColCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Floor Height (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={colHeight}
                    onChange={(e) => setColHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Width (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={colWidth}
                    onChange={(e) => setColWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Breadth (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={colBreadth}
                    onChange={(e) => setColBreadth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Vertical Main Bars & Lateral Ties
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Main Bars Count</label>
                    <input
                      type="number"
                      value={colMainBarsCount}
                      onChange={(e) => setColMainBarsCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Main Bar Dia (mm)</label>
                    <select
                      value={colMainDia}
                      onChange={(e) => setColMainDia(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    >
                      <option value={16}>16 mm</option>
                      <option value={20}>20 mm</option>
                      <option value={25}>25 mm</option>
                      <option value={32}>32 mm</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Lateral Tie Dia (mm)</label>
                    <select
                      value={colStirrupDia}
                      onChange={(e) => setColStirrupDia(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    >
                      <option value={8}>8 mm</option>
                      <option value={10}>10 mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tie Spacing (mm)</label>
                    <input
                      type="number"
                      value={colStirrupSpacingMm}
                      onChange={(e) => setColStirrupSpacingMm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
              <Box className="h-4 w-4 text-cyan-400" />
              Column Materials & Steel Output
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Concrete Volume</span>
                <div className="text-3xl font-extrabold text-white font-mono my-1">
                  {colTotalVolumeM3.toFixed(2)} <span className="text-sm font-normal text-slate-400">m³</span>
                </div>
                <span className="text-xs text-slate-400">
                  {colCount} Columns ({colWidth * 1000}mm × {colBreadth * 1000}mm)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">Total Column Steel</span>
                <div className="text-3xl font-extrabold text-cyan-300 font-mono my-1">
                  {colGrandSteelKg.toLocaleString()} <span className="text-sm font-normal text-cyan-400/80">kg</span>
                </div>
                <span className="text-xs text-cyan-300/80">
                  Main: {colTotalMainSteelKg}kg • Stirrups: {colTotalStirrupsSteelKg}kg
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Cement (50kg)</span>
                <span className="text-base font-bold text-amber-400 font-mono">{colCementBags} Bags</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Sand M-Sand</span>
                <span className="text-base font-bold text-slate-200 font-mono">{colSandM3} m³</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">10/20mm Agg</span>
                <span className="text-base font-bold text-slate-200 font-mono">{colAggM3} m³</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: BEAM & FOOTING SHORTCUTS --- */}
      {activeRCCTab === 'BEAM' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Continuous & Simply Supported Beams Quantity
            </h3>
            <span className="text-xs text-cyan-400 font-mono font-bold">
              Total Volume: {beamTotalVolumeM3.toFixed(2)} m³ • Total Steel: {beamTotalSteelKg.toLocaleString()} kg
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Beams</span>
              <span className="text-xl font-extrabold text-white font-mono">{beamCount} Spans</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Cement Bags</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">{beamCementBags} Bags</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Sand + Agg</span>
              <span className="text-xl font-extrabold text-slate-200 font-mono">{beamSandM3 + beamAggM3} m³</span>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-[10px] font-bold text-cyan-400 uppercase block">TMT Steel</span>
              <span className="text-xl font-extrabold text-cyan-300 font-mono">{(beamTotalSteelKg / 1000).toFixed(2)} T</span>
            </div>
          </div>
        </div>
      )}

      {activeRCCTab === 'FOOTING' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Isolated & Combined Footing Substructure
            </h3>
            <span className="text-xs text-cyan-400 font-mono font-bold">
              Total Volume: {ftgTotalVolumeM3.toFixed(2)} m³ • Mesh Steel: {ftgTotalSteelKg.toLocaleString()} kg
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Footing Count</span>
              <span className="text-xl font-extrabold text-white font-mono">{ftgCount} Nos</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Cement Required</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">{ftgCementBags} Bags</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Sand Volume</span>
              <span className="text-xl font-extrabold text-slate-200 font-mono">{ftgSandM3} m³</span>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-[10px] font-bold text-cyan-400 uppercase block">Rebar Mesh Weight</span>
              <span className="text-xl font-extrabold text-cyan-300 font-mono">{ftgTotalSteelKg} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: MIX DESIGN TABLE --- */}
      {activeRCCTab === 'MIX_DESIGN' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="h-4 w-4 text-amber-400" />
            Approved Project Standard Concrete Mix Designs (IS 10262)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Concrete Grade</th>
                  <th className="py-3 px-3">Nominal / Design Ratio</th>
                  <th className="py-3 px-3">Cement Bags / m³</th>
                  <th className="py-3 px-3">Sand (Zone II)</th>
                  <th className="py-3 px-3">Aggregate 20mm/10mm</th>
                  <th className="py-3 px-3">Target Compressive 28D</th>
                  <th className="py-3 px-3">Typical Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                <tr>
                  <td className="py-3 px-3 font-bold text-white">M15</td>
                  <td className="py-3 px-3 text-slate-400">1 : 2 : 4</td>
                  <td className="py-3 px-3 font-bold text-amber-400">6.3 Bags</td>
                  <td className="py-3 px-3 text-slate-300">0.44 m³</td>
                  <td className="py-3 px-3 text-slate-300">0.88 m³</td>
                  <td className="py-3 px-3 text-emerald-400">20.8 MPa</td>
                  <td className="py-3 px-3 font-sans text-slate-400">PCC Levelling, Kerbs, Bedding</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">M20</td>
                  <td className="py-3 px-3 text-slate-400">1 : 1.5 : 3</td>
                  <td className="py-3 px-3 font-bold text-amber-400">8.2 Bags</td>
                  <td className="py-3 px-3 text-slate-300">0.43 m³</td>
                  <td className="py-3 px-3 text-slate-300">0.86 m³</td>
                  <td className="py-3 px-3 text-emerald-400">26.6 MPa</td>
                  <td className="py-3 px-3 font-sans text-slate-400">General Slab, Beams, Lintels</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">M25</td>
                  <td className="py-3 px-3 text-slate-400">1 : 1 : 2</td>
                  <td className="py-3 px-3 font-bold text-amber-400">11.1 Bags</td>
                  <td className="py-3 px-3 text-slate-300">0.39 m³</td>
                  <td className="py-3 px-3 text-slate-300">0.78 m³</td>
                  <td className="py-3 px-3 text-emerald-400">31.6 MPa</td>
                  <td className="py-3 px-3 font-sans text-slate-400">High-Rise Slabs, Water Tanks, Retaining Walls</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-white">M30</td>
                  <td className="py-3 px-3 text-cyan-300">Design Mix (RMC)</td>
                  <td className="py-3 px-3 font-bold text-amber-400">8.4 Bags + Admix</td>
                  <td className="py-3 px-3 text-slate-300">680 kg M-Sand</td>
                  <td className="py-3 px-3 text-slate-300">1150 kg Basalt</td>
                  <td className="py-3 px-3 text-emerald-400">38.2 MPa</td>
                  <td className="py-3 px-3 font-sans text-slate-400">Heavily loaded columns & transfer girders</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
