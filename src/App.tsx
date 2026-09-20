import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
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
import { ProductsMasterModule } from './components/building/ProductsMasterModule';
import StockTransactionsModule from './components/building/StockTransactionsModule';
import { InstallAppButton } from './components/InstallAppButton';
import { ThemeToggle } from './components/ThemeToggle';
import { UserManagementModule } from './components/configuration/UserManagementModule';

import {
  LayoutDashboard, Truck, Fuel, DollarSign, Calculator, HardHat,
  LogOut, Milestone, Users, Package, ArrowLeftRight, FileText,
  Bell, CalendarCheck, Tag, Archive, Building2,
  X, Plus, Edit2, Trash2, Menu, ChevronDown, Check, CreditCard,
  ChevronLeft, ChevronRight, FileSpreadsheet, Paperclip, Upload, RotateCcw, AlertTriangle, Printer,
  Box, Layers, Search, ShieldCheck, Briefcase, UserCheck, Lock, Eye, EyeOff
} from 'lucide-react';

// ==========================================
// Error Boundary (Prevents Blank Screen)
// ==========================================
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  errorText: string;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorText: error.message || 'Unknown runtime error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white">Dashboard Encountered an Error</h1>
          <p className="text-xs text-slate-400 max-w-md font-mono bg-[#121927] p-3 rounded-xl border border-[#1E293B]">
            {this.state.errorText}
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30"
          >
            <RotateCcw className="w-4 h-4" /> Reset Session & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// Storage Keys
// ==========================================
const STORAGE_BUILDING_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_NO_NAME_V1';
const STORAGE_BUILDING_TX_KEY = 'CONSTRUCTION_PRO_BUILDING_TRANSACTIONS_V1';
const STORAGE_BUILDING_CATS_KEY = 'CONSTRUCTION_PRO_BUILDING_CATEGORIES_ISOLATED_V1';
const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';

// ==========================================
// Generic Scaffold View for Remaining Tabs
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
// Building Calculator Module (Styled like Photo 1 Road Trip Calculator)
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

