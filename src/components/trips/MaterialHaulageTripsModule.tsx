import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  Truck,
  Store,
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

const STORAGE_HAULAGE_KEY = 'CONSTRUCTION_PRO_HAULAGE_TRIPS_V2';
const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';
const STORAGE_VENDORS_KEY = 'CONSTRUCTION_PRO_VENDOR_NAMES_V1';

const INITIAL_ROAD_CATEGORIES: RoadMaterialCategory[] = [
  { id: 'RCAT-01', name: 'Granular Sub-Base (GSB)', description: 'Coarse graded granular material sub-base', standardRate: 1500, unit: 'Brass' },
  { id: 'RCAT-02', name: 'Wet Mix Macadam (WMM)', description: 'Crushed stone aggregate base/sub-base layer', standardRate: 4500, unit: 'Brass' },
  { id: 'RCAT-03', name: 'Dense Bituminous Macadam (DBM)', description: 'Structural layer in flexible pavements', standardRate: 5500, unit: 'Brass' },
  { id: 'RCAT-04', name: 'Bituminous Concrete (BC)', description: 'High quality wearing course finish', standardRate: 6000, unit: 'Brass' }
];

const INITIAL_HAULAGE_TRIPS: HaulageTripRecord[] = [
  {
    id: 'TRIP-3971',
    tripDate: '2026-09-14',
    siteName: 'MULWAD',
    vehicleNumber: '8797',
    materialName: 'Granular Sub-Base (GSB) (₹1500/Brass)',
    purchasedFrom: 'gigaonkar',
    dayTrips: 3,
    brassPerTrip: 5,
    ratePerBrass: 1500,
    totalAmount: 22500
  },
  {
    id: 'TRIP-0609',
    tripDate: '2026-09-14',
    siteName: 'MULWAD',
    vehicleNumber: '9579',
    materialName: 'Granular Sub-Base (GSB) (₹1500/Brass)',
    purchasedFrom: 'gigaonkar',
    dayTrips: 3,
    brassPerTrip: 6,
    ratePerBrass: 1500,
    totalAmount: 27000
  },
  {
    id: 'TRIP-9099',
    tripDate: '2026-09-14',
    siteName: 'MULWAD',
    vehicleNumber: '9580',
    materialName: 'Granular Sub-Base (GSB) (₹1500/Brass)',
    purchasedFrom: 'gigaonkar',
    dayTrips: 3,
    brassPerTrip: 6,
    ratePerBrass: 1500,
    totalAmount: 27000
  }
];

