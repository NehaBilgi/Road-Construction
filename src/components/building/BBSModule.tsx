import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { BBSItem } from '../../types/erp';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Download,
  Printer,
  TrendingUp,
  Box,
  Layers,
  CheckCircle2,
  FileDown
} from 'lucide-react';

export const BBSModule: React.FC = () => {
  const { bbsItems, addBBSItem, deleteBBSItem, currentProject } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [floorOrChainage, setFloorOrChainage] = useState('5th Floor');
  const [member, setMember] = useState('Beam B-502 (Floor Beam)');
  const [barMark, setBarMark] = useState('B2-MAIN');
  const [diameterMm, setDiameterMm] = useState<number>(16);
  const [grade, setGrade] = useState<BBSItem['grade']>('Fe550D');
  const [shapeType, setShapeType] = useState<BBSItem['shapeType']>('L-Bend');
  const [numberOfMembers, setNumberOfMembers] = useState<number>(6);
  const [barsPerMember, setBarsPerMember] = useState<number>(4);
  const [cuttingLengthM, setCuttingLengthM] = useState<number>(6.5);
  const [remarks, setRemarks] = useState('Tension reinforcement with 45d lap');

  // Automatic calculation
  const totalNumberOfBars = numberOfMembers * barsPerMember;
  const totalLengthM = Number((totalNumberOfBars * cuttingLengthM).toFixed(2));
  const unitWeightKgPerM = Number(((diameterMm * diameterMm) / 162).toFixed(3));
  const totalWeightKg = Number((totalLengthM * unitWeightKgPerM).toFixed(2));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addBBSItem({
      projectId: currentProject?.id || 'proj-bldg-1',
      floorOrChainage,
      member,
      barMark,
      diameterMm: Number(diameterMm),
      grade,
      shapeType,
      numberOfMembers: Number(numberOfMembers),
      barsPerMember: Number(barsPerMember),
      totalNumberOfBars,
      cuttingLengthM: Number(cuttingLengthM),
      totalLengthM,
      unitWeightKgPerM,
      totalWeightKg,
      remarks
    });

    setIsModalOpen(false);
  };

  // Summarize weight by diameter
  const diameterSummary = [8, 10, 12, 16, 20, 25, 32].map((dia) => {
    const matching = bbsItems.filter((b) => b.diameterMm === dia);
    const weight = matching.reduce((sum, b) => sum + b.totalWeightKg, 0);
    const length = matching.reduce((sum, b) => sum + b.totalLengthM, 0);
    return { diameter: dia, weightKg: weight, lengthM: length };
  });

  const totalSteelWeightKg = bbsItems.reduce((sum, b) => sum + b.totalWeightKg, 0);
  const totalSteelTonnes = totalSteelWeightKg / 1000;
  const steelRatePerTonne = 65000;
  const totalSteelCost = totalSteelTonnes * steelRatePerTonne;

  const handleExportCSV = () => {
    const headers = 'Member,Bar Mark,Dia (mm),Shape,Members,Bars/Member,Total Bars,Cut Length (m),Total Length (m),Unit Wt (kg/m),Total Wt (kg),Remarks\n';
    const rows = bbsItems
      .map(
        (b) =>
          `"${b.member}","${b.barMark}",${b.diameterMm},"${b.shapeType}",${b.numberOfMembers},${b.barsPerMember},${b.totalNumberOfBars},${b.cuttingLengthM},${b.totalLengthM},${b.unitWeightKgPerM},${b.totalWeightKg},"${b.remarks || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BBS_Schedule_${currentProject?.code || 'BLDG'}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              REINFORCEMENT DETAILING
            </span>
            <span className="text-xs text-slate-400">IS 2502 BBS Standards • Unit Wt = d²/162</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Bar Bending Schedule (BBS) & Steel Weight
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard cut length calculations, bar shapes, weight by diameter (6mm to 32mm), and procurement takeoff.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Bar Mark Entry
          </button>
        </div>
      </div>

      {/* DIAMETER-WISE SUMMARY TAKE-OFF CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {diameterSummary.map((item) => (
          <div
            key={item.diameter}
            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center"
          >
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              {item.diameter} mm Rebar
            </span>
            <div className="text-base font-extrabold text-cyan-300 font-mono my-0.5">
              {item.weightKg.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">kg</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              {item.lengthM.toFixed(0)}m length
            </span>
          </div>
        ))}
      </div>

      {/* GRAND TOTALS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Rebar Weight</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            {totalSteelWeightKg.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            = <strong className="text-cyan-400 font-bold">{totalSteelTonnes.toFixed(3)} Tonnes</strong> Fe550D
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Estimated Steel Cost</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono my-1">
            ₹{totalSteelCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className="text-xs text-slate-400">
            @ ₹{steelRatePerTonne.toLocaleString()}/Tonne standard rate
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">Scheduled Items</span>
            <div className="text-2xl font-extrabold text-cyan-300 font-mono my-1">
              {bbsItems.length} Bar Marks
            </div>
            <span className="text-xs text-cyan-300/80">Ready for bar bender yard issuance</span>
          </div>
          <FileSpreadsheet className="h-8 w-8 text-cyan-400 opacity-60" />
        </div>
      </div>

      {/* DETAILED BBS TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
            Complete Bar Bending Schedule Sheet
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Member & Mark</th>
                <th className="py-3 px-3">Dia & Grade</th>
                <th className="py-3 px-3">Bar Shape</th>
                <th className="py-3 px-3">No. of Members</th>
                <th className="py-3 px-3">Bars / Member</th>
                <th className="py-3 px-3">Cut Length (m)</th>
                <th className="py-3 px-3">Total Length</th>
                <th className="py-3 px-3">Unit Wt (kg/m)</th>
                <th className="py-3 px-3">Total Wt (kg)</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {bbsItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-white block">{item.member}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{item.barMark} • {item.floorOrChainage}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-bold text-slate-200 block">{item.diameterMm} mm Ø</span>
                    <span className="text-[10px] text-slate-400">{item.grade}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.shapeType}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {item.numberOfMembers}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {item.barsPerMember} (Total: {item.totalNumberOfBars})
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-slate-200">
                    {item.cuttingLengthM.toFixed(2)} m
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {item.totalLengthM.toFixed(1)} m
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-400">
                    {item.unitWeightKgPerM.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-extrabold text-cyan-300">
                    {item.totalWeightKg.toFixed(2)} kg
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => deleteBBSItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BAR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
              Add Bar Mark to Schedule
            </h3>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Structural Member *</label>
                  <input
                    type="text"
                    required
                    value={member}
                    onChange={(e) => setMember(e.target.value)}
                    placeholder="e.g. Column C-14, Slab S-101"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bar Mark / Ref *</label>
                  <input
                    type="text"
                    required
                    value={barMark}
                    onChange={(e) => setBarMark(e.target.value)}
                    placeholder="e.g. C14-MAIN-01"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Diameter (mm)</label>
                  <select
                    value={diameterMm}
                    onChange={(e) => setDiameterMm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  >
                    <option value={8}>8 mm</option>
                    <option value={10}>10 mm</option>
                    <option value={12}>12 mm</option>
                    <option value={16}>16 mm</option>
                    <option value={20}>20 mm</option>
                    <option value={25}>25 mm</option>
                    <option value={32}>32 mm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as BBSItem['grade'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Fe550D">Fe550D (High Ductility)</option>
                    <option value="Fe500">Fe500</option>
                    <option value="Fe415">Fe415</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shape Type</label>
                  <select
                    value={shapeType}
                    onChange={(e) => setShapeType(e.target.value as BBSItem['shapeType'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Straight">Straight</option>
                    <option value="L-Bend">L-Bend</option>
                    <option value="U-Bend">U-Bend</option>
                    <option value="Cranked">Cranked</option>
                    <option value="Stirrup-Rect">Stirrup (Rect)</option>
                    <option value="Stirrup-Circular">Stirrup (Circular)</option>
                    <option value="Chair">Chair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Number of Members</label>
                  <input
                    type="number"
                    value={numberOfMembers}
                    onChange={(e) => setNumberOfMembers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bars / Member</label>
                  <input
                    type="number"
                    value={barsPerMember}
                    onChange={(e) => setBarsPerMember(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cut Length (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cuttingLengthM}
                    onChange={(e) => setCuttingLengthM(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-cyan-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
                <span className="text-slate-400">Calculated Weight:</span>
                <span className="font-bold text-cyan-400">
                  {totalWeightKg.toFixed(2)} kg ({unitWeightKgPerM} kg/m × {totalLengthM} m)
                </span>
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
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
