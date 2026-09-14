import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { LabourWorker, AttendanceRecord, LabourCategory } from '../../types/erp';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  UserX,
  CreditCard,
  Check,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const LabourAttendanceModule: React.FC = () => {
  const {
    workers,
    attendanceRecords,
    addAttendanceRecord,
    addWorker,
    currentProject,
    currentSite
  } = useERP();

  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'WORKERS'>('ATTENDANCE');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isNewWorkerModalOpen, setIsNewWorkerModalOpen] = useState(false);

  // New Attendance Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || '');
  const [status, setStatus] = useState<AttendanceRecord['status']>('Present');
  const [inTime, setInTime] = useState('08:00 AM');
  const [outTime, setOutTime] = useState('05:00 PM');
  const [normalHours, setNormalHours] = useState<number>(8.0);
  const [overtimeHours, setOvertimeHours] = useState<number>(2.0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [workAssigned, setWorkAssigned] = useState('5th Floor Column Formwork & Pouring');

  // New Worker Master Form State
  const [workerName, setWorkerName] = useState('');
  const [category, setCategory] = useState<LabourCategory>('Carpenter / Shuttering');
  const [skillLevel, setSkillLevel] = useState<LabourWorker['skillLevel']>('Skilled');
  const [dailyRate, setDailyRate] = useState<number>(900);
  const [phone, setPhone] = useState('');
  const [subcontractorGroup, setSubcontractorGroup] = useState('Ramesh Shuttering Gang');

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    const baseWage = status === 'Present' ? selectedWorker.dailyWageRate : status === 'Half Day' ? selectedWorker.dailyWageRate / 2 : 0;
    const otWage = (selectedWorker.overtimeRatePerHour || 150) * overtimeHours;
    const grossWage = baseWage + otWage;
    const netWage = Math.max(0, grossWage - advancePaid - deductions);

    addAttendanceRecord({
      date: selectedDate,
      projectId: currentProject?.id || 'proj-bldg-1',
      siteId: currentSite?.id || 'site-bldg-1',
      workerId: selectedWorker.id,
      workerName: selectedWorker.name,
      category: selectedWorker.category,
      status,
      inTime,
      outTime,
      normalHours: status === 'Absent' ? 0 : Number(normalHours),
      overtimeHours: status === 'Absent' ? 0 : Number(overtimeHours),
      dailyWageRate: selectedWorker.dailyWageRate,
      overtimeRate: selectedWorker.overtimeRatePerHour || 150,
      grossWage,
      advancePaid: Number(advancePaid),
      deductions: Number(deductions),
      netPayable: netWage,
      paymentStatus: 'UNPAID',
      workAssigned
    });

    setIsAttendanceModalOpen(false);
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    addWorker({
      name: workerName,
      category,
      skillLevel,
      dailyWageRate: Number(dailyRate),
      overtimeRatePerHour: Number(dailyRate) / 8 * 1.5,
      phone,
      subcontractorGroup: subcontractorGroup || undefined,
      currentSiteId: currentSite?.id || 'site-bldg-1',
      status: 'Active'
    });

    setIsNewWorkerModalOpen(false);
    setWorkerName('');
    setPhone('');
  };

  const filteredAttendance = attendanceRecords.filter((a) => {
    const matchesDate = a.date === selectedDate;
    const matchesSearch =
      a.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.workAssigned.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const totalLabourToday = filteredAttendance.length;
  const presentCount = filteredAttendance.filter((a) => a.status === 'Present').length;
  const totalDailyWageGross = filteredAttendance.reduce((sum, a) => sum + a.grossWage, 0);
  const totalOtHours = filteredAttendance.reduce((sum, a) => sum + a.overtimeHours, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              WORKFORCE & TIMEKEEPING
            </span>
            <span className="text-xs text-slate-400">Daily Attendance, Wages & OT Tracking</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Labour Attendance & Site Muster Roll
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track muster roll, punch-in/out, overtime, advances, and daily wage computation with supervisor sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewWorkerModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Worker</span>
          </button>

          <button
            onClick={() => setIsAttendanceModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <UserCheck className="h-4 w-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Today's Workforce Present</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            {presentCount} <span className="text-xs font-normal text-slate-400">Workers</span>
          </div>
          <span className="text-xs text-slate-400">
            Registered: {workers.length} active personnel
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Today's Gross Wage Bill</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono my-1">
            ₹{totalDailyWageGross.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400">
            Includes base wages + {totalOtHours} OT hrs
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Overtime Logged</span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono my-1">
            {totalOtHours.toFixed(1)} <span className="text-xs font-normal text-slate-400">Hours</span>
          </div>
          <span className="text-xs text-cyan-400 font-mono">
            Night shift & slab casting rush
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Payment Compliance</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono my-1">
            Weekly Cycle
          </div>
          <span className="text-xs text-slate-400">
            Ready for sheet generation
          </span>
        </div>
      </div>

      {/* SUB TABS & CONTROLS */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ATTENDANCE')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ATTENDANCE'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Muster Roll ({filteredAttendance.length})
            </button>
            <button
              onClick={() => setActiveTab('WORKERS')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'WORKERS'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Workers Master Roster ({workers.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'ATTENDANCE' && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search name, trade, work..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* VIEW 1: DAILY ATTENDANCE */}
        {activeTab === 'ATTENDANCE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Worker & Trade</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Timings</th>
                  <th className="py-3 px-3">Normal / OT Hrs</th>
                  <th className="py-3 px-3">Daily Rate</th>
                  <th className="py-3 px-3">Gross Wage</th>
                  <th className="py-3 px-3">Advance / Net</th>
                  <th className="py-3 px-3 text-right">Assigned Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">{att.workerName}</span>
                      <span className="text-[10px] text-cyan-400">{att.category}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : att.status === 'Half Day'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      {att.inTime || '-'} → {att.outTime || '-'}
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span className="font-bold text-slate-200">{att.normalHours}h</span>
                      {att.overtimeHours > 0 && (
                        <span className="text-cyan-300 ml-1.5 font-bold">+{att.overtimeHours}h OT</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-400">
                      ₹{att.dailyWageRate} / day
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-amber-400">
                      ₹{att.grossWage.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span className="font-bold text-emerald-400 block">₹{att.netPayable.toLocaleString()}</span>
                      {att.advancePaid > 0 && (
                        <span className="text-[10px] text-rose-400">Adv: -₹{att.advancePaid}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right text-slate-300 text-[11px] max-w-[200px] line-clamp-1">
                      {att.workAssigned}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: WORKERS MASTER ROSTER */}
        {activeTab === 'WORKERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Worker Name</th>
                  <th className="py-3 px-3">Skill Level</th>
                  <th className="py-3 px-3">Trade Category</th>
                  <th className="py-3 px-3">Daily Wage Rate</th>
                  <th className="py-3 px-3">OT Rate / Hour</th>
                  <th className="py-3 px-3">Subcontractor Gang</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">{worker.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{worker.phone || 'No phone'}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {worker.skillLevel}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-cyan-300">
                      {worker.category}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-amber-400">
                      ₹{worker.dailyWageRate} / day
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      ₹{worker.overtimeRatePerHour || 150} / hr
                    </td>

                    <td className="py-3.5 px-3 text-slate-300">
                      {worker.subcontractorGroup || 'Direct Daily Hire'}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {worker.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MARK ATTENDANCE MODAL */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-amber-400" />
              Mark Daily Labour Attendance & Wage
            </h3>

            <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Worker *</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.category}) - ₹{w.dailyWageRate}/day
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Attendance Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AttendanceRecord['status'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  >
                    <option value="Present">Present (Full Day)</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Overtime (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-cyan-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">In Time</label>
                  <input
                    type="text"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Out Time</label>
                  <input
                    type="text"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Advance Given Today (₹)</label>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Other Deductions (₹)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Task Assigned *</label>
                <input
                  type="text"
                  required
                  value={workAssigned}
                  onChange={(e) => setWorkAssigned(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Record Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW WORKER MODAL */}
      {isNewWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              Register New Labour Worker
            </h3>

            <form onSubmit={handleSaveWorker} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Worker Full Name *</label>
                <input
                  type="text"
                  required
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="e.g. Anand Shinde"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trade Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LabourCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Mason / Mistri">Mason / Mistri</option>
                    <option value="Bar Bender">Bar Bender</option>
                    <option value="Carpenter / Shuttering">Carpenter / Shuttering</option>
                    <option value="Helper / Unskilled">Helper / Unskilled</option>
                    <option value="Equipment Operator">Equipment Operator</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Painter">Painter</option>
                    <option value="Supervisor / Mukadam">Supervisor / Mukadam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Skill Classification</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as LabourWorker['skillLevel'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Highly Skilled">Highly Skilled</option>
                    <option value="Skilled">Skilled</option>
                    <option value="Semi-Skilled">Semi-Skilled</option>
                    <option value="Unskilled">Unskilled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Daily Base Wage (₹)</label>
                  <input
                    type="number"
                    required
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subcontractor Gang / Contractor</label>
                <input
                  type="text"
                  value={subcontractorGroup}
                  onChange={(e) => setSubcontractorGroup(e.target.value)}
                  placeholder="e.g. Ramesh Shuttering Gang"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewWorkerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
