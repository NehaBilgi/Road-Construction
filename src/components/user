import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Shield,
  Key,
  Mail,
  User,
  Calendar,
  Lock,
  CheckCircle2
} from 'lucide-react';

export type SystemRole = 'Admin' | 'Inventory Manager' | 'Store Keeper' | 'Auditor' | 'Read Only';

export interface ManagedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: SystemRole;
  accountExpiry: string;
  createdDate: string;
  isCurrentUser?: boolean;
}

const INITIAL_SYSTEM_USERS: ManagedUser[] = [
  {
    id: 'u-1',
    name: 'Hassansab',
    username: 'hassansab',
    email: 'hassansab@gmail.com',
    role: 'Store Keeper',
    accountExpiry: 'Permanent Access',
    createdDate: '28/07/2026'
  },
  {
    id: 'u-2',
    name: 'Imamsab',
    username: 'imamsab',
    email: 'imamsab@gmail.com',
    role: 'Store Keeper',
    accountExpiry: 'Permanent Access',
    createdDate: '28/07/2026'
  },
  {
    id: 'u-3',
    name: 'Neha Bilgi',
    username: 'neha',
    email: 'nehabilgi@gmail.com',
    role: 'Admin',
    accountExpiry: 'Permanent Access',
    createdDate: '23/06/2026'
  },
  {
    id: 'u-4',
    name: 'Inventory Manager',
    username: 'manager',
    email: 'manager@plant.com',
    role: 'Inventory Manager',
    accountExpiry: 'Permanent Access',
    createdDate: '22/06/2026'
  },
  {
    id: 'u-5',
    name: 'Store Keeper',
    username: 'keeper',
    email: 'keeper@plant.com',
    role: 'Store Keeper',
    accountExpiry: 'Permanent Access',
    createdDate: '22/06/2026'
  },
  {
    id: 'u-6',
    name: 'Admin User',
    username: 'adminbilgi',
    email: 'habibullabilgiabu@gmail.com',
    role: 'Admin',
    accountExpiry: 'Permanent Access',
    createdDate: '22/06/2026',
    isCurrentUser: true
  }
];

const LOCAL_STORAGE_USERS_KEY = 'PAVETRACK_SYSTEM_USERS_V1';

export const UserManagementModule: React.FC = () => {
  const { currentUser } = useERP();

  const [users, setUsers] = useState<ManagedUser[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_USERS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'Store Keeper' as SystemRole,
    accountExpiry: 'Permanent Access'
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  }, [users]);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'Store Keeper',
      accountExpiry: 'Permanent Access'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: ManagedUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      accountExpiry: user.accountExpiry
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove user "${name}"?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) return;

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name,
                username: formData.username.toLowerCase().trim(),
                email: formData.email.trim(),
                role: formData.role,
                accountExpiry: formData.accountExpiry
              }
            : u
        )
      );
    } else {
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(
        today.getMonth() + 1
      ).padStart(2, '0')}/${today.getFullYear()}`;

      const newUser: ManagedUser = {
        id: `u-${Date.now()}`,
        name: formData.name,
        username: formData.username.toLowerCase().trim(),
        email: formData.email.trim(),
        role: formData.role,
        accountExpiry: formData.accountExpiry,
        createdDate: formattedDate
      };
      setUsers((prev) => [newUser, ...prev]);
    }

    setIsModalOpen(false);
  };

  const getRoleBadgeStyle = (role: SystemRole) => {
    switch (role) {
      case 'Admin':
        return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
      case 'Inventory Manager':
        return 'text-blue-400 border-blue-500/40 bg-blue-950/20';
      case 'Store Keeper':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
      case 'Auditor':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
      case 'Read Only':
        return 'text-slate-400 border-slate-600 bg-slate-900/40';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">User Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage system users, passwords, and role-based access control.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* 2. Top 5 Role Definition Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Admin */}
        <div className="p-4 rounded-2xl bg-[#0e1626] border border-rose-600/50 space-y-1.5">
          <div className="text-sm font-bold text-rose-400">Admin</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Full access — manage users, products, transactions
          </p>
        </div>

        {/* Card 2: Inventory Manager */}
        <div className="p-4 rounded-2xl bg-[#0e1626] border border-blue-600/50 space-y-1.5">
          <div className="text-sm font-bold text-blue-400">Inventory Manager</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Manage products, transactions, reports
          </p>
        </div>

        {/* Card 3: Store Keeper */}
        <div className="p-4 rounded-2xl bg-[#0e1626] border border-emerald-600/50 space-y-1.5">
          <div className="text-sm font-bold text-emerald-400">Store Keeper</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Record stock in/out transactions, scan barcodes
          </p>
        </div>

        {/* Card 4: Auditor */}
        <div className="p-4 rounded-2xl bg-[#0e1626] border border-amber-600/50 space-y-1.5">
          <div className="text-sm font-bold text-amber-400">Auditor</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Read-only access to all data and reports
          </p>
        </div>

        {/* Card 5: Read Only */}
        <div className="p-4 rounded-2xl bg-[#0e1626] border border-slate-700 space-y-1.5">
          <div className="text-sm font-bold text-slate-300">Read Only</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            View dashboard and products only
          </p>
        </div>
      </div>

      {/* 3. System Users Registry Table */}
      <div className="bg-[#0b1220] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#1e293b] bg-[#0d1527]/50">
          <h2 className="text-base font-bold text-white">System Users</h2>
          <p className="text-xs text-slate-400 mt-0.5">{users.length} users registered</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/60">
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Username</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Account Expiry</th>
                <th className="py-3.5 px-6">Created</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-slate-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#121c33]/50 transition-colors group"
                >
                  {/* Name */}
                  <td className="py-4 px-6 font-bold text-white whitespace-nowrap">
                    {user.name}{' '}
                    {user.isCurrentUser && (
                      <span className="text-blue-400 font-normal text-[11px] ml-1">(you)</span>
                    )}
                  </td>

                  {/* Username */}
                  <td className="py-4 px-6 font-mono text-slate-300">{user.username}</td>

                  {/* Email */}
                  <td className="py-4 px-6 text-slate-400">{user.email}</td>

                  {/* Role Badge */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeStyle(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Account Expiry */}
                  <td className="py-4 px-6 text-slate-400">{user.accountExpiry}</td>

                  {/* Created Date */}
                  <td className="py-4 px-6 font-mono text-slate-400">{user.createdDate}</td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        title="Edit User"
                        className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!user.isCurrentUser && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          title="Delete User"
                          className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>{editingUser ? 'Edit System User' : 'Add New System User'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Patil"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. anand"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as SystemRole })
                    }
                    className="w-full px-3 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Store Keeper">Store Keeper</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Read Only">Read Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. anand@bilgicrushers.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Password {editingUser && <span className="font-normal text-slate-500">(leave blank to keep unchanged)</span>}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Account Expiry</label>
                <input
                  type="text"
                  value={formData.accountExpiry}
                  onChange={(e) => setFormData({ ...formData, accountExpiry: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-lg shadow-blue-600/30"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
