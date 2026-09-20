import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Download,
  Calendar,
  Filter,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2
} from 'lucide-react';

export interface StockTransaction {
  id: string;
  date: string;
  productId: string;
  productName: string; // Shows Category since product name was simplified
  siteName: string;
  type: 'STOCK_IN' | 'STOCK_OUT';
  quantity: number;
  unit: string;
  department: string;
  issuedTo: string;
  totalCost?: number;
  remarks?: string;
}

const STORAGE_TX_KEY = 'CONSTRUCTION_PRO_BUILDING_TRANSACTIONS_V1';
const STORAGE_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_NO_NAME_V1';

export const StockTransactionsModule: React.FC = () => {
  const { selectedSiteId, siteSheets = [], currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  // Active Site Name fallback
  const activeSiteName = useMemo(() => {
    const matched = siteSheets.find((s: any) => s.siteId === selectedSiteId);
    return matched ? matched.siteName : 'TOWER-A';
  }, [siteSheets, selectedSiteId]);

  // Load live Products from local storage to link
  const [products, setProducts] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Load Transactions
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_TX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Filters State matching your UI
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-09-20');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'STOCK_IN' | 'STOCK_OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [txType, setTxType] = useState<'STOCK_IN' | 'STOCK_OUT'>('STOCK_OUT');
  const [txDate, setTxDate] = useState('2026-09-20');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [department, setDepartment] = useState('Civil / Structure');
  const [issuedTo, setIssuedTo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Sync products when window gains focus or storage changes
  useEffect(() => {
    const handleSync = () => {
      try {
        const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
        if (raw) setProducts(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Save Transactions
  useEffect(() => {
    localStorage.setItem(STORAGE_TX_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Selected product reference for live details
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const handleOpenAdd = () => {
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
    }
    setTxType('STOCK_OUT');
    setTxDate('2026-09-20');
    setQuantity(10);
    setDepartment('Civil / Structure');
    setIssuedTo('');
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('No product selected');
      return;
    }

    const qty = Number(quantity) || 0;
    if (qty <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    // Guard: Prevent stock out if stock is insufficient
    if (txType === 'STOCK_OUT' && Number(selectedProduct.currentStock || 0) < qty) {
      alert(`Insufficient stock! Available stock is only ${selectedProduct.currentStock} ${selectedProduct.unit}.`);
      return;
    }

    // 1. Calculate live updated stock on the product
    const updatedProducts = products.map((p) => {
      if (p.id === selectedProduct.id) {
        const current = Number(p.currentStock || 0);
        const newStock = txType === 'STOCK_IN' ? current + qty : current - qty;
        return { ...p, currentStock: newStock };
      }
      return p;
    });

    // 2. Persist updated product stock back to local storage
    setProducts(updatedProducts);
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updatedProducts));

    // 3. Create the audit transaction entry
    const newTx: StockTransaction = {
      id: `TXN-${Date.now().toString().slice(-5)}`,
      date: txDate,
      productId: selectedProduct.id,
      productName: selectedProduct.category || selectedProduct.name || 'Materials',
      siteName: activeSiteName,
      type: txType,
      quantity: qty,
      unit: selectedProduct.unit || 'Nos',
      department: department.trim() || 'Site Team',
      issuedTo: issuedTo.trim() || 'Site Supervisor',
      totalCost: (Number(selectedProduct.unitCost) || 0) * qty,
      remarks: remarks.trim() || undefined
    };

    setTransactions([newTx, ...transactions]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      alert('Only Admin can delete transaction records');
      return;
    }
    if (window.confirm('Delete this transaction log? Note: This will not revert past stock.')) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  // Filtered list
  const filtered = transactions.filter((t) => {
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.issuedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // KPI Metrics matching your 3 cards
  const totalStockInQty = filtered
    .filter((t) => t.type === 'STOCK_IN')
    .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

  const totalStockOutQty = filtered
    .filter((t) => t.type === 'STOCK_OUT')
    .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full audit log of all stock movements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting CSV...')}
            className="px-3.5 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1a2335] border border-[#1e293b] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0b1120] border border-[#1e293b] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 font-bold mb-1 text-[11px]">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-mono outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-bold mb-1 text-[11px]">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-mono outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-bold mb-1 text-[11px]">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="STOCK_IN">Stock In (Receipt)</option>
            <option value="STOCK_OUT">Stock Out (Issue)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-bold mb-1 text-[11px]">Search</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, product, site, employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* 3 Metric Cards matching your UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Records shown</div>
          <div className="text-3xl font-black text-white font-mono mt-2 tracking-tight">
            {filtered.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stock In</div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-2 tracking-tight">
            {totalStockInQty.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stock Out</div>
          <div className="text-3xl font-black text-rose-500 font-mono mt-2 tracking-tight">
            {totalStockOutQty.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Transactions Audit Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-4">TXN ID & DATE</th>
                <th className="py-3.5 px-4">PRODUCT (CATEGORY)</th>
                <th className="py-3.5 px-4">ONGOING SITE</th>
                <th className="py-3.5 px-4">TYPE</th>
                <th className="py-3.5 px-4 text-right">QTY</th>
                <th className="py-3.5 px-4">DEPARTMENT</th>
                <th className="py-3.5 px-4">ISSUED TO / EMPLOYEE</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No transactions matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isStockIn = item.type === 'STOCK_IN';
                  return (
                    <tr key={item.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white">{item.id}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.date}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">{item.productName}</td>
                      <td className="py-3.5 px-4 font-semibold text-blue-400">{item.siteName}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            isStockIn
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isStockIn ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {isStockIn ? 'Stock In' : 'Stock Out'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-white">
                        {item.quantity} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{item.department}</td>
                      <td className="py-3.5 px-4 text-slate-300">{item.issuedTo}</td>
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal: + New Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">Record Stock Movement</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
              {/* Product Selection (Connected to Products) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Select Product / Category <span className="text-rose-500">*</span>
                </label>
                {products.length === 0 ? (
                  <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-amber-300 text-xs">
                    No products found in catalog. Please add products in the Products tab first.
                  </div>
                ) : (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.category} — Current Stock: {p.currentStock} {p.unit} (₹{p.unitCost}/{p.unit})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Movement Type & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Movement Type *</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="STOCK_OUT">Stock Out (Issue to Site / Slab)</option>
                    <option value="STOCK_IN">Stock In (Vendor Delivery Receipt)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Quantity ({selectedProduct?.unit || 'Units'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Available Balance</label>
                  <div className="w-full px-3.5 py-2.5 bg-[#080d19] border border-[#1e293b] rounded-xl text-cyan-400 font-mono font-bold">
                    {selectedProduct ? `${selectedProduct.currentStock} ${selectedProduct.unit}` : '0'}
                  </div>
                </div>
              </div>

              {/* Department & Recipient */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Department / Sub-structure</label>
                  <input
                    type="text"
                    placeholder="e.g. Column Casting, Slab 2"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Issued To / Handled By *</label>
                  <input
                    type="text"
                    required
                    placeholder="Supervisor / Contractor"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={products.length === 0}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-blue-600/30"
                >
                  Save Stock Movement
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
