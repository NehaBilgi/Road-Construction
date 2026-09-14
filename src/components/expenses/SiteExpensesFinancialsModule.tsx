import React, { useState, useMemo } from 'react';
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
  Trash2
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

export const SiteExpensesFinancialsModule: React.FC = () => {
  const {
    expenses,
    addExpenseVoucher,
    updateExpenseStatus,
    deleteExpenseVoucher,
    pettyCashWallets,
    refillPettyCash,
    kpis,
    project
  } = useRoadERP();

  const { currentUser, userRole } = useERP();

  // Strict Admin Check: Only Admin can delete expense vouchers
  const currentRoleStr = String(currentUser?.role || userRole || '').toLowerCase();
  const isAdmin = currentRoleStr.includes('admin');

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Voucher Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    return expenses.filter((e) => {
      const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        e.voucherNumber.toLowerCase().includes(q) ||
        e.payeeVendorName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.costCenterChainage.toLowerCase().includes(q);
      return matchCat && matchStatus && matchSearch;
    });
  }, [expenses, categoryFilter, statusFilter, searchTerm]);

  // Primary Wallet
  const primaryWallet = pettyCashWallets[0] || {
    walletSupervisorName: 'Ibrahim (Site Engineer)',
    totalAllocatedBudget: 100000,
    spentAmount: 38500,
    remainingBalance: 61500
  };

  // Submit Voucher
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPayee || !formAmount) return;

    addExpenseVoucher({
      date: formDate,
      category: formCategory,
      costCenterChainage: formChainage,
      amount: Number(formAmount),
      paymentMode: formMode,
      payeeVendorName: formPayee.trim(),
      description: formDesc.trim() || 'Site operational disbursement',
      invoiceReceiptNumber: formRefNo.trim() || undefined,
      requestedBy: currentUser?.name || 'Ibrahim (Site Supervisor)',
      status: 'SUBMITTED'
    });

    setIsAddModalOpen(false);
    setFormPayee('');
    setFormAmount('');
    setFormDesc('');
    setFormRefNo('');
  };

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (primaryWallet.id) {
      refillPettyCash(primaryWallet.id, refillAmount);
    }
    setIsRefillOpen(false);
  };

  const handleDelete = (voucherId: string) => {
    if (!isAdmin) {
      alert('Action Restricted: Only Administrators are authorized to delete expense vouchers.');
      return;
    }
    if (window.confirm('Delete this site expense voucher permanently?')) {
      deleteExpenseVoucher(voucherId);
    }
  };

  // Export to CSV
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

    const rows = filteredExpenses.map((e) => [
      e.voucherNumber,
      e.date,
      `"${CATEGORY_META[e.category]?.label || e.category}"`,
      `"${e.payeeVendorName}"`,
      `"${e.costCenterChainage}"`,
      e.amount,
      e.paymentMode,
      e.status,
      `"${e.requestedBy}"`,
      `"${e.description}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Site_Expense_Vouchers_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
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
              onClick={() => setIsAddModalOpen(true)}
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
          {/* 1. Total Site Expenses */}
          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Total Direct Expenses</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              ₹{kpis.totalSiteExpensesINR.toLocaleString('en-IN')}
            </div>
          </div>

          {/* 2. Petty Cash Float */}
          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Petty Cash Balance</span>
              {isAdmin && (
                <button
                  onClick={() => setIsRefillOpen(true)}
                  className="text-[10px] text-amber-400 hover:underline font-bold"
                >
                  + Refill
                </button>
              )}
            </div>
            <div className="text-2xl font-black text-white font-mono mt-1">
              ₹{primaryWallet.remainingBalance.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-sans text-slate-500">
                / {primaryWallet.totalAllocatedBudget.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* 3. Cost Per Kilometer */}
          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Avg Cost / Km (Active Paving)</div>
            <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
              ₹{kpis.averageCostPerKmINR.toLocaleString('en-IN')} <span className="text-xs font-sans text-slate-500">/ km</span>
            </div>
          </div>

          {/* 4. Total Combined Burn */}
          <div className="p-3.5 bg-[#070c18] rounded-2xl border border-[#182643]">
            <div className="text-[11px] font-semibold text-slate-400">Combined Project Cash Outflow</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              ₹{(kpis.totalSiteExpensesINR + kpis.totalFuelCostINR).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#1b2845] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
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

          {/* Status Filter */}
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
                {isAdmin && <th className="py-3 px-3 text-center">ACTION</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15223c] text-slate-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-slate-500">
                    No site expense vouchers found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((voucher) => {
                  const isApproved = voucher.status === 'APPROVED' || voucher.status === 'PAID';
                  const isRejected = voucher.status === 'REJECTED';

                  return (
                    <tr key={voucher.id} className="hover:bg-[#0f1c38] transition-colors">
                      {/* Voucher # & Date */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-emerald-400">{voucher.voucherNumber}</div>
                        <div className="text-[10px] text-slate-400">{voucher.date}</div>
                        {voucher.invoiceReceiptNumber && (
                          <div className="text-[10px] text-slate-500">
                            Inv: {voucher.invoiceReceiptNumber}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {CATEGORY_META[voucher.category]?.label || voucher.category}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 truncate max-w-[200px]">
                          {voucher.description}
                        </div>
                      </td>

                      {/* Payee */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{voucher.payeeVendorName}</div>
                        <div className="text-[10px] text-slate-500">
                          Req: {voucher.requestedBy}
                        </div>
                      </td>

                      {/* Cost Center */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{voucher.costCenterChainage}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right font-mono font-black text-white text-sm">
                        ₹{voucher.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Payment Mode */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                          {voucher.paymentMode.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Approval Status Selector */}
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
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
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

                      {/* Delete (Admin Only) */}
                      {isAdmin && (
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDelete(voucher.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete Voucher (Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
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
                className="text-slate-400 hover:text-white"
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
                    Current Balance: ₹{primaryWallet.remainingBalance.toLocaleString('en-IN')}
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
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold"
                >
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAISE EXPENSE VOUCHER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0c1427] border border-[#1b2845] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>Raise Site Expense Voucher</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3.5 text-xs">
              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SiteExpenseCategory)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
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

              {/* Payee / Vendor & Amount */}
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

              {/* Payment Mode & Cost Center Chainage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value as ExpensePaymentMode)}
                    className="w-full px-3 py-2 bg-[#070c18] border border-[#1b2845] rounded-xl text-white outline-none"
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

              {/* Description & Bill/Invoice # */}
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Submit Expense Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
