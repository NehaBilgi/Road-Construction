import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { RoadSection, RoadLayerProgress, RoadLayerType } from '../../types/erp';
import {
  Milestone,
  Layers,
  MapPin,
  Plus,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Edit2,
  Ruler,
  Compass,
  ArrowRight
} from 'lucide-react';

export const RoadChainageModule: React.FC = () => {
  const {
    roadSections,
    updateRoadLayerProgress,
    currentProject,
    currentSite
  } = useERP();

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    roadSections[0]?.id || ''
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLayer, setEditingLayer] = useState<RoadLayerProgress | null>(null);
  const [newCompletedMeters, setNewCompletedMeters] = useState<number>(0);
  const [newActualQty, setNewActualQty] = useState<number>(0);

  const activeSection = roadSections.find((s) => s.id === selectedSectionId) || roadSections[0];

  const handleOpenEdit = (layer: RoadLayerProgress) => {
    setEditingLayer(layer);
    setNewCompletedMeters(layer.completedLengthMeters);
    setNewActualQty(layer.actualQtyUsed);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSection && editingLayer) {
      updateRoadLayerProgress(
        activeSection.id,
        editingLayer.id,
        Number(newCompletedMeters),
        Number(newActualQty)
      );
      setIsEditModalOpen(false);
    }
  };

  // Color mapping for highway layers
  const getLayerColor = (layerType: RoadLayerType) => {
    switch (layerType) {
      case 'Earthwork / Embankment':
        return { bar: 'bg-amber-800', badge: 'bg-amber-900/40 text-amber-300 border-amber-800' };
      case 'Subgrade / Murum':
        return { bar: 'bg-yellow-700', badge: 'bg-yellow-900/40 text-yellow-300 border-yellow-800' };
      case 'Granular Sub-Base (GSB)':
        return { bar: 'bg-amber-600', badge: 'bg-amber-900/40 text-amber-200 border-amber-700' };
      case 'Wet Mix Macadam (WMM)':
        return { bar: 'bg-stone-500', badge: 'bg-stone-800 text-stone-200 border-stone-700' };
      case 'Bituminous Macadam (BM)':
      case 'Dense Bituminous Macadam (DBM)':
        return { bar: 'bg-slate-700', badge: 'bg-slate-800 text-slate-200 border-slate-700' };
      case 'Bituminous Concrete (BC)':
        return { bar: 'bg-slate-900', badge: 'bg-slate-950 text-slate-100 border-slate-700' };
      case 'Cement Concrete (CC Road)':
        return { bar: 'bg-blue-600', badge: 'bg-blue-950 text-blue-300 border-blue-800' };
      default:
        return { bar: 'bg-emerald-600', badge: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ROAD EXECUTION ENGINE
            </span>
            <span className="text-xs text-slate-400">Pavement Layer By Layer Tracking</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Chainage & Pavement Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track multi-layered highway progress: Earthwork → Murum → GSB → WMM → DBM → BC / CC Rigid Pavement
          </p>
        </div>

        {/* Section Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Active Stretch:</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
          >
            {roadSections.map((sec) => (
              <option key={sec.id} value={sec.id} className="bg-slate-900 text-slate-200">
                {sec.name} (Km {sec.startChainage} - Km {sec.endChainage})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeSection && (
        <>
          {/* SECTION SPECS BANNER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Stretch Length</span>
              <span className="text-xl font-extrabold text-white font-mono">
                {(activeSection.totalLengthMeters / 1000).toFixed(2)} Km
              </span>
              <span className="text-[10px] text-slate-400 block">
                Km {activeSection.startChainage.toFixed(3)} to Km {activeSection.endChainage.toFixed(3)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Carriageway Width</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">
                {activeSection.carriagewayWidthMeters} Metres
              </span>
              <span className="text-[10px] text-slate-400 block">
                +{activeSection.shoulderWidthMeters * 2}m Paved Shoulders
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Pavement Layers</span>
              <span className="text-xl font-extrabold text-cyan-400 font-mono">
                {activeSection.layers.length} Layers
              </span>
              <span className="text-[10px] text-slate-400 block">Subgrade to Wearing Course</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Top Layer (BC) Completion</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {activeSection.layers.find((l) => l.layerType.includes('BC'))?.progressPercent || 20}%
              </span>
              <span className="text-[10px] text-slate-400 block">Final riding surface</span>
            </div>
          </div>

          {/* INTERACTIVE CHAINAGE STRIP MAP */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="h-5 w-5 text-amber-400" />
                  Interactive Chainage Pavement Strip Map
                </h3>
                <p className="text-xs text-slate-400">
                  Visual cross-sectional layer completion along Km {activeSection.startChainage} to Km {activeSection.endChainage}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>Start: Km {activeSection.startChainage.toFixed(3)}</span>
                <span>End: Km {activeSection.endChainage.toFixed(3)}</span>
              </div>
            </div>

            {/* Strip Stack */}
            <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              {activeSection.layers.map((layer) => {
                const color = getLayerColor(layer.layerType);
                const startKm = activeSection.startChainage;
                const endKm = activeSection.startChainage + (layer.completedLengthMeters / 1000);

                return (
                  <div key={layer.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color.badge}`}>
                          {layer.layerType} ({layer.designThicknessMm} mm)
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Completed: Km {startKm.toFixed(3)} → Km {endKm.toFixed(3)} ({layer.completedLengthMeters.toLocaleString()}m)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-200 font-mono">{layer.progressPercent}%</span>
                        <button
                          onClick={() => handleOpenEdit(layer)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-400 font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" /> Update
                        </button>
                      </div>
                    </div>

                    {/* Progress Track Bar */}
                    <div className="h-6 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative">
                      <div
                        className={`h-full ${color.bar} transition-all duration-500 rounded-l-lg flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-inner`}
                        style={{ width: `${Math.max(4, layer.progressPercent)}%` }}
                      >
                        {layer.progressPercent > 12 && `${layer.completedLengthMeters}m`}
                      </div>

                      {/* Chainage Milestones markers */}
                      <div className="absolute inset-0 flex justify-between px-3 pointer-events-none text-[9px] text-slate-500 font-mono items-center">
                        <span>| Km 120</span>
                        <span>| Km 125</span>
                        <span>| Km 130</span>
                        <span>| Km 135</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DETAILED ROAD LAYER QUANTITY & VARIANCE TABLE */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-amber-400" />
                  Road Layer Material Traceability & Theoretical vs Actual Variance
                </h3>
                <p className="text-xs text-slate-400">
                  Formula: Volume = Length × Width × Thickness • Bulk Density & Compaction Factor Applied
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Layer Specification</th>
                    <th className="py-3 px-3">Thickness</th>
                    <th className="py-3 px-3">Completed Stretch</th>
                    <th className="py-3 px-3">Theoretical Qty</th>
                    <th className="py-3 px-3">Actual Used</th>
                    <th className="py-3 px-3">Variance</th>
                    <th className="py-3 px-3">Progress</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {activeSection.layers.map((layer) => {
                    const isOver = layer.varianceQty > 0;
                    return (
                      <tr key={layer.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-white">
                          {layer.layerType}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-300">
                          {layer.designThicknessMm} mm
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-300">
                          {layer.completedLengthMeters.toLocaleString()} / {activeSection.totalLengthMeters.toLocaleString()} m
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-300">
                          {layer.theoreticalQty.toLocaleString()} {layer.unit}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                          {layer.actualQtyUsed.toLocaleString()} {layer.unit}
                        </td>
                        <td className="py-3.5 px-3 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isOver ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {isOver ? `+${layer.varianceQty} ${layer.unit}` : '0 Variance'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${layer.progressPercent}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-[11px] text-slate-400">{layer.progressPercent}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleOpenEdit(layer)}
                            className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingLayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              Update Road Layer Progress: {editingLayer.layerType}
            </h3>
            <p className="text-xs text-slate-400">
              Enter current verified chainage completion and actual cumulative material dispatched.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Completed Length (Metres) - Max {activeSection?.totalLengthMeters}m
                </label>
                <input
                  type="number"
                  required
                  value={newCompletedMeters}
                  onChange={(e) => setNewCompletedMeters(Number(e.target.value))}
                  max={activeSection?.totalLengthMeters}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Actual Material Used ({editingLayer.unit})
                </label>
                <input
                  type="number"
                  required
                  value={newActualQty}
                  onChange={(e) => setNewActualQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-amber-400 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <span>Theoretical Design Requirement: </span>
                <span className="font-bold text-white font-mono">{editingLayer.theoreticalQty} {editingLayer.unit}</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
