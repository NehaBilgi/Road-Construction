import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { BuildingFloor } from '../../types/erp';
import {
  Building2,
  Grid,
  Plus,
  Edit3,
  CheckCircle2,
  Clock,
  Layers,
  DollarSign,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const BuildingFloorsModule: React.FC = () => {
  const {
    buildingFloors,
    updateBuildingFloor,
    addBuildingFloor,
    currentProject
  } = useERP();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [floorLevel, setFloorLevel] = useState('');
  const [builtUpAreaSqFt, setBuiltUpAreaSqFt] = useState<number>(11000);
  const [plannedCost, setPlannedCost] = useState<number>(16000000);

  const [editingFloor, setEditingFloor] = useState<BuildingFloor | null>(null);
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<BuildingFloor['status']>('In Progress');
  const [editActualCost, setEditActualCost] = useState<number>(0);

  const activeProjectFloors = buildingFloors.filter(
    (f) => f.projectId === (currentProject?.id || 'proj-bldg-1')
  );

  const totalBuiltUp = activeProjectFloors.reduce((sum, f) => sum + f.builtUpAreaSqFt, 0);
  const totalPlanned = activeProjectFloors.reduce((sum, f) => sum + f.plannedCost, 0);
  const totalActual = activeProjectFloors.reduce((sum, f) => sum + f.actualCost, 0);
  const avgCostPerSqFt = totalBuiltUp > 0 ? totalActual / totalBuiltUp : 0;

  const handleOpenEdit = (floor: BuildingFloor) => {
    setEditingFloor(floor);
    setEditProgress(floor.progressPercent);
    setEditStatus(floor.status);
    setEditActualCost(floor.actualCost);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFloor) {
      updateBuildingFloor(editingFloor.id, {
        progressPercent: Number(editProgress),
        status: editStatus,
        actualCost: Number(editActualCost)
      });
      setEditingFloor(null);
    }
  };

  const handleCreateFloor = (e: React.FormEvent) => {
    e.preventDefault();
    addBuildingFloor({
      floorLevel,
      builtUpAreaSqFt: Number(builtUpAreaSqFt),
      plannedCost: Number(plannedCost),
      projectId: currentProject?.id || 'proj-bldg-1'
    });
    setFloorLevel('');
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: BuildingFloor['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Finishing':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'RCC Cast':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              BUILDING STRUCTURAL TRACKER
            </span>
            <span className="text-xs text-slate-400">Vertical Floor Level Matrix</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Building Floor Management & Cost / sq.ft
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track structural RCC pouring, masonry, MEP, and finishing floor-by-floor with granular cost allocation.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Floor Level
        </button>
      </div>

      {/* STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Built-Up Area</span>
          <span className="text-xl font-extrabold text-white font-mono">
            {totalBuiltUp.toLocaleString()} <span className="text-xs text-slate-400 font-normal">sq.ft</span>
          </span>
          <span className="text-[10px] text-slate-400 block">{activeProjectFloors.length} Floor Levels</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Floor Budget</span>
          <span className="text-xl font-extrabold text-cyan-400 font-mono">
            ₹{(totalPlanned / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-400 block">Planned structural cost</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Actual Cost Expended</span>
          <span className="text-xl font-extrabold text-amber-400 font-mono">
            ₹{(totalActual / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-400 block">Material + Labour + RMC</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Cost / sq.ft</span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">
            ₹{avgCostPerSqFt.toFixed(0)} <span className="text-xs text-slate-400 font-normal">/ sq.ft</span>
          </span>
          <span className="text-[10px] text-emerald-400/80 block">Within baseline ₹1,550</span>
        </div>
      </div>

      {/* VERTICAL HIGH-RISE TOWER ELEVATION MATRIX */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-cyan-400" />
            Vertical Floor Level Progression (Top to Bottom)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {activeProjectFloors.filter((f) => f.status === 'Completed').length} / {activeProjectFloors.length} Floors Completed
          </span>
        </div>

        <div className="space-y-3">
          {[...activeProjectFloors].reverse().map((floor) => (
            <div
              key={floor.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left Floor Info */}
              <div className="flex items-center gap-4 min-w-[240px]">
                <div className="h-11 w-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-sm text-cyan-300 font-mono">
                  {floor.levelIndex < 0 ? `B${Math.abs(floor.levelIndex)}` : floor.levelIndex === 0 ? 'GF' : `L${floor.levelIndex}`}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    {floor.floorLevel}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(floor.status)}`}>
                      {floor.status}
                    </span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Area: <strong className="text-slate-200">{floor.builtUpAreaSqFt.toLocaleString()} sq.ft</strong> • {floor.rccElementsCount} RCC Members
                  </span>
                </div>
              </div>

              {/* Center Progress Bar */}
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 text-[11px]">Floor Progress</span>
                  <span className="font-bold text-slate-200 font-mono">{floor.progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${floor.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Financials & Action */}
              <div className="flex items-center gap-6 justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Expended Cost</span>
                  <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">
                    ₹{(floor.actualCost / 100000).toFixed(2)} Lakhs
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    (Budget: ₹{(floor.plannedCost / 100000).toFixed(0)}L)
                  </span>
                </div>

                <button
                  onClick={() => handleOpenEdit(floor)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Update</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingFloor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Update Floor: {editingFloor.floorLevel}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as BuildingFloor['status'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress (Shuttering / Rebar)</option>
                  <option value="RCC Cast">RCC Cast</option>
                  <option value="Finishing">Finishing (Masonry / MEP / Flooring)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Actual Cumulative Cost (₹)</label>
                <input
                  type="number"
                  value={editActualCost}
                  onChange={(e) => setEditActualCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-amber-400 focus:outline-none font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFloor(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Floor Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FLOOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add New Floor Level</h3>

            <form onSubmit={handleCreateFloor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Floor Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8th Floor (Duplex Penthouse)"
                  value={floorLevel}
                  onChange={(e) => setFloorLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Built-Up Area (sq.ft)</label>
                <input
                  type="number"
                  value={builtUpAreaSqFt}
                  onChange={(e) => setBuiltUpAreaSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Planned Budget (₹)</label>
                <input
                  type="number"
                  value={plannedCost}
                  onChange={(e) => setPlannedCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Create Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
