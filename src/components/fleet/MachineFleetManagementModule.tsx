import React, { useState, useMemo } from 'react';
import { useRoadERP } from '../../context/RoadERPContext';
import { Machine, MachineCategory, MachineOperationalStatus } from '../../types/roadERP';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Wrench,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Fuel,
  UserCheck,
  Phone,
  Settings,
  DollarSign,
  ShieldCheck,
  Zap,
  Layers,
  Edit2
} from 'lucide-react';

const CATEGORY_TABS: { id: MachineCategory | 'ALL'; label: string; icon: any }[] = [
  { id: 'ALL', label: 'All Fleet Units', icon: Layers },
  { id: 'EARTHMOVING', label: 'Earthmoving & Excavation', icon: Activity },
  { id: 'COMPACTION_PAVING', label: 'Compaction & Paving', icon: Zap },
  { id: 'HAULAGE_TRANSPORT', label: 'Haulage & Transport (Tippers/Tankers)', icon: Truck },
  { id: 'UTILITY_ANCILLARY', label: 'Utility & Ancillary (DG/Light)', icon: Settings }
];

export const MachineFleetManagementModule: React.FC = () => {
  const { machines, addMachine, updateMachineStatus, updateMachineHMR } = useRoadERP();

  const [selectedCategory, setSelectedCategory] = useState<MachineCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add Machine Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState<MachineCategory>('HAULAGE_TRANSPORT');
  const [formSubCategory, setFormSubCategory] = useState('Dump Truck / Tipper');
  const [formPlate, setFormPlate] = useState('');
  const [formMakeModel, setFormMakeModel] = useState('');
  const [formOwnership, setFormOwnership] = useState<'OWNED' | 'RENTED_LEASED'>('OWNED');
  const [formHourlyRate, setFormHourlyRate] = useState<number | ''>('');
  const [formOperator, setFormOperator] = useState('');
  const [formOperatorPhone, setFormOperatorPhone] = useState('');
  const [formHMR, setFormHMR] = useState<number | ''>(0);
  const [formKMR, setFormKMR] = useState<number | ''>(0);
  const [formAvgBenchmark, setFormAvgBenchmark] = useState<number | ''>(2.8);
  const [formBenchmarkUnit, setFormBenchmarkUnit] = useState<'L/hr' | 'km/L'>('km/L');

  // Quick Meter Update Modal
  const [meterModalMachine, setMeterModalMachine] = useState<Machine | null>(null);
  const [meterInputHMR, setMeterInputHMR] = useState<number>(0);
  const [meterInputKMR, setMeterInputKMR] = useState<number>(0);

  // Filtered Machines
  const filteredFleet = useMemo(() => {
    return machines.filter((m) => {
      const matchCat = selectedCategory === 'ALL' || m.category === selectedCategory;
      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.plateNumber.toLowerCase().includes(q) ||
        m.assignedOperator.toLowerCase().includes(q) ||
        m.subCategory.toLowerCase().includes(q);
      return matchCat && matchStatus && matchSearch;
    });
  }, [machines, selectedCategory, statusFilter, searchTerm]);

  // Handle Add Machine Submit
  const handleCreateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPlate) return;

    addMachine({
      code: formCode.trim() || `M-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      category: formCategory,
      subCategory: formSubCategory as any,
      makeModel: formMakeModel.trim() || 'Heavy Commercial Spec',
      plateNumber: formPlate.trim().toUpperCase(),
      ownership: formOwnership,
      hourlyRentalRate: formHourlyRate ? Number(formHourlyRate) : undefined,
      assignedOperator: formOperator.trim() || 'Unassigned Operator',
      operatorPhone: formOperatorPhone.trim() || '+91 90000 00000',
      status: 'ACTIVE',
      currentHMR: Number(formHMR) || 0,
      currentKMR: Number(formKMR) || 0,
      fuelTankCapacityLitres: 300,
      currentFuelLevelLitres: 200,
      averageConsumptionBenchmark: Number(formAvgBenchmark) || 15.0,
      benchmarkUnit: formBenchmarkUnit,
      lastServiceHMR: Number(formHMR) || 0,
      nextServiceDueHMR: (Number(formHMR) || 0) + 500
    });

    setIsAddModalOpen(false);
    // Reset
    setFormName('');
    setFormPlate('');
    setFormCode('');
    setFormMakeModel('');
    setFormOperator('');
    setFormOperatorPhone('');
  };

  const openMeterModal = (m: Machine) => {
    setMeterModalMachine(m);
    setMeterInputHMR(m.currentHMR);
    setMeterInputKMR(m.currentKMR);
  };

  const handleSaveMeter = () => {
    if (meterModalMachine) {
      updateMachineHMR(meterModalMachine.id, meterInputHMR, meterInputKMR);
      setMeterModalMachine(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#1b2845] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  MODULE A • HEAVY ASSET REGISTRY
                </span>
                <span className="text-xs text-slate-400">
                  Total Fleet: {machines.length} Units
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Machine & Heavy Fleet Equipment Management
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Machine / Tipper</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 mt-6 pt-5 border-t border-[#182643] overflow-x-auto pb-1">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'ALL'
                ? machines.length
                : machines.filter((m) => m.category === tab.id).length;
            const isSelected = selectedCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-[#070c18] hover:bg-[#131f38] text-slate-300 border border-[#1b2845]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-slate-950/30 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#1b2845] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#070c18] border border-[#1e2d4a] px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Operational Statuses</option>
              <option value="ACTIVE">ACTIVE (Running on Site)</option>
              <option value="IDLE">IDLE (Parked at Camp)</option>
              <option value="MAINTENANCE">MAINTENANCE (Periodic Service)</option>
              <option value="BREAKDOWN">BREAKDOWN (Emergency Repair)</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search code, plate, operator, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#070c18] border border-[#1e2d4a] rounded-xl text-xs text-white outline-none w-full sm:w-72 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFleet.map((machine) => {
          const isActive = machine.status === 'ACTIVE';
          const isBreakdown = machine.status === 'BREAKDOWN';
          const isMaintenance = machine.status === 'MAINTENANCE';

          return (
            <div
              key={machine.id}
              className={`p-5 rounded-3xl bg-[#0c1427] border transition-all duration-200 flex flex-col justify-between space-y-4 hover:border-amber-500/50 shadow-xl ${
                isBreakdown
                  ? 'border-rose-800/60 bg-gradient-to-b from-[#180a0e] to-[#0c1427]'
                  : isMaintenance
                  ? 'border-amber-700/60'
                  : 'border-[#1b2845]'
              }`}
            >
              {/* Header: Code, Category, Status Selector */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-black text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {machine.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {machine.plateNumber}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={machine.status}
                    onChange={(e) =>
                      updateMachineStatus(
                        machine.id,
                        e.target.value as MachineOperationalStatus
                      )
                    }
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg outline-none cursor-pointer uppercase ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isBreakdown
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="IDLE">IDLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="BREAKDOWN">BREAKDOWN</option>
                  </select>
                </div>

                <h3 className="text-sm font-bold text-white mt-2 leading-tight">
                  {machine.name}
                </h3>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {machine.makeModel} •{' '}
                  <span className="text-amber-400/90 font-medium">
                    {machine.ownership === 'OWNED' ? 'Company Owned' : `Rented (₹${machine.hourlyRentalRate}/hr)`}
                  </span>
                </div>
              </div>

              {/* Meter Readings and Pavement Assignment */}
              <div className="p-3 bg-[#070c18] rounded-2xl border border-[#182643] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hour-meter (HMR):</span>
                  </span>
                  <span className="font-mono font-bold text-white text-xs">
                    {machine.currentHMR.toLocaleString()} hrs
                  </span>
                </div>

                {machine.currentKMR > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Odometer (KMR):</span>
                    </span>
                    <span className="font-mono font-bold text-white text-xs">
                      {machine.currentKMR.toLocaleString()} km
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-[#142038]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    <span>Avg Benchmark:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-xs">
                    {machine.averageConsumptionBenchmark} {machine.benchmarkUnit}
                  </span>
                </div>

                {machine.pavementSectionAssigned && (
                  <div className="text-[10px] text-slate-400 bg-[#0c1427] p-1.5 rounded-lg border border-[#1b2845] truncate">
                    📍 {machine.pavementSectionAssigned}
                  </div>
                )}
              </div>

              {/* Operator Details & Quick Action */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#182643]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-[11px] leading-none">
                      {machine.assignedOperator}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {machine.operatorPhone}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openMeterModal(machine)}
                  className="px-2.5 py-1 rounded-lg bg-[#142038] hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Update Meter</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK METER UPDATE MODAL */}
      {meterModalMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Update Meter Reading • {meterModalMachine.code}</span>
              </h3>
              <button
                onClick={() => setMeterModalMachine(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Hour-meter Reading (HMR Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={meterInputHMR}
                  onChange={(e) => setMeterInputHMR(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-cyan-400 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Odometer Reading (KMR Kilometers)
                </label>
                <input
                  type="number"
                  step="1"
                  value={meterInputKMR}
                  onChange={(e) => setMeterInputKMR(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-amber-400 font-mono font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#182643]">
              <button
                type="button"
                onClick={() => setMeterModalMachine(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeter}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
              >
                Save Readings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER NEW MACHINE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <span>Register Machine or Fleet Vehicle</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMachine} className="space-y-3 text-xs">
              {/* Category & SubCategory */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fleet Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MachineCategory)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  >
                    <option value="EARTHMOVING">Earthmoving & Excavation</option>
                    <option value="COMPACTION_PAVING">Compaction & Paving</option>
                    <option value="HAULAGE_TRANSPORT">Haulage & Transport</option>
                    <option value="UTILITY_ANCILLARY">Utility & Ancillary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Machine Sub-Type *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dump Truck / Tipper"
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              {/* Code & Plate No */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Machine ID / Fleet Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TIP-8797 or EX-03"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-amber-400 font-mono font-bold outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Registration Plate No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-28-C-8797"
                    value={formPlate}
                    onChange={(e) => setFormPlate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono uppercase outline-none"
                  />
                </div>
              </div>

              {/* Name & Make */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Machine Asset Name & Make Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BharatBenz 2828C 16m³ Heavy Tipper"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                />
              </div>

              {/* Ownership & Hourly Rate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ownership Type
                  </label>
                  <select
                    value={formOwnership}
                    onChange={(e) =>
                      setFormOwnership(e.target.value as 'OWNED' | 'RENTED_LEASED')
                    }
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  >
                    <option value="OWNED">Company Owned Asset</option>
                    <option value="RENTED_LEASED">Rented / Leased Vendor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hourly Rate (if rented ₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2400"
                    value={formHourlyRate}
                    onChange={(e) =>
                      setFormHourlyRate(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Operator Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Assigned Operator Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Santosh Chavan"
                    value={formOperator}
                    onChange={(e) => setFormOperator(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Operator Mobile No
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98450 00000"
                    value={formOperatorPhone}
                    onChange={(e) => setFormOperatorPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Fuel Benchmark */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Consumption Benchmark *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 18.5"
                    value={formAvgBenchmark}
                    onChange={(e) =>
                      setFormAvgBenchmark(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-amber-400 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Benchmark Unit
                  </label>
                  <select
                    value={formBenchmarkUnit}
                    onChange={(e) =>
                      setFormBenchmarkUnit(e.target.value as 'L/hr' | 'km/L')
                    }
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  >
                    <option value="L/hr">L/hr (Heavy Equipment)</option>
                    <option value="km/L">km/L (Tippers / Tankers)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#182643]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Register Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
