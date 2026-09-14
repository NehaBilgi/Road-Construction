import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Calculator,
  Truck,
  TrendingUp,
  RotateCcw,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckCircle2
} from 'lucide-react';

interface LayerPreset {
  name: string;
  defaultThicknessMm: number;
  compactionFactor: number; // e.g. 1.25 for loose to compacted
  bulkDensityTonnesPerM3: number; // tonnes per m3
  standardRatePerTonneOrM3: number;
  unit: 'Tonnes' | 'm³';
}

const LAYER_PRESETS: LayerPreset[] = [
  { name: 'Selected Murum / Subgrade', defaultThicknessMm: 300, compactionFactor: 1.30, bulkDensityTonnesPerM3: 1.80, standardRatePerTonneOrM3: 420, unit: 'm³' },
  { name: 'Granular Sub-Base (GSB Grading-I)', defaultThicknessMm: 200, compactionFactor: 1.28, bulkDensityTonnesPerM3: 2.15, standardRatePerTonneOrM3: 850, unit: 'm³' },
  { name: 'Wet Mix Macadam (WMM Plant Mix)', defaultThicknessMm: 250, compactionFactor: 1.22, bulkDensityTonnesPerM3: 2.20, standardRatePerTonneOrM3: 980, unit: 'Tonnes' },
  { name: 'Dense Bituminous Macadam (DBM)', defaultThicknessMm: 100, compactionFactor: 1.15, bulkDensityTonnesPerM3: 2.42, standardRatePerTonneOrM3: 4850, unit: 'Tonnes' },
  { name: 'Bituminous Concrete (BC Wearing Course)', defaultThicknessMm: 50, compactionFactor: 1.15, bulkDensityTonnesPerM3: 2.45, standardRatePerTonneOrM3: 5400, unit: 'Tonnes' },
  { name: 'Pavement Quality Concrete (PQC / CC Road)', defaultThicknessMm: 300, compactionFactor: 1.05, bulkDensityTonnesPerM3: 2.40, standardRatePerTonneOrM3: 5200, unit: 'm³' }
];

