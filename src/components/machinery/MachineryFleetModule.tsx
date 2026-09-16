import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  Gauge, 
  X, 
  HardHat,
  CheckCircle2,
  Building2,
  HandCoins
} from 'lucide-react';

const VEHICLE_PRESETS = [
  { id: 'TIPPER', name: 'Tipper / Dump Truck', category: 'Haulage', defaultUnit: 'KM' },
  { id: 'TRACTOR', name: 'Tractor & Trolley', category: 'Transport', defaultUnit: 'HMR' },
  { id: 'JEEP', name: 'Site Jeep / Bolero / Pickup', category: 'Site Inspection', defaultUnit: 'KM' },
  { id: 'CAR', name: 'Car / SUV', category: 'Staff Transport', defaultUnit: 'KM' },
  { id: 'WATER_TANKER', name: 'Water Tanker / Sprinkler', category: 'Earthwork', defaultUnit: 'KM' },
  { id: 'EXCAVATOR', name: 'Hydraulic Excavator (CAT/Hitachi)', category: 'Earthmoving', defaultUnit: 'HMR' },
  { id: 'JCB', name: 'Backhoe Loader (JCB 3DX)', category: 'Earthmoving', defaultUnit: 'HMR' },
  { id: 'ROLLER', name: 'Vibratory Soil Compactor / Roller', category: 'Compaction', defaultUnit: 'HMR' },
  { id: 'GRADER', name: 'Motor Grader', category: 'Grading', defaultUnit: 'HMR' },
  { id: 'PAVER', name: 'Bitumen / Asphalt Paver', category: 'Paving', defaultUnit: 'HMR' },
  { id: 'TRANSIT_MIXER', name: 'Transit Mixer (RMC)', category: 'Concrete', defaultUnit: 'KM' }
];

export interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  category: string;
  metricType: 'KM' | 'HMR';
  ownershipType: 'company' | 'rented';
  rentalRateType?: 'per_day' | 'per_trip';
  rentalAmount?: number;
}

const DEFAULT_FLEET: FleetVehicle[] = [
  {
    id: 'v-1',
    vehicleNumber: 'KA-28-EX-8901',
    vehicleType: 'Hydraulic Excavator (CAT/Hitachi)',
    category: 'Earthmoving',
    metricType: 'HMR',
    ownershipType: 'company'
  },
  {
    id: 'v-2',
    vehicleNumber: 'KA-28-JC-3342',
    vehicleType: 'Backhoe Loader (JCB 3DX)',
    category: 'Earthmoving',
    metricType: 'HMR',
    ownershipType: 'rented',
    rentalRateType: 'per_day',
    rentalAmount: 4500
  },
  {
    id: 'v-3',
    vehicleNumber: 'MH-12-DT-5510',
    vehicleType: 'Tipper / Dump Truck',
    category: 'Haulage',
    metricType: 'KM',
    ownershipType: 'rented',
    rentalRateType: 'per_trip',
    rentalAmount: 850
  },
  {
    id: 'v-4',
    vehicleNumber: 'KA-28-TR-1092',
    vehicleType: 'Tractor & Trolley',
    category: 'Transport',
    metricType: 'HMR',
    ownershipType: 'company'
  },
  {
    id: 'v-5',
    vehicleNumber: 'KA-28-JP-7890',
    vehicleType: 'Site Jeep / Bolero / Pickup',
    category: 'Site Inspection',
    metricType: 'KM',
    ownershipType: 'company'
  },
  {
    id: 'v-6',
    vehicleNumber: 'KA-28-CR-2200',
    vehicleType: 'Car / SUV',
    category: 'Staff Transport',
    metricType: 'KM',
    ownershipType: 'company'
  }
];

const STORAGE_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';

