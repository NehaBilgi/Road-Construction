import React, { useState } from 'react';
import { useRoadERP } from '../../context/RoadERPContext';
import { DailyProgressReport } from '../../types/roadERP';
import {
  FileText,
  TrendingUp,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  Fuel,
  DollarSign,
  Layers,
  Ruler,
  Wifi,
  WifiOff,
  RefreshCw,
  Share2,
  Calendar,
  Building2,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

export const RoadAnalyticsDPRModule: React.FC = () => {
  const {
    project,
    kpis,
    dprReports,
    generateTodayDPR,
    isOnline,
    setIsOnline,
    syncQueue,
    triggerManualSync,
    clearSyncQueue,
    machines,
    trips,
    fuelLogs,
    expenses,
    yieldCalculations
  } = useRoadERP();

  const [activeDprTab, setActiveDprTab] = useState<'kpi_analytics' | 'dpr_builder' | 'offline_sync'>('kpi_analytics');
  const [selectedDPR, setSelectedDPR] = useState<DailyProgressReport>(dprReports[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDPR = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateTodayDPR();
      setSelectedDPR(generated);
      setIsGenerating(false);
      setActiveDprTab('dpr_builder');
    }, 400);
  };

  const handlePrintDPR = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#1b2845] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  MODULE F • NHAI DPR & ANALYTICS
                </span>
                <span className="text-xs text-slate-400">
                  Highway Executive Summary
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Executive Analytics & Daily Progress Report (DPR)
              </h1>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#070c18] rounded-2xl border border-[#182643]">
            <button
              onClick={() => setActiveDprTab('kpi_analytics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDprTab === 'kpi_analytics'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Executive KPIs
            </button>
            <button
              onClick={() => setActiveDprTab('dpr_builder')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDprTab === 'dpr_builder'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Official DPR Sheet
            </button>
            <button
              onClick={() => setActiveDprTab('offline_sync')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDprTab === 'offline_sync'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Offline Sync Engine</span>
              {syncQueue.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                  {syncQueue.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE KPIS */}
      {activeDprTab === 'kpi_analytics' && (
        <div className="space-y-6">
          {/* Main KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Fleet Utilization */}
            <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Fleet Utilization</span>
                <Truck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-cyan-400 font-mono">
                {kpis.fleetUtilizationRate}%
              </div>
              <div className="text-xs text-slate-400">
                <strong className="text-white">{kpis.activeFleetCount}</strong> Active / {kpis.totalFleetCount} Total Machines
              </div>
            </div>

            {/* 2. Material Laid Today */}
            <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Material Hauled & Placed</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono">
                {kpis.totalMaterialTonsLaidToday.toLocaleString()} <span className="text-sm font-sans text-slate-400">Tons</span>
              </div>
              <div className="text-xs text-slate-400">
                Across <strong className="text-white">{kpis.totalTripsLoggedToday}</strong> Weighbridge Tipper Runs
              </div>
            </div>

            {/* 3. Diesel Outflow */}
            <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Diesel Burn & Outflow</span>
                <Fuel className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-3xl font-black text-orange-400 font-mono">
                {kpis.totalFuelBurnedLitresToday.toLocaleString()} <span className="text-sm font-sans text-slate-400">L</span>
              </div>
              <div className="text-xs text-slate-400">
                Valuation: <strong className="text-white">₹{kpis.totalFuelCostINR.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* 4. Cost Per Km */}
            <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Pavement Cost / Km</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                ₹{kpis.averageCostPerKmINR.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400">
                Active 14.5 km stretch accounting
              </div>
            </div>
          </div>

          {/* Section Yield Summary Table in KPI */}
          <div className="rounded-3xl bg-[#0c1427] border border-[#1b2845] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-400" />
                <span>Highway Cross-Section Yield Reconciliation</span>
              </h3>
              <button
                onClick={handleGenerateDPR}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Compiling...' : 'Auto-Generate Today DPR'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {yieldCalculations.map((calc) => (
                <div
                  key={calc.id}
                  className="p-4 rounded-2xl bg-[#070c18] border border-[#182643] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {calc.formattedChainage}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300">
                      {calc.layerName}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#142038] font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">THEORETICAL:</span>
                      <span className="font-bold text-slate-200">{calc.totalWeightTonsRequired} T</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">ACTUAL LAID:</span>
                      <span className="font-bold text-cyan-400">{calc.actualMaterialReceivedTons} T</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">VARIANCE:</span>
                      <span className={`font-bold ${calc.varianceTons > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {calc.varianceTons > 0 ? `+${calc.varianceTons}` : calc.varianceTons} T ({calc.variancePercentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL DPR DOCUMENT SHEET */}
      {activeDprTab === 'dpr_builder' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0c1427] border border-[#1b2845]">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Report Date: <strong className="text-white font-mono">{selectedDPR.reportDate}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintDPR}
                className="px-3.5 py-1.5 rounded-xl bg-[#142038] hover:bg-[#1b2845] text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>

          {/* Printable DPR Document Container */}
          <div className="p-8 rounded-3xl bg-[#070c18] border border-[#1b2845] shadow-2xl text-slate-200 space-y-6 font-sans print:bg-white print:text-black">
            {/* Header / Authority Title */}
            <div className="border-b border-[#1b2845] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-black">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 print:text-amber-700">
                  NATIONAL HIGHWAYS AUTHORITY OF INDIA (NHAI)
                </span>
                <h2 className="text-xl font-black text-white print:text-black">
                  DAILY PROGRESS REPORT (DPR) — HIGHWAY CONSTRUCTION
                </h2>
                <div className="text-xs text-slate-400 print:text-gray-700 mt-0.5">
                  Project: {project.name} | Package: {project.packageCode}
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-400 print:text-gray-700">
                <div>DPR No: <strong className="text-white print:text-black">DPR-{selectedDPR.reportDate.replace(/-/g, '')}-01</strong></div>
                <div>Date: {selectedDPR.reportDate}</div>
                <div>Weather: {selectedDPR.weatherCondition}</div>
              </div>
            </div>

            {/* Project & Contractor Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0c1427] border border-[#182643] text-xs print:bg-gray-100 print:border-gray-300">
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 block">CONCESSIONAIRE / EPC:</span>
                <strong className="text-white print:text-black">{selectedDPR.contractorName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 block">HIGHWAY STRETCH:</span>
                <strong className="text-amber-400 print:text-black font-mono">Ch. {project.startChainageKm} to Ch. {project.endChainageKm}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 block">WORKING SHIFT:</span>
                <strong className="text-white print:text-black">{selectedDPR.workingHours} Hours (Day + Evening)</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 print:text-gray-600 block">LINEAR METERS PAVED:</span>
                <strong className="text-cyan-400 print:text-black font-mono">{selectedDPR.linearMetersPaved} Meters</strong>
              </div>
            </div>

            {/* Production & Trippage Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-amber-400 print:text-black uppercase tracking-wider">
                1. Material Production & Haulage Trippage Summary
              </h4>
              <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#182643] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono print:bg-gray-50 print:border-gray-300">
                <div>
                  <span className="text-[10px] text-slate-500 print:text-gray-600 block">TOTAL TRIPS LOGGED:</span>
                  <strong className="text-xl text-white print:text-black font-bold">{selectedDPR.totalTripsLogged} Trips</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 print:text-gray-600 block">NET MATERIAL LAID:</span>
                  <strong className="text-xl text-cyan-400 print:text-black font-bold">{selectedDPR.totalMaterialTonsLaid} Tons</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 print:text-gray-600 block">DIESEL CONSUMED:</span>
                  <strong className="text-xl text-orange-400 print:text-black font-bold">{selectedDPR.totalFuelBurnedLitres} Litres</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 print:text-gray-600 block">FUEL EXPENDITURE:</span>
                  <strong className="text-xl text-emerald-400 print:text-black font-bold">₹{selectedDPR.totalFuelCostINR.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Fleet Deployment */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-cyan-400 print:text-black uppercase tracking-wider">
                2. Fleet & Equipment Deployment
              </h4>
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643] print:bg-gray-50">
                  <span className="text-[10px] text-slate-500 print:text-gray-600 block">ACTIVE ON SITE:</span>
                  <strong className="text-emerald-400 font-bold">{selectedDPR.activeFleetCount} Units</strong>
                </div>
                <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643] print:bg-gray-50">
                  <span className="text-[10px] text-slate-500 print:text-gray-600 block">IDLE / STANDBY:</span>
                  <strong className="text-amber-400 font-bold">{selectedDPR.idleFleetCount} Units</strong>
                </div>
                <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643] print:bg-gray-50">
                  <span className="text-[10px] text-slate-500 print:text-gray-600 block">BREAKDOWN / SERVICE:</span>
                  <strong className="text-rose-400 font-bold">{selectedDPR.breakdownFleetCount} Units</strong>
                </div>
              </div>
            </div>

            {/* Engineer Sign-Off Section */}
            <div className="pt-8 border-t border-[#1b2845] grid grid-cols-2 gap-8 text-xs print:border-black">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 print:text-gray-600">PREPARED BY (SITE ENGINEER):</div>
                <div className="font-bold text-white print:text-black">{selectedDPR.siteEngineerInCharge}</div>
                <div className="text-[10px] text-slate-500 font-mono">Digitally Verified • Timestamp: 18:30 IST</div>
              </div>

              <div className="space-y-1 text-right">
                <div className="text-[10px] text-slate-500 print:text-gray-600">APPROVED BY (RESIDENT ENGINEER / NHAI AE):</div>
                <div className="font-bold text-amber-400 print:text-black">{selectedDPR.residentEngineerSignOff}</div>
                <div className="text-[10px] text-slate-500 font-mono">Certified as per MoRTH Section 500</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFLINE SYNC ENGINE */}
      {activeDprTab === 'offline_sync' && (
        <div className="space-y-6">
          {/* Network Simulator Controls */}
          <div className="p-5 rounded-3xl bg-[#0c1427] border border-[#1b2845] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Field Connectivity Simulator: {isOnline ? 'ONLINE (4G/5G Site Base)' : 'OFFLINE (Zero Signal Road Trench)'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Toggle to test seamless IndexedDB / LocalStorage queueing and background batch reconciliation.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                  isOnline
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                {isOnline ? 'Simulate Signal Drop (Go Offline)' : 'Reconnect Signal (Go Online)'}
              </button>

              {syncQueue.length > 0 && (
                <button
                  onClick={triggerManualSync}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync {syncQueue.length} Items</span>
                </button>
              )}
            </div>
          </div>

          {/* Sync Queue List */}
          <div className="rounded-3xl bg-[#0c1427] border border-[#1b2845] overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Pending Offline Sync Mutation Queue ({syncQueue.length} Items)
              </h3>
              {syncQueue.length > 0 && (
                <button
                  onClick={clearSyncQueue}
                  className="text-[10px] text-rose-400 hover:underline font-bold"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {syncQueue.length === 0 ? (
              <div className="p-8 text-center bg-[#070c18] rounded-2xl border border-[#182643] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">All Site Logs Fully Synchronized</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Every weighbridge slip, diesel dispensing voucher, and cross-section yield calculation is in sync with the central server.
                </p>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {syncQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#070c18] rounded-xl border border-[#182643] flex items-center justify-between flex-wrap gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                        {item.entityType}
                      </span>
                      <span className="text-slate-300 font-sans">{item.action} Mutation</span>
                    </div>

                    <div className="text-slate-500 text-[10px]">
                      Queued at {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
