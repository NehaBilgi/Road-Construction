import React, { useState, useEffect, useMemo } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoadERPProvider } from './context/RoadERPContext';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectTypeSelectionPage } from './components/auth/ProjectTypeSelectionPage';
import { SiteSelectionPage } from './components/auth/SiteSelectionPage';

import { SiteCentricMidnightDashboard } from './components/dashboard/SiteCentricMidnightDashboard';
import { RoadSitesManagerModule } from './components/sites/RoadSitesManagerModule';
import { MaterialHaulageTripsModule } from './components/trips/MaterialHaulageTripsModule';
import { VendorAdvancesModule } from './components/VendorAdvancesModule';
import { DieselFuelManagementModule } from './components/diesel/DieselFuelManagementModule';
import { SiteCostExpensesModule } from './components/costing/SiteCostExpensesModule';
import { RoadYieldCalculatorModule } from './components/calculator/RoadYieldCalculatorModule';
import { MachineryFleetModule } from './components/machinery/MachineryFleetModule';
import StockTransactionsModule from './components/building/StockTransactionsModule';
import { InstallAppButton } from './components/InstallAppButton';
import { ThemeToggle } from './components/ThemeToggle';
import { UserManagementModule } from './components/configuration/UserManagementModule';

import {
  LayoutDashboard, Truck, Fuel, DollarSign, Calculator, HardHat,
  LogOut, Milestone, Users, Package, ArrowLeftRight, FileText,
  Bell, CalendarCheck, Tag, Archive, Building2,
  X, Plus, Edit2, Trash2, Menu, ChevronDown, Check, CreditCard,
  Layers, Boxes, AlertTriangle, ArrowDownLeft, ArrowUpRight, Download,
  Search, AlertCircle, TrendingDown, CheckCircle2, ArrowRight
} from 'lucide-react';

// ==========================================
// Storage Keys
// ==========================================
const STORAGE_BUILDING_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_NO_NAME_V1';
const STORAGE_BUILDING_TX_KEY = 'CONSTRUCTION_PRO_BUILDING_TRANSACTIONS_V1';
const STORAGE_BUILDING_CATS_KEY = 'CONSTRUCTION_PRO_BUILDING_CATEGORIES_ISOLATED_V1';
const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';

// ==========================================
// Generic Scaffold View for Pending Tabs
// ==========================================
const GenericView: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ title, subtitle, icon: Icon }) => (
  <div className="p-6 rounded-3xl bg-[#0c1427] border border-[#182643] shadow-2xl space-y-4 font-sans text-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
    <div className="p-8 rounded-2xl bg-[#080d19] border border-[#182643] text-center text-slate-400 text-xs">
      {title} telemetry and operations active.
    </div>
  </div>
);

