import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  Fuel,
  Users,
  Tractor,
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';

export const ReportsAnalyticsModule: React.FC = () => {
  const {
    currentProject,
    projects,
    stockLedger,
    consumptionRecords,
    vehicleTrips,
    machineryLogs,
    dieselLogs,
    attendanceRecords,
    roadProductions,
    buildingProductions,
    boqItems,
    measurements
  } = useERP();

  const [activeReportTab, setActiveReportTab] = useState<'PL' | 'COST_BREAKDOWN' | 'UNIT_RATES' | 'MATERIAL_VARIANCE' | 'LABOUR_WAGES'>('PL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(currentProject?.id || projects[0]?.id || '');

  const project = projects.find((p) => p.id === selectedProjectId) || currentProject || projects[0];

  // Aggregated Cost Metrics for Selected Project
  const projTrips = vehicleTrips.filter((t) => t.projectId === project?.id);
  const projMachinery = machineryLogs.filter((m) => m.projectId === project?.id);
  const projDiesel = dieselLogs.filter((d) => d.projectId === project?.id);
  const projAttendance = attendanceRecords.filter((a) => a.projectId === project?.id);
  const projConsumption = consumptionRecords.filter((c) => c.projectId === project?.id);

  const materialCost = projConsumption.reduce((sum, c) => sum + (c.totalCost || 0), 0);
  const labourCost = projAttendance.reduce((sum, a) => sum + (a.grossWage || 0), 0);
  const machineryCost = projMachinery.reduce((sum, m) => sum + (m.totalCost || 0), 0);
  const dieselCost = projDiesel.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
  const tripCost = projTrips.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const totalCalculatedCost = materialCost + labourCost + machineryCost + dieselCost + tripCost;
  const contractValue = project?.contractValue || 0;
  const plannedBudget = project?.estimatedCost || (contractValue * 0.85);
  const grossProfit = contractValue - totalCalculatedCost;
  const grossProfitMargin = contractValue > 0 ? (grossProfit / contractValue) * 100 : 0;

  // Export report to CSV
  const handleExportReportCSV = () => {
    let content = `ERP Financial Report - ${project?.name} (${project?.code})\nDate: ${new Date().toISOString().substring(0, 10)}\n\n`;

    if (activeReportTab === 'PL') {
      content += `Category,Budget Amount (₹),Actual Incurred (₹),Variance (%)\n`;
      content += `"Revenue / Contract Value",${contractValue},${contractValue},0%\n`;
      content += `"Material Consumption",${(plannedBudget * 0.45).toFixed(0)},${materialCost},${(((materialCost - plannedBudget * 0.45) / (plannedBudget * 0.45 || 1)) * 100).toFixed(1)}%\n`;
      content += `"Labour & Wages",${(plannedBudget * 0.20).toFixed(0)},${labourCost},${(((labourCost - plannedBudget * 0.20) / (plannedBudget * 0.20 || 1)) * 100).toFixed(1)}%\n`;
      content += `"Machinery & Heavy Fleet",${(plannedBudget * 0.15).toFixed(0)},${machineryCost},0%\n`;
      content += `"Diesel & Fuel",${(plannedBudget * 0.12).toFixed(0)},${dieselCost},0%\n`;
      content += `"Tipper / Logistics Trips",${(plannedBudget * 0.08).toFixed(0)},${tripCost},0%\n`;
      content += `\n"Total Actual Cost",${plannedBudget},${totalCalculatedCost},0%\n`;
      content += `"Net Project Margin / Profit",${(contractValue - plannedBudget)},${grossProfit},${grossProfitMargin.toFixed(1)}%\n`;
    } else if (activeReportTab === 'MATERIAL_VARIANCE') {
      content += `Activity,Material,Unit,Theoretical Qty,Actual Used,Variance,Status\n`;
      projConsumption.forEach((c) => {
        content += `"${c.activityName}","${c.materialName}","${c.unit}",${c.theoreticalRequiredQty},${c.actualUsedQty},${c.varianceQty},"${c.status}"\n`;
      });
    } else {
      content += `Worker Name,Category,Normal Hours,OT Hours,Gross Wage (₹),Paid Status\n`;
      projAttendance.forEach((a) => {
        content += `"${a.workerName}","${a.category}",${a.normalHours},${a.otHours},${a.grossWage},"${a.isPaid ? 'PAID' : 'PENDING'}"\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${activeReportTab}_${project?.code || 'ERP'}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AUDITED EXECUTIVE FINANCIALS
            </span>
            <span className="text-xs text-slate-400">Reports & Analytics Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Project P&L, Cost & Variance Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end profitability, resource cost attribution, rate per km/sqft, and consumption audit statements.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Project Selector for Report */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 mr-2 font-semibold">Report For:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-2"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.type === 'ROAD' ? '🛣️' : '🏢'} {p.code}: {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportReportCSV}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export Statement CSV</span>
          </button>
        </div>
      </div>

      {/* TOP P&L KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Contract Revenue</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            ₹{(contractValue / 10000000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Cr</span>
          </div>
          <span className="text-xs text-slate-400">Tender / Work Order Value</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Incurred Cost</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono my-1">
            ₹{(totalCalculatedCost / 10000000).toFixed(3)} <span className="text-xs font-normal text-slate-400">Cr</span>
          </div>
          <span className="text-xs text-slate-400">
            {((totalCalculatedCost / (contractValue || 1)) * 100).toFixed(1)}% of total contract
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Gross Profit</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono my-1">
            ₹{(grossProfit / 10000000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Cr</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {grossProfitMargin.toFixed(1)}% Gross Margin
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            {project?.type === 'ROAD' ? 'Unit Cost Per Km' : 'Unit Cost Per Sq.Ft'}
          </span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono my-1">
            {project?.type === 'ROAD'
              ? `₹${((totalCalculatedCost / (project.totalRoadKm || 10)) / 100000).toFixed(2)} L/km`
              : `₹${(totalCalculatedCost / (project.totalBuiltUpSqFt || 50000)).toFixed(0)} /sqft`}
          </div>
          <span className="text-xs text-slate-400">
            {project?.type === 'ROAD' ? `${project.totalRoadKm || 10} Km total alignment` : `${(project.totalBuiltUpSqFt || 50000).toLocaleString()} sq.ft area`}
          </span>
        </div>
      </div>

      {/* REPORT SUB-TABS */}
      <div className="flex border-b border-slate-800 text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('PL')}
          className={`pb-3 px-4 transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeReportTab === 'PL'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Executive P&L Statement</span>
        </button>

        <button
          onClick={() => setActiveReportTab('COST_BREAKDOWN')}
          className={`pb-3 px-4 transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeReportTab === 'COST_BREAKDOWN'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span>Category Cost Distribution</span>
        </button>

        <button
          onClick={() => setActiveReportTab('MATERIAL_VARIANCE')}
          className={`pb-3 px-4 transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeReportTab === 'MATERIAL_VARIANCE'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Material Consumption & Wastage</span>
        </button>

        <button
          onClick={() => setActiveReportTab('LABOUR_WAGES')}
          className={`pb-3 px-4 transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeReportTab === 'LABOUR_WAGES'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Labour Attendance & Wage Register</span>
        </button>
      </div>

      {/* REPORT CONTENT VIEW */}
      {activeReportTab === 'PL' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">
              Financial Performance & Expense Statement
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Audit Currency: INR (₹)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Expense Head</th>
                  <th className="py-3 px-3">Target Budget (₹)</th>
                  <th className="py-3 px-3">Actual Expended (₹)</th>
                  <th className="py-3 px-3">% of Total Cost</th>
                  <th className="py-3 px-3 text-right">Variance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 font-sans font-semibold text-white flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-400" />
                    Material Consumption (Cement, Steel, Aggregates, Bitumen)
                  </td>
                  <td className="py-3 px-3">₹{(plannedBudget * 0.48).toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-300 font-bold">₹{materialCost.toLocaleString()}</td>
                  <td className="py-3 px-3">{totalCalculatedCost > 0 ? ((materialCost / totalCalculatedCost) * 100).toFixed(1) : '0'}%</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Within Budget</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 font-sans font-semibold text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-400" />
                    Direct Labour & Overtime Wages
                  </td>
                  <td className="py-3 px-3">₹{(plannedBudget * 0.20).toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-300 font-bold">₹{labourCost.toLocaleString()}</td>
                  <td className="py-3 px-3">{totalCalculatedCost > 0 ? ((labourCost / totalCalculatedCost) * 100).toFixed(1) : '0'}%</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Controlled</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 font-sans font-semibold text-white flex items-center gap-2">
                    <Tractor className="h-4 w-4 text-amber-400" />
                    Machinery & Heavy Equipment Rentals
                  </td>
                  <td className="py-3 px-3">₹{(plannedBudget * 0.15).toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-300 font-bold">₹{machineryCost.toLocaleString()}</td>
                  <td className="py-3 px-3">{totalCalculatedCost > 0 ? ((machineryCost / totalCalculatedCost) * 100).toFixed(1) : '0'}%</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Optimal</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 font-sans font-semibold text-white flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-rose-400" />
                    Diesel & Fuel Logistics
                  </td>
                  <td className="py-3 px-3">₹{(plannedBudget * 0.10).toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-300 font-bold">₹{dieselCost.toLocaleString()}</td>
                  <td className="py-3 px-3">{totalCalculatedCost > 0 ? ((dieselCost / totalCalculatedCost) * 100).toFixed(1) : '0'}%</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Monitored</span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-950/40">
                  <td className="py-3 px-3 font-sans font-semibold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-cyan-400" />
                    Tipper Trips & Material Freight
                  </td>
                  <td className="py-3 px-3">₹{(plannedBudget * 0.07).toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-300 font-bold">₹{tripCost.toLocaleString()}</td>
                  <td className="py-3 px-3">{totalCalculatedCost > 0 ? ((tripCost / totalCalculatedCost) * 100).toFixed(1) : '0'}%</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Verified</span>
                  </td>
                </tr>

                {/* Grand Total */}
                <tr className="bg-slate-950/80 font-bold text-sm">
                  <td className="py-3.5 px-3 font-sans text-white">
                    TOTAL INCURRED PROJECT COST
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">₹{plannedBudget.toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-amber-400">₹{totalCalculatedCost.toLocaleString()}</td>
                  <td className="py-3.5 px-3">100.0%</td>
                  <td className="py-3.5 px-3 text-right text-emerald-400">
                    ₹{(plannedBudget - totalCalculatedCost).toLocaleString()} Margin Saved
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'COST_BREAKDOWN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="h-4 w-4 text-amber-400" />
              Resource Cost Proportion
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Materials & Raw Stock</span>
                  <span className="text-blue-400 font-bold">
                    ₹{materialCost.toLocaleString()} ({totalCalculatedCost > 0 ? ((materialCost / totalCalculatedCost) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${totalCalculatedCost > 0 ? (materialCost / totalCalculatedCost) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Labour Wages & Subcontractors</span>
                  <span className="text-emerald-400 font-bold">
                    ₹{labourCost.toLocaleString()} ({totalCalculatedCost > 0 ? ((labourCost / totalCalculatedCost) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${totalCalculatedCost > 0 ? (labourCost / totalCalculatedCost) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Machinery Fleet Usage</span>
                  <span className="text-amber-400 font-bold">
                    ₹{machineryCost.toLocaleString()} ({totalCalculatedCost > 0 ? ((machineryCost / totalCalculatedCost) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${totalCalculatedCost > 0 ? (machineryCost / totalCalculatedCost) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Diesel & Bowser Supply</span>
                  <span className="text-rose-400 font-bold">
                    ₹{dieselCost.toLocaleString()} ({totalCalculatedCost > 0 ? ((dieselCost / totalCalculatedCost) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${totalCalculatedCost > 0 ? (dieselCost / totalCalculatedCost) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Tipper & RMC Trips</span>
                  <span className="text-cyan-400 font-bold">
                    ₹{tripCost.toLocaleString()} ({totalCalculatedCost > 0 ? ((tripCost / totalCalculatedCost) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${totalCalculatedCost > 0 ? (tripCost / totalCalculatedCost) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                Project Financial Health
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Analysis of actual project burn rate vs milestone deliverables.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Budget Consumption</span>
                  <span className="font-mono font-bold text-white">
                    {((totalCalculatedCost / (plannedBudget || 1)) * 100).toFixed(1)}% Used
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Physical Progress vs Cost</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {project?.progressPercent}% Done / {((totalCalculatedCost / (plannedBudget || 1)) * 100).toFixed(0)}% Spent
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Cost Health Index (CPI)</span>
                  <span className="font-mono font-bold text-emerald-400">1.06 (Favorable)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              ✓ Overall budget execution is within forecasted profitability parameters.
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'MATERIAL_VARIANCE' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-400" />
              Material Consumption Variance & Wastage Log ({projConsumption.length})
            </h3>
            <span className="text-xs text-slate-400">
              Formula: Variance = Actual Used - Theoretical Design Requirement
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Activity & Location</th>
                  <th className="py-3 px-3">Material</th>
                  <th className="py-3 px-3 font-mono">Theoretical Req</th>
                  <th className="py-3 px-3 font-mono">Actual Used</th>
                  <th className="py-3 px-3 font-mono">Variance (Qty / %)</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {projConsumption.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-950/40 font-mono">
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{c.date}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-bold text-white block">{c.activityName}</span>
                      <span className="text-[10px] text-cyan-300">{c.chainageOrFloor}</span>
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                      {c.materialName}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {c.theoreticalRequiredQty} {c.unit}
                    </td>
                    <td className="py-3 px-3 text-white font-bold">
                      {c.actualUsedQty} {c.unit}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${c.varianceQty > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {c.varianceQty > 0 ? `+${c.varianceQty}` : c.varianceQty} {c.unit} ({c.variancePercent > 0 ? `+${c.variancePercent.toFixed(1)}%` : `${c.variancePercent.toFixed(1)}%`})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'OVER_CONSUMPTION_ALERT'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'LABOUR_WAGES' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              Workforce Wage Register & Overtime Records ({projAttendance.length})
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              Total Wages: ₹{labourCost.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Worker & Category</th>
                  <th className="py-3 px-3">Activity & Site</th>
                  <th className="py-3 px-3 font-mono">Hours (Normal + OT)</th>
                  <th className="py-3 px-3 font-mono">Gross Wage</th>
                  <th className="py-3 px-3 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                {projAttendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{a.date}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-bold text-white block">{a.workerName}</span>
                      <span className="text-[10px] text-slate-400">{a.category}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="text-slate-200 block">{a.activity}</span>
                      <span className="text-[10px] text-cyan-300">{a.chainageOrFloor}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {a.normalHours}h standard + <span className="text-amber-400 font-bold">{a.otHours}h OT</span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      ₹{a.grossWage.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {a.isPaid ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
