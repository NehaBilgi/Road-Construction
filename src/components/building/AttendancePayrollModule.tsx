import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  Plus,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  History,
  Trash2,
  Edit2,
  Calendar,
  FileSpreadsheet,
  Paperclip,
  FileText,
  Users,
  UserCheck,
  UserX,
  Upload,
  Eye,
  CheckCircle2,
  ChevronDown
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
  attendance: Record<number, 'P' | 'A' | 'H' | 'L' | 'O'>;
  extraAllowance?: number;
  attachedFiles?: { name: string; url: string; date: string }[];
}

export interface DailyLabourHeadcount {
  id: string;
  date: string;
  contractorOrGang: string;
  trade: string;
  presentCount: number;
  absentCount: number;
  dailyRate: number;
  remarks?: string;
  attachedFile?: string;
}

const STORAGE_STAFF_KEY = 'CONSTRUCTION_PRO_BUILDING_STAFF_V2';
const STORAGE_LABOUR_HEADCOUNT_KEY = 'CONSTRUCTION_PRO_BUILDING_LABOUR_HEADCOUNT_V2';

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
    extraAllowance: 0,
    attendance: {
      1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'P', 6: 'P', 7: 'P',
      8: 'P', 9: 'P', 10: 'P', 11: 'A', 12: 'P', 13: 'P', 14: 'P',
      15: 'P', 16: 'P', 17: 'P', 18: 'O', 19: 'O', 20: 'O'
    },
    attachedFiles: []
  },
  {
    id: 'EMP-02',
    name: 'Imamsab',
    type: 'Employee',
    department: 'Crusher',
    role: 'Staff',
    perDayAmount: 300,
    monthlyBase: 18000,
    dateOfJoining: '2026-07-01',
    status: 'Active',
    advancesGiven: 0,
    advancesDeducted: 0,
    extraAllowance: 0,
    attendance: {
      1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P',
      8: 'P', 9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P',
      15: 'P', 16: 'P', 17: 'P', 18: 'O', 19: 'O', 20: 'P'
    },
    attachedFiles: []
  },
  {
    id: 'EMP-03',
    name: 'Valu rathore',
    type: 'Employee',
    department: 'Crusher',
    role: 'Staff',
    perDayAmount: 300,
    monthlyBase: 12000,
    dateOfJoining: '2026-07-01',
    status: 'Active',
    advancesGiven: 0,
    advancesDeducted: 0,
    extraAllowance: 0,
    attendance: {
      1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P',
      8: 'P', 9: 'P', 10: 'P', 11: 'A', 12: 'P', 13: 'P', 14: 'P',
      15: 'P', 16: 'P', 17: 'P', 18: 'P', 19: 'P', 20: 'P'
    },
    attachedFiles: []
  },
  {
    id: 'EMP-04',
    name: 'Raju Operator',
    type: 'Employee',
    department: 'Crusher',
    role: 'Staff',
    perDayAmount: 200,
    monthlyBase: 15000,
    dateOfJoining: '2026-07-01',
    status: 'Active',
    advancesGiven: 2000,
    advancesDeducted: 2000,
    extraAllowance: 0,
    attendance: {
      1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P',
      8: 'P', 9: 'P', 10: 'P', 11: 'A', 12: 'P', 13: 'P', 14: 'P',
      15: 'P', 16: 'A', 17: 'P', 18: 'P', 19: 'P', 20: 'P'
    },
    attachedFiles: []
  }
];

