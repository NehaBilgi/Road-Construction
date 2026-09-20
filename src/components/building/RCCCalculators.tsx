import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Box,
  Layers,
  CheckCircle2,
  Trash2,
  Save,
  Plus
} from 'lucide-react';

type RCCTab = 'FOOTING' | 'COLUMN' | 'BEAM' | 'SLAB' | 'MIX_DESIGN';

interface SavedCalc {
  id: string;
  name: string;
  element: string;
  dims: string;
  vol: string;
  primaryMetric: string;
  secondaryMetric: string;
}

export const BuildingCalculatorModule: React.FC = () => {
  const [activeRCCTab, setActiveRCCTab] = useState<RCCTab>('SLAB');
  const [siteName, setSiteName] = useState<string>('FATIMA COMPLEX');
  const [savedCalcs, setSavedCalcs] = useState<SavedCalc[]>([]);

  // --- 1. SLAB STATE & CALCULATIONS ---
  const [slabLength, setSlabLength] = useState<number>(20.0);
  const [slabWidth, setSlabWidth] = useState<number>(10.0);
  const [slabThickness, setSlabThickness] = useState<number>(0.15); // 150mm
  const [slabGrade, setSlabGrade] = useState<string>('M25');
  const [slabMainDia, setSlabMainDia] = useState<number>(10);
  const [slabMainSpacingMm, setSlabMainSpacingMm] = useState<number>(150);
  const [slabDistDia, setSlabDistDia] = useState<number>(8);
  const [slabDistSpacingMm, setSlabDistSpacingMm] = useState<number>(175);

  const slabVolumeM3 = slabLength * slabWidth * slabThickness;
  const slabDryVolumeM3 = slabVolumeM3 * 1.54;
  const slabCementBags = Math.round((slabDryVolumeM3 * (1 / 4) * 1440) / 50);
  const slabSandM3 = Number(((slabDryVolumeM3 * 1) / 4).toFixed(2));
  const slabAggM3 = Number(((slabDryVolumeM3 * 2) / 4).toFixed(2));

  const slabNumMainBars = Math.floor((slabWidth * 1000) / slabMainSpacingMm) + 1;
  const slabMainBarLength = slabLength + 0.3;
  const slabMainSteelKg = Number((slabNumMainBars * slabMainBarLength * ((slabMainDia * slabMainDia) / 162)).toFixed(1));

  const slabNumDistBars = Math.floor((slabLength * 1000) / slabDistSpacingMm) + 1;
  const slabDistBarLength = slabWidth + 0.3;
  const slabDistSteelKg = Number((slabNumDistBars * slabDistBarLength * ((slabDistDia * slabDistDia) / 162)).toFixed(1));
  const slabTotalSteelKg = slabMainSteelKg + slabDistSteelKg;

  // --- 2. COLUMN STATE & CALCULATIONS ---
  const [colCount, setColCount] = useState<number>(12);
  const [colWidth, setColWidth] = useState<number>(0.30);
  const [colBreadth, setColBreadth] = useState<number>(0.60);
  const [colHeight, setColHeight] = useState<number>(3.30);
  const [colMainBarsCount, setColMainBarsCount] = useState<number>(8);
  const [colMainDia, setColMainDia] = useState<number>(20);
  const [colStirrupDia, setColStirrupDia] = useState<number>(8);
  const [colStirrupSpacingMm, setColStirrupSpacingMm] = useState<number>(150);

  const colTotalVolumeM3 = colCount * (colWidth * colBreadth * colHeight);
  const colDryVolumeM3 = colTotalVolumeM3 * 1.54;
  const colCementBags = Math.round((colDryVolumeM3 * (1 / 3.5) * 1440) / 50);
  const colSandM3 = Number(((colDryVolumeM3 * 1) / 3.5).toFixed(2));
  const colAggM3 = Number(((colDryVolumeM3 * 1.5) / 3.5).toFixed(2));

  const colMainBarLength = colHeight + 0.8;
  const colTotalMainSteelKg = Number(
    (colCount * colMainBarsCount * colMainBarLength * ((colMainDia * colMainDia) / 162)).toFixed(1)
  );
  const colPerimeter = 2 * (colWidth - 0.08 + (colBreadth - 0.08)) + 0.20;
  const colStirrupsPerCol = Math.floor((colHeight * 1000) / colStirrupSpacingMm) + 1;
  const colTotalStirrupsSteelKg = Number(
    (colCount * colStirrupsPerCol * colPerimeter * ((colStirrupDia * colStirrupDia) / 162)).toFixed(1)
  );
  const colGrandSteelKg = colTotalMainSteelKg + colTotalStirrupsSteelKg;

  // --- 3. BEAM STATE & CALCULATIONS ---
  const [beamCount] = useState<number>(8);
  const [beamLength] = useState<number>(6.0);
  const [beamWidth] = useState<number>(0.23);
  const [beamDepth] = useState<number>(0.45);
  const [beamTopBars] = useState<number>(2);
  const [beamTopDia] = useState<number>(16);
  const [beamBottomBars] = useState<number>(3);
  const [beamBottomDia] = useState<number>(20);
  const [beamStirrupDia] = useState<number>(8);
  const [beamStirrupSpacingMm] = useState<number>(125);

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
  const [ftgCount] = useState<number>(16);
  const [ftgLength] = useState<number>(2.4);
  const [ftgWidth] = useState<number>(2.4);
  const [ftgDepth] = useState<number>(0.6);
  const [ftgMeshDia] = useState<number>(12);
  const [ftgMeshSpacingMm] = useState<number>(150);

  const ftgTotalVolumeM3 = ftgCount * (ftgLength * ftgWidth * ftgDepth);
  const ftgDryVol = ftgTotalVolumeM3 * 1.54;
  const ftgCementBags = Math.round((ftgDryVol * (1 / 4) * 1440) / 50);
  const ftgSandM3 = Number(((ftgDryVol * 1) / 4).toFixed(2));
  const ftgAggM3 = Number(((ftgDryVol * 2) / 4).toFixed(2));

  const ftgBarsBothWays = (Math.floor((ftgLength * 1000) / ftgMeshSpacingMm) + 1) * 2;
  const ftgTotalSteelKg = Number(
    (ftgCount * ftgBarsBothWays * (ftgLength + 0.4) * ((ftgMeshDia * ftgMeshDia) / 162)).toFixed(1)
  );

  const handleSaveCalculation = () => {
    let newItem: SavedCalc;
    if (activeRCCTab === 'SLAB') {
      newItem = {
        id: `calc-${Date.now()}`,
        name: siteName,
        element: `Slab (${slabGrade})`,
        dims: `${slabLength}m × ${slabWidth}m × ${slabThickness}m`,
        vol: `${slabVolumeM3.toFixed(2)} m³`,
        primaryMetric: `${slabTotalSteelKg.toLocaleString()} kg Steel`,
        secondaryMetric: `${slabCementBags} Bags Cement`
      };
    } else if (activeRCCTab === 'COLUMN') {
      newItem = {
        id: `calc-${Date.now()}`,
        name: siteName,
        element: `Columns (${colCount} Nos)`,
        dims: `${colWidth}m × ${colBreadth}m × ${colHeight}m`,
        vol: `${colTotalVolumeM3.toFixed(2)} m³`,
        primaryMetric: `${colGrandSteelKg.toLocaleString()} kg Steel`,
        secondaryMetric: `${colCementBags} Bags Cement`
      };
    } else if (activeRCCTab === 'BEAM') {
      newItem = {
        id: `calc-${Date.now()}`,
        name: siteName,
        element: `Beams (${beamCount} Spans)`,
        dims: `${beamLength}m L`,
        vol: `${beamTotalVolumeM3.toFixed(2)} m³`,
        primaryMetric: `${beamTotalSteelKg.toLocaleString()} kg Steel`,
        secondaryMetric: `${beamCementBags} Bags Cement`
      };
    } else {
      newItem = {
        id: `calc-${Date.now()}`,
        name: siteName,
        element: `Footings (${ftgCount} Nos)`,
        dims: `${ftgLength}m × ${ftgWidth}m × ${ftgDepth}m`,
        vol: `${ftgTotalVolumeM3.toFixed(2)} m³`,
        primaryMetric: `${ftgTotalSteelKg.toLocaleString()} kg Steel`,
        secondaryMetric: `${ftgCementBags} Bags Cement`
      };
    }
    setSavedCalcs((prev) => [newItem, ...prev]);
  };

  const currentLiveVolume = useMemo(() => {
    if (activeRCCTab === 'SLAB') return slabVolumeM3.toFixed(2);
    if (activeRCCTab === 'COLUMN') return colTotalVolumeM3.toFixed(2);
    if (activeRCCTab === 'BEAM') return beamTotalVolumeM3.toFixed(2);
    if (activeRCCTab === 'FOOTING') return ftgTotalVolumeM3.toFixed(2);
    return '0.00';
  }, [activeRCCTab, slabVolumeM3, colTotalVolumeM3, beamTotalVolumeM3, ftgTotalVolumeM3]);

  const currentPrimaryMetricValue = useMemo(() => {
    if (activeRCCTab === 'SLAB') return slabTotalSteelKg.toLocaleString();
    if (activeRCCTab === 'COLUMN') return colGrandSteelKg.toLocaleString();
    if (activeRCCTab === 'BEAM') return beamTotalSteelKg.toLocaleString();
    if (activeRCCTab === 'FOOTING') return ftgTotalSteelKg.toLocaleString();
    return '0';
  }, [activeRCCTab, slabTotalSteelKg, colGrandSteelKg, beamTotalSteelKg, ftgTotalSteelKg]);

  const currentSecondaryMetricValue = useMemo(() => {
    if (activeRCCTab === 'SLAB') return slabCementBags.toString();
    if (activeRCCTab === 'COLUMN') return colCementBags.toString();
    if (activeRCCTab === 'BEAM') return beamCementBags.toString();
    if (activeRCCTab === 'FOOTING') return ftgCementBags.toString();
    return '0';
  }, [activeRCCTab, slabCementBags, colCementBags, beamCementBags, ftgCementBags]);

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* Top Banner Header matching image_a7f4a1 style */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <Calculator className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Building RCC Calculator</h1>
        </div>
        <p className="text-xs text-slate-400">
          Calculate structural member concrete volumes, dry proportions, cement/sand/aggregate yields, and rebar weights.
        </p>
      </div>

      {/* Sub-tabs / Structural Element Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-[#0B1220] border border-[#1E293B] p-2 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['SLAB', 'COLUMN', 'BEAM', 'FOOTING', 'MIX_DESIGN'] as RCCTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRCCTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeRCCTab === tab
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                  : 'text-slate-400 hover:text-white bg-[#0e1628]'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="text-[11px] font-mono text-cyan-400 px-3 py-1 rounded-xl bg-cyan-950/40 border border-cyan-800/50">
          IS 456 Structural Standard
        </div>
      </div>

      {activeRCCTab !== 'MIX_DESIGN' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Road Dimension Parameters Style Card */}
          <div className="lg:col-span-5 bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-2.5 text-cyan-400 pb-3 border-b border-[#1E293B]">
              <Calculator className="w-5 h-5" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {activeRCCTab} Dimension Parameters
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Site Name *</label>
                <select
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white outline-none focus:border-cyan-500 font-bold cursor-pointer"
                >
                  <option value="FATIMA COMPLEX">FATIMA COMPLEX</option>
                  <option value="BLOCK A FOUNDATION">BLOCK A FOUNDATION</option>
                  <option value="TOWER B PODIUM">TOWER B PODIUM</option>
                </select>
              </div>

              {activeRCCTab === 'SLAB' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Road/Slab Length (m) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={slabLength}
                        onChange={(e) => setSlabLength(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Road/Slab Width (m) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={slabWidth}
                        onChange={(e) => setSlabWidth(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Thickness (m) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={slabThickness}
                        onChange={(e) => setSlabThickness(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-cyan-400 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Concrete Grade *</label>
                      <select
                        value={slabGrade}
                        onChange={(e) => setSlabGrade(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-bold cursor-pointer"
                      >
                        <option value="M20">M20 (1:1.5:3)</option>
                        <option value="M25">M25 (1:1:2)</option>
                        <option value="M30">M30 (Design Mix)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#080d19] border border-[#1E293B] space-y-3">
                    <div className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Rebar Detailing</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1">Main Bar Dia (mm)</label>
                        <select
                          value={slabMainDia}
                          onChange={(e) => setSlabMainDia(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                        >
                          <option value={8}>8 mm</option>
                          <option value={10}>10 mm</option>
                          <option value={12}>12 mm</option>
                          <option value={16}>16 mm</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Spacing (mm)</label>
                        <input
                          type="number"
                          value={slabMainSpacingMm}
                          onChange={(e) => setSlabMainSpacingMm(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeRCCTab === 'COLUMN' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">No. of Columns *</label>
                      <input
                        type="number"
                        value={colCount}
                        onChange={(e) => setColCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Floor Height (m) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={colHeight}
                        onChange={(e) => setColHeight(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Width (m) *</label>
                      <input
                        type="number"
                        step="0.05"
                        value={colWidth}
                        onChange={(e) => setColWidth(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Breadth (m) *</label>
                      <input
                        type="number"
                        step="0.05"
                        value={colBreadth}
                        onChange={(e) => setColBreadth(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeRCCTab !== 'SLAB' && activeRCCTab !== 'COLUMN' && (
                <div className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] text-slate-300">
                  <div className="font-bold text-white mb-1">Standard Element Profile Active</div>
                  <p className="text-slate-400 text-[11px]">
                    Using default multi-span configuration ({activeRCCTab === 'BEAM' ? `${beamCount} beams @ ${beamLength}m` : `${ftgCount} footings`}). Switch to Slab/Column for live custom dimensions.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveCalculation}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Save Section Calculation</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Live Yield Output & Saved Calculations matching reference card structure */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Yield Output Container matching image_a7f4a1 top-right card */}
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Live Yield Output</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume</span>
                  <div className="text-3xl font-black text-white font-mono mt-1.5">
                    {currentLiveVolume}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">Cu.m</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#080d19] border border-cyan-500/30">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Total Steel Rebar</span>
                  <div className="text-3xl font-black text-cyan-300 font-mono mt-1.5">
                    {currentPrimaryMetricValue}
                  </div>
                  <span className="text-[11px] text-cyan-400/80 font-mono mt-1 block">kg Required</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cement Requirement</span>
                  <div className="text-3xl font-black text-amber-400 font-mono mt-1.5">
                    {currentSecondaryMetricValue}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">50kg Bags</span>
                </div>
              </div>

              {/* Sub-breakdown chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#080d19] border border-[#1E293B] text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Sand / M-Sand</span>
                  <span className="font-mono font-bold text-slate-200">
                    {activeRCCTab === 'SLAB' ? slabSandM3 : activeRCCTab === 'COLUMN' ? colSandM3 : activeRCCTab === 'BEAM' ? beamSandM3 : ftgSandM3} m³
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#080d19] border border-[#1E293B] text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Aggregate 20mm/10mm</span>
                  <span className="font-mono font-bold text-slate-200">
                    {activeRCCTab === 'SLAB' ? slabAggM3 : activeRCCTab === 'COLUMN' ? colAggM3 : activeRCCTab === 'BEAM' ? beamAggM3 : ftgAggM3} m³
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#080d19] border border-[#1E293B] text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Dry Mix Factor</span>
                  <span className="font-mono font-bold text-cyan-400">× 1.54 IS Standard</span>
                </div>
              </div>
            </div>

            {/* Saved Calculations Table Card matching image_a7f4a1 bottom-right card */}
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Saved Calculations</h2>
                <span className="text-xs font-mono text-slate-400">{savedCalcs.length} Records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80">
                      <th className="py-3 px-3">SITE & MAT.</th>
                      <th className="py-3 px-3">DIMS / ELEMENT</th>
                      <th className="py-3 px-3 text-right">VOL (CU.M)</th>
                      <th className="py-3 px-3 text-right text-cyan-400">STEEL</th>
                      <th className="py-3 px-3 text-right text-amber-400">CEMENT</th>
                      <th className="py-3 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 text-slate-200 font-mono">
                    {savedCalcs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500 font-sans text-xs">
                          No saved calculations yet. Click "+ Save Section Calculation".
                        </td>
                      </tr>
                    ) : (
                      savedCalcs.map((item) => (
                        <tr key={item.id} className="hover:bg-[#121c33]/50 transition-colors">
                          <td className="py-3 px-3 font-sans font-bold text-white">
                            <div>{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{item.element}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">{item.dims}</td>
                          <td className="py-3 px-3 text-right text-white font-bold">{item.vol}</td>
                          <td className="py-3 px-3 text-right text-cyan-300 font-bold">{item.primaryMetric}</td>
                          <td className="py-3 px-3 text-right text-amber-400 font-bold">{item.secondaryMetric}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSavedCalcs(savedCalcs.filter((s) => s.id !== item.id))}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- TAB 5: MIX DESIGN TABLE --- */
        <div className="p-6 rounded-3xl bg-[#0B1220] border border-[#1E293B] shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
            <Layers className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Approved Project Standard Concrete Mix Designs (IS 10262)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 uppercase text-[10px] tracking-wider bg-[#080d19]/80">
                  <th className="py-3.5 px-4">Concrete Grade</th>
                  <th className="py-3.5 px-4">Nominal / Design Ratio</th>
                  <th className="py-3.5 px-4">Cement Bags / m³</th>
                  <th className="py-3.5 px-4">Sand (Zone II)</th>
                  <th className="py-3.5 px-4">Aggregate 20mm/10mm</th>
                  <th className="py-3.5 px-4">Target Compressive 28D</th>
                  <th className="py-3.5 px-4">Typical Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-200 font-mono">
                <tr className="hover:bg-[#121c33]/40">
                  <td className="py-3.5 px-4 font-bold text-white">M15</td>
                  <td className="py-3.5 px-4 text-slate-400">1 : 2 : 4</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">6.3 Bags</td>
                  <td className="py-3.5 px-4 text-slate-300">0.44 m³</td>
                  <td className="py-3.5 px-4 text-slate-300">0.88 m³</td>
                  <td className="py-3.5 px-4 text-emerald-400">20.8 MPa</td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">PCC Levelling, Kerbs, Bedding</td>
                </tr>
                <tr className="hover:bg-[#121c33]/40">
                  <td className="py-3.5 px-4 font-bold text-white">M20</td>
                  <td className="py-3.5 px-4 text-slate-400">1 : 1.5 : 3</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">8.2 Bags</td>
                  <td className="py-3.5 px-4 text-slate-300">0.43 m³</td>
                  <td className="py-3.5 px-4 text-slate-300">0.86 m³</td>
                  <td className="py-3.5 px-4 text-emerald-400">26.6 MPa</td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">General Slab, Beams, Lintels</td>
                </tr>
                <tr className="hover:bg-[#121c33]/40">
                  <td className="py-3.5 px-4 font-bold text-white">M25</td>
                  <td className="py-3.5 px-4 text-slate-400">1 : 1 : 2</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">11.1 Bags</td>
                  <td className="py-3.5 px-4 text-slate-300">0.39 m³</td>
                  <td className="py-3.5 px-4 text-slate-300">0.78 m³</td>
                  <td className="py-3.5 px-4 text-emerald-400">31.6 MPa</td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">High-Rise Slabs, Water Tanks, Retaining Walls</td>
                </tr>
                <tr className="hover:bg-[#121c33]/40">
                  <td className="py-3.5 px-4 font-bold text-white">M30</td>
                  <td className="py-3.5 px-4 text-cyan-300">Design Mix (RMC)</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">8.4 Bags + Admix</td>
                  <td className="py-3.5 px-4 text-slate-300">680 kg M-Sand</td>
                  <td className="py-3.5 px-4 text-slate-300">1150 kg Basalt</td>
                  <td className="py-3.5 px-4 text-emerald-400">38.2 MPa</td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">Heavily loaded columns & transfer girders</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
