import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Truck
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

const STORAGE_RCC_ELEMENTS_KEY = 'CONSTRUCTION_PRO_RCC_CALCULATOR_ELEMENTS_V2';

const INITIAL_ELEMENTS: ConcreteItem[] = [
  {
    id: 'RCC-1001',
    category: 'SLAB',
    label: 'Ground Floor Slab',
    dimensionsText: '15.00m × 10.00m × 150mm (49.2ft × 32.8ft × 6.0in)',
    volumeM3: 22.5,
    volumeCft: 794.58,
    ratePerM3: 4500
  },
  {
    id: 'RCC-1002',
    category: 'COLUMN',
    label: 'Plinth Columns (12 Nos)',
    dimensionsText: '12 Nos (300×600mm, H: 3.2m / 12×24in, H: 10.5ft)',
    volumeM3: 6.912,
    volumeCft: 244.1,
    ratePerM3: 4800
  },
  {
    id: 'RCC-1003',
    category: 'BEAM',
    label: 'Main Plinth Beams (8 Nos)',
    dimensionsText: '8 Nos (6.0m × 230×450mm / 19.7ft × 9×18in)',
    volumeM3: 3.974,
    volumeCft: 140.34,
    ratePerM3: 4600
  },
  {
    id: 'RCC-1004',
    category: 'RCC_WALL',
    label: 'Lift Core Shear Wall',
    dimensionsText: '2 Nos (8.0m L × 3.2m H × 200mm / 26.2ft × 10.5ft × 8.0in)',
    volumeM3: 10.24,
    volumeCft: 361.62,
    ratePerM3: 5000
  },
  {
    id: 'RCC-1005',
    category: 'STAIRS',
    label: 'Main Staircase Flight',
    dimensionsText: '1 Flight (18 Steps, W: 1.2m / 3.9ft, Waist: 150mm / 5.9in)',
    volumeM3: 1.85,
    volumeCft: 65.33,
    ratePerM3: 4700
  },
  {
    id: 'RCC-1006',
    category: 'FOOTING',
    label: 'Isolated Footings (12 Nos)',
    dimensionsText: '12 Nos (2.0m × 2.0m × 500mm / 6.6ft × 6.6ft × 19.7in)',
    volumeM3: 24.0,
    volumeCft: 847.55,
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

  // Modal Input Unit Mode
  const [unitMode, setUnitMode] = useState<UnitSystem>('METRIC');

  // Modal Generic States
  const [category, setCategory] = useState<StructuralType>('SLAB');
  const [label, setLabel] = useState('');
  const [ratePerM3, setRatePerM3] = useState<number | ''>(4500);

  // --- Slab Inputs ---
  const [slabLen, setSlabLen] = useState<number>(15);
  const [slabWid, setSlabWid] = useState<number>(10);
  const [slabThk, setSlabThk] = useState<number>(150); // mm in metric, inches in imperial

  // --- Column Inputs ---
  const [colCount, setColCount] = useState<number>(12);
  const [colDim1, setColDim1] = useState<number>(300); // mm or inches
  const [colDim2, setColDim2] = useState<number>(600); // mm or inches
  const [colHgt, setColHgt] = useState<number>(3.2); // m or ft

  // --- Beam Inputs ---
  const [beamCount, setBeamCount] = useState<number>(8);
  const [beamLen, setBeamLen] = useState<number>(6); // m or ft
  const [beamWid, setBeamWid] = useState<number>(230); // mm or inches
  const [beamDep, setBeamDep] = useState<number>(450); // mm or inches

  // --- RCC Wall Inputs ---
  const [wallCount, setWallCount] = useState<number>(2);
  const [wallLen, setWallLen] = useState<number>(8); // m or ft
  const [wallHgt, setWallHgt] = useState<number>(3.2); // m or ft
  const [wallThk, setWallThk] = useState<number>(200); // mm or inches

  // --- Stairs Inputs ---
  const [flightsCount, setFlightsCount] = useState<number>(1);
  const [stairWid, setStairWid] = useState<number>(1.2); // m or ft
  const [stepTread, setStepTread] = useState<number>(250); // mm or inches
  const [stepRiser, setStepRiser] = useState<number>(150); // mm or inches
  const [numberOfSteps, setNumberOfSteps] = useState<number>(18);
  const [waistSlabThk, setWaistSlabThk] = useState<number>(150); // mm or inches

  // --- Footing Inputs ---
  const [footingCount, setFootingCount] = useState<number>(12);
  const [footingLen, setFootingLen] = useState<number>(2); // m or ft
  const [footingWid, setFootingWid] = useState<number>(2); // m or ft
  const [footingDep, setFootingDep] = useState<number>(500); // mm or inches

  useEffect(() => {
    localStorage.setItem(STORAGE_RCC_ELEMENTS_KEY, JSON.stringify(items));
  }, [items]);

  // Convert inputs to meters when calculating volume
  const computedVolumes = useMemo(() => {
    const isImp = unitMode === 'IMPERIAL';
    const toMeterFromLarge = (val: number) => (isImp ? val * 0.3048 : val);
    const toMeterFromSmall = (val: number) => (isImp ? val * 0.0254 : val / 1000);

    let m3 = 0;

    switch (category) {
      case 'SLAB': {
        const l = toMeterFromLarge(slabLen);
        const w = toMeterFromLarge(slabWid);
        const t = toMeterFromSmall(slabThk);
        m3 = l * w * t;
        break;
      }
      case 'COLUMN': {
        const l = toMeterFromSmall(colDim1);
        const w = toMeterFromSmall(colDim2);
        const h = toMeterFromLarge(colHgt);
        m3 = colCount * l * w * h;
        break;
      }
      case 'BEAM': {
        const l = toMeterFromLarge(beamLen);
        const w = toMeterFromSmall(beamWid);
        const d = toMeterFromSmall(beamDep);
        m3 = beamCount * l * w * d;
        break;
      }
      case 'RCC_WALL': {
        const l = toMeterFromLarge(wallLen);
        const h = toMeterFromLarge(wallHgt);
        const t = toMeterFromSmall(wallThk);
        m3 = wallCount * l * h * t;
        break;
      }
      case 'STAIRS': {
        const w = toMeterFromLarge(stairWid);
        const tr = toMeterFromSmall(stepTread);
        const r = toMeterFromSmall(stepRiser);
        const wt = toMeterFromSmall(waistSlabThk);
        const singleStep = 0.5 * tr * r * w;
        const stepsVol = singleStep * numberOfSteps;
        const slopeLen = Math.sqrt(Math.pow(tr, 2) + Math.pow(r, 2));
        const waistVol = slopeLen * numberOfSteps * w * wt;
        m3 = flightsCount * (stepsVol + waistVol);
        break;
      }
      case 'FOOTING': {
        const l = toMeterFromLarge(footingLen);
        const w = toMeterFromLarge(footingWid);
        const d = toMeterFromSmall(footingDep);
        m3 = footingCount * l * w * d;
        break;
      }
    }

    const cft = m3 * 35.3147;
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
      // Metric to Imperial
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
      // Imperial to Metric
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
    return totalWetM3 * 35.3147;
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
        return 'Slab & Deck';
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

      {/* RMC Vehicle Delivery Planner Banner */}
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
            ≈ {(totalWithWastage * 35.3147).toFixed(1)} CFT
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
            Average Rate Applied
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
                        {(item.volumeCft || item.volumeM3 * 35.3147).toFixed(1)} CFT
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

      {/* Modal: Add / Edit Structural Work with Meters & Feet Units Switcher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0A0F1D] border border-[#1A2640] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
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

              {/* Structural Category selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Structural Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StructuralType)}
                  className="w-full px-3.5 py-2.5 bg-[#0F172B] border border-[#1C2C4E] rounded-xl text-white outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="SLAB">Slab / Deck</option>
                  <option value="COLUMN">Column</option>
                  <option value="BEAM">Beam (Plinth / Roof)</option>
                  <option value="RCC_WALL">RCC / Shear / Retaining Wall</option>
                  <option value="STAIRS">Stairs & Steps</option>
                  <option value="FOOTING">Footing / Foundation</option>
                </select>
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
                      step="0.01"
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
                      step="0.01"
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
                      step="0.1"
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
                      step="0.01"
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
                      step="0.1"
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
                      step="0.1"
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
                      step="0.01"
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
                      step="0.1"
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
                      step="0.1"
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
                      step="0.01"
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
                      step="0.01"
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
                      step="0.1"
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
                        step="0.01"
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
                        step="0.1"
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
                        step="0.1"
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
                      step="0.1"
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
                      step="0.1"
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
                      step="0.01"
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
                      step="0.01"
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
