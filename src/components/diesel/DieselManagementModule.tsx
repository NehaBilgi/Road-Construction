import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Fuel,
  Plus,
  Download,
  Search,
  Calendar,
  X,
  Trash2
} from 'lucide-react';

export const DieselFuelManagementModule: React.FC = () => {
  const {
    dieselLogs,
    addDieselLog,
    deleteDieselLog,
    selectedSiteId,
    siteSheets,
    currentProject,
    addSiteSheetVehicle
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New vehicle inline input mode
  const [isAddingNewVehicle, setIsAddingNewVehicle] = useState(false);
  const [newVehicleInput, setNewVehicleInput] = useState('');

  const currentSheet = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];
  const vehicles = currentSheet?.vehicles || ['8797', '7352', '7353', '9579', '9580'];

  // Form State: Only Site Name, Vehicle Number, Driver Name, Litres, Rate
  const [formSiteName, setFormSiteName] = useState(currentSheet?.siteName || 'Ongoing Highway Site');
  const [formVehicleNumber, setFormVehicleNumber] = useState(vehicles[0] || '8797');
  const [formDriverName, setFormDriverName] = useState('Santosh Kamble');
  const [formLitres, setFormLitres] = useState<number | ''>(100);
  const [formRatePerLitre, setFormRatePerLitre] = useState<number | ''>(92.5);

  // Auto calculate total cost
  const autoCalculatedTotal = useMemo(() => {
    const litres = typeof formLitres === 'number' ? formLitres : Number(formLitres) || 0;
    const rate = typeof formRatePerLitre === 'number' ? formRatePerLitre : Number(formRatePerLitre) || 0;
    return litres * rate;
  }, [formLitres, formRatePerLitre]);

  // Filtered Diesel Logs
  const filteredLogs = useMemo(() => {
    return (dieselLogs || []).filter((log) => {
      const q = searchTerm.toLowerCase();
      const matchVehicle = filterVehicle === 'ALL' || log.vehicleOrEquipment?.includes(filterVehicle);
      const matchSearch =
        !searchTerm ||
        log.slipNumber?.toLowerCase().includes(q) ||
        log.vehicleOrEquipment?.toLowerCase().includes(q) ||
        log.operatorOrDriver?.toLowerCase().includes(q);
      return matchVehicle && matchSearch;
    });
  }, [dieselLogs, filterVehicle, searchTerm]);

  const totalLitresDispensed = filteredLogs.reduce((sum, l) => sum + (l.litresDispensed || 0), 0);
  const totalDieselValuation = filteredLogs.reduce((sum, l) => sum + (l.totalCost || 0), 0);

  const handleAddNewVehicle = () => {
    const cleanNumber = newVehicleInput.trim().toUpperCase();
    if (!cleanNumber) return;

    if (currentSheet?.siteId && addSiteSheetVehicle) {
      addSiteSheetVehicle(currentSheet.siteId, cleanNumber);
    }
    setFormVehicleNumber(cleanNumber);
    setNewVehicleInput('');
    setIsAddingNewVehicle(false);
  };

  const handleCreateFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    const litres = typeof formLitres === 'number' ? formLitres : Number(formLitres) || 0;
    const rate = typeof formRatePerLitre === 'number' ? formRatePerLitre : Number(formRatePerLitre) || 92.5;
    const today = new Date().toISOString().substring(0, 10);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addDieselLog({
      projectId: currentProject?.id || 'proj-ongoing-1',
      siteId: selectedSiteId || 'site-ongoing-1',
      slipNumber: `DSL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: today,
      time: timeNow,
      vehicleOrEquipment: formVehicleNumber,
      operatorOrDriver: formDriverName,
      fuelSource: 'Site Bowser / Tank',
      litresDispensed: litres,
      ratePerLitre: rate,
      totalCost: litres * rate,
      meterReading: 0,
      approvedBy: 'Admin'
    });

    setIsAddModalOpen(false);
  };

  const handleDeleteDieselRecord = (logId: string, slipNumber: string) => {
    if (window.confirm(`Are you sure you want to delete diesel slip "${slipNumber}"?`)) {
      if (deleteDieselLog) {
        deleteDieselLog(logId);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = 'Voucher Slip,Date,Site Name,Vehicle Number,Driver Name,Litres,Rate/Litre (INR),Total Cost (INR)\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.slipNumber}","${l.date} ${l.time || ''}","${formSiteName}","${l.vehicleOrEquipment}","${l.operatorOrDriver}","${l.litresDispensed}","${l.ratePerLitre}","${l.totalCost}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Diesel_Logs_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md shadow-amber-600/20">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Diesel
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Fuel Logs
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Record vehicle diesel refueling slips, dispensed litres, and total billing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Refueling Voucher</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#162032] hover:bg-slate-800 border border-[#1E293B] text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Statement</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Total Fuel Dispensed
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1.5">
            {totalLitresDispensed.toLocaleString()} <span className="text-xs font-sans text-[#94A3B8]">Litres</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Total Diesel Cost
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1.5">
            ₹{totalDieselValuation.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121927] border border-[#1E293B] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Total Vouchers
          </span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1.5">
            {filteredLogs.length} <span className="text-xs font-sans text-[#94A3B8]">Slips</span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search */}
      <div className="p-3 rounded-2xl bg-[#0D111D] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <select
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
          className="w-full sm:w-52 px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white text-xs outline-none focus:border-amber-500 font-semibold cursor-pointer"
        >
          <option value="ALL">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v} value={v}>
              Vehicle #{v}
            </option>
          ))}
        </select>

        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search voucher slip, vehicle, driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-xs text-white outline-none focus:border-amber-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* 4. Fuel Ledger Table with Delete Option */}
      <div className="rounded-3xl bg-[#0B1220] border border-[#1E293B] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#080D19] text-[#94A3B8] font-extrabold uppercase text-[10px] tracking-wider border-b border-[#1E293B]">
              <tr>
                <th className="py-3 px-5">Voucher & Date</th>
                <th className="py-3 px-5">Site Name</th>
                <th className="py-3 px-5">Vehicle Number</th>
                <th className="py-3 px-5">Driver Name</th>
                <th className="py-3 px-5 text-right">Litres Dispensed</th>
                <th className="py-3 px-5 text-right">Rate / Litre (₹)</th>
                <th className="py-3 px-5 text-right">Total Amount (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No diesel refueling vouchers recorded yet. Click <strong>+ Record Refueling Voucher</strong>.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#121927] transition-colors">
                    <td className="py-3.5 px-5 whitespace-nowrap font-mono">
                      <div className="font-bold text-amber-400">{log.slipNumber}</div>
                      <div className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{log.date} {log.time && `• ${log.time}`}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-slate-300 whitespace-nowrap font-medium">
                      {formSiteName}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap font-mono font-bold text-blue-400">
                      #{log.vehicleOrEquipment}
                    </td>

                    <td className="py-3.5 px-5 text-slate-300 whitespace-nowrap">
                      {log.operatorOrDriver || 'Driver'}
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white text-sm whitespace-nowrap">
                      {log.litresDispensed} L
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono text-slate-300 whitespace-nowrap">
                      ₹{log.ratePerLitre || 92.5}
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono font-black text-amber-400 text-sm whitespace-nowrap">
                      ₹{(log.totalCost || (log.litresDispensed * (log.ratePerLitre || 92.5))).toLocaleString('en-IN')}
                    </td>

                    {/* Delete Option */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteDieselRecord(log.id, log.slipNumber)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
                        title="Delete Refueling Slip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Simplified Record Refueling Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Fuel className="w-5 h-5 text-amber-400" />
                <span>Record Diesel Refueling Voucher</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsAddingNewVehicle(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFuelLog} className="space-y-4 text-xs">
              {/* Site Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Site Name <span className="text-amber-400">*</span>
                </label>
                <select
                  value={formSiteName}
                  onChange={(e) => setFormSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 font-medium cursor-pointer"
                >
                  {siteSheets.map((s) => (
                    <option key={s.siteId} value={s.siteName}>
                      {s.siteName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">
                    Vehicle Number <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewVehicle(!isAddingNewVehicle)}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-bold cursor-pointer"
                  >
                    {isAddingNewVehicle ? '← Select Existing' : '+ Add New Vehicle'}
                  </button>
                </div>

                {isAddingNewVehicle ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 9988 or MH-12-AB-1234"
                      value={newVehicleInput}
                      onChange={(e) => setNewVehicleInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-[#162032] border border-amber-500 rounded-xl text-white outline-none font-mono font-bold uppercase placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewVehicle}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-md shadow-amber-600/20 shrink-0"
                    >
                      Add & Select
                    </button>
                  </div>
                ) : (
                  <select
                    value={formVehicleNumber}
                    onChange={(e) => setFormVehicleNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 font-mono font-bold cursor-pointer"
                  >
                    {vehicles.map((v) => (
                      <option key={v} value={v}>
                        #{v}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Driver Name */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Driver Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Santosh Kamble"
                  value={formDriverName}
                  onChange={(e) => setFormDriverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 font-medium placeholder-slate-500"
                />
              </div>

              {/* Litres Dispensed & Rate per Litre */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Litres Dispensed *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 100"
                    value={formLitres}
                    onChange={(e) =>
                      setFormLitres(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-black text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Rate per Litre (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formRatePerLitre}
                    onChange={(e) =>
                      setFormRatePerLitre(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Automatic Calculation Card */}
              <div className="p-3.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl flex items-center justify-between">
                <span className="text-slate-400 font-bold">Total Voucher Cost:</span>
                <span className="text-lg font-black font-mono text-amber-400">
                  ₹{autoCalculatedTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsAddingNewVehicle(false);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  Save & Lock Fuel Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DieselFuelManagementModule;
