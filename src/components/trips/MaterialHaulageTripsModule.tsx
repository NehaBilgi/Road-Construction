import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  Truck,
  Store,
  ChevronDown,
  Printer
} from 'lucide-react';

export interface HaulageTripRecord {
  id: string;
  tripDate: string;
  siteName: string;
  vehicleNumber: string;
  materialName: string;
  purchasedFrom: string;
  dayTrips: number;
  brassPerTrip: number;
  ratePerBrass: number;
  totalAmount: number;
}

export interface RoadMaterialCategory {
  id: string;
  name: string;
  description: string;
  standardRate: number;
  unit: string;
}

export interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  category: string;
  metricType: 'KM' | 'HMR';
  ownershipType?: 'company' | 'rented';
  rentalRateType?: 'per_day' | 'per_trip';
  rentalAmount?: number;
}

const STORAGE_HAULAGE_KEY = 'CONSTRUCTION_PRO_HAULAGE_TRIPS_V2';
const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';
const STORAGE_VENDORS_KEY = 'CONSTRUCTION_PRO_VENDOR_NAMES_V1';
const STORAGE_VENDOR_ADVANCES_KEY = 'CONSTRUCTION_PRO_VENDOR_ADVANCES_V1';
const STORAGE_FLEET_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';

const DEFAULT_FLEET: FleetVehicle[] = [
  { id: 'v-1', vehicleNumber: 'KA-28-EX-8901', vehicleType: 'Hydraulic Excavator (CAT/Hitachi)', category: 'Earthmoving', metricType: 'HMR', ownershipType: 'company' },
  { id: 'v-2', vehicleNumber: 'KA-28-JC-3342', vehicleType: 'Backhoe Loader (JCB 3DX)', category: 'Earthmoving', metricType: 'HMR', ownershipType: 'rented', rentalRateType: 'per_day', rentalAmount: 4500 },
  { id: 'v-3', vehicleNumber: 'MH-12-DT-5510', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'rented', rentalRateType: 'per_trip', rentalAmount: 850 },
  { id: 'v-4', vehicleNumber: 'KA-28-TR-1092', vehicleType: 'Tractor & Trolley', category: 'Transport', metricType: 'HMR', ownershipType: 'company' },
  { id: 'v-5', vehicleNumber: 'KA-28-JP-7890', vehicleType: 'Site Jeep / Bolero / Pickup', category: 'Site Inspection', metricType: 'KM', ownershipType: 'company' },
  { id: 'v-6', vehicleNumber: 'KA-28-CR-2200', vehicleType: 'Car / SUV', category: 'Staff Transport', metricType: 'KM', ownershipType: 'company' }
];

const INITIAL_ROAD_CATEGORIES: RoadMaterialCategory[] = [
  { id: 'RCAT-01', name: 'Granular Sub-Base (GSB)', description: 'Coarse graded granular material sub-base', standardRate: 1500, unit: 'Brass' },
  { id: 'RCAT-02', name: 'Wet Mix Macadam (WMM)', description: 'Crushed stone aggregate base/sub-base layer', standardRate: 4500, unit: 'Brass' },
  { id: 'RCAT-03', name: 'Dense Bituminous Macadam (DBM)', description: 'Structural layer in flexible pavements', standardRate: 5500, unit: 'Brass' },
  { id: 'RCAT-04', name: 'Bituminous Concrete (BC)', description: 'High quality wearing course finish', standardRate: 6000, unit: 'Brass' }
];

const formatDateDMY = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return dateStr;
};