// ==========================================
// Building Reports Module (Linked to Products & Tx)
// ==========================================
export const BuildingReportsModule: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '2026-08-01',
    to: '2026-09-30'
  });

  const loadReportData = () => {
    try {
      const prodRaw = localStorage.getItem(STORAGE_BUILDING_PRODUCTS_KEY);
      if (prodRaw) setProducts(JSON.parse(prodRaw));

      const txRaw = localStorage.getItem(STORAGE_BUILDING_TX_KEY);
      if (txRaw) setTransactions(JSON.parse(txRaw));
    } catch {}
  };

  useEffect(() => {
    loadReportData();
    window.addEventListener('storage', loadReportData);
    window.addEventListener('focus', loadReportData);
    return () => {
      window.removeEventListener('storage', loadReportData);
      window.removeEventListener('focus', loadReportData);
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter((tx) => {
      const d = tx.date || '';
      return (!dateRange.from || d >= dateRange.from) && (!dateRange.to || d <= dateRange.to);
    });
  }, [transactions, dateRange]);

  const productAuditReport = useMemo(() => {
    return (products || []).map((prod) => {
      const totalInwardQty = filteredTransactions
        .filter((t) => (t.productId === prod.id || t.productName === prod.category) && t.type === 'STOCK_IN')
        .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

      const totalOutwardQty = filteredTransactions
        .filter((t) => (t.productId === prod.id || t.productName === prod.category) && t.type === 'STOCK_OUT')
        .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

      const unitCost = Number(prod.unitCost || 0);
      const currentStock = Number(prod.currentStock || 0);

      return {
        ...prod,
        totalInwardQty,
        totalOutwardQty,
        holdingValue: currentStock * unitCost,
        consumedValue: totalOutwardQty * unitCost,
        inwardValue: totalInwardQty * unitCost
      };
    });
  }, [products, filteredTransactions]);

  const totalHoldingValuation = productAuditReport.reduce((sum, p) => sum + p.holdingValue, 0);
  const totalConsumedExpenditure = productAuditReport.reduce((sum, p) => sum + p.consumedValue, 0);
  const totalInwardProcurement = productAuditReport.reduce((sum, p) => sum + p.inwardValue, 0);

  const departmentBreakdown = useMemo(() => {
    const deptMap: { [key: string]: { qty: number; value: number; count: number } } = {};
    filteredTransactions
      .filter((t) => t.type === 'STOCK_OUT')
      .forEach((t) => {
        const dept = t.department || 'General Structure';
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

  const filteredProducts = productAuditReport.filter((p) =>
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    if (productAuditReport.length === 0) {
      alert('No audit data available to export');
      return;
    }
    const headers = ['Product ID', 'Category', 'Unit', 'Unit Cost (INR)', 'Inward Qty', 'Consumed Qty', 'Current Stock', 'Holding Asset Value (INR)'];
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
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = uri;
    link.download = `building_stock_audit_report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Building Consumption & Stock Audits</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Reconciliation report connecting current store inventory to site dispatch transactions[cite: 12].
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1a2335] border border-[#1e293b] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer w-fit"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

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
          <label className="block text-slate-400 font-bold mb-1 text-[11px]">Search Catalog SKU</label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="text-[10px] text-slate-500 mt-1">Available in site yard & central store</div>
        </div>

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
          <div className="text-[10px] text-slate-500 mt-1">Issued across building castings</div>
        </div>

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
          <div className="text-[10px] text-slate-500 mt-1">Logged challans & transfer vouchers</div>
        </div>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Item-Wise Stock Reconciliation Audit</h2>
            <p className="text-[11px] text-slate-400">Inventory balance verified against recorded transfers</p>
          </div>
          <span className="text-xs font-mono text-blue-400">{filteredProducts.length} Items Audited</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">MATERIAL CATEGORY</th>
                <th className="py-3.5 px-5 text-right">UNIT RATE (₹)</th>
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
                      ₹{Number(p.unitCost || 0).toLocaleString('en-IN')} <span className="text-[10px] text-slate-500">/ {p.unit}</span>
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

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-5 shadow-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Material Consumption by Department / Tower Section</span>
        </h2>

        {departmentBreakdown.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#080C14] border border-[#1E293B] text-center text-slate-500 text-xs">
            No stock outward transactions recorded yet in this date range.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departmentBreakdown.map((d) => (
              <div key={d.name} className="p-4 rounded-2xl bg-[#080C14] border border-[#1E293B] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{d.count} issue vouchers logged</div>
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

// ==========================================
// Building Alerts Module (Linked to Products & Tx)
// ==========================================
export const BuildingAlertsModule: React.FC<{ onNavigateTab: (tabId: string) => void }> = ({ onNavigateTab }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'OUT_OF_STOCK' | 'CRITICAL' | 'RAPID_DRAIN'>('ALL');

  const loadData = () => {
    try {
      const prodRaw = localStorage.getItem(STORAGE_BUILDING_PRODUCTS_KEY);
      if (prodRaw) setProducts(JSON.parse(prodRaw));

      const txRaw = localStorage.getItem(STORAGE_BUILDING_TX_KEY);
      if (txRaw) setTransactions(JSON.parse(txRaw));
    } catch {}
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('focus', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('focus', loadData);
    };
  }, []);

  const activeAlerts = useMemo(() => {
    const list: any[] = [];

    (products || []).forEach((p) => {
      const current = Number(p.currentStock || 0);
      const minThreshold = Number(p.minThreshold || 20);

      const recentOutward = (transactions || [])
        .filter((t) => (t.productId === p.id || t.productName === p.category) && t.type === 'STOCK_OUT')
        .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

      if (current <= 0) {
        list.push({
          id: `ALT-OOS-${p.id}`,
          productId: p.id,
          title: p.category,
          unit: p.unit,
          currentStock: current,
          severity: 'OUT_OF_STOCK',
          badgeText: 'Depleted (0 Balance)',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          message: `Zero stock remaining on site. Ongoing casting and site operations are at immediate halt risk.`
        });
      } else if (current <= minThreshold) {
        list.push({
          id: `ALT-LOW-${p.id}`,
          productId: p.id,
          title: p.category,
          unit: p.unit,
          currentStock: current,
          severity: 'CRITICAL',
          badgeText: 'Critical Buffer',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          message: `Only ${current} ${p.unit} remaining in central yard. Minimum buffer threshold (${minThreshold} ${p.unit}) breached.`
        });
      } else if (recentOutward > current) {
        list.push({
          id: `ALT-DRAIN-${p.id}`,
          productId: p.id,
          title: p.category,
          unit: p.unit,
          currentStock: current,
          severity: 'RAPID_DRAIN',
          badgeText: 'High Consumption Rate',
          badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          message: `${recentOutward} ${p.unit} consumed recently in dispatches, exceeding current remaining balance (${current} ${p.unit}).`
        });
      }
    });

    return list;
  }, [products, transactions]);

  const filteredAlerts = useMemo(() => {
    return activeAlerts.filter((alt) => {
      const matchSeverity = severityFilter === 'ALL' || alt.severity === severityFilter;
      const matchSearch =
        alt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alt.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchSearch;
    });
  }, [activeAlerts, severityFilter, searchQuery]);

  const oosCount = activeAlerts.filter((a) => a.severity === 'OUT_OF_STOCK').length;
  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const rapidDrainCount = activeAlerts.filter((a) => a.severity === 'RAPID_DRAIN').length;

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
              Live Stock Watchdog
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-rose-500" />
            <span>Inventory Alerts & Notifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry tracking stockouts, safety buffer limits, and rapid outward consumption rates[cite: 13].
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('products')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Package className="w-4 h-4" />
          <span>Go to Products Master</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setSeverityFilter('OUT_OF_STOCK')}
          className={`p-5 rounded-2xl bg-[#0b1120] border transition-all cursor-pointer shadow-xl ${
            severityFilter === 'OUT_OF_STOCK' ? 'border-rose-500' : 'border-[#1e293b] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Out of Stock (0 Bal)</div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono mt-2 tracking-tight">
            {oosCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Halt risk materials</div>
        </div>

        <div
          onClick={() => setSeverityFilter('CRITICAL')}
          className={`p-5 rounded-2xl bg-[#0b1120] border transition-all cursor-pointer shadow-xl ${
            severityFilter === 'CRITICAL' ? 'border-amber-500' : 'border-[#1e293b] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Buffer</div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-2 tracking-tight">
            {criticalCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Approaching depletion</div>
        </div>

        <div
          onClick={() => setSeverityFilter('RAPID_DRAIN')}
          className={`p-5 rounded-2xl bg-[#0b1120] border transition-all cursor-pointer shadow-xl ${
            severityFilter === 'RAPID_DRAIN' ? 'border-cyan-500' : 'border-[#1e293b] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rapid Consumption Rate</div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono mt-2 tracking-tight">
            {rapidDrainCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Outward &gt; current yard stock</div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#0b1120] border border-[#1e293b] flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              severityFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            All Alerts ({activeAlerts.length})
          </button>
          <button
            onClick={() => setSeverityFilter('OUT_OF_STOCK')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              severityFilter === 'OUT_OF_STOCK'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            Depleted ({oosCount})
          </button>
          <button
            onClick={() => setSeverityFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              severityFilter === 'CRITICAL'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            Critical Low ({criticalCount})
          </button>
          <button
            onClick={() => setSeverityFilter('RAPID_DRAIN')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              severityFilter === 'RAPID_DRAIN'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            Rapid Drain ({rapidDrainCount})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search affected material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 text-xs"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0b1120] border border-[#1e293b] text-center text-slate-400 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white">All building inventory buffers healthy</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No stockouts or critical inventory depletion detected matching your current filter.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] hover:border-slate-700 transition-all shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${alert.badgeColor}`}>
                    {alert.badgeText}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{alert.productId}</span>
                  <h3 className="text-sm font-black text-white">{alert.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {alert.message}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-[#1e293b] pt-3 sm:pt-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Yard Stock</div>
                  <div className="font-mono font-black text-base text-white">
                    {alert.currentStock} <span className="text-xs font-normal text-slate-400">{alert.unit}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('products')}
                  className="px-3.5 py-2 rounded-xl bg-[#131b2e] hover:bg-blue-600 text-slate-300 hover:text-white border border-[#1e293b] hover:border-blue-500 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Restock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==========================================
// Building Products & Inventory Master Module
// ==========================================
export interface BuildingProduct {
  id: string;
  category: string;
  classification: 'Civil & Structural' | 'Masonry & Partitions' | 'Hardware & Centering' | 'MEP Services' | 'Finishing & Chemicals';
  unit: string;
  unitCost: number;
  currentStock: number;
  minThreshold: number;
  location: string;
  remarks?: string;
}

const INITIAL_BUILDING_PRODUCTS: BuildingProduct[] = [
  {
    id: 'PRD-01',
    category: 'Cement OPC 53 Grade',
    classification: 'Civil & Structural',
    unit: 'Bags',
    unitCost: 385,
    currentStock: 450,
    minThreshold: 100,
    location: 'Central Cement Godown A',
    remarks: 'UltraTech / ACC 53 Grade for RCC casting'
  },
  {
    id: 'PRD-02',
    category: 'TMT Steel Rebars (Fe550D - 12mm)',
    classification: 'Civil & Structural',
    unit: 'Ton',
    unitCost: 56000,
    currentStock: 18,
    minThreshold: 5,
    location: 'Steel Yard Bay 2',
    remarks: 'Primary beam & column reinforcement'
  },
  {
    id: 'PRD-03',
    category: 'TMT Steel Rebars (Fe550D - 8mm)',
    classification: 'Civil & Structural',
    unit: 'Ton',
    unitCost: 57500,
    currentStock: 8,
    minThreshold: 4,
    location: 'Steel Yard Bay 1',
    remarks: 'Slab reinforcement and shear stirrups'
  },
  {
    id: 'PRD-04',
    category: 'Double-Washed M-Sand',
    classification: 'Civil & Structural',
    unit: 'Ton',
    unitCost: 1450,
    currentStock: 85,
    minThreshold: 30,
    location: 'Open Yard Bin 1',
    remarks: 'Concrete mix batching sand (Zone II)'
  },
  {
    id: 'PRD-05',
    category: '20mm Crushed Granite Aggregate',
    classification: 'Civil & Structural',
    unit: 'Ton',
    unitCost: 1250,
    currentStock: 120,
    minThreshold: 40,
    location: 'Open Yard Bin 2',
    remarks: 'Graded aggregate for M25/M30 slab concrete'
  },
  {
    id: 'PRD-06',
    category: 'AAC Lightweight Blocks (600x200x150mm)',
    classification: 'Masonry & Partitions',
    unit: 'Nos',
    unitCost: 65,
    currentStock: 1800,
    minThreshold: 500,
    location: 'Tower A Floor Staging',
    remarks: 'Internal room partition masonry'
  },
  {
    id: 'PRD-07',
    category: 'Film-Faced Shuttering Plywood (12mm)',
    classification: 'Hardware & Centering',
    unit: 'Nos',
    unitCost: 1850,
    currentStock: 14,
    minThreshold: 25,
    location: 'Centering Store Shed',
    remarks: 'Slab deck formwork shuttering sheets'
  },
  {
    id: 'PRD-08',
    category: 'Adjustable Steel Props (3.0m - 4.5m)',
    classification: 'Hardware & Centering',
    unit: 'Nos',
    unitCost: 950,
    currentStock: 320,
    minThreshold: 100,
    location: 'Centering Yard Rack B',
    remarks: 'Heavy duty slab staging jack props'
  },
  {
    id: 'PRD-09',
    category: 'CPVC Pressure Pipes (1 inch Class 1)',
    classification: 'MEP Services',
    unit: 'Nos',
    unitCost: 420,
    currentStock: 12,
    minThreshold: 20,
    location: 'MEP Central Store',
    remarks: 'Potable water supply risers'
  },
  {
    id: 'PRD-10',
    category: 'Integral Waterproofing Admixture',
    classification: 'Finishing & Chemicals',
    unit: 'Litre',
    unitCost: 160,
    currentStock: 250,
    minThreshold: 50,
    location: 'Chemical Storage Rack',
    remarks: 'Basement raft and terrace slab waterproofing'
  }
];

export const ProductsMasterModule: React.FC = () => {
  const { currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  const [products, setProducts] = useState<BuildingProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BUILDING_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BUILDING_PRODUCTS;
    } catch {
      return INITIAL_BUILDING_PRODUCTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [stockAdjustProduct, setStockAdjustProduct] = useState<BuildingProduct | null>(null);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustQty, setAdjustQty] = useState<number | ''>(10);
  const [adjustReason, setAdjustReason] = useState('');

  const [category, setCategory] = useState('');
  const [classification, setClassification] = useState<BuildingProduct['classification']>('Civil & Structural');
  const [unit, setUnit] = useState('Bags');
  const [unitCost, setUnitCost] = useState<number | ''>(385);
  const [currentStock, setCurrentStock] = useState<number | ''>(100);
  const [minThreshold, setMinThreshold] = useState<number | ''>(20);
  const [location, setLocation] = useState('Site Yard');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_BUILDING_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setCategory('');
    setClassification('Civil & Structural');
    setUnit('Bags');
    setUnitCost(385);
    setCurrentStock(100);
    setMinThreshold(20);
    setLocation('Site Yard');
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: BuildingProduct) => {
    setEditingId(prod.id);
    setCategory(prod.category);
    setClassification(prod.classification);
    setUnit(prod.unit);
    setUnitCost(prod.unitCost);
    setCurrentStock(prod.currentStock);
    setMinThreshold(prod.minThreshold);
    setLocation(prod.location);
    setRemarks(prod.remarks || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!isAdmin) {
      alert('Only Administrators can delete product records.');
      return;
    }
    if (window.confirm(`Delete product "${name}" from building inventory?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim()) return;

    const payload: BuildingProduct = {
      id: editingId || `PRD-${Date.now().toString().slice(-4)}`,
      category: category.trim(),
      classification,
      unit,
      unitCost: Number(unitCost) || 0,
      currentStock: Number(currentStock) || 0,
      minThreshold: Number(minThreshold) || 0,
      location: location.trim() || 'Site Yard',
      remarks: remarks.trim() || undefined
    };

    if (editingId) {
      setProducts((prev) => prev.map((p) => (p.id === editingId ? payload : p)));
    } else {
      setProducts((prev) => [payload, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;

    const qty = Number(adjustQty) || 0;
    if (qty <= 0) return;

    const updated = products.map((p) => {
      if (p.id !== stockAdjustProduct.id) return p;
      const nextStock = adjustType === 'IN' 
        ? p.currentStock + qty 
        : Math.max(0, p.currentStock - qty);
      return { ...p, currentStock: nextStock };
    });

    setProducts(updated);
    setStockAdjustProduct(null);
    setAdjustQty(10);
    setAdjustReason('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.remarks && p.remarks.toLowerCase().includes(q));

      const matchClassification =
        selectedClassification === 'ALL' || p.classification === selectedClassification;

      return matchSearch && matchClassification;
    });
  }, [products, searchQuery, selectedClassification]);

  const totalAssetValue = products.reduce(
    (sum, p) => sum + Number(p.currentStock || 0) * Number(p.unitCost || 0),
    0
  );

  const lowStockCount = products.filter(
    (p) => Number(p.currentStock || 0) <= Number(p.minThreshold || 0)
  ).length;

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      alert('No product data available to export');
      return;
    }
    const headers = ['Product ID', 'Category Name', 'Classification', 'Unit', 'Unit Cost (INR)', 'Current Stock', 'Min Threshold', 'Location', 'Asset Value (INR)', 'Remarks'];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.category}"`,
      `"${p.classification}"`,
      p.unit,
      p.unitCost,
      p.currentStock,
      p.minThreshold,
      `"${p.location}"`,
      p.currentStock * p.unitCost,
      `"${p.remarks || ''}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `building_products_inventory_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-blue-400" />
            <span>Building Products & Inventory Master</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stock balance, storage locations, unit procurement rates, and reorder levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#121927] hover:bg-[#1a2335] border border-[#1e293b] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Catalog Items</div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2 tracking-tight">
            {products.length} <span className="text-xs font-normal text-slate-400">SKUs</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Active materials in catalog</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Inventory Value</div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-2 tracking-tight">
            ₹{totalAssetValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Cumulative on-site asset valuation</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Low Buffer</div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono mt-2 tracking-tight">
            {lowStockCount} <span className="text-xs font-normal text-slate-400">Items</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Below minimum buffer threshold</div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#0b1120] border border-[#1e293b] flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedClassification('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              selectedClassification === 'ALL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setSelectedClassification('Civil & Structural')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              selectedClassification === 'Civil & Structural'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            Civil & Steel
          </button>
          <button
            onClick={() => setSelectedClassification('Masonry & Partitions')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              selectedClassification === 'Masonry & Partitions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            Blocks & Bricks
          </button>
          <button
            onClick={() => setSelectedClassification('Hardware & Centering')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              selectedClassification === 'Hardware & Centering'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            Formwork & Props
          </button>
          <button
            onClick={() => setSelectedClassification('MEP Services')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              selectedClassification === 'MEP Services'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'
            }`}
          >
            MEP / Plumbing
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search material, SKU, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 text-xs"
          />
        </div>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-5">SKU ID</th>
                <th className="py-3.5 px-5">MATERIAL / PRODUCT NAME</th>
                <th className="py-3.5 px-5">CLASSIFICATION</th>
                <th className="py-3.5 px-5 text-right">UNIT COST</th>
                <th className="py-3.5 px-5 text-center">CURRENT STOCK</th>
                <th className="py-3.5 px-5 text-center">SAFETY BUFFER</th>
                <th className="py-3.5 px-5 text-right">ASSET VALUE (₹)</th>
                <th className="py-3.5 px-5">LOCATION</th>
                <th className="py-3.5 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    No building products match your search. Click "+ Add New Product" above.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.minThreshold;
                  const assetValue = p.currentStock * p.unitCost;

                  return (
                    <tr key={p.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-slate-400">{p.id}</td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-white text-xs">{p.category}</div>
                        {p.remarks && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{p.remarks}</div>
                        )}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                          {p.classification}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-slate-300 whitespace-nowrap">
                        ₹{p.unitCost.toLocaleString('en-IN')} <span className="text-[10px] text-slate-500">/ {p.unit}</span>
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span
                          className={`font-mono font-black text-sm px-2.5 py-1 rounded-lg border ${
                            isLow
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {p.currentStock.toLocaleString('en-IN')} {p.unit}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center font-mono text-slate-400 whitespace-nowrap">
                        Min: {p.minThreshold} {p.unit}
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-black text-sm text-emerald-400 whitespace-nowrap">
                        ₹{assetValue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 text-slate-400 whitespace-nowrap">
                        <div className="text-xs text-slate-300">{p.location}</div>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setStockAdjustProduct(p);
                              setAdjustType('IN');
                              setAdjustQty(10);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#121927] hover:bg-blue-600/30 text-blue-400 border border-[#1e293b] text-[11px] font-bold transition-colors cursor-pointer"
                            title="Stock In/Out Quick Adjustment"
                          >
                            Adjust
                          </button>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(p.id, p.category)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <span>{editingId ? 'Edit Product Item' : 'Add New Building Product'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Product / Material Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cement OPC 53 Grade"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Civil & Structural">Civil & Structural</option>
                    <option value="Masonry & Partitions">Masonry & Partitions</option>
                    <option value="Hardware & Centering">Hardware & Centering</option>
                    <option value="MEP Services">MEP Services</option>
                    <option value="Finishing & Chemicals">Finishing & Chemicals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Unit of Measurement <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Bags">Bags</option>
                    <option value="Ton">Ton</option>
                    <option value="Nos">Nos</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Brass">Brass</option>
                    <option value="Meter">Meter</option>
                    <option value="Cu.M">Cu.M</option>
                    <option value="Sq.Ft">Sq.Ft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Unit Cost (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Initial Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-rose-400 font-semibold mb-1.5">
                    Min Threshold <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-rose-400 font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Storage Location / Yard Bay
                </label>
                <input
                  type="text"
                  placeholder="e.g. Godown B, Bay 4, 3rd Floor Staging"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Specifications / Grade Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fe550D primary bars, ISO certified"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stockAdjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Stock Adjustment</h3>
                <p className="text-[11px] text-slate-400">{stockAdjustProduct.category}</p>
              </div>
              <button
                onClick={() => setStockAdjustProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('IN')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    adjustType === 'IN'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-[#131b2e] text-slate-400 border-[#1e293b]'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Stock IN (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('OUT')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    adjustType === 'OUT'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                      : 'bg-[#131b2e] text-slate-400 border-[#1e293b]'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Stock OUT (-)</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Quantity ({stockAdjustProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-mono font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Challan / Dispatch Note Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received from supplier / Issued to Tower B"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div className="pt-2 border-t border-[#1e293b] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStockAdjustProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-md"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Building Material Categories Module
// ==========================================
export interface BuildingCategoryItem {
  id: string;
  name: string;
  standardRate: number;
  unit: string;
}

export const BuildingMaterialCategoriesModule: React.FC = () => {
  const { currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  const [categories, setCategories] = useState<BuildingCategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BUILDING_CATS_KEY);
      return saved ? JSON.parse(saved) : [
        { id: 'BCAT-01', name: 'Cement & Binding Bags', standardRate: 385, unit: 'Bags' },
        { id: 'BCAT-02', name: 'Structural Steel (TMT Rebars)', standardRate: 56000, unit: 'Ton' },
        { id: 'BCAT-03', name: 'Aggregates & M-Sand', standardRate: 1450, unit: 'Ton' },
        { id: 'BCAT-04', name: 'Brick & Masonry Blocks', standardRate: 65, unit: 'Nos' },
        { id: 'BCAT-05', name: 'Formwork & Shuttering', standardRate: 1850, unit: 'Nos' },
        { id: 'BCAT-06', name: 'Plumbing & Drainage', standardRate: 420, unit: 'Nos' },
        { id: 'BCAT-07', name: 'Electrical & Conduiting', standardRate: 85, unit: 'Nos' },
        { id: 'BCAT-08', name: 'Waterproofing & Chemicals', standardRate: 650, unit: 'Bags' }
      ];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [standardRate, setStandardRate] = useState<number | ''>(100);
  const [unit, setUnit] = useState('Nos');

  useEffect(() => {
    localStorage.setItem(STORAGE_BUILDING_CATS_KEY, JSON.stringify(categories));
  }, [categories]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setStandardRate(100);
    setUnit('Nos');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BuildingCategoryItem) => {
    setEditingId(item.id);
    setName(item.name);
    setStandardRate(item.standardRate);
    setUnit(item.unit);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, catName: string) => {
    if (!isAdmin) {
      alert('Only Admin has permission to delete categories.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${catName}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rateNum = Number(standardRate) || 0;

    if (editingId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, name: name.trim(), standardRate: rateNum, unit }
            : c
        )
      );
    } else {
      const newCategory: BuildingCategoryItem = {
        id: `BCAT-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        standardRate: rateNum,
        unit
      };
      setCategories((prev) => [...prev, newCategory]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-blue-400" />
            <span>Building Material Categories & Rates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage category benchmark costs, measurement units, and catalog types.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Material Category</span>
        </button>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-5 shadow-2xl space-y-3">
        {categories.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No categories added yet. Click "+ Add Material Category" to get started.
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] hover:border-slate-700 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {c.name}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  ({c.id})
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ₹{Number(c.standardRate || 0).toLocaleString('en-IN')}{' '}
                  <span className="text-slate-400 text-xs font-normal">/ {c.unit}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 rounded-xl bg-[#121927] hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-[#1E293B] hover:border-blue-500/40 transition-colors cursor-pointer"
                    title="Edit Rate & Name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-2 rounded-xl bg-[#121927] hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-[#1E293B] hover:border-rose-500/40 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingId ? 'Edit Category & Rate' : 'Add Material Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ready-Mix Concrete M25"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Benchmark Rate (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={standardRate}
                    onChange={(e) => setStandardRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Bags">Bags</option>
                    <option value="Ton">Ton</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Brass">Brass</option>
                    <option value="Meter">Meter</option>
                    <option value="Cu.M">Cu.M</option>
                    <option value="Sq.Ft">Sq.Ft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Rate' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    selectedSiteId,
    setSelectedSiteId,
    siteSheets = [],
    currentUser,
    userRole,
    appDomain,
    setAppDomain
  } = useERP() as any;

  const currentRoleStr = String(userRole || currentUser?.role || '').toUpperCase();
  const isAdmin = currentRoleStr === 'SUPER_ADMIN' || currentRoleStr === 'ADMIN' || currentRoleStr.includes('ADMIN');
  const userScope = currentUser?.allowedScope || 'ROAD_ONLY';

  const [projectType, setProjectType] = useState<'ROAD' | 'BUILDING' | null>(() => {
    if (!isAdmin) {
      return userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD';
    }

    try {
      const saved = sessionStorage.getItem('CONSTRUCTION_PRO_DOMAIN_SESSION');
      if (saved === 'ROAD' || saved === 'BUILDING') return saved;
    } catch {}

    return null;
  });

  const [hasSelectedSite, setHasSelectedSite] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isAdmin) {
      const fixedDomain = userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD';
      if (projectType !== fixedDomain) {
        setProjectType(fixedDomain);
        if (setAppDomain) setAppDomain(fixedDomain);
        sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', fixedDomain);
      }
    } else if (appDomain && appDomain !== 'BOTH' && (appDomain === 'ROAD' || appDomain === 'BUILDING')) {
      setProjectType(appDomain);
      sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', appDomain);
    }
  }, [userScope, isAdmin, appDomain]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!projectType && isAdmin) {
    return (
      <ProjectTypeSelectionPage
        onSelectProjectType={(type) => {
          setProjectType(type);
          if (setAppDomain) setAppDomain(type);
          sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', type);
        }}
      />
    );
  }

  const activeDomain = projectType || (userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD');

  if (!hasSelectedSite || !selectedSiteId || siteSheets.length === 0) {
    return (
      <SiteSelectionPage
        projectType={activeDomain}
        onSelectSite={(siteId) => {
          setSelectedSiteId(siteId);
          setHasSelectedSite(true);
          sessionStorage.setItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION', 'true');
        }}
        onBackToDomainSelect={
          isAdmin
            ? () => {
                setProjectType(null);
                setHasSelectedSite(false);
                sessionStorage.removeItem('CONSTRUCTION_PRO_DOMAIN_SESSION');
                sessionStorage.removeItem('CONSTRUCTION_PRO_SITE_CHOSEN_SESSION');
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="flex flex-1 relative h-[calc(100vh-56px)] overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full shrink-0 w-64">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            projectType={activeDomain}
            isAdminUser={isAdmin}
            onSwitchDomain={
              isAdmin
                ? () => {
                    const next = activeDomain === 'ROAD' ? 'BUILDING' : 'ROAD';
                    setProjectType(next);
                    if (setAppDomain) setAppDomain(next);
                    sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', next);
                  }
                : undefined
            }
          />
        </div>

        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 max-w-[260px] w-full bg-[#0D111D] h-full flex flex-col z-50 shadow-2xl">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                projectType={activeDomain}
                isAdminUser={isAdmin}
                onSwitchDomain={
                  isAdmin
                    ? () => {
                        const next = activeDomain === 'ROAD' ? 'BUILDING' : 'ROAD';
                        setProjectType(next);
                        if (setAppDomain) setAppDomain(next);
                        sessionStorage.setItem('CONSTRUCTION_PRO_DOMAIN_SESSION', next);
                      }
                    : undefined
                }
                onClose={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 p-6 overflow-y-auto max-h-[calc(100vh-56px)] scrollbar-thin scrollbar-thumb-[#1E293B] scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-12 w-full overflow-x-hidden">
            {activeTab === 'dashboard' && <SiteCentricMidnightDashboard onNavigateTab={setActiveTab} />}
            {(activeTab === 'road-sites' || activeTab === 'sites') && (
              <RoadSitesManagerModule projectType={activeDomain} onNavigateTab={setActiveTab} />
            )}

            {/* ROAD Construction Tabs */}
            {activeDomain === 'ROAD' && (
              <>
                {activeTab === 'haulage-trips' && <MaterialHaulageTripsModule />}
                {activeTab === 'vendor-advances' && <VendorAdvancesModule />}
                {activeTab === 'diesel' && <DieselFuelManagementModule />}
                {activeTab === 'site-expenses' && <SiteCostExpensesModule />}
                {(activeTab === 'yield_calculator' || activeTab === 'road-yield') && <RoadYieldCalculatorModule />}
                {(activeTab === 'machinery_fleet' || activeTab === 'machinery') && <MachineryFleetModule />}
                {activeTab === 'categories' && <RoadMaterialCategoriesModule />}
                {activeTab === 'users' && <UserManagementModule />}
              </>
            )}

            {/* BUILDING Construction Tabs */}
            {activeDomain === 'BUILDING' && (
              <>
                {activeTab === 'products' && <ProductsMasterModule />}
                {activeTab === 'transactions' && <StockTransactionsModule />}
                {activeTab === 'building_calculator' && <RCCCalculators />}
                {activeTab === 'categories' && <BuildingMaterialCategoriesModule />}
                {activeTab === 'users' && <UserManagementModule />}
                {activeTab === 'reports' && <BuildingReportsModule />}
                {activeTab === 'alerts' && <BuildingAlertsModule onNavigateTab={setActiveTab} />}
                {activeTab === 'attendance-salary' && <GenericView title="Attendance & Salary" subtitle="Staff and labor payroll register" icon={CalendarCheck} />}
                {activeTab === 'yearly-archive' && <GenericView title="Yearly Archive" subtitle="Annual building records" icon={Archive} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ERPProvider>
      <RoadERPProvider>
        <AppContent />
      </RoadERPProvider>
    </ERPProvider>
  );
};

export default App;
