import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Truck,
  Fuel,
  DollarSign
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useRoadERP } from '../context/RoadERPContext';

export interface BillingTripRow {
  id: string;
  date: string;
  siteName: string;
  purchasedFrom: string;
  vehicleNumber: string;
  isRented: boolean;
  materialType: string;
  ratePerBrassOrTrip: number;
  tripsCount: number;
  qtyPerTripBrass: number;
  totalQuantityBrass: number;
  tripAmount: number;
  dieselLitresDeducted: number;
  dieselDeductionCost: number;
  netRowAmount: number;
}

export const FinalReport: React.FC = () => {
  const { siteSheets = [] } = (useERP?.() || {}) as any;
  const roadERP = useRoadERP?.() || {};

  // Filters
  const [selectedSite, setSelectedSite] = useState<string>('MULWAD');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vendorAdvanceReceived, setVendorAdvanceReceived] = useState<number>(0);

  // Storage stores
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

      const savedAdvances = localStorage.getItem('CONSTRUCTION_PRO_VENDOR_ADVANCES_V1');
      if (savedAdvances) {
        const advances = JSON.parse(savedAdvances);
        const totalAdv = Array.isArray(advances)
          ? advances.reduce((acc: number, a: any) => acc + Number(a.amount || 0), 0)
          : 0;
        setVendorAdvanceReceived(totalAdv);
      }
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

  // Transform raw data into the M B BILGI CONSTRUCTIONS billing ledger format
  const billingRows: BillingTripRow[] = useMemo(() => {
    if (!storedTrips || storedTrips.length === 0) {
      // Mock rows representing exact format from screenshot
      return [
        { id: '1', date: '05-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '4524', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 3, qtyPerTripBrass: 6, totalQuantityBrass: 18, tripAmount: 18000, dieselLitresDeducted: 90.0, dieselDeductionCost: 9000.0, netRowAmount: 9000.0 },
        { id: '2', date: '05-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '5321', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 3, qtyPerTripBrass: 6, totalQuantityBrass: 18, tripAmount: 18000, dieselLitresDeducted: 90.0, dieselDeductionCost: 9000.0, netRowAmount: 9000.0 },
        { id: '3', date: '05-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '7144', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 3, qtyPerTripBrass: 6, totalQuantityBrass: 18, tripAmount: 18000, dieselLitresDeducted: 90.0, dieselDeductionCost: 9000.0, netRowAmount: 9000.0 },
        { id: '4', date: '05-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '7243', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 3, qtyPerTripBrass: 6, totalQuantityBrass: 18, tripAmount: 18000, dieselLitresDeducted: 90.0, dieselDeductionCost: 9000.0, netRowAmount: 9000.0 },
        { id: '5', date: '05-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '3146', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 2, qtyPerTripBrass: 6, totalQuantityBrass: 12, tripAmount: 12000, dieselLitresDeducted: 80.0, dieselDeductionCost: 8000.0, netRowAmount: 4000.0 },
        { id: '6', date: '05-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '8922', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 3, qtyPerTripBrass: 6, totalQuantityBrass: 18, tripAmount: 18000, dieselLitresDeducted: 90.0, dieselDeductionCost: 9000.0, netRowAmount: 9000.0 },
        { id: '7', date: '05-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '9260', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 3, qtyPerTripBrass: 6, totalQuantityBrass: 18, tripAmount: 18000, dieselLitresDeducted: 90.0, dieselDeductionCost: 9000.0, netRowAmount: 9000.0 },
        { id: '8', date: '05-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '9120', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 3, qtyPerTripBrass: 6, totalQuantityBrass: 18, tripAmount: 18000, dieselLitresDeducted: 90.0, dieselDeductionCost: 9000.0, netRowAmount: 9000.0 },
        { id: '9', date: '02-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '9241', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 3, qtyPerTripBrass: 6, totalQuantityBrass: 18, tripAmount: 18000, dieselLitresDeducted: 90.0, dieselDeductionCost: 9000.0, netRowAmount: 9000.0 },
        { id: '10', date: '02-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '8922', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 2, qtyPerTripBrass: 6, totalQuantityBrass: 12, tripAmount: 12000, dieselLitresDeducted: 60.0, dieselDeductionCost: 6000.0, netRowAmount: 6000.0 }
      ];
    }

    return storedTrips.map((t, idx) => {
      const tripsCount = Number(t?.dayTrips ?? t?.trips ?? 1);
      const qtyPerTrip = Number(t?.brassPerTrip ?? t?.capacityBrass ?? 6);
      const totalBrass = tripsCount * qtyPerTrip;
      const ratePerTrip = Number(t?.ratePerTrip ?? 6000);
      const grossAmount = tripsCount * ratePerTrip;

      // Extract short 4-digit tipper code
      const fullPlate = String(t?.vehicleNumber || t?.vehicleNo || '4524').trim();
      const vehicleNum = fullPlate.length > 4 ? fullPlate.slice(-4) : fullPlate;

      // Find diesel linked to this vehicle
      const matchedFuel = storedDiesel.filter(
        (d) => String(d?.equipmentOrVehicle || '').includes(vehicleNum) && (d?.date === t?.date)
      );
      const dieselLitres = matchedFuel.reduce((acc, f) => acc + Number(f.litres || f.qtyLitres || 0), 0) || (tripsCount * 30);
      const dieselCost = matchedFuel.reduce((acc, f) => acc + Number(f.totalCost || (f.litres * (f.rate || 100)) || 0), 0) || (dieselLitres * 100);

      return {
        id: t?.id || String(idx + 1),
        date: t?.date || '05-10-2026',
        siteName: (t?.siteName || selectedSite || 'MULWAD').toUpperCase(),
        purchasedFrom: (t?.quarry || t?.sourceLocation || 'MBB CRUSHER').toUpperCase(),
        vehicleNumber: vehicleNum,
        isRented: true,
        materialType: (t?.materialType || t?.material || 'WMM').toUpperCase(),
        ratePerBrassOrTrip: ratePerTrip,
        tripsCount,
        qtyPerTripBrass: qtyPerTrip,
        totalQuantityBrass: totalBrass,
        tripAmount: grossAmount,
        dieselLitresDeducted: dieselLitres,
        dieselDeductionCost: dieselCost,
        netRowAmount: grossAmount - dieselCost
      };
    });
  }, [storedTrips, storedDiesel, selectedSite]);

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

  // Filter rows
  const filteredRows = useMemo(() => {
    return billingRows.filter((r) => {
      const matchSite = selectedSite === 'ALL' || r.siteName.includes(selectedSite.toUpperCase());
      const matchDate = isDateInFilter(r.date);
      const matchSearch =
        r.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.materialType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.purchasedFrom.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchDate && matchSearch;
    });
  }, [billingRows, selectedSite, dateFilter, searchTerm]);

  // Site options
  const siteOptions = useMemo(() => {
    const set = new Set<string>();
    set.add('MULWAD');
    set.add('SINDAGI HIGHWAY');
    siteSheets.forEach((s: any) => s?.siteName && set.add(s.siteName));
    storedTrips.forEach((t) => t?.siteName && set.add(t.siteName));
    return Array.from(set);
  }, [siteSheets, storedTrips]);

  // Totals
  const totalTrips = filteredRows.reduce((acc, r) => acc + r.tripsCount, 0);
  const totalBrass = filteredRows.reduce((acc, r) => acc + r.totalQuantityBrass, 0);
  const totalGrossAmount = filteredRows.reduce((acc, r) => acc + r.tripAmount, 0);
  const totalDieselCost = filteredRows.reduce((acc, r) => acc + r.dieselDeductionCost, 0);
  const totalDieselLitres = filteredRows.reduce((acc, r) => acc + r.dieselLitresDeducted, 0);
  const totalNetRowAmount = filteredRows.reduce((acc, r) => acc + r.netRowAmount, 0);
  const netPayableToVendor = totalGrossAmount - vendorAdvanceReceived - totalDieselCost;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvRows: string[] = [];
    csvRows.push(['M B BILGI CONSTRUCTIONS - VENDOR RECONCILIATION BILL'].join(','));
    csvRows.push([`Site: ${selectedSite}`, `Generated On: ${new Date().toLocaleString()}`].join(','));
    csvRows.push(['']);

    csvRows.push(['DATE', 'SITE', 'PURCHASED FROM', 'VEHICLE', 'MATERIAL', 'TRIPS', 'QTY/TRIP (BRASS)', 'RATE (₹)', 'TRIP AMOUNT (₹)', '(-) DIESEL (₹)', 'NET ROW (₹)'].join(','));
    filteredRows.forEach((r) => {
      csvRows.push([
        r.date,
        `"${r.siteName}"`,
        `"${r.purchasedFrom}"`,
        `"${r.vehicleNumber} (RENTED)"`,
        `"${r.materialType}"`,
        r.tripsCount,
        r.qtyPerTripBrass,
        r.ratePerBrassOrTrip,
        r.tripAmount,
        r.dieselDeductionCost,
        r.netRowAmount
      ].join(','));
    });
    csvRows.push(['']);
    csvRows.push(['TOTAL TRIPS & CHARGES', totalTrips, `${totalBrass} Brass`, '', '', '', '', '', totalGrossAmount, totalDieselCost, totalNetRowAmount].join(','));
    csvRows.push(['LESS: ADVANCE PAYMENT RECEIVED', vendorAdvanceReceived].join(','));
    csvRows.push(['LESS: DIESEL ISSUED TO RENTED VEHICLES', totalDieselCost].join(','));
    csvRows.push(['NET PAYABLE AMOUNT TO VENDOR', netPayableToVendor].join(','));

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MB_Bilgi_Constructions_Bill_${selectedSite}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-slate-100 font-sans print:p-0 print:m-0 print:text-black print:bg-white">
      
      {/* Screen Header Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                Vendor Billing & Final Statement
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Official M B Bilgi Constructions billing ledger and diesel deduction statement[cite: 6]
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#162032] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#162032] hover:bg-[#1E293B] text-slate-200 border border-[#1E293B] text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print to PDF</span>
          </button>
        </div>
      </div>

      {/* Screen Filters Bar (Hidden during print) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-sm print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tipper (e.g. 4524)..."
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
            <option value="ALL">All Time (01-10-2026 TO 31-10-2026)</option>
            <option value="TODAY">Today's Shift</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Current Month</option>
          </select>
        </div>
      </div>

      {/* Screen Overview Cards (Hidden during print) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-[#121927] border border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-slate-400">Total Trips</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalTrips}</div>
          <div className="text-xs text-slate-400 mt-1">{totalBrass} Brass hauled</div>
        </div>

        <div className="bg-[#121927] border border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-slate-400">Gross Freight</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">₹{totalGrossAmount.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-400 mt-1">Before deductions</div>
        </div>

        <div className="bg-[#121927] border border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-slate-400">Diesel Deduction</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">-₹{totalDieselCost.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-400 mt-1">{totalDieselLitres.toFixed(1)} Litres issued</div>
        </div>

        <div className="bg-[#121927] border border-blue-500/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase text-blue-300">Net Vendor Payable</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">₹{netPayableToVendor.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-400 mt-1">Final balance to release</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT PRINTABLE STATEMENT CONTAINER (MATCHES SCREENSHOT FORMAT)           */}
      {/* ========================================================================= */}
      <div 
        id="printable-report"
        className="bg-white text-black p-8 sm:p-12 rounded-2xl shadow-2xl print:shadow-none print:p-0 print:m-0 print:rounded-none max-w-[1150px] mx-auto border border-slate-200 print:border-none"
      >
        {/* Document Header */}
        <div className="text-center pb-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase font-sans">
            M B BILGI CONSTRUCTIONS
          </h1>
        </div>

        {/* Thick Horizontal Rule */}
        <div className="border-b-[3px] border-black my-2" />

        {/* Sub Header: Crusher & Site Range */}
        <div className="flex items-center justify-between font-black text-xs sm:text-sm uppercase tracking-wider py-1 text-black">
          <span>MBB CRUSHER</span>
          <span>SITE: {selectedSite} (01-10-2026 TO 31-10-2026)</span>
        </div>

        {/* Medium divider */}
        <div className="border-b-[2px] border-black mb-3" />

        {/* Main Statement Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] sm:text-[11px] font-sans text-black">
            <thead>
              <tr className="border-b-[2px] border-black text-left font-black tracking-tight text-black">
                <th className="py-2 px-1">DATE</th>
                <th className="py-2 px-1">SITE</th>
                <th className="py-2 px-1">PURCHASED<br />FROM</th>
                <th className="py-2 px-1">VEHICLE</th>
                <th className="py-2 px-1">MATERIAL / TRIP<br />TYPE</th>
                <th className="py-2 px-1 text-center">TRIPS</th>
                <th className="py-2 px-1 text-center">QTY/TRIP</th>
                <th className="py-2 px-1 text-right">RATE<br />(₹)</th>
                <th className="py-2 px-1 text-right">TRIP / MAT<br />AMOUNT (₹)</th>
                <th className="py-2 px-1 text-right">(-) DIESEL (₹)</th>
                <th className="py-2 px-1 text-right">NET ROW<br />(₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-black">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                  <td className="py-2 px-1 font-mono">{row.date}</td>
                  <td className="py-2 px-1 font-black">{row.siteName}</td>
                  <td className="py-2 px-1">{row.purchasedFrom}</td>
                  <td className="py-2 px-1">
                    <div className="font-black">{row.vehicleNumber}</div>
                    {row.isRented && <div className="text-[9px] text-slate-700 font-black">(RENTED)</div>}
                  </td>
                  <td className="py-2 px-1">
                    <div className="font-black">{row.materialType}</div>
                    <div className="text-[9px] text-slate-700 font-semibold">(₹1500/Brass)</div>
                  </td>
                  <td className="py-2 px-1 text-center font-black">{row.tripsCount}</td>
                  <td className="py-2 px-1 text-center">
                    <div className="font-semibold">{row.qtyPerTripBrass} Brass</div>
                    <div className="text-[9px] text-slate-600 font-medium">(Haul)</div>
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-semibold">
                    ₹{row.ratePerBrassOrTrip?.toLocaleString('en-IN')}<br />
                    <span className="text-[9px] text-slate-600 font-sans font-normal">/Trip</span>
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-black">
                    ₹{row.tripAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono text-black font-semibold">
                    - ₹{row.dieselDeductionCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}<br />
                    <span className="text-[9px] text-slate-600 font-sans">({row.dieselLitresDeducted.toFixed(1)} L)</span>
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-black text-black">
                    ₹{row.netRowAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Thick line before total row */}
        <div className="border-t-[2px] border-black my-2" />

        {/* Totals Summary Row */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-black py-1.5 px-1 text-black">
          <div className="w-1/3">TOTAL TRIPS & CHARGES:</div>
          <div className="w-16 text-center">{totalTrips} Trips</div>
          <div className="w-24 text-center">{totalBrass.toFixed(0)} Brass</div>
          <div className="w-20 text-center">-</div>
          <div className="w-24 text-right font-mono">₹{totalGrossAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</div>
          <div className="w-28 text-right font-mono">- ₹{totalDieselCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</div>
          <div className="w-28 text-right font-mono">₹{totalNetRowAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</div>
        </div>

        <div className="border-b-[1.5px] border-slate-300 my-2" />

        {/* Bottom Vendor Settlement Reconciliation Block */}
        <div className="space-y-1.5 pt-2 text-[11px] sm:text-xs font-black text-black max-w-xl ml-auto pr-1">
          <div className="flex justify-between items-center py-1">
            <span>(-) LESS: ADVANCE PAYMENT RECEIVED:</span>
            <span className="font-mono">₹{vendorAdvanceReceived.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span>(-) LESS: DIESEL ISSUED TO RENTED VEHICLES ({totalDieselLitres.toFixed(1)} L):</span>
            <span className="font-mono">- ₹{totalDieselCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</span>
          </div>

          <div className="border-b-[1.5px] border-slate-300 my-1" />

          <div className="flex justify-between items-center py-2 text-xs sm:text-sm font-black border-t-2 border-black border-b-2">
            <span>(=) NET PAYABLE AMOUNT TO VENDOR:</span>
            <span className="font-mono text-sm sm:text-base font-black">
              ₹{netPayableToVendor.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
            </span>
          </div>
        </div>
      </div>

      {/* Print CSS Rules */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, aside, nav, button, input, select, .print\\:hidden {
            display: none !important;
          }
          #printable-report {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FinalReport;
