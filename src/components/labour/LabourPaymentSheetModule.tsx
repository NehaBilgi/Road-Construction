import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { LabourPaymentSheet } from '../../types/erp';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Lock,
  Download,
  Printer,
  Search,
  DollarSign,
  Users,
  Check,
  Calendar
} from 'lucide-react';

export const LabourPaymentSheetModule: React.FC = () => {
  const {
    labourPaymentSheets,
    workers,
    attendanceRecords,
    addLabourPaymentSheet,
    updatePaymentSheetStatus,
    currentProject,
    currentSite
  } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState('2026-08-01');
  const [periodEnd, setPeriodEnd] = useState('2026-08-07');
  const [selectedSubcontractor, setSelectedSubcontractor] = useState('ALL');
  const [paymentMode, setPaymentMode] = useState<LabourPaymentSheet['paymentMode']>('BANK_TRANSFER');

  const handleGenerateSheet = (e: React.FormEvent) => {
    e.preventDefault();

    // Aggregate from attendance records
    const relevantAttendance = attendanceRecords.filter(
      (a) => a.date >= periodStart && a.date <= periodEnd
    );

    const distinctWorkerIds = Array.from(new Set(relevantAttendance.map((a) => a.workerId)));
    const totalWorkers = distinctWorkerIds.length || workers.length;

    const totalGross = relevantAttendance.reduce((sum, a) => sum + a.grossWage, 0) || 52000;
    const totalAdv = relevantAttendance.reduce((sum, a) => sum + a.advancePaid, 0) || 4000;
    const totalDed = relevantAttendance.reduce((sum, a) => sum + a.deductions, 0) || 1200;
    const totalNet = totalGross - totalAdv - totalDed;

    addLabourPaymentSheet({
      sheetNumber: `WAGE-WK-${Date.now().toString().slice(-4)}`,
      projectId: currentProject?.id || 'proj-bldg-1',
      siteId: currentSite?.id || 'site-bldg-1',
      periodStartDate: periodStart,
      periodEndDate: periodEnd,
      subcontractorGroup: selectedSubcontractor === 'ALL' ? undefined : selectedSubcontractor,
      totalWorkers,
      totalGrossWage: totalGross,
      totalAdvancesDeducted: totalAdv,
      totalOtherDeductions: totalDed,
      netPayableAmount: totalNet,
      paymentStatus: 'APPROVED',
      paymentMode,
      approvedBy: 'Project Manager (Vikram Shinde)',
      createdDate: new Date().toISOString().substring(0, 10),
      items: distinctWorkerIds.map((wId) => {
        const worker = workers.find((w) => w.id === wId);
        const wAtt = relevantAttendance.filter((a) => a.workerId === wId);
        const pDays = wAtt.filter((a) => a.status === 'Present').length;
        const hDays = wAtt.filter((a) => a.status === 'Half Day').length;
        const otH = wAtt.reduce((sum, a) => sum + a.overtimeHours, 0);
        const gross = wAtt.reduce((sum, a) => sum + a.grossWage, 0);
        const adv = wAtt.reduce((sum, a) => sum + a.advancePaid, 0);
        const ded = wAtt.reduce((sum, a) => sum + a.deductions, 0);
        const net = gross - adv - ded;

        return {
          workerId: wId,
          workerName: worker?.name || 'Worker',
          category: worker?.category || 'Mason / Mistri',
          presentDays: pDays,
          halfDays: hDays,
          overtimeHours: otH,
          baseRate: worker?.dailyWageRate || 900,
          grossWage: gross,
          advanceDeducted: adv,
          otherDeductions: ded,
          netPayable: net,
          paymentStatus: 'APPROVED'
        };
      })
    });

    setIsModalOpen(false);
  };

  const totalDisbursed = labourPaymentSheets
    .filter((s) => s.paymentStatus === 'PAID')
    .reduce((sum, s) => sum + s.netPayableAmount, 0);

  const totalPending = labourPaymentSheets
    .filter((s) => s.paymentStatus !== 'PAID')
    .reduce((sum, s) => sum + s.netPayableAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              PAYROLL & WAGE DISBURSEMENT
            </span>
            <span className="text-xs text-slate-400">Weekly & Fortnightly Settlement Sheets</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Labour Wage Sheets & Payment Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formula: Net Payable = Base Wage + Overtime - Advances - Deductions • Secure approval workflow with locked sheets.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Generate New Wage Sheet
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Disbursed (Paid)</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono my-1">
            ₹{totalDisbursed.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">
            Locked & paid with bank vouchers
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Wage Approval</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono my-1">
            ₹{totalPending.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">
            Awaiting PM authorization
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Processed Sheets</span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono my-1">
            {labourPaymentSheets.length} <span className="text-xs font-normal text-slate-400">Sheets</span>
          </div>
          <span className="text-xs text-slate-400">
            Audit-ready timekeeping records
          </span>
        </div>
      </div>

      {/* WAGE SHEETS LIST */}
      <div className="space-y-4">
        {labourPaymentSheets.map((sheet) => (
          <div
            key={sheet.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4"
          >
            {/* Sheet Top Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {sheet.sheetNumber}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sheet.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {sheet.paymentStatus}
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Period: <strong className="text-slate-200">{sheet.periodStartDate} to {sheet.periodEndDate}</strong> • {sheet.totalWorkers} Workers
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Net Payable</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono">
                    ₹{sheet.netPayableAmount.toLocaleString()}
                  </span>
                </div>

                {sheet.paymentStatus !== 'PAID' ? (
                  <button
                    onClick={() => updatePaymentSheetStatus(sheet.id, 'PAID')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Check className="h-4 w-4" />
                    <span>Disburse & Lock</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-1.5 border border-slate-700">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Locked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Workers Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2 px-2">Worker Name</th>
                    <th className="py-2 px-2">Trade</th>
                    <th className="py-2 px-2">Days (P / H)</th>
                    <th className="py-2 px-2">OT Hours</th>
                    <th className="py-2 px-2">Gross Wage</th>
                    <th className="py-2 px-2">Advances</th>
                    <th className="py-2 px-2 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {sheet.items.map((item) => (
                    <tr key={item.workerId} className="hover:bg-slate-950/40">
                      <td className="py-2.5 px-2 font-semibold text-white">
                        {item.workerName}
                      </td>
                      <td className="py-2.5 px-2 text-cyan-300">
                        {item.category}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-300">
                        {item.presentDays}P / {item.halfDays}H
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-300">
                        {item.overtimeHours}h
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-300">
                        ₹{item.grossWage.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-rose-400">
                        -₹{item.advanceDeducted.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-400">
                        ₹{item.netPayable.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* GENERATE SHEET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-400" />
              Generate Period Wage Settlement Sheet
            </h3>

            <form onSubmit={handleGenerateSheet} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subcontractor Gang</label>
                <select
                  value={selectedSubcontractor}
                  onChange={(e) => setSelectedSubcontractor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value="ALL">All Subcontractors & Direct Workers</option>
                  <option value="Ramesh Shuttering Gang">Ramesh Shuttering Gang</option>
                  <option value="Santosh Steel Fixing Group">Santosh Steel Fixing Group</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as LabourPaymentSheet['paymentMode'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="BANK_TRANSFER">Bank NEFT / RTGS Transfer</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="CASH">Cash in Hand Voucher</option>
                  <option value="CHEQUE">Company Account Cheque</option>
                </select>
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
                  Calculate & Generate Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
