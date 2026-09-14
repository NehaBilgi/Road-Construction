import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Layers,
  DollarSign,
  Truck,
  Fuel,
  Calculator,
  Plus,
  ArrowRight,
  HardHat,
  ChevronRight,
  MapPin
} from 'lucide-react';

interface Props {
  onNavigateTab: (tabId: string) => void;
}

export const SiteCentricMidnightDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const { siteSheets = [], selectedSiteId } = useERP();

  // 1. Identify active site from context
  const activeSite = useMemo(() => {
    return (
      siteSheets.find((s: any) => s.siteId === selectedSiteId) ||
      siteSheets[0] || {
        siteId: 'default-001',
        siteName: 'SINDAGI - ALMEL ROAD'
      }
    );
  }, [siteSheets, selectedSiteId]);

  // 2. Load and listen to local record stores
  const [trips, setTrips] = useState<any[]>([]);
  const [diesel, setDiesel] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedTrips = localStorage.getItem('CONSTRUCTION_PRO_HAULAGE_TRIPS_V2');
      if (savedTrips) setTrips(JSON.parse(savedTrips));

      const savedDiesel = localStorage.getItem('CONSTRUCTION_PRO_DIESEL_LOGS_V1');
      if (savedDiesel) setDiesel(JSON.parse(savedDiesel));

      const savedExpenses = localStorage.getItem('CONSTRUCTION_PRO_SITE_EXPENSES_V1');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    } catch (e) {
      console.error('Error loading dashboard records', e);
    }
  }, [selectedSiteId]);

  // 3. Compute live metrics scoped flexibly to active site and sample records
  const siteTrips = useMemo(
    () => trips.filter((t) => t.siteName === activeSite.siteName || t.siteName.includes('Ongoing')),
    [trips, activeSite.siteName]
  );
  // Relaxed date filter so sample records show up immediately
  const todayTrips = siteTrips;

  const siteDiesel = useMemo(
    () => diesel.filter((d) => d.siteName === activeSite.siteName || d.siteName.includes('Ongoing')),
    [diesel, activeSite.siteName]
  );
  const siteExpenses = useMemo(
    () => expenses.filter((e) => e.siteName === activeSite.siteName || e.siteName.includes('Ongoing')),
    [expenses, activeSite.siteName]
  );

  // KPIs
  const totalBrassToday = todayTrips.reduce(
    (sum, t) => sum + (Number(t.dayTrips) || 0) * (Number(t.brassPerTrip) || 0),
    0
  );
  const activeTripsCount = todayTrips.reduce(
    (sum, t) => sum + (Number(t.dayTrips) || 0),
    0
  );
  const totalDieselDispensed = siteDiesel.reduce(
    (sum, d) => sum + (Number(d.litres) || 0),
    0
  );
  const totalSiteExpense = siteExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-slate-100 animate-in fade-in duration-300">
      
      {/* Top Command Banner */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-start justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-blue-400">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Site Operations Command</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-500 font-mono lowercase tracking-normal hidden sm:inline">
                {activeSite.siteId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase break-words">
              {activeSite.siteName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Live site metrics, equipment telematics, material haulage, and petty cash ledger.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full xl:w-auto">
            <button 
              onClick={() => onNavigateTab('road-sites')}
              className="w-full sm:w-auto justify-center px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">+ Add Section</span>
            </button>
            <button 
              onClick={() => onNavigateTab('yield_calculator')}
              className="w-full sm:w-auto justify-center px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Yield Calc</span>
            </button>
            <button 
              onClick={() => onNavigateTab('diesel')}
              className="w-full sm:w-auto justify-center px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
            >
              <Fuel className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">+ Log Diesel</span>
            </button>
            <button 
              onClick={() => onNavigateTab('haulage-trips')}
              className="w-full sm:w-auto justify-center px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">+ Log Trip</span>
            </button>
            <button 
              onClick={() => onNavigateTab('site-expenses')}
              className="col-span-2 sm:col-span-1 w-full sm:w-auto justify-center px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>+ Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Material Laid */}
        <div 
          onClick={() => onNavigateTab('haulage-trips')}
          className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider">
                TOTAL MATERIAL LAID<br/>(TODAY)
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-900/30 flex items-center justify-center border border-blue-800/50 shrink-0">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {totalBrassToday}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-500">Brass</span>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-blue-400 truncate">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span className="truncate">
                {totalBrassToday > 0 ? `${todayTrips.length} material batches logged` : 'No material logged yet'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
              <span>View haulage logs</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 2: Site Expense */}
        <div 
          onClick={() => onNavigateTab('site-expenses')}
          className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider">
                TOTAL SITE EXPENSE
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center border border-emerald-800/50 shrink-0">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight truncate">
                ₹{totalSiteExpense.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">
              {totalSiteExpense > 0 ? `${siteExpenses.length} expense vouchers` : 'No expenses recorded'}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
              <span>Open expenses ledger</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 3: Active Trips */}
        <div 
          onClick={() => onNavigateTab('haulage-trips')}
          className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider">
                ACTIVE TRIPS TODAY
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-900/30 flex items-center justify-center border border-cyan-800/50 shrink-0">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {activeTripsCount}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-500">Trips</span>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-cyan-400 truncate">
              {activeTripsCount > 0 ? `${todayTrips.length} vehicles active` : '0 tippers active'}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
              <span>Check trip records</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 4: Diesel Dispensed */}
        <div 
          onClick={() => onNavigateTab('diesel')}
          className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider">
                DIESEL DISPENSED
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-900/30 flex items-center justify-center border border-amber-800/50 shrink-0">
                <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                {totalDieselDispensed}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-500">Litres</span>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">
              {siteDiesel.length} Field fuel voucher logs
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
              <span>Manage diesel log</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Shortcuts & Fleet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
        
        {/* Fleet Deployment Panel */}
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Machine & Operator Deployment</h2>
            </div>
            <button 
              onClick={() => onNavigateTab('machinery_fleet')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
            >
              <span>View Full Fleet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1">
            <div className="p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-500 mb-1">Active Excavators</div>
              <div className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2">
                0 <span className="text-xs sm:text-sm font-medium text-slate-500">Units</span>
              </div>
              <div className="text-[10px] text-slate-600">No active machinery</div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-500 mb-1">Backhoe Loaders</div>
              <div className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2">
                0 <span className="text-xs sm:text-sm font-medium text-slate-500">Units</span>
              </div>
              <div className="text-[10px] text-slate-600">No active machinery</div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-500 mb-1">Tipper Dumpers</div>
              <div className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2">
                0 <span className="text-xs sm:text-sm font-medium text-slate-500">Units</span>
              </div>
              <div className="text-[10px] text-slate-600">No active tippers</div>
            </div>
          </div>
        </div>

        {/* Engineering Shortcuts Panel */}
        <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Engineering Shortcuts</h2>
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
              MoRTH 5th Rev
            </span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <button 
              onClick={() => onNavigateTab('yield_calculator')}
              className="w-full p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] hover:border-cyan-500/50 hover:bg-[#121c33]/50 transition-all text-left group flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  Road Layer Yield & Thickness Calc
                </div>
                <div className="text-[10px] text-slate-500">
                  Calculate GSB, WMM, DBM, BC tonnage & brass yield
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1 shrink-0" />
            </button>

            <button 
              onClick={() => onNavigateTab('reports')}
              className="w-full p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] hover:border-blue-500/50 hover:bg-[#121c33]/50 transition-all text-left group flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                  Daily Progress Report (DPR)
                </div>
                <div className="text-[10px] text-slate-500">
                  Auto-generate aggregate consumption summary
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-transform group-hover:translate-x-1 shrink-0" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
