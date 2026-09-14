import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  DollarSign,
  History,
  Trash2,
  Edit2,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export interface BuildingEmployee {
  id: string;
  name: string;
  type: 'Employee' | 'Non-Employee';
  department: string;
  role: string;
  perDayAmount: number;
  monthlyBase: number;
  dateOfJoining: string;
  status: 'Active' | 'Inactive';
  advancesGiven: number;
  advancesDeducted: number;
  attendance: Record<number, 'P' | 'A' | 'H' | 'L'>; // 1 to 31
}

const STORAGE_STAFF_KEY = 'CONSTRUCTION_PRO_BUILDING_STAFF_V1';

const INITIAL_STAFF: BuildingEmployee[] = [
  {
    id: 'EMP-01',
    name: 'Hassansab',
    type: 'Employee',
    department: 'Crusher',
    role: 'Staff',
    perDayAmount: 300,
    monthlyBase: 11000,
    dateOfJoining: '2026-07-01',
    status: 'Active',
    advancesGiven: 0,
    advancesDeducted: 0,
    attendance: {
      1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'H',
      8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P',
      15: 'A', 16: 'A', 17: 'P'
    }
  },
  {
    id: 'EMP-02',
    name: 'Imamsab',
    type: 'Employee',
    department: 'Civil Works',
    role: 'Mason Foreman',
    perDayAmount: 650,
    monthlyBase: 18000,
    dateOfJoining: '2026-06-15',
    status: 'Active',
    advancesGiven: 2000,
    advancesDeducted: 1000,
    attendance: {
      1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'H',
      8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P'
    }
  }
];

