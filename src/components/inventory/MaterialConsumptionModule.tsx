import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { MaterialConsumptionRecord, WorkType } from '../../types/erp';
import {
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
  Ruler,
  TrendingDown
} from 'lucide-react';

export const MaterialConsumptionModule: React.FC = () => {
  const { consumptionRecords, addConsumptionRecord, currentProject, currentSite, workType } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [activity, setActivity] = useState('Wet Mix Macadam (WMM) Base Layer');
  const [chainageOrFloor, setChainageOrFloor] = useState('Km 124+000 to Km 124+600');
  const [materialName, setMaterialName] = useState('Wet Mix Macadam (WMM Plant Mix)');
  const [theoreticalQty, setTheoreticalQty] = useState<number>(850);
  const [issuedQty, setIssuedQty] = useState<number>(920);
  const [actualConsumedQty, setActualConsumedQty] = useState<number>(910);
  const [balanceAtSite, setBalanceAtSite] = useState<number>(10);
  const [unit, setUnit] = useState('Tonnes');
  const [investigationNotes, setInvestigationNotes] = useState(
    'Slight subgrade undulation required extra thickness. Paver screed sensor recalibrated.'
  );

  // Automatic calculations
  const varianceQty = Number((actualConsumedQty - theoreticalQty).toFixed(2));
  const variancePercent = theoreticalQty > 0 ? Number(((varianceQty / theoreticalQty) * 100).toFixed(2)) : 0;
  const isAlert = variancePercent > 5.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addConsumptionRecord({
      date,
      projectId: currentProject?.id || 'proj-road-1',
      siteId: currentSite?.id || 'site-road-1',
      workType: (workType || 'ROAD') as WorkType,
      activity,
      chainageOrFloor,
      materialName,
      theoreticalQty: Number(theoreticalQty),
      issuedQty: Number(issuedQty),
      actualConsumedQty: Number(actualConsumedQty),
      balanceAtSite: Number(balanceAtSite),
      varianceQty,
      variancePercent,
      unit,
      status: isAlert ? 'OVER_CONSUMPTION_ALERT' : 'NORMAL',
      investigationNotes: isAlert ? investigationNotes : undefined
    });

    setIsModalOpen(false);
  };

  const filteredRecords = consumptionRecords.filter(
    (c) =>
      c.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.chainageOrFloor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.materialName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const alertCount = filteredRecords.filter((c) => c.status === 'OVER_CONSUMPTION_ALERT').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              RECONCILIATION & VARIANCE ENGINE
            </span>
            <span className="text-xs text-slate-400">Theoretical vs Actual Material Audit</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Material Consumption & Variance Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reconciles design theoretical requirement vs warehouse issued quantity vs actual site consumption to catch waste & pilferage.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Log Consumption Entry
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Audited Batches</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            {filteredRecords.length} <span className="text-xs font-normal text-slate-400">Pours / Stretches</span>
          </div>
          <span className="text-xs text-slate-400">
            Road Layers & Building Floors
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Over-Consumption Alerts</span>
          <div className="text-2xl font-extrabold text-rose-400 font-mono my-1">
            {alertCount} <span className="text-xs font-normal text-slate-400">Flags</span>
          </div>
          <span className="text-xs text-rose-400">
            Variance exceeding +5% threshold
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Average Variance Rate</span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono my-1">
            +2.4%
          </div>
          <span className="text-xs text-slate-400">
            Within allowable shrinkage margin
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Material Wastage Saved</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono my-1">
            ₹4.2 Lakhs
          </div>
          <span className="text-xs text-emerald-400/80">
            Through real-time batch auditing
          </span>
        </div>
      </div>

      {/* CONSUMPTION TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            Theoretical vs Actual Consumption Logs
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search material, location, activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Date & Location</th>
                <th className="py-3 px-3">Activity & Material</th>
                <th className="py-3 px-3">Theoretical Req.</th>
                <th className="py-3 px-3">Store Issued</th>
                <th className="py-3 px-3">Actual Consumed</th>
                <th className="py-3 px-3">Variance</th>
                <th className="py-3 px-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredRecords.map((rec) => {
                const isOver = rec.variancePercent > 5.0;
                return (
                  <tr key={rec.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-white block">{rec.chainageOrFloor}</span>
                      <span className="text-[10px] text-slate-400">{rec.date} • {rec.workType}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-amber-300 block">{rec.materialName}</span>
                      <span className="text-[10px] text-slate-400">{rec.activity}</span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {rec.theoreticalQty} {rec.unit}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {rec.issuedQty} {rec.unit}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {rec.actualConsumedQty} {rec.unit}
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOver ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {rec.varianceQty > 0 ? `+${rec.varianceQty}` : rec.varianceQty} {rec.unit} ({rec.variancePercent > 0 ? `+${rec.variancePercent}%` : `${rec.variancePercent}%`})
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {isOver ? (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            ALERT: OVER CONSUMPTION
                          </span>
                          {rec.investigationNotes && (
                            <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1 max-w-[200px] ml-auto">
                              {rec.investigationNotes}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          NORMAL VARIANCE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              Log Material Consumption & Theoretical Audit
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                  <label className="block text-slate-300 font-semibold mb-1">Chainage / Floor Grid *</label>
                  <input
                    type="text"
                    required
                    value={chainageOrFloor}
                    onChange={(e) => setChainageOrFloor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Activity Description *</label>
                  <input
                    type="text"
                    required
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Material Name *</label>
                  <input
                    type="text"
                    required
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Quantities Reconciliation ({unit})
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Theoretical Req.</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={theoreticalQty}
                      onChange={(e) => setTheoreticalQty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Store Issued</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={issuedQty}
                      onChange={(e) => setIssuedQty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Actual Consumed</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={actualConsumedQty}
                      onChange={(e) => setActualConsumedQty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between font-mono text-xs border-t border-slate-800/80">
                  <span className="text-slate-400">Computed Variance:</span>
                  <span className={`font-bold ${isAlert ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {varianceQty > 0 ? `+${varianceQty}` : varianceQty} {unit} ({variancePercent > 0 ? `+${variancePercent}%` : `${variancePercent}%`})
                  </span>
                </div>
              </div>

              {isAlert && (
                <div>
                  <label className="block text-rose-400 font-semibold mb-1">
                    Investigation Notes / Root Cause Analysis (Required for alerts) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={investigationNotes}
                    onChange={(e) => setInvestigationNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-rose-500/40 rounded-xl text-white"
                  />
                </div>
              )}

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
                  Post Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
