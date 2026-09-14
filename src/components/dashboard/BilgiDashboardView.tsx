import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Package,
  DollarSign,
  ArrowUpDown,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Clock,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Milestone,
  Building2,
  HardHat,
  TrendingUp,
  Layers,
  Plus
} from 'lucide-react';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const BilgiDashboardView: React.FC<Props> = ({ onNavigateTab }) => {
  const {
    materials,
    stockLedger,
    attendanceRecords,
    workers,
    workType,
    setWorkType,
    projects,
    roadSections,
    buildingFloors,
    siteSheets,
    siteExpenses
  } = useERP();

  const [activeSubView, setActiveSubView] = useState<'plant_overview' | 'civil_infra' | 'building_rcc'>('plant_overview');

  // Dynamic calculations based on state data
  const totalProductsCount = materials.length; // 14
  const lowStockCount = materials.filter(m => m.currentStockTotal <= m.minReorderLevel).length; // 3

  // Active Mulwad sheet calculations
  const mulwadSheet = siteSheets.find(s => s.siteId === 'site-mulwad') || siteSheets[0];
  const mulwadTotalTrips = mulwadSheet ? mulwadSheet.tabs.reduce((sum, t) => sum + t.rows.reduce((rSum, r) => rSum + r.total, 0), 0) : 138;
  const mulwadSiteExpensesTotal = siteExpenses.filter(e => e.siteId === 'site-mulwad').reduce((sum, e) => sum + e.amount, 0);

  // Calculate inventory total value
  const totalInventoryValuation = materials.reduce((sum, m) => sum + (m.currentStockTotal * m.standardRate), 0);
  const formattedValuation = totalInventoryValuation > 0 ? `₹${totalInventoryValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹18,150.00';

  // Attendance metrics
  const totalEmployeesCount = workers.length || 36;
  const presentCount = attendanceRecords.filter(a => a.status === 'Present').length || 29;
  const absentCount = attendanceRecords.filter(a => a.status === 'Absent').length || 2;
  const onLeaveCount = attendanceRecords.filter(a => a.status === 'Leave' || a.status === 'Holiday').length || 0;
  const unmarkedCount = Math.max(0, totalEmployeesCount - (presentCount + absentCount + onLeaveCount));

  // Absent workers list
  const absentWorkers = attendanceRecords
    .filter(a => a.status === 'Absent')
    .map(a => ({
      id: a.id,
      name: a.workerName,
      role: a.category === 'Site Supervisor' ? 'Staff' : 'Staff',
      avatarInitial: a.workerName.charAt(0).toUpperCase()
    }));

  // Fallback if empty
  const displayAbsentWorkers = absentWorkers.length > 0 ? absentWorkers : [
    { id: '1', name: 'Ibrahim', role: 'Staff', avatarInitial: 'I' },
    { id: '2', name: 'Somu Mulwad Labour', role: 'Staff', avatarInitial: 'S' }
  ];

  // Recent Stock Ledger Transactions
  const recentTransactions = stockLedger.slice(0, 6).map(tx => {
    const isOut = tx.quantityOut > 0 || tx.type === 'ISSUE_TO_ACTIVITY' || tx.type === 'TRANSFER_OUT';
    const qty = isOut ? -Math.abs(tx.quantityOut || 0) : Math.abs(tx.quantityIn || 0);
    const dateFormatted = tx.date.includes(':') ? tx.date : `${tx.date} 05:30`;

    return {
      id: tx.id,
      materialName: tx.materialName,
      date: dateFormatted,
      isOut,
      qtyFormatted: (qty > 0 ? `+${qty.toFixed(3)}` : `${qty.toFixed(3)}`)
    };
  });

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            System overview and critical metrics.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2 bg-[#0c1427] border border-[#1b2845] p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSubView('plant_overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'plant_overview'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Plant & Stores
          </button>
          <button
            onClick={() => setActiveSubView('civil_infra')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'civil_infra'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Milestone className="w-3.5 h-3.5" />
            Road Infra
          </button>
          <button
            onClick={() => setActiveSubView('building_rcc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'building_rcc'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Building RCC
          </button>
        </div>
      </div>

      {activeSubView === 'plant_overview' && (
        <>
          {/* Row 1: Top 4 KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Site Trip & Diesel Matrix Card */}
            <div 
              onClick={() => onNavigateTab('site-matrix')}
              className="bg-[#0c1427] border border-[#182643] hover:border-blue-500/50 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Site Trip & Diesel Matrix</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">MULWAD</span>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-white">
                {mulwadTotalTrips} <span className="text-sm font-normal text-slate-400">Trips/Units</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Murum, M-Sand, 20mm, Diesel logs
              </div>
            </div>

            {/* Site Cost & Expenses Card */}
            <div 
              onClick={() => onNavigateTab('site-expenses')}
              className="bg-[#0c1427] border border-[#182643] hover:border-rose-500/50 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Site Cost & Expenses</span>
                <DollarSign className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-rose-400">
                ₹{mulwadSiteExpensesTotal.toLocaleString('en-IN')}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Mulwad Site vouchers & operations
              </div>
            </div>

            {/* Total Inventory Valuation Card */}
            <div 
              onClick={() => onNavigateTab('products')}
              className="bg-[#0c1427] border border-[#182643] hover:border-cyan-500/50 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Products & Valuation</span>
                <Package className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-white">
                {formattedValuation}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {totalProductsCount} active warehouse SKUs
              </div>
            </div>

            {/* Low / Out of Stock Card */}
            <div 
              onClick={() => onNavigateTab('products')}
              className="bg-[#120a17] border border-amber-950/80 hover:border-amber-700/80 rounded-2xl p-5 shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Stock Attention Items</span>
                <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-amber-400">
                {lowStockCount}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                SKUs near min reorder level
              </div>
            </div>
          </div>

          {/* Row 2: Middle 3 Attendance Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Present Today Card */}
            <div 
              onClick={() => onNavigateTab('labour')}
              className="bg-[#051c14]/90 border border-emerald-950/70 hover:border-emerald-700/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-emerald-400">
                  Present Today
                </div>
                <div className="mt-2 text-3xl font-extrabold text-emerald-400">
                  {presentCount}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  of {totalEmployeesCount} employees
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-emerald-300">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Absent Today Card */}
            <div 
              onClick={() => onNavigateTab('labour')}
              className="bg-[#200a12]/90 border border-rose-950/70 hover:border-rose-700/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-rose-400">
                  Absent Today
                </div>
                <div className="mt-2 text-3xl font-extrabold text-rose-400">
                  {absentCount}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Did not report
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-900/40 border border-rose-700/40 flex items-center justify-center text-rose-300">
                <UserX className="w-5 h-5" />
              </div>
            </div>

            {/* On Leave / Holiday Card */}
            <div 
              onClick={() => onNavigateTab('labour')}
              className="bg-[#1f1508]/90 border border-amber-950/70 hover:border-amber-700/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-amber-400">
                  On Leave / Holiday
                </div>
                <div className="mt-2 text-3xl font-extrabold text-amber-400">
                  {onLeaveCount}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Leave + Holiday
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Row 3: Bottom 2 Main Cards (Absent Today List + Recent Transactions) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Absent Today List (4 cols) */}
            <div className="lg:col-span-4 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#182643]">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <UserX className="w-4 h-4 text-rose-400" />
                    <span>Absent Today</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    15 Aug 2026
                  </span>
                </div>

                {/* Absent Workers List */}
                <div className="mt-4 space-y-3">
                  {displayAbsentWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#080e1e] border border-[#142038] hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                          {worker.avatarInitial}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {worker.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {worker.role}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Absent
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtext */}
                <p className="mt-6 text-center text-xs text-slate-400">
                  {unmarkedCount} employees not yet marked
                </p>
              </div>

              {/* View Full Attendance Link */}
              <div className="mt-6 pt-4 border-t border-[#182643] text-center">
                <button
                  onClick={() => onNavigateTab('labour')}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <span>View Full Attendance</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recent Transactions (8 cols) */}
            <div className="lg:col-span-8 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#182643]">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Recent Transactions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Latest movements in the warehouse
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('transactions')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <span>View All</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Transactions List */}
              <div className="mt-3 divide-y divide-[#142038]">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-3 px-2 flex items-center justify-between hover:bg-[#091124] rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon Circle */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          tx.isOut
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        }`}
                      >
                        {tx.isOut ? (
                          <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUp className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-100">
                          {tx.materialName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {tx.date}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-xs font-bold font-mono ${
                        tx.isOut ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {tx.qtyFormatted}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeSubView === 'civil_infra' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c1427] border border-[#182643]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ROAD & HIGHWAY CIVIL TELEMETRY
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  NH-48 6-Lane Expressway (Package 3)
                </h3>
                <p className="text-xs text-slate-400">
                  Chainage Km 120+000 to Km 162+500 • Total Length 42.50 Km
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigateTab('road-chainage')}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Open Chainage Matrix
                </button>
              </div>
            </div>

            {/* Road Layers Progress Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { layer: 'Earthwork / Embankment', completed: '15.00 Km', pct: 100, color: 'bg-emerald-500' },
                { layer: 'Subgrade / Murum', completed: '12.50 Km', pct: 83.3, color: 'bg-emerald-500' },
                { layer: 'Granular Sub-Base (GSB)', completed: '10.00 Km', pct: 66.7, color: 'bg-blue-500' },
                { layer: 'Wet Mix Macadam (WMM)', completed: '7.50 Km', pct: 50.0, color: 'bg-amber-500' },
                { layer: 'Dense Bituminous Macadam (DBM)', completed: '5.00 Km', pct: 33.3, color: 'bg-purple-500' },
                { layer: 'Bituminous Concrete (BC Top)', completed: '3.00 Km', pct: 20.0, color: 'bg-cyan-500' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#080e1e] border border-[#142038]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white">{item.layer}</span>
                    <span className="text-slate-300 font-mono">{item.completed}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Target: 15.00 Km Section A</span>
                    <span className="font-semibold text-slate-200">{item.pct}% Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'building_rcc' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c1427] border border-[#182643]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  BUILDING & RCC STRUCTURAL TELEMETRY
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Zenith Heights Premium Residential (G+14)
                </h3>
                <p className="text-xs text-slate-400">
                  Sector 45 Baner • 14 Floors • Footings, Columns, Beams & Slabs
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigateTab('bldg-floors')}
                  className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Open Floor Tracking
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#080e1e] border border-[#142038]">
                <div className="text-xs text-slate-400">Active Floor</div>
                <div className="text-xl font-bold text-white mt-1">5th Floor Slab</div>
                <div className="text-[11px] text-emerald-400 mt-1">RCC Concrete Pour Ready</div>
              </div>
              <div className="p-4 rounded-xl bg-[#080e1e] border border-[#142038]">
                <div className="text-xs text-slate-400">Total Steel Bound</div>
                <div className="text-xl font-bold text-white mt-1">80.7 Tonnes</div>
                <div className="text-[11px] text-blue-400 mt-1">Fe550D TMT Rebar</div>
              </div>
              <div className="p-4 rounded-xl bg-[#080e1e] border border-[#142038]">
                <div className="text-xs text-slate-400">RMC Consumed</div>
                <div className="text-xl font-bold text-white mt-1">1,240 m³</div>
                <div className="text-[11px] text-amber-400 mt-1">M25 / M30 Grade</div>
              </div>
              <div className="p-4 rounded-xl bg-[#080e1e] border border-[#142038]">
                <div className="text-xs text-slate-400">Overall Progress</div>
                <div className="text-xl font-bold text-white mt-1">46.8%</div>
                <div className="text-[11px] text-purple-400 mt-1">Structure on schedule</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
