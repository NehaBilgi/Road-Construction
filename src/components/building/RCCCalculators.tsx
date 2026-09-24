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
  Footprints
} from 'lucide-react';

export type StructuralType = 'SLAB' | 'COLUMN' | 'BEAM' | 'RCC_WALL' | 'STAIRS' | 'FOOTING';
export type UnitSystem = 'METRIC' | 'IMPERIAL';

export interface ConcreteItem {
  id: string;
  category: StructuralType;
  label: string;
  dimensionsText: string;
  volumeM3: number;
  volumeCft: number;
  ratePerM3: number;
}

const STORAGE_RCC_ELEMENTS_KEY = 'CONSTRUCTION_PRO_RCC_CALCULATOR_ELEMENTS_V4';

const INITIAL_ELEMENTS: ConcreteItem[] = [
  {
    id: 'RCC-1001',
    category: 'SLAB',
    label: 'Ground Floor Slab',
    dimensionsText: '15.00m × 10.00m × 150mm',
    volumeM3: 22.50,
    volumeCft: 794.58,
    ratePerM3: 4500
  },
  {
    id: 'RCC-1002',
    category: 'FOOTING',
    label: 'Isolated Footings (12 Nos)',
    dimensionsText: '12 Nos (2.00m × 2.00m × 500mm)',
    volumeM3: 24.00,
    volumeCft: 847.55,
    ratePerM3: 4200
  },
  {
    id: 'RCC-1003',
    category: 'COLUMN',
    label: 'Plinth Columns (12 Nos)',
    dimensionsText: '12 Nos (300×600mm, H: 3.20m)',
    volumeM3: 6.912,
    volumeCft: 244.10,
    ratePerM3: 4800
  },
  {
    id: 'RCC-1004',
    category: 'BEAM',
    label: 'Main Plinth Beams (8 Nos)',
    dimensionsText: '8 Nos (6.00m × 230×450mm)',
    volumeM3: 4.968,
    volumeCft: 175.44,
    ratePerM3: 4600
  },
  {
    id: 'RCC-1005',
    category: 'RCC_WALL',
    label: 'Lift Core Shear Wall',
    dimensionsText: '2 Nos (8.00m L × 3.20m H × 200mm)',
    volumeM3: 10.24,
    volumeCft: 361.62,
    ratePerM3: 5000
  },
  {
    id: 'RCC-1006',
    category: 'STAIRS',
    label: 'Main Staircase Flight',
    dimensionsText: '1 Flight (18 Steps, W: 1.20m, Waist: 150mm)',
    volumeM3: 1.35,
    volumeCft: 47.67,
    ratePerM3: 4700
  }
];