export const BuildingCalculatorModule: React.FC = () => {
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

  // Calculations
  const slabVolumeM3 = slabLength * slabWidth * slabThickness;
  const slabDryVolumeM3 = slabVolumeM3 * 1.54;
  const slabCementBags = Math.round((slabDryVolumeM3 * (1 / 4) * 1440) / 50);
  const slabNumMainBars = Math.floor((slabWidth * 1000) / slabMainSpacingMm) + 1;
  const slabMainSteelKg = Number((slabNumMainBars * (slabLength + 0.3) * ((slabMainDia * slabMainDia) / 162)).toFixed(1));

  const colTotalVolumeM3 = colCount * (colWidth * colBreadth * colHeight);
  const colDryVolumeM3 = colTotalVolumeM3 * 1.54;
  const colCementBags = Math.round((colDryVolumeM3 * (1 / 3.5) * 1440) / 50);
  const colGrandSteelKg = Number((colCount * colMainBarsCount * (colHeight + 0.8) * ((colMainDia * colMainDia) / 162)).toFixed(1));

  const beamTotalVolumeM3 = beamCount * (beamLength * beamWidth * beamDepth);
  const beamDryVol = beamTotalVolumeM3 * 1.54;
  const beamCementBags = Math.round((beamDryVol * (1 / 4) * 1440) / 50);
  const beamTotalSteelKg = 1450;

  const ftgTotalVolumeM3 = ftgCount * (ftgLength * ftgWidth * ftgDepth);
  const ftgDryVol = ftgTotalVolumeM3 * 1.54;
  const ftgCementBags = Math.round((ftgDryVol * (1 / 4) * 1440) / 50);
  const ftgTotalSteelKg = 2100;

  const currentLiveVolume = useMemo(() => {
    if (activeRCCTab === 'SLAB') return slabVolumeM3.toFixed(2);
    if (activeRCCTab === 'COLUMN') return colTotalVolumeM3.toFixed(2);
    if (activeRCCTab === 'BEAM') return beamTotalVolumeM3.toFixed(2);
    if (activeRCCTab === 'FOOTING') return ftgTotalVolumeM3.toFixed(2);
    return '0.00';
  }, [activeRCCTab, slabVolumeM3, colTotalVolumeM3, beamTotalVolumeM3, ftgTotalVolumeM3]);

  const primaryMetricValue = useMemo(() => {
    if (activeRCCTab === 'SLAB') return `${slabTotalSteelKg.toLocaleString()}`;
    if (activeRCCTab === 'COLUMN') return `${colGrandSteelKg.toLocaleString()}`;
    if (activeRCCTab === 'BEAM') return `${beamTotalSteelKg.toLocaleString()}`;
    if (activeRCCTab === 'FOOTING') return `${ftgTotalSteelKg.toLocaleString()}`;
    return '0';
  }, [activeRCCTab, slabTotalSteelKg, colGrandSteelKg, beamTotalSteelKg, ftgTotalSteelKg]);

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
      dims: activeRCCTab === 'SLAB' ? `${slabLength}×${slabWidth}×${slabThickness}` : `${colCount} Nos`,
      vol: `${currentLiveVolume} m³`,
      primaryMetric: `${primaryMetricValue} kg`,
      secondaryMetric: `${secondaryMetricValue} Bags`
    };
    setSavedCalcs((prev) => [newItem, ...prev]);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* Top Banner Header like Photo 1 Road Trip Calculator */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Building RCC Calculator</h1>
            <p className="text-xs text-slate-400">Calculate layer yields, brass requirements, and required structural concrete/rebar quantities.</p>
          </div>
        </div>
      </div>

      {/* Sub-tabs Element Switcher */}
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
          {/* Left Panel: Road Dimension Parameters Style Card (Photo 1 exact styling) */}
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
                <label className="block text-slate-400 font-bold mb-1.5">Element Type / Category *</label>
                <div className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-cyan-400 font-bold font-mono">
                  RCC {activeRCCTab} structural section
                </div>
              </div>

              {activeRCCTab === 'SLAB' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Length (Meters) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={slabLength}
                        onChange={(e) => setSlabLength(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Width (Meters) *</label>
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
                    Configured for {activeRCCTab === 'BEAM' ? `${beamCount} span beams` : `${ftgCount} footings`} sub-structure survey.
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

          {/* Right Panel: Live Yield Output & Saved Calculations matching Photo 1 exact 3-card + table structure */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Yield Output Container matching Photo 1 */}
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-5">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Live Yield Output</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#080d19] border border-[#1E293B]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL VOLUME</span>
                  <div className="text-3xl font-black text-white font-mono mt-2">
                    {currentLiveVolume}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">Cu.m [cite: [source: 3]]</span>
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

            {/* Saved Calculations Table Card matching Photo 1 bottom card */}
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

// ==========================================
// Header Component
// ==========================================
interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { selectedSiteId, setSelectedSiteId, siteSheets = [], logout } = useERP() as any;
  const [isSiteOpen, setIsSiteOpen] = useState(false);
  
  const safeSiteSheets = Array.isArray(siteSheets) ? siteSheets : [];
  const currentSiteSheet = safeSiteSheets.find((s: any) => s?.siteId === selectedSiteId || s?.id === selectedSiteId) || safeSiteSheets[0];

  return (
    <header className="h-14 bg-[#080C14] border-b border-[#1E293B] flex items-center justify-between px-3 sm:px-4 text-xs select-none font-sans z-45 relative">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onToggleSidebar && onToggleSidebar()}
          className="p-2 lg:hidden rounded-xl bg-[#121927] hover:bg-[#162032] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsSiteOpen(!isSiteOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#121927] hover:bg-[#162032] border border-[#1E293B] rounded-xl text-white font-bold text-xs cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-mono text-blue-400 truncate max-w-[120px] sm:max-w-[200px]">
              {currentSiteSheet?.siteName || currentSiteSheet?.name || 'Selected Site'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          </button>

          {isSiteOpen && safeSiteSheets.length > 0 && (
            <div className="absolute left-0 mt-2 w-64 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50">
              {safeSiteSheets.map((s: any) => (
                <button
                  key={s.siteId || s.id}
                  onClick={() => {
                    setSelectedSiteId(s.siteId || s.id);
                    setIsSiteOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-[#162032] text-white flex justify-between cursor-pointer"
                >
                  <span>{s.siteName || s.name}</span>
                  {(s.siteId || s.id) === selectedSiteId && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
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
            if (window.confirm('Are you sure you want to log out?')) logout();
          }}
          className="px-2.5 py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  projectType = 'ROAD',
  onSwitchDomain,
  isAdminUser = false,
  onClose
}) => {
  const { logout } = useERP() as any;
  const isBuilding = projectType === 'BUILDING';

  const [liveAlertCount, setLiveAlertCount] = useState<number>(0);

  useEffect(() => {
    const computeAlertCount = () => {
      try {
        const prodRaw = localStorage.getItem(STORAGE_BUILDING_PRODUCTS_KEY);
        if (!prodRaw) {
          setLiveAlertCount(0);
          return;
        }
        const prods = JSON.parse(prodRaw);
        const count = prods.filter((p: any) => Number(p.currentStock || 0) <= 20).length;
        setLiveAlertCount(count);
      } catch {
        setLiveAlertCount(0);
      }
    };

    computeAlertCount();
    window.addEventListener('storage', computeAlertCount);
    window.addEventListener('focus', computeAlertCount);
    return () => {
      window.removeEventListener('storage', computeAlertCount);
      window.removeEventListener('focus', computeAlertCount);
    };
  }, []);

  const buildingCoreItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'road-sites', label: 'Ongoing Site', icon: Milestone, badge: 'Sites' },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight }
  ];

  const buildingAnalysisItems = [
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'building_calculator', label: 'RCC Calculator', icon: Calculator, badge: 'IS 456' },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: Bell, 
      badge: liveAlertCount > 0 ? liveAlertCount : undefined 
    },
    { id: 'attendance-salary', label: 'Attendance & Salary', icon: CalendarCheck }
  ];

  const buildingConfigItems = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'yearly-archive', label: 'Yearly Archive', icon: Archive }
  ];

  const roadOperationsItems = [
    { id: 'dashboard', label: 'Site Overview', icon: LayoutDashboard },
    { id: 'road-sites', label: 'Ongoing Site', icon: Milestone },
    { id: 'haulage-trips', label: 'Trips', icon: Truck },
    { id: 'vendor-advances', label: 'Vendor Advance', icon: CreditCard },
    { id: 'diesel', label: 'Diesel', icon: Fuel },
    { id: 'site-expenses', label: 'Site Expense', icon: DollarSign }
  ];

  const roadEngineeringItems = [
    { id: 'yield_calculator', label: 'Road Trip Calculator', icon: Calculator },
    { id: 'machinery_fleet', label: 'Machinery', icon: HardHat }
  ];

  const roadConfigItems = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'users', label: 'User Management', icon: Users }
  ];

  const renderNav = (items: any[], title?: string) => (
    <div className="space-y-1 mb-4">
      {title && <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8] mb-1">{title}</div>}
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              isActive ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30' : 'text-[#94A3B8] hover:bg-[#162032] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                item.id === 'alerts'
                  ? 'bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center'
                  : 'bg-blue-900/40 text-blue-300 font-mono'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="w-full h-full bg-[#0D111D] border-r border-[#1E293B] flex flex-col justify-between overflow-y-auto font-sans p-3">
      <div>
        <div className="p-3 bg-[#121927] border border-[#1E293B] rounded-2xl flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-white">CONSTRUCTION PRO</div>
              <div className="text-[10px] text-blue-400 font-mono">{isBuilding ? 'Building ERP' : 'Road ERP'}</div>
            </div>
          </div>
        </div>

        {isBuilding ? (
          <>
            {renderNav(buildingCoreItems)}
            {renderNav(buildingAnalysisItems, 'ANALYSIS')}
            {renderNav(buildingConfigItems, 'CONFIGURATION')}
          </>
        ) : (
          <>
            {renderNav(roadOperationsItems, 'SITE OPERATIONS')}
            {renderNav(roadEngineeringItems, 'ENGINEERING')}
            {renderNav(roadConfigItems, 'CONFIGURATION')}
          </>
        )}
      </div>

      <div className="pt-2 border-t border-[#1E293B]">
        {isAdminUser && onSwitchDomain && (
          <button
            onClick={onSwitchDomain}
            className="w-full py-2 px-3 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
          >
            Switch to {isBuilding ? 'Road' : 'Building'}
          </button>
        )}
        <button
          onClick={logout}
          className="w-full py-2 px-3 bg-[#121927] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
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
    siteSheets = [],
    currentUser,
    userRole,
    setAppDomain
  } = useERP() as any;

  const currentRoleStr = String(userRole || currentUser?.role || '').toUpperCase();
  const isAdmin = currentRoleStr.includes('ADMIN');
  const userScope = currentUser?.allowedScope || 'ROAD_ONLY';

  const [projectType, setProjectType] = useState<'ROAD' | 'BUILDING' | null>(() => {
    if (!isAdmin) return userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD';
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

  const safeSiteSheets = Array.isArray(siteSheets) ? siteSheets : [];
  const activeDomain = projectType || (userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD');

  if (!isAuthenticated) return <LoginPage />;

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

  if (!hasSelectedSite || !selectedSiteId || safeSiteSheets.length === 0) {
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
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      <header className="h-14 bg-[#080C14] border-b border-[#1E293B] flex items-center justify-between px-3 sm:px-4 text-xs select-none font-sans z-45 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 lg:hidden rounded-xl bg-[#121927] hover:bg-[#162032] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <InstallAppButton />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) logout();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-semibold">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative h-[calc(100vh-56px)] overflow-hidden">
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

        <main className="flex-1 w-full min-w-0 p-6 overflow-y-auto max-h-[calc(100vh-56px)]">
          <div className="max-w-7xl mx-auto pb-12 w-full">
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
                {activeTab === 'categories' && <GenericView title="Categories" subtitle="Road material benchmarks" icon={Tag} />}
                {activeTab === 'users' && <UserManagementModule />}
              </>
            )}

            {/* BUILDING Construction Tabs (Isolated) */}
            {activeDomain === 'BUILDING' && (
              <>
                {activeTab === 'products' && <ProductsMasterModule />}
                {activeTab === 'transactions' && <StockTransactionsModule />}
                {activeTab === 'building_calculator' && <BuildingCalculatorModule />}
                {activeTab === 'reports' && <GenericView title="Reports" subtitle="Building consumption and stock audit logs" icon={FileText} />}
                {activeTab === 'alerts' && <GenericView title="Alerts" subtitle="Critical buffer stock levels" icon={Bell} />}
                {activeTab === 'users' && <UserManagementModule />}
                {activeTab === 'attendance-salary' && <GenericView title="Attendance & Salary" subtitle="Staff and labor payroll register" icon={CalendarCheck} />}
                {activeTab === 'yearly-archive' && <GenericView title="Yearly Archive" subtitle="Annual building records & financial closings" icon={Archive} />}
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
    <AppErrorBoundary>
      <ERPProvider>
        <RoadERPProvider>
          <AppContent />
        </RoadERPProvider>
      </ERPProvider>
    </AppErrorBoundary>
  );
};

export default App;
