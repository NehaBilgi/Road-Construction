import React, { useState, useMemo, useEffect } from 'react';
import { useRoadERP } from '../../context/RoadERPContext';
import { useERP } from '../../context/ERPContext';
import { SiteExpenseCategory, SiteExpenseVoucher, ExpensePaymentMode } from '../../types/roadERP';
import {
  DollarSign,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Receipt,
  Wallet,
  Building,
  Tag,
  MapPin,
  FileCheck,
  CreditCard,
  Banknote,
  Download,
  Trash2,
  Edit2,
  X
} from 'lucide-react';

const CATEGORY_META: Record<SiteExpenseCategory, { label: string; icon: string }> = {
  DAILY_SITE_OPERATIONS: { label: 'Daily Site Operations', icon: '🏗️' },
  EQUIPMENT_REPAIR_PARTS: { label: 'Equipment Repair & Spares', icon: '🔧' },
  TOLL_TAX_PERMITS: { label: 'Tolls, Taxes & RTO Permits', icon: '🛣️' },
  OPERATOR_WAGES_BATTA: { label: 'Operator Wages & Daily Batta', icon: '👷' },
  PETTY_CASH_DISBURSEMENT: { label: 'Petty Cash Disbursements', icon: '💵' },
  DIVERSION_ACCESS_ROAD: { label: 'Diversion & Haul Road Upkeep', icon: '🚧' },
  WATER_TANKER_HIRING: { label: 'Water Tanker Hiring (Compaction)', icon: '💧' },
  SAFETY_SIGNAGE_BARRICADING: { label: 'Safety Signage & Barricading', icon: '⚠️' },
  OTHER_CIVIL_EXPENSES: { label: 'Other Miscellaneous Civil Expenses', icon: '📦' }
};

const EXPENSE_STORAGE_KEY = 'CONSTRUCTION_PRO_SITE_EXPENSES_V1';