export const AttendancePayrollModule: React.FC = () => {
  const [employees, setEmployees] = useState<BuildingEmployee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STAFF_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [activeTab, setActiveTab] = useState<'GRID' | 'PAYROLL' | 'REGISTER'>('GRID');
  const [payType, setPayType] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [selectedMonth] = useState('August 2026');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [drawerEmployee, setDrawerEmployee] = useState<BuildingEmployee | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [empType, setEmpType] = useState<'Employee' | 'Non-Employee'>('Employee');
  const [department, setDepartment] = useState('Crusher');
  const [role, setRole] = useState('Staff');
  const [perDayAmount, setPerDayAmount] = useState<number | ''>(300);
  const [monthlyBase, setMonthlyBase] = useState<number | ''>(11000);
  const [dateOfJoining, setDateOfJoining] = useState('2026-08-17');
  const [empStatus, setEmpStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(employees));
  }, [employees]);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const toggleAttendance = (empId: string, day: number) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const current = emp.attendance[day] || 'P';
        const next: 'P' | 'A' | 'H' | 'L' =
          current === 'P' ? 'A' : current === 'A' ? 'H' : current === 'H' ? 'L' : 'P';
        return {
          ...emp,
          attendance: { ...emp.attendance, [day]: next }
        };
      })
    );
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newEmp: BuildingEmployee = {
      id: `EMP-${Date.now().toString().slice(-4)}`,
      name: fullName.trim(),
      type: empType,
      department: department.trim() || 'General',
      role: role.trim() || 'Staff',
      perDayAmount: Number(perDayAmount) || 0,
      monthlyBase: Number(monthlyBase) || 0,
      dateOfJoining,
      status: empStatus,
      advancesGiven: 0,
      advancesDeducted: 0,
      attendance: {}
    };

    setEmployees([...employees, newEmp]);
    setIsAddModalOpen(false);
    setFullName('');
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <CalendarCheck className="w-5 h-5" />
            <h1 className="text-2xl font-black text-white tracking-tight">Attendance & Payroll</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track attendance, salary payouts, and advance ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="p-3 rounded-2xl bg-[#0c1427] border border-[#182643] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#070c18] border border-[#1e293b] rounded-xl px-2.5 py-1.5 font-bold text-slate-300">
            <ChevronLeft className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
            <span className="px-2">{selectedMonth}</span>
            <ChevronRight className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          </div>

          <div className="flex items-center bg-[#070c18] border border-[#1e293b] p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('GRID')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'GRID' ? 'bg-[#4F46E5] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Attendance Grid
            </button>
            <button
              onClick={() => setActiveTab('PAYROLL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'PAYROLL' ? 'bg-[#4F46E5] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Payroll Summary
            </button>
            <button
              onClick={() => setActiveTab('REGISTER')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'REGISTER' ? 'bg-[#4F46E5] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Employees Register
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: ATTENDANCE GRID */}
      {activeTab === 'GRID' && (
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/90">
                  <th className="py-3 px-4 min-w-[160px]">EMPLOYEE DETAILS</th>
                  {daysInMonth.map((d) => (
                    <th key={d} className="py-3 px-1.5 text-center font-mono">
                      {d}
                    </th>
                  ))}
                  <th className="py-3 px-2 text-center text-emerald-400">P</th>
                  <th className="py-3 px-2 text-center text-amber-400">H</th>
                  <th className="py-3 px-2 text-center text-rose-400">A</th>
                  <th className="py-3 px-2 text-center text-blue-400">L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
                {employees.map((emp) => {
                  const values = Object.values(emp.attendance);
                  const pCount = values.filter((v) => v === 'P').length;
                  const hCount = values.filter((v) => v === 'H').length;
                  const aCount = values.filter((v) => v === 'A').length;
                  const lCount = values.filter((v) => v === 'L').length;

                  return (
                    <tr key={emp.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.department} • ₹{emp.perDayAmount}/day</div>
                      </td>
                      {daysInMonth.map((d) => {
                        const status = emp.attendance[d] || '-';
                        return (
                          <td
                            key={d}
                            onClick={() => toggleAttendance(emp.id, d)}
                            className="py-2.5 px-1 text-center font-mono text-[11px] font-bold cursor-pointer select-none hover:bg-slate-800"
                          >
                            <span
                              className={`w-5 h-5 rounded inline-flex items-center justify-center ${
                                status === 'P'
                                  ? 'text-emerald-400'
                                  : status === 'A'
                                  ? 'text-rose-400 bg-rose-950/40'
                                  : status === 'H'
                                  ? 'text-amber-400'
                                  : status === 'L'
                                  ? 'text-blue-400'
                                  : 'text-slate-600'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-2 text-center font-bold text-emerald-400 font-mono">{pCount}</td>
                      <td className="py-3 px-2 text-center font-bold text-amber-400 font-mono">{hCount}</td>
                      <td className="py-3 px-2 text-center font-bold text-rose-400 font-mono">{aCount}</td>
                      <td className="py-3 px-2 text-center font-bold text-blue-400 font-mono">{lCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PAYROLL SUMMARY (WEEKLY & MONTHLY) */}
      {activeTab === 'PAYROLL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Pay Type:</span>
              <div className="flex items-center bg-[#070c18] border border-[#1e293b] p-1 rounded-xl gap-1">
                <button
                  onClick={() => setPayType('WEEKLY')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    payType === 'WEEKLY' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1. Weekly
                </button>
                <button
                  onClick={() => setPayType('MONTHLY')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    payType === 'MONTHLY' ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2. Monthly
                </button>
              </div>
            </div>

            <button className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export to Tally</span>
            </button>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-amber-400 text-xs font-medium">
            {payType === 'WEEKLY'
              ? 'Weekly formula: (Days Present × Per Day Rate) + Extra – Advance. Holidays (O), Leave (L) and Absent (A) are all treated as unpaid.'
              : 'Monthly formula: Net = (Present + Company Offs + min(Absent, 2)) ÷ Days in Month × Base – Advance. Up to 2 absent days are free. Non-employees receive their fixed base each month.'}
          </div>

          <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80">
                  <th className="py-3 px-4">EMPLOYEE NAME</th>
                  <th className="py-3 px-4 text-center">DAYS PRESENT</th>
                  {payType === 'MONTHLY' && <th className="py-3 px-4 text-center text-rose-400">DAYS ABSENT</th>}
                  <th className="py-3 px-4 text-center">
                    {payType === 'WEEKLY' ? 'PER DAY AMT' : 'MONTHLY BASE'}
                  </th>
                  {payType === 'WEEKLY' && <th className="py-3 px-4 text-center text-amber-400">EXTRA ★</th>}
                  <th className="py-3 px-4 text-center">DEDUCT ADV.</th>
                  <th className="py-3 px-4 text-center text-emerald-400">NET PAYOUT</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
                {employees.map((emp) => {
                  const pDays = Object.values(emp.attendance).filter((v) => v === 'P').length || 6;
                  const aDays = Object.values(emp.attendance).filter((v) => v === 'A').length || 2;
                  const netWeekly = pDays * emp.perDayAmount;
                  const netMonthly = Math.round(((pDays + 2) / 31) * emp.monthlyBase);

                  return (
                    <tr key={emp.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{emp.name}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">{pDays}</td>
                      {payType === 'MONTHLY' && (
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-400">{aDays}</td>
                      )}
                      <td className="py-3.5 px-4 text-center font-mono">
                        ₹{payType === 'WEEKLY' ? emp.perDayAmount : emp.monthlyBase.toLocaleString('en-IN')}
                      </td>
                      {payType === 'WEEKLY' && (
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="number"
                            defaultValue={0}
                            className="w-16 px-2 py-1 bg-[#162032] border border-[#1E293B] rounded-lg text-center font-mono outline-none"
                          />
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="number"
                          defaultValue={0}
                          className="w-20 px-2 py-1 bg-[#162032] border border-[#1E293B] rounded-lg text-center font-mono outline-none"
                        />
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Bal: ₹{emp.advancesGiven - emp.advancesDeducted}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-400 text-sm">
                        ₹{(payType === 'WEEKLY' ? netWeekly : netMonthly).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button className="px-3 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-bold text-[11px] hover:bg-emerald-900">
                          ✓ Confirm
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: EMPLOYEES REGISTER */}
      {activeTab === 'REGISTER' && (
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80">
                <th className="py-3 px-4">EMPLOYEE</th>
                <th className="py-3 px-4">ROLE / DEPT</th>
                <th className="py-3 px-4 text-center">ADVANCES GIVEN</th>
                <th className="py-3 px-4 text-center">DEDUCTED</th>
                <th className="py-3 px-4 text-center">OUTSTANDING</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#121c33]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{emp.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Joined: {emp.dateOfJoining}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{emp.role}</div>
                    <div className="text-[10px] text-slate-400">{emp.department}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">₹{emp.advancesGiven}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">₹{emp.advancesDeducted}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-400">
                    ₹{emp.advancesGiven - emp.advancesDeducted}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setDrawerEmployee(emp)}
                      className="px-3 py-1 rounded-xl bg-[#162032] hover:bg-slate-800 text-slate-300 border border-[#1E293B] font-bold text-[11px]"
                    >
                      ••• Actions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DRAWER: EMPLOYEE FINANCIAL ACTIONS */}
      {drawerEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0e1626] border-l border-[#1E293B] h-full p-6 space-y-6 overflow-y-auto text-slate-100 animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-base">
                  {drawerEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{drawerEmployee.name}</h3>
                  <p className="text-[11px] text-slate-400">{drawerEmployee.role} • {drawerEmployee.department}</p>
                </div>
              </div>
              <button onClick={() => setDrawerEmployee(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badge & Date */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{drawerEmployee.status}</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Joined {drawerEmployee.dateOfJoining}</span>
            </div>

            {/* Financial Overview Cards */}
            <div className="space-y-2">
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">FINANCIAL OVERVIEW</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#070c18] border border-[#182643] rounded-xl">
                  <div className="text-[10px] text-slate-400">₹ Monthly Base</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    ₹{drawerEmployee.monthlyBase.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 bg-[#070c18] border border-[#182643] rounded-xl">
                  <div className="text-[10px] text-slate-400">₹ Per Day</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">₹{drawerEmployee.perDayAmount}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 bg-[#070c18] border border-[#182643] rounded-xl">
                  <div className="text-[9px] text-amber-400 font-bold">Given</div>
                  <div className="text-sm font-black text-white font-mono">₹{drawerEmployee.advancesGiven}</div>
                </div>
                <div className="p-2.5 bg-[#070c18] border border-[#182643] rounded-xl">
                  <div className="text-[9px] text-emerald-400 font-bold">Recovered</div>
                  <div className="text-sm font-black text-white font-mono">₹{drawerEmployee.advancesDeducted}</div>
                </div>
                <div className="p-2.5 bg-[#070c18] border border-[#182643] rounded-xl">
                  <div className="text-[9px] text-slate-400 font-bold">Balance</div>
                  <div className="text-sm font-black text-white font-mono">
                    ₹{drawerEmployee.advancesGiven - drawerEmployee.advancesDeducted}
                  </div>
                </div>
              </div>
            </div>

            {/* Ledger Actions */}
            <div className="space-y-2">
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">LEDGER ACTIONS</div>
              <button
                onClick={() => {
                  const amt = prompt('Enter advance cash given (₹):');
                  if (amt && Number(amt) > 0) {
                    setEmployees((prev) =>
                      prev.map((e) =>
                        e.id === drawerEmployee.id ? { ...e, advancesGiven: e.advancesGiven + Number(amt) } : e
                      )
                    );
                    setDrawerEmployee(null);
                  }
                }}
                className="w-full p-3 rounded-2xl bg-[#162032] hover:bg-[#1f2d47] border border-[#22365e] flex items-center gap-3 text-left transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">Record Advance</div>
                  <div className="text-[10px] text-slate-400">Log a cash advance given to employee</div>
                </div>
              </button>

              <button className="w-full p-3 rounded-2xl bg-[#162032] hover:bg-[#1f2d47] border border-[#22365e] flex items-center gap-3 text-left transition-all cursor-pointer">
                <History className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white">View Ledger / History</div>
                  <div className="text-[10px] text-slate-400">See all advance transactions & deductions</div>
                </div>
              </button>
            </div>

            {/* Admin Only Actions */}
            <div className="space-y-2 pt-2 border-t border-[#1E293B]">
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-500">ADMIN ONLY</div>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${drawerEmployee.name}?`)) {
                    setEmployees(employees.filter((e) => e.id !== drawerEmployee.id));
                    setDrawerEmployee(null);
                  }
                }}
                className="w-full p-3 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/50 flex items-center gap-3 text-left transition-all cursor-pointer"
              >
                <Trash2 className="w-5 h-5 text-rose-400" />
                <div>
                  <div className="text-xs font-bold text-rose-400">Delete Employee</div>
                  <div className="text-[10px] text-slate-500">Permanently remove record & all data</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">Add New Employee</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ravi Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Employee Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmpType('Employee')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      empType === 'Employee'
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-[#1E293B] bg-[#162032]'
                    }`}
                  >
                    <div className="font-bold text-white">● Employee</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Attendance tracked, weekly & monthly pay</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmpType('Non-Employee')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      empType === 'Non-Employee'
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-[#1E293B] bg-[#162032]'
                    }`}
                  >
                    <div className="font-bold text-white">○ Non-Employee</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Fixed monthly base, no attendance needed</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Per Day Amount (₹)</label>
                  <input
                    type="number"
                    value={perDayAmount}
                    onChange={(e) => setPerDayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Monthly Base (₹)</label>
                  <input
                    type="number"
                    value={monthlyBase}
                    onChange={(e) => setMonthlyBase(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
