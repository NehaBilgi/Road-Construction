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
  Layers,
  Search,
  RefreshCw
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useRoadERP } from '../context/RoadERPContext';

export interface TripRecord {
  id: string;
  date: string;
  siteName: string;
  purchasedFrom: string;
  vehicleNumber: string;
  isRented?: boolean;
  materialType: string;
  ratePerBrassOrTrip?: number;
  tripsCount: number;
  qtyPerTripBrass: number;
  totalQuantityBrass: number;
  tripAmount: number;
  dieselDeductionCost: number;
  dieselLitresDeducted: number;
  netRowAmount: number;
}

export const FinalReport: React.FC = () => {
  const { siteSheets = [] } = (useERP?.() || {}) as any;
  const roadERP = useRoadERP?.() || {};

  // Filter States
  const [selectedSite, setSelectedSite] = useState<string>('MULWAD');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'MONTH'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vendorAdvanceReceived, setVendorAdvanceReceived] = useState<number>(0);

  // Storage data states
  const [storedTrips, setStoredTrips] = useState<any[]>([]);
  const [storedDiesel, setStoredDiesel] = useState<any[]>([]);
  const [storedExpenses, setStoredExpenses] = useState<any[]>([]);

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
      console.error('Failed to sync ERP storage:', err);
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

  // Normalize Trips into Billing Format
  const billingRows: TripRecord[] = useMemo(() => {
    if (storedTrips.length === 0) {
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
        { id: '10', date: '02-10-2026', siteName: 'MULWAD', purchasedFrom: 'MBB CRUSHER', vehicleNumber: '8922', isRented: true, materialType: 'WMM', ratePerBrassOrTrip: 6000, tripsCount: 2, qtyPerTripBrass: 6, totalQuantityBrass: 12, tripAmount: 12000, dieselLitresDeducted: 60.0, dieselDeductionCost: 6000.0, netRowAmount: 6000.0 },
      ];
    }

    return storedTrips.map((t, idx) => {
      const tripsCount = Number(t?.dayTrips ?? t?.trips ?? 1);
      const qtyPerTrip = Number(t?.brassPerTrip ?? t?.capacityBrass ?? 6);
      const totalBrass = tripsCount * qtyPerTrip;
      const ratePerTrip = Number(t?.ratePerTrip ?? 6000);
      const grossAmount = tripsCount * ratePerTrip;

      // Match corresponding diesel if logged for this vehicle on this day
      const vehicleNum = String(t?.vehicleNumber || t?.vehicleNo || '4524').trim();
      const matchedFuel = storedDiesel.filter(
        (d) => String(d?.equipmentOrVehicle || '').includes(vehicleNum) && (d?.date === t?.date)
      );
      const dieselLitres = matchedFuel.reduce((acc, f) => acc + Number(f.litres || f.qtyLitres || 0), 0) || (tripsCount * 30);
      const dieselCost = matchedFuel.reduce((acc, f) => acc + Number(f.totalCost || (f.litres * (f.rate || 100)) || 0), 0) || (dieselLitres * 100);

      return {
        id: t?.id || String(idx + 1),
        date: t?.date || '05-10-2026',
        siteName: (t?.siteName || 'MULWAD').toUpperCase(),
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
  }, [storedTrips, storedDiesel]);

  // Filtering
  const filteredRows = useMemo(() => {
    return billingRows.filter((r) => {
      const matchSite = selectedSite === 'ALL' || r.siteName.includes(selectedSite.toUpperCase());
      const matchSearch =
        r.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.materialType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.purchasedFrom.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchSearch;
    });
  }, [billingRows, selectedSite, searchTerm]);

  // Calculated Summaries
  const totalTrips = filteredRows.reduce((acc, r) => acc + r.tripsCount, 0);
  const totalBrass = filteredRows.reduce((acc, r) => acc + r.totalQuantityBrass, 0);
  const totalGrossAmount = filteredRows.reduce((acc, r) => acc + r.tripAmount, 0);
  const totalDieselCost = filteredRows.reduce((acc, r) => acc + r.dieselDeductionCost, 0);
  const totalDieselLitres = filteredRows.reduce((acc, r) => acc + r.dieselLitresDeducted, 0);
  const totalNetRowAmount = filteredRows.reduce((acc, r) => acc + r.netRowAmount, 0);

  const netPayableToVendor = totalGrossAmount - vendorAdvanceReceived - totalDieselCost;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-slate-100 font-sans print:p-0 print:m-0 print:text-black print:bg-white">
      
      {/* Interactive Controls (Hidden during printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-6 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            Vendor Billing & Final Haulage Statement
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconciliation statement for trips, rented tipper diesel deductions, and vendor payables
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="p-2 rounded-xl bg-[#162032] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print M B Bilgi Statement</span>
          </button>
        </div>
      </div>

      {/* Screen Filters Bar (Hidden in Print) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-sm print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tipper number (e.g. 4524)..."
            className="w-full bg-[#0D111D] border border-[#1E293B] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full bg-[#0D111D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="MULWAD">Site: MULWAD</option>
            <option value="SINDAGI">Site: SINDAGI HIGHWAY</option>
            <option value="ALL">All Sites</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="w-full bg-[#0D111D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Period: 01-10-2026 TO 31-10-2026</option>
            <option value="TODAY">Today's Shift</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT PRINTABLE STATEMENT CONTAINER (MATCHES SCREENSHOT SPECIFICATION)   */}
      {/* ========================================================================= */}
      <div className="bg-white text-black p-6 sm:p-10 rounded-2xl shadow-2xl print:shadow-none print:p-0 print:rounded-none max-w-[1200px] mx-auto border border-slate-200 print:border-none">
        
        {/* Document Header */}
        <div className="text-center pb-3">
          <h1 className="text-3xl font-black tracking-tight text-black uppercase font-sans">
            M B BILGI CONSTRUCTIONS
          </h1>
        </div>

        {/* Thick Horizontal Rule */}
        <div className="border-b-[2.5px] border-black my-2" />

        {/* Sub Header: Crusher & Site Range */}
        <div className="flex items-center justify-between font-black text-xs sm:text-sm uppercase tracking-wide py-1 text-black">
          <span>MBB CRUSHER</span>
          <span>SITE: {selectedSite} (01-10-2026 TO 31-10-2026)</span>
        </div>

        {/* Border divider */}
        <div className="border-b-[1.5px] border-black mb-2" />

        {/* Main Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] sm:text-[11px] font-sans text-black">
            <thead>
              <tr className="border-b-[1.5px] border-black text-left font-black tracking-tight">
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
                    {row.isRented && <div className="text-[9px] text-slate-600 font-bold">(RENTED)</div>}
                  </td>
                  <td className="py-2 px-1">
                    <div className="font-bold">{row.materialType}</div>
                    <div className="text-[9px] text-slate-600">(₹1500/Brass)</div>
                  </td>
                  <td className="py-2 px-1 text-center font-bold">{row.tripsCount}</td>
                  <td className="py-2 px-1 text-center">
                    <div>{row.qtyPerTripBrass} Brass</div>
                    <div className="text-[9px] text-slate-500">(Haul)</div>
                  </td>
                  <td className="py-2 px-1 text-right font-mono">
                    ₹{row.ratePerBrassOrTrip?.toLocaleString('en-IN')}<br />
                    <span className="text-[9px] text-slate-500 font-sans">/Trip</span>
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-black">
                    ₹{row.tripAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                  <td className="py-2 px-1 text-right font-mono text-black font-semibold">
                    - ₹{row.dieselDeductionCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}<br />
                    <span className="text-[9px] text-slate-500 font-sans">({row.dieselLitresDeducted.toFixed(1)} L)</span>
                  </td>
                  <td className="py-2 px-1 text-right font-mono font-black text-black">
                    ₹{row.netRowAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Thick divider before totals */}
        <div className="border-t-[1.5px] border-black my-2" />

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

          <div className="flex justify-between items-center py-1.5 text-xs sm:text-sm font-black border-t-2 border-black border-b-2">
            <span>(=) NET PAYABLE AMOUNT TO VENDOR:</span>
            <span className="font-mono text-sm sm:text-base font-black">
              ₹{netPayableToVendor.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
            </span>
          </div>
        </div>

        {/* Authorized Signatory Footer */}
        <div className="mt-14 pt-8 flex justify-between items-end text-[10px] text-slate-700 font-bold uppercase">
          <div>
            <div className="border-t border-black w-40 pt-1 text-center">Prepared By (Site Sup.)</div>
          </div>
          <div>
            <div className="border-t border-black w-40 pt-1 text-center">Authorized Signature</div>
          </div>
        </div>

      </div>

      {/* Embedded Print Styling */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          header, aside, nav, button, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FinalReport;
