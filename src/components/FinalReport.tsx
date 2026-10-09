import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Truck,
  Fuel,
  DollarSign,
  Download,
  Printer,
  Calendar,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  TrendingDown,
  Layers,
  Search,
  Building,
  RefreshCw
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useRoadERP } from '../context/RoadERPContext';

export interface TripRecord {
  id: string;
  date: string;
  siteName: string;
  vehicleNumber: string;
  driverName: string;
  materialType: string;
  quantityBrass: number;
  sourceLocation: string;
  destinationCh: string;
  status: 'DELIVERED' | 'IN_TRANSIT';
}

export interface DieselRecord {
  id: string;
  date: string;
  siteName: string;
  equipmentOrVehicle: string;
  meterReading?: number | string;
  litres: number;
  ratePerLitre: number;
  totalCost: number;
  dispensedBy: string;
  voucherNumber: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  siteName: string;
  category: string;
  description: string;
  amount: number;
  paidTo: string;
  paymentMode: string;
  voucherNumber: string;
}

export const FinalReport: React.FC = () => {
  const { siteSheets = [], selectedSiteId } = (useERP?.() || {}) as any;
  const roadERP = (useRoadERP?.() || {}) as any;

  // Filter States
  const [selectedSite, setSelectedSite] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'TRIPS' | 'DIESEL' | 'EXPENSES'>('ALL');

  // Raw Storage Stores
  const [storedTrips, setStoredTrips] = useState<any[]>([]);
  const [storedDiesel, setStoredDiesel] = useState<any[]>([]);
  const [storedExpenses, setStoredExpenses] = useState<any[]>([]);

  // Synchronize with LocalStorage and ERP Context
  const loadData = useCallback(() => {
    try {
      const savedTrips = localStorage.getItem('CONSTRUCTION_PRO_HAULAGE_TRIPS_V2');
      setStoredTrips(savedTrips ? JSON.parse(savedTrips) : roadERP.trips || []);

      const savedDiesel = localStorage.getItem('CONSTRUCTION_PRO_DIESEL_LOGS_V1');
      setStoredDiesel(savedDiesel ? JSON.parse(savedDiesel) : roadERP.fuelLogs || []);

      const savedExpenses = localStorage.getItem('CONSTRUCTION_PRO_SITE_EXPENSES_V1');
      setStoredExpenses(savedExpenses ? JSON.parse(savedExpenses) : roadERP.expenses || []);
    } catch (err) {
      console.error('Failed to parse site data from storage:', err);
    }
  }, [roadERP]);

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('focus', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('focus', loadData);
    };
  }, [loadData]);

  // Normalized Trips Data
  const normalizedTrips: TripRecord[] = useMemo(() => {
    if (storedTrips.length === 0) {
      return [
        { id: 'TRP-101', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', vehicleNumber: 'KA-28-AA-1002', driverName: 'Ramesh Patil', materialType: 'GSB Layer 2', quantityBrass: 6.5, sourceLocation: 'Ainapur Quarry', destinationCh: 'Ch 12+800', status: 'DELIVERED' },
        { id: 'TRP-102', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', vehicleNumber: 'KA-28-B-4509', driverName: 'Sunil Rathod', materialType: 'WMM Grade 1', quantityBrass: 7.0, sourceLocation: 'Ainapur Crusher', destinationCh: 'Ch 13+100', status: 'DELIVERED' },
        { id: 'TRP-103', date: '2026-10-05', siteName: 'Mulwad Bypass (Ch. 12+400)', vehicleNumber: 'KA-29-C-8812', driverName: 'Irfan Nadaf', materialType: 'Sub-grade Soil', quantityBrass: 6.0, sourceLocation: 'Borrow Area 3', destinationCh: 'Ch 11+900', status: 'DELIVERED' }
      ];
    }
    return storedTrips.map((t, idx) => {
      const tripCount = Number(t?.dayTrips ?? t?.trips ?? 1);
      const brassPerTrip = Number(t?.brassPerTrip ?? t?.capacityBrass ?? t?.quantityBrass ?? 0);
      return {
        id: t?.id || t?.tripId || `TRP-${idx + 101}`,
        date: t?.date || new Date().toISOString().slice(0, 10),
        siteName: t?.siteName || t?.site || 'Ongoing Highway Site',
        vehicleNumber: t?.vehicleNumber || t?.vehicleNo || 'KA-28-T-0000',
        driverName: t?.driverName || t?.driver || 'Site Operator',
        materialType: t?.materialType || t?.material || 'MoRTH Aggregate',
        quantityBrass: brassPerTrip > 0 ? (tripCount * brassPerTrip) : Number(t?.quantity || 0),
        sourceLocation: t?.sourceLocation || t?.quarry || 'Central Crusher',
        destinationCh: t?.destinationCh || t?.chainage || 'Active Section',
        status: t?.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'DELIVERED'
      };
    });
  }, [storedTrips]);

  // Normalized Diesel Data
  const normalizedDiesel: DieselRecord[] = useMemo(() => {
    if (storedDiesel.length === 0) {
      return [
        { id: 'DSL-401', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', equipmentOrVehicle: 'JCB 3DX (Excavator-1)', meterReading: 4890, litres: 75, ratePerLitre: 91.5, totalCost: 6862.5, dispensedBy: 'Mahesh Sup.', voucherNumber: 'DS-991' },
        { id: 'DSL-402', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', equipmentOrVehicle: 'Vibromax Roller 11 Ton', meterReading: 2130, litres: 60, ratePerLitre: 91.5, totalCost: 5490.0, dispensedBy: 'Mahesh Sup.', voucherNumber: 'DS-992' }
      ];
    }
    return storedDiesel.map((d, idx) => {
      const litres = Number(d?.litres ?? d?.qtyLitres ?? d?.litresDispensed ?? 0);
      const rate = Number(d?.ratePerLitre ?? d?.fuelRate ?? d?.rate ?? 91.5);
      const total = Number(d?.totalCost ?? d?.amount ?? (litres * rate));
      return {
        id: d?.id || `DSL-${idx + 401}`,
        date: d?.date || new Date().toISOString().slice(0, 10),
        siteName: d?.siteName || d?.site || 'Ongoing Highway Site',
        equipmentOrVehicle: d?.equipmentOrVehicle || d?.equipmentName || d?.vehicleNo || 'Site Equipment',
        meterReading: d?.meterReading || d?.hoursReading || 'N/A',
        litres,
        ratePerLitre: rate,
        totalCost: total,
        dispensedBy: d?.dispensedBy || d?.operator || 'Site Supervisor',
        voucherNumber: d?.voucherNumber || d?.slipNumber || `DS-${idx + 100}`
      };
    });
  }, [storedDiesel]);

  // Normalized Expenses Data
  const normalizedExpenses: ExpenseRecord[] = useMemo(() => {
    if (storedExpenses.length === 0) {
      return [
        { id: 'EXP-801', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', category: 'LABOR', description: 'Daily manual labor gang for camber lining & rolling', amount: 4800, paidTo: 'Gang Mestri Shankar', paymentMode: 'CASH', voucherNumber: 'V-1044' },
        { id: 'EXP-802', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', category: 'REPAIR', description: 'Hydraulic hose replacement for Grader CAT 120K', amount: 3650, paidTo: 'Karnataka Hydraulics', paymentMode: 'UPI', voucherNumber: 'V-1045' }
      ];
    }
    return storedExpenses.map((e, idx) => ({
      id: e?.id || `EXP-${idx + 801}`,
      date: e?.date || new Date().toISOString().slice(0, 10),
      siteName: e?.siteName || e?.costCenterChainage || 'Ongoing Highway Site',
      category: String(e?.category || 'MISC').toUpperCase(),
      description: e?.description || e?.particulars || 'Site petty cash expense',
      amount: Number(e?.amount ?? 0),
      paidTo: e?.paidTo || e?.payee || 'Vendor / Operator',
      paymentMode: String(e?.paymentMode || 'CASH').toUpperCase(),
      voucherNumber: e?.voucherNumber || e?.voucherNo || `V-${idx + 1001}`
    }));
  }, [storedExpenses]);

  // Available Unique Sites
  const siteOptions = useMemo(() => {
    const set = new Set<string>();
    siteSheets.forEach((s: any) => s?.siteName && set.add(s.siteName));
    normalizedTrips.forEach((t) => t.siteName && set.add(t.siteName));
    normalizedDiesel.forEach((d) => d.siteName && set.add(d.siteName));
    normalizedExpenses.forEach((e) => e.siteName && set.add(e.siteName));
    return Array.from(set);
  }, [siteSheets, normalizedTrips, normalizedDiesel, normalizedExpenses]);

  // Date Check Helper
  const isDateInFilter = (dateStr: string) => {
    if (dateFilter === 'ALL') return true;
    const target = new Date(dateStr);
    const now = new Date();
    if (isNaN(target.getTime())) return true;

    if (dateFilter === 'TODAY') {
      return target.toDateString() === now.toDateString();
    }
    if (dateFilter === 'WEEK') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return target >= oneWeekAgo && target <= now;
    }
    if (dateFilter === 'MONTH') {
      return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Filtered Datasets
  const filteredTrips = useMemo(() => {
    return normalizedTrips.filter((item) => {
      const matchSite = selectedSite === 'ALL' || item.siteName.toLowerCase().includes(selectedSite.toLowerCase());
      const matchDate = isDateInFilter(item.date);
      const matchSearch =
        item.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchDate && matchSearch;
    });
  }, [normalizedTrips, selectedSite, dateFilter, searchTerm]);

  const filteredDiesel = useMemo(() => {
    return normalizedDiesel.filter((item) => {
      const matchSite = selectedSite === 'ALL' || item.siteName.toLowerCase().includes(selectedSite.toLowerCase());
      const matchDate = isDateInFilter(item.date);
      const matchSearch =
        item.equipmentOrVehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dispensedBy.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchDate && matchSearch;
    });
  }, [normalizedDiesel, selectedSite, dateFilter, searchTerm]);

  const filteredExpenses = useMemo(() => {
    return normalizedExpenses.filter((item) => {
      const matchSite = selectedSite === 'ALL' || item.siteName.toLowerCase().includes(selectedSite.toLowerCase());
      const matchDate = isDateInFilter(item.date);
      const matchSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchDate && matchSearch;
    });
  }, [normalizedExpenses, selectedSite, dateFilter, searchTerm]);

  // Aggregated KPIs
  const totalTripsCount = filteredTrips.length;
  const totalBrassLaid = filteredTrips.reduce((acc, t) => acc + (t.quantityBrass || 0), 0);

  const totalDieselLitres = filteredDiesel.reduce((acc, d) => acc + (d.litres || 0), 0);
  const totalDieselSpend = filteredDiesel.reduce((acc, d) => acc + (d.totalCost || 0), 0);

  const totalExpenseSpend = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const grandTotalCost = totalDieselSpend + totalExpenseSpend;

  // Export to CSV Functionality
  const handleExportCSV = () => {
    const csvRows: string[] = [];
    csvRows.push(['CONSTRUCTION PRO ERP - CONSOLIDATED SITE REPORT'].join(','));
    csvRows.push([`Site Filter: ${selectedSite}`, `Date Scope: ${dateFilter}`, `Generated On: ${new Date().toLocaleString()}`].join(','));
    csvRows.push('');

    csvRows.push(['--- 1. HAULAGE & MATERIAL TRIPS ---'].join(','));
    csvRows.push(['Trip ID', 'Date', 'Site', 'Vehicle No', 'Driver', 'Material', 'Quantity (Brass)', 'Source', 'Destination', 'Status'].join(','));
    filteredTrips.forEach((t) => {
      csvRows.push([t.id, t.date, `"${t.siteName}"`, t.vehicleNumber, `"${t.driverName}"`, `"${t.materialType}"`, t.quantityBrass.toFixed(2), `"${t.sourceLocation}"`, `"${t.destinationCh}"`, t.status].join(','));
    });
    csvRows.push('');

    csvRows.push(['--- 2. DIESEL CONSUMPTION ---'].join(','));
    csvRows.push(['Voucher No', 'Date', 'Site', 'Equipment / Vehicle', 'Meter Reading', 'Litres', 'Rate (₹)', 'Total Amount (₹)', 'Dispensed By'].join(','));
    filteredDiesel.forEach((d) => {
      csvRows.push([d.voucherNumber, d.date, `"${d.siteName}"`, `"${d.equipmentOrVehicle}"`, d.meterReading, d.litres, d.ratePerLitre.toFixed(2), d.totalCost.toFixed(2), `"${d.dispensedBy}"`].join(','));
    });
    csvRows.push('');

    csvRows.push(['--- 3. PETTY CASH & EXPENSES ---'].join(','));
    csvRows.push(['Voucher No', 'Date', 'Site', 'Category', 'Description', 'Amount (₹)', 'Paid To', 'Payment Mode'].join(','));
    filteredExpenses.forEach((e) => {
      csvRows.push([e.voucherNumber, e.date, `"${e.siteName}"`, e.category, `"${e.description.replace(/"/g, '""')}"`, e.amount.toFixed(2), `"${e.paidTo}"`, e.paymentMode].join(','));
    });
    csvRows.push('');

    csvRows.push(['--- EXECUTIVE TOTALS ---'].join(','));
    csvRows.push(['Total Trips Completed', totalTripsCount].join(','));
    csvRows.push(['Total Material Volume (Brass)', totalBrassLaid.toFixed(2)].join(','));
    csvRows.push(['Total Diesel Litres Dispensed', totalDieselLitres.toFixed(1)].join(','));
    csvRows.push(['Total Diesel Outlay (₹)', totalDieselSpend.toFixed(2)].join(','));
    csvRows.push(['Total Site Expenses Outlay (₹)', totalExpenseSpend.toFixed(2)].join(','));
    csvRows.push(['GRAND TOTAL PROJECT BURN (₹)', grandTotalCost.toFixed(2)].join(','));

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Final_Site_Report_${selectedSite.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="final-report-print-root p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-slate-100 font-sans print:p-0 print:text-black">
      {/* Printable Letterhead (Shown Only When Printing) */}
      <div className="hidden print:block border-b-2 border-black pb-3 mb-4">
        <h1 className="text-xl font-black uppercase tracking-tight text-center">M B BILGI CONSTRUCTIONS</h1>
        <p className="text-[10px] text-center font-bold uppercase tracking-wide">
          Consolidated Road Site Operations &amp; Financial Audit Report
        </p>
        <div className="text-[9px] mt-2 flex justify-between">
          <span>Site: <strong>{selectedSite === 'ALL' ? 'All Sites' : selectedSite}</strong></span>
          <span>Date Scope: <strong>{dateFilter}</strong></span>
          <span>Date Generated: <strong>{new Date().toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                Consolidated Final Site Report
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Audit-ready ledger for material haulage trips, diesel burn, and petty cash vouchers
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="p-2 rounded-xl bg-[#162032] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#162032] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-sm print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vehicle, material, voucher, payee..."
            className="w-full bg-[#0D111D] border border-[#1E293B] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full bg-[#0D111D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="ALL">All Active Sites</option>
            {siteOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full bg-[#0D111D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="ALL">All Time / Cumulative</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">This Month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="report-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Trips & Material */}
        <div className="bg-[#121927] border border-[#1E293B] rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-400">Total Material Laid</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalBrassLaid.toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-400 uppercase">Brass</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <Truck className="w-3.5 h-3.5" />
            <span>{totalTripsCount} Trips completed</span>
          </div>
        </div>

        {/* Diesel Dispensed */}
        <div className="bg-[#121927] border border-[#1E293B] rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-400">Diesel Dispensed</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{totalDieselLitres.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-400 uppercase">Litres</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Fuel Outlay: <strong className="text-slate-200">₹{totalDieselSpend.toLocaleString('en-IN')}</strong></span>
            <span className="text-amber-400/90 font-mono">{filteredDiesel.length} logs</span>
          </div>
        </div>

        {/* Site Expenses */}
        <div className="bg-[#121927] border border-[#1E293B] rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-400">Site Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400">₹{totalExpenseSpend.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Petty Cash Vouchers</span>
            <span className="text-rose-400 font-mono">{filteredExpenses.length} records</span>
          </div>
        </div>

        {/* Total Financial Outlay */}
        <div className="bg-[#121927] border border-blue-500/40 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-blue-900/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black tracking-wider uppercase text-blue-300">Total Site Expenditure</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">₹{grandTotalCost.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Diesel (₹{totalDieselSpend.toLocaleString('en-IN')}) + Site (₹{totalExpenseSpend.toLocaleString('en-IN')})</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2 text-xs font-bold print:hidden">
        {[
          { key: 'ALL', label: 'All Operations' },
          { key: 'TRIPS', label: `Trips Haulage (${filteredTrips.length})` },
          { key: 'DIESEL', label: `Diesel Logs (${filteredDiesel.length})` },
          { key: 'EXPENSES', label: `Site Expenses (${filteredExpenses.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === tab.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#162032]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. TRIPS HAULAGE TABLE */}
      {(activeSubTab === 'ALL' || activeSubTab === 'TRIPS') && (
        <div className="report-print-section bg-[#121927] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#162032]/40">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                1. Material Haulage & Trips Records
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
              {filteredTrips.length} Trips
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="report-print-table w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0D111D]/80 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Trip ID / Date</th>
                  <th className="py-3 px-4">Site Name</th>
                  <th className="py-3 px-4">Vehicle & Driver</th>
                  <th className="py-3 px-4">Material Type</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Source / Destination</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] font-medium text-slate-300">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-[#162032]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white">{trip.id}</div>
                      <div className="text-[10px] text-slate-500">{trip.date}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="truncate max-w-[140px] text-slate-300">{trip.siteName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{trip.vehicleNumber}</div>
                      <div className="text-[10px] text-slate-500">{trip.driverName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800 text-[10px] font-bold">
                        {trip.materialType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                      {trip.quantityBrass.toFixed(2)} <span className="text-[10px] text-slate-400">Brass</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="truncate max-w-[180px] text-slate-300">{trip.sourceLocation}</div>
                      <div className="text-[10px] text-blue-400">{trip.destinationCh}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. DIESEL LOGS TABLE */}
      {(activeSubTab === 'ALL' || activeSubTab === 'DIESEL') && (
        <div className="report-print-section bg-[#121927] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#162032]/40">
            <div className="flex items-center gap-2.5">
              <Fuel className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                2. Diesel Dispensing & Machinery Logs
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-md">
              {filteredDiesel.length} Logs
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="report-print-table w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0D111D]/80 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Voucher / Date</th>
                  <th className="py-3 px-4">Site Name</th>
                  <th className="py-3 px-4">Equipment / Vehicle</th>
                  <th className="py-3 px-4">Meter Reading</th>
                  <th className="py-3 px-4">Litres Dispensed</th>
                  <th className="py-3 px-4">Rate (₹)</th>
                  <th className="py-3 px-4 text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] font-medium text-slate-300">
                {filteredDiesel.map((d) => (
                  <tr key={d.id} className="hover:bg-[#162032]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-amber-300">{d.voucherNumber}</div>
                      <div className="text-[10px] text-slate-500">{d.date}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[140px]">{d.siteName}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{d.equipmentOrVehicle}</div>
                      <div className="text-[10px] text-slate-500">By: {d.dispensedBy}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {d.meterReading ? `${d.meterReading} hrs/km` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 text-sm">
                      {d.litres} <span className="text-[10px] text-slate-400">L</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">₹{d.ratePerLitre.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-white text-sm">
                      ₹{d.totalCost.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SITE EXPENSES & PETTY CASH TABLE */}
      {(activeSubTab === 'ALL' || activeSubTab === 'EXPENSES') && (
        <div className="report-print-section bg-[#121927] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#162032]/40">
            <div className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-rose-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                3. Site Petty Cash & Operational Expenses
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-md">
              {filteredExpenses.length} Vouchers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="report-print-table w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0D111D]/80 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Voucher / Date</th>
                  <th className="py-3 px-4">Site Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Particulars / Description</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] font-medium text-slate-300">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#162032]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-rose-300">{exp.voucherNumber}</div>
                      <div className="text-[10px] text-slate-500">{exp.date}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[140px]">{exp.siteName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 max-w-xs">{exp.description}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{exp.paidTo}</td>
                    <td className="py-3 px-4 font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800">
                        {exp.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-rose-400 text-sm">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalReport;
