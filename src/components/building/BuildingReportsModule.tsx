import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  FileText,
  Download,
  Calendar,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Building2
} from 'lucide-react';

const STORAGE_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_NO_NAME_V1';
const STORAGE_TX_KEY = 'CONSTRUCTION_PRO_BUILDING_TRANSACTIONS_V1';

export const BuildingReportsModule: React.FC = () => {
  const { selectedSiteId, siteSheets = [] } = useERP() as any;

  // Active Site
  const activeSiteName = useMemo(() => {
    const matched = siteSheets.find((s: any) => s.siteId === selectedSiteId);
    return matched ? matched.siteName : 'ALL SITES';
  }, [siteSheets, selectedSiteId]);

  // Live Data States
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '2026-08-01',
    to: '2026-09-30'
  });

  // Load from LocalStorage
  const loadData = () => {
    try {
      const prodRaw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (prodRaw) setProducts(JSON.parse(prodRaw));

      const txRaw = localStorage.getItem(STORAGE_TX_KEY);
      if (txRaw) setTransactions(JSON.parse(txRaw));
    } catch {}
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Filter transactions within selected date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = tx.date || '';
      return (!dateRange.from || txDate >= dateRange.from) && (!dateRange.to || txDate <= dateRange.to);
    });
  }, [transactions, dateRange]);

  // 1. Reconcile Products with Transactions
  const productAuditReport = useMemo(() => {
    return products.map((prod) => {
      // Find all inward transactions for this product
      const totalInwardQty = filteredTransactions
        .filter((t) => (t.productId === prod.id || t.productName === prod.category) && t.type === 'STOCK_IN')
        .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

      // Find all outward transactions (consumption) for this product
      const totalOutwardQty = filteredTransactions
        .filter((t) => (t.productId === prod.id || t.productName === prod.category) && t.type === 'STOCK_OUT')
        .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

      const unitCost = Number(prod.unitCost || 0);
      const currentStock = Number(prod.currentStock || 0);
      const holdingValue = currentStock * unitCost;
      const consumedValue = totalOutwardQty * unitCost;
      const inwardValue = totalInwardQty * unitCost;

      return {
        ...prod,
        totalInwardQty,
        totalOutwardQty,
        holdingValue,
        consumedValue,
        inwardValue
      };
    });
  }, [products, filteredTransactions]);

  // 2. High Level KPI Metrics
  const totalHoldingValuation = productAuditReport.reduce((sum, p) => sum + p.holdingValue, 0);
  const totalConsumedExpenditure = productAuditReport.reduce((sum, p) => sum + p.consumedValue, 0);
  const totalInwardProcurement = productAuditReport.reduce((sum, p) => sum + p.inwardValue, 0);

  // 3. Department Breakdown
  const departmentBreakdown = useMemo(() => {
    const deptMap: { [key: string]: { qty: number; value: number; count: number } } = {};

    filteredTransactions
      .filter((t) => t.type === 'STOCK_OUT')
      .forEach((t) => {
        const dept = t.department || 'General Site';
        const cost = Number(t.totalCost || 0);
        const qty = Number(t.quantity || 0);

        if (!deptMap[dept]) {
          deptMap[dept] = { qty: 0, value: 0, count: 0 };
        }
        deptMap[dept].qty += qty;
        deptMap[dept].value += cost;
        deptMap[dept].count += 1;
      });

    return Object.entries(deptMap).map(([name, stat]) => ({
      name,
      ...stat
    }));
  }, [filteredTransactions]);

  // Filtered list for search
  const filteredProducts = productAuditReport.filter((p) =>
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CSV Export
  const handleExportCSV = () => {
    if (productAuditReport.length === 0) {
      alert('No data available to export');
      return;
    }
    const headers = ['Product ID', 'Category', 'Unit', 'Unit Cost (INR)', 'Inward Qty', 'Consumed Qty', 'Current Stock', 'Total Holding Value (INR)'];
    const rows = productAuditReport.map((p) => [
      p.id,
      `"${p.category}"`,
      p.unit,
      p.unitCost,
      p.totalInwardQty,
      p.totalOutwardQty,
      p.currentStock,
      p.holdingValue
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `building_inventory_audit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Building Consumption & Stock Audits</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Reconciliation report connecting current store inventory to site dispatch transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1a2335] border border-[#1e293b] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Audit Report</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Search Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0b1120] border border-[#1e293b] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 font-bold mb-1 text-[11px]">Audit Start Date</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="w-full px-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-mono outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-bold mb-1 text-[11px]">Audit End Date</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="w-full px-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-mono outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-bold mb-1 text-[11px]">Search Catalog</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search category or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* 4 Financial Audit Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Asset Value */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Stock Value</div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-3 tracking-tight">
            ₹{totalHoldingValuation.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Available in yard & central store</div>
        </div>

        {/* Total Consumed / Dispatched Value */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consumed at Site</div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-3 tracking-tight">
            ₹{totalConsumedExpenditure.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Issued across site castings</div>
        </div>

        {/* Total Procurement Receipts */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inward Deliveries</div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-3 tracking-tight">
            ₹{totalInwardProcurement.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Received in selected timeframe</div>
        </div>

        {/* Total Movements Logged */}
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Audit Entries</div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-3 tracking-tight">
            {filteredTransactions.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Logged challans & gate passes</div>
        </div>
      </div>

      {/* Main Stock Reconciliation Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Item-Wise Stock Reconciliation Audit</h2>
            <p className="text-[11px] text-slate-400">Inventory balance verified against recorded transfers</p>
          </div>
          <span className="text-xs font-mono text-blue-400">{filteredProducts.length} Items Audit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">MATERIAL CATEGORY</th>
                <th className="py-3.5 px-5 text-right">UNIT COST (₹)</th>
                <th className="py-3.5 px-5 text-right">TOTAL INWARD</th>
                <th className="py-3.5 px-5 text-right">TOTAL CONSUMED</th>
                <th className="py-3.5 px-5 text-right">CURRENT BALANCE</th>
                <th className="py-3.5 px-5 text-right">HOLDING ASSET (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No matching inventory products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-400">{p.id}</td>
                    <td className="py-3.5 px-5 font-bold text-white text-xs">{p.category}</td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-300">
                      ₹{p.unitCost.toLocaleString('en-IN')} <span className="text-[10px] text-slate-500">/ {p.unit}</span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-blue-400">
                      +{p.totalInwardQty} <span className="text-[10px] text-slate-500">{p.unit}</span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-rose-400">
                      -{p.totalOutwardQty} <span className="text-[10px] text-slate-500">{p.unit}</span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="font-mono font-black text-sm text-cyan-400">
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-black text-sm text-emerald-400">
                      ₹{p.holdingValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consumption Breakdown by Department / Section */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-5 shadow-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Material Consumption by Department / Tower Section</span>
        </h2>

        {departmentBreakdown.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#080C14] border border-[#1E293B] text-center text-slate-500 text-xs">
            No stock outward transactions recorded yet to display consumption breakdown.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departmentBreakdown.map((d) => (
              <div key={d.name} className="p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{d.count} issue slips issued</div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Cost Impact:</span>
                  <span className="text-sm font-black text-rose-400 font-mono">
                    ₹{d.value.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingReportsModule;
