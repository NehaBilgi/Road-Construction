import React, { useState, useMemo } from 'react';
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
  Search
} from 'lucide-react';
import { useERP } from '../context/ERPContext';

// Types for Final Report records
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
  meterReading?: number;
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
  category: 'LABOR' | 'REPAIR' | 'FOOD_TEA' | 'POLICE_RTO' | 'MATERIAL_PURCHASE' | 'MISC';
  description: string;
  amount: number;
  paidTo: string;
  paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  voucherNumber: string;
}

export const FinalReport: React.FC = () => {
  const { trips, dieselLogs, expenses } = (useERP?.() || {}) as any;

  // Filter states
  const [selectedSite, setSelectedSite] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'TRIPS' | 'DIESEL' | 'EXPENSES'>('ALL');

  // Fallback demo records if context arrays are empty
  const rawTrips: TripRecord[] = useMemo(() => {
    if (trips && trips.length > 0) return trips;
    return [
      { id: 'TRP-101', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', vehicleNumber: 'KA-28-AA-1002', driverName: 'Ramesh Patil', materialType: 'GSB Layer 2', quantityBrass: 6.5, sourceLocation: 'Ainapur Quarry', destinationCh: 'Ch 12+800', status: 'DELIVERED' },
      { id: 'TRP-102', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', vehicleNumber: 'KA-28-B-4509', driverName: 'Sunil Rathod', materialType: 'WMM Grade 1', quantityBrass: 7.0, sourceLocation: 'Ainapur Crusher', destinationCh: 'Ch 13+100', status: 'DELIVERED' },
      { id: 'TRP-103', date: '2026-10-05', siteName: 'Mulwad Bypass (Ch. 12+400)', vehicleNumber: 'KA-29-C-8812', driverName: 'Irfan Nadaf', materialType: 'Sub-grade Soil', quantityBrass: 6.0, sourceLocation: 'Borrow Area 3', destinationCh: 'Ch 11+900', status: 'DELIVERED' },
      { id: 'TRP-104', date: '2026-10-04', siteName: 'Bijapur Ring Road Phase 2', vehicleNumber: 'MH-12-Q-7789', driverName: 'Santosh Chavan', materialType: 'Bituminous Concrete', quantityBrass: 5.8, sourceLocation: 'Hot Mix Plant', destinationCh: 'Ch 04+200', status: 'DELIVERED' }
    ];
  }, [trips]);

  const rawDiesel: DieselRecord[] = useMemo(() => {
    if (dieselLogs && dieselLogs.length > 0) return dieselLogs;
    return [
      { id: 'DSL-401', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', equipmentOrVehicle: 'JCB 3DX (Excavator-1)', meterReading: 4890, litres: 75, ratePerLitre: 91.5, totalCost: 6862.5, dispensedBy: 'Mahesh Site Sup.', voucherNumber: 'DS-991' },
      { id: 'DSL-402', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', equipmentOrVehicle: 'Vibromax Roller 11 Ton', meterReading: 2130, litres: 60, ratePerLitre: 91.5, totalCost: 5490.0, dispensedBy: 'Mahesh Site Sup.', voucherNumber: 'DS-992' },
      { id: 'DSL-403', date: '2026-10-05', siteName: 'Mulwad Bypass (Ch. 12+400)', equipmentOrVehicle: 'Tipper KA-28-AA-1002', meterReading: 44210, litres: 110, ratePerLitre: 91.5, totalCost: 10065.0, dispensedBy: 'Basavaraj Ops', voucherNumber: 'DS-989' },
      { id: 'DSL-404', date: '2026-10-04', siteName: 'Bijapur Ring Road Phase 2', equipmentOrVehicle: 'Sensor Paver Vogele', meterReading: 1780, litres: 140, ratePerLitre: 91.5, totalCost: 12810.0, dispensedBy: 'Riyaz Tech', voucherNumber: 'DS-980' }
    ];
  }, [dieselLogs]);

  const rawExpenses: ExpenseRecord[] = useMemo(() => {
    if (expenses && expenses.length > 0) return expenses;
    return [
      { id: 'EXP-801', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', category: 'LABOR', description: 'Daily manual labor gang for camber lining & rolling', amount: 4800, paidTo: 'Gang Mestri Shankar', paymentMode: 'CASH', voucherNumber: 'V-1044' },
      { id: 'EXP-802', date: '2026-10-06', siteName: 'Mulwad Bypass (Ch. 12+400)', category: 'REPAIR', description: 'Hydraulic hose replacement for Grader CAT 120K', amount: 3650, paidTo: 'Karnataka Hydraulics', paymentMode: 'UPI', voucherNumber: 'V-1045' },
      { id: 'EXP-803', date: '2026-10-05', siteName: 'Mulwad Bypass (Ch. 12+400)', category: 'FOOD_TEA', description: 'Site staff & operator lunch / tea expenses', amount: 1120, paidTo: 'Hotel Basaveshwar', paymentMode: 'UPI', voucherNumber: 'V-1041' },
      { id: 'EXP-804', date: '2026-10-04', siteName: 'Bijapur Ring Road Phase 2', category: 'POLICE_RTO', description: 'Route safety traffic diversion signboards & local permits', amount: 2500, paidTo: 'Traffic Safety Agency', paymentMode: 'BANK_TRANSFER', voucherNumber: 'V-1033' }
    ];
  }, [expenses]);

  // Filters
  const filteredTrips = useMemo(() => {
    return rawTrips.filter((item) => {
      const matchSite = selectedSite === 'ALL' || item.siteName.toLowerCase().includes(selectedSite.toLowerCase());
      const matchSearch =
        item.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.driverName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchSearch;
    });
  }, [rawTrips, selectedSite, searchTerm]);

  const filteredDiesel = useMemo(() => {
    return rawDiesel.filter((item) => {
      const matchSite = selectedSite === 'ALL' || item.siteName.toLowerCase().includes(selectedSite.toLowerCase());
      const matchSearch =
        item.equipmentOrVehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dispensedBy.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchSearch;
    });
  }, [rawDiesel, selectedSite, searchTerm]);

  const filteredExpenses = useMemo(() => {
    return rawExpenses.filter((item) => {
      const matchSite = selectedSite === 'ALL' || item.siteName.toLowerCase().includes(selectedSite.toLowerCase());
      const matchSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchSearch;
    });
  }, [rawExpenses, selectedSite, searchTerm]);

  // Aggregated KPIs
  const totalTripsCount = filteredTrips.length;
  const totalBrassLaid = filteredTrips.reduce((acc, t) => acc + (t.quantityBrass || 0), 0);

  const totalDieselLitres = filteredDiesel.reduce((acc, d) => acc + (d.litres || 0), 0);
  const totalDieselSpend = filteredDiesel.reduce((acc, d) => acc + (d.totalCost || 0), 0);

  const totalExpenseSpend = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const grandTotalCost = totalDieselSpend + totalExpenseSpend;

  // CSV Exporter
  const handleExportCSV = () => {
    const csvRows: string[] = [];
    csvRows.push(['SITE FINAL REPORT SUMMARY'].join(','));
    csvRows.push([`Site Filter: ${selectedSite}`, `Generated On: ${new Date().toLocaleDateString()}`].join(','));
    csvRows.push(['']);

    csvRows.push(['--- 1. HAULAGE & MATERIAL TRIPS ---'].join(','));
    csvRows.push(['Date', 'Vehicle No', 'Driver', 'Material', 'Quantity (Brass)', 'Source', 'Destination'].join(','));
    filteredTrips.forEach((t) => {
      csvRows.push([t.date, t.vehicleNumber, t.driverName, t.materialType, t.quantityBrass, t.sourceLocation, t.destinationCh].join(','));
    });
    csvRows.push(['']);

    csvRows.push(['--- 2. DIESEL LOGS ---'].join(','));
    csvRows.push(['Date', 'Equipment/Vehicle', 'Litres', 'Rate (₹)', 'Total Cost (₹)', 'Voucher', 'Dispensed By'].join(','));
    filteredDiesel.forEach((d) => {
      csvRows.push([d.date, d.equipmentOrVehicle, d.litres, d.ratePerLitre, d.totalCost, d.voucherNumber, d.dispensedBy].join(','));
    });
    csvRows.push(['']);

    csvRows.push(['--- 3. SITE EXPENSES & PETTY CASH ---'].join(','));
    csvRows.push(['Date', 'Category', 'Description', 'Amount (₹)', 'Paid To', 'Mode', 'Voucher'].join(','));
    filteredExpenses.forEach((e) => {
      csvRows.push([e.date, e.category, `"${e.description.replace(/"/g, '""')}"`, e.amount, e.paidTo, e.paymentMode, e.voucherNumber].join(','));
    });
    csvRows.push(['']);

    csvRows.push(['--- EXECUTIVE TOTALS ---'].join(','));
    csvRows.push(['Total Trips Count', totalTripsCount].join(','));
    csvRows.push(['Total Material (Brass)', totalBrassLaid.toFixed(2)].join(','));
    csvRows.push(['Total Diesel Litres', totalDieselLitres.toFixed(1)].join(','));
    csvRows.push(['Total Diesel Cost (₹)', totalDieselSpend.toFixed(2)].join(','));
    csvRows.push(['Total Site Expenses (₹)', totalExpenseSpend.toFixed(2)].join(','));
    csvRows.push(['GRAND TOTAL SITE BURN (₹)', grandTotalCost.toFixed(2)].join(','));

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Site_Final_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-slate-100 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
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
                Audit-ready breakdown of trips haulage, diesel consumption, and petty cash expenses
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-sm">
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
            <option value="ALL">All Ongoing Sites</option>
            <option value="Mulwad">Mulwad Bypass Site</option>
            <option value="Bijapur">Bijapur Ring Road</option>
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
            <option value="TODAY">Today's Shift</option>
            <option value="WEEK">Current Week</option>
            <option value="MONTH">Current Month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <span>{totalTripsCount} Trips logged</span>
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
            <span>Fuel Burn: <strong className="text-slate-200">₹{totalDieselSpend.toLocaleString()}</strong></span>
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
            <span className="text-3xl font-black text-rose-400">₹{totalExpenseSpend.toLocaleString()}</span>
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
            <span className="text-3xl font-black text-white">₹{grandTotalCost.toLocaleString()}</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Diesel (₹{totalDieselSpend.toLocaleString()}) + Site (₹{totalExpenseSpend.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2 text-xs font-bold">
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
        <div className="bg-[#121927] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
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
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0D111D]/80 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Trip ID / Date</th>
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
                      <div className="font-bold text-slate-200">{trip.vehicleNumber}</div>
                      <div className="text-[10px] text-slate-500">{trip.driverName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800 text-[10px] font-bold">
                        {trip.materialType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                      {trip.quantityBrass} <span className="text-[10px] text-slate-400">Brass</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="truncate max-w-[200px] text-slate-300">{trip.sourceLocation}</div>
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
        <div className="bg-[#121927] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
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
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0D111D]/80 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Voucher / Date</th>
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
                      ₹{d.totalCost.toLocaleString()}
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
        <div className="bg-[#121927] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
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
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0D111D]/80 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Voucher / Date</th>
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
                      ₹{exp.amount.toLocaleString()}
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