export const MaterialHaulageTripsModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId, currentUser, userRole } = useERP() as any;

  // Role verification: only Admin can edit or delete
  const currentRole = String(userRole || currentUser?.role || '').toUpperCase();
  const isAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN';

  const currentActiveSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const activeSiteName = currentActiveSite?.siteName || siteSheets[0]?.siteName || 'MULWAD';

  const [trips, setTrips] = useState<HaulageTripRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HAULAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch machinery fleet list for vehicle selection
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FLEET_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_FLEET;
    } catch {
      return DEFAULT_FLEET;
    }
  });

  const [categories, setCategories] = useState<RoadMaterialCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROAD_CATS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ROAD_CATEGORIES;
    } catch {
      return INITIAL_ROAD_CATEGORIES;
    }
  });

  const [savedVendors, setSavedVendors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VENDORS_KEY);
      return saved ? JSON.parse(saved) : ['GIRGOANKAR', 'Mahalaxmi Stone Crusher', 'Bilgi Hot Mix Plant Quarry #1'];
    } catch {
      return ['GIRGOANKAR', 'Mahalaxmi Stone Crusher', 'Bilgi Hot Mix Plant Quarry #1'];
    }
  });

  const [advances, setAdvances] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VENDOR_ADVANCES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedAdvances = localStorage.getItem(STORAGE_VENDOR_ADVANCES_KEY);
        setAdvances(savedAdvances ? JSON.parse(savedAdvances) : []);
        
        const savedFleet = localStorage.getItem(STORAGE_FLEET_KEY);
        setFleetVehicles(savedFleet ? JSON.parse(savedFleet) : DEFAULT_FLEET);
      } catch {
        setAdvances([]);
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [siteName, setSiteName] = useState(activeSiteName);
  const [vehicleNumber, setVehicleNumber] = useState('TOTAL TRIPS');
  const [purchasedFrom, setPurchasedFrom] = useState('');
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const vendorDropdownRef = useRef<HTMLDivElement>(null);

  const defaultCategory = categories[0]
    ? `${categories[0].name} (₹${categories[0].standardRate}/${categories[0].unit})`
    : '';

  const [materialName, setMaterialName] = useState(defaultCategory);
  const [dayTrips, setDayTrips] = useState<number | ''>(3);
  const [brassPerTrip, setBrassPerTrip] = useState<number | ''>(6);
  const [ratePerBrass, setRatePerBrass] = useState<number | ''>(categories[0]?.standardRate || 1500);

  const handleMaterialChange = (selectedFormattedName: string) => {
    setMaterialName(selectedFormattedName);
    const found = categories.find((c) => `${c.name} (₹${c.standardRate}/${c.unit})` === selectedFormattedName);
    if (found) {
      setRatePerBrass(found.standardRate);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target as Node)) {
        setIsVendorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HAULAGE_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error('Failed saving trips', error);
    }
  }, [trips]);

  const computedTotalAmount = useMemo(() => {
    const tripsNum = Number(dayTrips) || 0;
    const brassNum = Number(brassPerTrip) || 0;
    const rateNum = Number(ratePerBrass) || 0;
    return tripsNum * brassNum * rateNum;
  }, [dayTrips, brassPerTrip, ratePerBrass]);

  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const matchSite = !activeSiteName || t.siteName === activeSiteName;
      const q = searchQuery.toLowerCase();
      return (
        matchSite &&
        (!q ||
          t.vehicleNumber.toLowerCase().includes(q) ||
          t.materialName.toLowerCase().includes(q) ||
          (t.purchasedFrom || '').toLowerCase().includes(q))
      );
    });
  }, [trips, activeSiteName, searchQuery]);

  const currentSupplierName = useMemo(() => {
    const vendors = Array.from(
      new Set(filtered.map((t) => t.purchasedFrom?.trim()).filter(Boolean))
    );
    return vendors.length > 0 ? vendors.join(', ') : 'GIRGOANKAR';
  }, [filtered]);

  const overallTotals = useMemo(() => {
    return filtered.reduce(
      (acc, t) => {
        const tr = Number(t.dayTrips) || 0;
        const totalBrass = tr * (Number(t.brassPerTrip) || 0);
        const amount = Number(t.totalAmount) || 0;
        return {
          trips: acc.trips + tr,
          brass: acc.brass + totalBrass,
          amount: acc.amount + amount
        };
      },
      { trips: 0, brass: 0, amount: 0 }
    );
  }, [filtered]);

  const totalVendorAdvancePaid = useMemo(() => {
    const currentVendorNames = Array.from(new Set(filtered.map((t) => t.purchasedFrom?.trim().toLowerCase()).filter(Boolean)));
    return advances
      .filter((a) => {
        const matchSite = !activeSiteName || a.siteName === activeSiteName;
        const matchVendor = currentVendorNames.length === 0 || currentVendorNames.includes(a.vendorName?.trim().toLowerCase());
        return matchSite && matchVendor;
      })
      .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [advances, filtered, activeSiteName]);

  const advanceDatesSummary = useMemo(() => {
    const currentVendorNames = Array.from(new Set(filtered.map((t) => t.purchasedFrom?.trim().toLowerCase()).filter(Boolean)));
    const matchedDates = advances
      .filter((a) => {
        const matchSite = !activeSiteName || a.siteName === activeSiteName;
        const matchVendor = currentVendorNames.length === 0 || currentVendorNames.includes(a.vendorName?.trim().toLowerCase());
        return matchSite && matchVendor && a.date;
      })
      .map((a) => formatDateDMY(a.date));

    const uniqueDates = Array.from(new Set(matchedDates));
    return uniqueDates.length > 0 ? uniqueDates.join(', ') : '';
  }, [advances, filtered, activeSiteName]);

  const rawBalance = overallTotals.amount - totalVendorAdvancePaid;
  const isAdvanceExcess = rawBalance < 0;
  const netPayableAmount = isAdvanceExcess ? 0 : rawBalance;
  const remainingAdvanceBalance = isAdvanceExcess ? Math.abs(rawBalance) : 0;

  const handleDeleteSavedVendor = (vendorToDelete: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAdmin) {
      alert('Access Denied: Only administrators can delete saved suppliers.');
      return;
    }
    if (window.confirm(`Delete "${vendorToDelete}" from saved supplier names?`)) {
      const updated = savedVendors.filter((v) => v !== vendorToDelete);
      setSavedVendors(updated);
      if (purchasedFrom === vendorToDelete) {
        setPurchasedFrom('');
      }
      try {
        localStorage.setItem(STORAGE_VENDORS_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed saving updated vendors', err);
      }
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = '';
    window.print();
    document.title = originalTitle;
  };

  const handleOpenAdd = () => {
    // Reload fleet from storage on open
    try {
      const savedFleet = localStorage.getItem(STORAGE_FLEET_KEY);
      if (savedFleet) setFleetVehicles(JSON.parse(savedFleet));
    } catch {}

    setEditingId(null);
    setTripDate(new Date().toISOString().split('T')[0]);
    setSiteName(activeSiteName);
    setVehicleNumber(fleetVehicles[0]?.vehicleNumber || 'TOTAL TRIPS');
    setPurchasedFrom('');
    setMaterialName(defaultCategory);
    setDayTrips(3);
    setBrassPerTrip(6);
    setRatePerBrass(categories[0]?.standardRate || 1500);
    setIsVendorDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleEdit = (trip: HaulageTripRecord) => {
    if (!isAdmin) {
      alert('Access Denied: Only administrators can edit haulage trip records.');
      return;
    }
    setEditingId(trip.id);
    setTripDate(trip.tripDate);
    setSiteName(trip.siteName);
    setVehicleNumber(trip.vehicleNumber);
    setPurchasedFrom(trip.purchasedFrom || '');
    setMaterialName(trip.materialName);
    setDayTrips(trip.dayTrips);
    setBrassPerTrip(trip.brassPerTrip);
    setRatePerBrass(trip.ratePerBrass);
    setIsVendorDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      alert('Access Denied: Only administrators can delete haulage trip records.');
      return;
    }
    if (window.confirm('Delete this trip record?')) {
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && !isAdmin) {
      alert('Access Denied: Only administrators can update existing records.');
      return;
    }
    if (dayTrips === '' || brassPerTrip === '' || ratePerBrass === '') return;

    const trimmedVendor = purchasedFrom.trim() || 'Direct Quarry / Plant';

    if (trimmedVendor && !savedVendors.includes(trimmedVendor)) {
      const updatedVendors = [trimmedVendor, ...savedVendors];
      setSavedVendors(updatedVendors);
      localStorage.setItem(STORAGE_VENDORS_KEY, JSON.stringify(updatedVendors));
    }

    const record: HaulageTripRecord = {
      id: editingId || `TRIP-${Date.now().toString().slice(-4)}`,
      tripDate,
      siteName: siteName.trim() || activeSiteName,
      vehicleNumber: vehicleNumber.trim() || 'TOTAL TRIPS',
      purchasedFrom: trimmedVendor,
      materialName,
      dayTrips: Number(dayTrips),
      brassPerTrip: Number(brassPerTrip),
      ratePerBrass: Number(ratePerBrass),
      totalAmount: computedTotalAmount
    };

    if (editingId) {
      setTrips(trips.map((t) => (t.id === editingId ? record : t)));
    } else {
      setTrips([record, ...trips]);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  // Find currently selected vehicle metadata for info badge in modal
  const selectedVehicleObj = fleetVehicles.find((v) => v.vehicleNumber === vehicleNumber);

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-slate-100 print:text-black print:space-y-3">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: portrait;
            margin: 0;
          }
          html, body, #root, main, div, table {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          ::-webkit-scrollbar {
            display: none !important;
          }
          nav,
          header,
          aside,
          .no-print {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 12mm 15mm !important;
          }
          .print-clean-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .print-clean-table th {
            background-color: #f1f5f9 !important;
            color: #000000 !important;
            border-bottom: 2px solid #000000 !important;
            padding: 6px 8px !important;
          }
          .print-clean-table td {
            color: #000000 !important;
            border-bottom: 1px solid #e2e8f0 !important;
            padding: 6px 8px !important;
          }
        }
      `}} />

      {/* Printable Header */}
      <div className="hidden print:block mb-4">
        <div className="text-center font-black text-2xl tracking-wider uppercase text-black pb-2 border-b-2 border-black mb-3">
          M B BILGI CONSTRUCTIONS
        </div>
        <div className="flex items-center justify-between text-xl font-black uppercase text-black tracking-wide">
          <div>{currentSupplierName}</div>
          <div>SITE: {activeSiteName}</div>
        </div>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Material Haulage Trips</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Track material purchases, auto-deduct vendor advances, and manage statements for {activeSiteName}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-[#131d33] hover:bg-[#1a2847] border border-[#1E293B] hover:border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Print or Export to PDF"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Print to PDF</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Log Haulage Trips</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] shadow-lg flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Material Purchase</div>
          <div className="text-2xl font-black text-white font-mono mt-1">₹{overallTotals.amount.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500 font-medium">{overallTotals.trips} Trips ({overallTotals.brass} Brass)</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] shadow-lg flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">(-) Less: Advance Paid</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">₹{totalVendorAdvancePaid.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500 font-medium">
            {advanceDatesSummary ? `Paid on: ${advanceDatesSummary}` : 'Auto-deducted from Advances ledger'}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-lg flex flex-col justify-between transition-all ${
          netPayableAmount > 0 
            ? 'bg-amber-950/20 border-amber-500/30' 
            : 'bg-[#0B1220] border-[#1E293B] opacity-75'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">(=) Net Payable Amount</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">₹{netPayableAmount.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-400 font-medium">
            {netPayableAmount > 0 ? 'Remaining balance to pay vendor' : 'Cleared by Advance'}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-lg flex flex-col justify-between transition-all ${
          remainingAdvanceBalance > 0 
            ? 'bg-emerald-950/30 border-emerald-500/40' 
            : 'bg-[#0B1220] border-[#1E293B] opacity-75'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Remaining Advance Balance</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">₹{remainingAdvanceBalance.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-emerald-500/80 font-bold">
            {remainingAdvanceBalance > 0 ? 'Unused Advance with Vendor' : 'No Surplus Advance'}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0c1427] border border-[#182643] flex items-center gap-3 text-xs no-print">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by vehicle, supplier, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl print:border-none print:shadow-none print:rounded-none print:overflow-visible">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs border-collapse print-clean-table">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80">
                <th className="py-3 px-3 text-left">DATE</th>
                <th className="py-3 px-3 text-center">SITE</th>
                <th className="py-3 px-3">PURCHASED FROM</th>
                <th className="py-3 px-3 text-center">VEHICLE</th>
                <th className="py-3 px-3">MATERIAL NAME</th>
                <th className="py-3 px-2 text-center">TRIPS</th>
                <th className="py-3 px-2 text-right">QTY/TRIP</th>
                <th className="py-3 px-2 text-right">RATE (₹)</th>
                <th className="py-3 px-3 text-right">AMOUNT (₹)</th>
                <th className="py-3 px-3 text-center no-print">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No records found for {activeSiteName}.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#121c33]/50">
                    <td className="py-2.5 px-3 font-mono text-left text-slate-300 print:text-black whitespace-nowrap">
                      {formatDateDMY(t.tripDate)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-cyan-400 print:text-black text-center">{t.siteName}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400 print:text-black">{t.purchasedFrom || 'Direct Quarry'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 print:text-black text-center">{t.vehicleNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-300 print:text-black">{t.materialName}</td>
                    <td className="py-2.5 px-2 text-center font-mono print:text-black">{t.dayTrips}</td>
                    <td className="py-2.5 px-2 text-right font-mono print:text-black">{t.brassPerTrip}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-emerald-400 print:text-black">₹{t.ratePerBrass.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-amber-400 print:text-black">₹{t.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-center no-print">
                      {isAdmin ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer */}
            {filtered.length > 0 && (
              <tfoot className="border-t-2 border-[#1E293B] print:border-t-2 print:border-black bg-[#070c18] font-mono print:bg-white">
                <tr className="border-b border-[#1E293B]/60 print:border-b print:border-slate-300">
                  <td colSpan={5} className="py-2.5 px-3 font-bold uppercase text-slate-300 print:text-black text-right">
                    Total Material Purchased:
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-cyan-400 print:text-black">{overallTotals.trips} Trips</td>
                  <td className="py-2.5 px-2 text-right font-bold text-white print:text-black">{overallTotals.brass} Brass</td>
                  <td className="py-2.5 px-2 text-right text-slate-500 print:text-black">—</td>
                  <td className="py-2.5 px-3 text-right font-bold text-white print:text-black">₹{overallTotals.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 no-print"></td>
                </tr>

                <tr className="border-b border-[#1E293B]/60 print:border-b print:border-slate-300 text-rose-400 print:text-black">
                  <td colSpan={8} className="py-2 px-3 font-bold uppercase text-right">
                    (-) Less: Advance Payment Received {advanceDatesSummary ? `(${advanceDatesSummary})` : ''}:
                  </td>
                  <td className="py-2 px-3 text-right font-bold">
                    - ₹{totalVendorAdvancePaid.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 no-print"></td>
                </tr>

                {remainingAdvanceBalance > 0 ? (
                  <tr className="bg-[#082216] text-emerald-400 print:bg-slate-100 print:text-black font-black">
                    <td colSpan={8} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                      REMAINING ADVANCE BALANCE (EXCESS):
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-black">
                      ₹{remainingAdvanceBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 no-print"></td>
                  </tr>
                ) : (
                  <tr className="bg-[#1e1906] text-amber-400 print:bg-slate-100 print:text-black font-black">
                    <td colSpan={8} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                      (=) NET PAYABLE AMOUNT:
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-black">
                      ₹{netPayableAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 no-print"></td>
                  </tr>
                )}
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm no-print">
          <div className="bg-[#121927] border border-[#1E293B] rounded-2xl w-full max-w-lg p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>{editingId ? 'Edit Haulage Trip' : 'Log Total Day Haulage Trips'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Trip Date *</label>
                  <input
                    type="date"
                    required
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Site Name *</label>
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-cyan-400 font-medium outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Vehicle Dropdown from Machinery Fleet */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">Vehicle Number *</label>
                  {selectedVehicleObj && (
                    <span className="text-[10px] text-slate-400">
                      {selectedVehicleObj.vehicleType} •{' '}
                      <span className={selectedVehicleObj.ownershipType === 'rented' ? 'text-purple-400' : 'text-sky-400 font-semibold'}>
                        {selectedVehicleObj.ownershipType === 'rented' ? 'Rented' : 'Company'}
                      </span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold appearance-none outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="TOTAL TRIPS" className="bg-[#0F172A] text-slate-300">
                      TOTAL TRIPS (Aggregate / All Vehicles)
                    </option>
                    <optgroup label="Registered Construction Fleet">
                      {fleetVehicles.map((v) => (
                        <option key={v.id} value={v.vehicleNumber} className="bg-[#0F172A] text-white">
                          {v.vehicleNumber} — {v.vehicleType} ({v.ownershipType === 'rented' ? 'Rented' : 'Company Owned'})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="relative" ref={vendorDropdownRef}>
                <label className="block text-slate-300 font-bold mb-1">
                  Purchased From / Supplier *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="e.g. GIRGOANKAR"
                    value={purchasedFrom}
                    onChange={(e) => {
                      setPurchasedFrom(e.target.value);
                      setIsVendorDropdownOpen(true);
                    }}
                    onFocus={() => setIsVendorDropdownOpen(true)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#162032] border border-[#1E293B] focus:border-blue-500 rounded-xl text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsVendorDropdownOpen((prev) => !prev)}
                    className="absolute right-2.5 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isVendorDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isVendorDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-[#1E293B]">
                    {savedVendors
                      .filter((v) => !purchasedFrom || v.toLowerCase().includes(purchasedFrom.toLowerCase()))
                      .map((v) => (
                        <div
                          key={v}
                          onClick={() => {
                            setPurchasedFrom(v);
                            setIsVendorDropdownOpen(false);
                          }}
                          className="flex items-center justify-between px-3.5 py-2.5 hover:bg-[#1E293B]/70 cursor-pointer group transition-colors"
                        >
                          <span className="text-white font-medium text-xs">{v}</span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSavedVendor(v, e)}
                              title={`Delete "${v}" from saved suppliers`}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                    {savedVendors.filter((v) => !purchasedFrom || v.toLowerCase().includes(purchasedFrom.toLowerCase())).length === 0 && (
                      <div className="px-3.5 py-3 text-slate-500 text-center text-xs">
                        Press save to add "{purchasedFrom}" as a new supplier
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Material Name *</label>
                <select
                  value={materialName}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-300 font-bold outline-none cursor-pointer"
                >
                  {categories.map((c) => {
                    const label = `${c.name} (₹${c.standardRate}/${c.unit})`;
                    return (
                      <option key={c.id} value={label}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Day Trips *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={dayTrips}
                    onChange={(e) => setDayTrips(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Qty/Trip *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={brassPerTrip}
                    onChange={(e) => setBrassPerTrip(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={ratePerBrass}
                    onChange={(e) => setRatePerBrass(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080d19] border border-[#1E293B] flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">Total Day Amount:</span>
                <span className="text-base font-black text-amber-400 font-mono">₹{computedTotalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer">
                  {editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialHaulageTripsModule;
