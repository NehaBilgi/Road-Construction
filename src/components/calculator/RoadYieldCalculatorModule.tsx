import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Calculator,
  Ruler,
  Trash2,
  Edit2,
  MapPin,
  Layers,
  Plus
} from 'lucide-react';

export interface YieldCalculation {
  id: string;
  date: string;
  siteName: string;
  materialName: string;
  roadLength: number;
  roadWidth: number;
  thickness: number;
  tipperCapacity: number;
  totalVolumeCum: number;
  totalBrass: number;
  tripsRequired: number;
}

export interface RoadMaterialCategory {
  id: string;
  name: string;
  description: string;
  standardRate: number;
  unit: string;
}

const STORAGE_YIELD_KEY = 'CONSTRUCTION_PRO_YIELD_CALCS_V1';
const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';

const INITIAL_ROAD_CATEGORIES: RoadMaterialCategory[] = [
  { id: 'RCAT-01', name: 'Bituminous Macadam (BM)', description: '', standardRate: 5000, unit: 'Brass' },
  { id: 'RCAT-02', name: 'Wet Mix Macadam (WMM Base)', description: '', standardRate: 4500, unit: 'Brass' },
  { id: 'RCAT-03', name: 'Granular Sub-Base (GSB)', description: '', standardRate: 4200, unit: 'Brass' },
  { id: 'RCAT-04', name: 'Dense Bituminous Macadam (DBM)', description: '', standardRate: 5500, unit: 'Brass' },
  { id: 'RCAT-05', name: 'Bituminous Concrete (BC)', description: '', standardRate: 6000, unit: 'Brass' }
];

