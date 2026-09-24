import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Truck,
  Layers,
  Box,
  Plus,
  Trash2,
  RefreshCw,
  Building,
  CheckCircle2
} from 'lucide-react';

type StructuralType = 'SLAB' | 'COLUMN' | 'BEAM' | 'RCC_WALL' | 'STAIRS' | 'FOOTING';

interface ElementItem {
  id: string;
  type: StructuralType;
  label: string;
  dimensionsText: string;
  volumeM3: number;
}

export const BuildingCalculatorModule: React.FC = () => {
  const [selectedType, setSelectedType] = useState<StructuralType>('SLAB');
  const [elementName, setElementName] = useState('Ground Floor Section');
  const [elementsList, setElementsList] = useState<ElementItem[]>([]);

  // RMC Transit Mixer Capacity & Wastage Parameters
  const [mixerCapacityM3, setMixerCapacityM3] = useState<number>(7.0); // Standard 7 m3 transit drum
  const [wastagePercent, setWastagePercent] = useState<number>(3.0); // 3% pumping & line wastage

  // --- 1. SLAB PARAMETERS ---
  const [slabLength, setSlabLength] = useState<number>(15.0);
  const [slabWidth, setSlabWidth] = useState<number>(10.0);
  const [slabThickMm, setSlabThickMm] = useState<number>(150); // 150 mm

  // --- 2. COLUMN PARAMETERS ---
  const [colCount, setColCount] = useState<number>(12);
  const [colLengthMm, setColLengthMm] = useState<number>(300); // 300 mm
  const [colWidthMm, setColWidthMm] = useState<number>(600); // 600 mm
  const [colHeightM, setColHeightM] = useState<number>(3.2); // 3.2 m

  // --- 3. BEAM PARAMETERS ---
  const [beamCount, setBeamCount] = useState<number>(8);
  const [beamLengthM, setBeamLengthM] = useState<number>(6.0);
  const [beamWidthMm, setBeamWidthMm] = useState<number>(230); // 230 mm
  const [beamDepthMm, setBeamDepthMm] = useState<number>(450); // 450 mm

  // --- 4. RCC WALL (Shear Wall / Retaining Wall / Lift Core) ---
  const [wallCount, setWallCount] = useState<number>(2);
  const [wallLengthM, setWallLengthM] = useState<number>(8.0);
  const [wallHeightM, setWallHeightM] = useState<number>(3.2);
  const [wallThickMm, setWallThickMm] = useState<number>(200); // 200 mm

  // --- 5. STAIRCASE STEPS & WAIST SLAB ---
  const [flightsCount, setFlightsCount] = useState<number>(1);
  const [stairWidthM, setStairWidthM] = useState<number>(1.2);
  const [stepTreadMm, setStepTreadMm] = useState<number>(250); // 250 mm
  const [stepRiserMm, setStepRiserMm] = useState<number>(150); // 150 mm
  const [numberOfSteps, setNumberOfSteps] = useState<number>(18);
  const [waistSlabThickMm, setWaistSlabThickMm] = useState<number>(150);

  // --- 6. FOOTING PARAMETERS ---
  const [footingCount, setFootingCount] = useState<number>(12);
  const [footingLengthM, setFootingLengthM] = useState<number>(2.0);
  const [footingWidthM, setFootingWidthM] = useState<number>(2.0);
  const [footingDepthMm, setFootingDepthMm] = useState<number>(500); // 500 mm

  // --- CURRENT LIVE PREVIEW VOLUME COMPUTATION ---
  const currentUnitVolume = useMemo(() => {
    switch (selectedType) {
      case 'SLAB':
        return slabLength * slabWidth * (slabThickMm / 1000);
      case 'COLUMN':
        return colCount * (colLengthMm / 1000) * (colWidthMm / 1000) * colHeightM;
      case 'BEAM':
        return beamCount * beamLengthM * (beamWidthMm / 1000) * (beamDepthMm / 1000);
      case 'RCC_WALL':
        return wallCount * wallLengthM * wallHeightM * (wallThickMm / 1000);
      case 'STAIRS': {
        // Steps triangle volume = 0.5 * Tread * Riser * Width * Number of steps
        const singleStepVol = 0.5 * (stepTreadMm / 1000) * (stepRiserMm / 1000) * stairWidthM;
        const totalStepsVol = singleStepVol * numberOfSteps;
        // Waist slab inclined length sqrt(Tread^2 + Riser^2) * numberOfSteps
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
    selectedType,
    slabLength, slabWidth, slabThickMm,
    colCount, colLengthMm, colWidthMm, colHeightM,
    beamCount, beamLengthM, beamWidthMm, beamDepthMm,
    wallCount, wallLengthM, wallHeightM, wallThickMm,
    flightsCount, stairWidthM, stepTreadMm, stepRiserMm, numberOfSteps, waistSlabThickMm,
    footingCount, footingLengthM, footingWidthM, footingDepthMm
  ]);

  const handleAddElement = () => {
    let dims = '';
    if (selectedType === 'SLAB') dims = `${slabLength}m × ${slabWidth}m × ${slabThickMm}mm`;
    else if (selectedType === 'COLUMN') dims = `${colCount} Nos (${colLengthMm}×${colWidthMm}mm, H: ${colHeightM}m)`;
    else if (selectedType === 'BEAM') dims = `${beamCount} Nos (${beamLengthM}m × ${beamWidthMm}×${beamDepthMm}mm)`;
    else if (selectedType === 'RCC_WALL') dims = `${wallCount} Nos (${wallLengthM}m L × ${wallHeightM}m H × ${wallThickMm}mm Thk)`;
    else if (selectedType === 'STAIRS') dims = `${flightsCount} Flight (${numberOfSteps} Steps, W: ${stairWidthM}m, Waist: ${waistSlabThickMm}mm)`;
    else if (selectedType === 'FOOTING') dims = `${footingCount} Nos (${footingLengthM}m × ${footingWidthM}m × ${footingDepthMm}mm)`;

    const newItem: ElementItem = {
      id: `elem-${Date.now()}`,
      type: selectedType,
      label: elementName.trim() || `${selectedType} Block`,
      dimensionsText: dims,
      volumeM3: Number(currentUnitVolume.toFixed(3))
    };

    setElementsList((prev) => [newItem, ...prev]);
  };

  // --- TOTAL SUMS ACROSS ALL ADDED STRUCTURAL MEMBERS ---
  const totalWetVolume = useMemo(() => {
    return elementsList.reduce((acc, curr) => acc + curr.volumeM3, 0);
  }, [elementsList]);

  // Wastage applied total concrete
  const totalVolumeWithWastage = useMemo(() => {
    return totalWetVolume * (1 + wastagePercent / 100);
  }, [totalWetVolume, wastagePercent]);

  // RMC Transit Mixer (TM) Vehicle Count
  const rmcVehiclesRequired = useMemo(() => {
    if (mixerCapacityM3 <= 0 || totalVolumeWithWastage <= 0) return 0;
    return Math.ceil(totalVolumeWithWastage / mixerCapacityM3);
  }, [totalVolumeWithWastage, mixerCapacityM3]);

  // Nominal standard dry volume factor: 1.54
  const dryVol = totalVolumeWithWastage * 1.54;
  // Estimate for Standard M20/M25: approx 8 bags/m3 wet
  const estCementBags = Math.round(totalVolumeWithWastage * 8.2);
  const estSandM3 = Number((totalVolumeWithWastage * 0.43).toFixed(2));
  const estAggregateM3 = Number((totalVolumeWithWastage * 0.86).toFixed(2));

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-base mb-1">
            <Calculator className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Building Concrete & RMC Volume Calculator
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Estimate accurate wet concrete volumes ($m^3$), RMC transit mixer loads, and dry material requirements.
          </p>
        </div>

        {/* Total Quick Ticker */}
        <div className="flex items-center gap-3 bg-[#0B1220] border border-[#1E293B] px-4 py-2.5 rounded-2xl">
          <Truck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">RMC Vehicles</div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {rmcVehiclesRequired} Loads <span className="text-xs text-slate-400 font-normal">(@ {mixerCapacityM3}m³)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structural Element Selection Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0B1220] border border-[#1E293B] overflow-x-auto scrollbar-thin">
        {(
          [
            { id: 'SLAB', label: '1. Slabs & Decks', icon: Layers },
            { id: 'COLUMN', label: '2. Columns', icon: Box },
            { id: 'BEAM', label: '3. Plinth & Roof Beams', icon: Building },
            { id: 'RCC_WALL', label: '4. RCC / Shear Wall', icon: Building },
            { id: 'STAIRS', label: '5. Steps & Stairs', icon: Layers },
            { id: 'FOOTING', label: '6. Footings & Raft', icon: Box }
          ] as { id: StructuralType; label: string; icon: any }[]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                  : 'bg-[#0e1628] text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Parameters Input Form */}
        <div className="lg:col-span-5 bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-2 text-cyan-400">
              <Calculator className="w-5 h-5" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {selectedType.replace('_', ' ')} Dimensions
              </h2>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
              {currentUnitVolume.toFixed(2)} m³
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5">Member / Location Label</label>
              <input
                type="text"
                value={elementName}
                onChange={(e) => setElementName(e.target.value)}
                placeholder="e.g. Ground Floor Slab / Lift Core Wall"
                className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            {/* --- SLAB FIELDS --- */}
            {selectedType === 'SLAB' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={slabLength}
                      onChange={(e) => setSlabLength(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Width (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={slabWidth}
                      onChange={(e) => setSlabWidth(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Thickness (mm)</label>
                  <input
                    type="number"
                    step="10"
                    value={slabThickMm}
                    onChange={(e) => setSlabThickMm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-cyan-400 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Standard residential slab: 125mm - 175mm</span>
                </div>
              </>
            )}

            {/* --- COLUMN FIELDS --- */}
            {selectedType === 'COLUMN' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">No. of Columns</label>
                    <input
                      type="number"
                      value={colCount}
                      onChange={(e) => setColCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Height (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={colHeightM}
                      onChange={(e) => setColHeightM(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Column Length (mm)</label>
                    <input
                      type="number"
                      step="25"
                      value={colLengthMm}
                      onChange={(e) => setColLengthMm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Column Width (mm)</label>
                    <input
                      type="number"
                      step="25"
                      value={colWidthMm}
                      onChange={(e) => setColWidthMm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* --- BEAM FIELDS --- */}
            {selectedType === 'BEAM' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">No. of Beams</label>
                    <input
                      type="number"
                      value={beamCount}
                      onChange={(e) => setBeamCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={beamLengthM}
                      onChange={(e) => setBeamLengthM(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Beam Width (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={beamWidthMm}
                      onChange={(e) => setBeamWidthMm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Beam Depth (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={beamDepthMm}
                      onChange={(e) => setBeamDepthMm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* --- RCC WALL FIELDS --- */}
            {selectedType === 'RCC_WALL' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">No. of Walls</label>
                    <input
                      type="number"
                      value={wallCount}
                      onChange={(e) => setWallCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wallLengthM}
                      onChange={(e) => setWallLengthM(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Height (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wallHeightM}
                      onChange={(e) => setWallHeightM(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Thickness (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={wallThickMm}
                      onChange={(e) => setWallThickMm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* --- STAIRCASE & STEPS FIELDS --- */}
            {selectedType === 'STAIRS' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">No. of Flights</label>
                    <input
                      type="number"
                      value={flightsCount}
                      onChange={(e) => setFlightsCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Stair Width (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={stairWidthM}
                      onChange={(e) => setStairWidthM(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">No. of Steps</label>
                    <input
                      type="number"
                      value={numberOfSteps}
                      onChange={(e) => setNumberOfSteps(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Tread (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={stepTreadMm}
                      onChange={(e) => setStepTreadMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Riser (mm)</label>
                    <input
                      type="number"
                      step="10"
                      value={stepRiserMm}
                      onChange={(e) => setStepRiserMm(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Waist Slab Thickness (mm)</label>
                  <input
                    type="number"
                    step="10"
                    value={waistSlabThickMm}
                    onChange={(e) => setWaistSlabThickMm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                  />
                </div>
              </>
            )}

            {/* --- FOOTING FIELDS --- */}
            {selectedType === 'FOOTING' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">No. of Footings</label>
                    <input
                      type="number"
                      value={footingCount}
                      onChange={(e) => setFootingCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Depth / Thk (mm)</label>
                    <input
                      type="number"
                      step="25"
                      value={footingDepthMm}
                      onChange={(e) => setFootingDepthMm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={footingLengthM}
                      onChange={(e) => setFootingLengthM(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Width (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={footingWidthM}
                      onChange={(e) => setFootingWidthM(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleAddElement}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 transition-all uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Total Building Estimate</span>
            </button>
          </div>
        </div>

        {/* Right Side: Aggregate RMC & Materials Bill */}
        <div className="lg:col-span-7 space-y-6">
          {/* RMC Vehicle Delivery Planner Container */}
          <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2 text-white">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-black uppercase tracking-wider">
                  RMC Vehicle & Pumping Requirement
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Mixer Capacity:</span>
                <select
                  value={mixerCapacityM3}
                  onChange={(e) => setMixerCapacityM3(Number(e.target.value))}
                  className="px-2.5 py-1 bg-[#121927] border border-[#1E293B] rounded-lg text-emerald-400 font-mono font-bold cursor-pointer"
                >
                  <option value={6}>6.0 m³ Drum</option>
                  <option value={7}>7.0 m³ Standard</option>
                  <option value={8}>8.0 m³ Heavy</option>
                  <option value={9}>9.0 m³ High Cap</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Total Wet Net Volume */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Net Structural Volume
                </span>
                <div className="text-3xl font-black text-white font-mono mt-1.5">
                  {totalWetVolume.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-1 block">m³ (Cubic Meters)</span>
              </div>

              {/* Card 2: Total Volume with Wastage */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                    Order Volume (+{wastagePercent}%)
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={wastagePercent}
                    onChange={(e) => setWastagePercent(Math.max(0, Number(e.target.value)))}
                    className="w-12 text-right bg-[#121927] border border-[#1E293B] rounded px-1 text-[10px] text-cyan-300 font-mono"
                    title="Pump & Line Wastage %"
                  />
                </div>
                <div className="text-3xl font-black text-cyan-300 font-mono mt-1.5">
                  {totalVolumeWithWastage.toFixed(2)}
                </div>
                <span className="text-[11px] text-cyan-400/80 font-mono mt-1 block">Total RMC Order (m³)</span>
              </div>

              {/* Card 3: Vehicles Required */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-emerald-500/40">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Transit Mixers (TM)
                </span>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1.5">
                  {rmcVehiclesRequired}
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-1 block">Vehicles to Dispatch</span>
              </div>
            </div>

            {/* Dry Material Equivalence Breakdown */}
            <div className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Site-Batch Dry Material Equivalent (M20/M25 Standard)
              </span>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-[#0d1424] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cement (50kg)</span>
                  <span className="text-lg font-mono font-bold text-amber-400">{estCementBags} Bags</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1424] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sand / M-Sand</span>
                  <span className="text-lg font-mono font-bold text-slate-200">{estSandM3} m³</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d1424] border border-[#1E293B]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Aggregate 20mm</span>
                  <span className="text-lg font-mono font-bold text-slate-200">{estAggregateM3} m³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Added Elements Table */}
          <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Structural Members Schedule
                </h2>
                <span className="text-xs text-slate-400">{elementsList.length} items logged</span>
              </div>
              {elementsList.length > 0 && (
                <button
                  onClick={() => setElementsList([])}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80">
                    <th className="py-3 px-3">ELEMENT / MEMBER</th>
                    <th className="py-3 px-3">TYPE</th>
                    <th className="py-3 px-3">DIMENSIONS</th>
                    <th className="py-3 px-3 text-right">CONCRETE VOL</th>
                    <th className="py-3 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 text-slate-200 font-mono">
                  {elementsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-sans text-xs">
                        No structural elements added yet. Select an element tab and click "+ Add to Total Building Estimate".
                      </td>
                    </tr>
                  ) : (
                    elementsList.map((item) => (
                      <tr key={item.id} className="hover:bg-[#121c33]/50 transition-colors">
                        <td className="py-3 px-3 font-sans font-bold text-white">{item.label}</td>
                        <td className="py-3 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">{item.dimensionsText}</td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-black text-sm">
                          {item.volumeM3.toFixed(3)} m³
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setElementsList(elementsList.filter((e) => e.id !== item.id))}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                            title="Remove element"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

export const RCCCalculators = BuildingCalculatorModule;
export default BuildingCalculatorModule;
