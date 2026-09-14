import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { DailyRoadProduction, RoadLayerType, ApprovalStatus } from '../../types/erp';
import {
  Activity,
  Plus,
  Calendar,
  Layers,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Image,
  FileSpreadsheet,
  Ruler,
  Truck
} from 'lucide-react';

export const DailyRoadProductionView: React.FC = () => {
  const {
    roadProductions,
    addRoadProduction,
    currentProject,
    currentSite
  } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [chainageStart, setChainageStart] = useState<number>(124.0);
  const [chainageEnd, setChainageEnd] = useState<number>(124.6);
  const [layerType, setLayerType] = useState<RoadLayerType>('Wet Mix Macadam (WMM)');
  const [lengthMeters, setLengthMeters] = useState<number>(600);
  const [widthMeters, setWidthMeters] = useState<number>(10.5);
  const [thicknessMm, setThicknessMm] = useState<number>(250);
  const [quantity, setQuantity] = useState<number>(1575);
  const [unit, setUnit] = useState<string>('m³');

  // Resource cost breakdown inputs
  const [materialCost, setMaterialCost] = useState<number>(1420000);
  const [labourCost, setLabourCost] = useState<number>(48000);
  const [tripVehicleCost, setTripVehicleCost] = useState<number>(86400);
  const [dieselCost, setDieselCost] = useState<number>(52000);
  const [machineryCost, setMachineryCost] = useState<number>(74000);
  const [otherExpenses, setOtherExpenses] = useState<number>(15000);
  const [remarks, setRemarks] = useState('');

  // Auto calculate total cost and unit costs
  const totalDailyCost =
    Number(materialCost) +
    Number(labourCost) +
    Number(tripVehicleCost) +
    Number(dieselCost) +
    Number(machineryCost) +
    Number(otherExpenses);

  const costPerMeter = lengthMeters > 0 ? totalDailyCost / lengthMeters : 0;
  const costPerKm = costPerMeter * 1000;
  const costPerUnit = quantity > 0 ? totalDailyCost / quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRoadProduction({
      date,
      projectId: currentProject?.id || 'proj-road-1',
      siteId: currentSite?.id || 'site-road-1',
      chainageStart: Number(chainageStart),
      chainageEnd: Number(chainageEnd),
      layerType,
      lengthCompletedMeters: Number(lengthMeters),
      widthMeters: Number(widthMeters),
      thicknessMm: Number(thicknessMm),
      quantityM3OrTonnes: Number(quantity),
      unit,
      materialCost: Number(materialCost),
      labourCost: Number(labourCost),
      tripVehicleCost: Number(tripVehicleCost),
      dieselCost: Number(dieselCost),
      machineryCost: Number(machineryCost),
      otherExpenses: Number(otherExpenses),
      totalDailyCost,
      costPerMeter,
      costPerKm,
      costPerUnit,
      remarks,
      approvalStatus: 'APPROVED' as ApprovalStatus
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ROAD DAILY EXECUTION LOG
            </span>
            <span className="text-xs text-slate-400">Daily Production, Layer Progress & Unit Cost</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Daily Road Production & Cost Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every daily entry automatically computes: Material + Labour + Diesel + Trips + Machinery + Rental + Other = Daily Cost (Cost/m & Cost/km)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Log Daily Production
        </button>
      </div>

      {/* RECENT ROAD PRODUCTION ENTRIES TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-400" />
            Verified Daily Production Records ({roadProductions.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Chainage Stretch</th>
                <th className="py-3 px-3">Layer / Activity</th>
                <th className="py-3 px-3">Length & Qty</th>
                <th className="py-3 px-3">Resource Breakdown</th>
                <th className="py-3 px-3">Total Daily Cost</th>
                <th className="py-3 px-3">Cost / Km</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {roadProductions.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {prod.date}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                    Km {prod.chainageStart.toFixed(3)} → Km {prod.chainageEnd.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-white block">{prod.layerType}</span>
                    <span className="text-[10px] text-slate-400">
                      Thickness: {prod.thicknessMm}mm • Width: {prod.widthMeters}m
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-bold text-white block">{prod.lengthCompletedMeters} Metres</span>
                    <span className="text-[10px] text-slate-400">{prod.quantityM3OrTonnes} {prod.unit}</span>
                  </td>
                  <td className="py-3.5 px-3 text-[10px] text-slate-400 space-y-0.5">
                    <div>Mat: <strong className="text-slate-200">₹{(prod.materialCost / 1000).toFixed(0)}k</strong> • Lab: <strong className="text-slate-200">₹{(prod.labourCost / 1000).toFixed(0)}k</strong></div>
                    <div>Trips: <strong className="text-slate-200">₹{(prod.tripVehicleCost / 1000).toFixed(0)}k</strong> • DSL: <strong className="text-slate-200">₹{(prod.dieselCost / 1000).toFixed(0)}k</strong></div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-extrabold text-amber-400">
                    ₹{prod.totalDailyCost.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                    ₹{(prod.costPerKm / 100000).toFixed(2)} Lakhs
                    <span className="text-[9px] text-slate-500 block">₹{prod.costPerMeter.toFixed(1)} / m</span>
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

      {/* CREATE LOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-400" />
                Log Daily Road Production & Composite Cost
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chainage Start (Km)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={chainageStart}
                    onChange={(e) => setChainageStart(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chainage End (Km)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={chainageEnd}
                    onChange={(e) => setChainageEnd(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Road Layer</label>
                  <select
                    value={layerType}
                    onChange={(e) => setLayerType(e.target.value as RoadLayerType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Earthwork / Embankment">Earthwork / Embankment</option>
                    <option value="Subgrade / Murum">Subgrade / Murum</option>
                    <option value="Granular Sub-Base (GSB)">Granular Sub-Base (GSB)</option>
                    <option value="Wet Mix Macadam (WMM)">Wet Mix Macadam (WMM)</option>
                    <option value="Dense Bituminous Macadam (DBM)">Dense Bituminous Macadam (DBM)</option>
                    <option value="Bituminous Concrete (BC)">Bituminous Concrete (BC)</option>
                    <option value="Cement Concrete (CC Road)">Cement Concrete (CC Road)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Length (m)</label>
                    <input
                      type="number"
                      value={lengthMeters}
                      onChange={(e) => setLengthMeters(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Width (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={widthMeters}
                      onChange={(e) => setWidthMeters(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Thick (mm)</label>
                    <input
                      type="number"
                      value={thicknessMm}
                      onChange={(e) => setThicknessMm(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Resource Cost Breakdown Inputs */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Resource Cost Breakdown (₹)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Material Cost (₹)</label>
                    <input
                      type="number"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Labour Cost (₹)</label>
                    <input
                      type="number"
                      value={labourCost}
                      onChange={(e) => setLabourCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tipper Trips Cost (₹)</label>
                    <input
                      type="number"
                      value={tripVehicleCost}
                      onChange={(e) => setTripVehicleCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Diesel Cost (₹)</label>
                    <input
                      type="number"
                      value={dieselCost}
                      onChange={(e) => setDieselCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Machinery Cost (₹)</label>
                    <input
                      type="number"
                      value={machineryCost}
                      onChange={(e) => setMachineryCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Other Expenses (₹)</label>
                    <input
                      type="number"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Computed Daily Cost:</span>
                  <span className="font-mono font-extrabold text-amber-400 text-sm">
                    ₹{totalDailyCost.toLocaleString()} (₹{(costPerKm / 100000).toFixed(2)} Lakhs/km)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Site Remarks / Equipment Used</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Vogele Paver + Hamm Roller used. Surface temperature 145°C."
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Post Daily Production
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
