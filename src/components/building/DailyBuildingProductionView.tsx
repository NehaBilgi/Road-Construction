import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { DailyBuildingProduction, ApprovalStatus } from '../../types/erp';
import {
  Activity,
  Plus,
  Building2,
  Calendar,
  Layers,
  DollarSign,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export const DailyBuildingProductionView: React.FC = () => {
  const {
    buildingProductions,
    addBuildingProduction,
    currentProject,
    currentSite
  } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [floorLevel, setFloorLevel] = useState('5th Floor (Tower A)');
  const [structuralZone, setStructuralZone] = useState('Grid C1-C6 Slab & Beams');
  const [rccConcretePouredM3, setRccConcrete] = useState<number>(30.0);
  const [steelRebarTiedKg, setSteelRebar] = useState<number>(2450.0);
  const [masonryBuiltSqM, setMasonry] = useState<number>(45.0);
  const [plasterDoneSqM, setPlaster] = useState<number>(60.0);
  const [flooringDoneSqM, setFlooring] = useState<number>(0.0);
  const [paintingDoneSqM, setPainting] = useState<number>(0.0);
  const [builtUpAreaCoveredSqFt, setBuiltUpArea] = useState<number>(1250);

  // Resource cost breakdown
  const [materialCost, setMaterialCost] = useState<number>(285000);
  const [labourCost, setLabourCost] = useState<number>(36000);
  const [tripVehicleCost, setTripVehicleCost] = useState<number>(14000);
  const [machineryCost, setMachineryCost] = useState<number>(12000);
  const [otherExpenses, setOtherExpenses] = useState<number>(5400);
  const [remarks, setRemarks] = useState('Pour completed with Schwing boom pump. 12 cube samples taken for 7/28 day testing.');

  const totalDailyCost =
    Number(materialCost) +
    Number(labourCost) +
    Number(tripVehicleCost) +
    Number(machineryCost) +
    Number(otherExpenses);

  const costPerSqFt = builtUpAreaCoveredSqFt > 0 ? totalDailyCost / builtUpAreaCoveredSqFt : 0;
  const costPerM3Concrete = rccConcretePouredM3 > 0 ? totalDailyCost / rccConcretePouredM3 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBuildingProduction({
      date,
      projectId: currentProject?.id || 'proj-bldg-1',
      siteId: currentSite?.id || 'site-bldg-1',
      floorLevel,
      structuralZone,
      rccConcretePouredM3: Number(rccConcretePouredM3),
      steelRebarTiedKg: Number(steelRebarTiedKg),
      masonryBuiltSqM: Number(masonryBuiltSqM),
      plasterDoneSqM: Number(plasterDoneSqM),
      flooringDoneSqM: Number(flooringDoneSqM),
      paintingDoneSqM: Number(paintingDoneSqM),
      builtUpAreaCoveredSqFt: Number(builtUpAreaCoveredSqFt),
      materialCost: Number(materialCost),
      labourCost: Number(labourCost),
      tripVehicleCost: Number(tripVehicleCost),
      machineryCost: Number(machineryCost),
      otherExpenses: Number(otherExpenses),
      totalDailyCost,
      costPerSqFt,
      costPerM3Concrete,
      remarks,
      approvalStatus: 'APPROVED' as ApprovalStatus
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              BUILDING DAILY PRODUCTION
            </span>
            <span className="text-xs text-slate-400">RCC, Masonry, Finishing & Cost / sq.ft</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Daily Building Production & Floor Output
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracks structural concrete pours (m³), rebar (kg), masonry (m²), and computes Cost/sq.ft and Cost/m³ concrete.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Log Daily Building Output
        </button>
      </div>

      {/* RECENT ENTRIES TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Verified Building Production Records ({buildingProductions.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Date & Floor</th>
                <th className="py-3 px-3">Structural Zone</th>
                <th className="py-3 px-3">RCC & Rebar Output</th>
                <th className="py-3 px-3">Finishing Work</th>
                <th className="py-3 px-3">Total Daily Cost</th>
                <th className="py-3 px-3">Cost / sq.ft</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {buildingProductions.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-white block">{prod.date}</span>
                    <span className="text-[10px] text-cyan-400">{prod.floorLevel}</span>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-200">
                    {prod.structuralZone}
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-bold text-white block">{prod.rccConcretePouredM3} m³ Concrete</span>
                    <span className="text-[10px] text-slate-400">{prod.steelRebarTiedKg} kg Rebar</span>
                  </td>

                  <td className="py-3.5 px-3 text-[11px] text-slate-300">
                    <div>Masonry: {prod.masonryBuiltSqM} m²</div>
                    <div>Plaster: {prod.plasterDoneSqM} m²</div>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-amber-400">
                    ₹{prod.totalDailyCost.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-extrabold text-emerald-400">
                    ₹{prod.costPerSqFt.toFixed(0)} / sq.ft
                    <span className="text-[9px] text-slate-500 block">₹{prod.costPerM3Concrete.toFixed(0)} / m³ RCC</span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {prod.approvalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-400" />
                Log Daily Building Output & Cost
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Floor Level *</label>
                  <input
                    type="text"
                    required
                    value={floorLevel}
                    onChange={(e) => setFloorLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Structural Zone / Activity *</label>
                <input
                  type="text"
                  required
                  value={structuralZone}
                  onChange={(e) => setStructuralZone(e.target.value)}
                  placeholder="e.g. Grid C1-C6 Slab & Beams Casting"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">RCC Concrete (m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rccConcretePouredM3}
                    onChange={(e) => setRccConcrete(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-cyan-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Steel Rebar (kg)</label>
                  <input
                    type="number"
                    value={steelRebarTiedKg}
                    onChange={(e) => setSteelRebar(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-cyan-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Area Covered (sq.ft)</label>
                  <input
                    type="number"
                    value={builtUpAreaCoveredSqFt}
                    onChange={(e) => setBuiltUpArea(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {/* Resource Cost Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Resource Cost Breakdown (₹)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Material (₹)</label>
                    <input
                      type="number"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Labour (₹)</label>
                    <input
                      type="number"
                      value={labourCost}
                      onChange={(e) => setLabourCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">RMC Trips (₹)</label>
                    <input
                      type="number"
                      value={tripVehicleCost}
                      onChange={(e) => setTripVehicleCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Machinery / Pump (₹)</label>
                    <input
                      type="number"
                      value={machineryCost}
                      onChange={(e) => setMachineryCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Other Costs (₹)</label>
                    <input
                      type="number"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between font-mono text-xs border-t border-slate-800/80">
                  <span className="text-slate-400">Total Cost / sq.ft:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    ₹{totalDailyCost.toLocaleString()} (₹{costPerSqFt.toFixed(0)}/sq.ft)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Daily Building Output
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
