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
  Printer,
  Fuel,
  Calendar,
  RotateCcw
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

export interface DieselFuelRecord {
  id: string;
  date: string;
  siteName: string;
  vehicleNumber: string;
  litres: number;
  ratePerLitre: number;
  totalCost: number;
}

const STORAGE_HAULAGE_KEY = 'CONSTRUCTION_PRO_HAULAGE_TRIPS_V2';
const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';
const STORAGE_VENDORS_KEY = 'CONSTRUCTION_PRO_VENDOR_NAMES_V1';
const STORAGE_VENDOR_ADVANCES_KEY = 'CONSTRUCTION_PRO_VENDOR_ADVANCES_V1';
const STORAGE_FLEET_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';
const STORAGE_DIESEL_KEY = 'CONSTRUCTION_PRO_DIESEL_LOGS_V1';

const DEFAULT_FLEET: FleetVehicle[] = [
  { id: 'v-1', vehicleNumber: 'KA-28-EX-8901', vehicleType: 'Hydraulic Excavator', category: 'Earthmoving', metricType: 'HMR', ownershipType: 'company' },
  { id: 'v-2', vehicleNumber: '3146', vehicleType: 'Tipper (Hired)', category: 'Haulage', metricType: 'KM', ownershipType: 'rented' },
  { id: 'v-3', vehicleNumber: '7243', vehicleType: 'Tipper (Hired)', category: 'Haulage', metricType: 'KM', ownershipType: 'rented' },
  { id: 'v-4', vehicleNumber: '9260', vehicleType: 'Tipper (Hired)', category: 'Haulage', metricType: 'KM', ownershipType: 'rented' },
  { id: 'v-5', vehicleNumber: '5321', vehicleType: 'Tipper (Hired)', category: 'Haulage', metricType: 'KM', ownershipType: 'rented' }
];

