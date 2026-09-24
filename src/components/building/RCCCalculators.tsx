import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Truck,
  Layers,
  Box,
  Building,
  Footprints,
  Check
} from 'lucide-react';

export type StructuralType = 'SLAB' | 'COLUMN' | 'BEAM' | 'RCC_WALL' | 'STAIRS' | 'FOOTING';
export type UnitSystem = 'METRIC' | 'IMPERIAL';

export interface ConcreteItem {
  id: string;
  categories: StructuralType[];
  label: string;
  breakdownText: string;
  volumeM3: number;
  volumeCft: number;
  ratePerM3: number;
}

const STORAGE_RCC_ELEMENTS_KEY = 'CONSTRUCTION_PRO_RCC_CALCULATOR_ELEMENTS_V6';

const CATEGORY_DEFINITIONS: { id: StructuralType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'SLAB', label: 'Slab / Deck', icon: Layers },
  { id: 'COLUMN', label: 'Column', icon: Box },
  { id: 'BEAM', label: 'Beam', icon: Building },
  { id: 'RCC_WALL', label: 'RCC Wall', icon: Building },
  { id: 'STAIRS', label: 'Stairs', icon: Footprints },
  { id: 'FOOTING', label: 'Footing', icon: Box }
];

export const BuildingCalculatorModule: React.FC = () => {
  const [items, setItems] = useState<ConcreteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RCC_ELEMENTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConcreteItem | null>(null);

  // Transit Mixer Parameters
  const [mixerCapacityM3, setMixerCapacityM3] = useState<number>(7.0);
  const [wastagePercent, setWastagePercent] = useState<number>(0);

  // Modal Input Unit Mode
  const [unitMode, setUnitMode] = useState<UnitSystem>('METRIC');

  // Multi-Category Active Selection
  const [selectedCategories, setSelectedCategories] = useState<StructuralType[]>(['SLAB']);
  const [label, setLabel] = useState('');
  const [ratePerM3, setRatePerM3] = useState<number | ''>('');

  // --- Slab Inputs (Zeroed) ---
  const [slabLen, setSlabLen] = useState<number | ''>('');
  const [slabWid, setSlabWid] = useState<number | ''>('');
  const [slabThk, setSlabThk] = useState<number | ''>('');

  // --- Column Inputs (Zeroed) ---
  const [colCount, setColCount] = useState<number | ''>('');
  const [colDim1, setColDim1] = useState<number | ''>('');
  const [colDim2, setColDim2] = useState<number | ''>('');
  const [colHgt, setColHgt] = useState<number | ''>('');

  // --- Beam Inputs (Zeroed) ---
  const [beamCount, setBeamCount] = useState<number | ''>('');
  const [beamLen, setBeamLen] = useState<number | ''>('');
  const [beamWid, setBeamWid] = useState<number | ''>('');
  const [beamDep, setBeamDep] = useState<number | ''>('');

  // --- RCC Wall Inputs (Zeroed) ---
  const [wallCount, setWallCount] = useState<number | ''>('');
  const [wallLen, setWallLen] = useState<number | ''>('');
  const [wallHgt, setWallHgt] = useState<number | ''>('');
  const [wallThk, setWallThk] = useState<number | ''>('');

  // --- Stairs Inputs (Zeroed) ---
  const [flightsCount, setFlightsCount] = useState<number | ''>('');
  const [stairWid, setStairWid] = useState<number | ''>('');
  const [stepTread, setStepTread] = useState<number | ''>('');
  const [stepRiser, setStepRiser] = useState<number | ''>('');
  const [numberOfSteps, setNumberOfSteps] = useState<number | ''>('');
  const [waistSlabThk, setWaistSlabThk] = useState<number | ''>('');

  // --- Footing Inputs (Zeroed) ---
  const [footingCount, setFootingCount] = useState<number | ''>('');
  const [footingLen, setFootingLen] = useState<number | ''>('');
  const [footingWid, setFootingWid] = useState<number | ''>('');
  const [footingDep, setFootingDep] = useState<number | ''>('');

  useEffect(() => {
    localStorage.setItem(STORAGE_RCC_ELEMENTS_KEY, JSON.stringify(items));
  }, [items]);

  const handleToggleCategory = (catId: StructuralType) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return;
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === CATEGORY_DEFINITIONS.length) {
      setSelectedCategories(['SLAB']);
    } else {
      setSelectedCategories(CATEGORY_DEFINITIONS.map((c) => c.id));
    }
  };

  const subVolumesM3 = useMemo(() => {
    const isMetric = unitMode === 'METRIC';
    const vols: Record<StructuralType, number> = {
      SLAB: 0,
      COLUMN: 0,
      BEAM: 0,
      RCC_WALL: 0,
      STAIRS: 0,
      FOOTING: 0
    };

    const sL = Number(slabLen) || 0;
    const sW = Number(slabWid) || 0;
    const sT = Number(slabThk) || 0;

    const cC = Number(colCount) || 0;
    const cD1 = Number(colDim1) || 0;
    const cD2 = Number(colDim2) || 0;
    const cH = Number(colHgt) || 0;

    const bC = Number(beamCount) || 0;
    const bL = Number(beamLen) || 0;
    const bW = Number(beamWid) || 0;
    const bD = Number(beamDep) || 0;

    const wC = Number(wallCount) || 0;
    const wL = Number(wallLen) || 0;
    const wH = Number(wallHgt) || 0;
    const wT = Number(wallThk) || 0;

    const fC = Number(flightsCount) || 0;
    const stW = Number(stairWid) || 0;
    const sTr = Number(stepTread) || 0;
    const sR = Number(stepRiser) || 0;
    const nS = Number(numberOfSteps) || 0;
    const wST = Number(waistSlabThk) || 0;

    const ftC = Number(footingCount) || 0;
    const ftL = Number(footingLen) || 0;
    const ftW = Number(footingWid) || 0;
    const ftD = Number(footingDep) || 0;

    if (isMetric) {
      vols.SLAB = sL * sW * (sT / 1000);
      vols.COLUMN = cC * (cD1 / 1000) * (cD2 / 1000) * cH;
      vols.BEAM = bC * bL * (bW / 1000) * (bD / 1000);
      vols.RCC_WALL = wC * wL * wH * (wT / 1000);

      const trM = sTr / 1000;
      const rM = sR / 1000;
      const wtM = wST / 1000;
      const stepsVol = 0.5 * trM * rM * stW * nS;
      const waistVol = Math.sqrt(trM * trM + rM * rM) * nS * stW * wtM;
      vols.STAIRS = fC * (stepsVol + waistVol);

      vols.FOOTING = ftC * ftL * ftW * (ftD / 1000);
    } else {
      vols.SLAB = (sL * sW * (sT / 12)) / 35.3146667;
      vols.COLUMN = (cC * (cD1 / 12) * (cD2 / 12) * cH) / 35.3146667;
      vols.BEAM = (bC * bL * (bW / 12) * (bD / 12)) / 35.3146667;
      vols.RCC_WALL = (wC * wL * wH * (wT / 12)) / 35.3146667;

      const trFt = sTr / 12;
      const rFt = sR / 12;
      const wtFt = wST / 12;
      const stepsVol = 0.5 * trFt * rFt * stW * nS;
      const waistVol = Math.sqrt(trFt * trFt + rFt * rFt) * nS * stW * wtFt;
      vols.STAIRS = (fC * (stepsVol + waistVol)) / 35.3146667;

      vols.FOOTING = (ftC * ftL * ftW * (ftD / 12)) / 35.3146667;
    }

    return vols;
  }, [
    unitMode,
    slabLen, slabWid, slabThk,
    colCount, colDim1, colDim2, colHgt,
    beamCount, beamLen, beamWid, beamDep,
    wallCount, wallLen, wallHgt, wallThk,
    flightsCount, stairWid, stepTread, stepRiser, numberOfSteps, waistSlabThk,
    footingCount, footingLen, footingWid, footingDep
  ]);

  const grandTotalComputed = useMemo(() => {
    let totalM3 = 0;
    selectedCategories.forEach((cat) => {
      totalM3 += subVolumesM3[cat] || 0;
    });
    const totalCft = totalM3 * 35.3146667;
    return { totalM3, totalCft };
  }, [selectedCategories, subVolumesM3]);

  const resetAllFieldsToZero = () => {
    setSlabLen('');
    setSlabWid('');
    setSlabThk('');
    setColCount('');
    setColDim1('');
    setColDim2('');
    setColHgt('');
    setBeamCount('');
    setBeamLen('');
    setBeamWid('');
    setBeamDep('');
    setWallCount('');
    setWallLen('');
    setWallHgt('');
    setWallThk('');
    setFlightsCount('');
    setStairWid('');
    setStepTread('');
    setStepRiser('');
    setNumberOfSteps('');
    setWaistSlabThk('');
    setFootingCount('');
    setFootingLen('');
    setFootingWid('');
    setFootingDep('');
    setRatePerM3('');
    setLabel('');
  };

  const handleUnitModeSwitch = (mode: UnitSystem) => {
    if (mode === unitMode) return;
    setUnitMode(mode);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setSelectedCategories(['SLAB']);
    resetAllFieldsToZero();
    setUnitMode('METRIC');
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    const parts = selectedCategories.map((cat) => {
      const labelName = CATEGORY_DEFINITIONS.find((c) => c.id === cat)?.label.split('/')[0].trim();
      return `${labelName} (${subVolumesM3[cat].toFixed(2)}m³)`;
    });

    const breakdownText = parts.join(' + ');

    if (editingItem) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                categories: selectedCategories,
                label: label.trim() || `Structural Concrete Work`,
                breakdownText,
                volumeM3: Number(grandTotalComputed.totalM3.toFixed(3)),
                volumeCft: Number(grandTotalComputed.totalCft.toFixed(2)),
                ratePerM3: Number(ratePerM3) || 0
              }
            : it
        )
      );
    } else {
      const newItem: ConcreteItem = {
        id: `RCC-${Math.floor(1000 + Math.random() * 9000)}`,
        categories: selectedCategories,
        label: label.trim() || `Structural Concrete Work`,
        breakdownText,
        volumeM3: Number(grandTotalComputed.totalM3.toFixed(3)),
        volumeCft: Number(grandTotalComputed.totalCft.toFixed(2)),
        ratePerM3: Number(ratePerM3) || 0
      };
      setItems((prev) => [newItem, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.id.toLowerCase().includes(q) ||
        it.label.toLowerCase().includes(q) ||
        it.breakdownText.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const totalWetM3 = useMemo(() => {
    return items.reduce((sum, it) => sum + it.volumeM3, 0);
  }, [items]);

  const totalWetCft = useMemo(() => {
    return totalWetM3 * 35.3146667;
  }, [totalWetM3]);

  const totalWithWastage = useMemo(() => {
    return totalWetM3 * (1 + wastagePercent / 100);
  }, [totalWetM3, wastagePercent]);

  const totalRmcVehicles = useMemo(() => {
    if (mixerCapacityM3 <= 0 || totalWithWastage <= 0) return 0;
    return Math.ceil(totalWithWastage / mixerCapacityM3);
  }, [totalWithWastage, mixerCapacityM3]);

  const totalCost = useMemo(() => {
    return items.reduce((sum, it) => sum + it.volumeM3 * it.ratePerM3, 0);
  }, [items]);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans p-6 sm:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Concrete Master</h1>
          <p className="text-sm text-slate-400 mt-1">
            Calculate structural concrete works in m³, CFT (cu.ft), and RMC transit mixer loads.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Structural Work</span>
        </button>
      </div>

      {/* RMC Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0B1120] border border-[#17233D] p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Concrete Work
          </span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {totalWetM3.toFixed(2)} <span className="text-xs text-slate-400 font-sans">m³</span>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono mt-0.5 block">
            ≈ {totalWetCft.toFixed(1)} CFT (cu.ft)
          </span>
        </div>

        <div className="bg-[#0B1120] border border-[#17233D] p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
              Order (+{wastagePercent}% Wastage)
            </span>
            <input
              type="number"
              value={wastagePercent}
              onChange={(e) => setWastagePercent(Math.max(0, Number(e.target.value)))}
              className="w-12 text-right bg-[#10192E] border border-[#1E2E4E] rounded px-1 text-xs text-cyan-300 font-mono outline-none"
              title="Pumping & Line Wastage %"
            />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono mt-1">
            {totalWithWastage.toFixed(2)} <span className="text-xs text-cyan-500 font-sans">m³</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
            ≈ {(totalWithWastage * 35.3146667).toFixed(1)} CFT
          </span>
        </div>

        <div className="bg-[#0B1120] border border-emerald-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              RMC Vehicles Required
            </span>
            <select
              value={mixerCapacityM3}
              onChange={(e) => setMixerCapacityM3(Number(e.target.value))}
              className="px-1.5 py-0.5 bg-[#10192E] border border-[#1E2E4E] rounded text-[11px] text-emerald-400 font-mono outline-none cursor-pointer"
            >
              <option value={6}>6 m³</option>
              <option value={7}>7 m³</option>
              <option value={8}>8 m³</option>
              <option value={9}>9 m³</option>
            </select>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <span>{totalRmcVehicles} Trucks</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            @ {mixerCapacityM3} m³ per transit mixer
          </span>
        </div>

        <div className="bg-[#0B1120] border border-[#17233D] p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Concrete Work Cost
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            ₹{Math.round(totalCost).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
            Estimated Cost on Site
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by element name, structural breakdown or ID..."
          className="w-full bg-[#080D1A] border border-[#162238] rounded-full pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Table Container */}
      <div className="bg-[#080D1A] border border-[#162238] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#162238] text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-[#090F1E]">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">CATEGORIES INCLUDED</th>
                <th className="py-4 px-6">DESCRIPTION & BREAKDOWN</th>
                <th className="py-4 px-6 text-center">RATE (₹)</th>
                <th className="py-4 px-6 text-center">TOTAL VOLUME (M³ / CFT)</th>
                <th className="py-4 px-6 text-center">TOTAL COST (₹)</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#121B2D] text-slate-200 font-mono">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans text-xs">
                    No structural concrete works logged. Click "+ Add Structural Work" to add.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#0E1626] transition-colors">
                    <td className="py-4 px-6 text-slate-400 font-medium">{item.id}</td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {item.categories.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#111C33] border border-[#1C2C4E] text-blue-300 font-sans"
                          >
                            {c.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-sans">
                      <div className="font-bold text-white text-sm">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.breakdownText}</div>
                    </td>

                    <td className="py-4 px-6 text-center text-slate-300">
                      ₹{item.ratePerM3} <span className="text-[10px] text-slate-500 font-sans">/ m³</span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="font-bold text-cyan-400 text-sm">
                        {item.volumeM3.toFixed(2)} <span className="text-xs text-cyan-500 font-sans">m³</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {(item.volumeCft || item.volumeM3 * 35.3146667).toFixed(1)} CFT
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-emerald-400 text-sm">
                      ₹{Math.round(item.volumeM3 * item.ratePerM3).toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setSelectedCategories(item.categories || ['SLAB']);
                            setLabel(item.label);
                            setRatePerM3(item.ratePerM3);
                            setIsModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-white cursor-pointer transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal: Simultaneous Multi-Category Concrete Calculator */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0A0F1D] border border-[#1A2640] rounded-3xl w-full max-w-3xl shadow-2xl p-6 space-y-5 max-h-[94vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1A2640] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? 'Edit Structural Work' : 'Add Structural Concrete Work'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculate concrete work in m³ across building categories.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-5 text-xs">
              {/* Unit System Switcher Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070B16] border border-[#17243F]">
                <span className="text-slate-300 font-bold">Input Dimensions Unit:</span>
                <div className="flex items-center gap-1 bg-[#0F172B] p-1 rounded-lg border border-[#1E2E4E]">
                  <button
                    type="button"
                    onClick={() => handleUnitModeSwitch('METRIC')}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                      unitMode === 'METRIC'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Meters & mm (m)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitModeSwitch('IMPERIAL')}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                      unitMode === 'IMPERIAL'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Feet & Inches (ft / in)
                  </button>
                </div>
              </div>

              {/* Multi-Category Selection Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">
                    Select Categories to Include:
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllCategories}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer underline"
                  >
                    {selectedCategories.length === CATEGORY_DEFINITIONS.length ? 'Clear to Slab' : 'Select All Categories'}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-[#070B16] border border-[#17243F] rounded-2xl overflow-x-auto scrollbar-thin">
                  {CATEGORY_DEFINITIONS.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-[#0E1628] hover:bg-[#141F38] text-slate-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0" />
                        ) : (
                          <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Element Label */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Pour Name / Location Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor Slab + Columns"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0F172B] border border-[#1C2C4E] rounded-xl text-white outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* DYNAMIC CATEGORY PANELS (ALL ZEROED / EMPTY BY DEFAULT) */}
              <div className="space-y-3 pt-1">
                {/* 1. SLAB INPUTS */}
                {selectedCategories.includes('SLAB') && (
                  <div className="p-3.5 bg-[#070B16] rounded-2xl border border-[#17243F] space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#141E33]">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <Layers className="w-4 h-4" />
                        <span>Slab / Deck Dimensions</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300 text-xs">
                        {subVolumesM3.SLAB.toFixed(2)} m³
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Length ({unitMode === 'METRIC' ? 'm' : 'ft'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={slabLen}
                          onChange={(e) => setSlabLen(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Width ({unitMode === 'METRIC' ? 'm' : 'ft'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={slabWid}
                          onChange={(e) => setSlabWid(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Thickness ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={slabThk}
                          onChange={(e) => setSlabThk(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-cyan-400 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. COLUMN INPUTS */}
                {selectedCategories.includes('COLUMN') && (
                  <div className="p-3.5 bg-[#070B16] rounded-2xl border border-[#17243F] space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#141E33]">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <Box className="w-4 h-4" />
                        <span>Column Dimensions</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300 text-xs">
                        {subVolumesM3.COLUMN.toFixed(2)} m³
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">No. of Columns</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={colCount}
                          onChange={(e) => setColCount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Height ({unitMode === 'METRIC' ? 'm' : 'ft'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={colHgt}
                          onChange={(e) => setColHgt(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Side A ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={colDim1}
                          onChange={(e) => setColDim1(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Side B ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={colDim2}
                          onChange={(e) => setColDim2(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BEAM INPUTS */}
                {selectedCategories.includes('BEAM') && (
                  <div className="p-3.5 bg-[#070B16] rounded-2xl border border-[#17243F] space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#141E33]">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <Building className="w-4 h-4" />
                        <span>Beam Dimensions</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300 text-xs">
                        {subVolumesM3.BEAM.toFixed(2)} m³
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">No. of Beams</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={beamCount}
                          onChange={(e) => setBeamCount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Length ({unitMode === 'METRIC' ? 'm' : 'ft'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={beamLen}
                          onChange={(e) => setBeamLen(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Width ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={beamWid}
                          onChange={(e) => setBeamWid(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Depth ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={beamDep}
                          onChange={(e) => setBeamDep(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. RCC WALL INPUTS */}
                {selectedCategories.includes('RCC_WALL') && (
                  <div className="p-3.5 bg-[#070B16] rounded-2xl border border-[#17243F] space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#141E33]">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <Building className="w-4 h-4" />
                        <span>RCC / Shear Wall Dimensions</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300 text-xs">
                        {subVolumesM3.RCC_WALL.toFixed(2)} m³
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">No. of Walls</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={wallCount}
                          onChange={(e) => setWallCount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Length ({unitMode === 'METRIC' ? 'm' : 'ft'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={wallLen}
                          onChange={(e) => setWallLen(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Height ({unitMode === 'METRIC' ? 'm' : 'ft'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={wallHgt}
                          onChange={(e) => setWallHgt(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Thickness ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={wallThk}
                          onChange={(e) => setWallThk(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. STAIRS INPUTS */}
                {selectedCategories.includes('STAIRS') && (
                  <div className="p-3.5 bg-[#070B16] rounded-2xl border border-[#17243F] space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#141E33]">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <Footprints className="w-4 h-4" />
                        <span>Staircase Steps & Waist Slab</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300 text-xs">
                        {subVolumesM3.STAIRS.toFixed(2)} m³
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Flights</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={flightsCount}
                          onChange={(e) => setFlightsCount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Width ({unitMode === 'METRIC' ? 'm' : 'ft'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={stairWid}
                          onChange={(e) => setStairWid(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Steps</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={numberOfSteps}
                          onChange={(e) => setNumberOfSteps(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Tread ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={stepTread}
                          onChange={(e) => setStepTread(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Riser ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={stepRiser}
                          onChange={(e) => setStepRiser(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Waist ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={waistSlabThk}
                          onChange={(e) => setWaistSlabThk(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. FOOTING INPUTS */}
                {selectedCategories.includes('FOOTING') && (
                  <div className="p-3.5 bg-[#070B16] rounded-2xl border border-[#17243F] space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#141E33]">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <Box className="w-4 h-4" />
                        <span>Footing / Foundation Dimensions</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300 text-xs">
                        {subVolumesM3.FOOTING.toFixed(2)} m³
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">No. of Footings</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={footingCount}
                          onChange={(e) => setFootingCount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Length ({unitMode === 'METRIC' ? 'm' : 'ft'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={footingLen}
                          onChange={(e) => setFootingLen(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Width ({unitMode === 'METRIC' ? 'm' : 'ft'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={footingWid}
                          onChange={(e) => setFootingWid(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Depth ({unitMode === 'METRIC' ? 'mm' : 'in'})
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={footingDep}
                          onChange={(e) => setFootingDep(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rate & Combined Grand Total Output */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Concrete Rate (₹ / m³)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={ratePerM3}
                    onChange={(e) => setRatePerM3(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#0F172B] border border-[#1C2C4E] rounded-xl text-white font-mono"
                  />
                </div>
                <div className="p-3 bg-[#070B16] rounded-xl border border-cyan-500/40 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Total Calculated Volume (All Categories)
                  </span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">
                    {grandTotalComputed.totalM3.toFixed(2)} m³
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    ({grandTotalComputed.totalCft.toFixed(1)} CFT)
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A2640]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#0F172B] hover:bg-[#16223D] text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingItem ? 'Update Work' : 'Add Work'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const RCCCalculators = BuildingCalculatorModule;
export default BuildingCalculatorModule;
