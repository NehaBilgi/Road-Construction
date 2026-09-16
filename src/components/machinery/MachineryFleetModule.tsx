import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  HardHat,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Gauge,
  Building,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  category: string;
  metricType: 'KM' | 'HMR';
  ownershipType: 'company' | 'rented';
  rentalRateType?: 'per_day' | 'per_trip';
  rentalAmount?: number;
  status?: 'Active' | 'Under Maintenance';
}

const STORAGE_FLEET_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';

const DEFAULT_FLEET: FleetVehicle[] = [
  { id: 'v-1', vehicleNumber: '8797', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'company', status: 'Active' },
  { id: 'v-2', vehicleNumber: '9579', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'company', status: 'Active' },
  { id: 'v-3', vehicleNumber: '7243', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'rented', rentalRateType: 'per_day', rentalAmount: 8500, status: 'Active' },
  { id: 'v-4', vehicleNumber: '9260', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'rented', rentalRateType: 'per_day', rentalAmount: 8500, status: 'Active' },
  { id: 'v-5', vehicleNumber: '5321', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'rented', rentalRateType: 'per_day', rentalAmount: 8500, status: 'Active' },
  { id: 'v-6', vehicleNumber: '3146', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'rented', rentalRateType: 'per_day', rentalAmount: 8500, status: 'Active' },
  { id: 'v-7', vehicleNumber: 'KA-28-EX-8901', vehicleType: 'Hydraulic Excavator (JCB / POCLAIN)', category: 'Earthmoving', metricType: 'HMR', ownershipType: 'company', status: 'Active' }
];

