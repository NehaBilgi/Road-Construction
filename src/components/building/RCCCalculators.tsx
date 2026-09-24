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
  CheckCircle2
} from 'lucide-react';

export type StructuralType = 'SLAB' | 'COLUMN' | 'BEAM' | 'RCC_WALL' | 'STAIRS' | 'FOOTING';

export interface ConcreteItem {
  id: string;
  category: StructuralType;
  label: string;
  dimensionsText: string;
  volumeM3: number;
  ratePerM3: number;
}

const STORAGE_RCC_ELEMENTS_KEY = 'CONSTRUCTION_PRO_RCC_CALCULATOR_ELEMENTS_V1';

const INITIAL_ELEMENTS: ConcreteItem[] = [
  {
    id: 'RCC-1001',
    category: 'SLAB',
    label: 'Ground Floor Slab',
    dimensionsText: '15m × 10m × 150mm',
    volumeM3: 22.5,
    ratePerM3: 4500
  },
  {
    id: 'RCC-1002',
    category: 'COLUMN',
    label: 'Plinth Columns (12 Nos)',
    dimensionsText: '12 Nos (300×600mm, H: 3.2m)',
    volumeM3: 6.912,
    ratePerM3: 4800
  },
  {
    id: 'RCC-1003',
    category: 'BEAM',
    label: 'Main Plinth Beams (8 Nos)',
    dimensionsText: '8 Nos (6m × 230×450mm)',
    volumeM3: 3.974,
    ratePerM3: 4600
  },
  {
    id: 'RCC-1004',
    category: 'RCC_WALL',
    label: 'Lift Core Shear Wall',
    dimensionsText: '2 Nos (8m L × 3.2m H × 200mm)',
    volumeM3: 10.24,
    ratePerM3: 5000
  },
  {
    id: 'RCC-1005',
    category: 'STAIRS',
    label: 'Main Staircase Flight',
    dimensionsText: '1 Flight (18 Steps, W: 1.2m, Waist: 150mm)',
    volumeM3: 1.85,
    ratePerM3: 4700
  },
  {
    id: 'RCC-1006',
    category: 'FOOTING',
    label: 'Isolated Footings (12 Nos)',
    dimensionsText: '12 Nos (2m × 2m × 500mm)',
    volumeM3: 24.0,
    ratePerM3: 4200
  }
];

