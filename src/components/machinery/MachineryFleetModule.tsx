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
  CheckCircle2
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
  currentReading: number;
}

const DEFAULT_FLEET: FleetVehicle[] = [
  {
    id: 'v-1',
    vehicleNumber: 'KA-28-EX-8901',
    vehicleType: 'Hydraulic Excavator (CAT/Hitachi)',
    category: 'Earthmoving',
    metricType: 'HMR',
    currentReading: 4215.5
  },
  {
    id: 'v-2',
    vehicleNumber: 'KA-28-JC-3342',
    vehicleType: 'Backhoe Loader (JCB 3DX)',
    category: 'Earthmoving',
    metricType: 'HMR',
    currentReading: 2850.0
  },
  {
    id: 'v-3',
    vehicleNumber: 'MH-12-DT-5510',
    vehicleType: 'Tipper / Dump Truck',
    category: 'Haulage',
    metricType: 'KM',
    currentReading: 14200
  },
  {
    id: 'v-4',
    vehicleNumber: 'KA-28-TR-1092',
    vehicleType: 'Tractor & Trolley',
    category: 'Transport',
    metricType: 'HMR',
    currentReading: 1120.0
  },
  {
    id: 'v-5',
    vehicleNumber: 'KA-28-JP-7890',
    vehicleType: 'Site Jeep / Bolero / Pickup',
    category: 'Site Inspection',
    metricType: 'KM',
    currentReading: 38450
  },
  {
    id: 'v-6',
    vehicleNumber: 'KA-28-CR-2200',
    vehicleType: 'Car / SUV',
    category: 'Staff Transport',
    metricType: 'KM',
    currentReading: 24100
  }
];

const STORAGE_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';

export const MachineryFleetModule: React.FC = () => {
  const { currentUser, userRole } = useERP();

  // Strict Admin Check: Only Admin can add or delete vehicles
  const currentRoleStr = String(currentUser?.role || userRole || '').toLowerCase();
  const isAdmin = currentRoleStr.includes('admin');

  // Persistent state: load from localStorage if present
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

  // Form State
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [selectedType, setSelectedType] = useState(VEHICLE_PRESETS[0].id);
  const [metricType, setMetricType] = useState<'KM' | 'HMR'>('KM');
  const [currentReading, setCurrentReading] = useState<number | ''>('');

  // Auto-sync every change to localStorage
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
    if (!vehicleNumber || currentReading === '') return;

    const matched = VEHICLE_PRESETS.find(p => p.id === selectedType);
    const newVehicle: FleetVehicle = {
      id: `v-${Date.now()}`,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: matched ? matched.name : selectedType,
      category: matched ? matched.category : 'General',
      metricType,
      currentReading: Number(currentReading)
    };

    const updated = [newVehicle, ...fleet];
    setFleet(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setIsModalOpen(false);
    setVehicleNumber('');
    setCurrentReading('');
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
      v.category.toLowerCase().includes(q)
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

        {/* Add button visible to Admin only */}
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
          placeholder="Search by vehicle number (e.g. KA-28), type (Tipper, Car, Jeep, Tractor, Roller)..."
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
              {/* Top Details */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-black text-xs border border-amber-500/30">
                    {vehicle.vehicleNumber}
                  </span>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {vehicle.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {vehicle.vehicleType}
                </h3>
              </div>

              {/* Running Meter / Hours Data */}
              <div className="p-3.5 bg-[#070c18] border border-[#182643] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  {vehicle.metricType === 'KM' ? (
                    <Gauge className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>{vehicle.metricType === 'KM' ? 'Odometer Running:' : 'Running Hours (HMR):'}</span>
                </div>

                <span className="font-mono font-black text-sm text-white">
                  {vehicle.currentReading.toLocaleString()}{' '}
                  <span className="text-xs text-amber-400">
                    {vehicle.metricType === 'KM' ? 'KM' : 'Hrs'}
                  </span>
                </span>
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
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Tracking Unit
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#162032] p-1 border border-[#1E293B] rounded-xl">
                    <button
                      type="button"
                      onClick={() => setMetricType('KM')}
                      className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                        metricType === 'KM'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      <span>KM</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetricType('HMR')}
                      className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                        metricType === 'HMR'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hours</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    {metricType === 'KM' ? 'Odometer (KM)' : 'Running Hours (HMR)'} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    placeholder={metricType === 'KM' ? 'e.g. 14200' : 'e.g. 2850.5'}
                    value={currentReading}
                    onChange={(e) => setCurrentReading(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-blue-500"
                  />
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
