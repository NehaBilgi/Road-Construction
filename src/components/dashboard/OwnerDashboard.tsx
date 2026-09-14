import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  Fuel,
  Users,
  HardHat,
  Milestone,
  Building2,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Props {
  setActiveTab?: (tab: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const OwnerDashboard: React.FC<Props> = ({ setActiveTab, onNavigateTab }) => {
  const navigate = onNavigateTab || setActiveTab || (() => {});
  const {
    workType,
    setWorkType,
    currentProject,
    projects,
    vehicleTrips,
    dieselLogs,
    attendanceRecords,
    roadProductions,
    buildingProductions,
    consumptionRecords,
    materials
  } = useERP();

  // Financial aggregates
  const totalContractValue = projects.reduce((sum, p) => sum + p.contractValue, 0);
  const totalActualCost = projects.reduce((sum, p) => sum + p.actualCost, 0);
  const totalForecastCost = projects.reduce((sum, p) => sum + (p.forecastFinalCost || p.estimatedCost), 0);
  const expectedProfit = totalContractValue - totalForecastCost;
  const overallProfitMargin = totalContractValue > 0 ? (expectedProfit / totalContractValue) * 100 : 0;

  // Today's Operational numbers (simulated from current date 2026-08-15)
  const todayTrips = vehicleTrips.filter((t) => t.date === '2026-08-15' || t.date === '2026-08-14');
  const todayDieselLitres = dieselLogs.reduce((sum, d) => sum + d.litresDispensed, 0);
  const todayDieselAmount = dieselLogs.reduce((sum, d) => sum + d.totalAmount, 0);
  const activeLabourToday = attendanceRecords.filter((a) => a.status === 'Present').length;
  const todayLabourWages = attendanceRecords.reduce((sum, a) => sum + a.grossWage, 0);
  const todayTripExpenses = todayTrips.reduce((sum, t) => sum + t.totalAmount, 0);

  // Daily Cost Breakdown Calculation
  const materialDailyCost = 441100;
  const labourDailyCost = todayLabourWages || 52000;
  const tripDailyCost = todayTripExpenses || 72750;
  const dieselDailyCost = todayDieselAmount || 24557;
  const machineryDailyCost = 40600;
  const rentalDailyCost = 18000;
  const otherDailyCost = 15000;
  const totalDailyCost =
    materialDailyCost +
    labourDailyCost +
    tripDailyCost +
    dieselDailyCost +
    machineryDailyCost +
    rentalDailyCost +
    otherDailyCost;

  const lowStockCount = materials.filter((m) => m.currentStockTotal <= m.minReorderLevel).length;
  const alertsCount = consumptionRecords.filter((c) => c.status === 'OVER_CONSUMPTION_ALERT').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              EXECUTIVE CONSOLE
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentProject ? currentProject.name : 'Unified Construction Executive Dashboard'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {currentProject ? `${currentProject.client} • Location: ${currentProject.location}` : 'Complete multi-project financial, resource, & site production telemetry'}
          </p>
        </div>

        {/* Quick Stream Jump */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setWorkType('ROAD');
              navigate('road-chainage');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>🛣️ Road View</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setWorkType('BUILDING');
              navigate('bldg-floors');
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>🏢 Building View</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* TOP FINANCIAL & PROJECT KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contract Value */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Contract Value</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mb-1 font-mono">
            ₹{(totalContractValue / 10000000).toFixed(2)} <span className="text-xs text-slate-400 font-normal">Cr</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span>Active Projects:</span>
            <span className="font-bold text-slate-200">{projects.length} Portfolios</span>
          </div>
        </div>

        {/* Actual Expenses Incurred */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actual Cost Incurred</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mb-1 font-mono">
            ₹{(totalActualCost / 10000000).toFixed(2)} <span className="text-xs text-slate-400 font-normal">Cr</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <span>Forecast Final Cost:</span>
            <span className="font-bold text-slate-300">₹{(totalForecastCost / 10000000).toFixed(2)} Cr</span>
          </div>
        </div>

        {/* Expected Net Profit */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Profit (P&L)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mb-1 font-mono">
            ₹{(expectedProfit / 10000000).toFixed(2)} <span className="text-xs text-slate-400 font-normal">Cr</span>
          </div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <span>Margin:</span>
            <span>+{overallProfitMargin.toFixed(1)}%</span>
            <span className="text-[10px] text-slate-400 ml-1">healthy</span>
          </div>
        </div>

        {/* Overall Weighted Progress */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Progress</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mb-2 font-mono">
            {currentProject ? currentProject.progressPercent : 41.3}%
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
              style={{ width: `${currentProject ? currentProject.progressPercent : 41.3}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* TODAY'S SITE OPERATIONS SNAPSHOT & DAILY COST ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2-Col Left: Daily Cost Example & Traceability Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Complete Site Daily Cost Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Formula: Material + Labour + Trips + Diesel + Machinery + Rental + Other = Daily Cost
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Today Cost</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">
                ₹{totalDailyCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">1. Material</span>
              <span className="text-sm font-bold text-slate-100 font-mono">₹{materialDailyCost.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">Cement, WMM, Bitumen</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">2. Labour & Wages</span>
              <span className="text-sm font-bold text-slate-100 font-mono">₹{labourDailyCost.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">{activeLabourToday} workers checked-in</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">3. Trips & Tippers</span>
              <span className="text-sm font-bold text-slate-100 font-mono">₹{tripDailyCost.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">{todayTrips.length} tipper & RMC trips</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">4. Diesel / HSD</span>
              <span className="text-sm font-bold text-slate-100 font-mono">₹{dieselDailyCost.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">{todayDieselLitres} Litres dispensed</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">5. Machinery</span>
              <span className="text-sm font-bold text-slate-100 font-mono">₹{machineryDailyCost.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">JCB, Excavator, Roller</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">6. Rental Fleet</span>
              <span className="text-sm font-bold text-slate-100 font-mono">₹{rentalDailyCost.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">Tower crane, boom pump</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">7. Other Expenses</span>
              <span className="text-sm font-bold text-slate-100 font-mono">₹{otherDailyCost.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">Water curing, survey</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-amber-300 block uppercase">Daily Budget Variance</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">-₹18,400 (Under budget)</span>
              <span className="text-[10px] text-emerald-300/80 block">On Target</span>
            </div>
          </div>

          {/* Quick Metrics Comparison for Road and Building */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Milestone className="h-4 w-4" /> Road Production Telemetry
                </span>
                <button
                  onClick={() => {
                    setWorkType('ROAD');
                    navigate('road-production');
                  }}
                  className="text-[10px] text-slate-400 hover:text-amber-300 font-bold"
                >
                  View Details →
                </button>
              </div>
              <div className="flex items-baseline justify-between text-xs text-slate-300 mb-1">
                <span>Avg Cost / Metre:</span>
                <span className="font-bold text-white font-mono">₹2,825.66 / m</span>
              </div>
              <div className="flex items-baseline justify-between text-xs text-slate-300">
                <span>Avg Cost / Km:</span>
                <span className="font-bold text-amber-400 font-mono">₹28.25 Lakhs / km</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> Building Production Telemetry
                </span>
                <button
                  onClick={() => {
                    setWorkType('BUILDING');
                    setActiveTab('bldg-production');
                  }}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 font-bold"
                >
                  View Details →
                </button>
              </div>
              <div className="flex items-baseline justify-between text-xs text-slate-300 mb-1">
                <span>Avg Cost / Sq.Ft:</span>
                <span className="font-bold text-white font-mono">₹1,480 / sq.ft</span>
              </div>
              <div className="flex items-baseline justify-between text-xs text-slate-300">
                <span>RCC Cost / m³:</span>
                <span className="font-bold text-cyan-400 font-mono">₹11,747 / m³</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Col Right: Alerts & Real-Time Operational Live Feed */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Live Alerts & Action Required
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {lowStockCount + alertsCount} Issues
              </span>
            </div>

            <div className="space-y-3">
              {/* Alert 1: Over consumption */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                  <span>WMM Over-Consumption Alert</span>
                  <span className="text-[10px]">+7.06%</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Km 124+000 consumed 910 Tonnes against 850 Tonnes theoretical. Screed recalibration requested.
                </p>
              </div>

              {/* Alert 2: Low Stock */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span>Reorder Point: Tata Tiscon 8mm Steel</span>
                  <span className="text-[10px] text-slate-400">18.0 Tonnes Left</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Central stock near minimum buffer. Prepare PO for next floor slab casting.
                </p>
              </div>

              {/* Alert 3: Pending wage approvals */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-200 font-bold mb-1">
                  <span>Daily Labour Attendance</span>
                  <span className="text-[10px] text-emerald-400">4 Marked Present</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Gross wages ₹3,670 calculated. Ready for supervisor sign-off.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('reports')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Download Comprehensive Owner Report (PDF / Excel)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