export const RoadYieldCalculatorModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId } = useERP();

  const [categories, setCategories] = useState<RoadMaterialCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROAD_CATS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ROAD_CATEGORIES;
    } catch {
      return INITIAL_ROAD_CATEGORIES;
    }
  });

  const [calculations, setCalculations] = useState<YieldCalculation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_YIELD_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-sync categories from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROAD_CATS_KEY);
      if (saved) {
        setCategories(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to sync categories', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_YIELD_KEY, JSON.stringify(calculations));
  }, [calculations]);

  const currentActiveSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const defaultSiteName = currentActiveSite?.siteName || siteSheets[0]?.siteName || 'SINDAGI - ALMEL ROAD';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [siteName, setSiteName] = useState(defaultSiteName);
  const [materialName, setMaterialName] = useState(categories[0]?.name || 'Wet Mix Macadam (WMM Base)');
  const [roadLength, setRoadLength] = useState<number | ''>('');
  const [roadWidth, setRoadWidth] = useState<number | ''>('');
  const [thickness, setThickness] = useState<number | ''>('');
  const [tipperCapacity, setTipperCapacity] = useState<number | ''>('');

  const computedData = useMemo(() => {
    const l = Number(roadLength) || 0;
    const w = Number(roadWidth) || 0;
    const t_mm = Number(thickness) || 0;
    const cap = Number(tipperCapacity) || 1;

    const t_m = t_mm / 1000;
    const volumeCum = l * w * t_m;
    const brass = volumeCum / 2.83168;
    const trips = brass / cap;

    return {
      volumeCum: volumeCum.toFixed(2),
      brass: brass.toFixed(2),
      trips: Math.ceil(trips)
    };
  }, [roadLength, roadWidth, thickness, tipperCapacity]);

  const handleSaveCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadLength || !roadWidth || !thickness || !tipperCapacity) return;

    const payload: YieldCalculation = {
      id: editingId || `CALC-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().substring(0, 10),
      siteName,
      materialName,
      roadLength: Number(roadLength),
      roadWidth: Number(roadWidth),
      thickness: Number(thickness),
      tipperCapacity: Number(tipperCapacity),
      totalVolumeCum: Number(computedData.volumeCum),
      totalBrass: Number(computedData.brass),
      tripsRequired: computedData.trips
    };

    if (editingId) {
      setCalculations(calculations.map((c) => (c.id === editingId ? payload : c)));
      setEditingId(null);
    } else {
      setCalculations([payload, ...calculations]);
    }

    setRoadLength('');
    setRoadWidth('');
    setThickness('');
    setTipperCapacity('');
  };

  const handleEdit = (calc: YieldCalculation) => {
    setEditingId(calc.id);
    setSiteName(calc.siteName);
    setMaterialName(calc.materialName);
    setRoadLength(calc.roadLength);
    setRoadWidth(calc.roadWidth);
    setThickness(calc.thickness);
    setTipperCapacity(calc.tipperCapacity);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRoadLength('');
    setRoadWidth('');
    setThickness('');
    setTipperCapacity('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this calculation?')) {
      setCalculations((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#008B8B]/20 border border-[#008B8B]/30 flex items-center justify-center text-[#00FFFF]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Road Trip Calculator</h1>
            <p className="text-xs text-slate-400 mt-0.5">Calculate layer yields, brass requirements, and required tipper trips.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Form */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-[2rem] bg-[#0c1427] border border-[#182643] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white tracking-wide">
                  {editingId ? 'Edit Parameters' : 'Road Dimension Parameters'}
                </h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveCalculation} className="space-y-5 text-xs">
              <div>
                <label className="flex items-center gap-1.5 text-slate-300 font-bold mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Site Name *</span>
                </label>
                {siteSheets.length > 0 ? (
                  <select
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-bold outline-none cursor-pointer focus:border-cyan-500 transition-colors"
                  >
                    {siteSheets.map((s: any) => (
                      <option key={s.siteId} value={s.siteName}>{s.siteName}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-bold outline-none focus:border-cyan-500 transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center justify-between text-slate-300 font-bold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Material Name *</span>
                  </span>
                  <span className="text-[10px] text-blue-400 font-normal">Linked to Categories</span>
                </label>
                <select
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-300 font-bold outline-none cursor-pointer focus:border-cyan-500 transition-colors"
                >
                  {categories.length === 0 && (
                    <option value="">No categories found. Please add in Categories tab.</option>
                  )}
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {!categories.some((c) => c.name === materialName) && materialName && (
                    <option value={materialName}>{materialName}</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Road Length (Meters) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2500"
                    value={roadLength}
                    onChange={(e) => setRoadLength(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-3 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-cyan-500 transition-colors placeholder-[#334155]"
                  />
                  <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
                    = {roadLength ? (Number(roadLength) / 1000).toFixed(2) : '0.00'} KM
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Road Width (Meters) *</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    placeholder="e.g. 9.0"
                    value={roadWidth}
                    onChange={(e) => setRoadWidth(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-3 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-cyan-500 transition-colors placeholder-[#334155]"
                  />
                  <div className="text-[10px] text-slate-500 mt-1.5">Carriageway width</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Thickness (mm) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 250"
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-3 bg-[#162032] border border-[#1E293B] rounded-xl text-cyan-400 font-mono font-bold outline-none focus:border-cyan-500 transition-colors placeholder-[#334155]"
                  />
                  <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
                    = {thickness ? (Number(thickness) / 1000).toFixed(3) : '0.000'} Meters
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Tipper Capacity (Brass) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.1"
                    placeholder="e.g. 6"
                    value={tipperCapacity}
                    onChange={(e) => setTipperCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-3 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-cyan-500 transition-colors placeholder-[#334155]"
                  />
                  <div className="text-[10px] text-slate-500 mt-1.5">Standard 10-wheel/12-wheel</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#008B8B] hover:bg-[#007070] text-white text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#008B8B]/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingId ? 'Update Calculation' : 'Save Section Calculation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Yield Output & History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-[2rem] bg-[#0c1427] border border-[#182643] shadow-2xl">
            <h2 className="text-sm font-bold text-white mb-4">Live Yield Output</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#080d19] border border-[#182643] flex flex-col items-center justify-center text-center">
                <div className="text-[10px] font-bold text-slate-500 mb-1">TOTAL VOLUME</div>
                <div className="text-2xl font-black text-white font-mono">{computedData.volumeCum}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Cu.m</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#080d19] border border-amber-900/40 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] font-bold text-amber-500/70 mb-1">TOTAL BRASS</div>
                <div className="text-2xl font-black text-amber-400 font-mono">{computedData.brass}</div>
                <div className="text-[10px] text-amber-500/50 mt-0.5">Yield</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#080d19] border border-cyan-900/40 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] font-bold text-cyan-500/70 mb-1">REQUIRED TRIPS</div>
                <div className="text-2xl font-black text-cyan-400 font-mono">{computedData.trips}</div>
                <div className="text-[10px] text-cyan-500/50 mt-0.5">Tippers Needed</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-[#0B1220] border border-[#1E293B] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-4">
              <h2 className="text-sm font-bold text-white">Saved Calculations</h2>
              <span className="text-xs text-slate-500">{calculations.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-[#080d19]/80">
                    <th className="py-3 px-4">SITE & MAT.</th>
                    <th className="py-3 px-4">DIMS (L×W×T)</th>
                    <th className="py-3 px-4 text-right">VOL (Cu.m)</th>
                    <th className="py-3 px-4 text-right text-amber-400">BRASS</th>
                    <th className="py-3 px-4 text-right text-cyan-400">TRIPS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                  {calculations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No saved calculations yet.
                      </td>
                    </tr>
                  ) : (
                    calculations.map((c) => (
                      <tr key={c.id} className="hover:bg-[#121c33]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white truncate max-w-[150px]">{c.siteName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{c.materialName}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px]">
                          {c.roadLength}m × {c.roadWidth}m × {c.thickness}mm
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{c.totalVolumeCum.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">{c.totalBrass.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-cyan-400">{c.tripsRequired}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(c)}
                              title="Edit Calculation"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id)}
                              title="Delete Calculation"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      </div>
    </div>
  );
};

export default RoadYieldCalculatorModule;