export const BuildingCalculatorModule: React.FC = () => {
  const [items, setItems] = useState<ConcreteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RCC_ELEMENTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ELEMENTS;
    } catch {
      return INITIAL_ELEMENTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConcreteItem | null>(null);

  // Transit Mixer Parameters
  const [mixerCapacityM3, setMixerCapacityM3] = useState<number>(7.0);
  const [wastagePercent, setWastagePercent] = useState<number>(3.0);

  // Modal Input States
  const [category, setCategory] = useState<StructuralType>('SLAB');
  const [label, setLabel] = useState('');
  const [ratePerM3, setRatePerM3] = useState<number | ''>(4500);

  // Slab Inputs
  const [slabLength, setSlabLength] = useState<number>(15);
  const [slabWidth, setSlabWidth] = useState<number>(10);
  const [slabThickMm, setSlabThickMm] = useState<number>(150);

  // Column Inputs
  const [colCount, setColCount] = useState<number>(12);
  const [colLengthMm, setColLengthMm] = useState<number>(300);
  const [colWidthMm, setColWidthMm] = useState<number>(600);
  const [colHeightM, setColHeightM] = useState<number>(3.2);

  // Beam Inputs
  const [beamCount, setBeamCount] = useState<number>(8);
  const [beamLengthM, setBeamLengthM] = useState<number>(6);
  const [beamWidthMm, setBeamWidthMm] = useState<number>(230);
  const [beamDepthMm, setBeamDepthMm] = useState<number>(450);

  // RCC Wall Inputs
  const [wallCount, setWallCount] = useState<number>(2);
  const [wallLengthM, setWallLengthM] = useState<number>(8);
  const [wallHeightM, setWallHeightM] = useState<number>(3.2);
  const [wallThickMm, setWallThickMm] = useState<number>(200);

  // Stairs Inputs
  const [flightsCount, setFlightsCount] = useState<number>(1);
  const [stairWidthM, setStairWidthM] = useState<number>(1.2);
  const [stepTreadMm, setStepTreadMm] = useState<number>(250);
  const [stepRiserMm, setStepRiserMm] = useState<number>(150);
  const [numberOfSteps, setNumberOfSteps] = useState<number>(18);
  const [waistSlabThickMm, setWaistSlabThickMm] = useState<number>(150);

  // Footing Inputs
  const [footingCount, setFootingCount] = useState<number>(12);
  const [footingLengthM, setFootingLengthM] = useState<number>(2);
  const [footingWidthM, setFootingWidthM] = useState<number>(2);
  const [footingDepthMm, setFootingDepthMm] = useState<number>(500);

  useEffect(() => {
    localStorage.setItem(STORAGE_RCC_ELEMENTS_KEY, JSON.stringify(items));
  }, [items]);

  const computedModalVolume = useMemo(() => {
    switch (category) {
      case 'SLAB':
        return slabLength * slabWidth * (slabThickMm / 1000);
      case 'COLUMN':
        return colCount * (colLengthMm / 1000) * (colWidthMm / 1000) * colHeightM;
      case 'BEAM':
        return beamCount * beamLengthM * (beamWidthMm / 1000) * (beamDepthMm / 1000);
      case 'RCC_WALL':
        return wallCount * wallLengthM * wallHeightM * (wallThickMm / 1000);
      case 'STAIRS': {
        const singleStepVol = 0.5 * (stepTreadMm / 1000) * (stepRiserMm / 1000) * stairWidthM;
        const totalStepsVol = singleStepVol * numberOfSteps;
        const stepSlopeLen = Math.sqrt(
          Math.pow(stepTreadMm / 1000, 2) + Math.pow(stepRiserMm / 1000, 2)
        );
        const waistSlabVol = (stepSlopeLen * numberOfSteps) * stairWidthM * (waistSlabThickMm / 1000);
        return flightsCount * (totalStepsVol + waistSlabVol);
      }
      case 'FOOTING':
        return footingCount * footingLengthM * footingWidthM * (footingDepthMm / 1000);
      default:
        return 0;
    }
  }, [
    category,
    slabLength, slabWidth, slabThickMm,
    colCount, colLengthMm, colWidthMm, colHeightM,
    beamCount, beamLengthM, beamWidthMm, beamDepthMm,
    wallCount, wallLengthM, wallHeightM, wallThickMm,
    flightsCount, stairWidthM, stepTreadMm, stepRiserMm, numberOfSteps, waistSlabThickMm,
    footingCount, footingLengthM, footingWidthM, footingDepthMm
  ]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCategory('SLAB');
    setLabel('');
    setRatePerM3(4500);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    let dims = '';
    if (category === 'SLAB') dims = `${slabLength}m × ${slabWidth}m × ${slabThickMm}mm`;
    else if (category === 'COLUMN') dims = `${colCount} Nos (${colLengthMm}×${colWidthMm}mm, H: ${colHeightM}m)`;
    else if (category === 'BEAM') dims = `${beamCount} Nos (${beamLengthM}m × ${beamWidthMm}×${beamDepthMm}mm)`;
    else if (category === 'RCC_WALL') dims = `${wallCount} Nos (${wallLengthM}m L × ${wallHeightM}m H × ${wallThickMm}mm)`;
    else if (category === 'STAIRS') dims = `${flightsCount} Flight (${numberOfSteps} Steps, W: ${stairWidthM}m, Waist: ${waistSlabThickMm}mm)`;
    else if (category === 'FOOTING') dims = `${footingCount} Nos (${footingLengthM}m × ${footingWidthM}m × ${footingDepthMm}mm)`;

    if (editingItem) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                category,
                label: label.trim() || `${category} Work`,
                dimensionsText: dims,
                volumeM3: Number(computedModalVolume.toFixed(3)),
                ratePerM3: Number(ratePerM3) || 0
              }
            : it
        )
      );
    } else {
      const newItem: ConcreteItem = {
        id: `RCC-${Math.floor(1000 + Math.random() * 9000)}`,
        category,
        label: label.trim() || `${category} Work`,
        dimensionsText: dims,
        volumeM3: Number(computedModalVolume.toFixed(3)),
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
        it.category.toLowerCase().includes(q) ||
        it.label.toLowerCase().includes(q) ||
        it.dimensionsText.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const totalWetM3 = useMemo(() => {
    return items.reduce((sum, it) => sum + it.volumeM3, 0);
  }, [items]);

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

  const getCategoryBadgeLabel = (cat: StructuralType) => {
    switch (cat) {
      case 'SLAB':
        return 'Slab & Deck';
      case 'COLUMN':
        return 'Column Member';
      case 'BEAM':
        return 'Plinth / Roof Beam';
      case 'RCC_WALL':
        return 'RCC / Shear Wall';
      case 'STAIRS':
        return 'Staircase Steps';
      case 'FOOTING':
        return 'Footing / Raft';
      default:
        return cat;
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans p-6 sm:p-8 space-y-6">
      {/* Top Header matching Products Master banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Concrete Master</h1>
          <p className="text-sm text-slate-400 mt-1">
            Calculate structural concrete works in m³, cost, and RMC transit mixer loads.
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

      {/* RMC Vehicle Delivery Planner Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0B1120] border border-[#17233D] p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Concrete Work
          </span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {totalWetM3.toFixed(2)} <span className="text-xs text-slate-400 font-sans">m³</span>
          </div>
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
        </div>

        <div className="bg-[#0B1120] border border-[#17233D] p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Concrete Work Cost
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            ₹{Math.round(totalCost).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Pill Search Input matching screenshot */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by category, element label or ID..."
          className="w-full bg-[#080D1A] border border-[#162238] rounded-full pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Table Container matching screenshot rounded pill row style */}
      <div className="bg-[#080D1A] border border-[#162238] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#162238] text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-[#090F1E]">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">CATEGORY</th>
                <th className="py-4 px-6">ELEMENT / DIMENSIONS</th>
                <th className="py-4 px-6 text-center">RATE (₹)</th>
                <th className="py-4 px-6 text-center">CONCRETE (M³)</th>
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

                    {/* Category Pill Tag matching screenshot */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#111C33] border border-[#1C2C4E] text-blue-300 font-sans">
                        {getCategoryBadgeLabel(item.category)}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-sans">
                      <div className="font-bold text-white text-sm">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.dimensionsText}</div>
                    </td>

                    <td className="py-4 px-6 text-center text-slate-300">
                      ₹{item.ratePerM3} <span className="text-[10px] text-slate-500 font-sans">/ m³</span>
                    </td>

                    {/* Concrete Work Required in m3 */}
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-cyan-400 text-sm">{item.volumeM3.toFixed(2)}</span>
                      <span className="text-[11px] text-slate-400 font-sans ml-1">m³</span>
                    </td>

                    {/* Total Cost in emerald green matching screenshot */}
                    <td className="py-4 px-6 text-center font-bold text-emerald-400 text-sm">
                      ₹{Math.round(item.volumeM3 * item.ratePerM3).toLocaleString('en-IN')}
                    </td>

                    {/* Actions matching screenshot */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setCategory(item.category);
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

      {/* Modal: Add / Edit Structural Work */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0A0F1D] border border-[#1A2640] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1A2640] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? 'Edit Structural Work' : 'Add Structural Concrete Work'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculate required concrete in m³ for building elements.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              {/* Category selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Structural Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StructuralType)}
                  className="w-full px-3.5 py-2.5 bg-[#0F172B] border border-[#1C2C4E] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                >
                  <option value="SLAB">Slab / Deck</option>
                  <option value="COLUMN">Column</option>
                  <option value="BEAM">Beam (Plinth / Roof)</option>
                  <option value="RCC_WALL">RCC / Shear / Retaining Wall</option>
                  <option value="STAIRS">Stairs & Steps</option>
                  <option value="FOOTING">Footing / Foundation</option>
                </select>
              </div>

              {/* Label */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Element Label / Location</label>
                <input
                  type="text"
                  placeholder="e.g. 1st Floor Slab, Podium Columns"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0F172B] border border-[#1C2C4E] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* Dynamic Dimension Inputs */}
              {category === 'SLAB' && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-[#070B16] rounded-xl border border-[#17243F]">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={slabLength}
                      onChange={(e) => setSlabLength(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Width (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={slabWidth}
                      onChange={(e) => setSlabWidth(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Thickness (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={slabThickMm}
                      onChange={(e) => setSlabThickMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-cyan-400 font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {category === 'COLUMN' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#070B16] rounded-xl border border-[#17243F]">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">No. of Columns</label>
                    <input
                      type="number"
                      value={colCount}
                      onChange={(e) => setColCount(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Height (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={colHeightM}
                      onChange={(e) => setColHeightM(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Length (mm)</label>
                    <input
                      type="number"
                      step="25"
                      value={colLengthMm}
                      onChange={(e) => setColLengthMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Width (mm)</label>
                    <input
                      type="number"
                      step="25"
                      value={colWidthMm}
                      onChange={(e) => setColWidthMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {category === 'BEAM' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#070B16] rounded-xl border border-[#17243F]">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">No. of Beams</label>
                    <input
                      type="number"
                      value={beamCount}
                      onChange={(e) => setBeamCount(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={beamLengthM}
                      onChange={(e) => setBeamLengthM(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Width (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={beamWidthMm}
                      onChange={(e) => setBeamWidthMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Depth (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={beamDepthMm}
                      onChange={(e) => setBeamDepthMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {category === 'RCC_WALL' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#070B16] rounded-xl border border-[#17243F]">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">No. of Walls</label>
                    <input
                      type="number"
                      value={wallCount}
                      onChange={(e) => setWallCount(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wallLengthM}
                      onChange={(e) => setWallLengthM(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Height (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wallHeightM}
                      onChange={(e) => setWallHeightM(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Thickness (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={wallThickMm}
                      onChange={(e) => setWallThickMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {category === 'STAIRS' && (
                <div className="space-y-3 p-3 bg-[#070B16] rounded-xl border border-[#17243F]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Flights</label>
                      <input
                        type="number"
                        value={flightsCount}
                        onChange={(e) => setFlightsCount(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Stair Width (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={stairWidthM}
                        onChange={(e) => setStairWidthM(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Steps</label>
                      <input
                        type="number"
                        value={numberOfSteps}
                        onChange={(e) => setNumberOfSteps(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Tread (mm)</label>
                      <input
                        type="number"
                        step="10"
                        value={stepTreadMm}
                        onChange={(e) => setStepTreadMm(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Riser (mm)</label>
                      <input
                        type="number"
                        step="10"
                        value={stepRiserMm}
                        onChange={(e) => setStepRiserMm(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Waist Slab Thk (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={waistSlabThickMm}
                      onChange={(e) => setWaistSlabThickMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {category === 'FOOTING' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#070B16] rounded-xl border border-[#17243F]">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">No. of Footings</label>
                    <input
                      type="number"
                      value={footingCount}
                      onChange={(e) => setFootingCount(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Depth (mm)</label>
                    <input
                      type="number"
                      step="25"
                      value={footingDepthMm}
                      onChange={(e) => setFootingDepthMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={footingLengthM}
                      onChange={(e) => setFootingLengthM(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Width (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={footingWidthM}
                      onChange={(e) => setFootingWidthM(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Rate per m3 */}
              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Concrete Rate (₹ / m³)</label>
                  <input
                    type="number"
                    value={ratePerM3}
                    onChange={(e) => setRatePerM3(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#0F172B] border border-[#1C2C4E] rounded-xl text-white font-mono"
                  />
                </div>
                <div className="p-3 bg-[#070B16] rounded-xl border border-[#17243F] text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Calculated Volume</span>
                  <span className="text-base font-extrabold text-cyan-400 font-mono">
                    {computedModalVolume.toFixed(2)} m³
                  </span>
                </div>
              </div>

              {/* Actions */}
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer"
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