export const MachineryFleetModule: React.FC = () => {
  const { currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toUpperCase().includes('ADMIN');

  const [vehicles, setVehicles] = useState<FleetVehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FLEET_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_FLEET;
    } catch {
      return DEFAULT_FLEET;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal Form States
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Tipper / Dump Truck');
  const [category, setCategory] = useState('Haulage');
  const [metricType, setMetricType] = useState<'KM' | 'HMR'>('KM');
  const [ownershipType, setOwnershipType] = useState<'company' | 'rented'>('company');
  const [rentalRateType, setRentalRateType] = useState<'per_day' | 'per_trip'>('per_day');
  const [rentalAmount, setRentalAmount] = useState<number | ''>(8500);

  // Sync to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FLEET_KEY, JSON.stringify(vehicles));
    } catch (err) {
      console.error('Failed saving fleet:', err);
    }
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.vehicleNumber.toLowerCase().includes(q) ||
        v.vehicleType.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.ownershipType.toLowerCase().includes(q)
    );
  }, [vehicles, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setVehicleNumber('');
    setVehicleType('Tipper / Dump Truck');
    setCategory('Haulage');
    setMetricType('KM');
    setOwnershipType('company');
    setRentalRateType('per_day');
    setRentalAmount(8500);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: FleetVehicle) => {
    setEditingId(v.id);
    setVehicleNumber(v.vehicleNumber);
    setVehicleType(v.vehicleType);
    setCategory(v.category);
    setMetricType(v.metricType);
    setOwnershipType(v.ownershipType);
    setRentalRateType(v.rentalRateType || 'per_day');
    setRentalAmount(v.rentalAmount || 8500);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, num: string) => {
    if (window.confirm(`Are you sure you want to remove vehicle "${num}"?`)) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) return;

    const payload: FleetVehicle = {
      id: editingId || `v-${Date.now().toString().slice(-4)}`,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType,
      category,
      metricType,
      ownershipType,
      rentalRateType: ownershipType === 'rented' ? rentalRateType : undefined,
      rentalAmount: ownershipType === 'rented' ? (Number(rentalAmount) || 0) : undefined,
      status: 'Active'
    };

    if (editingId) {
      setVehicles((prev) => prev.map((v) => (v.id === editingId ? payload : v)));
    } else {
      setVehicles((prev) => [payload, ...prev]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-950 text-blue-400 border border-blue-800">
              MACHINERY & HEAVY FLEET
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {vehicles.length} Total Vehicles & Equipment
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Road Construction Machinery & Vehicle Fleet
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Construction Vehicle</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by vehicle number, type, ownership (Company / Rented)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#0B1322] border border-[#1E293B] rounded-2xl text-white outline-none focus:border-blue-500 placeholder-slate-500 text-xs font-medium"
        />
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((v) => {
          const isCompany = v.ownershipType === 'company';

          return (
            <div
              key={v.id}
              className="p-5 rounded-3xl bg-[#0B1322] border border-[#1E293B] hover:border-slate-700 transition-all shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Card Top Badges */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400 font-mono font-black text-xs">
                    {v.vehicleNumber}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                        isCompany
                          ? 'bg-blue-950/70 text-blue-400 border-blue-500/30'
                          : 'bg-purple-950/70 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {isCompany ? <Building className="w-3 h-3" /> : <KeyRound className="w-3 h-3" />}
                      <span>{isCompany ? 'Company' : 'Rented'}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-lg bg-[#162032] border border-[#1E293B] text-slate-400 text-[10px] font-bold">
                      {v.category}
                    </span>
                  </div>
                </div>

                {/* Vehicle Type Title */}
                <div>
                  <h3 className="text-sm font-black text-white leading-snug">
                    {v.vehicleType}
                  </h3>
                </div>

                {/* Metric Badge */}
                <div className="p-2.5 rounded-xl bg-[#070D18] border border-[#1E293B] flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" /> Tracking Metric:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {v.metricType === 'KM' ? 'Distance (KM)' : 'Hours (HMR)'}
                  </span>
                </div>

                {/* Rental Tariff Info (if rented) */}
                {!isCompany && v.rentalAmount && (
                  <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-xs">
                    <span className="text-purple-300 font-medium">Rental Tariff:</span>
                    <span className="font-mono font-black text-purple-300">
                      ₹{v.rentalAmount.toLocaleString()}{' '}
                      <span className="text-[10px] font-normal">
                        / {v.rentalRateType === 'per_day' ? 'Day' : 'Trip'}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer: Status & Action Buttons (Edit & Delete) */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active on Site</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(v)}
                    className="px-2.5 py-1 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/30 hover:border-blue-400 text-blue-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Edit Vehicle"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(v.id, v.vehicleNumber)}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 hover:border-rose-400 text-rose-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B1322] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <HardHat className="w-5 h-5 text-blue-400" />
                <span>{editingId ? 'Edit Vehicle / Equipment' : 'Add Construction Vehicle'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Vehicle / Reg Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8797 or KA-28-EX-8901"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white uppercase font-mono font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Vehicle / Equipment Type *
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  <option value="Tipper / Dump Truck">Tipper / Dump Truck</option>
                  <option value="Hydraulic Excavator (JCB / POCLAIN)">Hydraulic Excavator (JCB / POCLAIN)</option>
                  <option value="Motor Grader">Motor Grader</option>
                  <option value="Vibratory Soil Compactor / Roller">Vibratory Soil Compactor / Roller</option>
                  <option value="Water Tanker Bowser">Water Tanker Bowser</option>
                  <option value="Bitumen Paver Finisher">Bitumen Paver Finisher</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Haulage">Haulage</option>
                    <option value="Earthmoving">Earthmoving</option>
                    <option value="Grading">Grading</option>
                    <option value="Compaction">Compaction</option>
                    <option value="Paving">Paving</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Metric Type</label>
                  <select
                    value={metricType}
                    onChange={(e) => setMetricType(e.target.value as 'KM' | 'HMR')}
                    className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer font-mono"
                  >
                    <option value="KM">Distance (KM)</option>
                    <option value="HMR">Hour Meter (HMR)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Ownership Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOwnershipType('company')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      ownershipType === 'company'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                        : 'bg-[#070D18] text-slate-400 border-[#1E293B]'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" /> Company Owned
                  </button>

                  <button
                    type="button"
                    onClick={() => setOwnershipType('rented')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      ownershipType === 'rented'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                        : 'bg-[#070D18] text-slate-400 border-[#1E293B]'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Hired / Rented
                  </button>
                </div>
              </div>

              {ownershipType === 'rented' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
                  <div>
                    <label className="block text-purple-300 font-bold mb-1">Tariff Type</label>
                    <select
                      value={rentalRateType}
                      onChange={(e) => setRentalRateType(e.target.value as 'per_day' | 'per_trip')}
                      className="w-full px-3 py-2 bg-[#070D18] border border-purple-500/30 rounded-xl text-white outline-none cursor-pointer"
                    >
                      <option value="per_day">Per Day (₹/Day)</option>
                      <option value="per_trip">Per Trip (₹/Trip)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-purple-300 font-bold mb-1">Tariff Rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={rentalAmount}
                      onChange={(e) => setRentalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#070D18] border border-purple-500/30 rounded-xl text-purple-300 font-mono font-bold outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineryFleetModule;