export const SiteExpensesFinancialsModule: React.FC = () => {
  const {
    expenses = [],
    addExpenseVoucher,
    updateExpenseStatus,
    deleteExpenseVoucher,
    pettyCashWallets = [],
    refillPettyCash,
    kpis = { totalSiteExpensesINR: 0, averageCostPerKmINR: 0, totalFuelCostINR: 0 },
    project
  } = useRoadERP() as any;

  const { currentUser, userRole, siteSheets = [], selectedSiteId } = useERP() as any;

  // Strict multi-layer Admin role evaluation
  const isAdmin = useMemo(() => {
    const directRole = String(userRole || currentUser?.role || '').trim().toUpperCase();
    if (directRole === 'SUPER_ADMIN' || directRole === 'ADMIN' || directRole.includes('ADMIN')) {
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

  // Clean-up of stale mock data if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem(EXPENSE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.some((p: any) => Number(p.amount) === 45000 && !p.id)) {
          localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify([]));
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch {
      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify([]));
    }
  }, []);

  // Active site fallback
  const activeSite = useMemo(() => {
    return (
      siteSheets.find((s: any) => s.siteId === selectedSiteId) ||
      siteSheets[0] || {
        siteId: 'default-001',
        siteName: 'SINDAGI'
      }
    );
  }, [siteSheets, selectedSiteId]);

  // Sync dashboard localStorage whenever expenses change
  useEffect(() => {
    try {
      const formattedForDashboard = (expenses || []).map((e: any) => ({
        id: e.id,
        voucherNumber: e.voucherNumber,
        siteName: e.costCenterChainage?.includes(activeSite.siteName)
          ? activeSite.siteName
          : activeSite.siteName || 'SINDAGI',
        amount: Number(e.amount) || 0,
        category: e.category,
        date: e.date,
        description: e.description,
        status: e.status
      }));

      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(formattedForDashboard));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error syncing expenses to dashboard storage', err);
    }
  }, [expenses, activeSite.siteName]);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Voucher Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formCategory, setFormCategory] = useState<SiteExpenseCategory>('DAILY_SITE_OPERATIONS');
  const [formPayee, setFormPayee] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formMode, setFormMode] = useState<ExpensePaymentMode>('PETTY_CASH');
  const [formChainage, setFormChainage] = useState('Ch. 12+400 Base Camp');
  const [formDesc, setFormDesc] = useState('');
  const [formRefNo, setFormRefNo] = useState('');

  // Refill Modal
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [refillAmount, setRefillAmount] = useState<number>(25000);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter((e: any) => {
      const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (e?.voucherNumber || '').toLowerCase().includes(q) ||
        (e?.payeeVendorName || '').toLowerCase().includes(q) ||
        (e?.description || '').toLowerCase().includes(q) ||
        (e?.costCenterChainage || '').toLowerCase().includes(q);
      return matchCat && matchStatus && matchSearch;
    });
  }, [expenses, categoryFilter, statusFilter, searchTerm]);

  // Primary Wallet with Safe Defaults
  const primaryWallet = pettyCashWallets[0] || {
    id: 'default-wallet-01',
    walletSupervisorName: 'Site Supervisor',
    totalAllocatedBudget: 0,
    spentAmount: 0,
    remainingBalance: 0
  };

  // Metric Calculations
  const safeTotalSiteExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return 0;
    return expenses.reduce((sum: number, e: any) => {
      const val = Number(e?.amount);
      return sum + (!isNaN(val) && val > 0 ? val : 0);
    }, 0);
  }, [expenses]);

  const safeTotalFuelCost = Number(kpis?.totalFuelCostINR ?? 0) || 0;
  const safeAvgCostPerKm = Number(kpis?.averageCostPerKmINR ?? 0) || 0;
  const safePettyCashRemaining = Number(primaryWallet?.remainingBalance ?? 0) || 0;
  const safePettyCashAllocated = Number(primaryWallet?.totalAllocatedBudget ?? 0) || 0;

  const handleOpenAdd = () => {
    setEditingVoucherId(null);
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormCategory('DAILY_SITE_OPERATIONS');
    setFormPayee('');
    setFormAmount('');
    setFormMode('PETTY_CASH');
    setFormChainage('Ch. 12+400 Base Camp');
    setFormDesc('');
    setFormRefNo('');
    setIsModalOpen(true);
  };

  const handleEdit = (voucher: SiteExpenseVoucher) => {
    if (!isAdmin) {
      alert('Access Restricted: Only Administrators are authorized to edit expense vouchers.');
      return;
    }
    setEditingVoucherId(voucher.id);
    setFormDate(voucher.date);
    setFormCategory(voucher.category);
    setFormPayee(voucher.payeeVendorName);
    setFormAmount(voucher.amount);
    setFormMode(voucher.paymentMode);
    setFormChainage(voucher.costCenterChainage || activeSite.siteName);
    setFormDesc(voucher.description || '');
    setFormRefNo(voucher.invoiceReceiptNumber || '');
    setIsModalOpen(true);
  };

  const handleDelete = (voucherId: string) => {
    if (!isAdmin) {
      alert('Access Restricted: Only Administrators are authorized to delete expense vouchers.');
      return;
    }
    if (window.confirm('Delete this site expense voucher permanently?')) {
      deleteExpenseVoucher(voucherId);
    }
  };

  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVoucherId && !isAdmin) {
      alert('Access Restricted: Only Administrators can modify existing vouchers.');
      return;
    }
    const parsedAmount = Number(formAmount);
    if (!formPayee.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (editingVoucherId && typeof deleteExpenseVoucher === 'function') {
      deleteExpenseVoucher(editingVoucherId);
    }

    addExpenseVoucher({
      date: formDate,
      category: formCategory,
      costCenterChainage: formChainage.trim() || activeSite.siteName,
      amount: parsedAmount,
      paymentMode: formMode,
      payeeVendorName: formPayee.trim(),
      description: formDesc.trim() || 'Site operational disbursement',
      invoiceReceiptNumber: formRefNo.trim() || undefined,
      requestedBy: currentUser?.name || 'Site Supervisor',
      status: 'SUBMITTED'
    });

    setIsModalOpen(false);
    setEditingVoucherId(null);
  };

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Access Restricted: Only Administrators can refill petty cash balances.');
      return;
    }
    if (primaryWallet.id) {
      refillPettyCash(primaryWallet.id, Number(refillAmount) || 0);
    }
    setIsRefillOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'Voucher #',
      'Date',
      'Category',
      'Payee / Vendor',
      'Cost Center / Chainage',
      'Amount (INR)',
      'Payment Mode',
      'Status',
      'Requested By',
      'Description'
    ];

    const rows = filteredExpenses.map((e: any) => [
      e.voucherNumber,
      e.date,
      `"${CATEGORY_META[e.category as SiteExpenseCategory]?.label || e.category}"`,
      `"${e.payeeVendorName}"`,
      `"${e.costCenterChainage}"`,
      Number(e.amount) || 0,
      e.paymentMode,
      e.status,
      `"${e.requestedBy}"`,
      `"${e.description}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Site_Expense_Vouchers_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#1b2845] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MODULE D • SITE ACCOUNTING & COST/KM
                </span>
                <span className="text-xs text-slate-400">
                  Cost Center Tagging per Chainage
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Site Expense Tracking & Digital Petty Cash
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Expense Voucher</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1b2845] border border-[#23355a] text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Vouchers</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Financial Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#182643]">
          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Total Direct Expenses</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              ₹{safeTotalSiteExpenses.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Petty Cash Balance</span>
              {isAdmin && (
                <button
                  onClick={() => setIsRefillOpen(true)}
                  className="text-[10px] text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  + Refill
                </button>
              )}
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              ₹{safePettyCashRemaining.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-sans text-slate-500">
                / {safePettyCashAllocated.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Avg Cost / Km (Active Paving)</div>
            <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
              ₹{safeAvgCostPerKm.toLocaleString('en-IN')} <span className="text-xs font-sans text-slate-500">/ km</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Combined Project Cash Outflow</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              ₹{(safeTotalSiteExpenses + safeTotalFuelCost).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#1b2845] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#070c18] border border-[#1e2d4a] px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(CATEGORY_META).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#070c18] border border-[#1e2d4a] px-3 py-1.5 rounded-xl text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">All Approval Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PAID">PAID</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search voucher, vendor, chainage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#070c18] border border-[#1e2d4a] rounded-xl text-xs text-white outline-none w-full sm:w-64 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="rounded-3xl bg-[#0c1427] border border-[#1b2845] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0e172e] text-slate-400 font-semibold border-b border-[#182643]">
              <tr>
                <th className="py-3 px-4">VOUCHER & DATE</th>
                <th className="py-3 px-4">EXPENSE CATEGORY</th>
                <th className="py-3 px-4">PAYEE / VENDOR</th>
                <th className="py-3 px-4">COST CENTER (CHAINAGE)</th>
                <th className="py-3 px-3 text-right">AMOUNT (₹)</th>
                <th className="py-3 px-3 text-center">PAY MODE</th>
                <th className="py-3 px-3 text-center">APPROVAL STATUS</th>
                <th className="py-3 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15223c] text-slate-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No site expense vouchers found for {activeSite.siteName}.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((voucher: any) => {
                  const isApproved = voucher.status === 'APPROVED' || voucher.status === 'PAID';
                  const isRejected = voucher.status === 'REJECTED';
                  const amountNum = Number(voucher?.amount) || 0;

                  return (
                    <tr key={voucher.id} className="hover:bg-[#0f1c38] transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-emerald-400">{voucher.voucherNumber}</div>
                        <div className="text-[10px] text-slate-400">{voucher.date}</div>
                        {voucher.invoiceReceiptNumber && (
                          <div className="text-[10px] text-slate-500">
                            Inv: {voucher.invoiceReceiptNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {CATEGORY_META[voucher.category as SiteExpenseCategory]?.label || voucher.category}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 truncate max-w-[200px]">
                          {voucher.description}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{voucher.payeeVendorName}</div>
                        <div className="text-[10px] text-slate-500">
                          Req: {voucher.requestedBy}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{voucher.costCenterChainage}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-white text-sm">
                        ₹{amountNum.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                          {(voucher.paymentMode || 'PETTY_CASH').replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isAdmin ? (
                          <select
                            value={voucher.status}
                            onChange={(e) =>
                              updateExpenseStatus(
                                voucher.id,
                                e.target.value as SiteExpenseVoucher['status']
                              )
                            }
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg outline-none cursor-pointer uppercase ${
                              isApproved
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : isRejected
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="PAID">PAID</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        ) : (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase inline-block ${
                              isApproved
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : isRejected
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {voucher.status}
                          </span>
                        )}
                      </td>

                      {/* Action: Edit & Delete (Admin Only) */}
                      <td className="py-3 px-3 text-center">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEdit(voucher)}
                              className="p-1 rounded text-slate-400 hover:text-blue-400 cursor-pointer"
                              title="Edit Voucher (Admin Only)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(voucher.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                              title="Delete Voucher (Admin Only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-xs select-none">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFILL PETTY CASH MODAL (Admin Only) */}
      {isRefillOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Refill Supervisor Petty Cash Wallet</span>
              </h3>
              <button
                onClick={() => setIsRefillOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRefillSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Supervisor Wallet
                </label>
                <div className="p-3 bg-[#070c18] rounded-xl border border-[#182643] text-slate-200">
                  <div className="font-bold">{primaryWallet.walletSupervisorName}</div>
                  <div className="text-[11px] text-slate-400">
                    Current Balance: ₹{safePettyCashRemaining.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Refill Amount (INR ₹) *
                </label>
                <input
                  type="number"
                  required
                  step="1000"
                  value={refillAmount}
                  onChange={(e) => setRefillAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#182643]">
                <button
                  type="button"
                  onClick={() => setIsRefillOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold cursor-pointer"
                >
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAISE / EDIT EXPENSE VOUCHER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>{editingVoucherId ? 'Edit Site Expense Voucher' : 'Raise Site Expense Voucher'}</span>
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); setEditingVoucherId(null); }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SiteExpenseCategory)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none cursor-pointer"
                  >
                    {Object.entries(CATEGORY_META).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Payee / Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahaveer Hydraulic Works"
                    value={formPayee}
                    onChange={(e) => setFormPayee(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 4500"
                    value={formAmount}
                    onChange={(e) =>
                      setFormAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-emerald-400 font-mono font-bold text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value as ExpensePaymentMode)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="PETTY_CASH">Supervisor Petty Cash Float</option>
                    <option value="BANK_TRANSFER_NEFT">Bank Transfer / NEFT / RTGS</option>
                    <option value="UPI_SCAN">UPI Scan & Pay</option>
                    <option value="VENDOR_CREDIT_ACCOUNT">Vendor Credit Account (30-day bill)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cost Center (Chainage Stretch) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formChainage}
                    onChange={(e) => setFormChainage(e.target.value)}
                    placeholder="e.g. Ch. 12+400 to 14+200"
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Bill / Invoice Reference #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-882"
                    value={formRefNo}
                    onChange={(e) => setFormRefNo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Item / Work Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hydraulic hose pipe repair on EX-01"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#182643]">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingVoucherId(null); }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {editingVoucherId ? 'Update Expense Voucher' : 'Submit Expense Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteExpensesFinancialsModule;
