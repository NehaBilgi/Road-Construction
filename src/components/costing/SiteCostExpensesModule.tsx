import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  DollarSign,
  Layers,
  Fuel,
  TrendingDown,
  Plus,
  Download,
  Search,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  Receipt
} from 'lucide-react';

export interface SiteExpenseVoucher {
  id: string;
  date: string;
  siteName: string;
  title: string;
  vendor: string;
  category: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

const STORAGE_EXPENSES_KEY = 'CONSTRUCTION_PRO_SITE_EXPENSES_V1';
const STORAGE_HAULAGE_KEY = 'CONSTRUCTION_PRO_HAULAGE_TRIPS_V2';
const STORAGE_DIESEL_KEY = 'CONSTRUCTION_PRO_DIESEL_LOGS_V1';

export const SiteCostExpensesModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId } = useERP();

  // Resolve active site based on global header selection
  const currentActiveSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const activeSiteName = currentActiveSite?.siteName || siteSheets[0]?.siteName || 'SINDAGI - ALMEL ROAD';

  // Storage States
  const [expenses, setExpenses] = useState<SiteExpenseVoucher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EXPENSES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const initialSample: SiteExpenseVoucher[] = [
        {
          id: 'EXP-101',
          date: '2026-08-19',
          siteName: activeSiteName,
          title: 'Weekly Labor Payout',
          vendor: 'Local Contractor',
          category: 'Labor/Wages',
          amount: 45000,
          status: 'Paid'
        }
      ];
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(initialSample));
      return initialSample;
    } catch {
      return [];
    }
  });

  const [trips, setTrips] = useState<any[]>([]);
  const [diesel, setDiesel] = useState<any[]>([]);

  // Load external module data for cross-linking
  useEffect(() => {
    try {
      const savedTrips = localStorage.getItem(STORAGE_HAULAGE_KEY);
      if (savedTrips) setTrips(JSON.parse(savedTrips));

      const savedDiesel = localStorage.getItem(STORAGE_DIESEL_KEY);
      if (savedDiesel) setDiesel(JSON.parse(savedDiesel));
    } catch (e) {
      console.error('Error loading external data', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
  }, [expenses]);

  // Filters & UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('General');
  const [amount, setAmount] = useState<number | ''>('');
  const [status, setStatus] = useState<'Paid' | 'Pending'>('Paid');

  // ==========================================
  // CROSS-LINKED CALCULATIONS (Scoped to Active Header Site)
  // ==========================================
  const activeSiteExpenses = useMemo(() => expenses.filter(e => e.siteName === activeSiteName), [expenses, activeSiteName]);
  const activeSiteTrips = useMemo(() => trips.filter(t => t.siteName === activeSiteName), [trips, activeSiteName]);
  const activeSiteDiesel = useMemo(() => diesel.filter(d => d.siteName === activeSiteName), [diesel, activeSiteName]);

  const totalDirectExpenses = activeSiteExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalPaidDirect = activeSiteExpenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  const totalMaterialCost = activeSiteTrips.reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0);
  const totalDieselCost = activeSiteDiesel.reduce((sum, d) => sum + (Number(d.totalCost) || 0), 0);

  const totalSiteOutflow = totalDirectExpenses + totalMaterialCost + totalDieselCost;

  // Filtered Vouchers for Table
  const filteredVouchers = useMemo(() => {
    return activeSiteExpenses.filter((e) => {
      const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
      const matchStat = statusFilter === 'ALL' || e.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || e.title.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
      
      return matchCat && matchStat && matchQuery;
    });
  }, [activeSiteExpenses, categoryFilter, statusFilter, searchQuery]);

  // Modal Handlers
  const handleOpenAdd = () => {
    setEditingId(null);
    setDate(new Date().toISOString().substring(0, 10));
    setTitle('');
    setVendor('');
    setCategory('General');
    setAmount('');
    setStatus('Paid');
    setIsModalOpen(true);
  };

  const handleEdit = (v: SiteExpenseVoucher) => {
    setEditingId(v.id);
    setDate(v.date);
    setTitle(v.title);
    setVendor(v.vendor);
    setCategory(v.category);
    setAmount(v.amount);
    setStatus(v.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this expense voucher?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount === '') return;

    const payload: SiteExpenseVoucher = {
      id: editingId || `EXP-${Date.now().toString().slice(-4)}`,
      date,
      siteName: activeSiteName,
      title: title.trim(),
      vendor: vendor.trim() || 'Unknown',
      category,
      amount: Number(amount),
      status
    };

    if (editingId) {
      setExpenses(expenses.map((exp) => (exp.id === editingId ? payload : exp)));
    } else {
      setExpenses([payload, ...expenses]);
    }
    
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Voucher ID', 'Date', 'Site', 'Title', 'Vendor', 'Category', 'Amount', 'Status'];
    const rows = filteredVouchers.map((v) => [
      v.id, v.date, `"${v.siteName}"`, `"${v.title}"`, `"${v.vendor}"`, v.category, v.amount, v.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Site_Expenses_${activeSiteName}_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      
      {/* Top Banner & Site Display */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] bg-[#0c1427] border border-[#182643] shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-3xl bg-rose-900/30 border border-rose-800/50 flex items-center justify-center text-rose-500 shrink-0 shadow-lg shadow-rose-900/20">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1">
            <div className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-rose-500 bg-rose-950/40 border border-rose-900/50 px-2 py-0.5 rounded-md inline-block">
              DEDICATED SITE COST & EXPENSE LEDGER
            </div>
            <div className="flex items-center gap-2 text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight mt-1">
              <span className="truncate">{activeSiteName}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0 w-full xl:w-auto mt-2 xl:mt-0">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] text-emerald-400 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Statement</span>
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#FF0055] hover:bg-[#E6004C] text-white text-xs font-black flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,0,85,0.4)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Site Expense</span>
          </button>
        </div>
      </div>

      {/* Linked KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Direct Expenses */}
        <div className="p-5 rounded-[1.5rem] bg-[#0c1427] border border-[#182643] shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[11px] font-bold text-slate-400">Site Direct Expenses</div>
            <DollarSign className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight mb-2">
              ₹{totalDirectExpenses.toLocaleString() || '0'}
            </div>
            <div className="text-[11px] font-bold text-emerald-500">
              Paid: ₹{totalPaidDirect.toLocaleString() || '0'}
            </div>
          </div>
        </div>

        {/* Matrix Material */}
        <div className="p-5 rounded-[1.5rem] bg-[#0c1427] border border-[#182643] shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[11px] font-bold text-slate-400">Matrix Material Logs</div>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono tracking-tight mb-2">
              ₹{totalMaterialCost.toLocaleString() || '0'}
            </div>
            <div className="text-[11px] text-slate-500">
              {activeSiteTrips.length > 0 ? `From ${activeSiteTrips.length} haulage trips` : 'No material trips logged'}
            </div>
          </div>
        </div>

        {/* Diesel Dispensed */}
        <div className="p-5 rounded-[1.5rem] bg-[#0c1427] border border-[#182643] shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[11px] font-bold text-slate-400">Site Diesel Dispensed</div>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight mb-2">
              ₹{totalDieselCost.toLocaleString() || '0'}
            </div>
            <div className="text-[10px] font-mono font-bold text-amber-500/70">
              {activeSiteDiesel.length > 0 ? `From DIESEL Dispense Log` : 'No diesel dispensed'}
            </div>
          </div>
        </div>

        {/* Total Outflow */}
        <div className="p-5 rounded-[1.5rem] bg-[#0c1427] border border-rose-900/30 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[11px] font-bold text-slate-300">Total Site Outflow</div>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight mb-2">
              ₹{totalSiteOutflow.toLocaleString() || '0'}
            </div>
            <div className="text-[11px] font-bold text-emerald-400">
              All Materials, Fuel & Site Operations
            </div>
          </div>
        </div>

      </div>

      {/* Section Divider */}
      <div className="p-4 rounded-xl bg-[#0c1427] border border-[#182643] flex items-center gap-2 shadow-sm text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
        <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
        <span className="truncate">{activeSiteName} — COST BREAKDOWN & PETTY CASH VOUCHERS</span>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-[1.5rem] bg-[#0c1427] border border-[#182643] flex flex-col sm:flex-row items-center gap-3 text-xs">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-bold outline-none cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          <option value="Labor/Wages">Labor/Wages</option>
          <option value="Equipment Rent">Equipment Rent</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Food/Mess">Food/Mess</option>
          <option value="General">General / Petty Cash</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-bold outline-none cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>

        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search voucher, title, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121927] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-[#0c1427] border border-[#182643] rounded-[1.5rem] overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-[#182643] bg-[#080d19]/40 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Voucher Expenses Ledger</h2>
          <span className="text-xs text-slate-400">{filteredVouchers.length} Records</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#1E293B]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#182643] text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-[#080C14]/60">
                <th className="py-3 px-5 whitespace-nowrap">VOUCHER ID & DATE</th>
                <th className="py-3 px-5 whitespace-nowrap">TITLE / DESC</th>
                <th className="py-3 px-5 whitespace-nowrap">VENDOR / PAYEE</th>
                <th className="py-3 px-5 whitespace-nowrap">CATEGORY</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">AMOUNT (₹)</th>
                <th className="py-3 px-5 text-center whitespace-nowrap">STATUS</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182643] text-slate-300">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No direct expenses recorded for {activeSiteName} yet.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3 px-5 whitespace-nowrap">
                      <div className="font-bold text-white font-mono">{v.id}</div>
                      <div className="text-[10px] text-slate-500">{v.date}</div>
                    </td>
                    <td className="py-3 px-5 font-bold text-slate-200 min-w-[150px]">{v.title}</td>
                    <td className="py-3 px-5 text-slate-400">{v.vendor}</td>
                    <td className="py-3 px-5">
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[10px]">
                        {v.category}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-black text-rose-400 text-sm whitespace-nowrap">
                      ₹{v.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
                        v.status === 'Paid' 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' 
                          : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(v)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-950/40 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0c1427] border border-[#182643] rounded-[2rem] w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
                <DollarSign className="w-5 h-5 text-rose-500" />
                <span>{editingId ? 'Edit Site Expense' : 'Record Site Expense'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Site Name</label>
                <input
                  type="text"
                  readOnly
                  value={activeSiteName}
                  className="w-full px-4 py-3 bg-[#080d19] border border-[#1E293B] rounded-xl text-slate-400 font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-bold outline-none cursor-pointer focus:border-rose-500 transition-colors"
                  >
                    <option value="Labor/Wages">Labor/Wages</option>
                    <option value="Equipment Rent">Equipment Rent</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Food/Mess">Food/Mess</option>
                    <option value="General">General / Petty Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Labor Payout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-bold outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="Name of person or company"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-4 py-3 bg-[#121927] border border-[#1E293B] rounded-xl text-white outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#121927] border border-[#1E293B] rounded-xl text-rose-400 font-mono font-black outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Paid' | 'Pending')}
                    className="w-full px-4 py-3 bg-[#121927] border border-[#1E293B] rounded-xl text-white font-bold outline-none cursor-pointer focus:border-rose-500 transition-colors"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1E293B] mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#FF0055] hover:bg-[#E6004C] text-white font-black shadow-[0_0_15px_rgba(255,0,85,0.4)] cursor-pointer transition-all"
                >
                  {editingId ? 'Update Voucher' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteCostExpensesModule;
