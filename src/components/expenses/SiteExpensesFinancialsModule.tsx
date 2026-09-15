import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  DollarSign,
  Plus,
  Search,
  Receipt,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Layers,
  Fuel,
  TrendingDown
} from 'lucide-react';

export interface SiteVoucherExpense {
  id: string;
  voucherId: string;
  date: string;
  siteName: string;
  title: string;
  vendorPayee: string;
  category: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

const STORAGE_EXPENSES_KEY = 'CONSTRUCTION_PRO_SITE_EXPENSES_SAMPLE_V1';
const STORAGE_HAULAGE_KEY = 'CONSTRUCTION_PRO_HAULAGE_TRIPS_V2';
const STORAGE_DIESEL_KEY = 'CONSTRUCTION_PRO_DIESEL_LOGS_V1';

export const SiteExpensesModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId, currentUser, userRole } = useERP() as any;

  // Strict Admin Evaluation
  const isAdmin = useMemo(() => {
    let roleCandidate = String(userRole || currentUser?.role || '').trim().toUpperCase();
    if (roleCandidate === 'SUPER_ADMIN' || roleCandidate === 'ADMIN' || roleCandidate.includes('ADMIN')) {
      return true;
    }
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('CONSTRUCTION_PRO_ERP_STORAGE_V7_USER') || localStorage.getItem('PAVETRACK_CURRENT_USER');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const parsedRole = String(parsed?.role || '').trim().toUpperCase();
          return parsedRole === 'SUPER_ADMIN' || parsedRole === 'ADMIN' || parsedRole.includes('ADMIN');
        }
      } catch {}
    }
    return false;
  }, [userRole, currentUser]);

  const currentActiveSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const activeSiteName = currentActiveSite?.siteName || siteSheets[0]?.siteName || 'MULWAD';

  // Vouchers state
  const [expenses, setExpenses] = useState<SiteVoucherExpense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EXPENSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Haulage trips total for card #2
  const [haulageAmount, setHaulageAmount] = useState<number>(0);
  const [haulageTripsCount, setHaulageTripsCount] = useState<number>(0);

  // Diesel logs total for card #3
  const [dieselAmount, setDieselAmount] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed saving expenses', e);
    }
  }, [expenses]);

  // Load Haulage and Diesel data for summary cards
  useEffect(() => {
    try {
      const savedHaulage = localStorage.getItem(STORAGE_HAULAGE_KEY);
      if (savedHaulage) {
        const parsed = JSON.parse(savedHaulage);
        const siteTrips = parsed.filter((t: any) => !activeSiteName || t.siteName === activeSiteName);
        const totalH = siteTrips.reduce((sum: number, t: any) => sum + (Number(t.totalAmount) || 0), 0);
        setHaulageAmount(totalH);
        setHaulageTripsCount(siteTrips.length);
      }

      const savedDiesel = localStorage.getItem(STORAGE_DIESEL_KEY);
      if (savedDiesel) {
        const parsed = JSON.parse(savedDiesel);
        const siteDiesel = parsed.filter((d: any) => !activeSiteName || d.siteName === activeSiteName);
        const totalD = siteDiesel.reduce((sum: number, d: any) => sum + (Number(d.totalCost) || 0), 0);
        setDieselAmount(totalD);
      }
    } catch {}
  }, [activeSiteName]);

  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [title, setTitle] = useState('');
  const [vendorPayee, setVendorPayee] = useState('');
  const [category, setCategory] = useState('General');
  const [amount, setAmount] = useState<number | ''>('');
  const [status, setStatus] = useState<SiteVoucherExpense['status']>('PAID');

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSite = !activeSiteName || e.siteName === activeSiteName;
      const matchCat = categoryFilter === 'All Categories' || e.category === categoryFilter;
      const matchStat = statusFilter === 'All Statuses' || e.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchQ =
        !q ||
        e.voucherId.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.vendorPayee.toLowerCase().includes(q);
      return matchSite && matchCat && matchStat && matchQ;
    });
  }, [expenses, activeSiteName, categoryFilter, statusFilter, searchQuery]);

  const totalDirectExpenses = useMemo(() => {
    return filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filtered]);

  const totalSiteOutflow = totalDirectExpenses + haulageAmount + dieselAmount;

  const handleOpenAdd = () => {
    setEditingId(null);
    setDate(new Date().toISOString().substring(0, 10));
    setTitle('');
    setVendorPayee('');
    setCategory('General');
    setAmount('');
    setStatus('PAID');
    setIsModalOpen(true);
  };

  const handleEdit = (rec: SiteVoucherExpense) => {
    if (!isAdmin) {
      alert('Access Restricted: Only Administrators are authorized to edit site vouchers.');
      return;
    }
    setEditingId(rec.id);
    setDate(rec.date);
    setTitle(rec.title);
    setVendorPayee(rec.vendorPayee);
    setCategory(rec.category);
    setAmount(rec.amount);
    setStatus(rec.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      alert('Access Restricted: Only Administrators are authorized to delete site vouchers.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && !isAdmin) {
      alert('Access Restricted: Only Administrators can update existing records.');
      return;
    }
    if (amount === '' || !title.trim()) return;

    const record: SiteVoucherExpense = {
      id: editingId || `EXP-${Date.now().toString().slice(-4)}`,
      voucherId: editingId ? (expenses.find(x => x.id === editingId)?.voucherId || `EXP-${Date.now().toString().slice(-4)}`) : `EXP-${Date.now().toString().slice(-4)}`,
      date,
      siteName: activeSiteName,
      title: title.trim(),
      vendorPayee: vendorPayee.trim() || '—',
      category,
      amount: Number(amount),
      status
    };

    if (editingId) {
      setExpenses(expenses.map((item) => (item.id === editingId ? record : item)));
    } else {
      setExpenses([record, ...expenses]);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 min-h-screen">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Site Direct Expenses */}
        <div className="p-5 rounded-2xl bg-[#0B1322] border border-[#1E293B] shadow-xl relative">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Site Direct Expenses</span>
            <span className="text-rose-500 font-bold">$</span>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            ₹{totalDirectExpenses.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            Paid: ₹{totalDirectExpenses.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Card 2: Matrix Material Logs */}
        <div className="p-5 rounded-2xl bg-[#0B1322] border border-[#1E293B] shadow-xl relative">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Matrix Material Logs</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono mt-2">
            ₹{haulageAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            From {haulageTripsCount} haulage trips
          </div>
        </div>

        {/* Card 3: Site Diesel Dispensed */}
        <div className="p-5 rounded-2xl bg-[#0B1322] border border-[#1E293B] shadow-xl relative">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Site Diesel Dispensed</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-2">
            ₹{dieselAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-500/80 font-mono mt-1 uppercase text-[10px]">
            From DIESEL Dispense Log
          </div>
        </div>

        {/* Card 4: Total Site Outflow */}
        <div className="p-5 rounded-2xl bg-[#0B1322] border border-[#1E293B] shadow-xl relative">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Total Site Outflow</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            ₹{totalSiteOutflow.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            All Materials, Fuel & Site Operations
          </div>
        </div>
      </div>

      {/* Banner Header */}
      <div className="p-4 rounded-2xl bg-[#0B1322] border border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-black tracking-wide uppercase text-white">
          <Receipt className="w-4 h-4 text-rose-500" />
          <span>{activeSiteName} — COST BREAKDOWN & PETTY CASH VOUCHERS</span>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Voucher</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-[#0B1322] border border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
          >
            <option value="All Categories">All Categories</option>
            <option value="General">General</option>
            <option value="Labor">Labor</option>
            <option value="Repairs">Repairs</option>
            <option value="Supplies">Supplies</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search voucher, title, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* Table: Voucher Expenses Ledger */}
      <div className="bg-[#0B1322] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Voucher Expenses Ledger</h2>
          <span className="text-xs text-slate-500">{filtered.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#070D18]">
                <th className="py-3 px-4">VOUCHER ID & DATE</th>
                <th className="py-3 px-4">TITLE / DESC</th>
                <th className="py-3 px-4">VENDOR / PAYEE</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4 text-right">AMOUNT (₹)</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No expense vouchers found for {activeSiteName}.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-white">{item.voucherId}</div>
                      <div className="text-[10px] text-slate-500">{item.date}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-white">{item.title}</td>
                    <td className="py-3 px-4 text-slate-300">{item.vendorPayee}</td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 uppercase">
                        {item.status}
                      </span>
                    </td>

                    {/* Action Column: Strictly gated by isAdmin */}
                    <td className="py-3 px-4 text-center">
                      {isAdmin ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 cursor-pointer"
                            title="Edit Voucher"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono text-xs select-none">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0B1322] border border-[#1E293B] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-500" />
                <span>{editingId ? 'Edit Voucher' : 'Add Expense Voucher'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Labor">Labor</option>
                    <option value="Repairs">Repairs</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Site Repair"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. Vendor Name"
                  value={vendorPayee}
                  onChange={(e) => setVendorPayee(e.target.value)}
                  className="w-full px-3 py-2 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 1111"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#070D18] border border-[#1E293B] rounded-xl text-rose-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white cursor-pointer"
                >
                  {editingId ? 'Update Voucher' : 'Save Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteExpensesModule;
