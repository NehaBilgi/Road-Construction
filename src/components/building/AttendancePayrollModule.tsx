import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Save,
  UserPlus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
  BookOpen,
  PlusCircle,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  FileDown,
  AlertTriangle,
  MoreHorizontal,
  XCircle,
  IndianRupee,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  date_of_joining: string;
  status: 'Active' | 'Inactive';
  monthly_salary: number;
  per_day_amount: number;
  employee_type: 'employee' | 'non_employee';
}

export interface AdvanceTransaction {
  id: string;
  employee_id: string;
  amount: number;
  transaction_type: 'GIVEN' | 'DEDUCTED';
  date: string;
  notes?: string;
}

const STORAGE_EMPLOYEES_KEY = 'CONSTRUCTION_PRO_ATT_EMPLOYEES_V1';
const STORAGE_GRID_KEY = 'CONSTRUCTION_PRO_ATT_GRID_V1';
const STORAGE_ADVANCES_KEY = 'CONSTRUCTION_PRO_ATT_ADVANCES_V1';

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-01',
    name: 'Hassansab',
    department: 'Crusher',
    role: 'Staff',
    date_of_joining: '2026-07-01',
    status: 'Active',
    monthly_salary: 11000,
    per_day_amount: 300,
    employee_type: 'employee'
  },
  {
    id: 'EMP-02',
    name: 'Imamsab',
    department: 'Crusher',
    role: 'Staff',
    date_of_joining: '2026-07-01',
    status: 'Active',
    monthly_salary: 18000,
    per_day_amount: 300,
    employee_type: 'employee'
  },
  {
    id: 'EMP-03',
    name: 'Valu rathore',
    department: 'Crusher',
    role: 'Staff',
    date_of_joining: '2026-07-01',
    status: 'Active',
    monthly_salary: 12000,
    per_day_amount: 300,
    employee_type: 'employee'
  },
  {
    id: 'EMP-04',
    name: 'Raju Operator',
    department: 'Crusher',
    role: 'Staff',
    date_of_joining: '2026-07-01',
    status: 'Active',
    monthly_salary: 15000,
    per_day_amount: 200,
    employee_type: 'employee'
  }
];

const ITEMS_PER_PAGE = 20;

const STATUS_OPTIONS = [
  {
    code: 'P',
    label: 'Present',
    bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900'
  },
  {
    code: 'A',
    label: 'Absent',
    bg: 'bg-red-950/80 text-red-400 border-red-800/50 hover:bg-red-900'
  },
  {
    code: 'H',
    label: 'Half Day',
    bg: 'bg-amber-950/80 text-amber-400 border-amber-800/50 hover:bg-amber-900'
  },
  {
    code: 'L',
    label: 'Leave',
    bg: 'bg-blue-950/80 text-blue-400 border-blue-800/50 hover:bg-blue-900'
  },
  {
    code: 'O',
    label: 'Holiday/Off',
    bg: 'bg-purple-950/80 text-purple-400 border-purple-800/50 hover:bg-purple-900'
  },
  {
    code: null,
    label: 'Clear Status',
    bg: 'bg-slate-800 text-slate-400 hover:bg-slate-700'
  }
];

const STATUS_CONFIG: Record<string, typeof STATUS_OPTIONS[0]> = STATUS_OPTIONS.reduce((acc, curr) => {
  if (curr.code) acc[curr.code] = curr;
  return acc;
}, {} as any);