const INITIAL_LABOUR: DailyLabourHeadcount[] = [
  {
    id: 'LBR-01',
    date: '2026-09-20',
    contractorOrGang: 'Ansari Mason Gang',
    trade: 'Masons & Helpers',
    presentCount: 14,
    absentCount: 2,
    dailyRate: 750,
    remarks: 'Cast 3rd floor slab & boundary wall'
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

  const [labourHeadcounts, setLabourHeadcounts] = useState<DailyLabourHeadcount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LABOUR_HEADCOUNT_KEY);
      return saved ? JSON.parse(saved) : INITIAL_LABOUR;
    } catch {
      return INITIAL_LABOUR;
    }
  });

  const [activeTab, setActiveTab] = useState<'GRID' | 'LABOUR_HEADCOUNT' | 'PAYROLL' | 'REGISTER'>('GRID');
  const [payType, setPayType] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [currentYearMonth, setCurrentYearMonth] = useState({ year: 2026, month: 8 }); // 8 = September (0-indexed)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLabourModalOpen, setIsLabourModalOpen] = useState(false);
  const [drawerEmployee, setDrawerEmployee] = useState<BuildingEmployee | null>(null);

  // Form State for Employee Modal
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [empType, setEmpType] = useState<'Employee' | 'Non-Employee'>('Employee');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('Staff');
  const [perDayAmount, setPerDayAmount] = useState<number | ''>(0);
  const [monthlyBase, setMonthlyBase] = useState<number | ''>(0);
  const [dateOfJoining, setDateOfJoining] = useState('2026-09-20');
  const [empStatus, setEmpStatus] = useState<'Active' | 'Inactive'>('Active');

  // Form State for Daily Labour Headcount
  const [labourDate, setLabourDate] = useState('2026-09-20');
  const [contractorName, setContractorName] = useState('');
  const [labourTrade, setLabourTrade] = useState('Masons & Helpers');
  const [presentLabours, setPresentLabours] = useState<number | ''>(10);
  const [absentLabours, setAbsentLabours] = useState<number | ''>(1);
  const [dailyRate, setDailyRate] = useState<number | ''>(750);
  const [labourRemarks, setLabourRemarks] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LABOUR_HEADCOUNT_KEY, JSON.stringify(labourHeadcounts));
  }, [labourHeadcounts]);

  const totalDays = new Date(currentYearMonth.year, currentYearMonth.month + 1, 0).getDate();
  const daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);

  const monthLabel = useMemo(() => {
    return new Date(currentYearMonth.year, currentYearMonth.month, 1).toLocaleString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentYearMonth]);

  const handlePrevMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const toggleAttendance = (empId: string, day: number) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const current = emp.attendance[day] || '-';
        let next: 'P' | 'A' | 'H' | 'L' | 'O';
        if (current === '-') next = 'P';
        else if (current === 'P') next = 'A';
        else if (current === 'A') next = 'H';
        else if (current === 'H') next = 'L';
        else if (current === 'L') next = 'O';
        else next = 'P';

        return {
          ...emp,
          attendance: { ...emp.attendance, [day]: next }
        };
      })
    );
  };

  const handleOpenEditEmp = (emp: BuildingEmployee) => {
    setEditingEmpId(emp.id);
    setFullName(emp.name);
    setEmpType(emp.type);
    setDepartment(emp.department);
    setRole(emp.role);
    setPerDayAmount(emp.perDayAmount);
    setMonthlyBase(emp.monthlyBase);
    setDateOfJoining(emp.dateOfJoining);
    setEmpStatus(emp.status);
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    if (editingEmpId) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmpId
            ? {
                ...emp,
                name: fullName.trim(),
                type: empType,
                department: department.trim() || 'General',
                role: role.trim() || 'Staff',
                perDayAmount: Number(perDayAmount) || 0,
                monthlyBase: Number(monthlyBase) || 0,
                dateOfJoining,
                status: empStatus
              }
            : emp
        )
      );
    } else {
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
        extraAllowance: 0,
        attendance: {},
        attachedFiles: []
      };
      setEmployees([...employees, newEmp]);
    }
    setIsAddModalOpen(false);
    setEditingEmpId(null);
    setFullName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!drawerEmployee || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const newFile = {
      name: file.name,
      url: URL.createObjectURL(file),
      date: new Date().toISOString().split('T')[0]
    };

    const updated = employees.map((emp) =>
      emp.id === drawerEmployee.id
        ? { ...emp, attachedFiles: [...(emp.attachedFiles || []), newFile] }
        : emp
    );

    setEmployees(updated);
    setDrawerEmployee({
      ...drawerEmployee,
      attachedFiles: [...(drawerEmployee.attachedFiles || []), newFile]
    });
  };

  const handleSaveLabourHeadcount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorName.trim()) return;

    const newRecord: DailyLabourHeadcount = {
      id: `LBR-${Date.now().toString().slice(-4)}`,
      date: labourDate,
      contractorOrGang: contractorName.trim(),
      trade: labourTrade,
      presentCount: Number(presentLabours) || 0,
      absentCount: Number(absentLabours) || 0,
      dailyRate: Number(dailyRate) || 0,
      remarks: labourRemarks.trim() || undefined,
      attachedFile: attachedFileName || undefined
    };

    setLabourHeadcounts([newRecord, ...labourHeadcounts]);
    setIsLabourModalOpen(false);
    setContractorName('');
    setLabourRemarks('');
    setAttachedFileName('');
  };

  return (
    <div className="min-h-screen bg-[#070b14] font-sans text-slate-100 p-6 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base mb-1">
            <CalendarCheck className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white tracking-tight">Attendance & Salary Muster</h1>
          </div>
          <p className="text-sm text-slate-400">
            Track muster rolls, daily labour headcounts, wage payouts, and advance ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setEditingEmpId(null);
              setFullName('');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>

          <button
            onClick={() => setIsLabourModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Log Labour Count</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1a2335] border border-[#1e293b] text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-[#0d1321] border border-[#1e293b] rounded-xl px-4 py-2 font-semibold text-slate-200">
            <ChevronLeft onClick={handlePrevMonth} className="w-4 h-4 cursor-pointer hover:text-white mr-2" />
            <span>{monthLabel}</span>
            <ChevronRight onClick={handleNextMonth} className="w-4 h-4 cursor-pointer hover:text-white ml-2" />
          </div>

          <div className="flex items-center bg-[#0d1321] border border-[#1e293b] p-1 rounded-xl gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('GRID')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'GRID' ? 'bg-[#4F46E5] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Attendance Grid
            </button>
            <button
              onClick={() => setActiveTab('LABOUR_HEADCOUNT')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'LABOUR_HEADCOUNT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Labour Headcount ({labourHeadcounts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('PAYROLL')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'PAYROLL' ? 'bg-[#4F46E5] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Payroll Summary
            </button>
            <button
              onClick={() => setActiveTab('REGISTER')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'REGISTER' ? 'bg-[#4F46E5] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Employees Register
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: ATTENDANCE GRID */}
      {activeTab === 'GRID' && (
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] text-[11px] font-bold uppercase text-slate-400 bg-[#131b2c]">
                  <th className="py-4 px-6 min-w-[200px]">EMPLOYEE DETAILS</th>
                  {daysInMonth.map((d) => (
                    <th key={d} className="py-4 px-1.5 text-center font-mono">
                      {d}
                    </th>
                  ))}
                  <th className="py-4 px-2 text-center text-emerald-400">P</th>
                  <th className="py-4 px-2 text-center text-rose-400">A</th>
                  <th className="py-4 px-2 text-center text-amber-400">H</th>
                  <th className="py-4 px-2 text-center text-purple-400">O</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-slate-200">
                {employees.map((emp) => {
                  const vals = Object.values(emp.attendance);
                  const pCount = vals.filter((v) => v === 'P').length;
                  const aCount = vals.filter((v) => v === 'A').length;
                  const hCount = vals.filter((v) => v === 'H').length;
                  const oCount = vals.filter((v) => v === 'O').length;

                  return (
                    <tr key={emp.id} className="hover:bg-[#1a2333] transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{emp.name}</span>
                          {emp.status === 'Active' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 font-bold">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {emp.department} • ₹{emp.perDayAmount}/day
                        </div>
                      </td>
                      {daysInMonth.map((d) => {
                        const status = emp.attendance[d] || '-';
                        return (
                          <td
                            key={d}
                            onClick={() => toggleAttendance(emp.id, d)}
                            className="py-3 px-1 text-center cursor-pointer select-none"
                          >
                            <span
                              className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold mx-auto transition-colors ${
                                status === 'P'
                                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/30'
                                  : status === 'A'
                                  ? 'text-rose-500 bg-rose-950/40 border border-rose-900/30'
                                  : status === 'H'
                                  ? 'text-amber-500 bg-amber-950/40 border border-amber-900/30'
                                  : status === 'L'
                                  ? 'text-blue-400 bg-blue-950/40 border border-blue-900/30'
                                  : status === 'O'
                                  ? 'text-purple-400 bg-purple-950/40 border border-purple-900/30'
                                  : 'text-slate-600'
                              }`}
                            >
                              {status !== '-' && status}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-2 text-center font-bold text-emerald-400 font-mono">{pCount}</td>
                      <td className="py-3 px-2 text-center font-bold text-rose-400 font-mono">{aCount}</td>
                      <td className="py-3 px-2 text-center font-bold text-amber-400 font-mono">{hCount}</td>
                      <td className="py-3 px-2 text-center font-bold text-purple-400 font-mono">{oCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: DAILY LABOUR HEADCOUNT */}
      {activeTab === 'LABOUR_HEADCOUNT' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0d1321] border border-[#1e293b]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Labours Logged</div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {labourHeadcounts.reduce((sum, l) => sum + l.presentCount, 0)} Present
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0d1321] border border-[#1e293b]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Absent Labours</div>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                {labourHeadcounts.reduce((sum, l) => sum + l.absentCount, 0)} Absent
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0d1321] border border-[#1e293b]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Estimated Wage Liability</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                ₹{labourHeadcounts.reduce((sum, l) => sum + (l.presentCount * l.dailyRate), 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-[#0f1523] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] text-[10px] font-extrabold uppercase text-slate-400 bg-[#131b2c]">
                  <th className="py-3 px-4">DATE & ID</th>
                  <th className="py-3 px-4">CONTRACTOR / GANG</th>
                  <th className="py-3 px-4">TRADE</th>
                  <th className="py-3 px-4 text-center text-emerald-400">PRESENT</th>
                  <th className="py-3 px-4 text-center text-rose-400">ABSENT</th>
                  <th className="py-3 px-4 text-right">DAILY RATE</th>
                  <th className="py-3 px-4 text-right text-emerald-400">TOTAL PAYOUT</th>
                  <th className="py-3 px-4">ATTACHED FILE</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-slate-200">
                {labourHeadcounts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No labour headcounts recorded. Click "+ Log Labour Count" to start.
                    </td>
                  </tr>
                ) : (
                  labourHeadcounts.map((lbr) => (
                    <tr key={lbr.id} className="hover:bg-[#1a2333] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">
                        <div>{lbr.date}</div>
                        <div className="text-[10px] text-slate-500">{lbr.id}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{lbr.contractorOrGang}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-blue-300 border border-slate-700 font-medium">
                          {lbr.trade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400 text-sm">
                        {lbr.presentCount}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-400 text-sm">
                        {lbr.absentCount}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">₹{lbr.dailyRate}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-400">
                        ₹{(lbr.presentCount * lbr.dailyRate).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        {lbr.attachedFile ? (
                          <span className="flex items-center gap-1 text-[11px] text-blue-400 underline font-mono">
                            <Paperclip className="w-3 h-3" />
                            <span>{lbr.attachedFile}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this headcount record?')) {
                              setLabourHeadcounts(labourHeadcounts.filter((l) => l.id !== lbr.id));
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: PAYROLL SUMMARY */}
      {activeTab === 'PAYROLL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-[#0d1321] border border-[#1e293b] p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-300">Pay Type:</span>
              <div className="flex items-center bg-[#070b14] rounded-lg p-1">
                <button
                  onClick={() => setPayType('WEEKLY')}
                  className={`px-4 py-1.5 rounded text-sm font-semibold transition-all cursor-pointer ${
                    payType === 'WEEKLY' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1. Weekly
                </button>
                <button
                  onClick={() => setPayType('MONTHLY')}
                  className={`px-4 py-1.5 rounded text-sm font-semibold transition-all cursor-pointer ${
                    payType === 'MONTHLY' ? 'bg-[#3B82F6] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2. Monthly
                </button>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Sheet
            </button>
          </div>

          <div className="p-3 bg-[#1e1508] border border-[#4a3311] rounded-xl text-amber-400 text-sm font-medium">
            <span className="font-bold">Weekly formula:</span> (Days Present × Per Day Rate) + Extra – Advance. Holidays (O), Leave (L) and Absent (A) are unpaid.
          </div>

          <div className="bg-[#0f1523] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] text-[11px] font-bold uppercase text-slate-400 bg-[#131b2c]">
                  <th className="py-4 px-6">EMPLOYEE NAME</th>
                  <th className="py-4 px-6 text-center">DAYS PRESENT</th>
                  <th className="py-4 px-6 text-center">PER DAY AMT</th>
                  <th className="py-4 px-6 text-center text-amber-400">EXTRA ★</th>
                  <th className="py-4 px-6 text-center">DEDUCT ADV.</th>
                  <th className="py-4 px-6 text-center">NET PAYOUT</th>
                  <th className="py-4 px-6 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-slate-200">
                {employees.map((emp) => {
                  const pDays = Object.values(emp.attendance).filter((v) => v === 'P').length;
                  const netWeekly = Math.max(0, (pDays * emp.perDayAmount) + (emp.extraAllowance || 0) - emp.advancesDeducted);

                  return (
                    <tr key={emp.id} className="hover:bg-[#1a2333] transition-colors">
                      <td className="py-4 px-6 font-bold text-white">{emp.name}</td>
                      <td className="py-4 px-6 text-center font-bold text-emerald-400">{pDays}</td>
                      <td className="py-4 px-6 text-center text-slate-300">₹{emp.perDayAmount}</td>
                      <td className="py-4 px-6 text-center">
                        <input
                          type="number"
                          value={emp.extraAllowance || 0}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setEmployees(employees.map((item) => item.id === emp.id ? { ...item, extraAllowance: val } : item));
                          }}
                          className="w-24 px-3 py-1.5 bg-[#070b14] border border-[#1e293b] rounded-lg text-center text-slate-300 outline-none focus:border-amber-500/50"
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            value={emp.advancesDeducted}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setEmployees(employees.map((item) => item.id === emp.id ? { ...item, advancesDeducted: val } : item));
                            }}
                            className="w-24 px-3 py-1.5 bg-[#070b14] border border-[#1e293b] rounded-lg text-center text-slate-300 outline-none focus:border-blue-500/50"
                          />
                          <span className="text-[10px] text-amber-500 mt-1 font-medium">
                            Bal: ₹{Math.max(0, emp.advancesGiven - emp.advancesDeducted)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-black text-emerald-400 text-base">
                        ₹{netWeekly.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => alert(`Confirmed payout for ${emp.name}`)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/50 font-medium text-xs transition-colors cursor-pointer"
                        >
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

      {/* VIEW 4: EMPLOYEES REGISTER */}
      {activeTab === 'REGISTER' && (
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-[11px] font-bold uppercase text-slate-400 bg-[#131b2c]">
                <th className="py-4 px-6">EMPLOYEE</th>
                <th className="py-4 px-6">ROLE / DEPT</th>
                <th className="py-4 px-6 text-center">ADVANCES GIVEN</th>
                <th className="py-4 px-6 text-center">DEDUCTED</th>
                <th className="py-4 px-6 text-center">OUTSTANDING</th>
                <th className="py-4 px-6 text-center">DOCUMENTS</th>
                <th className="py-4 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] text-slate-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#1a2333] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{emp.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Joined: {emp.dateOfJoining}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-slate-300 text-sm">{emp.role}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{emp.department}</div>
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-amber-500">
                    ₹{emp.advancesGiven.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-emerald-500">
                    ₹{emp.advancesDeducted.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-rose-500">
                    ₹{(emp.advancesGiven - emp.advancesDeducted).toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center font-mono text-xs text-blue-400">
                    {emp.attachedFiles?.length || 0} Files
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setDrawerEmployee(emp)}
                      className="px-3 py-1.5 rounded-lg bg-[#1a2333] hover:bg-[#253046] border border-[#2d3a54] text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
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

      {/* DRAWER: EMPLOYEE FINANCIAL & FILE ACTIONS */}
      {drawerEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0e1626] border-l border-[#1E293B] h-full p-6 space-y-6 overflow-y-auto text-slate-100">
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
              <button onClick={() => setDrawerEmployee(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                handleOpenEditEmp(drawerEmployee);
                setDrawerEmployee(null);
              }}
              className="w-full py-2 bg-[#162032] hover:bg-[#1f2d47] border border-[#1E293B] text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Staff Details & Rates</span>
            </button>

            <div className="space-y-2">
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">FINANCIAL OVERVIEW</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#070c18] border border-[#182643] rounded-xl">
                  <div className="text-[10px] text-slate-400">Monthly Base</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    ₹{drawerEmployee.monthlyBase.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 bg-[#070c18] border border-[#182643] rounded-xl">
                  <div className="text-[10px] text-slate-400">Per Day Rate</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">₹{drawerEmployee.perDayAmount}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">MUSTER SLIPS & ATTACHMENTS</div>
              <label className="w-full p-3 rounded-2xl bg-[#162032] hover:bg-[#1f2d47] border border-[#22365e] flex items-center gap-3 cursor-pointer">
                <Upload className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-xs font-bold text-white">Upload Muster Document / File</div>
                  <div className="text-[10px] text-slate-400">Attach signed slips, IDs, or vouchers</div>
                </div>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>

              <div className="space-y-1.5 pt-1">
                {(drawerEmployee.attachedFiles || []).map((f, i) => (
                  <div key={i} className="p-2.5 bg-[#070c18] border border-[#182643] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-white font-medium">{f.name}</span>
                    </div>
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-bold text-[10px] shrink-0">
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">ADVANCE RECORD</div>
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
                  <div className="text-xs font-bold text-white">Record Cash Advance</div>
                  <div className="text-[10px] text-slate-400">Log an advance handed out on site</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT STAFF */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#1e293b]">
              <h2 className="text-xl font-bold text-white">
                {editingEmpId ? 'Edit Staff Details' : 'Add New Staff'}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ravi Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b101a] border border-[#1e293b] rounded-xl text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Employee Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setEmpType('Employee')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      empType === 'Employee' ? 'bg-[#1e1b4b]/40 border-indigo-500' : 'bg-[#0b101a] border-[#1e293b]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${empType === 'Employee' ? 'border-indigo-400' : 'border-slate-500'}`}>
                        {empType === 'Employee' && <div className="w-2 h-2 bg-indigo-400 rounded-full" />}
                      </div>
                      <span className="font-bold text-white text-sm">Employee</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Attendance tracked, weekly & monthly pay</p>
                  </div>

                  <div
                    onClick={() => setEmpType('Non-Employee')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      empType === 'Non-Employee' ? 'bg-[#1e1b4b]/40 border-indigo-500' : 'bg-[#0b101a] border-[#1e293b]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${empType === 'Non-Employee' ? 'border-indigo-400' : 'border-slate-500'}`}>
                        {empType === 'Non-Employee' && <div className="w-2 h-2 bg-indigo-400 rounded-full" />}
                      </div>
                      <span className="font-bold text-white text-sm">Non-Employee</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">Fixed monthly base, no attendance needed</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0b101a] border border-[#1e293b] rounded-xl text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0b101a] border border-[#1e293b] rounded-xl text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Per Day Amount (₹)</label>
                  <input
                    type="number"
                    value={perDayAmount}
                    onChange={(e) => setPerDayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#0b101a] border border-[#1e293b] rounded-xl text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Monthly Base (₹)</label>
                  <input
                    type="number"
                    value={monthlyBase}
                    onChange={(e) => setMonthlyBase(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#0b101a] border border-[#1e293b] rounded-xl text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Date of Joining</label>
                  <input
                    type="date"
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0b101a] border border-[#1e293b] rounded-xl text-slate-200 outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Status</label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-[#0b101a] border border-[#1e293b] rounded-xl text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  {editingEmpId ? 'Update Staff' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG DAILY LABOUR HEADCOUNT */}
      {isLabourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Log Day Labour Count</span>
              </h3>
              <button onClick={() => setIsLabourModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLabourHeadcount} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={labourDate}
                    onChange={(e) => setLabourDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Trade *</label>
                  <select
                    value={labourTrade}
                    onChange={(e) => setLabourTrade(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  >
                    <option value="Masons & Helpers">Masons & Helpers</option>
                    <option value="Bar Benders">Bar Benders</option>
                    <option value="Carpenters / Shuttering">Carpenters / Shuttering</option>
                    <option value="Excavators / Earthwork">Excavators / Earthwork</option>
                    <option value="Electricians & Plumbers">Electricians & Plumbers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Contractor / Gang Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ansari Masonry Group"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-emerald-400 font-bold mb-1">Present *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={presentLabours}
                    onChange={(e) => setPresentLabours(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-rose-400 font-bold mb-1">Absent *</label>
                  <input
                    type="number"
                    min="0"
                    value={absentLabours}
                    onChange={(e) => setAbsentLabours(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-rose-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Attach Attendance Slip / File Name</label>
                <input
                  type="text"
                  placeholder="e.g. site_muster_challan_sep20.pdf"
                  value={attachedFileName}
                  onChange={(e) => setAttachedFileName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Work Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Foundation excavation & footing concreting"
                  value={labourRemarks}
                  onChange={(e) => setLabourRemarks(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsLabourModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Save Day Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePayrollModule;
