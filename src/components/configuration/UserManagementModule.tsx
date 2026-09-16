import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  UserCheck,
  Eye,
  EyeOff,
  Lock,
  Building2,
  Milestone,
  Layers
} from 'lucide-react';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'STORE_MANAGER'
  | 'SITE_SUPERVISOR'
  | 'SITE_ENGINEER'
  | 'AUDITOR';

export type AllowedModuleScope = 'ROAD_ONLY' | 'BUILDING_ONLY' | 'BOTH_ROAD_AND_BUILDING';

export interface SystemUser {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  role: UserRole;
  allowedScope: AllowedModuleScope;
  department: string;
  status: 'Active' | 'Inactive';
}

const STORAGE_USERS_KEY = 'PAVETRACK_AUTHORIZED_PERSONNEL_V2';

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr-1',
    fullName: 'Habibulla Bilgi',
    username: 'admin',
    password: 'Password@123',
    role: 'SUPER_ADMIN',
    allowedScope: 'BOTH_ROAD_AND_BUILDING',
    department: 'Operations',
    status: 'Active'
  }
];

export const UserManagement: React.FC = () => {
  const { 
    currentUser, 
    userRole, 
    usersList = [], 
    addManagedUser, 
    updateManagedUser, 
    deleteManagedUser 
  } = useERP() as any;

  // Strict Admin Check
  const isAdmin = useMemo(() => {
    const directRole = String(userRole || currentUser?.role || '').trim().toUpperCase();
    return directRole === 'SUPER_ADMIN' || directRole === 'ADMIN' || directRole.includes('ADMIN');
  }, [userRole, currentUser]);

  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_USERS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((u: any) => ({
              id: u.id || `usr-${Math.random().toString(36).substring(2, 7)}`,
              fullName: u.fullName || u.name || 'User',
              username: u.username || (u.email ? u.email.split('@')[0] : 'user'),
              password: u.password || 'Password@123',
              role: (u.role || 'SITE_SUPERVISOR') as UserRole,
              allowedScope: (u.allowedScope || 'BOTH_ROAD_AND_BUILDING') as AllowedModuleScope,
              department: u.department || 'Operations',
              status: (u.status || 'Active') as 'Active' | 'Inactive'
            }));
          }
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('SUPER_ADMIN');
  const [allowedScope, setAllowedScope] = useState<AllowedModuleScope>('BOTH_ROAD_AND_BUILDING');
  const [department, setDepartment] = useState('Operations');

  // Auto-sync state to localStorage whenever `users` changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        localStorage.setItem('CONSTRUCTION_PRO_ERP_STORAGE_V7_USER_ACCOUNTS', JSON.stringify(users));
      }
    } catch (err) {
      console.error('Failed saving users to localStorage', err);
    }
  }, [users]);

  const handleEdit = (user: SystemUser) => {
    if (!isAdmin) {
      alert('Access Denied: Only administrators have permission to edit users.');
      return;
    }
    setEditingId(user.id);
    setFullName(user.fullName || '');
    setUsername(user.username || '');
    setPassword(user.password || '');
    setRole(user.role || 'SITE_SUPERVISOR');
    setAllowedScope(user.allowedScope || 'BOTH_ROAD_AND_BUILDING');
    setDepartment(user.department || 'Operations');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFullName('');
    setUsername('');
    setPassword('');
    setRole('SUPER_ADMIN');
    setAllowedScope('BOTH_ROAD_AND_BUILDING');
    setDepartment('Operations');
  };

  const handleDelete = (id: string, name: string) => {
    if (!isAdmin) {
      alert('Access Denied: Only administrators have permission to delete users.');
      return;
    }
    if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (typeof deleteManagedUser === 'function') {
        deleteManagedUser(id);
      }
      if (editingId === id) {
        handleCancelEdit();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Access Denied: Only administrators can create or edit users.');
      return;
    }
    if (!fullName.trim() || !username.trim()) return;

    if (editingId) {
      const updatedList = users.map((u) =>
        u.id === editingId
          ? {
              ...u,
              fullName: fullName.trim(),
              username: username.trim().toLowerCase(),
              password: password.trim() ? password.trim() : u.password,
              role,
              allowedScope,
              department: department.trim() || 'Operations'
            }
          : u
      );
      setUsers(updatedList);
      if (typeof updateManagedUser === 'function') {
        updateManagedUser(editingId, {
          fullName: fullName.trim(),
          name: fullName.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim() || undefined,
          role: role as any,
          allowedScope,
          department: department.trim() || 'Operations'
        });
      }
      handleCancelEdit();
    } else {
      const newId = `usr-${Date.now().toString().slice(-4)}`;
      const newUser: SystemUser = {
        id: newId,
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim() || 'Password@123',
        role,
        allowedScope,
        department: department.trim() || 'Operations',
        status: 'Active'
      };
      setUsers((prev) => [newUser, ...prev]);
      if (typeof addManagedUser === 'function') {
        addManagedUser({
          name: fullName.trim(),
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          password: password.trim() || 'Password@123',
          email: `${username.trim().toLowerCase()}@erp.internal`,
          role: role as any,
          allowedScope,
          department: department.trim() || 'Operations',
          status: 'Active'
        });
      }
      setFullName('');
      setUsername('');
      setPassword('');
      setAllowedScope('BOTH_ROAD_AND_BUILDING');
      setDepartment('Operations');
    }
  };

  const getRoleBadgeStyle = (r: string) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return 'bg-blue-900/40 text-blue-400 border border-blue-500/30';
      case 'STORE_MANAGER':
        return 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/30';
      case 'SITE_SUPERVISOR':
        return 'bg-sky-900/40 text-sky-400 border border-sky-500/30';
      case 'SITE_ENGINEER':
        return 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30';
      case 'AUDITOR':
        return 'bg-amber-900/40 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  const getScopeBadge = (scope: AllowedModuleScope) => {
    switch (scope) {
      case 'ROAD_ONLY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Milestone className="w-3 h-3" />
            <span>Road Only</span>
          </span>
        );
      case 'BUILDING_ONLY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/40 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span>Building Only</span>
          </span>
        );
      case 'BOTH_ROAD_AND_BUILDING':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Road & Building</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans text-slate-100 min-h-screen bg-[#070d18]">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <Users className="w-6 h-6 text-sky-400" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            User Management & Role Permissions
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          RBAC matrix for road site operators, building engineers, storekeepers, and management.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-4 bg-[#0B1322] border border-[#1E293B] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-bold text-white">
              {editingId ? 'Edit System User' : 'Create System User'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patil"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. ramesh_patil"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                Password {editingId && <span className="font-normal text-slate-500">(leave blank to keep unchanged)</span>}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!editingId}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Control)</option>
                <option value="SITE_SUPERVISOR">SITE_SUPERVISOR (Site Operations & Logs)</option>
                <option value="STORE_MANAGER">STORE_MANAGER (Inventory & Stock)</option>
                <option value="SITE_ENGINEER">SITE_ENGINEER (Billing & Execution)</option>
                <option value="AUDITOR">AUDITOR (Read Only)</option>
              </select>
            </div>

            {/* Scope / Construction Access Permission */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Construction Domain Access</label>
              <select
                value={allowedScope}
                onChange={(e) => setAllowedScope(e.target.value as AllowedModuleScope)}
                className="w-full px-3.5 py-2.5 bg-[#070D18] border border-sky-500/40 rounded-xl text-white outline-none focus:border-sky-400 cursor-pointer font-medium"
              >
                <option value="BOTH_ROAD_AND_BUILDING">Road & Building (Both Domains)</option>
                <option value="ROAD_ONLY">Road Construction Only</option>
                <option value="BUILDING_ONLY">Building Construction Only</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Department</label>
              <input
                type="text"
                placeholder="Operations"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {editingId ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update User Account</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>+ Add User Account</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Authorized Personnel List */}
        <div className="lg:col-span-8 bg-[#0B1322] border border-[#1E293B] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-[#1E293B] pb-3">
            <h2 className="text-sm sm:text-base font-bold text-white">
              Authorized Personnel ({users.length})
            </h2>
          </div>

          <div className="space-y-3">
            {users.map((user) => {
              const displayName = user.fullName || 'User';
              const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

              return (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl bg-[#070D18] border border-[#1E293B] hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  {/* Left: Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#162032] border border-[#1E293B] flex items-center justify-center font-black text-white text-sm shrink-0">
                      {initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{displayName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${getRoleBadgeStyle(user.role)}`}>
                          {user.role}
                        </span>
                        {getScopeBadge(user.allowedScope || 'BOTH_ROAD_AND_BUILDING')}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                        <span>@{user.username}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Lock className="w-3 h-3 text-slate-600" />
                          <span>••••••••</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Dept: {user.department || 'Operations'}</p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </div>

                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="p-2 rounded-xl bg-[#131d33] hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-[#1E293B] hover:border-blue-500/40 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user.id, displayName)}
                          className="p-2 rounded-xl bg-[#131d33] hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-[#1E293B] hover:border-rose-500/40 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserManagementModule = UserManagement;
export default UserManagement;
