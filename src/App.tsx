import React, { useState, useEffect, useMemo } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoadERPProvider } from './context/RoadERPContext';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectTypeSelectionPage } from './components/auth/ProjectTypeSelectionPage';
import { SiteSelectionPage } from './components/auth/SiteSelectionPage';

import { SiteCentricMidnightDashboard } from './components/dashboard/SiteCentricMidnightDashboard';
import { RoadSitesManagerModule } from './components/sites/RoadSitesManagerModule';
import { MaterialHaulageTripsModule } from './components/trips/MaterialHaulageTripsModule';
import { VendorAdvancesModule } from './components/VendorAdvancesModule';
import { DieselFuelManagementModule } from './components/diesel/DieselFuelManagementModule';
import { SiteCostExpensesModule } from './components/costing/SiteCostExpensesModule';
import { RoadYieldCalculatorModule } from './components/calculator/RoadYieldCalculatorModule';
import { MachineryFleetModule } from './components/machinery/MachineryFleetModule';
import StockTransactionsModule from './components/building/StockTransactionsModule';
import { InstallAppButton } from './components/InstallAppButton';
import { ThemeToggle } from './components/ThemeToggle';
import { UserManagementModule } from './components/configuration/UserManagementModule';

import {
  LayoutDashboard, Truck, Fuel, DollarSign, Calculator, HardHat,
  LogOut, Milestone, Users, Package, ArrowLeftRight, FileText,
  Bell, ShoppingCart, Cpu, CalendarCheck, Tag, Archive, Building2,
  X, Plus, Edit2, Trash2, Menu, ChevronDown, Check, CreditCard,
  Layers
} from 'lucide-react';

// ==========================================
// Generic Scaffold View for Pending Tabs
// ==========================================
const GenericView: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ title, subtitle, icon: Icon }) => (
  <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-2xl space-y-4 font-sans text-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
    <div className="p-8 rounded-2xl bg-[#080d19] border border-[#182643] text-center text-slate-400 text-xs">
      {title} telemetry and operations active.
    </div>
  </div>
);

// ==========================================
// Building RCC Calculator Module (Styled like Photo 1)
// ==========================================
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

