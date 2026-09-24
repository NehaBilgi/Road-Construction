import React, { useState, useEffect, useRef } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
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
  TrendingDown,
  ShieldAlert,
  Lock,
} from "lucide-react";

// ============================================================================
// HELPER: PRINT PAYROLL SHEET
// Monthly formula: paid_days = present + holidays(O) + min(absent,2)
// Weekly formula: only P counts as paid; H=0.5; A,L,O = unpaid
// ============================================================================
const printPayrollSheet = ({
  employees,
  attendanceGrid,
  unsavedChanges,
  daysInMonth,
  monthName,
  selectedYear,
  selectedMonth,
  payType,
  advances,
  weeklyFromDate,
  weeklyToDate,
  weeklyExtras,
}) => {
  const getAttendanceCounts = (empId) => {
    let daysPresent = 0,
      daysAbsent = 0,
      holidayDays = 0;
    if (payType === "weekly" && weeklyFromDate && weeklyToDate) {
      const start = new Date(weeklyFromDate);
      const end = new Date(weeklyToDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = `${empId}_${d.toISOString().split("T")[0]}`;
        const status =
          unsavedChanges[key] !== undefined
            ? unsavedChanges[key]
            : attendanceGrid[key];
        // Weekly: only P=paid, H=half-paid; A, L, O = unpaid
        if (status === "P") daysPresent += 1;
        else if (status === "H") daysPresent += 0.5;
      }
    } else {
      const monthIndex =
        new Date(`${monthName} 1, ${selectedYear}`).getMonth() + 1;
      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const dateStr = `${selectedYear}-${String(monthIndex).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        const key = `${empId}_${dateStr}`;
        const status =
          unsavedChanges[key] !== undefined
            ? unsavedChanges[key]
            : attendanceGrid[key];
        // Monthly: P/H = present; O = company holiday (paid); A/L = absent
        if (status === "P") daysPresent += 1;
        else if (status === "H") daysPresent += 0.5;
        else if (status === "O") holidayDays += 1;
        else if (status === "A" || status === "L") daysAbsent += 1;
      }
    }
    return { daysPresent, daysAbsent, holidayDays };
  };

  let totalPayoutSum = 0;

  const rowsHtml = employees
    .map((emp) => {
      const { daysPresent, daysAbsent, holidayDays } = getAttendanceCounts(
        emp.id,
      );
      const advance = Number(advances[emp.id] || 0);
      let salary = 0;

      if (payType === "weekly") {
        const perDay = Number(emp.per_day_amount || 0);
        const extra = Number(weeklyExtras?.[emp.id] || 0);
        salary = Math.round(
          Math.max(0, daysPresent * perDay + extra - advance),
        );
        totalPayoutSum += salary;
        return `
        <tr>
          <td style="padding:10px 12px;border:1px solid #d1d5db">${emp.name}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:center">${daysPresent}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">₹${perDay.toLocaleString("en-IN")}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">₹${extra.toLocaleString("en-IN")}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">₹${advance.toLocaleString("en-IN")}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right;font-weight:bold">₹${salary.toLocaleString("en-IN")}</td>
        </tr>`;
      } else {
        const isNonEmp = emp.employee_type === "non_employee";
        if (isNonEmp) {
          salary = Math.round(
            Math.max(0, Number(emp.monthly_salary || 0) - advance),
          );
        } else {
          const monthlySalary = Number(emp.monthly_salary || 0);
          const paidAbsent = Math.min(daysAbsent, 2);
          const effectiveDays = daysPresent + holidayDays + paidAbsent;
          const dailyRate = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
          salary = Math.round(Math.max(0, effectiveDays * dailyRate - advance));
        }
        totalPayoutSum += salary;
        const presentLbl = isNonEmp ? "—" : String(daysPresent);
        const absentLbl = isNonEmp ? "—" : String(daysAbsent);
        const baseLbl = isNonEmp
          ? "Fixed"
          : `₹${Number(emp.monthly_salary || 0).toLocaleString("en-IN")}`;
        return `
        <tr>
          <td style="padding:10px 12px;border:1px solid #d1d5db">${emp.name}${isNonEmp ? ' <em style="font-size:10px;color:#6b7280">(Non-Emp)</em>' : ""}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:center">${presentLbl}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:center">${absentLbl}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">${baseLbl}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right">₹${advance.toLocaleString("en-IN")}</td>
          <td style="padding:10px 12px;border:1px solid #d1d5db;text-align:right;font-weight:bold">₹${salary.toLocaleString("en-IN")}</td>
        </tr>`;
      }
    })
    .join("");

  const dateSubTitle =
    payType === "weekly"
      ? `Weekly Period (${weeklyFromDate} to ${weeklyToDate})`
      : `Monthly Payment List of ${monthName} ${selectedYear}`;

  const printWindow = window.open("", "", "width=900,height=650");
  printWindow.document.write(`
    <html><head>
      <title>${payType === "weekly" ? "Weekly" : "Monthly"} Payment List</title>
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
          ${payType === "monthly" ? '<th style="text-align:center">Days Absent</th>' : ""}
          <th style="text-align:right">${payType === "weekly" ? "Per Day Amount" : "Monthly Salary"}</th>
          ${payType === "weekly" ? '<th style="text-align:right">Extra Amount</th>' : ""}
          <th style="text-align:right">Advance Deducted</th>
          <th style="text-align:right">Total Net Earned</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot><tr>
          <td colspan="${payType === "weekly" ? "5" : "5"}" style="text-align:right">Total Payable Amount:</td>
          <td style="text-align:right;color:#059669">₹${Math.round(totalPayoutSum).toLocaleString("en-IN")}</td>
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
  selectedMonth,
  payType,
  advances,
  weeklyFromDate,
  weeklyToDate,
  weeklyExtras,
}) => {
  const now = new Date();
  const period =
    payType === "weekly"
      ? `${weeklyFromDate} to ${weeklyToDate}`
      : `${monthName} ${selectedYear}`;

  const getAttendanceCounts = (empId) => {
    let daysPresent = 0,
      daysAbsent = 0,
      holidayDays = 0;
    if (payType === "weekly" && weeklyFromDate && weeklyToDate) {
      const start = new Date(weeklyFromDate);
      const end = new Date(weeklyToDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = `${empId}_${d.toISOString().split("T")[0]}`;
        const s =
          unsavedChanges[key] !== undefined
            ? unsavedChanges[key]
            : attendanceGrid[key];
        if (s === "P") daysPresent += 1;
        else if (s === "H") daysPresent += 0.5;
      }
    } else {
      const monthIndex =
        new Date(`${monthName} 1, ${selectedYear}`).getMonth() + 1;
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYear}-${String(monthIndex).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const key = `${empId}_${dateStr}`;
        const s =
          unsavedChanges[key] !== undefined
            ? unsavedChanges[key]
            : attendanceGrid[key];
        if (s === "P") daysPresent += 1;
        else if (s === "H") daysPresent += 0.5;
        else if (s === "O") holidayDays += 1;
        else if (s === "A" || s === "L") daysAbsent += 1;
      }
    }
    return { daysPresent, daysAbsent, holidayDays };
  };

  const lines = [];
  lines.push(
    `M B BILGI CRUSHER — ${payType === "weekly" ? "Weekly" : "Monthly"} Salary Export`,
  );
  lines.push(`Period: ${period}`);
  lines.push(`Exported On: ${now.toLocaleDateString("en-IN")}`);
  lines.push("");
  lines.push("Voucher Type,Party Name (Ledger),Amount,Narration");

  employees.forEach((emp) => {
    const { daysPresent, daysAbsent, holidayDays } = getAttendanceCounts(
      emp.id,
    );
    const advance = Number(advances[emp.id] || 0);
    let netPay = 0;

    if (payType === "weekly") {
      const perDay = Number(emp.per_day_amount || 0);
      const extra = Number(weeklyExtras?.[emp.id] || 0);
      netPay = Math.round(Math.max(0, daysPresent * perDay + extra - advance));
    } else {
      if (emp.employee_type === "non_employee") {
        netPay = Math.round(
          Math.max(0, Number(emp.monthly_salary || 0) - advance),
        );
      } else {
        const monthlySalary = Number(emp.monthly_salary || 0);
        const paidAbsent = Math.min(daysAbsent, 2);
        const effectiveDays = daysPresent + holidayDays + paidAbsent;
        const dailyRate = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
        netPay = Math.round(Math.max(0, effectiveDays * dailyRate - advance));
      }
    }

    lines.push(
      `Payment Voucher,${emp.name},${netPay},${payType === "weekly" ? "Weekly" : "Monthly"} Salary — ${period}`,
    );
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tally_${payType}_salary_${now.toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  alert(
    "Tally CSV exported successfully!\nImport this file into Tally as Payment Vouchers.",
  );
};

// ============================================================================
// HELPER: PRINT ADVANCE LEDGER
// ============================================================================
const printAdvanceLedger = (emp, ledgerData) => {
  const history = ledgerData[emp.id] || [];
  let totalGiven = 0,
    totalDeducted = 0;
  history.forEach((tx) => {
    const t = (tx.transaction_type || tx.type || "").toUpperCase();
    if (t === "GIVEN" || t === "ADVANCE") totalGiven += Number(tx.amount || 0);
    if (t === "DEDUCTED" || t === "REPAYMENT")
      totalDeducted += Number(tx.amount || 0);
  });
  const outstandingBalance = Math.max(0, totalGiven - totalDeducted);

  const rowsHtml = history
    .map((tx) => {
      const t = (tx.transaction_type || tx.type || "").toUpperCase();
      const isGiven = t === "GIVEN" || t === "ADVANCE";
      return `
      <tr>
        <td style="padding:8px 10px;border:1px solid #d1d5db">${tx.date ? tx.date.split("T")[0] : "N/A"}</td>
        <td style="padding:8px 10px;border:1px solid #d1d5db">${isGiven ? "Advance Given" : "Salary Deduction"}</td>
        <td style="padding:8px 10px;border:1px solid #d1d5db">${tx.notes || ""}</td>
        <td style="padding:8px 10px;border:1px solid #d1d5db;text-align:right;color:${isGiven ? "#d97706" : "#059669"};font-weight:bold">
          ${isGiven ? "+" : "-"}₹${Number(tx.amount).toLocaleString("en-IN")}
        </td>
      </tr>`;
    })
    .join("");

  const w = window.open("", "", "width=720,height=600");
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
        <p style="margin:4px 0 0;color:#6b7280;font-size:13px">Advance Ledger — ${emp.name} (${emp.role || ""} · ${emp.department || ""})</p>
      </div>
      <div class="summary">
        <div class="s-box"><div class="s-label">Total Given</div><div class="s-val" style="color:#d97706">₹${totalGiven.toLocaleString("en-IN")}</div></div>
        <div class="s-box"><div class="s-label">Total Deducted</div><div class="s-val" style="color:#059669">₹${totalDeducted.toLocaleString("en-IN")}</div></div>
        <div class="s-box"><div class="s-label">Outstanding Balance</div><div class="s-val" style="color:#dc2626">₹${outstandingBalance.toLocaleString("en-IN")}</div></div>
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

const STATUS_OPTIONS = [
  {
    code: "P",
    label: "Present",
    bg: "bg-emerald-950/80 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900",
  },
  {
    code: "A",
    label: "Absent",
    bg: "bg-red-950/80 text-red-400 border-red-800/50 hover:bg-red-900",
  },
  {
    code: "H",
    label: "Half Day",
    bg: "bg-amber-950/80 text-amber-400 border-amber-800/50 hover:bg-amber-900",
  },
  {
    code: "L",
    label: "Leave",
    bg: "bg-blue-950/80 text-blue-400 border-blue-800/50 hover:bg-blue-900",
  },
  {
    code: "O",
    label: "Holiday/Off",
    bg: "bg-purple-950/80 text-purple-400 border-purple-800/50 hover:bg-purple-900",
  },
  {
    code: null,
    label: "Clear Status",
    bg: "bg-slate-800 text-slate-400 hover:bg-slate-700",
  },
];

const STATUS_CONFIG = STATUS_OPTIONS.reduce((acc, curr) => {
  if (curr.code) acc[curr.code] = curr;
  return acc;
}, {});

// ============================================================================
// CHANGE: PAGINATION COMPONENT (20 per page, no npm)
// ============================================================================
const ITEMS_PER_PAGE = 20;

function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/60 rounded-b-2xl flex-wrap gap-2">
      <p className="text-xs text-slate-400">
        Showing{" "}
        <span className="font-semibold text-slate-200">
          {from}–{to}
        </span>{" "}
        of <span className="font-semibold text-slate-200">{total}</span>{" "}
        employees
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="pagination-nav px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300
            hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={12} /> Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`pagination-number w-7 h-7 text-xs rounded-lg border transition-colors font-medium
              ${
                p === page
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="pagination-nav px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-300
            hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// CHANGE: EMPLOYEE ACTIONS SLIDE-IN PANEL
// ============================================================================
function EmpPanel({
  emp,
  isAdmin,
  ledgerTotals,
  onAdvance,
  onHistory,
  onEdit,
  onClear,
  onDelete,
  onClose,
}) {
  const {
    totalGiven = 0,
    totalDeducted = 0,
    outstandingBalance = 0,
  } = ledgerTotals || {};
  const isNonEmp = emp.employee_type === "non_employee";
  const initials = emp.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const panelBtn = (icon, title, desc, accentBg, onClick, danger = false) => (
    <button
      onClick={() => {
        onClick();
        onClose();
      }}
      data-action={title}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left group
        ${
          danger
            ? "bg-red-950/30 border-red-900/50 hover:bg-red-950/50"
            : "bg-slate-800 border-slate-700 hover:bg-slate-700"
        }`}
    >
      <div
        className={`w-8 h-8 rounded-lg ${accentBg} flex items-center justify-center shrink-0 transition-colors`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className={`font-semibold text-xs ${danger ? "text-red-300" : "text-slate-100"}`}
        >
          {title}
        </p>
        <p
          className={`text-[10px] ${danger ? "text-red-400/60" : "text-slate-500"} truncate`}
        >
          {desc}
        </p>
      </div>
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden"
        style={{
          animation: "empPanelSlide .22s cubic-bezier(.16,1,.3,1) both",
        }}
      >
        <style>{`@keyframes empPanelSlide{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">
                {emp.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {emp.role} · {emp.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Status chips */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-[10px] px-2 py-1 rounded-full border font-semibold flex items-center gap-1
              ${emp.status === "Active" ? "bg-emerald-950/60 text-emerald-400 border-emerald-800" : "bg-red-950/60 text-red-400 border-red-800"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${emp.status === "Active" ? "bg-emerald-400" : "bg-red-400"}`}
              />
              {emp.status}
            </span>
            {isNonEmp && (
              <span className="text-[10px] px-2 py-1 bg-indigo-950/60 text-indigo-300 border border-indigo-800 rounded-full font-semibold">
                Fixed / Non-Emp
              </span>
            )}
            <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full flex items-center gap-1">
              <Calendar size={10} /> Joined{" "}
              {emp.date_of_joining ? emp.date_of_joining.split("T")[0] : "N/A"}
            </span>
          </div>

          {/* Financial stats */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Financial Overview
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1">
                  <IndianRupee size={10} /> Monthly Base
                </p>
                <p className="font-bold text-white text-sm">
                  ₹{Number(emp.monthly_salary || 0).toLocaleString("en-IN")}
                </p>
              </div>
              {!isNonEmp && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1">
                    <IndianRupee size={10} /> Per Day
                  </p>
                  <p className="font-bold text-white text-sm">
                    ₹{Number(emp.per_day_amount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5 text-amber-400">
                  <TrendingUp size={10} />
                  <span className="text-[10px]">Given</span>
                </div>
                <p className="font-bold text-amber-400 text-sm">
                  ₹{totalGiven.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5 text-emerald-400">
                  <TrendingDown size={10} />
                  <span className="text-[10px]">Recovered</span>
                </div>
                <p className="font-bold text-emerald-400 text-sm">
                  ₹{totalDeducted.toLocaleString("en-IN")}
                </p>
              </div>
              <div
                className={`bg-slate-800 rounded-xl p-3 text-center border ${outstandingBalance > 0 ? "border-red-900/50" : "border-slate-700"}`}
              >
                <div
                  className={`flex items-center justify-center gap-1 mb-0.5 ${outstandingBalance > 0 ? "text-red-400" : "text-slate-400"}`}
                >
                  <AlertTriangle size={10} />
                  <span className="text-[10px]">Balance</span>
                </div>
                <p
                  className={`font-bold text-sm ${outstandingBalance > 0 ? "text-red-400" : "text-slate-400"}`}
                >
                  ₹{outstandingBalance.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Ledger actions — all roles */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Ledger Actions
            </p>
            <div className="space-y-2">
              {panelBtn(
                <PlusCircle size={15} className="text-amber-400" />,
                "Record Advance",
                "Log a cash advance given to employee",
                "bg-amber-500/10 border border-amber-700/40",
                onAdvance,
              )}
              {panelBtn(
                <History size={15} className="text-blue-400" />,
                "View Ledger / History",
                "See all advance transactions & deductions",
                "bg-blue-500/10 border border-blue-700/40",
                onHistory,
              )}
            </div>
          </div>

          {/* Admin-only section */}
          {isAdmin && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 border-t border-slate-800" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-1">
                  Admin Only
                </span>
                <div className="flex-1 border-t border-slate-800" />
              </div>
              <div className="space-y-2">
                {panelBtn(
                  <Edit2 size={15} className="text-indigo-400" />,
                  "Edit Employee",
                  "Update name, salary, role or department",
                  "bg-indigo-500/10 border border-indigo-700/40",
                  onEdit,
                )}
                {panelBtn(
                  <XCircle size={15} className="text-orange-400" />,
                  "Clear All Advances",
                  "Reset outstanding advance ledger to ₹0",
                  "bg-orange-500/10 border border-orange-700/40",
                  onClear,
                )}
                {panelBtn(
                  <Trash2 size={15} className="text-red-400" />,
                  "Delete Employee",
                  "Permanently remove record & all data",
                  "bg-red-500/10 border border-red-800/40",
                  onDelete,
                  true,
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Attendance() {
  const { user } = useAuth();
  const userRoleNormalized = String(user?.role || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .trim();
  const isAdmin = userRoleNormalized === "admin";

  const allowedAttendanceRoles = [
    "admin",
    "inventory manager",
    "store keeper",
    "storekeeper",
    "manager",
  ];
  const canRecordAttendance =
    allowedAttendanceRoles.includes(userRoleNormalized);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("attendance");
  const [payTypeMode, setPayTypeMode] = useState("weekly");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // CHANGE: date range persisted to localStorage so it survives navigation
  const [weeklyFromDate, setWeeklyFromDate] = useState(
    () =>
      localStorage.getItem("att_weeklyFrom") ||
      new Date(Date.now() - 7 * 864e5).toISOString().split("T")[0],
  );
  const [weeklyToDate, setWeeklyToDate] = useState(
    () =>
      localStorage.getItem("att_weeklyTo") ||
      new Date().toISOString().split("T")[0],
  );
  const handleWeeklyFromChange = (v) => {
    setWeeklyFromDate(v);
    localStorage.setItem("att_weeklyFrom", v);
  };
  const handleWeeklyToChange = (v) => {
    setWeeklyToDate(v);
    localStorage.setItem("att_weeklyTo", v);
  };

  const [employees, setEmployees] = useState([]);
  const [attendanceGrid, setAttendanceGrid] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [advances, setAdvances] = useState({});
  const [ledgerData, setLedgerData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const loadRequestRef = useRef(0);

  // Extra amount per employee for weekly salary
  const [weeklyExtras, setWeeklyExtras] = useState({});
  // monthlyOverrides REMOVED — replaced by Employee/Non-Employee type system

  const [activeCellMenu, setActiveCellMenu] = useState(null);
  const dropdownRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  // employee_type added: 'employee' | 'non_employee'
  const [empForm, setEmpForm] = useState({
    name: "",
    department: "",
    role: "Staff",
    date_of_joining: new Date().toISOString().split("T")[0],
    status: "Active",
    monthly_salary: 0,
    per_day_amount: 0,
    employee_type: "employee",
  });

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedEmpForAdvance, setSelectedEmpForAdvance] = useState(null);
  const [advanceForm, setAdvanceForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    transaction_type: "GIVEN",
    notes: "Cash Advance",
  });

  const [ledgerViewEmp, setLedgerViewEmp] = useState(null);

  const [isEditAdvanceModalOpen, setIsEditAdvanceModalOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState(null);
  const [editAdvanceForm, setEditAdvanceForm] = useState({
    amount: "",
    notes: "",
  });

  const [clearConfirmEmp, setClearConfirmEmp] = useState(null);

  // CHANGE: single-button panel state
  const [selectedRegEmp, setSelectedRegEmp] = useState(null);

  // CHANGE: pagination (20 per page, no npm)
  const [regPage, setRegPage] = useState(1);
  const [gridPage, setGridPage] = useState(1);
  const [payPage, setPayPage] = useState(1);

  // Attendance lock — non-admin users cannot edit an employee/date cell after
  // saving it. Admins can always edit saved cells.
  const [savedAttendanceKeys, setSavedAttendanceKeys] = useState(() => {
    try {
      const saved = new Set(
        JSON.parse(localStorage.getItem("att_savedAttendanceKeys") || "[]"),
      );

      // Keep locks created by the earlier date-level implementation. Those
      // entries are plain dates; new entries are employeeId_date keys.
      const legacyDates = JSON.parse(
        localStorage.getItem("att_savedDates") || "[]",
      );
      legacyDates.forEach((date) => saved.add(date));
      return saved;
    } catch {
      return new Set();
    }
  });

  const isAttendanceCellLocked = (empId, dateStr) =>
    !isAdmin &&
    (savedAttendanceKeys.has(`${empId}_${dateStr}`) ||
      savedAttendanceKeys.has(dateStr));

  const markAttendanceCellsSaved = (keys) => {
    if (isAdmin) return; // admin changes never lock
    setSavedAttendanceKeys((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => next.add(key));
      localStorage.setItem(
        "att_savedAttendanceKeys",
        JSON.stringify([...next]),
      );
      return next;
    });
  };

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const changeMonth = (offset) => {
    const nextPeriod = new Date(selectedYear, selectedMonth - 1 + offset, 1);
    setSelectedYear(nextPeriod.getFullYear());
    setSelectedMonth(nextPeriod.getMonth() + 1);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveCellMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadLedgerData = async () => {
    try {
      const ledgerRes = await api.get("/attendance/advances");
      const records = Array.isArray(ledgerRes)
        ? ledgerRes
        : ledgerRes?.data || [];
      const grouped = {};
      records.forEach((tx) => {
        const uid = tx.user_id || tx.employee_id;
        if (!grouped[uid]) grouped[uid] = [];
        grouped[uid].push(tx);
      });
      setLedgerData(grouped);
    } catch (err) {
      console.warn(
        "Failed to fetch persistent advance ledger data:",
        err.message,
      );
    }
  };

  // PERF: fetch employees + attendance in parallel
  const loadData = async () => {
    const requestId = ++loadRequestRef.current;
    const requestedMonth = selectedMonth;
    const requestedYear = selectedYear;
    setLoading(true);
    try {
      const [empRes, attendanceRes] = await Promise.all([
        api.get("/attendance/employees"),
        api.get(`/attendance?month=${requestedMonth}&year=${requestedYear}`),
      ]);

      // A user can change months before a slower request returns. Never let
      // an older response overwrite the currently selected month's grid.
      if (requestId !== loadRequestRef.current) return;

      const fetchedEmps = Array.isArray(empRes) ? empRes : empRes?.data || [];
      setEmployees(fetchedEmps);

      const rawRecords =
        attendanceRes?.attendance || attendanceRes?.data?.attendance || [];
      const grid = {};
      rawRecords.forEach((r) => {
        const d = r.date ? r.date.split("T")[0] : r.date;
        grid[`${r.user_id}_${d}`] = r.status;
      });
      setAttendanceGrid(grid);

      await loadLedgerData();
    } catch (err) {
      if (requestId !== loadRequestRef.current) return;
      console.error("Failed to load data:", err);
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const handleCellClick = (e, empId, dateStr) => {
    if (isAttendanceCellLocked(empId, dateStr)) {
      window.alert(
        "This attendance is locked after saving. Ask an Admin to make changes.",
      );
      return;
    }

    // 1. Ensure user is logged in and has an allowed role (Admin, Manager, Storekeeper, etc.)
    const role = String(user?.role || "").toLowerCase();
    const allowedRoles = [
      "admin",
      "manager",
      "storekeeper",
      "inventory_manager",
    ];

    // Fallback check: allow if allowedRoles includes the user role OR if canRecordAttendance state is true
    const isAllowedToRecord =
      allowedRoles.some((r) => role.includes(r)) || canRecordAttendance;

    if (!isAllowedToRecord) {
      alert("You don't have permission to record or edit attendance.");
      return;
    }

    // 2. Position calculation with overflow protection
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 220;
    const dropdownWidth = 160;

    let y = rect.bottom + window.scrollY;
    let x = rect.left + window.scrollX;

    // Open upward if near bottom boundary
    if (rect.bottom + dropdownHeight > window.innerHeight) {
      y = rect.top + window.scrollY - dropdownHeight;
    }

    // Shift left if near right boundary
    if (rect.left + dropdownWidth > window.innerWidth) {
      x = window.innerWidth - dropdownWidth - 16;
    }

    // 3. Open the cell popover menu
    setActiveCellMenu({
      empId,
      dateStr,
      x,
      y,
    });
  };

  const selectStatusForCell = (status) => {
    if (!activeCellMenu) return;
    if (isAttendanceCellLocked(activeCellMenu.empId, activeCellMenu.dateStr)) {
      setActiveCellMenu(null);
      window.alert(
        "This attendance is locked after saving. Ask an Admin to make changes.",
      );
      return;
    }
    const key = `${activeCellMenu.empId}_${activeCellMenu.dateStr}`;
    setUnsavedChanges((prev) => ({ ...prev, [key]: status }));
    setActiveCellMenu(null);
  };

  const handleSaveChanges = async () => {
    if (!canRecordAttendance) return;
    const changedEntries = Object.entries(unsavedChanges);
    if (changedEntries.length === 0) return;
    setSaving(true);
    try {
      const records = changedEntries.map(([key, status]) => {
        const separator = key.indexOf("_");
        return {
          user_id: key.slice(0, separator),
          date: key.slice(separator + 1),
          status,
        };
      });
      // Save the whole edit set atomically. This prevents a navigation or a
      // single failed cell request from leaving the grid only partly saved.
      await api.post("/attendance/bulk", { records });

      const savedEntries = Object.fromEntries(changedEntries);
      setAttendanceGrid((prev) => ({ ...prev, ...savedEntries }));
      setUnsavedChanges({});

      // Lock the exact cells only after every server update succeeds.
      markAttendanceCellsSaved(changedEntries.map(([key]) => key));
      alert(
        isAdmin
          ? "Attendance saved successfully!"
          : "Attendance saved successfully. These cells are now locked; ask an Admin for any correction.",
      );
    } catch (err) {
      console.error("Error saving attendance:", err);
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error || err.message;
      alert("Failed to save changes: " + backendMessage);
    } finally {
      setSaving(false);
    }
  };

  const getEmpLedgerTotals = (empId) => {
    const history = ledgerData[empId] || [];
    let totalGiven = 0,
      totalDeducted = 0;
    history.forEach((tx) => {
      const type = (tx.transaction_type || tx.type || "").toUpperCase();
      if (type === "GIVEN" || type === "ADVANCE")
        totalGiven += Number(tx.amount || 0);
      if (type === "DEDUCTED" || type === "REPAYMENT")
        totalDeducted += Number(tx.amount || 0);
    });
    return {
      totalGiven,
      totalDeducted,
      outstandingBalance: Math.max(0, totalGiven - totalDeducted),
      history,
    };
  };

  const handleGiveAdvanceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmpForAdvance || !advanceForm.amount) return;
    const transactionType =
      advanceForm.transaction_type === "DEDUCTED" ? "DEDUCTED" : "GIVEN";
    const payload = {
      user_id: selectedEmpForAdvance.id,
      employee_id: selectedEmpForAdvance.id,
      amount: Number(advanceForm.amount),
      transaction_type: transactionType,
      type: transactionType,
      date: advanceForm.date,
      notes: advanceForm.notes,
    };
    try {
      await api.post("/attendance/advances", payload);
      await loadLedgerData();
      setIsAdvanceModalOpen(false);
      setAdvanceForm({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        transaction_type: "GIVEN",
        notes: "Cash Advance",
      });
      setSelectedEmpForAdvance(null);
    } catch (err) {
      console.error("Error saving advance:", err);
      alert(
        "Failed to save advance record: " +
          (err.response?.data?.error || err.message),
      );
    }
  };

  const handleEditAdvanceSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingAdvance) return;
    try {
      await api.put(`/attendance/advances/${editingAdvance.id}`, {
        amount: Number(editAdvanceForm.amount),
        notes: editAdvanceForm.notes,
      });
      await loadLedgerData();
      setIsEditAdvanceModalOpen(false);
      setEditingAdvance(null);
    } catch (err) {
      console.error("Error editing advance:", err);
      alert(
        "Failed to edit advance: " + (err.response?.data?.error || err.message),
      );
    }
  };

  const handleDeleteAdvance = async (advanceId) => {
    if (
      !isAdmin ||
      !window.confirm("Delete this advance transaction? This cannot be undone.")
    )
      return;
    try {
      await api.delete(`/attendance/advances/${advanceId}`);
      await loadLedgerData();
    } catch (err) {
      console.error("Error deleting advance:", err);
      alert(
        "Failed to delete advance: " +
          (err.response?.data?.error || err.message),
      );
    }
  };

  const handleClearAllAdvances = async (empId) => {
    if (!isAdmin) return;
    try {
      await api.delete(`/attendance/advances/clear/${empId}`);
      await loadLedgerData();
      setClearConfirmEmp(null);
      if (ledgerViewEmp?.id === empId) setLedgerViewEmp(null);
      alert("All advance records cleared successfully.");
    } catch (err) {
      console.error("Error clearing advances:", err);
      alert(
        "Failed to clear advance records: " +
          (err.response?.data?.error || err.message),
      );
    }
  };

  const handleSettleSalaryDeduction = async (empId) => {
    const deductionAmt = Number(advances[empId] || 0);
    if (deductionAmt <= 0) {
      alert("Please enter an advance deduction amount first.");
      return;
    }
    const payload = {
      user_id: empId,
      employee_id: empId,
      amount: deductionAmt,
      transaction_type: "DEDUCTED",
      type: "DEDUCTED",
      date: new Date().toISOString().split("T")[0],
      notes: `Deducted during ${payTypeMode === "weekly" ? "Weekly" : "Monthly"} Salary Settlement`,
    };
    try {
      await api.post("/attendance/advances/deduct", payload);
      await loadLedgerData();
      alert(
        `Successfully deducted ₹${deductionAmt.toLocaleString("en-IN")} and saved to database!`,
      );
    } catch (err) {
      console.error("Error deducting advance:", err);
      alert(
        "Failed to save deduction: " +
          (err.response?.data?.error || err.message),
      );
    }
  };

  const openAddModal = () => {
    setEditingEmp(null);
    setEmpForm({
      name: "",
      department: "",
      role: "Staff",
      date_of_joining: new Date().toISOString().split("T")[0],
      status: "Active",
      monthly_salary: 0,
      per_day_amount: 0,
      employee_type: "employee",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    setEmpForm({
      name: emp.name || "",
      department: emp.department || "",
      role: emp.role || "Staff",
      date_of_joining: emp.date_of_joining
        ? emp.date_of_joining.split("T")[0]
        : "",
      status: emp.status || "Active",
      monthly_salary: emp.monthly_salary || 0,
      per_day_amount: emp.per_day_amount || 0,
      employee_type: emp.employee_type || "employee",
    });
    setIsModalOpen(true);
  };

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...empForm };
      if (empForm.employee_type === "non_employee") payload.per_day_amount = 0;
      if (editingEmp) {
        await api.put(`/attendance/employees/${editingEmp.id}`, payload);
      } else {
        await api.post("/attendance/employees", payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert("Error saving employee: " + err.message);
    }
  };

  const handleDeleteEmp = async (id) => {
    if (!isAdmin || !window.confirm("Delete this employee record?")) return;
    try {
      await api.delete(`/attendance/employees/${id}`);
      loadData();
    } catch (err) {
      alert("Error deleting employee: " + err.message);
    }
  };

  const openAdvanceModal = (emp) => {
    setSelectedEmpForAdvance(emp);
    setAdvanceForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      transaction_type: "GIVEN",
      notes: "Cash Advance",
    });
    setIsAdvanceModalOpen(true);
  };

  const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString(
    "default",
    { month: "long" },
  );

  const filteredEmployees = employees.filter((emp) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Active") return emp.status === "Active";
    if (selectedFilter === "Inactive") return emp.status === "Inactive";
    return emp.department === selectedFilter;
  });

  // Non-employees skip attendance grid and weekly payroll
  const regularEmployees = filteredEmployees.filter(
    (e) => e.employee_type !== "non_employee",
  );
  // Monthly payroll shows everyone
  const payrollEmployees =
    payTypeMode === "weekly" ? regularEmployees : filteredEmployees;

  // Keep every list on a valid page after filters, pay-mode changes, or deletes.
  useEffect(() => {
    setRegPage((page) =>
      Math.min(
        page,
        Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE)),
      ),
    );
    setGridPage((page) =>
      Math.min(
        page,
        Math.max(1, Math.ceil(regularEmployees.length / ITEMS_PER_PAGE)),
      ),
    );
    setPayPage((page) =>
      Math.min(
        page,
        Math.max(1, Math.ceil(payrollEmployees.length / ITEMS_PER_PAGE)),
      ),
    );
  }, [
    filteredEmployees.length,
    regularEmployees.length,
    payrollEmployees.length,
  ]);

  // A changed filter or payroll mode should always start at the first page.
  useEffect(() => {
    setRegPage(1);
    setGridPage(1);
    setPayPage(1);
  }, [selectedFilter, payTypeMode, selectedMonth, selectedYear]);

  // Attendance metrics — weekly: only P/H counted; monthly: P/H=present, O=holiday, A/L=absent
  const getEmpAttendanceMetrics = (empId) => {
    let daysPresent = 0,
      daysAbsent = 0,
      holidayDays = 0;

    if (
      activeTab === "payroll" &&
      payTypeMode === "weekly" &&
      weeklyFromDate &&
      weeklyToDate
    ) {
      const start = new Date(weeklyFromDate);
      const end = new Date(weeklyToDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const key = `${empId}_${dateStr}`;
        const status =
          unsavedChanges[key] !== undefined
            ? unsavedChanges[key]
            : attendanceGrid[key];
        // Weekly: A, L, O = unpaid (absent)
        if (status === "P") daysPresent += 1;
        else if (status === "H") daysPresent += 0.5;
      }
    } else {
      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        const key = `${empId}_${dateStr}`;
        const status =
          unsavedChanges[key] !== undefined
            ? unsavedChanges[key]
            : attendanceGrid[key];
        // Monthly: O = paid company holiday; A/L = absent (2 free days rule applies)
        if (status === "P") daysPresent += 1;
        else if (status === "H") daysPresent += 0.5;
        else if (status === "O") holidayDays += 1;
        else if (status === "A" || status === "L") daysAbsent += 1;
      }
    }
    return { daysPresent, daysAbsent, holidayDays };
  };

  const handleAdvanceChange = (empId, val) => {
    setAdvances((prev) => ({ ...prev, [empId]: Number(val) }));
  };

  const triggerPrint = () => {
    printPayrollSheet({
      employees: payrollEmployees,
      attendanceGrid,
      unsavedChanges,
      daysInMonth,
      monthName,
      selectedYear,
      selectedMonth,
      payType: payTypeMode,
      advances,
      weeklyFromDate,
      weeklyToDate,
      weeklyExtras,
    });
  };

  // Monthly: 2-free-absent rule; non-employees fixed base
  const calculateTotalPayroll = () => {
    return payrollEmployees.reduce((acc, emp) => {
      const { daysPresent, daysAbsent, holidayDays } = getEmpAttendanceMetrics(
        emp.id,
      );
      const advance = Number(advances[emp.id] || 0);

      if (payTypeMode === "weekly") {
        const extra = Number(weeklyExtras[emp.id] || 0);
        const gross = daysPresent * Number(emp.per_day_amount || 0) + extra;
        return acc + Math.round(Math.max(0, gross - advance));
      } else {
        if (emp.employee_type === "non_employee") {
          return (
            acc +
            Math.round(Math.max(0, Number(emp.monthly_salary || 0) - advance))
          );
        }
        const monthlySalary = Number(emp.monthly_salary || 0);
        const paidAbsent = Math.min(daysAbsent, 2);
        const effectiveDays = daysPresent + holidayDays + paidAbsent;
        const dailyRate = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
        return (
          acc + Math.round(Math.max(0, effectiveDays * dailyRate - advance))
        );
      }
    }, 0);
  };

  const totalEmployerPayable = calculateTotalPayroll();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-slate-950 min-h-screen text-slate-100">
      <style>{`
        input[type="date"] { color-scheme: dark; }
        /* Calendar picker icon — YELLOW */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) sepia(1) saturate(10) hue-rotate(0deg);
          cursor: pointer;
          opacity: 0.9;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }
      `}</style>

      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            {/* CHANGE 1 — Calendar icon: yellow */}
            <Calendar className="text-yellow-400 shrink-0" size={22} />{" "}
            Attendance & Payroll
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Track attendance, salary payouts, and advance ledgers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shadow-lg shadow-indigo-950/50"
          >
            <UserPlus size={15} /> Add Employee
          </button>

          {canRecordAttendance && Object.keys(unsavedChanges).length > 0 && (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors shadow-lg shadow-emerald-950/50"
            >
              <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          )}

          <button
            onClick={triggerPrint}
            data-action="Print Sheet"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-colors"
          >
            <Printer size={15} /> Print Sheet
          </button>
        </div>
      </div>

      {/* ── Control Bar ── */}
      <div className="flex flex-col gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Month navigator */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => changeMonth(-1)}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-white px-2 min-w-[120px] text-center">
              {monthName} {selectedYear}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="text-slate-400 hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Tab switcher — scrollable on mobile */}
          <div className="overflow-x-auto max-w-full">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 min-w-max">
              <button
                onClick={() => setActiveTab("attendance")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === "attendance" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Attendance Grid
              </button>
              <button
                onClick={() => setActiveTab("payroll")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === "payroll" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Payroll Summary
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === "register" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <BookOpen size={12} /> Employees Register
              </button>
            </div>
          </div>
        </div>

        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 outline-none focus:border-slate-700 self-start"
        >
          <option value="All">All Employees</option>
          <option value="Active">Status: Active</option>
          <option value="Inactive">Status: Inactive</option>
        </select>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB 1: Attendance Grid — regular employees only
          Non-employees are skipped here
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "attendance" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl relative">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              Loading attendance data…
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-950/60">
                    <th className="p-3 sm:p-4 font-bold min-w-[180px] sticky left-0 bg-slate-950 z-10 border-r border-slate-800">
                      Employee Details
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <th
                        key={i + 1}
                        className="p-1 sm:p-2 text-center font-bold w-7 sm:w-9 border-r border-slate-800/40 text-[10px]"
                      >
                        {i + 1}
                      </th>
                    ))}
                    <th className="p-1 sm:p-2 text-center font-bold text-emerald-400 w-8 border-r border-slate-800/40">
                      P
                    </th>
                    <th className="p-1 sm:p-2 text-center font-bold text-amber-400  w-8 border-r border-slate-800/40">
                      H
                    </th>
                    <th className="p-1 sm:p-2 text-center font-bold text-red-400    w-8 border-r border-slate-800/40">
                      A
                    </th>
                    <th className="p-1 sm:p-2 text-center font-bold text-blue-400   w-8 border-r border-slate-800/40">
                      L
                    </th>
                    {/* ACTIONS column removed — moved to Employees Register slide-in panel */}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {/* regularEmployees = filteredEmployees without non_employees */}
                  {regularEmployees
                    .slice(
                      (gridPage - 1) * ITEMS_PER_PAGE,
                      gridPage * ITEMS_PER_PAGE,
                    )
                    .map((emp) => {
                      let presentCount = 0,
                        halfCount = 0,
                        absentCount = 0,
                        leaveCount = 0;

                      return (
                        <tr
                          key={emp.id}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="p-2 sm:p-3 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                            <div>
                              <p className="font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                                {emp.name}
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                                    emp.status === "Active"
                                      ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                                      : "bg-red-950/60 text-red-400 border-red-800"
                                  }`}
                                >
                                  {emp.status}
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {emp.department || "No Dept"}
                              </p>
                            </div>
                          </td>

                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const dayNum = i + 1;
                            const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                            const key = `${emp.id}_${dateStr}`;
                            const status =
                              unsavedChanges[key] !== undefined
                                ? unsavedChanges[key]
                                : attendanceGrid[key];

                            if (status === "P") presentCount++;
                            if (status === "H") halfCount++;
                            if (status === "A") absentCount++;
                            if (status === "L") leaveCount++;

                            const cfg = STATUS_CONFIG[status];

                            return (
                              <td
                                key={dayNum}
                                onClick={(e) => {
                                  const isLocked = isAttendanceCellLocked(
                                    emp.id,
                                    dateStr,
                                  );
                                  if (isLocked) {
                                    window.alert(
                                      "This attendance is locked after saving. Ask an Admin to make changes.",
                                    );
                                    return;
                                  }
                                  handleCellClick(e, emp.id, dateStr);
                                }}
                                title={
                                  isAttendanceCellLocked(emp.id, dateStr)
                                    ? "Locked after saving — only Admin can edit"
                                    : ""
                                }
                                className={`p-0.5 sm:p-1 text-center border-r border-slate-800/30 ${canRecordAttendance && !isAttendanceCellLocked(emp.id, dateStr) ? "cursor-pointer hover:bg-slate-800/50" : ""} ${isAttendanceCellLocked(emp.id, dateStr) ? "opacity-60 cursor-not-allowed" : ""}`}
                              >
                                {status && cfg ? (
                                  <span
                                    className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-md font-bold text-[10px] flex items-center justify-center border ${cfg.bg}`}
                                  >
                                    {status}
                                  </span>
                                ) : (
                                  <span className="text-slate-700">·</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="p-1 sm:p-2 text-center font-bold text-emerald-400 border-r border-slate-800/40">
                            {presentCount}
                          </td>
                          <td className="p-1 sm:p-2 text-center font-bold text-amber-400  border-r border-slate-800/40">
                            {halfCount}
                          </td>
                          <td className="p-1 sm:p-2 text-center font-bold text-red-400    border-r border-slate-800/40">
                            {absentCount}
                          </td>
                          <td className="p-1 sm:p-2 text-center font-bold text-blue-400   border-r border-slate-800/40">
                            {leaveCount}
                          </td>

                          {/* Actions removed from Attendance Grid — use Employees Register panel instead */}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <Pagination
                page={gridPage}
                total={regularEmployees.length}
                perPage={ITEMS_PER_PAGE}
                onChange={setGridPage}
              />
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 2: Payroll Summary
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "payroll" && (
        <div className="space-y-3">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 sm:p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xs font-semibold text-slate-300">
                Pay Type:
              </span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPayTypeMode("weekly")}
                  data-action="Weekly Payroll"
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${payTypeMode === "weekly" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  1. Weekly
                </button>
                <button
                  onClick={() => setPayTypeMode("monthly")}
                  data-action="Monthly Payroll"
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${payTypeMode === "monthly" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
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
                  selectedMonth,
                  payType: payTypeMode,
                  advances,
                  weeklyFromDate,
                  weeklyToDate,
                  weeklyExtras,
                })
              }
              data-action="Export to Tally"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-950/50"
            >
              <FileDown size={14} /> Export to Tally
            </button>

            {payTypeMode === "weekly" && (
              <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium pl-1">From:</span>
                <input
                  type="date"
                  value={weeklyFromDate}
                  onChange={(e) => handleWeeklyFromChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 font-mono text-xs"
                />
                <span className="text-slate-400 font-medium">To:</span>
                <input
                  type="date"
                  value={weeklyToDate}
                  onChange={(e) => handleWeeklyToChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* Formula info banner */}
          {payTypeMode === "monthly" && (
            <div className="bg-blue-950/30 border border-blue-900/40 rounded-xl px-3 sm:px-4 py-2 text-xs text-blue-300">
              <strong>Monthly formula:</strong> Net = (Present + Company Offs +
              min(Absent, 2)) ÷ Days in Month × Base − Advance. Up to 2 absent
              days are free. Non-employees receive their fixed base each month.
            </div>
          )}
          {payTypeMode === "weekly" && (
            <div className="bg-amber-950/30 border border-amber-900/40 rounded-xl px-3 sm:px-4 py-2 text-xs text-amber-300">
              <strong>Weekly formula:</strong> (Days Present × Per Day Rate) +
              Extra − Advance. Holidays (O), Leave (L) and Absent (A) are all
              treated as unpaid.
            </div>
          )}

          {/* Payroll table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                  <th className="p-3 sm:p-4 font-bold">Employee Name</th>
                  <th className="p-3 sm:p-4 text-center font-bold">
                    Days Present
                  </th>
                  {payTypeMode === "monthly" && (
                    <th className="p-3 sm:p-4 text-center font-bold">
                      Days Absent
                    </th>
                  )}
                  <th className="p-3 sm:p-4 text-right font-bold">
                    {payTypeMode === "weekly" ? "Per Day Amt" : "Monthly Base"}
                  </th>
                  {payTypeMode === "weekly" && (
                    <th className="p-3 sm:p-4 text-right font-bold text-amber-300">
                      Extra ★
                    </th>
                  )}
                  {/* CHANGE: Manual Override column REMOVED */}
                  <th className="p-3 sm:p-4 text-right font-bold">
                    Deduct Adv.
                  </th>
                  <th className="p-3 sm:p-4 text-right font-bold">
                    Net Payout
                  </th>
                  <th className="p-3 sm:p-4 text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payrollEmployees
                  .slice(
                    (payPage - 1) * ITEMS_PER_PAGE,
                    payPage * ITEMS_PER_PAGE,
                  )
                  .map((emp) => {
                    const isNonEmp = emp.employee_type === "non_employee";
                    const { daysPresent, daysAbsent, holidayDays } =
                      getEmpAttendanceMetrics(emp.id);
                    const { outstandingBalance } = getEmpLedgerTotals(emp.id);
                    const advanceInput = advances[emp.id] || "";

                    // Monthly: 2-free-absent rule; non-employees: fixed base
                    let calculatedSalary = 0;
                    if (payTypeMode === "weekly") {
                      const extra = Number(weeklyExtras[emp.id] || 0);
                      const gross =
                        daysPresent * Number(emp.per_day_amount || 0) + extra;
                      calculatedSalary = Math.round(
                        Math.max(0, gross - Number(advanceInput)),
                      );
                    } else {
                      if (isNonEmp) {
                        calculatedSalary = Math.round(
                          Math.max(
                            0,
                            Number(emp.monthly_salary || 0) -
                              Number(advanceInput),
                          ),
                        );
                      } else {
                        const monthlySalary = Number(emp.monthly_salary || 0);
                        const paidAbsent = Math.min(daysAbsent, 2);
                        const effectiveDays =
                          daysPresent + holidayDays + paidAbsent;
                        const dailyRate =
                          daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
                        calculatedSalary = Math.round(
                          Math.max(
                            0,
                            effectiveDays * dailyRate - Number(advanceInput),
                          ),
                        );
                      }
                    }

                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-800/30 ${isNonEmp ? "bg-indigo-950/10" : ""}`}
                      >
                        <td className="p-3 sm:p-4 font-semibold text-slate-100">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {emp.name}
                            {isNonEmp && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-indigo-950/60 text-indigo-300 border border-indigo-800 rounded-full whitespace-nowrap">
                                Fixed
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 sm:p-4 text-center font-bold text-emerald-400">
                          {isNonEmp ? "—" : daysPresent}
                        </td>
                        {payTypeMode === "monthly" && (
                          <td className="p-3 sm:p-4 text-center font-bold text-red-400">
                            {isNonEmp ? "—" : daysAbsent}
                          </td>
                        )}

                        <td className="p-3 sm:p-4 text-right">
                          {isNonEmp ? (
                            <span className="text-indigo-300 font-semibold">
                              ₹
                              {Number(emp.monthly_salary || 0).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          ) : (
                            `₹${Number(payTypeMode === "weekly" ? emp.per_day_amount : emp.monthly_salary || 0).toLocaleString("en-IN")}`
                          )}
                        </td>

                        {payTypeMode === "weekly" && (
                          <td className="p-3 sm:p-4 text-right">
                            <input
                              type="number"
                              placeholder="0"
                              value={weeklyExtras[emp.id] || ""}
                              onChange={(e) =>
                                setWeeklyExtras((prev) => ({
                                  ...prev,
                                  [emp.id]: Number(e.target.value),
                                }))
                              }
                              className="w-20 sm:w-24 bg-amber-950/20 border border-amber-900/50 text-right text-amber-300 rounded-lg px-2 py-1 outline-none focus:border-amber-500 font-mono text-xs"
                            />
                          </td>
                        )}

                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <input
                              type="number"
                              placeholder="0"
                              value={advanceInput}
                              onChange={(e) =>
                                handleAdvanceChange(emp.id, e.target.value)
                              }
                              className="w-20 sm:w-24 bg-slate-950 border border-slate-700 text-right text-slate-100 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 font-mono text-xs"
                            />
                            <span className="text-[9px] sm:text-[10px] text-amber-400 font-medium whitespace-nowrap">
                              Bal: ₹{outstandingBalance.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 sm:p-4 text-right font-bold text-emerald-400 text-sm">
                          ₹{calculatedSalary.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <button
                            onClick={() => handleSettleSalaryDeduction(emp.id)}
                            className="px-2 sm:px-2.5 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-800 rounded-lg text-xs transition-colors flex items-center gap-1 mx-auto whitespace-nowrap"
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
                  <td
                    colSpan={payTypeMode === "weekly" ? 5 : 5}
                    className="p-3 sm:p-4 text-right text-slate-300 text-xs sm:text-sm"
                  >
                    Total Net Payout:
                  </td>
                  <td className="p-3 sm:p-4 text-right text-emerald-400 text-sm sm:text-base font-extrabold">
                    ₹{Math.round(totalEmployerPayable).toLocaleString("en-IN")}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <Pagination
            page={payPage}
            total={payrollEmployees.length}
            perPage={ITEMS_PER_PAGE}
            onChange={setPayPage}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 3: Employee Register & Ledger
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "register" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                <th className="p-3 sm:p-4 font-bold">Employee</th>
                <th className="p-3 sm:p-4 font-bold">Role / Dept</th>
                <th className="p-3 sm:p-4 text-right font-bold">
                  Advances Given
                </th>
                <th className="p-3 sm:p-4 text-right font-bold">Deducted</th>
                <th className="p-3 sm:p-4 text-right font-bold">Outstanding</th>
                <th className="p-3 sm:p-4 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees
                .slice((regPage - 1) * ITEMS_PER_PAGE, regPage * ITEMS_PER_PAGE)
                .map((emp) => {
                  const { totalGiven, totalDeducted, outstandingBalance } =
                    getEmpLedgerTotals(emp.id);
                  const isNonEmp = emp.employee_type === "non_employee";

                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/30">
                      <td className="p-3 sm:p-4">
                        <p className="font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                          {emp.name}
                          {isNonEmp && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-indigo-950/60 text-indigo-300 border border-indigo-800 rounded-full">
                              Non-Emp
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Joined:{" "}
                          {emp.date_of_joining
                            ? emp.date_of_joining.split("T")[0]
                            : "N/A"}
                        </p>
                      </td>
                      <td className="p-3 sm:p-4">
                        <p className="text-slate-200">{emp.role || "—"}</p>
                        <p className="text-[10px] text-slate-400">
                          {emp.department || "—"}
                        </p>
                      </td>
                      <td className="p-3 sm:p-4 text-right font-mono text-amber-400">
                        ₹{totalGiven.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 sm:p-4 text-right font-mono text-emerald-400">
                        ₹{totalDeducted.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 sm:p-4 text-right font-mono font-bold text-red-400">
                        ₹{outstandingBalance.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        {/* CHANGE: single ⋯ Actions button opens slide-in panel */}
                        <button
                          onClick={() => setSelectedRegEmp(emp)}
                          data-action="Employee Actions"
                          className="flex items-center gap-1.5 mx-auto px-3 py-1.5
                          bg-slate-800 hover:bg-slate-700 border border-slate-600
                          hover:border-indigo-500 text-slate-200 rounded-lg text-xs
                          font-medium transition-all group"
                        >
                          <MoreHorizontal
                            size={13}
                            className="text-slate-400 group-hover:text-indigo-400 transition-colors"
                          />
                          Actions
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {/* CHANGE: Pagination for Register tab */}
          <Pagination
            page={regPage}
            total={filteredEmployees.length}
            perPage={ITEMS_PER_PAGE}
            onChange={setRegPage}
          />
        </div>
      )}

      {/* CHANGE: Employee Actions Panel */}
      {selectedRegEmp && (
        <EmpPanel
          emp={selectedRegEmp}
          isAdmin={isAdmin}
          ledgerTotals={getEmpLedgerTotals(selectedRegEmp.id)}
          onAdvance={() => {
            openAdvanceModal(selectedRegEmp);
          }}
          onHistory={() => setLedgerViewEmp(selectedRegEmp)}
          onEdit={() => {
            openEditModal(selectedRegEmp);
          }}
          onClear={() => setClearConfirmEmp(selectedRegEmp)}
          onDelete={() => handleDeleteEmp(selectedRegEmp.id)}
          onClose={() => setSelectedRegEmp(null)}
        />
      )}

      {/* CELL POPUP MENU */}
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
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-colors ${opt.bg}`}
            >
              <span>{opt.label}</span>
              {opt.code && (
                <span className="font-mono text-[10px] opacity-70">
                  ({opt.code})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          Add / Edit Employee Modal
          CHANGE: Employee vs Non-Employee type selection
      ═══════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
            >
              <X size={18} />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-white pr-6">
              {editingEmp ? "Edit Employee" : "Add New Employee"}
            </h2>

            <form onSubmit={handleEmpSubmit} className="space-y-3">
              {/* Step 1: Full Name */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={empForm.name}
                  onChange={(e) =>
                    setEmpForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Ravi Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Step 2: Employee Type radio */}
              <div>
                <label className="text-xs text-slate-400 block mb-2">
                  Employee Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Employee option */}
                  <label
                    className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-all ${empForm.employee_type === "employee" ? "border-indigo-500 bg-indigo-950/40" : "border-slate-700 bg-slate-950 hover:border-slate-600"}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="employee_type"
                        value="employee"
                        checked={empForm.employee_type === "employee"}
                        onChange={() =>
                          setEmpForm((f) => ({
                            ...f,
                            employee_type: "employee",
                          }))
                        }
                        className="accent-indigo-500"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        Employee
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 pl-5">
                      Attendance tracked, weekly &amp; monthly pay
                    </span>
                  </label>

                  {/* Non-Employee option */}
                  <label
                    className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-all ${empForm.employee_type === "non_employee" ? "border-indigo-500 bg-indigo-950/40" : "border-slate-700 bg-slate-950 hover:border-slate-600"}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="employee_type"
                        value="non_employee"
                        checked={empForm.employee_type === "non_employee"}
                        onChange={() =>
                          setEmpForm((f) => ({
                            ...f,
                            employee_type: "non_employee",
                          }))
                        }
                        className="accent-indigo-500"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        Non-Employee
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 pl-5">
                      Fixed monthly base, no attendance needed
                    </span>
                  </label>
                </div>
              </div>

              {/* Employee-specific fields */}
              {empForm.employee_type === "employee" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={empForm.department}
                        onChange={(e) =>
                          setEmpForm((f) => ({
                            ...f,
                            department: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={empForm.role}
                        onChange={(e) =>
                          setEmpForm((f) => ({ ...f, role: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Per Day Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={empForm.per_day_amount}
                        onChange={(e) =>
                          setEmpForm((f) => ({
                            ...f,
                            per_day_amount: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Monthly Base (₹)
                      </label>
                      <input
                        type="number"
                        value={empForm.monthly_salary}
                        onChange={(e) =>
                          setEmpForm((f) => ({
                            ...f,
                            monthly_salary: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Date of Joining
                      </label>
                      <input
                        type="date"
                        value={empForm.date_of_joining}
                        onChange={(e) =>
                          setEmpForm((f) => ({
                            ...f,
                            date_of_joining: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Status
                      </label>
                      <select
                        value={empForm.status}
                        onChange={(e) =>
                          setEmpForm((f) => ({ ...f, status: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Non-Employee fields — only Fixed Monthly Base */}
              {empForm.employee_type === "non_employee" && (
                <>
                  <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-3 text-xs text-indigo-300">
                    Non-employees appear{" "}
                    <strong>only in the Monthly Salary tab</strong> with their
                    fixed base. They are excluded from the Attendance Grid and
                    Weekly Salary.
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Fixed Monthly Base (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={empForm.monthly_salary}
                      onChange={(e) =>
                        setEmpForm((f) => ({
                          ...f,
                          monthly_salary: e.target.value,
                        }))
                      }
                      placeholder="e.g. 15000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Status
                    </label>
                    <select
                      value={empForm.status}
                      onChange={(e) =>
                        setEmpForm((f) => ({ ...f, status: e.target.value }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Give Advance / Deduct Ledger Transaction Modal */}
      {isAdvanceModalOpen && selectedEmpForAdvance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-4 sm:p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAdvanceModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h2 className="text-base font-bold text-white">
              {advanceForm.transaction_type === "DEDUCTED"
                ? "Deduct Advance"
                : "Give Advance"}
            </h2>
            <p className="text-xs text-slate-400">
              Recording a ledger transaction for{" "}
              <span className="text-slate-200 font-semibold">
                {selectedEmpForAdvance.name}
              </span>
            </p>
            <form onSubmit={handleGiveAdvanceSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Transaction Type
                </label>
                <select
                  value={advanceForm.transaction_type}
                  onChange={(e) =>
                    setAdvanceForm((f) => ({
                      ...f,
                      transaction_type: e.target.value,
                      notes:
                        e.target.value === "DEDUCTED"
                          ? "Manual Advance Deduction"
                          : "Cash Advance",
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                >
                  <option value="GIVEN">Give Advance</option>
                  <option value="DEDUCTED">Deduct Advance</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2000"
                  value={advanceForm.amount}
                  onChange={(e) =>
                    setAdvanceForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={advanceForm.date}
                  onChange={(e) =>
                    setAdvanceForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  value={advanceForm.notes}
                  onChange={(e) =>
                    setAdvanceForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white text-xs font-semibold rounded-xl ${
                    advanceForm.transaction_type === "DEDUCTED"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-amber-600 hover:bg-amber-500"
                  }`}
                >
                  {advanceForm.transaction_type === "DEDUCTED"
                    ? "Confirm Deduction"
                    : "Confirm Advance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Advance Modal (Admin only) */}
      {isEditAdvanceModalOpen && editingAdvance && isAdmin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-4 sm:p-5 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setIsEditAdvanceModalOpen(false);
                setEditingAdvance(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h2 className="text-base font-bold text-white">
              Edit Advance Transaction
            </h2>
            <p className="text-xs text-slate-400">
              Admin editing advance record — changes are permanent.
            </p>
            <form onSubmit={handleEditAdvanceSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={editAdvanceForm.amount}
                  onChange={(e) =>
                    setEditAdvanceForm((f) => ({
                      ...f,
                      amount: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  value={editAdvanceForm.notes}
                  onChange={(e) =>
                    setEditAdvanceForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditAdvanceModalOpen(false);
                    setEditingAdvance(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear All Confirmation (Admin only) */}
      {clearConfirmEmp && isAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-red-900/50 rounded-2xl w-full max-w-sm p-4 sm:p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={18} />
              <h2 className="text-sm font-bold">Clear All Advance Records</h2>
            </div>
            <p className="text-xs text-slate-400">
              This will permanently delete{" "}
              <span className="text-white font-semibold">
                all advance transactions
              </span>{" "}
              for{" "}
              <span className="text-amber-400 font-semibold">
                {clearConfirmEmp.name}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setClearConfirmEmp(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClearAllAdvances(clearConfirmEmp.id)}
                data-action="Confirm Clear All"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ledger History Drawer — Print Ledger button is HERE (removed from register table) */}
      {ledgerViewEmp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-4 sm:p-6 space-y-6 shadow-2xl overflow-y-auto relative">
            <button
              onClick={() => setLedgerViewEmp(null)}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {ledgerViewEmp.name}
              </h2>
              <p className="text-xs text-slate-400">
                Advance Ledger Transaction History
              </p>
            </div>

            {(() => {
              const { totalGiven, totalDeducted, outstandingBalance, history } =
                getEmpLedgerTotals(ledgerViewEmp.id);
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">
                        Given
                      </p>
                      <p className="text-xs font-bold text-amber-400 mt-0.5">
                        ₹{totalGiven.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">
                        Deducted
                      </p>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">
                        ₹{totalDeducted.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">
                        Balance
                      </p>
                      <p className="text-xs font-bold text-red-400 mt-0.5">
                        ₹{outstandingBalance.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Print Ledger is HERE (not in the register table row) */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-300">
                      Transaction Logs
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          printAdvanceLedger(ledgerViewEmp, ledgerData)
                        }
                        data-action="Print Ledger"
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700"
                      >
                        <Printer size={12} /> Print Ledger
                      </button>
                      {isAdmin && history.length > 0 && (
                        <button
                          onClick={() => setClearConfirmEmp(ledgerViewEmp)}
                          data-action="Clear All"
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/40 hover:bg-red-700 text-red-400 hover:text-white text-xs rounded-lg transition-colors border border-red-900"
                        >
                          <Trash2 size={12} /> Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {history.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">
                        No transactions recorded yet.
                      </p>
                    ) : (
                      history.map((tx, idx) => {
                        const type = (
                          tx.transaction_type ||
                          tx.type ||
                          ""
                        ).toUpperCase();
                        const isGiven = type === "GIVEN" || type === "ADVANCE";
                        return (
                          <div
                            key={tx.id || idx}
                            className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div
                                className={`p-1.5 rounded-lg shrink-0 ${isGiven ? "bg-amber-950/80 text-amber-400" : "bg-emerald-950/80 text-emerald-400"}`}
                              >
                                {isGiven ? (
                                  <ArrowUpRight size={14} />
                                ) : (
                                  <ArrowDownLeft size={14} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-200">
                                  {isGiven
                                    ? "Advance Given"
                                    : "Salary Deduction"}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {tx.date ? tx.date.split("T")[0] : "N/A"}
                                </p>
                                {tx.notes && (
                                  <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">
                                    {tx.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <span
                                className={`font-mono font-bold ${isGiven ? "text-amber-400" : "text-emerald-400"}`}
                              >
                                {isGiven ? "+" : "-"}₹
                                {Number(tx.amount).toLocaleString("en-IN")}
                              </span>
                              {isAdmin && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingAdvance(tx);
                                      setEditAdvanceForm({
                                        amount: tx.amount,
                                        notes: tx.notes || "",
                                      });
                                      setIsEditAdvanceModalOpen(true);
                                    }}
                                    className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                                    title="Edit transaction"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAdvance(tx.id)}
                                    data-action="Delete Transaction"
                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                    title="Delete transaction"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
