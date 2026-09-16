import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  Truck,
  ChevronDown,
  Printer,
  Fuel,
  Calendar,
  RotateCcw,
  Check,
  Building2,
  KeyRound
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

export interface VendorAdvanceRecord {
  id: string;
  date: string;
  siteName?: string;
  vendorName?: string;
  supplierName?: string;
  amount: number;
  notes?: string;
  paymentMode?: string;
}

const STORAGE_HAULAGE_KEY = 'CONSTRUCTION_PRO_HAULAGE_TRIPS_V2';
const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';
const STORAGE_VENDORS_KEY = 'CONSTRUCTION_PRO_VENDOR_NAMES_V1';
const STORAGE_VENDOR_ADVANCES_KEY = 'CONSTRUCTION_PRO_VENDOR_ADVANCES_V1';
const STORAGE_FLEET_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';
const STORAGE_DIESEL_KEY = 'CONSTRUCTION_PRO_DIESEL_LOGS_V1';

const DEFAULT_FLEET: FleetVehicle[] = [
  { id: 'v-1', vehicleNumber: 'KA-28-EX-8901', vehicleType: 'Hydraulic Excavator', category: 'Earthmoving', metricType: 'HMR', ownershipType: 'company' },
  { id: 'v-2', vehicleNumber: '3146', vehicleType: 'Tipper (Hired)', category: 'Haulage', metricType: 'KM', ownershipType: 'rented', rentalRateType: 'per_trip', rentalAmount: 1500 },
  { id: 'v-3', vehicleNumber: '7243', vehicleType: 'Tipper (Hired)', category: 'Haulage', metricType: 'KM', ownershipType: 'rented', rentalRateType: 'per_trip', rentalAmount: 1500 },
  { id: 'v-4', vehicleNumber: '9260', vehicleType: 'Tipper (Hired)', category: 'Haulage', metricType: 'KM', ownershipType: 'rented', rentalRateType: 'per_trip', rentalAmount: 1500 },
  { id: 'v-5', vehicleNumber: '5321', vehicleType: 'Tipper (Hired)', category: 'Haulage', metricType: 'KM', ownershipType: 'rented', rentalRateType: 'per_trip', rentalAmount: 1500 },
  { id: 'v-6', vehicleNumber: '8797', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'company' },
  { id: 'v-7', vehicleNumber: '9579', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'company' }
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

  const [advances, setAdvances] = useState<VendorAdvanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VENDOR_ADVANCES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allSuppliers = useMemo(() => {
    const list = new Set<string>(savedVendors);
    advances.forEach((adv) => {
      const name = (adv.vendorName || adv.supplierName || '').trim().toUpperCase();
      if (name) list.add(name);
    });
    return Array.from(list).sort();
  }, [savedVendors, advances]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [siteName, setSiteName] = useState(activeSiteName);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isVehicleMenuOpen, setIsVehicleMenuOpen] = useState(false);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);

  const [purchasedFrom, setPurchasedFrom] = useState('');
  const [isSupplierMenuOpen, setIsSupplierMenuOpen] = useState(false);
  const [editingSupplierIndex, setEditingSupplierIndex] = useState<number | null>(null);
  const [tempSupplierEditVal, setTempSupplierEditVal] = useState('');
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  const defaultCategory = categories[0]
    ? `${categories[0].name} (₹${categories[0].standardRate}/${categories[0].unit})`
    : '';

  const [materialName, setMaterialName] = useState(defaultCategory);
  const [dayTrips, setDayTrips] = useState<number | ''>(3);
  const [brassPerTrip, setBrassPerTrip] = useState<number | ''>(6);
  const [ratePerBrass, setRatePerBrass] = useState<number | ''>(categories[0]?.standardRate || 1500);

  const selectedVehicleObj = useMemo(() => {
    return fleetVehicles.find(
      (v) => v.vehicleNumber.trim().toUpperCase() === vehicleNumber.trim().toUpperCase()
    );
  }, [fleetVehicles, vehicleNumber]);

  const isSelectedVehicleRented = selectedVehicleObj?.ownershipType === 'rented';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(e.target as Node)) {
        setIsSupplierMenuOpen(false);
        setEditingSupplierIndex(null);
      }
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(e.target as Node)) {
        setIsVehicleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMaterialChange = (selectedFormattedName: string) => {
    setMaterialName(selectedFormattedName);
    const found = categories.find((c) => `${c.name} (₹${c.standardRate}/${c.unit})` === selectedFormattedName);
    if (found && !isSelectedVehicleRented) {
      setRatePerBrass(found.standardRate);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HAULAGE_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error('Failed saving trips', error);
    }
  }, [trips]);

  const computedTotalAmount = useMemo(() => {
    const tripsNum = Number(dayTrips) || 0;
    if (isSelectedVehicleRented) {
      const tripRentalRate = Number(selectedVehicleObj?.rentalAmount) || Number(ratePerBrass) || 1500;
      return tripsNum * tripRentalRate;
    }
    const brassNum = Number(brassPerTrip) || 0;
    const rateNum = Number(ratePerBrass) || 0;
    return tripsNum * brassNum * rateNum;
  }, [dayTrips, brassPerTrip, ratePerBrass, isSelectedVehicleRented, selectedVehicleObj]);

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

  const rentedVehiclesMap = useMemo(() => {
    const map = new Map<string, FleetVehicle>();
    fleetVehicles.forEach((v) => {
      map.set(v.vehicleNumber.trim().toUpperCase(), v);
    });
    return map;
  }, [fleetVehicles]);

  const getRowDiesel = (rowDate: string, rowVehicle: string) => {
    const vObj = rentedVehiclesMap.get(rowVehicle.trim().toUpperCase());
    const isRented = vObj?.ownershipType === 'rented';
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
        const diesel = getRowDiesel(t.tripDate, t.vehicleNumber);

        const vObj = rentedVehiclesMap.get(t.vehicleNumber.trim().toUpperCase());
        const isRented = vObj?.ownershipType === 'rented';

        let tripAmount = 0;
        if (isRented) {
          const rentalRate = vObj?.rentalAmount ?? Number(t.ratePerBrass) ?? 1500;
          tripAmount = tr * rentalRate;
        } else {
          tripAmount = tr * (Number(t.brassPerTrip) || 0) * (Number(t.ratePerBrass) || 0);
        }

        return {
          trips: acc.trips + tr,
          brass: acc.brass + totalBrass,
          amount: acc.amount + tripAmount,
          dieselLitres: acc.dieselLitres + diesel.litres,
          dieselCost: acc.dieselCost + diesel.cost
        };
      },
      { trips: 0, brass: 0, amount: 0, dieselLitres: 0, dieselCost: 0 }
    );
  }, [filtered, rentedVehiclesMap, dieselLogs, activeSiteName]);

  const matchingAdvances = useMemo(() => {
    const currentVendorNames = Array.from(new Set(filtered.map((t) => t.purchasedFrom?.trim().toLowerCase()).filter(Boolean)));
    return advances.filter((a) => {
      const matchSite = !activeSiteName || a.siteName === activeSiteName;
      const matchVendor = currentVendorNames.length === 0 || currentVendorNames.includes((a.vendorName || a.supplierName || '').trim().toLowerCase());
      const matchDate = !filterDate || a.date === filterDate;
      return matchSite && matchVendor && matchDate;
    });
  }, [advances, filtered, activeSiteName, filterDate]);

  const totalVendorAdvancePaid = useMemo(() => {
    return matchingAdvances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [matchingAdvances]);

  const totalDeductions = totalVendorAdvancePaid + overallTotals.dieselCost;
  const rawBalance = overallTotals.amount - totalDeductions;
  
  const isAdvanceExcess = rawBalance < 0;
  const netPayableAmount = Math.abs(rawBalance);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = '';
    window.print();
    document.title = originalTitle;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTripDate(new Date().toISOString().split('T')[0]);
    setSiteName(activeSiteName);
    const initialVehicle = fleetVehicles[0]?.vehicleNumber || '';
    setVehicleNumber(initialVehicle);
    setPurchasedFrom(allSuppliers[0] || 'MBB CRUSHER');
    setMaterialName(defaultCategory);
    setDayTrips(3);
    setBrassPerTrip(6);

    const vObj = fleetVehicles.find((v) => v.vehicleNumber === initialVehicle);
    if (vObj?.ownershipType === 'rented') {
      setRatePerBrass(vObj.rentalAmount || 1500);
    } else {
      setRatePerBrass(categories[0]?.standardRate || 1500);
    }
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

  const handleSaveSupplierEdit = (oldName: string) => {
    const newName = tempSupplierEditVal.trim().toUpperCase();
    if (!newName || newName === oldName) {
      setEditingSupplierIndex(null);
      return;
    }
    const updated = savedVendors.map((v) => (v === oldName ? newName : v));
    setSavedVendors(updated);
    localStorage.setItem(STORAGE_VENDORS_KEY, JSON.stringify(updated));
    if (purchasedFrom === oldName) setPurchasedFrom(newName);
    setEditingSupplierIndex(null);
  };

  const handleDeleteSupplier = (suppName: string) => {
    if (window.confirm(`Delete supplier "${suppName}" from list?`)) {
      const updated = savedVendors.filter((v) => v !== suppName);
      setSavedVendors(updated);
      localStorage.setItem(STORAGE_VENDORS_KEY, JSON.stringify(updated));
      if (purchasedFrom === suppName) {
        setPurchasedFrom(updated[0] || '');
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (dayTrips === '' || brassPerTrip === '' || ratePerBrass === '') return;

    const trimmedVendor = purchasedFrom.trim().toUpperCase() || 'MBB CRUSHER';

    if (!savedVendors.includes(trimmedVendor)) {
      const updated = [...savedVendors, trimmedVendor];
      setSavedVendors(updated);
      localStorage.setItem(STORAGE_VENDORS_KEY, JSON.stringify(updated));
    }

    const record: HaulageTripRecord = {
      id: editingId || `TRIP-${Date.now().toString().slice(-4)}`,
      tripDate,
      siteName: siteName.trim() || activeSiteName,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
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
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 0 !important; }
          html, body, #root, main, div {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
          }
          body { padding: 12mm 15mm !important; }
          nav, header, aside, .no-print, ::-webkit-scrollbar { display: none !important; }
          .print-header-container { display: block !important; margin-bottom: 14px !important; }
          .print-header-title {
            text-align: center !important; font-size: 22px !important; font-weight: 900 !important;
            letter-spacing: 0.5px !important; text-transform: uppercase !important;
            border-bottom: 2.5px solid #000000 !important; padding-bottom: 5px !important;
            margin-bottom: 10px !important; color: #000000 !important;
          }
          .print-sub-header {
            display: flex !important; justify-content: space-between !important;
            align-items: center !important; font-size: 14px !important; font-weight: 900 !important;
            text-transform: uppercase !important; color: #000000 !important; margin-bottom: 10px !important;
          }
          .print-clean-table { width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; }
          .print-clean-table th {
            border-top: 2px solid #000000 !important; border-bottom: 2px solid #000000 !important;
            background: transparent !important; color: #000000 !important; font-size: 9px !important;
            font-weight: 900 !important; text-transform: uppercase !important; padding: 5px 3px !important;
          }
          .print-clean-table td {
            border-bottom: 1px solid #e2e8f0 !important; color: #000000 !important;
            font-size: 9px !important; padding: 6px 3px !important; vertical-align: middle !important;
          }
          .print-clean-table tfoot td { padding: 5px 3px !important; font-size: 9.5px !important; font-weight: 800 !important; }
          .print-total-row td { border-top: 2px solid #000000 !important; border-bottom: 1px solid #cbd5e1 !important; }
          .print-sub-row td { border-bottom: 1px solid #e2e8f0 !important; }
          .print-net-row td { border-bottom: none !important; font-size: 11px !important; font-weight: 900 !important; }
        }
      `}} />

      {/* Printable Invoice Header */}
      <div className="hidden print:block print-header-container">
        <div className="print-header-title">M B BILGI CONSTRUCTIONS</div>
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
            <p className="text-xs text-slate-400">Track trips, apply rented vehicle per-trip tariffs, and auto-deduct diesel & advances for {activeSiteName}.</p>
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
          <div className="text-[10px] font-bold uppercase text-slate-400">Gross Haulage / Trips Total</div>
          <div className="text-xl font-black text-white font-mono mt-1">₹{overallTotals.amount.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500">{overallTotals.trips} Trips ({overallTotals.brass} Brass)</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B]">
          <div className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
            <Fuel className="w-3 h-3 text-amber-400" />
            <span>(-) Less: Rented Diesel</span>
          </div>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">₹{overallTotals.dieselCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</div>
          <div className="text-[10px] text-slate-500">{overallTotals.dieselLitres.toFixed(1)} Litres Issued</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B]">
          <div className="text-[10px] font-bold uppercase text-rose-400">(-) Less: Advance Paid</div>
          <div className="text-xl font-black text-rose-400 font-mono mt-1">₹{totalVendorAdvancePaid.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500">{matchingAdvances.length} Advance Payments Recorded</div>
        </div>

        <div className={`p-4 rounded-2xl border ${isAdvanceExcess ? 'bg-rose-950/20 border-rose-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
          <div className={`text-[10px] font-bold uppercase ${isAdvanceExcess ? 'text-rose-400' : 'text-amber-400'}`}>
            {isAdvanceExcess ? '(+) Advance Balance With Vendor' : '(=) Net Payable to Vendor'}
          </div>
          <div className={`text-xl font-black font-mono mt-1 ${isAdvanceExcess ? 'text-rose-400' : 'text-amber-400'}`}>
            {isAdvanceExcess ? '+' : ''}₹{netPayableAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
          </div>
          <div className="text-[10px] text-slate-400">
            {isAdvanceExcess ? 'Excess advance holding / to adjust in next trips' : 'Pending balance to pay to vendor'}
          </div>
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

      {/* Main Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl print:border-none print:shadow-none print:rounded-none">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs border-collapse print-clean-table">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80 print:bg-transparent">
                <th className="py-2.5 px-3 text-left">DATE</th>
                <th className="py-2.5 px-3 text-center">SITE</th>
                <th className="py-2.5 px-3 text-left">PURCHASED FROM</th>
                <th className="py-2.5 px-3 text-center">VEHICLE</th>
                <th className="py-2.5 px-3 text-left">MATERIAL / TRIP TYPE</th>
                <th className="py-2.5 px-2 text-center">TRIPS</th>
                <th className="py-2.5 px-2 text-right">QTY/TRIP</th>
                <th className="py-2.5 px-2 text-right">RATE (₹)</th>
                <th className="py-2.5 px-3 text-right">TRIP / MAT AMOUNT (₹)</th>
                <th className="py-2.5 px-3 text-right text-amber-400 print:text-black">(-) DIESEL (₹)</th>
                <th className="py-2.5 px-3 text-right font-black text-emerald-400 print:text-black">NET ROW (₹)</th>
                <th className="py-2.5 px-3 text-center no-print">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500">
                    No records found for {activeSiteName}.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const vObj = rentedVehiclesMap.get(t.vehicleNumber.trim().toUpperCase());
                  const isRented = vObj?.ownershipType === 'rented';
                  const rowDiesel = getRowDiesel(t.tripDate, t.vehicleNumber);

                  let rowGrossAmount = 0;
                  if (isRented) {
                    const rentalRate = vObj?.rentalAmount ?? Number(t.ratePerBrass) ?? 1500;
                    rowGrossAmount = Number(t.dayTrips) * rentalRate;
                  } else {
                    rowGrossAmount = Number(t.dayTrips) * (Number(t.brassPerTrip) || 0) * (Number(t.ratePerBrass) || 0);
                  }

                  const rowNetPayable = Math.max(0, rowGrossAmount - rowDiesel.cost);

                  return (
                    <tr key={t.id} className="hover:bg-[#121c33]/50">
                      <td className="py-2 px-3 font-mono text-left whitespace-nowrap text-slate-300 print:text-black">
                        {formatDateDMY(t.tripDate)}
                      </td>
                      <td className="py-2 px-3 font-bold text-cyan-400 print:text-black text-center">{t.siteName}</td>
                      <td className="py-2 px-3 font-semibold text-emerald-400 print:text-black">{t.purchasedFrom || 'MBB CRUSHER'}</td>
                      
                      <td className="py-2 px-3 font-mono text-center print:text-black">
                        <span className="font-bold">{t.vehicleNumber}</span>
                        {isRented ? (
                          <span className="block text-[8px] text-purple-400 print:text-black font-sans font-bold uppercase">(Rented)</span>
                        ) : (
                          <span className="block text-[8px] text-blue-400 print:text-black font-sans font-bold uppercase">(Company)</span>
                        )}
                      </td>

                      <td className="py-2 px-3 font-bold text-amber-300 print:text-black">{t.materialName}</td>
                      <td className="py-2 px-2 text-center font-mono print:text-black">{t.dayTrips}</td>
                      
                      <td className="py-2 px-2 text-right font-mono print:text-black">
                        {isRented ? (
                          <span className="text-slate-500 font-sans text-[10px]">{t.brassPerTrip} Brass (Haul)</span>
                        ) : (
                          `${t.brassPerTrip} Brass`
                        )}
                      </td>

                      <td className="py-2 px-2 text-right font-mono text-emerald-400 print:text-black">
                        ₹{(isRented ? (vObj?.rentalAmount ?? t.ratePerBrass) : t.ratePerBrass).toLocaleString('en-IN')}
                        <span className="text-[9px] text-slate-400 block">{isRented ? '/Trip' : '/Brass'}</span>
                      </td>

                      <td className="py-2 px-3 text-right font-mono font-black text-amber-400 print:text-black">
                        ₹{rowGrossAmount.toLocaleString('en-IN')}
                      </td>

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

                      <td className="py-2 px-3 text-right font-mono font-black text-emerald-400 print:text-black">
                        ₹{rowNetPayable.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
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
            {filtered.length > 0 && (
              <tfoot className="border-t-2 border-[#1E293B] print:border-t-2 print:border-black bg-[#070c18] font-mono print:bg-white text-xs">
                {/* 1. Trip Gross & Diesel Subtotal */}
                <tr className="border-b border-[#1E293B]/60 print-total-row">
                  <td colSpan={5} className="py-2 px-3 font-black uppercase text-right text-slate-200 print:text-black">
                    TOTAL TRIPS & CHARGES:
                  </td>
                  <td className="py-2 px-2 text-center font-black text-cyan-400 print:text-black">{overallTotals.trips} Trips</td>
                  <td className="py-2 px-2 text-right font-black text-white print:text-black">{overallTotals.brass} Brass</td>
                  <td className="py-2 px-2 text-right text-slate-500 print:text-black">—</td>
                  <td className="py-2 px-3 text-right font-black text-white print:text-black">₹{overallTotals.amount.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-right font-bold text-amber-400 print:text-black">
                    {overallTotals.dieselCost > 0 ? `- ₹${overallTotals.dieselCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-right font-black text-emerald-400 print:text-black">
                    ₹{Math.max(0, overallTotals.amount - overallTotals.dieselCost).toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                  <td className="no-print"></td>
                </tr>

                {/* 2. Individual Advance Payment Rows with Date */}
                {matchingAdvances.length > 0 ? (
                  matchingAdvances.map((adv) => (
                    <tr key={adv.id} className="border-b border-[#1E293B]/40 text-rose-400 print:text-black print-sub-row bg-rose-950/10 print:bg-transparent">
                      <td colSpan={8} className="py-2 px-3 text-right">
                        <span className="font-bold text-rose-400 print:text-black uppercase">
                          (-) LESS: ADVANCE PAYMENT RECEIVED
                        </span>
                        <span className="ml-2 inline-block px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 print:border-black text-[11px] font-mono text-rose-300 print:text-black">
                          {formatDateDMY(adv.date)}
                        </span>
                        {(adv.notes || adv.paymentMode) && (
                          <span className="ml-2 text-[10px] text-slate-400 font-sans print:text-slate-700">
                            ({[adv.paymentMode, adv.notes].filter(Boolean).join(' - ')})
                          </span>
                        )}
                        :
                      </td>
                      <td colSpan={3} className="py-2 px-3 text-right font-black font-mono">
                        - ₹{Number(adv.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="no-print"></td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-[#1E293B]/40 text-slate-500 print:text-black print-sub-row">
                    <td colSpan={8} className="py-1.5 px-3 text-right font-bold uppercase text-[11px]">
                      (-) LESS: ADVANCE PAYMENT RECEIVED:
                    </td>
                    <td colSpan={3} className="py-1.5 px-3 text-right font-mono text-[11px]">
                      ₹0.0
                    </td>
                    <td className="no-print"></td>
                  </tr>
                )}

                {/* 3. Diesel Deduction Subtotal */}
                <tr className="border-b border-[#1E293B]/60 text-amber-400 print:text-black print-sub-row">
                  <td colSpan={8} className="py-2 px-3 font-black uppercase text-right">
                    (-) LESS: DIESEL ISSUED TO RENTED VEHICLES ({overallTotals.dieselLitres.toFixed(1)} L):
                  </td>
                  <td colSpan={3} className="py-2 px-3 text-right font-black">
                    - ₹{overallTotals.dieselCost.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>
                  <td className="no-print"></td>
                </tr>

                {/* 4. Final Net Balance (Dynamic: Excess Advance vs Payable) */}
                <tr
                  className={`font-black print-net-row ${
                    isAdvanceExcess
                      ? 'bg-[#220c14] text-rose-400'
                      : 'bg-[#1e1906] text-amber-400'
                  } print:bg-transparent print:text-black`}
                >
                  <td colSpan={8} className="py-2.5 px-3 text-right uppercase tracking-wider text-xs">
                    {isAdvanceExcess ? (
                      <span className="flex items-center justify-end gap-2 text-rose-400 print:text-black">
                        <span className="px-2 py-0.5 rounded bg-rose-900/40 border border-rose-700/50 print:border-black text-[10px] font-sans uppercase tracking-normal">
                          Excess Advance
                        </span>
                        (+) ADVANCE BALANCE REMAINING WITH VENDOR:
                      </span>
                    ) : (
                      '(=) NET PAYABLE AMOUNT TO VENDOR:'
                    )}
                  </td>
                  <td colSpan={3} className="py-2.5 px-3 text-right text-sm font-black">
                    {isAdvanceExcess ? '+' : ''}₹{netPayableAmount.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
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

              {/* Vehicle Number: Type or Select Combobox */}
              <div className="relative" ref={vehicleDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-bold">Vehicle Number *</label>
                  {isSelectedVehicleRented ? (
                    <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
                      <KeyRound className="w-3 h-3" /> Hired / Rented Truck Tariff
                    </span>
                  ) : selectedVehicleObj ? (
                    <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Company Owned Vehicle
                    </span>
                  ) : null}
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Type vehicle number or select from list..."
                    value={vehicleNumber}
                    onFocus={() => setIsVehicleMenuOpen(true)}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setVehicleNumber(val);
                      setIsVehicleMenuOpen(true);
                      const vObj = fleetVehicles.find(
                        (v) => v.vehicleNumber.trim().toUpperCase() === val.trim()
                      );
                      if (vObj?.ownershipType === 'rented') {
                        setRatePerBrass(vObj.rentalAmount || 1500);
                      } else if (vObj) {
                        setRatePerBrass(categories[0]?.standardRate || 1500);
                      }
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#162032] border border-[#1E293B] focus:border-blue-500 rounded-xl text-white font-mono font-bold uppercase outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsVehicleMenuOpen(!isVehicleMenuOpen)}
                    className="absolute right-3 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isVehicleMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isVehicleMenuOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50 max-h-56 overflow-y-auto">
                    <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-[#1E293B]">
                      Registered Fleet Vehicles
                    </div>

                    {fleetVehicles
                      .filter((v) =>
                        !vehicleNumber ||
                        v.vehicleNumber.toLowerCase().includes(vehicleNumber.toLowerCase()) ||
                        v.vehicleType.toLowerCase().includes(vehicleNumber.toLowerCase())
                      )
                      .map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setVehicleNumber(v.vehicleNumber);
                            if (v.ownershipType === 'rented') {
                              setRatePerBrass(v.rentalAmount || 1500);
                            } else {
                              setRatePerBrass(categories[0]?.standardRate || 1500);
                            }
                            setIsVehicleMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-[#162032] transition-colors cursor-pointer text-left ${
                            vehicleNumber.toUpperCase() === v.vehicleNumber.toUpperCase() ? 'bg-[#162032]/80' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="font-mono font-bold text-white">{v.vehicleNumber}</span>
                            <span className="text-slate-400 text-[11px]">— {v.vehicleType}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              v.ownershipType === 'rented'
                                ? 'bg-purple-950/60 border border-purple-800 text-purple-300'
                                : 'bg-blue-950/60 border border-blue-800 text-blue-300'
                            }`}
                          >
                            {v.ownershipType === 'rented' ? `Rented: ₹${v.rentalAmount || 1500}/trip` : 'Company'}
                          </span>
                        </button>
                      ))}

                    {vehicleNumber && !fleetVehicles.some(v => v.vehicleNumber.toUpperCase() === vehicleNumber.trim().toUpperCase()) && (
                      <div
                        onClick={() => setIsVehicleMenuOpen(false)}
                        className="px-3.5 py-2 text-[11px] text-emerald-400 bg-emerald-950/20 border-t border-[#1E293B] cursor-pointer hover:bg-emerald-950/40 flex items-center justify-between"
                      >
                        <span>Use entered vehicle: <strong className="font-mono">{vehicleNumber}</strong></span>
                        <span className="text-[10px] text-slate-400 font-sans">(Press outside or click to confirm)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Purchased From / Supplier Dropdown */}
              <div className="relative" ref={supplierDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">Purchased From / Supplier *</label>
                  <button
                    type="button"
                    onClick={() => setIsSupplierMenuOpen(!isSupplierMenuOpen)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <span>{allSuppliers.length} vendors</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Type or select supplier (e.g. MBB CRUSHER)"
                    value={purchasedFrom}
                    onChange={(e) => setPurchasedFrom(e.target.value.toUpperCase())}
                    onFocus={() => setIsSupplierMenuOpen(true)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#162032] border border-blue-500/40 focus:border-blue-400 rounded-xl text-white uppercase font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSupplierMenuOpen(!isSupplierMenuOpen)}
                    className="absolute right-3 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSupplierMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isSupplierMenuOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50 max-h-56 overflow-y-auto">
                    <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-[#1E293B] flex items-center justify-between">
                      <span>Saved Suppliers</span>
                      <span className="text-blue-400 font-mono">Select / Edit / Delete</span>
                    </div>

                    {allSuppliers.length === 0 ? (
                      <div className="p-3 text-center text-slate-500 text-xs">No suppliers saved yet. Type above to add.</div>
                    ) : (
                      allSuppliers.map((supp, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-2 text-xs flex items-center justify-between hover:bg-[#162032] transition-colors ${
                            purchasedFrom === supp ? 'bg-[#162032]/80' : ''
                          }`}
                        >
                          {editingSupplierIndex === idx ? (
                            <div className="flex items-center gap-1.5 flex-1 pr-2">
                              <input
                                type="text"
                                autoFocus
                                value={tempSupplierEditVal}
                                onChange={(e) => setTempSupplierEditVal(e.target.value.toUpperCase())}
                                className="w-full px-2 py-1 bg-[#080d19] border border-blue-500 rounded-lg text-white text-xs uppercase font-bold outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveSupplierEdit(supp)}
                                className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSupplierIndex(null)}
                                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setPurchasedFrom(supp);
                                  setIsSupplierMenuOpen(false);
                                }}
                                className="flex-1 text-left font-bold text-white truncate cursor-pointer flex items-center gap-2"
                              >
                                <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span className={purchasedFrom === supp ? 'text-blue-400' : ''}>{supp}</span>
                              </button>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSupplierIndex(idx);
                                    setTempSupplierEditVal(supp);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 cursor-pointer"
                                  title="Edit Name"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSupplier(supp);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                                  title="Delete Supplier"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
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
                  <label className="block text-slate-300 font-bold mb-1">
                    {isSelectedVehicleRented ? 'Capacity/Trip' : 'Qty/Trip *'}
                  </label>
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
                  <label className="block text-slate-300 font-bold mb-1">
                    {isSelectedVehicleRented ? 'Rental/Trip (₹) *' : 'Rate/Brass (₹) *'}
                  </label>
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
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Total Day Amount:</span>
                  <span className="text-[10px] text-slate-500">
                    {isSelectedVehicleRented
                      ? `(${dayTrips || 0} Trips × ₹${ratePerBrass || 0} Trip Tariff)`
                      : `(${dayTrips || 0} Trips × ${brassPerTrip || 0} Brass × ₹${ratePerBrass || 0})`}
                  </span>
                </div>
                <span className="text-base font-black text-amber-400 font-mono">
                  ₹{computedTotalAmount.toLocaleString('en-IN')}
                </span>
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