export const MachineryFleetModule: React.FC = () => {
  const { currentUser, userRole } = useERP();

  const currentRoleStr = String(currentUser?.role || userRole || '').toLowerCase();
  const isAdmin = currentRoleStr.includes('admin');

  const [fleet, setFleet] = useState<FleetVehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : DEFAULT_FLEET;
    } catch {
      return DEFAULT_FLEET;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State (Odometer removed)
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedType, setSelectedType] = useState(VEHICLE_PRESETS[0].id);
  const [metricType, setMetricType] = useState<'KM' | 'HMR'>('KM');
  const [ownershipType, setOwnershipType] = useState<'company' | 'rented'>('company');
  const [rentalRateType, setRentalRateType] = useState<'per_day' | 'per_trip'>('per_day');
  const [rentalAmount, setRentalAmount] = useState<number | ''>('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
  }, [fleet]);

  const handleTypeChange = (typeId: string) => {
    const preset = VEHICLE_PRESETS.find(p => p.id === typeId);
    setSelectedType(typeId);
    if (preset) {
      setMetricType(preset.defaultUnit as 'KM' | 'HMR');
    }
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Action Restricted: Only Administrators are authorized to add fleet vehicles.');
      return;
    }
    if (!vehicleNumber.trim()) return;
    if (ownershipType === 'rented' && rentalAmount === '') return;

    const matched = VEHICLE_PRESETS.find(p => p.id === selectedType);
    const newVehicle: FleetVehicle = {
      id: `v-${Date.now()}`,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: matched ? matched.name : selectedType,
      category: matched ? matched.category : 'General',
      metricType,
      ownershipType,
      ...(ownershipType === 'rented' ? {
        rentalRateType,
        rentalAmount: Number(rentalAmount)
      } : {})
    };

    const updated = [newVehicle, ...fleet];
    setFleet(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Reset Form
    setIsModalOpen(false);
    setVehicleNumber('');
    setOwnershipType('company');
    setRentalRateType('per_day');
    setRentalAmount('');
  };

  const handleDeleteVehicle = (id: string, number: string, type: string) => {
    if (!isAdmin) {
      alert('Action Restricted: Only Administrators are authorized to delete fleet vehicles.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete ${type} [${number}]?`)) {
      const updated = fleet.filter(v => v.id !== id);
      setFleet(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const filteredFleet = fleet.filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      v.vehicleNumber.toLowerCase().includes(q) ||
      v.vehicleType.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      (v.ownershipType && v.ownershipType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 space-y-6 font-sans text-slate-100 min-h-screen bg-[#080C14]">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800 text-[10px] font-black uppercase">
                Machinery & Heavy Fleet
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {fleet.length} Total Vehicles & Equipment
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Road Construction Machinery & Vehicle Fleet
            </h1>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Construction Vehicle</span>
          </button>
        )}
      </div>

      {/* 2. Search Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by vehicle number, type, ownership (Company / Rented)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl text-xs text-white outline-none focus:border-blue-500 placeholder-slate-500"
        />
      </div>

      {/* 3. Vehicles Cards Grid */}
      {filteredFleet.length === 0 ? (
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-12 text-center text-slate-500 space-y-2">
          <Truck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <div className="text-sm font-bold text-slate-300">No matching vehicles or machinery in registry.</div>
          {isAdmin && <div className="text-xs">Click <strong>+ Add Construction Vehicle</strong> to register new units.</div>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFleet.map((vehicle) => (
            <div
              key={vehicle.id}
              className="p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-black text-xs border border-amber-500/30">
                    {vehicle.vehicleNumber}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {vehicle.ownershipType === 'rented' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                        <HandCoins className="w-3 h-3 text-purple-400" />
                        Rented
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-950/60 text-sky-300 border border-sky-800/60 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-sky-400" />
                        Company
                      </span>
                    )}

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {vehicle.category}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {vehicle.vehicleType}
                </h3>
              </div>

              {/* Tracking Unit & Rate Section */}
              <div className="space-y-2">
                <div className="p-3 bg-[#070c18] border border-[#182643] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    {vehicle.metricType === 'KM' ? (
                      <Gauge className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-cyan-400" />
                    )}
                    <span>Tracking Metric:</span>
                  </div>

                  <span className="font-mono font-bold text-xs text-slate-200">
                    {vehicle.metricType === 'KM' ? 'Distance (KM)' : 'Hours (HMR)'}
                  </span>
                </div>

                {vehicle.ownershipType === 'rented' && vehicle.rentalAmount !== undefined && (
                  <div className="px-3.5 py-2 bg-purple-950/20 border border-purple-900/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-purple-300 font-medium">Rental Tariff:</span>
                    <span className="font-mono font-bold text-purple-200">
                      ₹{vehicle.rentalAmount.toLocaleString()}{' '}
                      <span className="text-[10px] text-purple-400 font-sans">
                        / {vehicle.rentalRateType === 'per_day' ? 'Day' : 'Trip'}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-[#182643] flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active on Site
                </span>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteVehicle(vehicle.id, vehicle.vehicleNumber, vehicle.vehicleType)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/70 border border-rose-800/40 hover:border-rose-500 text-rose-400 text-xs font-bold transition-all cursor-pointer"
                    title="Delete Vehicle (Admin Only)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Add Vehicle Modal (Admin Only) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>Register Construction Vehicle</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Vehicle Number / Registration Plate <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-28-C-8797 or MH-12-GR-7890"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold tracking-wider outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Type of Construction Vehicle / Machinery <span className="text-amber-400">*</span>
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  {VEHICLE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ownership Type */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Vehicle Ownership <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#162032] p-1 border border-[#1E293B] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOwnershipType('company')}
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      ownershipType === 'company'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Company Owned</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOwnershipType('rented')}
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      ownershipType === 'rented'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <HandCoins className="w-3.5 h-3.5" />
                    <span>Rented / Hired</span>
                  </button>
                </div>
              </div>

              {/* Conditional Rented Pricing */}
              {ownershipType === 'rented' && (
                <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-900/40 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-purple-200 font-bold mb-1.5">
                        Billing Basis <span className="text-amber-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-[#162032] p-1 border border-purple-900/50 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setRentalRateType('per_day')}
                          className={`py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                            rentalRateType === 'per_day'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Per Day
                        </button>
                        <button
                          type="button"
                          onClick={() => setRentalRateType('per_trip')}
                          className={`py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                            rentalRateType === 'per_trip'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Per Trip
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-purple-200 font-bold mb-1.5">
                        Amount (₹) <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        placeholder={rentalRateType === 'per_day' ? 'e.g. 4500' : 'e.g. 850'}
                        value={rentalAmount}
                        onChange={(e) => setRentalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#162032] border border-purple-900/50 rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Unit Selection Only */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Tracking Unit <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-[#162032] p-1 border border-[#1E293B] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMetricType('KM')}
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      metricType === 'KM'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>KM (Kilometers)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetricType('HMR')}
                    className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      metricType === 'HMR'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Hours (HMR)</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
                >
                  Save Vehicle
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