// ============================================================================
// HELPER: PRINT PAYROLL SHEET
// ============================================================================
const printPayrollSheet = ({
  employees,
  attendanceGrid,
  unsavedChanges,
  daysInMonth,
  monthName,
  selectedYear,
  payType,
  advances,
  weeklyFromDate,
  weeklyToDate,
  weeklyExtras
}: any) => {
  const getAttendanceCounts = (empId: string) => {
    let daysPresent = 0,
      daysAbsent = 0,
      holidayDays = 0;
    if (payType === 'weekly' && weeklyFromDate && weeklyToDate) {
      const start = new Date(weeklyFromDate);
      const end = new Date(weeklyToDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = `${empId}_${d.toISOString().split('T')[0]}`;
        const status = unsavedChanges[key] !== undefined ? unsavedChanges[key] : attendanceGrid[key];
        if (status === 'P') daysPresent += 1;
        else if (status === 'H') daysPresent += 0.5;
      }
    } else {
      const monthIndex = new Date(`${monthName} 1, ${selectedYear}`).getMonth() + 1;
      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const dateStr = `${selectedYear}-${String(monthIndex).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        const key = `${empId}_${dateStr}`;
        const status = unsavedChanges[key] !== undefined ? unsavedChanges[key] : attendanceGrid[key];
        if (status === 'P') daysPresent += 1;
        else if (status === 'H') daysPresent += 0.5;
        else if (status === 'O') holidayDays += 1;
        else if (status === 'A' || status === 'L') daysAbsent += 1;
      }
    }
    return { daysPresent, daysAbsent, holidayDays };
  };

  let totalPayoutSum = 0;

  const rowsHtml = employees
    .map((emp: Employee) => {
      const { daysPresent, daysAbsent, holidayDays } = getAttendanceCounts(emp.id);
      const advance = Number(advances[emp.id] || 0);
      let salary = 0;

      if (payType === 'weekly') {
        const perDay = Number(emp.per_day_amount || 0);
        const extra = Number(weeklyExtras?.[emp.id] || 0);
        salary = Math.round(Math.max(0, daysPresent * perDay + extra - advance));
        totalPayoutSum += salary;
        return `
        <tr>
          <td style="padding:10px 12px;border:1px solid #d1d5db">${emp.name}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:center">${daysPresent}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">₹${perDay.toLocaleString('en-IN')}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">₹${extra.toLocaleString('en-IN')}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">₹${advance.toLocaleString('en-IN')}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right;font-weight:bold">₹${salary.toLocaleString('en-IN')}</td>
        </tr>`;
      } else {
        const isNonEmp = emp.employee_type === 'non_employee';
        if (isNonEmp) {
          salary = Math.round(Math.max(0, Number(emp.monthly_salary || 0) - advance));
        } else {
          const monthlySalary = Number(emp.monthly_salary || 0);
          const paidAbsent = Math.min(daysAbsent, 2);
          const effectiveDays = daysPresent + holidayDays + paidAbsent;
          const dailyRate = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
          salary = Math.round(Math.max(0, effectiveDays * dailyRate - advance));
        }
        totalPayoutSum += salary;
        const presentLbl = isNonEmp ? '—' : String(daysPresent);
        const absentLbl = isNonEmp ? '—' : String(daysAbsent);
        const baseLbl = isNonEmp ? 'Fixed' : `₹${Number(emp.monthly_salary || 0).toLocaleString('en-IN')}`;
        return `
        <tr>
          <td style="padding:10px 12px;border:1px solid #d1d5db">${emp.name}${isNonEmp ? ' <em style="font-size:10px;color:#6b7280">(Non-Emp)</em>' : ''}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:center">${presentLbl}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:center">${absentLbl}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">${baseLbl}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">₹${advance.toLocaleString('en-IN')}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right;font-weight:bold">₹${salary.toLocaleString('en-IN')}</td>
        </tr>`;
      }
    })
    .join('');

  const dateSubTitle =
    payType === 'weekly'
      ? `Weekly Period (${weeklyFromDate} to ${weeklyToDate})`
      : `Monthly Payment List of ${monthName} ${selectedYear}`;

  const printWindow = window.open('', '', 'width=900,height=650');
  if (!printWindow) return;
  printWindow.document.write(`
    <html><head>
      <title>${payType === 'weekly' ? 'Weekly' : 'Monthly'} Payment List</title>
      <style>
        body{font-family:system-ui,-apple-system,sans-serif;margin:20px;color:#000}
        table{width:100%;border-collapse:collapse;margin-top:15px;font-size:13px}
        th{background-color:#f3f4f6;font-weight:bold;text-align:left;padding:10px 12px;border:1px solid #d1d5db}
        tfoot td{background-color:#f9fafb;font-weight:bold;padding:10px 12px;border:1px solid #d1d5db}
      </style>
    </head><body>
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #000;padding-bottom:12px;margin-bottom:15px">
        <h1 style="margin:0;font-size:26px;font-weight:bold;text-transform:uppercase">M B BILGI CRUSHER</h1>
      </div>
      <div style="text-align:center;margin-bottom:20px">
        <h2 style="margin:0;font-size:18px;font-weight:bold;text-decoration:underline">${dateSubTitle}</h2>
      </div>
      <table>
        <thead><tr>
          <th>Employee Name</th>
          <th style="text-align:center">Days Present</th>
          ${payType === 'monthly' ? '<th style="text-align:center">Days Absent</th>' : ''}
          <th style="text-align:right">${payType === 'weekly' ? 'Per Day Amount' : 'Monthly Salary'}</th>
          ${payType === 'weekly' ? '<th style="text-align:right">Extra Amount</th>' : ''}
          <th style="text-align:right">Advance Deducted</th>
          <th style="text-align:right">Total Net Earned</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot><tr>
          <td colspan="5" style="text-align:right">Total Payable Amount:</td>
          <td style="text-align:right;color:#059669">₹${Math.round(totalPayoutSum).toLocaleString('en-IN')}</td>
        </tr></tfoot>
      </table>
    </body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

// ============================================================================
// HELPER: TALLY EXPORT
// ============================================================================
const exportToTally = ({
  employees,
  attendanceGrid,
  unsavedChanges,
  daysInMonth,
  monthName,
  selectedYear,
  payType,
  advances,
  weeklyFromDate,
  weeklyToDate,
  weeklyExtras
}: any) => {
  const now = new Date();
  const period =
    payType === 'weekly'
      ? `${weeklyFromDate} to ${weeklyToDate}`
      : `${monthName} ${selectedYear}`;

  const getAttendanceCounts = (empId: string) => {
    let daysPresent = 0,
      daysAbsent = 0,
      holidayDays = 0;
    if (payType === 'weekly' && weeklyFromDate && weeklyToDate) {
      const start = new Date(weeklyFromDate);
      const end = new Date(weeklyToDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = `${empId}_${d.toISOString().split('T')[0]}`;
        const s = unsavedChanges[key] !== undefined ? unsavedChanges[key] : attendanceGrid[key];
        if (s === 'P') daysPresent += 1;
        else if (s === 'H') daysPresent += 0.5;
      }
    } else {
      const monthIndex = new Date(`${monthName} 1, ${selectedYear}`).getMonth() + 1;
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYear}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const key = `${empId}_${dateStr}`;
        const s = unsavedChanges[key] !== undefined ? unsavedChanges[key] : attendanceGrid[key];
        if (s === 'P') daysPresent += 1;
        else if (s === 'H') daysPresent += 0.5;
        else if (s === 'O') holidayDays += 1;
        else if (s === 'A' || s === 'L') daysAbsent += 1;
      }
    }
    return { daysPresent, daysAbsent, holidayDays };
  };

  const lines = [];
  lines.push(`M B BILGI CRUSHER — ${payType === 'weekly' ? 'Weekly' : 'Monthly'} Salary Export`);
  lines.push(`Period: ${period}`);
  lines.push(`Exported On: ${now.toLocaleDateString('en-IN')}`);
  lines.push('');
  lines.push('Voucher Type,Party Name (Ledger),Amount,Narration');

  employees.forEach((emp: Employee) => {
    const { daysPresent, daysAbsent, holidayDays } = getAttendanceCounts(emp.id);
    const advance = Number(advances[emp.id] || 0);
    let netPay = 0;

    if (payType === 'weekly') {
      const perDay = Number(emp.per_day_amount || 0);
      const extra = Number(weeklyExtras?.[emp.id] || 0);
      netPay = Math.round(Math.max(0, daysPresent * perDay + extra - advance));
    } else {
      if (emp.employee_type === 'non_employee') {
        netPay = Math.round(Math.max(0, Number(emp.monthly_salary || 0) - advance));
      } else {
        const monthlySalary = Number(emp.monthly_salary || 0);
        const paidAbsent = Math.min(daysAbsent, 2);
        const effectiveDays = daysPresent + holidayDays + paidAbsent;
        const dailyRate = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
        netPay = Math.round(Math.max(0, effectiveDays * dailyRate - advance));
      }
    }

    lines.push(
      `Payment Voucher,${emp.name},${netPay},${payType === 'weekly' ? 'Weekly' : 'Monthly'} Salary — ${period}`
    );
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tally_${payType}_salary_${now.toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  alert('Tally CSV exported successfully!\nImport this file into Tally as Payment Vouchers.');
};

// ============================================================================
// HELPER: PRINT ADVANCE LEDGER
// ============================================================================
const printAdvanceLedger = (emp: Employee, ledgerData: Record<string, AdvanceTransaction[]>) => {
  const history = ledgerData[emp.id] || [];
  let totalGiven = 0,
    totalDeducted = 0;
  history.forEach((tx) => {
    const t = (tx.transaction_type || '').toUpperCase();
    if (t === 'GIVEN') totalGiven += Number(tx.amount || 0);
    if (t === 'DEDUCTED') totalDeducted += Number(tx.amount || 0);
  });
  const outstandingBalance = Math.max(0, totalGiven - totalDeducted);

  const rowsHtml = history
    .map((tx) => {
      const isGiven = tx.transaction_type === 'GIVEN';
      return `
      <tr>
        <td style="padding:8px 10px;border:1px solid #d1d5db">${tx.date ? tx.date.split('T')[0] : 'N/A'}</td>
        <td style="padding:8px 10px;border:1px solid #d1d5db">${isGiven ? 'Advance Given' : 'Salary Deduction'}</td>
        <td style="padding:8px 10px;border:1px solid #d1d5db">${tx.notes || ''}</td>
        <td style="padding:8px 10px;border:1px solid #d1d5db;text-align:right;color:${isGiven ? '#d97706' : '#059669'};font-weight:bold">
          ${isGiven ? '+' : '-'}₹${Number(tx.amount).toLocaleString('en-IN')}
        </td>
      </tr>`;
    })
    .join('');

  const w = window.open('', '', 'width=720,height=600');
  if (!w) return;
  w.document.write(`
    <html><head>
      <title>Advance Ledger — ${emp.name}</title>
      <style>
        body{font-family:system-ui,sans-serif;margin:20px;color:#000}
        table{width:100%;border-collapse:collapse;margin-top:15px;font-size:13px}
        th{background:#f3f4f6;font-weight:bold;padding:8px 10px;border:1px solid #d1d5db;text-align:left}
        .summary{display:flex;gap:24px;margin:16px 0;padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px}
        .s-box{text-align:center}.s-label{font-size:11px;color:#6b7280;text-transform:uppercase;font-weight:600}
        .s-val{font-size:16px;font-weight:bold;margin-top:4px}
      </style>
    </head><body>
      <div style="border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:14px">
        <h1 style="margin:0;font-size:22px;font-weight:bold;text-transform:uppercase">M B BILGI CRUSHER</h1>
        <p style="margin:4px 0 0;color:#6b7280;font-size:13px">Advance Ledger — ${emp.name} (${emp.role || ''} · ${emp.department || ''})</p>
      </div>
      <div class="summary">
        <div class="s-box"><div class="s-label">Total Given</div><div class="s-val" style="color:#d97706">₹${totalGiven.toLocaleString('en-IN')}</div></div>
        <div class="s-box"><div class="s-label">Total Deducted</div><div class="s-val" style="color:#059669">₹${totalDeducted.toLocaleString('en-IN')}</div></div>
        <div class="s-box"><div class="s-label">Outstanding Balance</div><div class="s-val" style="color:#dc2626">₹${outstandingBalance.toLocaleString('en-IN')}</div></div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Transaction Type</th><th>Notes</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="4" style="text-align:center;padding:16px;color:#6b7280">No transactions yet</td></tr>'}
        </tbody>
      </table>
    </body></html>`);
  w.document.close();
  w.focus();
  w.print();
  w.close();
};

function Pagination({ page, total, perPage, onChange }: any) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/60 rounded-b-2xl flex-wrap gap-2">
      <p className="text-xs text-slate-400">
        Showing <span className="font-semibold text-slate-200">{from}–{to}</span> of{' '}
        <span className="font-semibold text-slate-200">{total}</span> employees
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={12} /> Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-7 h-7 text-xs rounded-lg border transition-colors font-medium ${
              p === page
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function EmpPanel({ emp, ledgerTotals, onAdvance, onHistory, onEdit, onClear, onDelete, onClose }: any) {
  const { totalGiven = 0, totalDeducted = 0, outstandingBalance = 0 } = ledgerTotals || {};
  const isNonEmp = emp.employee_type === 'non_employee';
  const initials = emp.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  const panelBtn = (icon: any, title: string, desc: string, accentBg: string, onClick: any, danger = false) => (
    <button
      onClick={() => {
        onClick();
        onClose();
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
        danger ? 'bg-red-950/30 border-red-900/50 hover:bg-red-950/50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg ${accentBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-semibold text-xs ${danger ? 'text-red-300' : 'text-slate-100'}`}>{title}</p>
        <p className={`text-[10px] ${danger ? 'text-red-400/60' : 'text-slate-500'} truncate`}>{desc}</p>
      </div>
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{emp.name}</p>
              <p className="text-[11px] text-slate-400">{emp.role} · {emp.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className={`text-[10px] px-2 py-1 rounded-full border font-semibold flex items-center gap-1 ${
              emp.status === 'Active' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-red-950/60 text-red-400 border-red-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {emp.status}
            </span>
            {isNonEmp && (
              <span className="text-[10px] px-2 py-1 bg-indigo-950/60 text-indigo-300 border border-indigo-800 rounded-full font-semibold">
                Fixed / Non-Emp
              </span>
            )}
            <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full flex items-center gap-1">
              <Calendar size={10} /> Joined {emp.date_of_joining ? emp.date_of_joining.split('T')[0] : 'N/A'}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Financial Overview</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1">
                  <IndianRupee size={10} /> Monthly Base
                </p>
                <p className="font-bold text-white text-sm">₹{Number(emp.monthly_salary || 0).toLocaleString('en-IN')}</p>
              </div>
              {!isNonEmp && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1">
                    <IndianRupee size={10} /> Per Day
                  </p>
                  <p className="font-bold text-white text-sm">₹{Number(emp.per_day_amount || 0).toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5 text-amber-400">
                  <TrendingUp size={10} />
                  <span className="text-[10px]">Given</span>
                </div>
                <p className="font-bold text-amber-400 text-sm">₹{totalGiven.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5 text-emerald-400">
                  <TrendingDown size={10} />
                  <span className="text-[10px]">Recovered</span>
                </div>
                <p className="font-bold text-emerald-400 text-sm">₹{totalDeducted.toLocaleString('en-IN')}</p>
              </div>
              <div className={`bg-slate-800 rounded-xl p-3 text-center border ${outstandingBalance > 0 ? 'border-red-900/50' : 'border-slate-700'}`}>
                <div className={`flex items-center justify-center gap-1 mb-0.5 ${outstandingBalance > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  <AlertTriangle size={10} />
                  <span className="text-[10px]">Balance</span>
                </div>
                <p className={`font-bold text-sm ${outstandingBalance > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  ₹{outstandingBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Ledger Actions</p>
            <div className="space-y-2">
              {panelBtn(
                <PlusCircle size={15} className="text-amber-400" />,
                'Record Advance',
                'Log a cash advance given to employee',
                'bg-amber-500/10 border border-amber-700/40',
                onAdvance
              )}
              {panelBtn(
                <History size={15} className="text-blue-400" />,
                'View Ledger / History',
                'See all advance transactions & deductions',
                'bg-blue-500/10 border border-blue-700/40',
                onHistory
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 border-t border-slate-800" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-1">Settings</span>
              <div className="flex-1 border-t border-slate-800" />
            </div>
            <div className="space-y-2">
              {panelBtn(
                <Edit2 size={15} className="text-indigo-400" />,
                'Edit Employee',
                'Update name, salary, role or department',
                'bg-indigo-500/10 border border-indigo-700/40',
                onEdit
              )}
              {panelBtn(
                <XCircle size={15} className="text-orange-400" />,
                'Clear All Advances',
                'Reset outstanding advance ledger to ₹0',
                'bg-orange-500/10 border border-orange-700/40',
                onClear
              )}
              {panelBtn(
                <Trash2 size={15} className="text-red-400" />,
                'Delete Employee',
                'Permanently remove record & all data',
                'bg-red-500/10 border border-red-800/40',
                onDelete,
                true
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// MAIN ATTENDANCE & PAYROLL MODULE COMPONENT
// ============================================================================
export const AttendancePayrollModule: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'attendance' | 'payroll' | 'register'>('attendance');
  const [payTypeMode, setPayTypeMode] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const [weeklyFromDate, setWeeklyFromDate] = useState(
    () => localStorage.getItem('att_weeklyFrom') || new Date(Date.now() - 7 * 864e5).toISOString().split('T')[0]
  );
  const [weeklyToDate, setWeeklyToDate] = useState(
    () => localStorage.getItem('att_weeklyTo') || new Date().toISOString().split('T')[0]
  );

  const handleWeeklyFromChange = (v: string) => {
    setWeeklyFromDate(v);
    localStorage.setItem('att_weeklyFrom', v);
  };
  const handleWeeklyToChange = (v: string) => {
    setWeeklyToDate(v);
    localStorage.setItem('att_weeklyTo', v);
  };

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EMPLOYEES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [attendanceGrid, setAttendanceGrid] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GRID_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, string>>({});
  const [advances, setAdvances] = useState<Record<string, number>>({});
  const [ledgerData, setLedgerData] = useState<Record<string, AdvanceTransaction[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADVANCES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [saving, setSaving] = useState(false);
  const [weeklyExtras, setWeeklyExtras] = useState<Record<string, number>>({});
  const [activeCellMenu, setActiveCellMenu] = useState<{ empId: string; dateStr: string; x: number; y: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState<Omit<Employee, 'id'>>({
    name: '',
    department: '',
    role: 'Staff',
    date_of_joining: new Date().toISOString().split('T')[0],
    status: 'Active',
    monthly_salary: 0,
    per_day_amount: 0,
    employee_type: 'employee'
  });

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedEmpForAdvance, setSelectedEmpForAdvance] = useState<Employee | null>(null);
  const [advanceForm, setAdvanceForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    transaction_type: 'GIVEN' as 'GIVEN' | 'DEDUCTED',
    notes: 'Cash Advance'
  });

  const [ledgerViewEmp, setLedgerViewEmp] = useState<Employee | null>(null);
  const [selectedRegEmp, setSelectedRegEmp] = useState<Employee | null>(null);
  const [clearConfirmEmp, setClearConfirmEmp] = useState<Employee | null>(null);

  const [regPage, setRegPage] = useState(1);
  const [gridPage, setGridPage] = useState(1);
  const [payPage, setPayPage] = useState(1);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_EMPLOYEES_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_GRID_KEY, JSON.stringify(attendanceGrid));
  }, [attendanceGrid]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ADVANCES_KEY, JSON.stringify(ledgerData));
  }, [ledgerData]);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const changeMonth = (offset: number) => {
    const nextPeriod = new Date(selectedYear, selectedMonth - 1 + offset, 1);
    setSelectedYear(nextPeriod.getFullYear());
    setSelectedMonth(nextPeriod.getMonth() + 1);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveCellMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCellClick = (e: React.MouseEvent, empId: string, dateStr: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 220;
    const dropdownWidth = 160;

    let y = rect.bottom + window.scrollY;
    let x = rect.left + window.scrollX;

    if (rect.bottom + dropdownHeight > window.innerHeight) {
      y = rect.top + window.scrollY - dropdownHeight;
    }
    if (rect.left + dropdownWidth > window.innerWidth) {
      x = window.innerWidth - dropdownWidth - 16;
    }

    setActiveCellMenu({ empId, dateStr, x, y });
  };

  const selectStatusForCell = (status: string | null) => {
    if (!activeCellMenu) return;
    const key = `${activeCellMenu.empId}_${activeCellMenu.dateStr}`;
    setUnsavedChanges((prev) => ({ ...prev, [key]: status || '' }));
    setActiveCellMenu(null);
  };

  const handleSaveChanges = () => {
    setSaving(true);
    setAttendanceGrid((prev) => ({ ...prev, ...unsavedChanges }));
    setUnsavedChanges({});
    setSaving(false);
    alert('Attendance saved successfully!');
  };

  const getEmpLedgerTotals = (empId: string) => {
    const history = ledgerData[empId] || [];
    let totalGiven = 0,
      totalDeducted = 0;
    history.forEach((tx) => {
      if (tx.transaction_type === 'GIVEN') totalGiven += Number(tx.amount || 0);
      if (tx.transaction_type === 'DEDUCTED') totalDeducted += Number(tx.amount || 0);
    });
    return {
      totalGiven,
      totalDeducted,
      outstandingBalance: Math.max(0, totalGiven - totalDeducted),
      history
    };
  };

  const handleGiveAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForAdvance || !advanceForm.amount) return;

    const newTx: AdvanceTransaction = {
      id: `ADV-${Date.now()}`,
      employee_id: selectedEmpForAdvance.id,
      amount: Number(advanceForm.amount),
      transaction_type: advanceForm.transaction_type,
      date: advanceForm.date,
      notes: advanceForm.notes
    };

    setLedgerData((prev) => ({
      ...prev,
      [selectedEmpForAdvance.id]: [newTx, ...(prev[selectedEmpForAdvance.id] || [])]
    }));

    setIsAdvanceModalOpen(false);
    setAdvanceForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      transaction_type: 'GIVEN',
      notes: 'Cash Advance'
    });
  };

  const handleClearAllAdvances = (empId: string) => {
    setLedgerData((prev) => {
      const updated = { ...prev };
      delete updated[empId];
      return updated;
    });
    setClearConfirmEmp(null);
    if (ledgerViewEmp?.id === empId) setLedgerViewEmp(null);
    alert('All advance records cleared successfully.');
  };

  const handleSettleSalaryDeduction = (empId: string) => {
    const deductionAmt = Number(advances[empId] || 0);
    if (deductionAmt <= 0) {
      alert('Please enter an advance deduction amount first.');
      return;
    }

    const newTx: AdvanceTransaction = {
      id: `DED-${Date.now()}`,
      employee_id: empId,
      amount: deductionAmt,
      transaction_type: 'DEDUCTED',
      date: new Date().toISOString().split('T')[0],
      notes: `Deducted during ${payTypeMode === 'weekly' ? 'Weekly' : 'Monthly'} Salary Settlement`
    };

    setLedgerData((prev) => ({
      ...prev,
      [empId]: [newTx, ...(prev[empId] || [])]
    }));

    alert(`Successfully deducted ₹${deductionAmt.toLocaleString('en-IN')}!`);
  };

  const openAddModal = () => {
    setEditingEmp(null);
    setEmpForm({
      name: '',
      department: '',
      role: 'Staff',
      date_of_joining: new Date().toISOString().split('T')[0],
      status: 'Active',
      monthly_salary: 0,
      per_day_amount: 0,
      employee_type: 'employee'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setEmpForm({
      name: emp.name || '',
      department: emp.department || '',
      role: emp.role || 'Staff',
      date_of_joining: emp.date_of_joining || '',
      status: emp.status || 'Active',
      monthly_salary: emp.monthly_salary || 0,
      per_day_amount: emp.per_day_amount || 0,
      employee_type: emp.employee_type || 'employee'
    });
    setIsModalOpen(true);
  };

  const handleEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name.trim()) return;

    if (editingEmp) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editingEmp.id ? { ...emp, ...empForm } : emp))
      );
    } else {
      const newEmp: Employee = {
        id: `EMP-${Date.now().toString().slice(-4)}`,
        ...empForm
      };
      setEmployees((prev) => [...prev, newEmp]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEmp = (id: string) => {
    if (!window.confirm('Delete this employee record?')) return;
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', {
    month: 'long'
  });

  const filteredEmployees = employees.filter((emp) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Active') return emp.status === 'Active';
    if (selectedFilter === 'Inactive') return emp.status === 'Inactive';
    return emp.department === selectedFilter;
  });

  const regularEmployees = filteredEmployees.filter((e) => e.employee_type !== 'non_employee');
  const payrollEmployees = payTypeMode === 'weekly' ? regularEmployees : filteredEmployees;

  const getEmpAttendanceMetrics = (empId: string) => {
    let daysPresent = 0,
      daysAbsent = 0,
      holidayDays = 0;

    if (activeTab === 'payroll' && payTypeMode === 'weekly' && weeklyFromDate && weeklyToDate) {
      const start = new Date(weeklyFromDate);
      const end = new Date(weeklyToDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const key = `${empId}_${dateStr}`;
        const status = unsavedChanges[key] !== undefined ? unsavedChanges[key] : attendanceGrid[key];
        if (status === 'P') daysPresent += 1;
        else if (status === 'H') daysPresent += 0.5;
      }
    } else {
      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        const key = `${empId}_${dateStr}`;
        const status = unsavedChanges[key] !== undefined ? unsavedChanges[key] : attendanceGrid[key];
        if (status === 'P') daysPresent += 1;
        else if (status === 'H') daysPresent += 0.5;
        else if (status === 'O') holidayDays += 1;
        else if (status === 'A' || status === 'L') daysAbsent += 1;
      }
    }
    return { daysPresent, daysAbsent, holidayDays };
  };

  const calculateTotalPayroll = () => {
    return payrollEmployees.reduce((acc, emp) => {
      const { daysPresent, daysAbsent, holidayDays } = getEmpAttendanceMetrics(emp.id);
      const advance = Number(advances[emp.id] || 0);

      if (payTypeMode === 'weekly') {
        const extra = Number(weeklyExtras[emp.id] || 0);
        const gross = daysPresent * Number(emp.per_day_amount || 0) + extra;
        return acc + Math.round(Math.max(0, gross - advance));
      } else {
        if (emp.employee_type === 'non_employee') {
          return acc + Math.round(Math.max(0, Number(emp.monthly_salary || 0) - advance));
        }
        const monthlySalary = Number(emp.monthly_salary || 0);
        const paidAbsent = Math.min(daysAbsent, 2);
        const effectiveDays = daysPresent + holidayDays + paidAbsent;
        const dailyRate = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
        return acc + Math.round(Math.max(0, effectiveDays * dailyRate - advance));
      }
    }, 0);
  };

  const totalEmployerPayable = calculateTotalPayroll();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-yellow-400 shrink-0" size={22} /> Attendance & Payroll
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Track attendance, salary payouts, and advance ledgers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            <UserPlus size={15} /> Add Employee
          </button>

          {Object.keys(unsavedChanges).length > 0 && (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
            >
              <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}

          <button
            onClick={() =>
              printPayrollSheet({
                employees: payrollEmployees,
                attendanceGrid,
                unsavedChanges,
                daysInMonth,
                monthName,
                selectedYear,
                payType: payTypeMode,
                advances,
                weeklyFromDate,
                weeklyToDate,
                weeklyExtras
              })
            }
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            <Printer size={15} /> Print Sheet
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <button onClick={() => changeMonth(-1)} className="text-slate-400 hover:text-white cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-white px-2 min-w-[120px] text-center">
              {monthName} {selectedYear}
            </span>
            <button onClick={() => changeMonth(1)} className="text-slate-400 hover:text-white cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="overflow-x-auto max-w-full">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 min-w-max">
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Attendance Grid
              </button>
              <button
                onClick={() => setActiveTab('payroll')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'payroll' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Payroll Summary
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen size={12} /> Employees Register
              </button>
            </div>
          </div>
        </div>

        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 outline-none self-start cursor-pointer"
        >
          <option value="All">All Employees</option>
          <option value="Active">Status: Active</option>
          <option value="Inactive">Status: Inactive</option>
        </select>
      </div>

      {/* VIEW 1: Attendance Grid */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-950/60">
                <th className="p-3 sm:p-4 font-bold min-w-[180px] sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                  Employee Details
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <th key={i + 1} className="p-1 sm:p-2 text-center font-bold w-7 sm:w-9 border-r border-slate-800/40 text-[10px]">
                    {i + 1}
                  </th>
                ))}
                <th className="p-1 sm:p-2 text-center font-bold text-emerald-400 w-8 border-r border-slate-800/40">P</th>
                <th className="p-1 sm:p-2 text-center font-bold text-amber-400 w-8 border-r border-slate-800/40">H</th>
                <th className="p-1 sm:p-2 text-center font-bold text-red-400 w-8 border-r border-slate-800/40">A</th>
                <th className="p-1 sm:p-2 text-center font-bold text-blue-400 w-8 border-r border-slate-800/40">L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {regularEmployees.slice((gridPage - 1) * ITEMS_PER_PAGE, gridPage * ITEMS_PER_PAGE).map((emp) => {
                let p = 0, h = 0, a = 0, l = 0;
                return (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-2 sm:p-3 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                      <div>
                        <p className="font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                          {emp.name}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                            emp.status === 'Active' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-red-950/60 text-red-400 border-red-800'
                          }`}>
                            {emp.status}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-400">{emp.department || 'No Dept'}</p>
                      </div>
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const key = `${emp.id}_${dateStr}`;
                      const status = unsavedChanges[key] !== undefined ? unsavedChanges[key] : attendanceGrid[key];
                      if (status === 'P') p++;
                      if (status === 'H') h++;
                      if (status === 'A') a++;
                      if (status === 'L') l++;

                      const cfg = STATUS_CONFIG[status];
                      return (
                        <td
                          key={dayNum}
                          onClick={(e) => handleCellClick(e, emp.id, dateStr)}
                          className="p-0.5 sm:p-1 text-center border-r border-slate-800/30 cursor-pointer hover:bg-slate-800/50"
                        >
                          {status && cfg ? (
                            <span className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-md font-bold text-[10px] flex items-center justify-center border ${cfg.bg}`}>
                              {status}
                            </span>
                          ) : (
                            <span className="text-slate-700">·</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-1 sm:p-2 text-center font-bold text-emerald-400 border-r border-slate-800/40">{p}</td>
                    <td className="p-1 sm:p-2 text-center font-bold text-amber-400 border-r border-slate-800/40">{h}</td>
                    <td className="p-1 sm:p-2 text-center font-bold text-red-400 border-r border-slate-800/40">{a}</td>
                    <td className="p-1 sm:p-2 text-center font-bold text-blue-400 border-r border-slate-800/40">{l}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={gridPage} total={regularEmployees.length} perPage={ITEMS_PER_PAGE} onChange={setGridPage} />
        </div>
      )}

      {/* VIEW 2: Payroll Summary */}
      {activeTab === 'payroll' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xs font-semibold text-slate-300">Pay Type:</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPayTypeMode('weekly')}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    payTypeMode === 'weekly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1. Weekly
                </button>
                <button
                  onClick={() => setPayTypeMode('monthly')}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    payTypeMode === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2. Monthly
                </button>
              </div>
            </div>

            <button
              onClick={() =>
                exportToTally({
                  employees: payrollEmployees,
                  attendanceGrid,
                  unsavedChanges,
                  daysInMonth,
                  monthName,
                  selectedYear,
                  payType: payTypeMode,
                  advances,
                  weeklyFromDate,
                  weeklyToDate,
                  weeklyExtras
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950/50"
            >
              <FileDown size={14} /> Export to Tally
            </button>

            {payTypeMode === 'weekly' && (
              <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium pl-1">From:</span>
                <input
                  type="date"
                  value={weeklyFromDate}
                  onChange={(e) => handleWeeklyFromChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 outline-none text-xs"
                />
                <span className="text-slate-400 font-medium">To:</span>
                <input
                  type="date"
                  value={weeklyToDate}
                  onChange={(e) => handleWeeklyToChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 outline-none text-xs"
                />
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                  <th className="p-3 sm:p-4 font-bold">Employee Name</th>
                  <th className="p-3 sm:p-4 text-center font-bold">Days Present</th>
                  {payTypeMode === 'monthly' && <th className="p-3 sm:p-4 text-center font-bold">Days Absent</th>}
                  <th className="p-3 sm:p-4 text-right font-bold">
                    {payTypeMode === 'weekly' ? 'Per Day Amt' : 'Monthly Base'}
                  </th>
                  {payTypeMode === 'weekly' && <th className="p-3 sm:p-4 text-right font-bold text-amber-300">Extra ★</th>}
                  <th className="p-3 sm:p-4 text-right font-bold">Deduct Adv.</th>
                  <th className="p-3 sm:p-4 text-right font-bold">Net Payout</th>
                  <th className="p-3 sm:p-4 text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payrollEmployees.slice((payPage - 1) * ITEMS_PER_PAGE, payPage * ITEMS_PER_PAGE).map((emp) => {
                  const isNonEmp = emp.employee_type === 'non_employee';
                  const { daysPresent, daysAbsent, holidayDays } = getEmpAttendanceMetrics(emp.id);
                  const { outstandingBalance } = getEmpLedgerTotals(emp.id);
                  const advanceInput = advances[emp.id] || '';

                  let calculatedSalary = 0;
                  if (payTypeMode === 'weekly') {
                    const extra = Number(weeklyExtras[emp.id] || 0);
                    const gross = daysPresent * Number(emp.per_day_amount || 0) + extra;
                    calculatedSalary = Math.round(Math.max(0, gross - Number(advanceInput)));
                  } else {
                    if (isNonEmp) {
                      calculatedSalary = Math.round(Math.max(0, Number(emp.monthly_salary || 0) - Number(advanceInput)));
                    } else {
                      const monthlySalary = Number(emp.monthly_salary || 0);
                      const paidAbsent = Math.min(daysAbsent, 2);
                      const effectiveDays = daysPresent + holidayDays + paidAbsent;
                      const dailyRate = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
                      calculatedSalary = Math.round(Math.max(0, effectiveDays * dailyRate - Number(advanceInput)));
                    }
                  }

                  return (
                    <tr key={emp.id} className={`hover:bg-slate-800/30 ${isNonEmp ? 'bg-indigo-950/10' : ''}`}>
                      <td className="p-3 sm:p-4 font-semibold text-slate-100">{emp.name}</td>
                      <td className="p-3 sm:p-4 text-center font-bold text-emerald-400">{isNonEmp ? '—' : daysPresent}</td>
                      {payTypeMode === 'monthly' && (
                        <td className="p-3 sm:p-4 text-center font-bold text-red-400">{isNonEmp ? '—' : daysAbsent}</td>
                      )}
                      <td className="p-3 sm:p-4 text-right">
                        ₹{Number(payTypeMode === 'weekly' ? emp.per_day_amount : emp.monthly_salary || 0).toLocaleString('en-IN')}
                      </td>
                      {payTypeMode === 'weekly' && (
                        <td className="p-3 sm:p-4 text-right">
                          <input
                            type="number"
                            placeholder="0"
                            value={weeklyExtras[emp.id] || ''}
                            onChange={(e) =>
                              setWeeklyExtras((prev) => ({ ...prev, [emp.id]: Number(e.target.value) }))
                            }
                            className="w-20 bg-amber-950/20 border border-amber-900/50 text-right text-amber-300 rounded-lg px-2 py-1 outline-none text-xs"
                          />
                        </td>
                      )}
                      <td className="p-3 sm:p-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <input
                            type="number"
                            placeholder="0"
                            value={advanceInput}
                            onChange={(e) => setAdvances((prev) => ({ ...prev, [emp.id]: Number(e.target.value) }))}
                            className="w-20 bg-slate-950 border border-slate-700 text-right text-slate-100 rounded-lg px-2 py-1 outline-none text-xs"
                          />
                          <span className="text-[9px] text-amber-400 font-medium">
                            Bal: ₹{outstandingBalance.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-right font-bold text-emerald-400 text-sm">
                        ₹{calculatedSalary.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <button
                          onClick={() => handleSettleSalaryDeduction(emp.id)}
                          className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-800 rounded-lg text-xs transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <CheckCircle size={11} /> Confirm
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950/80 font-bold border-t border-slate-800">
                  <td colSpan={payTypeMode === 'weekly' ? 5 : 4} className="p-3 sm:p-4 text-right text-slate-300">
                    Total Net Payout:
                  </td>
                  <td className="p-3 sm:p-4 text-right text-emerald-400 text-sm font-extrabold">
                    ₹{Math.round(totalEmployerPayable).toLocaleString('en-IN')}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <Pagination page={payPage} total={payrollEmployees.length} perPage={ITEMS_PER_PAGE} onChange={setPayPage} />
        </div>
      )}

      {/* VIEW 3: Employee Register & Ledger */}
      {activeTab === 'register' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                <th className="p-3 sm:p-4 font-bold">Employee</th>
                <th className="p-3 sm:p-4 font-bold">Role / Dept</th>
                <th className="p-3 sm:p-4 text-right font-bold">Advances Given</th>
                <th className="p-3 sm:p-4 text-right font-bold">Deducted</th>
                <th className="p-3 sm:p-4 text-right font-bold">Outstanding</th>
                <th className="p-3 sm:p-4 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.slice((regPage - 1) * ITEMS_PER_PAGE, regPage * ITEMS_PER_PAGE).map((emp) => {
                const { totalGiven, totalDeducted, outstandingBalance } = getEmpLedgerTotals(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-800/30">
                    <td className="p-3 sm:p-4">
                      <p className="font-semibold text-slate-100">{emp.name}</p>
                      <p className="text-[10px] text-slate-400">Joined: {emp.date_of_joining || 'N/A'}</p>
                    </td>
                    <td className="p-3 sm:p-4">
                      <p className="text-slate-200">{emp.role}</p>
                      <p className="text-[10px] text-slate-400">{emp.department}</p>
                    </td>
                    <td className="p-3 sm:p-4 text-right text-amber-400 font-mono">₹{totalGiven.toLocaleString('en-IN')}</td>
                    <td className="p-3 sm:p-4 text-right text-emerald-400 font-mono">₹{totalDeducted.toLocaleString('en-IN')}</td>
                    <td className="p-3 sm:p-4 text-right font-bold text-red-400 font-mono">₹{outstandingBalance.toLocaleString('en-IN')}</td>
                    <td className="p-3 sm:p-4 text-center">
                      <button
                        onClick={() => setSelectedRegEmp(emp)}
                        className="flex items-center gap-1.5 mx-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <MoreHorizontal size={13} /> Actions
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={regPage} total={filteredEmployees.length} perPage={ITEMS_PER_PAGE} onChange={setRegPage} />
        </div>
      )}

      {/* Slide-in Actions Panel */}
      {selectedRegEmp && (
        <EmpPanel
          emp={selectedRegEmp}
          ledgerTotals={getEmpLedgerTotals(selectedRegEmp.id)}
          onAdvance={() => {
            setSelectedEmpForAdvance(selectedRegEmp);
            setIsAdvanceModalOpen(true);
          }}
          onHistory={() => setLedgerViewEmp(selectedRegEmp)}
          onEdit={() => openEditModal(selectedRegEmp)}
          onClear={() => setClearConfirmEmp(selectedRegEmp)}
          onDelete={() => handleDeleteEmp(selectedRegEmp.id)}
          onClose={() => setSelectedRegEmp(null)}
        />
      )}

      {/* Cell Popover Menu */}
      {activeCellMenu && (
        <div
          ref={dropdownRef}
          style={{ top: activeCellMenu.y, left: activeCellMenu.x }}
          className="fixed z-[100] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 w-36 max-h-[220px] overflow-y-auto"
        >
          {STATUS_OPTIONS.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectStatusForCell(opt.code)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between border cursor-pointer ${opt.bg}`}
            >
              <span>{opt.label}</span>
              {opt.code && <span className="font-mono text-[10px] opacity-70">({opt.code})</span>}
            </button>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-white pr-6">
              {editingEmp ? 'Edit Employee' : 'Add New Employee'}
            </h2>

            <form onSubmit={handleEmpSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={empForm.name}
                  onChange={(e) => setEmpForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ravi Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-2">Employee Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer ${empForm.employee_type === 'employee' ? 'border-indigo-500 bg-indigo-950/40' : 'border-slate-700 bg-slate-950'}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="employee_type"
                        checked={empForm.employee_type === 'employee'}
                        onChange={() => setEmpForm((f) => ({ ...f, employee_type: 'employee' }))}
                      />
                      <span className="text-xs font-semibold text-slate-200">Employee</span>
                    </div>
                    <span className="text-[10px] text-slate-500 pl-5">Attendance tracked</span>
                  </label>
                  <label className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer ${empForm.employee_type === 'non_employee' ? 'border-indigo-500 bg-indigo-950/40' : 'border-slate-700 bg-slate-950'}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="employee_type"
                        checked={empForm.employee_type === 'non_employee'}
                        onChange={() => setEmpForm((f) => ({ ...f, employee_type: 'non_employee' }))}
                      />
                      <span className="text-xs font-semibold text-slate-200">Non-Employee</span>
                    </div>
                    <span className="text-[10px] text-slate-500 pl-5">Fixed monthly base</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Department</label>
                  <input
                    type="text"
                    value={empForm.department}
                    onChange={(e) => setEmpForm((f) => ({ ...f, department: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Role</label>
                  <input
                    type="text"
                    value={empForm.role}
                    onChange={(e) => setEmpForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Per Day Amount (₹)</label>
                  <input
                    type="number"
                    value={empForm.per_day_amount}
                    onChange={(e) => setEmpForm((f) => ({ ...f, per_day_amount: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monthly Base (₹)</label>
                  <input
                    type="number"
                    value={empForm.monthly_salary}
                    onChange={(e) => setEmpForm((f) => ({ ...f, monthly_salary: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Give Advance Modal */}
      {isAdvanceModalOpen && selectedEmpForAdvance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-4 sm:p-5 space-y-4 shadow-2xl relative">
            <button onClick={() => setIsAdvanceModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
            <h2 className="text-base font-bold text-white">Record Advance Transaction</h2>
            <form onSubmit={handleGiveAdvanceSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Transaction Type</label>
                <select
                  value={advanceForm.transaction_type}
                  onChange={(e) => setAdvanceForm((f) => ({ ...f, transaction_type: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none cursor-pointer"
                >
                  <option value="GIVEN">Give Advance</option>
                  <option value="DEDUCTED">Deduct Advance</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2000"
                  value={advanceForm.amount}
                  onChange={(e) => setAdvanceForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Confirmation */}
      {clearConfirmEmp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-red-900/50 rounded-2xl w-full max-w-sm p-4 sm:p-5 space-y-4 shadow-2xl">
            <h2 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle size={18} /> Clear Advance Records
            </h2>
            <p className="text-xs text-slate-400">
              Clear all advance transactions for <span className="text-white font-bold">{clearConfirmEmp.name}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setClearConfirmEmp(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClearAllAdvances(clearConfirmEmp.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ledger History Drawer */}
      {ledgerViewEmp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-4 sm:p-6 space-y-6 shadow-2xl overflow-y-auto relative animate-in slide-in-from-right duration-200">
            <button onClick={() => setLedgerViewEmp(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <div>
              <h2 className="text-base font-bold text-white">{ledgerViewEmp.name}</h2>
              <p className="text-xs text-slate-400">Advance Ledger History</p>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => printAdvanceLedger(ledgerViewEmp, ledgerData)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 cursor-pointer"
              >
                <Printer size={12} /> Print Ledger
              </button>
            </div>
            <div className="space-y-2">
              {(ledgerData[ledgerViewEmp.id] || []).length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No transactions recorded yet.</p>
              ) : (
                (ledgerData[ledgerViewEmp.id] || []).map((tx) => (
                  <div key={tx.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{tx.transaction_type === 'GIVEN' ? 'Advance Given' : 'Salary Deduction'}</p>
                      <p className="text-[10px] text-slate-400">{tx.date}</p>
                    </div>
                    <span className={`font-mono font-bold ${tx.transaction_type === 'GIVEN' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {tx.transaction_type === 'GIVEN' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePayrollModule;