export const RCCCalculators: React.FC = () => {
  const [activeRCCTab, setActiveRCCTab] = useState<RCCTab>('SLAB');
  const [siteName, setSiteName] = useState<string>('FATIMA COMPLEX');
  const [savedCalcs, setSavedCalcs] = useState<SavedCalc[]>([]);

  // Slab State
  const [slabLength, setSlabLength] = useState<number>(20.0);
  const [slabWidth, setSlabWidth] = useState<number>(10.0);
  const [slabThickness, setSlabThickness] = useState<number>(0.15);
  const [slabGrade, setSlabGrade] = useState<string>('M25');
  const [slabMainDia, setSlabMainDia] = useState<number>(10);
  const [slabMainSpacingMm, setSlabMainSpacingMm] = useState<number>(150);

  // Column State
  const [colCount, setColCount] = useState<number>(12);
  const [colWidth, setColWidth] = useState<number>(0.30);
  const [colBreadth, setColBreadth] = useState<number>(0.60);
  const [colHeight, setColHeight] = useState<number>(3.30);
  const [colMainBarsCount, setColMainBarsCount] = useState<number>(8);
  const [colMainDia, setColMainDia] = useState<number>(20);

  // Beam State
  const [beamCount] = useState<number>(8);
  const [beamLength] = useState<number>(6.0);
  const [beamWidth] = useState<number>(0.23);
  const [beamDepth] = useState<number>(0.45);

  // Footing State
  const [ftgCount] = useState<number>(16);
  const [ftgLength] = useState<number>(2.4);
  const [ftgWidth] = useState<number>(2.4);
  const [ftgDepth] = useState<number>(0.6);

  // Derivations
  const slabVolumeM3 = slabLength * slabWidth * slabThickness;
  const slabDryVolumeM3 = slabVolumeM3 * 1.54;
  const slabCementBags = Math.round((slabDryVolumeM3 * (1 / 4) * 1440) / 50);
  const slabSandM3 = Number(((slabDryVolumeM3 * 1) / 4).toFixed(2));
  const slabAggM3 = Number(((slabDryVolumeM3 * 2) / 4).toFixed(2));
  const slabNumMainBars = Math.floor((slabWidth * 1000) / slabMainSpacingMm) + 1;
  const slabMainSteelKg = Number((slabNumMainBars * (slabLength + 0.3) * ((slabMainDia * slabMainDia) / 162)).toFixed(1));

  const colTotalVolumeM3 = colCount * (colWidth * colBreadth * colHeight);
  const colDryVolumeM3 = colTotalVolumeM3 * 1.54;
  const colCementBags = Math.round((colDryVolumeM3 * (1 / 3.5) * 1440) / 50);
  const colSandM3 = Number(((colDryVolumeM3 * 1) / 3.5).toFixed(2));
  const colAggM3 = Number(((colDryVolumeM3 * 1.5) / 3.5).toFixed(2));
  const colGrandSteelKg = Number((colCount * colMainBarsCount * (colHeight + 0.8) * ((colMainDia * colMainDia) / 162)).toFixed(1));

  const beamTotalVolumeM3 = beamCount * (beamLength * beamWidth * beamDepth);
  const beamDryVol = beamTotalVolumeM3 * 1.54;
  const beamCementBags = Math.round((beamDryVol * (1 / 4) * 1440) / 50);
  const beamSandM3 = Number(((beamDryVol * 1) / 4).toFixed(2));
  const beamAggM3 = Number(((beamDryVol * 2) / 4).toFixed(2));
  const beamTotalSteelKg = 1450;

  const ftgTotalVolumeM3 = ftgCount * (ftgLength * ftgWidth * ftgDepth);
  const ftgDryVol = ftgTotalVolumeM3 * 1.54;
  const ftgCementBags = Math.round((ftgDryVol * (1 / 4) * 1440) / 50);
  const ftgSandM3 = Number(((ftgDryVol * 1) / 4).toFixed(2));
  const ftgAggM3 = Number(((ftgDryVol * 2) / 4).toFixed(2));
  const ftgTotalSteelKg = 2100;

  const currentLiveVolume = useMemo(() => {
    if (activeRCCTab === 'SLAB') return slabVolumeM3.toFixed(2);
    if (activeRCCTab === 'COLUMN') return colTotalVolumeM3.toFixed(2);
    if (activeRCCTab === 'BEAM') return beamTotalVolumeM3.toFixed(2);
    if (activeRCCTab === 'FOOTING') return ftgTotalVolumeM3.toFixed(2);
    return '0.00';
  }, [activeRCCTab, slabVolumeM3, colTotalVolumeM3, beamTotalVolumeM3, ftgTotalVolumeM3]);

  const primaryMetricValue = useMemo(() => {
    if (activeRCCTab === 'SLAB') return `${slabMainSteelKg.toLocaleString()}`;
    if (activeRCCTab === 'COLUMN') return `${colGrandSteelKg.toLocaleString()}`;
    if (activeRCCTab === 'BEAM') return `${beamTotalSteelKg.toLocaleString()}`;
    if (activeRCCTab === 'FOOTING') return `${ftgTotalSteelKg.toLocaleString()}`;
    return '0';
  }, [activeRCCTab, slabMainSteelKg, colGrandSteelKg, beamTotalSteelKg, ftgTotalSteelKg]);

  const secondaryMetricValue = useMemo(() => {
    if (activeRCCTab === 'SLAB') return `${slabCementBags}`;
    if (activeRCCTab === 'COLUMN') return `${colCementBags}`;
    if (activeRCCTab === 'BEAM') return `${beamCementBags}`;
    if (activeRCCTab === 'FOOTING') return `${ftgCementBags}`;
    return '0';
  }, [activeRCCTab, slabCementBags, colCementBags, beamCementBags, ftgCementBags]);

  const handleSaveCalculation = () => {
    const newItem: SavedCalc = {
      id: `calc-${Date.now()}`,
      name: siteName,
      element: `${activeRCCTab} Element`,
      dims: activeRCCTab === 'SLAB' ? `${slabLength}×${slabWidth}×${slabThickness}` : `${colCount} Units`,
      vol: `${currentLiveVolume} m³`,
      primaryMetric: `${primaryMetricValue} kg`,
      secondaryMetric: `${secondaryMetricValue} Bags`
    };
    setSavedCalcs((prev) => [newItem, ...prev]);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Building RCC Calculator</h1>
            <p className="text-xs text-slate-400">Calculate layer yields, material requirements, and structural rebar quantities[cite: 3].</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-[#0b1322] border border-[#1e293b] rounded-2xl w-fit flex-wrap">
        {(['SLAB', 'COLUMN', 'BEAM', 'FOOTING', 'MIX_DESIGN'] as RCCTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveRCCTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRCCTab === tab
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {activeRCCTab !== 'MIX_DESIGN' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Dimension Parameters matching Photo 1 */}
          <div className="lg:col-span-5 bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-2 text-cyan-400 pb-3 border-b border-[#1E293B]">
              <Calculator className="w-4 h-4" />
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

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Element Specification</label>
                <div className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-cyan-400 font-bold font-mono">
                  RCC {activeRCCTab} structural section
                </div>
              </div>

              {activeRCCTab === 'SLAB' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Slab Length (m) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={slabLength}
                        onChange={(e) => setSlabLength(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Slab Width (m) *</label>
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
                  <div className="font-bold text-white mb-1">Standard Multi-span Profile</div>
                  <p className="text-slate-400 text-[11px]">
                    Configured for {activeRCCTab === 'BEAM' ? `${beamCount} span continuous beams` : `${ftgCount} isolated footings`} substructure survey.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveCalculation}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/30 transition-all uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>SAVE SECTION CALCULATION</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Live Yield Output & Saved Calculations matching Photo 1 */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-5">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Live Yield Output</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#080d19] border border-[#1E293B]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL VOLUME</span>
                  <div className="text-3xl font-black text-white font-mono mt-2">
                    {currentLiveVolume}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">Cu.m[cite: 3]</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#080d19] border border-[#1E293B]">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">TOTAL STEEL REBAR</span>
                  <div className="text-3xl font-black text-cyan-300 font-mono mt-2">
                    {primaryMetricValue}
                  </div>
                  <span className="text-[11px] text-cyan-400/80 font-mono mt-1 block">kg Required</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#080d19] border border-[#1E293B]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CEMENT REQUIRED</span>
                  <div className="text-3xl font-black text-amber-400 font-mono mt-2">
                    {secondaryMetricValue}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">50kg Bags</span>
                </div>
              </div>
            </div>

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
                      <th className="py-3 px-3">DIMS (L×W×T)</th>
                      <th className="py-3 px-3 text-right">VOL (CU.M)</th>
                      <th className="py-3 px-3 text-right text-cyan-400">STEEL</th>
                      <th className="py-3 px-3 text-right text-amber-400">CEMENT</th>
                      <th className="py-3 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 text-slate-200 font-mono">
                    {savedCalcs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 font-sans text-xs">
                          No saved calculations yet.
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
        /* Mix Design Reference Table */
        <div className="p-6 rounded-3xl bg-[#0B1220] border border-[#1E293B] shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
            <Layers className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Approved Concrete Mix Designs (IS 10262)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 uppercase text-[10px] tracking-wider bg-[#080d19]/80">
                  <th className="py-3.5 px-4">Concrete Grade</th>
                  <th className="py-3.5 px-4">Nominal Ratio</th>
                  <th className="py-3.5 px-4">Cement Bags / m³</th>
                  <th className="py-3.5 px-4">Sand (Zone II)</th>
                  <th className="py-3.5 px-4">Aggregate 20mm/10mm</th>
                  <th className="py-3.5 px-4">Target Compressive 28D</th>
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
                </tr>
                <tr className="hover:bg-[#121c33]/40">
                  <td className="py-3.5 px-4 font-bold text-white">M20</td>
                  <td className="py-3.5 px-4 text-slate-400">1 : 1.5 : 3</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">8.2 Bags</td>
                  <td className="py-3.5 px-4 text-slate-300">0.43 m³</td>
                  <td className="py-3.5 px-4 text-slate-300">0.86 m³</td>
                  <td className="py-3.5 px-4 text-emerald-400">26.6 MPa</td>
                </tr>
                <tr className="hover:bg-[#121c33]/40">
                  <td className="py-3.5 px-4 font-bold text-white">M25</td>
                  <td className="py-3.5 px-4 text-slate-400">1 : 1 : 2</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">11.1 Bags</td>
                  <td className="py-3.5 px-4 text-slate-300">0.39 m³</td>
                  <td className="py-3.5 px-4 text-slate-300">0.78 m³</td>
                  <td className="py-3.5 px-4 text-emerald-400">31.6 MPa</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Header Component with Mobile Menu Toggle
// ==========================================
interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { selectedSiteId, setSelectedSiteId, siteSheets = [], logout } = useERP() as any;
  const [isSiteOpen, setIsSiteOpen] = useState(false);
  const currentSiteSheet = siteSheets.find((s: any) => s.siteId === selectedSiteId) || siteSheets[0];

  return (
    <header className="h-14 bg-[#080C14] border-b border-[#1E293B] flex items-center justify-between px-3 sm:px-4 text-xs select-none font-sans z-40 relative">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onToggleSidebar && onToggleSidebar()}
          className="p-2 lg:hidden rounded-xl bg-[#121927] hover:bg-[#162032] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsSiteOpen(!isSiteOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#121927] hover:bg-[#162032] border border-[#1E293B] rounded-xl text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-mono text-blue-400 truncate max-w-[120px] sm:max-w-[200px]">
              {currentSiteSheet ? currentSiteSheet.siteName : 'Select Site'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          </button>

          {isSiteOpen && (
            <div className="absolute left-0 mt-2 w-[280px] sm:w-80 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50">
              <div className="px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] border-b border-[#1E293B] flex items-center justify-between">
                <span>Active Sites</span>
                <span className="text-blue-400 font-mono">{siteSheets.length} Sites</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {siteSheets.map((s: any) => (
                  <div
                    key={s.siteId}
                    className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#162032] transition-colors ${
                      selectedSiteId === s.siteId ? 'bg-[#162032]/60' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSiteId(s.siteId);
                        setIsSiteOpen(false);
                      }}
                      className="flex-1 text-left cursor-pointer truncate"
                    >
                      <div className={`font-semibold truncate ${selectedSiteId === s.siteId ? 'text-blue-400 font-bold' : 'text-white'}`}>
                        {s.siteName}
                      </div>
                    </button>
                    {selectedSiteId === s.siteId && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <InstallAppButton />
        <ThemeToggle />
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to log out?')) {
              logout();
            }
          }}
          title="Sign out"
          className="px-2.5 py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline text-[11px] font-semibold">Logout</span>
        </button>
      </div>
    </header>
  );
};

// ==========================================
// Sidebar Component
// ==========================================
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectType?: 'ROAD' | 'BUILDING';
  onSwitchDomain?: () => void;
  isAdminUser?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeStyle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  projectType = 'ROAD',
  onSwitchDomain,
  isAdminUser = false,
  onClose
}) => {
  const { currentUser, logout } = useERP() as any;
  const isBuilding = projectType === 'BUILDING';

  const roadOperationsItems: NavItem[] = [
    { id: 'dashboard', label: 'Site Overview', icon: LayoutDashboard },
    { id: 'road-sites', label: 'Ongoing Site', icon: Milestone, badge: 'Sites', badgeStyle: 'bg-blue-900/40 text-blue-300 border border-blue-500/40' },
    { id: 'haulage-trips', label: 'Trips', icon: Truck, badge: 'Trips', badgeStyle: 'bg-[#064E3B] text-[#34D399] border border-[#065F46]' },
    { id: 'vendor-advances', label: 'Vendor Advance', icon: CreditCard, badge: 'Advance', badgeStyle: 'bg-amber-950/80 text-amber-400 border border-amber-800/60' },
    { id: 'diesel', label: 'Diesel', icon: Fuel, badge: 'Diesel', badgeStyle: 'bg-amber-950/60 text-amber-300 border border-amber-800' },
    { id: 'site-expenses', label: 'Site Expense', icon: DollarSign, badge: 'Petty Cash', badgeStyle: 'bg-[#162032] text-blue-400 border border-[#1E293B]' }
  ];

  const roadEngineeringItems: NavItem[] = [
    { id: 'yield_calculator', label: 'Road Trip Calculator', icon: Calculator, badge: 'MoRTH', badgeStyle: 'bg-blue-900/60 text-blue-300 border border-blue-500/40 font-mono' },
    { id: 'machinery_fleet', label: 'Machinery', icon: HardHat }
  ];

  const roadConfigItems: NavItem[] = [
    { id: 'categories', label: 'Categories', icon: Tag, badge: 'Rates', badgeStyle: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' },
    { id: 'users', label: 'User Management', icon: Users, badge: 'RBAC', badgeStyle: 'bg-indigo-900/40 text-indigo-300 border border-indigo-500/40' }
  ];

  const buildingCoreItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'road-sites', label: 'Ongoing Site', icon: Milestone, badge: 'Sites', badgeStyle: 'bg-emerald-950 text-emerald-400 border border-emerald-800' },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight }
  ];

  const buildingAnalysisItems: NavItem[] = [
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'building_calculator', label: 'RCC Calculator', icon: Calculator, badge: 'IS 456', badgeStyle: 'bg-cyan-950/60 text-cyan-300 border border-cyan-800 font-mono' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 3, badgeStyle: 'bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black' },
    { id: 'reorder-suggestions', label: 'Reorder Suggestions', icon: ShoppingCart },
    { id: 'equipment-register', label: 'Equipment Register', icon: Cpu },
    { id: 'attendance-salary', label: 'Attendance & Salary', icon: CalendarCheck }
  ];

  const buildingConfigItems: NavItem[] = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'yearly-archive', label: 'Yearly Archive', icon: Archive }
  ];

  const renderNavGroup = (title: string | null, items: NavItem[]) => (
    <div className="space-y-1">
      {title && (
        <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8] mb-1">
          {title}
        </div>
      )}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30' : 'text-[#94A3B8] hover:bg-[#162032] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={item.badgeStyle || `text-[9px] px-1.5 py-0.5 rounded font-black ${isActive ? 'bg-white/20 text-white' : 'bg-blue-900/40 text-blue-300 border border-blue-500/40'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="w-full h-full bg-[#0D111D] border-r border-[#1E293B] flex flex-col justify-between shrink-0 overflow-y-auto select-none font-sans z-30 scrollbar-thin scrollbar-thumb-[#1E293B]">
      <div className="p-3.5 space-y-5">
        <div className="p-3 bg-[#121927] border border-[#1E293B] rounded-2xl flex items-center justify-between shadow-sm relative">
          <div className="flex items-center gap-2.5 overflow-hidden pr-8">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-md ${isBuilding ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
              {isBuilding ? <Building2 className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-white uppercase tracking-wider truncate">CONSTRUCTION PRO</div>
              <div className="text-[10px] text-blue-400 font-mono truncate">
                {isBuilding ? 'Building Construction ERP' : 'Road Construction ERP'}
              </div>
            </div>
          </div>

          {onClose && (
            <button onClick={onClose} className="absolute right-3 lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isBuilding ? (
          <>
            {renderNavGroup(null, buildingCoreItems)}
            {renderNavGroup('ANALYSIS', buildingAnalysisItems)}
            {renderNavGroup('CONFIGURATION', buildingConfigItems)}
          </>
        ) : (
          <>
            {renderNavGroup('SITE OPERATIONS', roadOperationsItems)}
            {renderNavGroup('ENGINEERING', roadEngineeringItems)}
            {renderNavGroup('CONFIGURATION', roadConfigItems)}
          </>
        )}
      </div>

      <div className="p-3 border-t border-[#1E293B] bg-[#080C14] space-y-2 sticky bottom-0 z-10">
        {isAdminUser && onSwitchDomain && (
          <button
            onClick={() => {
              onSwitchDomain();
              if (onClose) onClose();
            }}
            className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <span>Switch to {isBuilding ? 'Road Construction' : 'Building Construction'}</span>
          </button>
        )}

        <div className="p-2 rounded-xl bg-[#121927] border border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
              {currentUser?.fullName?.charAt(0).toUpperCase() || currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{currentUser?.fullName || currentUser?.name || 'User'}</div>
              <div className="text-[10px] text-[#94A3B8] truncate">{currentUser?.role || 'SUPER_ADMIN'}</div>
            </div>
          </div>
          <button onClick={logout} title="Logout" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#162032] transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

// ==========================================
// Road Material Categories & Rates Module
// ==========================================
export interface RoadMaterialCategory {
  id: string;
  name: string;
  description: string;
  standardRate: number;
  unit: string;
}

const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';

const INITIAL_ROAD_CATEGORIES: RoadMaterialCategory[] = [
  { id: 'RCAT-01', name: 'Bituminous Macadam (BM)', description: 'Dense bituminous macadam binder course', standardRate: 5000, unit: 'Brass' },
  { id: 'RCAT-02', name: 'Wet Mix Macadam (WMM)', description: 'Crushed stone aggregate base/sub-base layer', standardRate: 4500, unit: 'Brass' },
  { id: 'RCAT-03', name: 'Granular Sub-Base (GSB)', description: 'Coarse graded granular material sub-base', standardRate: 4200, unit: 'Brass' },
  { id: 'RCAT-04', name: 'Dense Bituminous Macadam (DBM)', description: 'Structural layer in flexible pavements', standardRate: 5500, unit: 'Brass' },
  { id: 'RCAT-05', name: 'Bituminous Concrete (BC)', description: 'High quality wearing course finish', standardRate: 6000, unit: 'Brass' }
];

export const RoadMaterialCategoriesModule: React.FC = () => {
  const { currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  const [categories, setCategories] = useState<RoadMaterialCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROAD_CATS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ROAD_CATEGORIES;
    } catch {
      return INITIAL_ROAD_CATEGORIES;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [standardRate, setStandardRate] = useState<number | ''>(5000);
  const [unit, setUnit] = useState('Brass');

  useEffect(() => {
    localStorage.setItem(STORAGE_ROAD_CATS_KEY, JSON.stringify(categories));
  }, [categories]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setStandardRate(5000);
    setUnit('Brass');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: RoadMaterialCategory = {
      id: editingId || `RCAT-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      description: description.trim() || 'Road construction material specification',
      standardRate: Number(standardRate) || 0,
      unit
    };

    if (editingId) {
      setCategories(categories.map((c) => (c.id === editingId ? payload : c)));
    } else {
      setCategories([payload, ...categories]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this road material category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Road Material Categories & Rates</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage standard road aggregate and mix names, specifications, and benchmark rates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Material Category</span>
        </button>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">MATERIAL NAME</th>
                <th className="py-3.5 px-6">SPECIFICATION / DESCRIPTION</th>
                <th className="py-3.5 px-6 text-right">BENCHMARK RATE</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#121c33]/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-400">{cat.id}</td>
                  <td className="py-4 px-6 font-bold text-white text-xs whitespace-nowrap">{cat.name}</td>
                  <td className="py-4 px-6 text-slate-300 min-w-[200px]">{cat.description}</td>
                  <td className="py-4 px-6 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                    ₹{cat.standardRate.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ {cat.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setName(cat.name);
                          setDescription(cat.description);
                          setStandardRate(cat.standardRate);
                          setUnit(cat.unit);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Material Category' : 'Add Road Material Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bituminous Macadam (BM)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Specification</label>
                <textarea
                  rows={2}
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Standard Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={standardRate}
                    onChange={(e) => setStandardRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="Brass">Brass</option>
                    <option value="Ton">Ton</option>
                    <option value="Cu.M">Cu.M</option>
                    <option value="Load">Load</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Main Application Router
// ==========================================
export const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    selectedSiteId,
    setSelectedSiteId,
    siteSheets,
    currentUser,
    userRole,
    appDomain,
    setAppDomain
  } = useERP() as any;

  const currentRoleStr = String(userRole || currentUser?.role || '').toUpperCase();
  const isAdmin = currentRoleStr === 'SUPER_ADMIN' || currentRoleStr === 'ADMIN' || currentRoleStr.includes('ADMIN');
  const userScope = currentUser?.allowedScope || 'ROAD_ONLY';

  const [projectType, setProjectType] = useState<'ROAD' | 'BUILDING' | null>(() => {
    if (!isAdmin) {
      return userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD';
    }

    try {
      const saved = sessionStorage.getItem('CONSTRUCTION_PRO_DOMAIN_SESSION');
      if (saved === 'ROAD' || saved === 'BUILDING') return saved;
    } catch {}

    return null;
  });

  const [hasSelectedSite, setHasSelectedSite] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isAdmin) {
      const fixedDomain = userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD';
      if (projectType !== fixedDomain) {
        setProjectType(fixedDomain);
        if (setAppDomain) setAppDomain(fixedDomain);
        sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', fixedDomain);
      }
    } else if (appDomain && appDomain !== 'BOTH' && (appDomain === 'ROAD' || appDomain === 'BUILDING')) {
      setProjectType(appDomain);
      sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', appDomain);
    }
  }, [userScope, isAdmin, appDomain]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!projectType && isAdmin) {
    return (
      <ProjectTypeSelectionPage
        onSelectProjectType={(type) => {
          setProjectType(type);
          if (setAppDomain) setAppDomain(type);
          sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', type);
        }}
      />
    );
  }

  const activeDomain = projectType || (userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD');

  if (!hasSelectedSite || !selectedSiteId || siteSheets.length === 0) {
    return (
      <SiteSelectionPage
        projectType={activeDomain}
        onSelectSite={(siteId) => {
          setSelectedSiteId(siteId);
          setHasSelectedSite(true);
          sessionStorage.setItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION', 'true');
        }}
        onBackToDomainSelect={
          isAdmin
            ? () => {
                setProjectType(null);
                setHasSelectedSite(false);
                sessionStorage.removeItem('CONSTRUCTION_PRO_DOMAIN_SESSION');
                sessionStorage.removeItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION');
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="flex flex-1 relative h-[calc(100vh-56px)] overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full shrink-0 w-64">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            projectType={activeDomain}
            isAdminUser={isAdmin}
            onSwitchDomain={
              isAdmin
                ? () => {
                    const next = activeDomain === 'ROAD' ? 'BUILDING' : 'ROAD';
                    setProjectType(next);
                    if (setAppDomain) setAppDomain(next);
                    sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', next);
                  }
                : undefined
            }
          />
        </div>

        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 max-w-[260px] w-full bg-[#0D111D] h-full flex flex-col z-50 shadow-2xl">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                projectType={activeDomain}
                isAdminUser={isAdmin}
                onSwitchDomain={
                  isAdmin
                    ? () => {
                        const next = activeDomain === 'ROAD' ? 'BUILDING' : 'ROAD';
                        setProjectType(next);
                        if (setAppDomain) setAppDomain(next);
                        sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', next);
                      }
                    : undefined
                }
                onClose={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 p-6 overflow-y-auto max-h-[calc(100vh-56px)] scrollbar-thin scrollbar-thumb-[#1E293B] scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-12 w-full overflow-x-hidden">
            {activeTab === 'dashboard' && <SiteCentricMidnightDashboard onNavigateTab={setActiveTab} />}
            {(activeTab === 'road-sites' || activeTab === 'sites') && (
              <RoadSitesManagerModule projectType={activeDomain} onNavigateTab={setActiveTab} />
            )}

            {/* ROAD Construction Tabs */}
            {activeDomain === 'ROAD' && (
              <>
                {activeTab === 'haulage-trips' && <MaterialHaulageTripsModule />}
                {activeTab === 'vendor-advances' && <VendorAdvancesModule />}
                {activeTab === 'diesel' && <DieselFuelManagementModule />}
                {activeTab === 'site-expenses' && <SiteCostExpensesModule />}
                {(activeTab === 'yield_calculator' || activeTab === 'road-yield') && <RoadYieldCalculatorModule />}
                {(activeTab === 'machinery_fleet' || activeTab === 'machinery') && <MachineryFleetModule />}
                {activeTab === 'categories' && <RoadMaterialCategoriesModule />}
                {activeTab === 'users' && <UserManagementModule />}
              </>
            )}

            {/* BUILDING Construction Tabs */}
            {activeDomain === 'BUILDING' && (
              <>
                {activeTab === 'transactions' && <StockTransactionsModule />}
                {activeTab === 'building_calculator' && <RCCCalculators />}
                {activeTab === 'categories' && <RoadMaterialCategoriesModule />}
                {activeTab === 'users' && <UserManagementModule />}
                {activeTab === 'reports' && <GenericView title="Reports" subtitle="Consumption and site audit logs" icon={FileText} />}
                {activeTab === 'alerts' && <GenericView title="Alerts" subtitle="Critical buffer stock levels" icon={Bell} />}
                {activeTab === 'attendance-salary' && <GenericView title="Attendance & Salary" subtitle="Staff and labor payroll register" icon={CalendarCheck} />}
                {activeTab === 'yearly-archive' && <GenericView title="Yearly Archive" subtitle="Annual building records" icon={Archive} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ERPProvider>
      <RoadERPProvider>
        <AppContent />
      </RoadERPProvider>
    </ERPProvider>
  );
};

export default App;
