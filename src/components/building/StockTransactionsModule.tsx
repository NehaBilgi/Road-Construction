import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Plus,
  Download,
  Search,
  X,
  Trash2,
  Building2
} from 'lucide-react';

export interface StockTransaction {
  id: string;
  productName: string;
  siteName: string;
  type: 'Stock In' | 'Stock Out';
  quantity: number;
  date: string;
  department?: string;
  issuedTo?: string;
}

const STORAGE_TXNS_KEY = 'CONSTRUCTION_PRO_BUILDING_TXNS_V2';

const INITIAL_TXNS: StockTransaction[] = [
  {
    id: 'TXN-101',
    productName: '15W/40 Engine Oil',
    siteName: 'HHH Tower A',
    type: 'Stock Out',
    quantity: 13,
    date: '2026-08-17',
    department: 'Plant Maintenance',
    issuedTo: 'Pivar Operator'
  },
  {
    id: 'TXN-102',
    productName: 'OPC 53 Grade Cement',
    siteName: 'HHH Tower A',
    type: 'Stock In',
    quantity: 240,
    date: '2026-08-14',
    department: 'Stores Inward',
    issuedTo: 'Store Incharge'
  },
  {
    id: 'TXN-103',
    productName: 'TMT 550D Rebar 12mm',
    siteName: 'Central Campus',
    type: 'Stock Out',
    quantity: 5,
    date: '2026-08-12',
    department: 'Civil Works',
    issuedTo: 'Ramesh (Bar Bender)'
  }
];

export const StockTransactionsModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId } = useERP();

  // Find current ongoing site from context
  const activeOngoingSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const defaultOngoingSiteName = activeOngoingSite?.siteName || siteSheets[0]?.siteName || 'Central Site';

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TXNS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TXNS;
    } catch {
      return INITIAL_TXNS;
    }
  });

  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-17');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State with Site Name pre-selected from active Ongoing Site
  const [productName, setProductName] = useState('');
  const [siteName, setSiteName] = useState(defaultOngoingSiteName);
  const [type, setType] = useState<'Stock In' | 'Stock Out'>('Stock Out');
  const [quantity, setQuantity] = useState<number | ''>(0);
  const [date, setDate] = useState('2026-08-17');
  const [department, setDepartment] = useState('Maintenance');
  const [issuedTo, setIssuedTo] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_TXNS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchDate = (!fromDate || t.date >= fromDate) && (!toDate || t.date <= toDate);
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        t.productName.toLowerCase().includes(q) ||
        (t.siteName && t.siteName.toLowerCase().includes(q)) ||
        t.id.toLowerCase().includes(q) ||
        (t.department && t.department.toLowerCase().includes(q)) ||
        (t.issuedTo && t.issuedTo.toLowerCase().includes(q));
      return matchType && matchDate && matchQuery;
    });
  }, [transactions, typeFilter, fromDate, toDate, searchQuery]);

  const totalStockIn = filtered
    .filter((t) => t.type === 'Stock In')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalStockOut = filtered
    .filter((t) => t.type === 'Stock Out')
    .reduce((sum, t) => sum + t.quantity, 0);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete transaction "${id}" (${name})?`)) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !quantity || Number(quantity) <= 0) return;

    const newTxn: StockTransaction = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      productName: productName.trim(),
      siteName: siteName.trim() || defaultOngoingSiteName,
      type,
      quantity: Number(quantity),
      date,
      department: department.trim() || undefined,
      issuedTo: issuedTo.trim() || undefined
    };

    setTransactions([newTxn, ...transactions]);
    setIsModalOpen(false);
    setProductName('');
    setQuantity(0);
    setIssuedTo('');
  };

  const handleExportCSV = () => {
    const headers = ['Txn ID', 'Date', 'Site Name', 'Type', 'Product', 'Quantity', 'Department', 'Issued To'];
    const rows = filtered.map((t) => [
      t.id,
      t.date,
      `"${t.siteName || '-'}"`,
      t.type,
      `"${t.productName}"`,
      t.quantity,
      `"${t.department || '-'}"`,
      `"${t.issuedTo || '-'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Stock_Transactions_Audit_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-400 mt-0.5">Full audit log of all stock movements.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1f2f52] border border-[#22365e] text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setSiteName(defaultOngoingSiteName);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-3xl bg-[#0c1427] border border-[#182643] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="Stock In">Stock In</option>
            <option value="Stock Out">Stock Out</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 font-bold mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, product, site, employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#182643]">
          <div className="text-[11px] font-semibold text-slate-400">Records shown</div>
          <div className="text-3xl font-black text-white font-mono mt-1">{filtered.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1427] border border-emerald-900/40">
          <div className="text-[11px] font-semibold text-slate-400">Total Stock In</div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">{totalStockIn}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1427] border border-rose-900/40">
          <div className="text-[11px] font-semibold text-slate-400">Total Stock Out</div>
          <div className="text-3xl font-black text-rose-400 font-mono mt-1">{totalStockOut}</div>
        </div>
      </div>

      {/* Transactions Table with Site Column */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">TXN ID & DATE</th>
                <th className="py-3.5 px-6">PRODUCT</th>
                <th className="py-3.5 px-6">ONGOING SITE</th>
                <th className="py-3.5 px-4 text-center">TYPE</th>
                <th className="py-3.5 px-4 text-right">QTY</th>
                <th className="py-3.5 px-6">DEPARTMENT</th>
                <th className="py-3.5 px-6">ISSUED TO / EMPLOYEE</th>
                <th className="py-3.5 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No transactions matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isOut = t.type === 'Stock Out';
                  return (
                    <tr key={t.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-3.5 px-6 font-mono">
                        <div className="font-bold text-white">{t.id}</div>
                        <div className="text-[10px] text-slate-400">{t.date}</div>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-white text-xs">{t.productName}</td>
                      <td className="py-3.5 px-6 font-medium text-cyan-400">
                        {t.siteName || defaultOngoingSiteName}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            isOut
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-black text-sm ${isOut ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isOut ? `-${t.quantity}` : `+${t.quantity}`}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-300">
                        {t.department || '-'}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-200">
                        {t.issuedTo || '-'}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id, t.productName)}
                          title="Delete Transaction"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal with Ongoing Site Dropdown */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">New Transaction</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Product *</label>
                <input
                  type="text"
                  required
                  placeholder="Type code, name or select product..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Site Name Selector from Ongoing Sites */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>Site / Ongoing Package *</span>
                  <span className="text-[10px] text-blue-400 font-normal">From Ongoing Sites</span>
                </label>
                {siteSheets.length > 0 ? (
                  <select
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-cyan-400 font-medium outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {siteSheets.map((s: any) => (
                      <option key={s.siteId} value={s.siteName}>
                        {s.siteName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. HHH Tower A"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-cyan-400 font-medium outline-none focus:border-blue-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Stock In' | 'Stock Out')}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="Stock Out">Stock Out</option>
                    <option value="Stock In">Stock In</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Transaction Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Maintenance"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Issued To / Employee *</label>
                  <input
                    type="text"
                    required
                    placeholder="Name or employee ID"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTransactionsModule;
