import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  Truck
} from 'lucide-react';

export interface HaulageTripRecord {
  id: string;
  tripDate: string;
  siteName: string;
  vehicleNumber: string;
  materialName: string;
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

const INITIAL_ROAD_CATEGORIES: RoadMaterialCategory[] = [
  { id: 'RCAT-01', name: 'Bituminous Macadam (BM)', description: 'Dense bituminous macadam binder course', standardRate: 5000, unit: 'Brass' },
  { id: 'RCAT-02', name: 'Wet Mix Macadam (WMM)', description: 'Crushed stone aggregate base/sub-base layer', standardRate: 4500, unit: 'Brass' },
  { id: 'RCAT-03', name: 'Granular Sub-Base (GSB)', description: 'Coarse graded granular material sub-base', standardRate: 4200, unit: 'Brass' },
  { id: 'RCAT-04', name: 'Dense Bituminous Macadam (DBM)', description: 'Structural layer in flexible pavements', standardRate: 5500, unit: 'Brass' },
  { id: 'RCAT-05', name: 'Bituminous Concrete (BC)', description: 'High quality wearing course finish', standardRate: 6000, unit: 'Brass' }
];

const INITIAL_HAULAGE_TRIPS: HaulageTripRecord[] = [
  {
    id: 'TRIP-101',
    tripDate: '2026-08-19',
    siteName: 'SINDAGI - ALMEL ROAD',
    vehicleNumber: 'TOTAL TRIPS',
    materialName: 'Bituminous Macadam (BM) (₹5000/Brass)',
    dayTrips: 10,
    brassPerTrip: 6,
    ratePerBrass: 5000,
    totalAmount: 300000
  }
];

export const MaterialHaulageTripsModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId } = useERP();

  // Resolve active site based on global header selection
  const currentActiveSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const activeSiteName = currentActiveSite?.siteName || siteSheets[0]?.siteName || 'SINDAGI - ALMEL ROAD';

  // Load Trips safely
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

  // Load Categories safely
  const [categories, setCategories] = useState<RoadMaterialCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROAD_CATS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ROAD_CATEGORIES;
    } catch {
      return INITIAL_ROAD_CATEGORIES;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [tripDate, setTripDate] = useState('2026-08-19');
  const [siteName, setSiteName] = useState(activeSiteName);
  const [vehicleNumber, setVehicleNumber] = useState('TOTAL TRIPS');
  
  const defaultCategory = categories[0] 
    ? `${categories[0].name} (₹${categories[0].standardRate}/${categories[0].unit})` 
    : '';
    
  const [materialName, setMaterialName] = useState(defaultCategory);
  const [dayTrips, setDayTrips] = useState<number | ''>(10);
  const [brassPerTrip, setBrassPerTrip] = useState<number | ''>(6);
  const [ratePerBrass, setRatePerBrass] = useState<number | ''>(categories[0]?.standardRate || 5000);

  // Auto-Update rate when material preset changes
  const handleMaterialChange = (selectedFormattedName: string) => {
    setMaterialName(selectedFormattedName);
    
    const found = categories.find((c) => `${c.name} (₹${c.standardRate}/${c.unit})` === selectedFormattedName);
    if (found) {
      setRatePerBrass(found.standardRate);
    }
  };

  // Re-fetch categories when modal opens in case user added new ones elsewhere
  useEffect(() => {
    if (isModalOpen && !editingId) {
      try {
        const saved = localStorage.getItem(STORAGE_ROAD_CATS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
            if (!materialName) {
              setMaterialName(`${parsed[0].name} (₹${parsed[0].standardRate}/${parsed[0].unit})`);
              setRatePerBrass(parsed[0].standardRate);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    }
  }, [isModalOpen, materialName, editingId]);

  // Persist trips on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HAULAGE_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error("Failed to save trips to localStorage", error);
    }
  }, [trips]);

  const computedTotalAmount = useMemo(() => {
    const tripsNum = Number(dayTrips) || 0;
    const brassNum = Number(brassPerTrip) || 0;
    const rateNum = Number(ratePerBrass) || 0;
    return tripsNum * brassNum * rateNum;
  }, [dayTrips, brassPerTrip, ratePerBrass]);

  // Dynamically filter trips by the active site header
  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const matchSite = t.siteName === activeSiteName;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        t.vehicleNumber.toLowerCase().includes(q) ||
        t.materialName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      return matchSite && matchQuery;
    });
  }, [trips, activeSiteName, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTripDate(new Date().toISOString().split('T')[0]);
    setSiteName(activeSiteName);
    setVehicleNumber('TOTAL TRIPS');
    setMaterialName(defaultCategory);
    setDayTrips(10);
    setBrassPerTrip(6);
    setRatePerBrass(categories[0]?.standardRate || 5000);
    setIsModalOpen(true);
  };

  const handleEdit = (trip: HaulageTripRecord) => {
    setEditingId(trip.id);
    setTripDate(trip.tripDate);
    setSiteName(trip.siteName);
    setVehicleNumber(trip.vehicleNumber);
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

    const record: HaulageTripRecord = {
      id: editingId || `TRIP-${Date.now().toString().slice(-4)}`,
      tripDate,
      siteName: siteName.trim() || activeSiteName,
      vehicleNumber: vehicleNumber.trim() || 'TOTAL TRIPS',
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

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Material Haulage Trips</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Track daily trip counts, material volumes, and haulage expenses for {activeSiteName}.</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>+ Log Haulage Trips</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 sm:p-4 rounded-[1.2rem] sm:rounded-3xl bg-[#0c1427] border border-[#182643] flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 sm:top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by vehicle, material name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-[1.2rem] sm:rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#1E293B]">
          <table className="w-full text-left text-[10px] sm:text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">TRIP ID & DATE</th>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">SITE NAME</th>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">VEHICLE / BATCH</th>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">MATERIAL NAME</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">TRIPS</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">QTY/TRIP</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">RATE/UNIT</th>
                <th className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">TOTAL AMOUNT</th>
                <th className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No haulage trip records found for {activeSiteName}.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3 sm:py-3.5 px-4 sm:px-6 font-mono whitespace-nowrap">
                      <div className="font-bold text-white">{t.id}</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400">{t.tripDate}</div>
                    </td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-6 font-bold text-cyan-400 whitespace-nowrap">{t.siteName}</td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-300 whitespace-nowrap">{t.vehicleNumber}</td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-6 font-bold text-amber-300 whitespace-nowrap">{t.materialName}</td>
                    <td className="py-3 sm:py-3.5 px-4 text-center font-mono font-bold whitespace-nowrap">{t.dayTrips}</td>
                    <td className="py-3 sm:py-3.5 px-4 text-right font-mono whitespace-nowrap">{t.brassPerTrip}</td>
                    <td className="py-3 sm:py-3.5 px-4 text-right font-mono text-emerald-400 whitespace-nowrap">₹{t.ratePerBrass.toLocaleString()}</td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-6 text-right font-mono font-black text-amber-400 text-[11px] sm:text-sm whitespace-nowrap">
                      ₹{t.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          title="Edit Record"
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          title="Delete Record"
                          className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
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
                      placeholder="SINDAGI - ALMEL ROAD"
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
                  placeholder="TOTAL TRIPS or vehicle registration..."
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none uppercase"
                />
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
                  ₹{computedTotalAmount.toLocaleString()}
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
