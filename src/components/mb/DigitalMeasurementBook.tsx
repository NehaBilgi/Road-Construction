import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { MeasurementBookEntry, ApprovalStatus } from '../../types/erp';
import {
  Ruler,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  Layers,
  FileCheck,
  Building2,
  Milestone,
  Filter
} from 'lucide-react';

export const DigitalMeasurementBook: React.FC = () => {
  const { measurements, addMeasurementEntry, currentProject, currentSite, workType } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ROAD' | 'BUILDING'>('ALL');

  // MB Entry Form State
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [mbNumber, setMbNumber] = useState('MB-2026/08');
  const [pageNumber, setPageNumber] = useState(14);
  const [activity, setActivity] = useState('Wet Mix Macadam (WMM)');
  const [description, setDescription] = useState('Providing and laying Wet Mix Macadam (WMM) compacted to 100% MDD as per MoRTH specs');
  const [chainageOrFloor, setChainageOrFloor] = useState('Km 124+000 to Km 124+600 RHS Carriageway');
  const [roomOrSection, setRoomOrSection] = useState('Main Carriageway Section 1');
  const [nos, setNos] = useState<number>(1);
  const [lengthM, setLengthM] = useState<number>(600.0);
  const [widthM, setWidthM] = useState<number>(10.5);
  const [heightOrDepthM, setHeightOrDepthM] = useState<number>(0.25); // 250mm
  const [unit, setUnit] = useState('m³');
  const [tenderRate, setTenderRate] = useState<number>(1150);
  const [drawingRef, setDrawingRef] = useState('DWG-RD-SEC-104-REV2');

  // Automatic calculation
  const calculatedQuantity = Number((nos * lengthM * widthM * heightOrDepthM).toFixed(2));
  const totalAmount = Number((calculatedQuantity * tenderRate).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMeasurementEntry({
      projectId: currentProject?.id || 'proj-road-1',
      siteId: currentSite?.id || 'site-road-1',
      mbNumber,
      pageNumber: Number(pageNumber),
      date,
      workType: (workType || currentProject?.type || 'ROAD'),
      chainageOrFloor,
      roomOrSection,
      activity,
      description,
      lengthM: Number(lengthM),
      widthM: Number(widthM),
      heightOrDepthM: Number(heightOrDepthM),
      numbersMultiplier: Number(nos),
      calculatedQuantity,
      unit,
      recordedByEngineer: 'Er. A. Deshmukh (Site Engineer)',
      drawingRef,
      approvalStatus: 'APPROVED' as ApprovalStatus
    });

    setIsModalOpen(false);
  };

  const filteredEntries = measurements.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.mbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.chainageOrFloor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'ALL' || e.workType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalBillableQty = filteredEntries.reduce((sum, e) => sum + (e.calculatedQuantity || 0), 0);
  const totalBillableAmount = filteredEntries.reduce(
    (sum, e) => sum + (e.calculatedQuantity || 0) * (tenderRate || 1000),
    0
  );

  const handleExportCSV = () => {
    const headers = 'MB Number,Page,Date,Work Type,Activity,Description,Location/Chainage,Nos,Length(m),Width(m),Depth(m),Net Qty,Unit,Drawing Ref,Recorded By,Status\n';
    const rows = filteredEntries
      .map(
        (e) =>
          `"${e.mbNumber}",${e.pageNumber},"${e.date}","${e.workType}","${e.activity}","${e.description}","${e.chainageOrFloor}",${e.numbersMultiplier},${e.lengthM},${e.widthM},${e.heightOrDepthM},${e.calculatedQuantity},"${e.unit}","${e.drawingRef || ''}","${e.recordedByEngineer}","${e.approvalStatus}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Measurement_Book_${currentProject?.code || 'MB'}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              STATUTORY BILLING & MEASUREMENTS
            </span>
            <span className="text-xs text-slate-400">Digital Measurement Book (MB)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Digital Measurement Book (MB) Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formula: Net Quantity = Nos × Length (L) × Breadth/Width (B) × Depth/Height (D) • CPWD/IRC Statutory RA Bill Measurement Record.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-amber-400" />
            <span>Export MB CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Record MB Entry</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Certified Quantity</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            {totalBillableQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">Units</span>
          </div>
          <span className="text-xs text-slate-400">
            Across {filteredEntries.length} verified measurement sheets
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Estimated Certified Value</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono my-1">
            ₹{(totalBillableAmount / 100000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Lakhs</span>
          </div>
          <span className="text-xs text-slate-400">
            Ready for Monthly RA / Interim Payment Bill
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Verification Status</span>
          <div className="text-xl font-extrabold text-cyan-300 font-mono my-1">
            100% Certified (JE/AE)
          </div>
          <span className="text-xs text-cyan-400">
            CPWD Form 23 & IRC Compliant
          </span>
        </div>
      </div>

      {/* FILTER & MB TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Ruler className="h-4 w-4 text-amber-400" />
              CPWD / IRC Measurement Entries ({filteredEntries.length})
            </h3>

            <div className="inline-flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter('ROAD')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedFilter === 'ROAD' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                🛣️ Road
              </button>
              <button
                onClick={() => setSelectedFilter('BUILDING')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedFilter === 'BUILDING' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                🏢 Building
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search MB page, activity, location..."
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
                <th className="py-3 px-3">MB No. & Page</th>
                <th className="py-3 px-3">Activity & Description</th>
                <th className="py-3 px-3">Location / Chainage / Floor</th>
                <th className="py-3 px-3">Dimensions (Nos × L × W × H/D)</th>
                <th className="py-3 px-3">Net Quantity</th>
                <th className="py-3 px-3">Drawing / Ref</th>
                <th className="py-3 px-3 text-right">Sign-Off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredEntries.map((mb) => (
                <tr key={mb.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-amber-400 block">{mb.mbNumber} / P-{mb.pageNumber}</span>
                    <span className="text-[10px] text-slate-400">{mb.date}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-bold text-white block">{mb.activity}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{mb.description}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="text-cyan-300 font-mono font-semibold block">{mb.chainageOrFloor}</span>
                    <span className="text-[10px] text-slate-400">{mb.roomOrSection}</span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {mb.numbersMultiplier} × {mb.lengthM}m × {mb.widthM}m × {mb.heightOrDepthM}m
                  </td>

                  <td className="py-3.5 px-3 font-mono font-extrabold text-white text-sm">
                    {mb.calculatedQuantity.toLocaleString()} {mb.unit}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-300">
                    {mb.drawingRef || 'Standard Spec'}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {mb.approvalStatus}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-1 font-mono">{mb.recordedByEngineer}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MB MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ruler className="h-4 w-4 text-amber-400" />
              Record Measurement Book (MB) Entry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MB Book Ref *</label>
                  <input
                    type="text"
                    required
                    value={mbNumber}
                    onChange={(e) => setMbNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Page #</label>
                  <input
                    type="number"
                    required
                    value={pageNumber}
                    onChange={(e) => setPageNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Measurement Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Activity / Item Name *</label>
                  <input
                    type="text"
                    required
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Drawing / Specification Ref</label>
                  <input
                    type="text"
                    value={drawingRef}
                    onChange={(e) => setDrawingRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Item Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location / Chainage / Floor *</label>
                  <input
                    type="text"
                    required
                    value={chainageOrFloor}
                    onChange={(e) => setChainageOrFloor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Room / Section Sub-division</label>
                  <input
                    type="text"
                    value={roomOrSection}
                    onChange={(e) => setRoomOrSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Dimensions (Nos × Length × Width × Height/Depth)
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Nos</label>
                    <input
                      type="number"
                      value={nos}
                      onChange={(e) => setNos(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Length (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={lengthM}
                      onChange={(e) => setLengthM(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Width (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={widthM}
                      onChange={(e) => setWidthM(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Height/Depth (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={heightOrDepthM}
                      onChange={(e) => setHeightOrDepthM(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between font-mono text-xs border-t border-slate-800/80">
                  <span className="text-slate-400">Total Net Content:</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {calculatedQuantity} {unit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tender Rate (₹ / {unit})</label>
                  <input
                    type="number"
                    value={tenderRate}
                    onChange={(e) => setTenderRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-emerald-400"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save MB Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