const INITIAL_ROAD_CATEGORIES: RoadMaterialCategory[] = [
  { id: 'RCAT-01', name: 'Granular Sub-Base (GSB)', description: 'Coarse graded granular material sub-base', standardRate: 1500, unit: 'Brass' },
  { id: 'RCAT-02', name: 'Wet Mix Macadam (WMM)', description: 'Crushed stone aggregate base layer', standardRate: 1500, unit: 'Brass' },
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

  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FLEET_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_FLEET;
    } catch {
      return DEFAULT_FLEET;
    }
  });

  const [dieselLogs, setDieselLogs] = useState<DieselFuelRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DIESEL_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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
      return saved ? JSON.parse(saved) : ['MBB CRUSHER', 'GIRGOANKAR', 'Mahalaxmi Stone Crusher'];
    } catch {
      return ['MBB CRUSHER', 'GIRGOANKAR', 'Mahalaxmi Stone Crusher'];
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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedAdvances = localStorage.getItem(STORAGE_VENDOR_ADVANCES_KEY);
        setAdvances(savedAdvances ? JSON.parse(savedAdvances) : []);

        const savedFleet = localStorage.getItem(STORAGE_FLEET_KEY);
        setFleetVehicles(savedFleet ? JSON.parse(savedFleet) : DEFAULT_FLEET);

        const savedDiesel = localStorage.getItem(STORAGE_DIESEL_KEY);
        setDieselLogs(savedDiesel ? JSON.parse(savedDiesel) : []);
      } catch {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [siteName, setSiteName] = useState(activeSiteName);
  const [vehicleNumber, setVehicleNumber] = useState('');
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
    if (found) setRatePerBrass(found.standardRate);
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
      const matchDate = !filterDate || t.tripDate === filterDate;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        t.vehicleNumber.toLowerCase().includes(q) ||
        t.materialName.toLowerCase().includes(q) ||
        (t.purchasedFrom || '').toLowerCase().includes(q) ||
        t.tripDate.includes(q) ||
        formatDateDMY(t.tripDate).includes(q);

      return matchSite && matchDate && matchQuery;
    });
  }, [trips, activeSiteName, filterDate, searchQuery]);

  const currentSupplierName = useMemo(() => {
    const vendors = Array.from(new Set(filtered.map((t) => t.purchasedFrom?.trim()).filter(Boolean)));
    return vendors.length > 0 ? vendors.join(', ') : 'MBB CRUSHER';
  }, [filtered]);

  const rentedVehiclesSet = useMemo(() => {
    return new Set(
      fleetVehicles
        .filter((v) => v.ownershipType === 'rented')
        .map((v) => v.vehicleNumber.trim().toUpperCase())
    );
  }, [fleetVehicles]);

  const getRowDiesel = (rowDate: string, rowVehicle: string) => {
    const isRented = rentedVehiclesSet.has(rowVehicle.trim().toUpperCase());
    if (!isRented) return { litres: 0, cost: 0 };

    const matchingLogs = dieselLogs.filter(
      (d) =>
        d.date === rowDate &&
        d.vehicleNumber.trim().toUpperCase() === rowVehicle.trim().toUpperCase() &&
        (!activeSiteName || d.siteName === activeSiteName)
    );

    const litres = matchingLogs.reduce((sum, l) => sum + (Number(l.litres) || 0), 0);
    const cost = matchingLogs.reduce((sum, l) => sum + (Number(l.totalCost) || 0), 0);
    return { litres, cost };
  };

  const overallTotals = useMemo(() => {
    return filtered.reduce(
      (acc, t) => {
        const tr = Number(t.dayTrips) || 0;
        const totalBrass = tr * (Number(t.brassPerTrip) || 0);
        const amount = Number(t.totalAmount) || 0;
        const diesel = getRowDiesel(t.tripDate, t.vehicleNumber);

        return {
          trips: acc.trips + tr,
          brass: acc.brass + totalBrass,
          amount: acc.amount + amount,
          dieselLitres: acc.dieselLitres + diesel.litres,
          dieselCost: acc.dieselCost + diesel.cost
        };
      },
      { trips: 0, brass: 0, amount: 0, dieselLitres: 0, dieselCost: 0 }
    );
  }, [filtered, rentedVehiclesSet, dieselLogs, activeSiteName]);

  const totalVendorAdvancePaid = useMemo(() => {
    const currentVendorNames = Array.from(new Set(filtered.map((t) => t.purchasedFrom?.trim().toLowerCase()).filter(Boolean)));
    return advances
      .filter((a) => {
        const matchSite = !activeSiteName || a.siteName === activeSiteName;
        const matchVendor = currentVendorNames.length === 0 || currentVendorNames.includes(a.vendorName?.trim().toLowerCase());
        const matchDate = !filterDate || a.date === filterDate;
        return matchSite && matchVendor && matchDate;
      })
      .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [advances, filtered, activeSiteName, filterDate]);

  const totalDeductions = totalVendorAdvancePaid + overallTotals.dieselCost;
  const rawBalance = overallTotals.amount - totalDeductions;
  const isAdvanceExcess = rawBalance < 0;
  const netPayableAmount = isAdvanceExcess ? 0 : rawBalance;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = ''; // Removes browser PDF header title
    window.print();
    document.title = originalTitle;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTripDate(new Date().toISOString().split('T')[0]);
    setSiteName(activeSiteName);
    setVehicleNumber(fleetVehicles[0]?.vehicleNumber || '');
    setPurchasedFrom('');
    setMaterialName(defaultCategory);
    setDayTrips(3);
    setBrassPerTrip(6);
    setRatePerBrass(categories[0]?.standardRate || 1500);
    setIsModalOpen(true);
  };

  const handleEdit = (trip: HaulageTripRecord) => {
    if (!isAdmin) return;
    setEditingId(trip.id);
    setTripDate(trip.tripDate);
    setSiteName(trip.siteName);
    setVehicleNumber(trip.vehicleNumber);
    setPurchasedFrom(trip.purchasedFrom || '');
    setMaterialName(trip.materialName);
    setDayTrips(trip.dayTrips);
    setBrassPerTrip(trip.brassPerTrip);
    setRatePerBrass(trip.ratePerBrass);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Delete this record?')) {
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (dayTrips === '' || brassPerTrip === '' || ratePerBrass === '') return;

    const trimmedVendor = purchasedFrom.trim() || 'MBB CRUSHER';
    const record: HaulageTripRecord = {
      id: editingId || `TRIP-${Date.now().toString().slice(-4)}`,
      tripDate,
      siteName: siteName.trim() || activeSiteName,
      vehicleNumber: vehicleNumber.trim(),
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
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-slate-100 print:text-black print:space-y-0">
      {/* Print Stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          html, body, #root, main, div {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
          }
          body {
            padding: 12mm 15mm !important;
          }
          nav, header, aside, .no-print, ::-webkit-scrollbar {
            display: none !important;
          }
          .print-header-container {
            display: block !important;
            margin-bottom: 14px !important;
          }
          .print-header-title {
            text-align: center !important;
            font-size: 22px !important;
            font-weight: 900 !important;
            letter-spacing: 0.5px !important;
            text-transform: uppercase !important;
            border-bottom: 2.5px solid #000000 !important;
            padding-bottom: 5px !important;
            margin-bottom: 10px !important;
            color: #000000 !important;
          }
          .print-sub-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            font-size: 14px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            color: #000000 !important;
            margin-bottom: 10px !important;
          }
          .print-clean-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }
          .print-clean-table th {
            border-top: 2px solid #000000 !important;
            border-bottom: 2px solid #000000 !important;
            background: transparent !important;
            color: #000000 !important;
            font-size: 9px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            padding: 5px 3px !important;
          }
          .print-clean-table td {
            border-bottom: 1px solid #e2e8f0 !important;
            color: #000000 !important;
            font-size: 9px !important;
            padding: 6px 3px !important;
            vertical-align: middle !important;
          }
          .print-clean-table tfoot td {
            padding: 5px 3px !important;
            font-size: 9.5px !important;
            font-weight: 800 !important;
          }
          .print-total-row td {
            border-top: 2px solid #000000 !important;
            border-bottom: 1px solid #cbd5e1 !important;
          }
          .print-sub-row td {
            border-bottom: 1px solid #e2e8f0 !important;
          }
          .print-net-row td {
            border-bottom: none !important;
            font-size: 11px !important;
            font-weight: 900 !important;
          }
        }
      `}} />

      {/* Printable Invoice Header */}
      <div className="hidden print:block print-header-container">
        <div className="print-header-title">
          M B BILGI CONSTRUCTIONS
        </div>
        <div className="print-sub-header">
          <div>{currentSupplierName}</div>
          <div>SITE: {activeSiteName} {filterDate && `(${formatDateDMY(filterDate)})`}</div>
        </div>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Material Haulage Trips</h1>
            <p className="text-xs text-slate-400">Track material purchases, auto-deduct rented vehicle diesel & advances for {activeSiteName}.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="px-3.5 py-2.5 rounded-xl bg-[#131d33] hover:bg-[#1a2847] border border-[#1E293B] text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Print to PDF</span>
          </button>
          <button onClick={handleOpenAdd} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>+ Log Haulage Trips</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B]">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Material Purchase</div>
          <div className="text-xl font-black text-white font-mono mt-1">₹{overallTotals.amount.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500">{overallTotals.trips} Trips ({overallTotals.brass} Brass)</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B]">
          <div className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
            <Fuel className="w-3 h-3 text-amber-400" />
            <span>(-) Total Rented Diesel</span>
          </div>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">₹{overallTotals.dieselCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</div>
          <div className="text-[10px] text-slate-500">{overallTotals.dieselLitres.toFixed(1)} Litres Issued</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B]">
          <div className="text-[10px] font-bold uppercase text-rose-400">(-) Less: Advance Paid</div>
          <div className="text-xl font-black text-rose-400 font-mono mt-1">₹{totalVendorAdvancePaid.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500">Auto-deducted advances</div>
        </div>

        <div className={`p-4 rounded-2xl border ${netPayableAmount > 0 ? 'bg-amber-950/20 border-amber-500/30' : 'bg-[#0B1220] border-[#1E293B]'}`}>
          <div className="text-[10px] font-bold uppercase text-amber-400">(=) Net Payable Amount</div>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">₹{netPayableAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</div>
          <div className="text-[10px] text-slate-400">Remaining Balance to Vendor</div>
        </div>
      </div>

      {/* Search & Date Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0c1427] border border-[#182643] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs no-print">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by vehicle, supplier, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-[#080d19] border border-[#1E293B] rounded-xl px-3 py-1.5 focus-within:border-blue-500">
            <Calendar className="w-4 h-4 text-blue-400 mr-2 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium mr-1.5 whitespace-nowrap">Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-white outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          {(filterDate || searchQuery) && (
            <button
              onClick={() => {
                setFilterDate('');
                setSearchQuery('');
              }}
              title="Reset all filters"
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table with Dedicated Diesel Column */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl print:border-none print:shadow-none print:rounded-none">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs border-collapse print-clean-table">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80 print:bg-transparent">
                <th className="py-2.5 px-3 text-left">DATE</th>
                <th className="py-2.5 px-3 text-center">SITE</th>
                <th className="py-2.5 px-3 text-left">PURCHASED FROM</th>
                <th className="py-2.5 px-3 text-center">VEHICLE</th>
                <th className="py-2.5 px-3 text-left">MATERIAL NAME</th>
                <th className="py-2.5 px-2 text-center">TRIPS</th>
                <th className="py-2.5 px-2 text-right">QTY/TRIP</th>
                <th className="py-2.5 px-2 text-right">RATE (₹)</th>
                <th className="py-2.5 px-3 text-right">AMOUNT (₹)</th>
                {/* Diesel Column */}
                <th className="py-2.5 px-3 text-right text-amber-400 print:text-black">DIESEL (₹)</th>
                <th className="py-2.5 px-3 text-center no-print">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No records found for {activeSiteName}.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const rowDiesel = getRowDiesel(t.tripDate, t.vehicleNumber);
                  return (
                    <tr key={t.id} className="hover:bg-[#121c33]/50">
                      <td className="py-2 px-3 font-mono text-left whitespace-nowrap text-slate-300 print:text-black">
                        {formatDateDMY(t.tripDate)}
                      </td>
                      <td className="py-2 px-3 font-bold text-cyan-400 print:text-black text-center">{t.siteName}</td>
                      <td className="py-2 px-3 font-semibold text-emerald-400 print:text-black">{t.purchasedFrom || 'MBB CRUSHER'}</td>
                      <td className="py-2 px-3 font-mono text-center print:text-black">{t.vehicleNumber}</td>
                      <td className="py-2 px-3 font-bold text-amber-300 print:text-black">{t.materialName}</td>
                      <td className="py-2 px-2 text-center font-mono print:text-black">{t.dayTrips}</td>
                      <td className="py-2 px-2 text-right font-mono print:text-black">{t.brassPerTrip}</td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-400 print:text-black">₹{t.ratePerBrass.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right font-mono font-black text-amber-400 print:text-black">₹{t.totalAmount.toLocaleString('en-IN')}</td>
                      
                      {/* Diesel Deduction Column per Row */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-400 print:text-black">
                        {rowDiesel.cost > 0 ? (
                          <div>
                            <span>- ₹{rowDiesel.cost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</span>
                            <span className="block text-[8px] text-slate-400 print:text-slate-600">({rowDiesel.litres.toFixed(1)} L)</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-normal">—</span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-center no-print">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleEdit(t)} className="p-1 rounded text-slate-400 hover:text-blue-400 cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(t.id)} className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Reconciliation Footer */}
            {filtered.length > 0 && (
              <tfoot className="border-t-2 border-[#1E293B] print:border-t-2 print:border-black bg-[#070c18] font-mono print:bg-white text-xs">
                {/* Row 1: Total Material Purchased */}
                <tr className="border-b border-[#1E293B]/60 print-total-row">
                  <td colSpan={5} className="py-2 px-3 font-black uppercase text-right text-slate-200 print:text-black">
                    TOTAL MATERIAL PURCHASED:
                  </td>
                  <td className="py-2 px-2 text-center font-black text-cyan-400 print:text-black">{overallTotals.trips} Trips</td>
                  <td className="py-2 px-2 text-right font-black text-white print:text-black">{overallTotals.brass} Brass</td>
                  <td className="py-2 px-2 text-right text-slate-500 print:text-black">—</td>
                  <td className="py-2 px-3 text-right font-black text-white print:text-black">₹{overallTotals.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-right font-bold text-amber-400 print:text-black">
                    {overallTotals.dieselCost > 0 ? `- ₹${overallTotals.dieselCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}` : '—'}
                  </td>
                  <td className="no-print"></td>
                </tr>

                {/* Row 2: Advance Payment Received */}
                <tr className="border-b border-[#1E293B]/60 text-rose-400 print:text-black print-sub-row">
                  <td colSpan={8} className="py-2 px-3 font-black uppercase text-right">
                    (-) LESS: ADVANCE PAYMENT RECEIVED :
                  </td>
                  <td colSpan={2} className="py-2 px-3 text-right font-black">
                    - ₹{totalVendorAdvancePaid.toLocaleString('en-IN')}
                  </td>
                  <td className="no-print"></td>
                </tr>

                {/* Row 3: Diesel Dispensed to Rented Vehicles */}
                <tr className="border-b border-[#1E293B]/60 text-amber-400 print:text-black print-sub-row">
                  <td colSpan={8} className="py-2 px-3 font-black uppercase text-right">
                    (-) LESS: DIESEL DISPENSED TO RENTED VEHICLES ({overallTotals.dieselLitres.toFixed(1)} L):
                  </td>
                  <td colSpan={2} className="py-2 px-3 text-right font-black">
                    - ₹{overallTotals.dieselCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                  <td className="no-print"></td>
                </tr>

                {/* Row 4: Net Payable Amount */}
                <tr className="bg-[#1e1906] text-amber-400 print:bg-transparent print:text-black font-black print-net-row">
                  <td colSpan={8} className="py-2.5 px-3 text-right uppercase tracking-wider text-xs">
                    (=) NET PAYABLE AMOUNT:
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 text-right text-sm font-black">
                    ₹{netPayableAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                  <td className="no-print"></td>
                </tr>
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

              <div>
                <label className="block text-slate-300 font-bold mb-1">Vehicle Number *</label>
                <div className="relative">
                  <select
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold appearance-none outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="" disabled>-- Select Registered Vehicle --</option>
                    {fleetVehicles.map((v) => (
                      <option key={v.id} value={v.vehicleNumber} className="bg-[#0F172A] text-white">
                        {v.vehicleNumber} — {v.vehicleType} ({v.ownershipType === 'rented' ? 'Rented' : 'Company'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Purchased From / Supplier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBB CRUSHER"
                  value={purchasedFrom}
                  onChange={(e) => setPurchasedFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Material Name *</label>
                <select
                  value={materialName}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-300 font-bold outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={`${c.name} (₹${c.standardRate}/${c.unit})`}>
                      {c.name} (₹${c.standardRate}/${c.unit})
                    </option>
                  ))}
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
