import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useERP } from '../../context/ERPContext';
import { useRoadERP } from '../../context/RoadERPContext';
import {
  Layers,
  Truck,
  Fuel,
  Calculator,
  Plus,
  ArrowRight,
  HardHat,
  ChevronRight,
  MapPin,
  Lock,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowLeftRight,
  Building2,
  Boxes
} from 'lucide-react';

interface Props {
  onNavigateTab: (tabId: string) => void;
}

export const SiteCentricMidnightDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const { siteSheets = [], selectedSiteId, currentUser, userRole, appDomain } = useERP() as any;
  const roadERP = useRoadERP?.() || {};

  // Check whether current view is Building or Road
  const isBuilding = useMemo(() => {
    try {
      const sessionDomain = sessionStorage.getItem('CONSTRUCTION_PRO_DOMAIN_SESSION');
      if (sessionDomain === 'BUILDING') return true;
      if (sessionDomain === 'ROAD') return false;
    } catch {}
    return appDomain === 'BUILDING' || currentUser?.allowedScope === 'BUILDING_ONLY';
  }, [appDomain, currentUser]);

  // Strict Admin Evaluation
  const isAdmin = useMemo(() => {
    let roleCandidate = String(userRole || currentUser?.role || '').trim().toUpperCase();
    if (roleCandidate === 'SUPER_ADMIN' || roleCandidate === 'ADMIN' || roleCandidate.includes('ADMIN')) {
      return true;
    }
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('CONSTRUCTION_PRO_ERP_STORAGE_V7_USER') || localStorage.getItem('PAVETRACK_CURRENT_USER');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const parsedRole = String(parsed?.role || '').trim().toUpperCase();
          return parsedRole === 'SUPER_ADMIN' || parsedRole === 'ADMIN' || parsedRole.includes('ADMIN');
        }
      } catch {}
    }
    return false;
  }, [userRole, currentUser]);

  // 1. Identify active site
  const activeSite = useMemo(() => {
    return (
      siteSheets.find((s: any) => s.siteId === selectedSiteId) ||
      siteSheets[0] || {
        siteId: 'site-1789375276548',
        siteName: isBuilding ? 'TOWER-A (RESIDENTIAL)' : 'SINDAGI HIGHWAY'
      }
    );
  }, [siteSheets, selectedSiteId, isBuilding]);

  // 2. State Stores (Road + Building)
  const [trips, setTrips] = useState<any[]>([]);
  const [diesel, setDiesel] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [buildingProducts, setBuildingProducts] = useState<any[]>([]);
  const [stockTransactions, setStockTransactions] = useState<any[]>([]);

  // 3. Load & Live Sync
  const loadDashboardData = useCallback(() => {
    try {
      // Road Data
      const savedTrips = localStorage.getItem('CONSTRUCTION_PRO_HAULAGE_TRIPS_V2');
      setTrips(savedTrips ? JSON.parse(savedTrips) : roadERP.trips || []);

      const savedDiesel = localStorage.getItem('CONSTRUCTION_PRO_DIESEL_LOGS_V1');
      setDiesel(savedDiesel ? JSON.parse(savedDiesel) : roadERP.fuelLogs || []);

      const savedExpenses = localStorage.getItem('CONSTRUCTION_PRO_SITE_EXPENSES_V1');
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : roadERP.expenses || []);

      // Building Data
      const savedProducts = 
        localStorage.getItem('CONSTRUCTION_PRO_BUILDING_PRODUCTS_V2') || 
        localStorage.getItem('CONSTRUCTION_PRO_BUILDING_PRODUCTS_V1');
      setBuildingProducts(savedProducts ? JSON.parse(savedProducts) : []);

      const savedTx = localStorage.getItem('CONSTRUCTION_PRO_BUILDING_TRANSACTIONS_V1');
      setStockTransactions(savedTx ? JSON.parse(savedTx) : []);
    } catch {
      setTrips([]);
      setDiesel([]);
      setExpenses([]);
      setBuildingProducts([]);
      setStockTransactions([]);
    }
  }, [roadERP]);

  useEffect(() => {
    loadDashboardData();
    const handleSync = () => loadDashboardData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [loadDashboardData, selectedSiteId]);

  // 4. ROAD KPI Calculations
  const siteTrips = useMemo(
    () =>
      (trips || []).filter(
        (t) =>
          t?.siteName === activeSite?.siteName ||
          t?.siteId === activeSite?.siteId ||
          t?.siteName?.includes('Ongoing') ||
          !t?.siteName
      ),
    [trips, activeSite]
  );

  const siteDiesel = useMemo(
    () =>
      (diesel || []).filter(
        (d) =>
          d?.siteName === activeSite?.siteName ||
          d?.siteId === activeSite?.siteId ||
          d?.siteName?.includes('Ongoing') ||
          !d?.siteName
      ),
    [diesel, activeSite]
  );

  const siteExpenses = useMemo(
    () =>
      (expenses || []).filter(
        (e) =>
          e?.siteName === activeSite?.siteName ||
          e?.costCenterChainage?.includes(activeSite?.siteName) ||
          !e?.siteName
      ),
    [expenses, activeSite]
  );

  const totalBrassToday = siteTrips.reduce((sum, t) => {
    const dayTrips = Number(t?.dayTrips ?? t?.trips ?? 0);
    const brassPerTrip = Number(t?.brassPerTrip ?? t?.capacityBrass ?? 0);
    return sum + (isNaN(dayTrips) ? 0 : dayTrips) * (isNaN(brassPerTrip) ? 0 : brassPerTrip);
  }, 0);

  const activeTripsCount = siteTrips.reduce((sum, t) => {
    const dayTrips = Number(t?.dayTrips ?? t?.trips ?? 0);
    return sum + (isNaN(dayTrips) ? 0 : dayTrips);
  }, 0);

  const totalDieselDispensed = siteDiesel.reduce((sum, d) => {
    const litres = Number(d?.litres ?? d?.qtyLitres ?? d?.litresDispensed ?? 0);
    return sum + (isNaN(litres) ? 0 : litres);
  }, 0);

  const totalSiteExpensesAmount = siteExpenses.reduce((sum, e) => {
    const amount = Number(e?.amount ?? 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // 5. BUILDING KPI Calculations
  const totalBuildingSkus = buildingProducts.length;

  const lowStockItems = useMemo(
    () => buildingProducts.filter((p) => Number(p.currentStock || 0) <= Number(p.reorderLevel || 0)),
    [buildingProducts]
  );

  const totalInventoryValuation = useMemo(
    () =>
      buildingProducts.reduce(
        (sum, p) => sum + (Number(p.currentStock || 0) * Number(p.unitCost || 0)),
        0
      ),
    [buildingProducts]
  );

  const activeCategoriesCount = useMemo(
    () => new Set(buildingProducts.map((p) => p.category).filter(Boolean)).size,
    [buildingProducts]
  );

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-slate-100 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none ${isBuilding ? 'bg-emerald-600/10' : 'bg-blue-600/5'}`} />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-start justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-blue-400">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isBuilding ? 'Building Construction Command' : 'Site Operations Command'}</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-500 font-mono lowercase tracking-normal hidden sm:inline">
                {activeSite?.siteId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase break-words">
              {activeSite?.siteName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              {isBuilding 
                ? 'Central site inventory, building materials catalog, reorder levels, and dispatch.'
                : 'Live site metrics, equipment telematics, and material haulage.'}
            </p>
          </div>

          {/* Action Buttons: Context-aware */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full xl:w-auto">
            {isBuilding ? (
              <>
                <button 
                  onClick={() => onNavigateTab('products')}
                  className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Package className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>View Products</span>
                </button>

                <button 
                  onClick={() => onNavigateTab('transactions')}
                  className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Stock In / Out</span>
                </button>

                <button 
                  onClick={() => onNavigateTab('products')}
                  className="col-span-2 sm:col-span-1 w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>+ Add Product</span>
                </button>
              </>
            ) : (
              <>
                {isAdmin && (
                  <button 
                    onClick={() => onNavigateTab('road-sites')}
                    className="w-full sm:w-auto justify-center px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-slate-300 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">+ Add Section</span>
                  </button>
                )}
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards: Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isBuilding ? (
          <>
            {/* Building Card 1: Total Catalog Items */}
            <div 
              onClick={() => onNavigateTab('products')}
              className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Catalog Products<br/>Registered
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-900/30 flex items-center justify-center border border-blue-800/50 shrink-0">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    {totalBuildingSkus}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500">Items</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-blue-400 truncate">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">{activeCategoriesCount} active material classes</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
                  <span>Manage product master</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Building Card 2: Low Stock Alerts */}
            <div 
              onClick={() => onNavigateTab('products')}
              className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-rose-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Low Stock<br/>Threshold Alerts
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-900/30 flex items-center justify-center border border-rose-800/50 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${lowStockItems.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {lowStockItems.length}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500">Need PO</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-rose-400 truncate">
                  {lowStockItems.length > 0 ? `${lowStockItems[0]?.name} below reorder` : 'All materials above safe stock'}
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-rose-400 transition-colors">
                  <span>View reorder list</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Building Card 3: Stock Transactions Log */}
            <div 
              onClick={() => onNavigateTab('transactions')}
              className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Stock Transfers<br/>& Receipts
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-900/30 flex items-center justify-center border border-cyan-800/50 shrink-0">
                    <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    {stockTransactions.length}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500">Vouchers</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-cyan-400 truncate">
                  Inward & Outward Site Passes
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <span>View transfer entries</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Building Card 4: Total Inventory Valuation */}
            <div 
              onClick={() => onNavigateTab('products')}
              className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Total Inventory<br/>Holding Value
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center border border-emerald-800/50 shrink-0">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                    ₹{totalInventoryValuation.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-emerald-400 truncate">
                  Yard & central shed inventory
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">
                  <span>Audit stock value</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Road Card 1: Total Material Laid */}
            <div 
              onClick={() => onNavigateTab('haulage-trips')}
              className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Total Material Laid<br/>(Today)
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
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-blue-400 truncate">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">{siteTrips.length} material batches</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
                  <span>View haulage logs</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Road Card 2: Active Trips */}
            <div 
              onClick={() => onNavigateTab('haulage-trips')}
              className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Active Trips<br/>Today
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
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-cyan-400 truncate">
                  {siteTrips.length} vehicles active
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <span>Check trip records</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Road Card 3: Diesel Dispensed */}
            <div 
              onClick={() => onNavigateTab('diesel')}
              className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Diesel<br/>Dispensed
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
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">
                  {siteDiesel.length} fuel voucher logs
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
                  <span>Manage diesel log</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Road Card 4: Site Expenses */}
            <div 
              onClick={() => onNavigateTab('site-expenses')}
              className="p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0B1220] border border-[#1E293B] shadow-xl hover:border-rose-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    Total Site<br/>Expenses
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-900/30 flex items-center justify-center border border-rose-800/50 shrink-0">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-rose-400 font-mono tracking-tight">
                    ₹{totalSiteExpensesAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-rose-400 truncate">
                  {siteExpenses.length} expense vouchers
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 group-hover:text-rose-400 transition-colors">
                  <span>View petty cash ledger</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Panels: Road vs Building */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
        {isBuilding ? (
          <>
            {/* Building Panel 1: Critical Low Stock Alert Summary */}
            <div className="lg:col-span-2 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0" />
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">Priority Restock & Reorder List</h2>
                </div>
                <button 
                  onClick={() => onNavigateTab('products')}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                >
                  <span>Open Master</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#080C14] border border-[#1E293B] text-center text-slate-400 text-xs flex-1 flex flex-col justify-center items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">✓</div>
                  <div>All items are comfortably above their minimum reorder thresholds.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  {lowStockItems.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white truncate max-w-[160px]">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Reorder: {item.reorderLevel} {item.unit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-rose-400 font-mono">{item.currentStock} {item.unit}</div>
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800">
                          Critical
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Building Panel 2: Quick Building Navigation */}
            <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">Inventory Modules</h2>
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
                  Building v2.0
                </span>
              </div>

              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <button 
                  onClick={() => onNavigateTab('products')}
                  className="w-full p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] hover:border-blue-500/50 hover:bg-[#121c33]/50 transition-all text-left group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                      Materials Catalog & Stock Registers
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Steel, cement, shuttering props, and aggregates
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

                <button 
                  onClick={() => onNavigateTab('transactions')}
                  className="w-full p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] hover:border-cyan-500/50 hover:bg-[#121c33]/50 transition-all text-left group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      Material Delivery Challans & Issue Slips
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Issue stock to tower contractors or receive vendor trucks
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Road Machinery Fleet Summary */}
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
                  <div className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2 font-mono">
                    0 <span className="text-xs sm:text-sm font-medium text-slate-500">Units</span>
                  </div>
                  <div className="text-[10px] text-slate-600">0 active machinery</div>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-slate-500 mb-1">Backhoe Loaders</div>
                  <div className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2 font-mono">
                    0 <span className="text-xs sm:text-sm font-medium text-slate-500">Units</span>
                  </div>
                  <div className="text-[10px] text-slate-600">0 active machinery</div>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-slate-500 mb-1">Tipper Dumpers</div>
                  <div className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2 font-mono">
                    0 <span className="text-xs sm:text-sm font-medium text-slate-500">Units</span>
                  </div>
                  <div className="text-[10px] text-slate-600">0 active tippers</div>
                </div>
              </div>
            </div>

            {/* Road Engineering Shortcuts */}
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
                  onClick={() => onNavigateTab('categories')}
                  className="w-full p-3 sm:p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] hover:border-blue-500/50 hover:bg-[#121c33]/50 transition-all text-left group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                      Material Rates & Master Spec
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isAdmin ? 'Manage schedule of rates and category specs' : 'View schedule of rates and specifications'}
                    </div>
                  </div>
                  {isAdmin ? (
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-transform group-hover:translate-x-1 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