const CATEGORIES: { id: StructuralType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
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

  // Modal Input Unit Mode
  const [unitMode, setUnitMode] = useState<UnitSystem>('METRIC');

  // Modal Generic States
  const [category, setCategory] = useState<StructuralType>('SLAB');
  const [label, setLabel] = useState('');
  const [ratePerM3, setRatePerM3] = useState<number | ''>(4500);

  // --- Slab Inputs ---
  const [slabLen, setSlabLen] = useState<number>(15);
  const [slabWid, setSlabWid] = useState<number>(10);
  const [slabThk, setSlabThk] = useState<number>(150);

  // --- Column Inputs ---
  const [colCount, setColCount] = useState<number>(12);
  const [colDim1, setColDim1] = useState<number>(300);
  const [colDim2, setColDim2] = useState<number>(600);
  const [colHgt, setColHgt] = useState<number>(3.2);

  // --- Beam Inputs ---
  const [beamCount, setBeamCount] = useState<number>(8);
  const [beamLen, setBeamLen] = useState<number>(6);
  const [beamWid, setBeamWid] = useState<number>(230);
  const [beamDep, setBeamDep] = useState<number>(450);

  // --- RCC Wall Inputs ---
  const [wallCount, setWallCount] = useState<number>(2);
  const [wallLen, setWallLen] = useState<number>(8);
  const [wallHgt, setWallHgt] = useState<number>(3.2);
  const [wallThk, setWallThk] = useState<number>(200);

  // --- Stairs Inputs ---
  const [flightsCount, setFlightsCount] = useState<number>(1);
  const [stairWid, setStairWid] = useState<number>(1.2);
  const [stepTread, setStepTread] = useState<number>(250);
  const [stepRiser, setStepRiser] = useState<number>(150);
  const [numberOfSteps, setNumberOfSteps] = useState<number>(18);
  const [waistSlabThk, setWaistSlabThk] = useState<number>(150);

  // --- Footing Inputs ---
  const [footingCount, setFootingCount] = useState<number>(12);
  const [footingLen, setFootingLen] = useState<number>(2);
  const [footingWid, setFootingWid] = useState<number>(2);
  const [footingDep, setFootingDep] = useState<number>(500);

  useEffect(() => {
    localStorage.setItem(STORAGE_RCC_ELEMENTS_KEY, JSON.stringify(items));
  }, [items]);

  const computedVolumes = useMemo(() => {
    let m3 = 0;

    if (unitMode === 'METRIC') {
      switch (category) {
        case 'SLAB': {
          m3 = slabLen * slabWid * (slabThk / 1000);
          break;
        }
        case 'COLUMN': {
          m3 = colCount * (colDim1 / 1000) * (colDim2 / 1000) * colHgt;
          break;
        }
        case 'BEAM': {
          m3 = beamCount * beamLen * (beamWid / 1000) * (beamDep / 1000);
          break;
        }
        case 'RCC_WALL': {
          m3 = wallCount * wallLen * wallHgt * (wallThk / 1000);
          break;
        }
        case 'STAIRS': {
          const trM = stepTread / 1000;
          const rM = stepRiser / 1000;
          const wtM = waistSlabThk / 1000;
          const stepsVol = 0.5 * trM * rM * stairWid * numberOfSteps;
          const waistVol = Math.sqrt(trM * trM + rM * rM) * numberOfSteps * stairWid * wtM;
          m3 = flightsCount * (stepsVol + waistVol);
          break;
        }
        case 'FOOTING': {
          m3 = footingCount * footingLen * footingWid * (footingDep / 1000);
          break;
        }
      }
    } else {
      let cftRaw = 0;
      switch (category) {
        case 'SLAB': {
          cftRaw = slabLen * slabWid * (slabThk / 12);
          break;
        }
        case 'COLUMN': {
          cftRaw = colCount * (colDim1 / 12) * (colDim2 / 12) * colHgt;
          break;
        }
        case 'BEAM': {
          cftRaw = beamCount * beamLen * (beamWid / 12) * (beamDep / 12);
          break;
        }
        case 'RCC_WALL': {
          cftRaw = wallCount * wallLen * wallHgt * (wallThk / 12);
          break;
        }
        case 'STAIRS': {
          const trFt = stepTread / 12;
          const rFt = stepRiser / 12;
          const wtFt = waistSlabThk / 12;
          const stepsVol = 0.5 * trFt * rFt * stairWid * numberOfSteps;
          const waistVol = Math.sqrt(trFt * trFt + rFt * rFt) * numberOfSteps * stairWid * wtFt;
          cftRaw = flightsCount * (stepsVol + waistVol);
          break;
        }
        case 'FOOTING': {
          cftRaw = footingCount * footingLen * footingWid * (footingDep / 12);
          break;
        }
      }
      m3 = cftRaw / 35.3146667;
    }

    const cft = m3 * 35.3146667;
    return { m3, cft };
  }, [
    category,
    unitMode,
    slabLen, slabWid, slabThk,
    colCount, colDim1, colDim2, colHgt,
    beamCount, beamLen, beamWid, beamDep,
    wallCount, wallLen, wallHgt, wallThk,
    flightsCount, stairWid, stepTread, stepRiser, numberOfSteps, waistSlabThk,
    footingCount, footingLen, footingWid, footingDep
  ]);

  const handleUnitModeSwitch = (mode: UnitSystem) => {
    if (mode === unitMode) return;
    if (mode === 'IMPERIAL') {
      setSlabLen((prev) => Number((prev * 3.28084).toFixed(2)));
      setSlabWid((prev) => Number((prev * 3.28084).toFixed(2)));
      setSlabThk((prev) => Number((prev / 25.4).toFixed(2)));

      setColDim1((prev) => Number((prev / 25.4).toFixed(2)));
      setColDim2((prev) => Number((prev / 25.4).toFixed(2)));
      setColHgt((prev) => Number((prev * 3.28084).toFixed(2)));

      setBeamLen((prev) => Number((prev * 3.28084).toFixed(2)));
      setBeamWid((prev) => Number((prev / 25.4).toFixed(2)));
      setBeamDep((prev) => Number((prev / 25.4).toFixed(2)));

      setWallLen((prev) => Number((prev * 3.28084).toFixed(2)));
      setWallHgt((prev) => Number((prev * 3.28084).toFixed(2)));
      setWallThk((prev) => Number((prev / 25.4).toFixed(2)));

      setStairWid((prev) => Number((prev * 3.28084).toFixed(2)));
      setStepTread((prev) => Number((prev / 25.4).toFixed(2)));
      setStepRiser((prev) => Number((prev / 25.4).toFixed(2)));
      setWaistSlabThk((prev) => Number((prev / 25.4).toFixed(2)));

      setFootingLen((prev) => Number((prev * 3.28084).toFixed(2)));
      setFootingWid((prev) => Number((prev * 3.28084).toFixed(2)));
      setFootingDep((prev) => Number((prev / 25.4).toFixed(2)));
    } else {
      setSlabLen((prev) => Number((prev / 3.28084).toFixed(2)));
      setSlabWid((prev) => Number((prev / 3.28084).toFixed(2)));
      setSlabThk((prev) => Number((prev * 25.4).toFixed(0)));

      setColDim1((prev) => Number((prev * 25.4).toFixed(0)));
      setColDim2((prev) => Number((prev * 25.4).toFixed(0)));
      setColHgt((prev) => Number((prev / 3.28084).toFixed(2)));

      setBeamLen((prev) => Number((prev / 3.28084).toFixed(2)));
      setBeamWid((prev) => Number((prev * 25.4).toFixed(0)));
      setBeamDep((prev) => Number((prev * 25.4).toFixed(0)));

      setWallLen((prev) => Number((prev / 3.28084).toFixed(2)));
      setWallHgt((prev) => Number((prev / 3.28084).toFixed(2)));
      setWallThk((prev) => Number((prev * 25.4).toFixed(0)));

      setStairWid((prev) => Number((prev / 3.28084).toFixed(2)));
      setStepTread((prev) => Number((prev * 25.4).toFixed(0)));
      setStepRiser((prev) => Number((prev * 25.4).toFixed(0)));
      setWaistSlabThk((prev) => Number((prev * 25.4).toFixed(0)));

      setFootingLen((prev) => Number((prev / 3.28084).toFixed(2)));
      setFootingWid((prev) => Number((prev / 3.28084).toFixed(2)));
      setFootingDep((prev) => Number((prev * 25.4).toFixed(0)));
    }
    setUnitMode(mode);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCategory('SLAB');
    setLabel('');
    setRatePerM3(4500);
    setUnitMode('METRIC');
    setSlabLen(15);
    setSlabWid(10);
    setSlabThk(150);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    const isImp = unitMode === 'IMPERIAL';
    const lUnit = isImp ? 'ft' : 'm';
    const sUnit = isImp ? 'in' : 'mm';

    let dims = '';
    if (category === 'SLAB') dims = `${slabLen}${lUnit} × ${slabWid}${lUnit} × ${slabThk}${sUnit}`;
    else if (category === 'COLUMN') dims = `${colCount} Nos (${colDim1}×${colDim2}${sUnit}, H: ${colHgt}${lUnit})`;
    else if (category === 'BEAM') dims = `${beamCount} Nos (${beamLen}${lUnit} × ${beamWid}×${beamDep}${sUnit})`;
    else if (category === 'RCC_WALL') dims = `${wallCount} Nos (${wallLen}${lUnit} L × ${wallHgt}${lUnit} H × ${wallThk}${sUnit})`;
    else if (category === 'STAIRS') dims = `${flightsCount} Flight (${numberOfSteps} Steps, W: ${stairWid}${lUnit}, Waist: ${waistSlabThk}${sUnit})`;
    else if (category === 'FOOTING') dims = `${footingCount} Nos (${footingLen}${lUnit} × ${footingWid}${lUnit} × ${footingDep}${sUnit})`;

    if (editingItem) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                category,
                label: label.trim() || `${category} Work`,
                dimensionsText: dims,
                volumeM3: Number(computedVolumes.m3.toFixed(3)),
                volumeCft: Number(computedVolumes.cft.toFixed(2)),
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
        volumeM3: Number(computedVolumes.m3.toFixed(3)),
        volumeCft: Number(computedVolumes.cft.toFixed(2)),
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

  const getCategoryBadgeLabel = (cat: StructuralType) => {
    switch (cat) {
      case 'SLAB':
        return 'Slab / Deck';
      case 'COLUMN':
        return 'Column';
      case 'BEAM':
        return 'Beam';
      case 'RCC_WALL':
        return 'RCC Wall';
      case 'STAIRS':
        return 'Stairs';
      case 'FOOTING':
        return 'Footing';
      default:
        return cat;
    }
  };

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
          placeholder="Search by category, element label or ID..."
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
                <th className="py-4 px-6">CATEGORY</th>
                <th className="py-4 px-6">ELEMENT / DIMENSIONS</th>
                <th className="py-4 px-6 text-center">RATE (₹)</th>
                <th className="py-4 px-6 text-center">VOLUME (M³ / CFT)</th>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0A0F1D] border border-[#1A2640] rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-5 max-h-[94vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1A2640] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? 'Edit Structural Work' : 'Add Structural Concrete Work'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculate required concrete in m³ and CFT for building elements.
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
              {/* Unit System Switcher Toggle */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#070B16] border border-[#17243F]">
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

              {/* In-Line Structural Categories Selector */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold">Structural Category *</label>
                <div className="flex items-center gap-1.5 p-1 bg-[#070B16] border border-[#17243F] rounded-2xl overflow-x-auto scrollbar-thin">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-[#0E1628] hover:bg-[#141F38] text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Element Label */}
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

              {/* SLAB INPUTS */}
              {category === 'SLAB' && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-[#070B16] rounded-xl border border-[#17243F]">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Length ({unitMode === 'METRIC' ? 'm' : 'ft'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={slabLen}
                      onChange={(e) => setSlabLen(Number(e.target.value))}
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
                      value={slabWid}
                      onChange={(e) => setSlabWid(Number(e.target.value))}
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
                      value={slabThk}
                      onChange={(e) => setSlabThk(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-cyan-400 font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* COLUMN INPUTS */}
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
                    <label className="block text-slate-400 font-bold mb-1">
                      Height ({unitMode === 'METRIC' ? 'm' : 'ft'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={colHgt}
                      onChange={(e) => setColHgt(Number(e.target.value))}
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
                      value={colDim1}
                      onChange={(e) => setColDim1(Number(e.target.value))}
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
                      value={colDim2}
                      onChange={(e) => setColDim2(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* BEAM INPUTS */}
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
                    <label className="block text-slate-400 font-bold mb-1">
                      Length ({unitMode === 'METRIC' ? 'm' : 'ft'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={beamLen}
                      onChange={(e) => setBeamLen(Number(e.target.value))}
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
                      value={beamWid}
                      onChange={(e) => setBeamWid(Number(e.target.value))}
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
                      value={beamDep}
                      onChange={(e) => setBeamDep(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* RCC WALL INPUTS */}
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
                    <label className="block text-slate-400 font-bold mb-1">
                      Length ({unitMode === 'METRIC' ? 'm' : 'ft'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={wallLen}
                      onChange={(e) => setWallLen(Number(e.target.value))}
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
                      value={wallHgt}
                      onChange={(e) => setWallHgt(Number(e.target.value))}
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
                      value={wallThk}
                      onChange={(e) => setWallThk(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* STAIRS INPUTS */}
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
                      <label className="block text-slate-400 font-bold mb-1">
                        Width ({unitMode === 'METRIC' ? 'm' : 'ft'})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={stairWid}
                        onChange={(e) => setStairWid(Number(e.target.value))}
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
                      <label className="block text-slate-400 font-bold mb-1">
                        Tread ({unitMode === 'METRIC' ? 'mm' : 'in'})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={stepTread}
                        onChange={(e) => setStepTread(Number(e.target.value))}
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
                        value={stepRiser}
                        onChange={(e) => setStepRiser(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">
                      Waist Slab Thk ({unitMode === 'METRIC' ? 'mm' : 'in'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={waistSlabThk}
                      onChange={(e) => setWaistSlabThk(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* FOOTING INPUTS */}
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
                    <label className="block text-slate-400 font-bold mb-1">
                      Depth ({unitMode === 'METRIC' ? 'mm' : 'in'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={footingDep}
                      onChange={(e) => setFootingDep(Number(e.target.value))}
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
                      value={footingLen}
                      onChange={(e) => setFootingLen(Number(e.target.value))}
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
                      value={footingWid}
                      onChange={(e) => setFootingWid(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#0F172B] border border-[#1C2C4E] rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Rate & Live Calculated Volume Display */}
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
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Calculated Volume
                  </span>
                  <span className="text-base font-extrabold text-cyan-400 font-mono">
                    {computedVolumes.m3.toFixed(2)} m³
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    ({computedVolumes.cft.toFixed(1)} CFT)
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
