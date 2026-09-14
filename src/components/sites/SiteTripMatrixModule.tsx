import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Truck,
  Fuel,
  Plus,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Search,
  Save,
  CheckCircle2,
  Table as TableIcon,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
  Printer,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const SiteTripMatrixModule: React.FC = () => {
  const {
    siteSheets,
    updateSiteCellValue,
    updateSiteRowRate,
    addSiteSheetRow,
    addSiteSheetVehicle,
    addSiteSheetTab,
    addSiteExpense,
    projects
  } = useERP();

  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-mulwad');
  const [activeTabKey, setActiveTabKey] = useState<string>('MURUM');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingCell, setEditingCell] = useState<{ rowId: string; vehicle: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Modals
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [newRowDate, setNewRowDate] = useState('');
  const [isAddTabOpen, setIsAddTabOpen] = useState(false);
  const [newTabKey, setNewTabKey] = useState('');
  const [newTabLabel, setNewTabLabel] = useState('');
  const [newTabRate, setNewTabRate] = useState(2500);
  const [newTabUnit, setNewTabUnit] = useState('Trips');

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentSheet = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];
  const activeTab = currentSheet?.tabs.find((t) => t.tabKey === activeTabKey) || currentSheet?.tabs[0];

  // Calculate Column Totals across all vehicles for active tab
  const vehicleTotals: Record<string, number> = {};
  currentSheet?.vehicles.forEach((v) => {
    vehicleTotals[v] = 0;
  });

  activeTab?.rows.forEach((row) => {
    currentSheet?.vehicles.forEach((v) => {
      vehicleTotals[v] = (vehicleTotals[v] || 0) + (row.vehicleValues[v] || 0);
    });
  });

  const grandTotalTripsOrUnits = Object.values(vehicleTotals).reduce((a, b) => a + b, 0);
  const defaultRate = activeTab?.defaultRate || 0;
  const grandTotalAmount = grandTotalTripsOrUnits * defaultRate;

  // Calculate totals across ALL tabs for the site summary card
  const allTabsSummary = currentSheet?.tabs.map((tab) => {
    const totalQty = tab.rows.reduce((sum, r) => sum + r.total, 0);
    const totalVal = totalQty * tab.defaultRate;
    return {
      tabKey: tab.tabKey,
      label: tab.label,
      unit: tab.unit,
      totalQty,
      rate: tab.defaultRate,
      totalVal
    };
  }) || [];

  const totalSiteMaterialValue = allTabsSummary
    .filter((t) => t.tabKey !== 'DESIEL')
    .reduce((sum, t) => sum + t.totalVal, 0);

  const totalSiteDieselValue = allTabsSummary
    .filter((t) => t.tabKey === 'DESIEL')
    .reduce((sum, t) => sum + t.totalVal, 0);

  // Cell editing handlers
  const startEditing = (rowId: string, vehicle: string, currentValue: number) => {
    setEditingCell({ rowId, vehicle });
    setEditValue(currentValue === 0 ? '' : currentValue.toString());
  };

  const commitEditing = () => {
    if (editingCell && currentSheet && activeTab) {
      const num = Number(editValue) || 0;
      updateSiteCellValue(currentSheet.siteId, activeTab.tabKey, editingCell.rowId, editingCell.vehicle, num);
      setEditingCell(null);
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEditing();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Quick increment/decrement
  const handleQuickDelta = (rowId: string, vehicle: string, currentVal: number, delta: number) => {
    if (!currentSheet || !activeTab) return;
    const newVal = Math.max(0, currentVal + delta);
    updateSiteCellValue(currentSheet.siteId, activeTab.tabKey, rowId, vehicle, newVal);
  };

  // Add Vehicle Column
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleNumber.trim()) return;
    addSiteSheetVehicle(currentSheet.siteId, newVehicleNumber.trim());
    setNewVehicleNumber('');
    setIsAddVehicleOpen(false);
    showToast(`Vehicle ${newVehicleNumber.toUpperCase()} added as column!`);
  };

  // Add Date Row
  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowDate.trim()) return;
    addSiteSheetRow(currentSheet.siteId, activeTab.tabKey, newRowDate.trim(), activeTab.label);
    setNewRowDate('');
    setIsAddRowOpen(false);
    showToast(`New date row ${newRowDate} added!`);
  };

  // Add Custom Material Tab
  const handleAddTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabLabel.trim()) return;
    const key = newTabKey.trim().toUpperCase() || newTabLabel.trim().toUpperCase();
    addSiteSheetTab(currentSheet.siteId, key, newTabLabel.trim(), Number(newTabRate), newTabUnit);
    setActiveTabKey(key);
    setNewTabKey('');
    setNewTabLabel('');
    setIsAddTabOpen(false);
    showToast(`Tab ${newTabLabel} created!`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!currentSheet || !activeTab) return;
    const headers = [currentSheet.monthTitle, 'DATE', 'Item', ...currentSheet.vehicles, 'TOTAL', 'RATE', 'AMOUNT'];
    const rows = activeTab.rows.map((r) => [
      r.dayNumber,
      r.date,
      r.item,
      ...currentSheet.vehicles.map((v) => r.vehicleValues[v] || 0),
      r.total,
      r.ratePerUnitOrTrip || activeTab.defaultRate,
      r.total * (r.ratePerUnitOrTrip || activeTab.defaultRate)
    ]);
    const summaryRow = [
      'TOTAL',
      '',
      '',
      ...currentSheet.vehicles.map((v) => vehicleTotals[v] || 0),
      grandTotalTripsOrUnits,
      activeTab.defaultRate,
      grandTotalAmount
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(',')), summaryRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentSheet.siteName}_${activeTab.tabKey}_Log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV downloaded successfully!');
  };

  // Sync to Site Expenses
  const handleSyncToSiteExpense = () => {
    if (!currentSheet || !activeTab) return;
    const isDiesel = activeTab.tabKey === 'DESIEL';
    addSiteExpense({
      siteId: currentSheet.siteId,
      siteName: currentSheet.siteName,
      date: new Date().toISOString().substring(0, 10),
      category: isDiesel ? 'Diesel / Fuel' : 'Raw Material / Quarry',
      title: `${activeTab.label} Total Sheet Cost (${grandTotalTripsOrUnits} ${activeTab.unit})`,
      description: `Auto-synced from ${currentSheet.siteName} ${activeTab.label} tab for month ${currentSheet.monthTitle}`,
      amount: grandTotalAmount,
      voucherNumber: `VCH-${currentSheet.siteId.slice(-3).toUpperCase()}-${activeTab.tabKey.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      vendorOrPayee: isDiesel ? 'Highway Fuel Station' : 'Quarry Crushing Plant Dispatch',
      paymentMode: 'NEFT / RTGS',
      approvedBy: 'Habibulla Bilgi',
      status: 'APPROVED'
    });
    showToast(`Synced ₹${grandTotalAmount.toLocaleString()} to Site Cost & Expenses!`);
  };

  const filteredRows = (activeTab?.rows || []).filter((r) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      r.date.toLowerCase().includes(s) ||
      r.item.toLowerCase().includes(s) ||
      r.dayNumber.toString().includes(s)
    );
  });

  return (
    <div className="space-y-5 pb-12 font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar mimicking Google Sheet / Excel Toolbar */}
      <div className="p-5 rounded-2xl bg-[#0c1427] border border-[#1b2845] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SITE LOGISTICS & DIESEL SPREADSHEET
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentSheet?.monthTitle} {currentSheet?.year}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {currentSheet?.siteName}
                </h1>
                {/* Site Switcher */}
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="bg-[#070c1a] border border-[#1e2d4a] text-xs font-bold text-blue-400 px-2.5 py-1 rounded-lg outline-none cursor-pointer hover:border-blue-500 transition-colors"
                >
                  {siteSheets.map((s) => (
                    <option key={s.siteId} value={s.siteId}>
                      📁 {s.siteName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddRowOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Add Date Row</span>
            </button>
            <button
              onClick={() => setIsAddVehicleOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Vehicle Column</span>
            </button>
            <button
              onClick={handleSyncToSiteExpense}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
              title="Push this sheet total to Site Cost & Expenses ledger"
            >
              <DollarSign className="w-3.5 h-3.5 text-white" />
              <span>Sync to Site Cost</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Download Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Site Overview KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#182643]">
          <div className="p-3 bg-[#070c1a] rounded-xl border border-[#182643]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Active Tab Total ({activeTab?.label})
            </span>
            <div className="text-xl font-extrabold text-white font-mono my-0.5">
              {grandTotalTripsOrUnits.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">{activeTab?.unit}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold font-mono">
              ₹{grandTotalAmount.toLocaleString('en-IN')} (@ ₹{activeTab?.defaultRate}/{activeTab?.unit})
            </span>
          </div>

          <div className="p-3 bg-[#070c1a] rounded-xl border border-[#182643]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Site Material Valuation
            </span>
            <div className="text-xl font-extrabold text-cyan-300 font-mono my-0.5">
              ₹{totalSiteMaterialValue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400">
              Murum, Sand, 20mm, GSB, WMM, etc.
            </span>
          </div>

          <div className="p-3 bg-[#070c1a] rounded-xl border border-[#182643]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Site Diesel Expense ({currentSheet?.monthTitle})
            </span>
            <div className="text-xl font-extrabold text-amber-400 font-mono my-0.5">
              ₹{totalSiteDieselValue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-amber-500/80">
              From DESIEL log tab
            </span>
          </div>

          <div className="p-3 bg-[#070c1a] rounded-xl border border-[#182643]">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Active Fleet Tracked
            </span>
            <div className="text-xl font-extrabold text-purple-300 font-mono my-0.5">
              {currentSheet?.vehicles.length}{' '}
              <span className="text-xs font-normal text-slate-400">Vehicles</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono truncate block">
              {currentSheet?.vehicles.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* SPREADSHEET CONTAINER */}
      <div className="rounded-2xl bg-[#0c1427] border border-[#1b2845] shadow-2xl overflow-hidden flex flex-col">
        {/* Spreadsheet Sub-toolbar */}
        <div className="p-3 bg-[#0a1020] border-b border-[#182643] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-blue-400" />
              <span>Editing: <strong className="text-white underline">{activeTab?.label}</strong> Sheet</span>
            </span>
            <div className="flex items-center gap-1 bg-[#070c1a] border border-[#1e2d4a] px-2 py-0.5 rounded-lg text-[11px] text-slate-300">
              <span>Standard Rate:</span>
              <input
                type="number"
                value={activeTab?.defaultRate || 0}
                onChange={(e) => {
                  if (currentSheet && activeTab) {
                    const newRate = Number(e.target.value);
                    activeTab.rows.forEach((r) => {
                      updateSiteRowRate(currentSheet.siteId, activeTab.tabKey, r.id, newRate);
                    });
                  }
                }}
                className="w-16 bg-transparent text-emerald-400 font-bold font-mono outline-none text-right"
              />
              <span className="text-slate-500">₹ / {activeTab?.unit}</span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search date or day #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#070c1a] border border-[#1e2d4a] rounded-lg text-xs text-white outline-none w-48 focus:border-blue-500"
            />
          </div>
        </div>

        {/* DATA TABLE (Google Sheets exact grid look) */}
        <div className="overflow-x-auto max-h-[560px] scrollbar-thin scrollbar-thumb-slate-700">
          <table className="w-full text-xs text-left border-collapse select-none font-mono">
            {/* Table Header: Day Col, Date, Item, Vehicles (8797, 7352, 7353, 9579, 9580), Total */}
            <thead className="sticky top-0 z-20 bg-[#0f1a33] text-slate-200 border-b-2 border-[#2563eb]">
              <tr>
                <th className="py-2.5 px-3 border-r border-[#1e2d4a] text-center font-bold text-amber-300 w-24 bg-[#0a1224]">
                  {currentSheet?.monthTitle}
                </th>
                <th className="py-2.5 px-4 border-r border-[#1e2d4a] font-bold text-cyan-300 w-32 bg-[#0a1224]">
                  DATE
                </th>
                <th className="py-2.5 px-4 border-r border-[#1e2d4a] font-bold text-slate-300 w-32 bg-[#0a1224]">
                  Item
                </th>
                {currentSheet?.vehicles.map((v) => (
                  <th
                    key={v}
                    className="py-2.5 px-3 border-r border-[#1e2d4a] text-center font-extrabold text-yellow-400 min-w-[85px] bg-[#0c162b]"
                  >
                    🚛 {v}
                  </th>
                ))}
                <th className="py-2.5 px-4 border-r border-[#1e2d4a] text-right font-extrabold text-emerald-400 w-28 bg-[#0a1224]">
                  TOTAL ({activeTab?.unit})
                </th>
                <th className="py-2.5 px-4 text-right font-extrabold text-slate-300 w-32 bg-[#0a1224]">
                  DAILY COST (₹)
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#15223c] text-slate-200 bg-[#070c1a]">
              {filteredRows.map((row) => {
                const rowTotalCost = row.total * (row.ratePerUnitOrTrip || activeTab?.defaultRate || 0);
                const hasActivity = row.total > 0;

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-[#0f1c38] ${
                      hasActivity ? 'bg-[#091124]' : 'bg-[#070c1a]'
                    }`}
                  >
                    {/* Day Number */}
                    <td className="py-2 px-3 border-r border-[#15223c] text-center font-bold text-slate-400">
                      {row.dayNumber}
                    </td>

                    {/* Date */}
                    <td className="py-2 px-4 border-r border-[#15223c] font-semibold text-slate-200 whitespace-nowrap">
                      {row.date}
                    </td>

                    {/* Item Name */}
                    <td className="py-2 px-4 border-r border-[#15223c] text-slate-300 font-sans font-medium">
                      {row.item}
                    </td>

                    {/* Vehicle Trip / Litre Input Cells */}
                    {currentSheet?.vehicles.map((v) => {
                      const isEditing = editingCell?.rowId === row.id && editingCell?.vehicle === v;
                      const val = row.vehicleValues[v] || 0;

                      return (
                        <td
                          key={v}
                          onClick={() => startEditing(row.id, v, val)}
                          className={`py-1 px-2 border-r border-[#15223c] text-center cursor-pointer transition-all relative group ${
                            val > 0
                              ? 'bg-blue-950/40 text-yellow-300 font-bold'
                              : 'text-slate-600 hover:bg-[#111e3b]'
                          }`}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={commitEditing}
                              onKeyDown={handleCellKeyDown}
                              className="w-full text-center bg-blue-600 text-white font-bold rounded py-0.5 px-1 outline-none shadow-inner"
                            />
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <span>{val > 0 ? val : ''}</span>
                              {/* Quick +/- buttons on hover */}
                              <div className="hidden group-hover:flex items-center gap-0.5 absolute right-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickDelta(row.id, v, val, -1);
                                  }}
                                  className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center"
                                >
                                  -
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickDelta(row.id, v, val, 1);
                                  }}
                                  className="w-4 h-4 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Total on that Day */}
                    <td className="py-2 px-4 border-r border-[#15223c] text-right font-extrabold text-white">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          row.total > 0
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                            : 'text-slate-500'
                        }`}
                      >
                        {row.total}
                      </span>
                    </td>

                    {/* Daily Cost */}
                    <td className="py-2 px-4 text-right font-bold text-slate-300">
                      {rowTotalCost > 0 ? (
                        <span className="text-emerald-400">₹{rowTotalCost.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-600">₹0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Bottom Summary Row (Google Sheets Style Totals) */}
            <tfoot className="sticky bottom-0 z-20 bg-[#0e1933] text-white border-t-2 border-[#2563eb] font-bold">
              <tr>
                <td colSpan={3} className="py-3 px-4 border-r border-[#1e2d4a] text-center font-extrabold uppercase text-amber-400">
                  GRAND TOTALS ({activeTab?.label})
                </td>
                {currentSheet?.vehicles.map((v) => (
                  <td
                    key={v}
                    className="py-3 px-2 border-r border-[#1e2d4a] text-center font-black text-yellow-300 bg-[#0c162b]"
                  >
                    {vehicleTotals[v] || 0}
                  </td>
                ))}
                <td className="py-3 px-4 border-r border-[#1e2d4a] text-right font-black text-emerald-300 text-sm bg-[#0a1224]">
                  {grandTotalTripsOrUnits.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-black text-emerald-400 text-sm bg-[#0a1224]">
                  ₹{grandTotalAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* BOTTOM TAB STRIP (Identical to Google Sheets tabs shown in screenshot) */}
        <div className="bg-[#080d1e] border-t border-[#182643] p-1.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {/* Add Tab Button */}
            <button
              onClick={() => setIsAddTabOpen(true)}
              className="p-1.5 rounded-lg bg-[#142038] hover:bg-[#1f3054] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Add Material Sheet Tab"
            >
              <Plus className="w-4 h-4 text-blue-400" />
            </button>

            {/* Material Tabs: MURUM, M SAND, 20 MM, CEMENT, STEEL, GSB, WMM, DESIEL, BM, SILICOTE */}
            {currentSheet?.tabs.map((tab) => {
              const isActive = tab.tabKey === activeTabKey;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabKey(tab.tabKey)}
                  className={`px-3.5 py-1.5 rounded-t-lg text-xs font-extrabold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#2563eb] text-white shadow-md shadow-blue-600/40 border-b-2 border-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#142038]'
                  }`}
                >
                  {tab.tabKey === 'DESIEL' ? (
                    <Fuel className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <Layers className="w-3.5 h-3.5 text-blue-300" />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 px-3 shrink-0">
            <span>Click any cell to edit • Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">Enter</kbd> to save</span>
          </div>
        </div>
      </div>

      {/* ALL TABS SITE OVERVIEW SUMMARY TABLE */}
      <div className="p-5 rounded-2xl bg-[#0c1427] border border-[#1b2845] shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>{currentSheet?.siteName} — Material & Fuel Summary Matrix</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {allTabsSummary.map((tab) => (
            <div
              key={tab.tabKey}
              onClick={() => setActiveTabKey(tab.tabKey)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                tab.tabKey === activeTabKey
                  ? 'bg-blue-950/40 border-blue-500'
                  : 'bg-[#070c1a] border-[#182643] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>{tab.label}</span>
                {tab.tabKey === 'DESIEL' && <Fuel className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="text-base font-extrabold text-white font-mono mt-1">
                {tab.totalQty.toLocaleString()}{' '}
                <span className="text-[10px] font-normal text-slate-400">{tab.unit}</span>
              </div>
              <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                ₹{tab.totalVal.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD VEHICLE COLUMN */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              Add Tipper / Vehicle Column
            </h3>
            <p className="text-xs text-slate-400">
              Add vehicle registration (e.g. 8797, 7352, 9580, or 9821) as a new column across all material tabs.
            </p>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Vehicle Registration Number / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9820 or MH-12-QW-5821"
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white font-mono uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#182643]">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
                >
                  Add Vehicle Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DATE ROW */}
      {isAddRowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Add Date Row to Sheet
            </h3>

            <form onSubmit={handleAddRow} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Date (e.g. 14-7-2026) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14-7-2026"
                  value={newRowDate}
                  onChange={(e) => setNewRowDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#182643]">
                <button
                  type="button"
                  onClick={() => setIsAddRowOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Add Date Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MATERIAL TAB */}
      {isAddTabOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Create New Material Tab
            </h3>

            <form onSubmit={handleAddTab} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tab Name / Material *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 40 MM CRUSHED STONE or WATER TANKER"
                  value={newTabLabel}
                  onChange={(e) => {
                    setNewTabLabel(e.target.value);
                    setNewTabKey(e.target.value.toUpperCase());
                  }}
                  className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Default Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={newTabRate}
                    onChange={(e) => setNewTabRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Measurement Unit
                  </label>
                  <select
                    value={newTabUnit}
                    onChange={(e) => setNewTabUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c1a] border border-[#1b2845] rounded-xl text-white"
                  >
                    <option value="Trips">Trips</option>
                    <option value="Tonnes">Tonnes</option>
                    <option value="Litres">Litres</option>
                    <option value="Bags">Bags</option>
                    <option value="m³">m³ (Cubic Meters)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#182643]">
                <button
                  type="button"
                  onClick={() => setIsAddTabOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Create Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
