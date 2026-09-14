import React, { useState } from 'react';
import { Users, Shield, Plus, CheckCircle2, UserCheck, Key } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const UserManagementModule: React.FC = () => {
  const { currentUser } = useERP();

  const [systemUsers, setSystemUsers] = useState([
    { id: '1', name: 'Habibulla Bilgi', email: 'habibullabilgiabu@gmail.com', role: 'SUPER_ADMIN', department: 'Executive Management', status: 'Active' },
    { id: '2', name: 'Admin User', email: 'admin@bilgicrushers.com', role: 'SUPER_ADMIN', department: 'Terminal Admin', status: 'Active' },
    { id: '3', name: 'Neha', email: 'neha.ops@bilgicrushers.com', role: 'STORE_MANAGER', department: 'Stores & Accounts', status: 'Active' },
    { id: '4', name: 'Ibrahim', email: 'ibrahim@bilgicrushers.com', role: 'SITE_SUPERVISOR', department: 'Plant Shift Ops', status: 'Active' },
    { id: '5', name: 'Er. Amit Sharma', email: 'amit.billing@bilgicrushers.com', role: 'SITE_ENGINEER', department: 'Road Civil Execution', status: 'Active' }
  ]);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('SITE_SUPERVISOR');
  const [userDept, setUserDept] = useState('Operations');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setSystemUsers([
      ...systemUsers,
      {
        id: Date.now().toString(),
        name: userName.trim(),
        email: userEmail.trim() || `${userName.toLowerCase().replace(/\s+/g, '')}@bilgicrushers.com`,
        role: userRole as any,
        department: userDept,
        status: 'Active'
      }
    ]);

    setUserName('');
    setUserEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-400" />
            User Management & Role Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            RBAC authentication matrix for plant operators, storekeepers, billing engineers, and directors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Create System User</h3>
          <form onSubmit={handleAddUser} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
                required
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email / Username</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="e.g. ramesh@bilgicrushers.com"
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Access Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Control)</option>
                <option value="OWNER">OWNER (Executive Reports)</option>
                <option value="SITE_ENGINEER">SITE_ENGINEER (BOQ & MB Book)</option>
                <option value="SITE_SUPERVISOR">SITE_SUPERVISOR (Attendance & Trips)</option>
                <option value="STORE_MANAGER">STORE_MANAGER (Inventory & PO)</option>
                <option value="ACCOUNTANT">ACCOUNTANT (Salary & Ledgers)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={userDept}
                onChange={(e) => setUserDept(e.target.value)}
                placeholder="e.g. Crusher Shift A"
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" /> Add User Account
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Authorized Personnel ({systemUsers.length})</h3>
          <div className="space-y-3">
            {systemUsers.map((u) => (
              <div key={u.id} className="p-4 rounded-xl bg-[#080e1e] border border-[#182643] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{u.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{u.email}</div>
                    <div className="text-[11px] text-slate-500">Dept: {u.department}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
