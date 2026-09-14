import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { VehicleTrip, ApprovalStatus, WorkType } from '../../types/erp';
import {
  Truck,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  MapPin,
  TrendingUp,
  RotateCcw,
  Check,
  Calendar
} from 'lucide-react';

export const TripCounterModule: React.FC = () => {
  const {
    vehicleTrips,
    addVehicleTrip,
    updateVehicleTripStatus,
    currentProject,
    currentSite,
    workType
  } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterWorkType, setFilterWorkType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // New Trip Form State
  const [tripDate, setTripDate] = useState(new Date().toISOString().substring(0, 10));
  const [tripType, setTripType] = useState<WorkType>(workType || 'ROAD');
  const [vehicleNumber, setVehicleNumber] = useState('MH-12-QW-5821');
  const [vehicleType, setVehicleType] = useState<VehicleTrip['vehicleType']>('Tipper 10-Tyre');
  const [driverName, setDriverName] = useState('Santosh Kamble');
  const [ownership, setOwnership] = useState<VehicleTrip['ownership']>('Company Owned');
  const [vendorOrOwner, setVendorOrOwner] = useState('');
  const [materialName, setMaterialName] = useState('Wet Mix Macadam (WMM)');
  const [sourceLocation, setSourceLocation] = useState('Central Crushing Plant');
  const [destinationLocation, setDestinationLocation] = useState('Km 124+800 Main Carriageway');
  const [chainageOrFloor, setChainageOrFloor] = useState('Km 124+800');
  const [activity, setActivity] = useState('WMM Layer Spreading');
  const [vehicleCapacity, setVehicleCapacity] = useState<number>(20.0);
  const [actualLoadedQty, setActualLoadedQty] = useState<number>(19.8);
  const [unit, setUnit] = useState<'Tonnes' | 'm³' | 'Trips'>('Tonnes');
  const [ratePerUnit, setRatePerUnit] = useState<number>(120);
  const [challanNumber, setChallanNumber] = useState('CH-2026-9041');
  const [loadingTime, setLoadingTime] = useState('08:30 AM');
  const [arrivalTime, setArrivalTime] = useState('09:15 AM');
  const [unloadingTime, setUnloadingTime] = useState('09:35 AM');

  // RMC Specific
  const [concreteGrade, setConcreteGrade] = useState('M30');
  const [slumpMm, setSlumpMm] = useState<number>(135);
  const [returnedQty, setReturnedQty] = useState<number>(0);

  // Payload Validation Warning
  const isOverloaded = actualLoadedQty > vehicleCapacity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverloaded && !confirm(`Warning: Actual load (${actualLoadedQty} ${unit}) exceeds registered capacity (${vehicleCapacity} ${unit}). Authorize this trip dispatch?`)) {
      return;
    }

    const totalAmount = unit === 'Trips' ? ratePerUnit : actualLoadedQty * ratePerUnit;

    addVehicleTrip({
      date: tripDate,
      workType: tripType,
      projectId: currentProject?.id || 'proj-road-1',
      siteId: currentSite?.id || 'site-road-1',
      tripNumber: 'TRP-' + (tripType === 'ROAD' ? 'RD-' : 'RMC-') + Date.now().toString().slice(-4),
      vehicleNumber,
      vehicleType,
      driverName,
      ownership,
      vendorOrOwner: ownership === 'Rental / Subcontractor' ? vendorOrOwner : undefined,
      materialName,
      sourceLocation,
      destinationLocation,
      chainageOrFloor,
      activity,
      vehicleCapacityTonnesOrM3: Number(vehicleCapacity),
      actualLoadedQty: Number(actualLoadedQty),
      unit,
      ratePerUnitOrTrip: Number(ratePerUnit),
      totalAmount,
      challanNumber,
      loadingTime,
      arrivalTime,
      unloadingTime,
      concreteGrade: tripType === 'BUILDING' ? concreteGrade : undefined,
      slumpMm: tripType === 'BUILDING' ? Number(slumpMm) : undefined,
      returnedQty: tripType === 'BUILDING' ? Number(returnedQty) : undefined,
      approvalStatus: 'APPROVED' as ApprovalStatus
    });

    setIsModalOpen(false);
  };

  const filteredTrips = vehicleTrips.filter((t) => {
    const matchesSearch =
      t.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.challanNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterWorkType === 'ALL' || t.workType === filterWorkType;
    return matchesSearch && matchesFilter;
  });

  const totalTripsCount = filteredTrips.length;
  const totalTransportedQty = filteredTrips.reduce((sum, t) => sum + t.actualLoadedQty, 0);
  const totalTripCost = filteredTrips.reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              LOGISTICS & HAULAGE COUNTER
            </span>
            <span className="text-xs text-slate-400">Road Tipper Trips & Building RMC Delivery</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Tipper & Transit Mixer Trip Counter
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Record every haulage run with vehicle payload validation, loading/unloading timestamps, challan references, and live cost calculation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Log New Trip
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Logged Trips</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            {totalTripsCount} <span className="text-xs font-normal text-slate-400">Trips</span>
          </div>
          <span className="text-xs text-slate-400">
            Road Tippers: <strong className="text-amber-400">{filteredTrips.filter((t) => t.workType === 'ROAD').length}</strong> • RMC: <strong className="text-cyan-400">{filteredTrips.filter((t) => t.workType === 'BUILDING').length}</strong>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Material Hauled</span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono my-1">
            {totalTransportedQty.toFixed(1)} <span className="text-xs font-normal text-slate-400">Tonnes / m³</span>
          </div>
          <span className="text-xs text-slate-400">
            Avg Payload: {(totalTransportedQty / (totalTripsCount || 1)).toFixed(1)} per trip
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Transport & Delivery Cost</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono my-1">
            ₹{totalTripCost.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">
            Directly allocated to Project & Activity
          </span>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterWorkType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterWorkType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Trips ({vehicleTrips.length})
            </button>
            <button
              onClick={() => setFilterWorkType('ROAD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterWorkType === 'ROAD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              🛣️ Road Tippers ({vehicleTrips.filter((t) => t.workType === 'ROAD').length})
            </button>
            <button
              onClick={() => setFilterWorkType('BUILDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterWorkType === 'BUILDING' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 RMC Concrete ({vehicleTrips.filter((t) => t.workType === 'BUILDING').length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search trip#, vehicle#, driver, challan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* TRIPS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Trip ID & Date</th>
                <th className="py-3 px-3">Vehicle & Driver</th>
                <th className="py-3 px-3">Material & Challan</th>
                <th className="py-3 px-3">Destination / Location</th>
                <th className="py-3 px-3">Payload (Loaded / Cap)</th>
                <th className="py-3 px-3">Rate & Amount</th>
                <th className="py-3 px-3">Timestamps</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredTrips.map((trip) => {
                const isOver = trip.actualLoadedQty > trip.vehicleCapacityTonnesOrM3;
                return (
                  <tr key={trip.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-white block">{trip.tripNumber}</span>
                      <span className="text-[10px] text-slate-400">{trip.date} • {trip.workType}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-amber-300 block">{trip.vehicleNumber}</span>
                      <span className="text-[10px] text-slate-400">
                        {trip.driverName} ({trip.ownership === 'Company Owned' ? 'Own' : 'Rental'})
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-white block">{trip.materialName}</span>
                      <span className="text-[10px] font-mono text-cyan-400">Challan: {trip.challanNumber}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-200 block line-clamp-1">{trip.destinationLocation}</span>
                      <span className="text-[10px] text-slate-400">{trip.activity}</span>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-sm ${isOver ? 'text-rose-400' : 'text-slate-100'}`}>
                          {trip.actualLoadedQty} {trip.unit}
                        </span>
                        <span className="text-[10px] text-slate-500">/ {trip.vehicleCapacityTonnesOrM3}T</span>
                      </div>
                      {isOver && (
                        <span className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Overload
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span className="font-bold text-emerald-400 block">₹{trip.totalAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400">@ ₹{trip.ratePerUnitOrTrip}/{trip.unit}</span>
                    </td>

                    <td className="py-3.5 px-3 text-[10px] text-slate-400 font-mono">
                      <div>Load: {trip.loadingTime || '08:00 AM'}</div>
                      <div>Unload: {trip.unloadingTime || '09:00 AM'}</div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {trip.approvalStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TRIP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-400" />
                Log Tipper / RMC Transit Mixer Trip
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Workstream Type</label>
                  <select
                    value={tripType}
                    onChange={(e) => {
                      const t = e.target.value as WorkType;
                      setTripType(t);
                      if (t === 'BUILDING') {
                        setVehicleType('Transit Mixer RMC');
                        setMaterialName('RMC M30 Grade Concrete');
                        setUnit('m³');
                        setRatePerUnit(4950);
                        setVehicleCapacity(7.0);
                        setActualLoadedQty(7.0);
                      } else {
                        setVehicleType('Tipper 10-Tyre');
                        setMaterialName('Wet Mix Macadam (WMM)');
                        setUnit('Tonnes');
                        setRatePerUnit(120);
                        setVehicleCapacity(20.0);
                        setActualLoadedQty(19.8);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  >
                    <option value="ROAD">🛣️ Road Construction (Tipper / Dumper)</option>
                    <option value="BUILDING">🏢 Building Construction (RMC Mixer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Registration # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-12-QW-5821"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as VehicleTrip['vehicleType'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Tipper 10-Tyre">Tipper 10-Tyre (20T)</option>
                    <option value="Tipper 6-Tyre">Tipper 6-Tyre (12T)</option>
                    <option value="Hyva 12-Tyre">Hyva 12-Tyre (25T)</option>
                    <option value="Tractor Trailer">Tractor Trailer (8T)</option>
                    <option value="Transit Mixer RMC">Transit Mixer RMC (6-8 m³)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Material Name *</label>
                  <input
                    type="text"
                    required
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Challan / Delivery Pass # *</label>
                  <input
                    type="text"
                    required
                    value={challanNumber}
                    onChange={(e) => setChallanNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {/* Payload & Rate */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Payload & Capacity Verification
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Vehicle Capacity</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vehicleCapacity}
                      onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Actual Loaded Quantity *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={actualLoadedQty}
                      onChange={(e) => setActualLoadedQty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Rate (₹ / {unit})</label>
                    <input
                      type="number"
                      value={ratePerUnit}
                      onChange={(e) => setRatePerUnit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                {isOverloaded && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>Warning: Actual load exceeds vehicle capacity. System requires supervisor authorization.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Source Stockyard / Plant</label>
                  <input
                    type="text"
                    value={sourceLocation}
                    onChange={(e) => setSourceLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destination (Chainage / Floor Grid)</label>
                  <input
                    type="text"
                    value={destinationLocation}
                    onChange={(e) => setDestinationLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Record Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