export const MaterialHaulageTripsModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId } = useERP();

  const currentActiveSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const activeSiteName = currentActiveSite?.siteName || siteSheets[0]?.siteName || 'MULWAD';

  const [trips, setTrips] = useState<HaulageTripRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HAULAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_HAULAGE_KEY, JSON.stringify(INITIAL_HAULAGE_TRIPS));
      return INITIAL_HAULAGE_TRIPS;
    } catch {
      return INITIAL_HAULAGE_TRIPS;
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
      if (saved) return JSON.parse(saved);
      return ['gigaonkar', 'Mahalaxmi Stone Crusher', 'Bilgi Hot Mix Plant Quarry #1'];
    } catch {
      return ['gigaonkar', 'Mahalaxmi Stone Crusher', 'Bilgi Hot Mix Plant Quarry #1'];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [siteName, setSiteName] = useState(activeSiteName);
  const [vehicleNumber, setVehicleNumber] = useState('TOTAL TRIPS');
  const [purchasedFrom, setPurchasedFrom] = useState('');

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
    if (isModalOpen) {
      try {
        const savedCats = localStorage.getItem(STORAGE_ROAD_CATS_KEY);
        if (savedCats) {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
          }
        }
        const savedVends = localStorage.getItem(STORAGE_VENDORS_KEY);
        if (savedVends) {
          setSavedVendors(JSON.parse(savedVends));
        }
      } catch (error) {
        console.error('Failed to reload categories/vendors', error);
      }
    }
  }, [isModalOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HAULAGE_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error('Failed to save trips to localStorage', error);
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
      const matchSite =
        !activeSiteName ||
        t.siteName === activeSiteName ||
        t.siteName.toLowerCase().includes(activeSiteName.toLowerCase());
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        t.vehicleNumber.toLowerCase().includes(q) ||
        t.materialName.toLowerCase().includes(q) ||
        (t.purchasedFrom || '').toLowerCase().includes(q);
      return matchSite && matchQuery;
    });
  }, [trips, activeSiteName, searchQuery]);

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

  // Extract distinct vendor name(s) for the print header
  const activeVendorName = useMemo(() => {
    const vendors = Array.from(new Set(filtered.map((t) => t.purchasedFrom?.trim()).filter(Boolean)));
    return vendors.length > 0 ? vendors.join(', ') : 'Direct Supplier';
  }, [filtered]);

  const vendorBreakdown = useMemo(() => {
    const map: Record<string, { trips: number; brass: number; amount: number }> = {};
    filtered.forEach((t) => {
      const v = t.purchasedFrom?.trim() || 'Direct / Unspecified';
      if (!map[v]) {
        map[v] = { trips: 0, brass: 0, amount: 0 };
      }
      const tr = Number(t.dayTrips) || 0;
      map[v].trips += tr;
      map[v].brass += tr * (Number(t.brassPerTrip) || 0);
      map[v].amount += Number(t.totalAmount) || 0;
    });
    return map;
  }, [filtered]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTripDate(new Date().toISOString().split('T')[0]);
    setSiteName(activeSiteName);
    setVehicleNumber('TOTAL TRIPS');
    setPurchasedFrom('');
    setMaterialName(defaultCategory);
    setDayTrips(3);
    setBrassPerTrip(6);
    setRatePerBrass(categories[0]?.standardRate || 1500);
    setIsModalOpen(true);
  };

  const handleEdit = (trip: HaulageTripRecord) => {
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
    if (window.confirm('Are you sure you want to delete this trip record?')) {
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (dayTrips === '' || brassPerTrip === '' || ratePerBrass === '') return;

    const trimmedVendor = purchasedFrom.trim() || 'Direct Quarry / Plant';

    if (trimmedVendor && !savedVendors.includes(trimmedVendor)) {
      const updatedVendors = [trimmedVendor, ...savedVendors];
      setSavedVendors(updatedVendors);
      try {
        localStorage.setItem(STORAGE_VENDORS_KEY, JSON.stringify(updatedVendors));
      } catch (err) {
        console.error('Failed to save vendor name', err);
      }
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

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-slate-100">
      
      {/* Print-specific stylesheet to fit table exactly on one portrait page */}
      <style>{`
        @media print {
          @page {
            size: portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 10px !important;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 12px;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 9.5px !important;
            table-layout: fixed !important;
          }
          th, td {
            border: 1px solid #999 !important;
            padding: 5px 6px !important;
            color: #111 !important;
            word-wrap: break-word !important;
            overflow: hidden !important;
          }
          th {
            background-color: #f3f4f6 !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
          }
          tfoot tr {
            background-color: #f8fafc !important;
            font-weight: 800 !important;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Material Haulage Trips</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Track daily trip counts, supplier procurement, and total purchase ledger for {activeSiteName}.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Print or Save as Single Page PDF"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Log Haulage Trips</span>
          </button>
        </div>
      </div>

      {/* Supplier-Wise Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] shadow-lg flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Material Purchase</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">
            ₹{overallTotals.amount.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {overallTotals.trips} Total Trips • {overallTotals.brass} Brass Laid
          </div>
        </div>

        {Object.entries(vendorBreakdown).slice(0, 3).map(([vName, vData]) => (
          <div key={vName} className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] shadow-lg flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 truncate">
              <Store className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{vName}</span>
            </div>
            <div className="text-2xl font-black text-white font-mono mt-2">
              ₹{vData.amount.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {vData.trips} trips ({vData.brass} Brass)
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="p-3 sm:p-4 rounded-[1.2rem] sm:rounded-3xl bg-[#0c1427] border border-[#182643] flex items-center gap-3 text-xs no-print">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 sm:top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by vehicle, supplier / quarry, material name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* Main Table / Print Section */}
      <div id="print-area" className="bg-[#0B1220] border border-[#1E293B] rounded-[1.2rem] sm:rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Printable Header with Vendor Name */}
        <div className="hidden print-header p-4">
          <div className="border-b-2 border-black pb-3">
            <h1 className="text-xl font-black uppercase text-black tracking-tight">
              {activeVendorName}
            </h1>
            <p className="text-xs text-black font-bold uppercase tracking-wider mt-0.5">
              MATERIAL PURCHASED
            </p>
            <div className="text-[11px] text-black font-semibold mt-1">
              <span><strong>Site:</strong> {activeSiteName}</span>
            </div>
          </div>
        </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-black uppercase tracking-wider">
                TOTAL PAYABLE AMOUNT
              </div>
              <div className="text-xl font-black text-black font-mono">
                ₹{overallTotals.amount.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-black font-medium mt-0.5">
                {overallTotals.trips} Total Trips ({overallTotals.brass} Brass)
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] sm:text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3 px-3 w-[12%] text-center">DATE</th>
                <th className="py-3 px-3 w-[12%] text-center">SITE</th>
                <th className="py-3 px-3 w-[16%]">PURCHASED FROM</th>
                <th className="py-3 px-3 w-[12%] text-center">VEHICLE</th>
                <th className="py-3 px-3 w-[22%]">MATERIAL NAME</th>
                <th className="py-3 px-2 w-[7%] text-center">TRIPS</th>
                <th className="py-3 px-2 w-[7%] text-right">QTY/TRIP</th>
                <th className="py-3 px-2 w-[10%] text-right">RATE (₹)</th>
                <th className="py-3 px-3 w-[14%] text-right">AMOUNT (₹)</th>
                <th className="py-3 px-3 w-[8%] text-center no-print">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No haulage trip records found for {activeSiteName}.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-300 text-center whitespace-nowrap">
                      {t.tripDate}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-cyan-400 text-center whitespace-nowrap">{t.siteName}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400 truncate">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-400/70 shrink-0 no-print" />
                        <span>{t.purchasedFrom || 'Direct Quarry'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-300 text-center whitespace-nowrap">{t.vehicleNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-300 truncate">{t.materialName}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold">{t.dayTrips}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{t.brassPerTrip}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-emerald-400 whitespace-nowrap">₹{t.ratePerBrass.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-amber-400 text-[11px] sm:text-xs whitespace-nowrap">
                      ₹{t.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(t)}
                          title="Edit Record"
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          title="Delete Record"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Total Footer Row */}
            {filtered.length > 0 && (
              <tfoot className="border-t-2 border-[#1E293B] bg-[#070c18] font-mono">
                <tr>
                  <td colSpan={5} className="py-3 px-3 font-black uppercase text-slate-300 text-right tracking-wider">
                    Total Purchases & Volume:
                  </td>
                  <td className="py-3 px-2 text-center font-black text-cyan-400 text-xs whitespace-nowrap">
                    {overallTotals.trips} Trips
                  </td>
                  <td className="py-3 px-2 text-right font-black text-white text-xs whitespace-nowrap">
                    {overallTotals.brass} Brass
                  </td>
                  <td className="py-3 px-2 text-right text-slate-500 font-normal">
                    —
                  </td>
                  <td className="py-3 px-3 text-right font-black text-amber-400 text-xs sm:text-sm whitespace-nowrap">
                    ₹{overallTotals.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in no-print">
          <div className="bg-[#121927] border border-[#1E293B] rounded-[1.5rem] sm:rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{editingId ? 'Edit Haulage Trip' : 'Log Total Day Haulage Trips'}</span>
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-[11px] sm:text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Trip Date *</label>
                  <input
                    type="date"
                    required
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Site Name *</label>
                  {siteSheets.length > 0 ? (
                    <select
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-cyan-400 font-medium outline-none cursor-pointer"
                    >
                      {siteSheets.map((s: any) => (
                        <option key={s.siteId} value={s.siteName}>
                          {s.siteName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="MULWAD"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-cyan-400 font-medium outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Vehicle Number *</label>
                <input
                  type="text"
                  required
                  placeholder="TOTAL TRIPS or vehicle registration (e.g. 8797, 9579)..."
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex justify-between items-center">
                  <span>Purchased From / Supplier *</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Saves automatically for next time</span>
                </label>
                <input
                  type="text"
                  list="vendor-options"
                  required
                  placeholder="e.g. gigaonkar, Mahalaxmi Stone Crusher..."
                  value={purchasedFrom}
                  onChange={(e) => setPurchasedFrom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] focus:border-blue-500 rounded-xl text-white outline-none"
                />
                <datalist id="vendor-options">
                  {savedVendors.map((vendor, idx) => (
                    <option key={idx} value={vendor} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 flex justify-between items-center">
                  <span>Material Name *</span>
                  <span className="text-[10px] text-blue-400 font-normal hidden sm:inline">Sourced from Categories Tab</span>
                </label>
                <select
                  value={materialName}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-300 font-bold outline-none cursor-pointer"
                >
                  {categories.length === 0 && (
                    <option value="">No categories found. Please add in Categories tab.</option>
                  )}
                  {categories.map((c) => {
                    const label = `${c.name} (₹${c.standardRate}/${c.unit})`;
                    return (
                      <option key={c.id} value={label}>
                        {label}
                      </option>
                    );
                  })}
                  
                  {!categories.some((c) => `${c.name} (₹${c.standardRate}/${c.unit})` === materialName) && materialName && (
                    <option value={materialName}>{materialName}</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Day Trips *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={dayTrips}
                    onChange={(e) => setDayTrips(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Quantity/Trip *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={brassPerTrip}
                    onChange={(e) => setBrassPerTrip(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rate/Unit (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={ratePerBrass}
                    onChange={(e) => setRatePerBrass(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              {/* Live Calculated Total Amount Display */}
              <div className="p-3 sm:p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] flex items-center justify-between mt-2">
                <span className="text-xs sm:text-sm font-bold text-slate-300">Total Day Amount:</span>
                <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                  ₹{computedTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex sm:flex-row flex-col justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-400 hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer"
                >
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