export const RoadMaterialCalculator: React.FC = () => {
  const { currentProject } = useERP();

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(2); // WMM default
  const [lengthMeters, setLengthMeters] = useState<number>(1000); // 1 km
  const [widthMeters, setWidthMeters] = useState<number>(10.5); // 2-lane with shoulder
  const [thicknessMm, setThicknessMm] = useState<number>(250);
  const [customCompactionFactor, setCustomCompactionFactor] = useState<number>(1.22);
  const [customDensity, setCustomDensity] = useState<number>(2.20);
  const [wastagePercent, setWastagePercent] = useState<number>(3.0);
  const [vehicleCapacityTonnes, setVehicleCapacityTonnes] = useState<number>(20.0); // standard 10-wheeler tipper
  const [ratePerUnit, setRatePerUnit] = useState<number>(980);

  const activePreset = LAYER_PRESETS[selectedPresetIndex];

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const preset = LAYER_PRESETS[index];
    setThicknessMm(preset.defaultThicknessMm);
    setCustomCompactionFactor(preset.compactionFactor);
    setCustomDensity(preset.bulkDensityTonnesPerM3);
    setRatePerUnit(preset.standardRatePerTonneOrM3);
  };

  // Calculations
  const thicknessMeters = thicknessMm / 1000;
  // Compacted volume in m3
  const compactedVolumeM3 = lengthMeters * widthMeters * thicknessMeters;
  // Loose volume with compaction factor and wastage
  const looseVolumeM3 = compactedVolumeM3 * customCompactionFactor * (1 + wastagePercent / 100);
  // Total weight in Tonnes
  const totalWeightTonnes = looseVolumeM3 * (customDensity / customCompactionFactor); // Or compacted * density * (1+wastage)
  const actualRequiredTonnes = compactedVolumeM3 * customDensity * (1 + wastagePercent / 100);

  // Trips Required
  const requiredTrips = Math.ceil(
    activePreset.unit === 'Tonnes'
      ? actualRequiredTonnes / vehicleCapacityTonnes
      : looseVolumeM3 / (vehicleCapacityTonnes / customDensity)
  );

  // Estimated Cost
  const totalEstimatedCost =
    activePreset.unit === 'Tonnes'
      ? actualRequiredTonnes * ratePerUnit
      : compactedVolumeM3 * ratePerUnit;

  const costPerMeter = lengthMeters > 0 ? totalEstimatedCost / lengthMeters : 0;
  const costPerKm = costPerMeter * 1000;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ROAD DESIGN & QUANTITY SURVEY
          </span>
          <span className="text-xs text-slate-400">Engineering Material & Tipper Trip Estimator</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Road Layer Material & Tipper Trips Calculator
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Formula: Volume = Length × Width × Thickness • Auto converts m³ → Tonnes → Tipper Trips required based on payload.
        </p>
      </div>

      {/* Preset Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {LAYER_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(idx)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedPresetIndex === idx
                ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] font-mono text-slate-500 block">Layer {idx + 1}</span>
            <span className="text-xs font-bold line-clamp-1">{preset.name}</span>
            <span className="text-[10px] text-slate-400 block mt-1">{preset.defaultThicknessMm} mm</span>
          </button>
        ))}
      </div>

      {/* 2-Col Interactive Interface: Inputs on Left, Real-Time Calculations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
            <Calculator className="h-4 w-4 text-amber-400" />
            1. Pavement Geometry & Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Road Stretch Length (Metres)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none"
                />
                <span className="px-3 py-2 bg-slate-800 rounded-xl text-slate-400 font-mono">
                  {(lengthMeters / 1000).toFixed(2)} Km
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Carriageway Width (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={widthMeters}
                  onChange={(e) => setWidthMeters(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Layer Thickness (mm)
                </label>
                <input
                  type="number"
                  value={thicknessMm}
                  onChange={(e) => setThicknessMm(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Compaction Factor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customCompactionFactor}
                  onChange={(e) => setCustomCompactionFactor(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Bulk Density (t/m³)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customDensity}
                  onChange={(e) => setCustomDensity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Wastage / Edge Allowance (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={wastagePercent}
                  onChange={(e) => setWastagePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipper Capacity (Tonnes)
                </label>
                <input
                  type="number"
                  value={vehicleCapacityTonnes}
                  onChange={(e) => setVehicleCapacityTonnes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Estimated Material Rate (₹ / {activePreset.unit})
              </label>
              <input
                type="number"
                value={ratePerUnit}
                onChange={(e) => setRatePerUnit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-emerald-400 focus:outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* OUTPUT CALCULATIONS (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
              <Truck className="h-4 w-4 text-cyan-400" />
              2. Material Requirements & Fleet Dispatch Plan
            </h3>

            {/* Big Hero Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Compacted & Loose Volume */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Compacted Design Volume
                </span>
                <div className="text-2xl font-extrabold text-white font-mono my-1">
                  {compactedVolumeM3.toFixed(1)} <span className="text-xs font-normal text-slate-400">m³</span>
                </div>
                <span className="text-xs text-slate-400 block">
                  Loose Volume: <strong className="text-slate-200">{looseVolumeM3.toFixed(1)} m³</strong>
                </span>
              </div>

              {/* Total Weight in Tonnes */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">
                  Total Required Weight
                </span>
                <div className="text-2xl font-extrabold text-amber-300 font-mono my-1">
                  {actualRequiredTonnes.toFixed(1)} <span className="text-xs font-normal text-amber-400/80">Tonnes</span>
                </div>
                <span className="text-xs text-amber-300/80 block">
                  Includes {wastagePercent}% screed/edge compaction allowance
                </span>
              </div>
            </div>

            {/* TIPPER TRIPS REQUIRED BANNER */}
            <div className="p-5 mt-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-950 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Truck className="h-4 w-4" /> Required Tipper Trips
                </span>
                <div className="text-3xl font-extrabold text-white font-mono mt-1">
                  {requiredTrips} <span className="text-sm font-normal text-cyan-300">Trips</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Based on {vehicleCapacityTonnes}T payload per 10-Tyre / Hyva vehicle
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Trip Rate Est.</span>
                <span className="text-sm font-mono font-bold text-cyan-300">₹{ratePerUnit.toLocaleString()} / unit</span>
              </div>
            </div>

            {/* Financial Estimation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Layer Cost</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  ₹{(totalEstimatedCost / 100000).toFixed(2)} Lakhs
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Cost per Metre</span>
                <span className="text-base font-extrabold text-slate-200 font-mono">
                  ₹{costPerMeter.toFixed(2)} / m
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Cost per Km</span>
                <span className="text-base font-extrabold text-amber-400 font-mono">
                  ₹{(costPerKm / 100000).toFixed(2)} Lakhs / km
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Tip: When logging actual tipper challans in the <strong>Trip Counter</strong>, cross-verify actual unloaded tonnage with this theoretical requirement to prevent road thickness deviations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
