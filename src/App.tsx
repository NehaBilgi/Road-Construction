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
import { ProductsMasterModule } from './components/building/ProductsMasterModule';
import StockTransactionsModule from './components/building/StockTransactionsModule';
import { InstallAppButton } from './components/InstallAppButton';
import { ThemeToggle } from './components/ThemeToggle';
import { UserManagementModule } from './components/configuration/UserManagementModule';

import {
  LayoutDashboard, Truck, Fuel, DollarSign, Calculator, HardHat,
  LogOut, Milestone, Users, Package, ArrowLeftRight, FileText,
  Bell, ShoppingCart, Cpu, CalendarCheck, Tag, Archive, Building2,
  X, Plus, Edit2, Trash2, Menu, ChevronDown, Check, CreditCard,
  Download, Search, ArrowDownLeft, ArrowUpRight, Layers, AlertCircle,
  AlertTriangle, TrendingDown, CheckCircle2, ArrowRight
} from 'lucide-react';

// ==========================================
// Storage Keys
// ==========================================
const STORAGE_BUILDING_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_NO_NAME_V1';
const STORAGE_BUILDING_TX_KEY = 'CONSTRUCTION_PRO_BUILDING_TRANSACTIONS_V1';
const STORAGE_BUILDING_CATS_KEY = 'CONSTRUCTION_PRO_BUILDING_CATEGORIES_ISOLATED_V1';
const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';

// ==========================================
// Generic Scaffold View for Remaining Tabs
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
    const handleSync = () => loadReportData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const d = tx.date || '';
      return (!dateRange.from || d >= dateRange.from) && (!dateRange.to || d <= dateRange.to);
    });
  }, [transactions, dateRange]);

  const productAuditReport = useMemo(() => {
    return products.map((prod) => {
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
          <div className="p-8 rounded-2xl bg-[#080C14] border border-[#1E293B] text-center text-slate-500 text-xs">
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
    const handleSync = () => loadData();
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const activeAlerts = useMemo(() => {
    const list: any[] = [];

    products.forEach((p) => {
      const current = Number(p.currentStock || 0);
      const unitCost = Number(p.unitCost || 0);

      const recentOutward = transactions
        .filter((t) => (t.productId === p.id || t.productName === p.category) && t.type === 'STOCK_OUT')
        .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

      if (current === 0) {
        list.push({
          id: `ALT-OOS-${p.id}`,
          productId: p.id,
          title: p.category,
          unit: p.unit,
          currentStock: current,
          severity: 'OUT_OF_STOCK',
          badgeText: 'Depleted (0 Balance)',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          message: `Zero stock remaining on site. Ongoing casting and site operations are at immediate halt risk.`,
          unitCost
        });
      } else if (current <= 20) {
        list.push({
          id: `ALT-LOW-${p.id}`,
          productId: p.id,
          title: p.category,
          unit: p.unit,
          currentStock: current,
          severity: 'CRITICAL',
          badgeText: 'Critical Buffer',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          message: `Only ${current} ${p.unit} remaining in central yard. Minimum buffer threshold breached.`,
          unitCost
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
          message: `${recentOutward} ${p.unit} consumed recently, exceeding current remaining balance (${current} ${p.unit}).`,
          unitCost
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
            <span>Inventory Alerts & Stock Notifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time threshold telemetry tracking stockouts, critical safety buffers, and rapid consumption rates[cite: 13].
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
          className={`p-5 rounded-2xl bg-[#0b1120] border transition-all cursor-pointer shadow-xl ${severityFilter === 'OUT_OF_STOCK' ? 'border-rose-500' : 'border-[#1e293b] hover:border-slate-700'}`}
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
          className={`p-5 rounded-2xl bg-[#0b1120] border transition-all cursor-pointer shadow-xl ${severityFilter === 'CRITICAL' ? 'border-amber-500' : 'border-[#1e293b] hover:border-slate-700'}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Low Stock (≤ 20)</div>
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
          className={`p-5 rounded-2xl bg-[#0b1120] border transition-all cursor-pointer shadow-xl ${severityFilter === 'RAPID_DRAIN' ? 'border-cyan-500' : 'border-[#1e293b] hover:border-slate-700'}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">High Consumption Rate</div>
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
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${severityFilter === 'ALL' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'}`}
          >
            All Alerts ({activeAlerts.length})
          </button>
          <button
            onClick={() => setSeverityFilter('OUT_OF_STOCK')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${severityFilter === 'OUT_OF_STOCK' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'}`}
          >
            Depleted ({oosCount})
          </button>
          <button
            onClick={() => setSeverityFilter('CRITICAL')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${severityFilter === 'CRITICAL' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'}`}
          >
            Critical Low ({criticalCount})
          </button>
          <button
            onClick={() => setSeverityFilter('RAPID_DRAIN')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${severityFilter === 'RAPID_DRAIN' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e293b]'}`}
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
// Building Material Categories & Rates Module
// ==========================================
export interface BuildingCategoryItem {
  id: string;
  name: string;
  classification: string;
  description: string;
  standardRate: number;
  unit: string;
}

const INITIAL_BUILDING_CATEGORIES: BuildingCategoryItem[] = [
  { id: 'BCAT-01', name: 'Cement & Binding Bags', classification: 'Civil & Structural', description: 'OPC 53 Grade, PPC, and white cement bags', standardRate: 385, unit: 'Bags' },
  { id: 'BCAT-02', name: 'Structural Steel (TMT Rebars)', classification: 'Civil & Structural', description: 'Fe550D TMT bars (8mm to 25mm) and GI binding wire', standardRate: 56000, unit: 'Ton' },
  { id: 'BCAT-03', name: 'Aggregates & M-Sand', classification: 'Civil & Structural', description: 'Double-washed M-Sand, Plaster P-Sand, 20mm granite metal', standardRate: 1450, unit: 'Ton' },
  { id: 'BCAT-04', name: 'Brick & Masonry Blocks', classification: 'Masonry & Walls', description: 'Autoclaved aerated concrete (AAC) blocks and red clay bricks', standardRate: 65, unit: 'Nos' },
  { id: 'BCAT-05', name: 'Formwork & Shuttering', classification: 'Hardware & Centering', description: 'Film-faced plywood (12mm) and adjustable steel jack props', standardRate: 1850, unit: 'Nos' },
  { id: 'BCAT-06', name: 'Plumbing & Drainage', classification: 'MEP Services', description: 'CPVC hot/cold pressure pipes and UPVC drainage fittings', standardRate: 420, unit: 'Nos' },
  { id: 'BCAT-07', name: 'Electrical & Conduiting', classification: 'MEP Services', description: 'Rigid PVC electrical conduits (25mm) and FR copper wiring', standardRate: 85, unit: 'Nos' },
  { id: 'BCAT-08', name: 'Waterproofing & Chemicals', classification: 'Finishing & Chemicals', description: 'Integral waterproofing compounds, tile adhesives, and grouts', standardRate: 650, unit: 'Bags' }
];

export const BuildingMaterialCategoriesModule: React.FC = () => {
  const { currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  const [categories, setCategories] = useState<BuildingCategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BUILDING_CATS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BUILDING_CATEGORIES;
    } catch {
      return INITIAL_BUILDING_CATEGORIES;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [classification, setClassification] = useState('Civil & Structural');
  const [description, setDescription] = useState('');
  const [standardRate, setStandardRate] = useState<number | ''>(500);
  const [unit, setUnit] = useState('Nos');

  useEffect(() => {
    localStorage.setItem(STORAGE_BUILDING_CATS_KEY, JSON.stringify(categories));
  }, [categories]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setClassification('Civil & Structural');
    setDescription('');
    setStandardRate(500);
    setUnit('Nos');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: BuildingCategoryItem = {
      id: editingId || `BCAT-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      classification,
      description: description.trim() || 'Building material specification',
      standardRate: Number(standardRate) || 0,
      unit
    };

    if (editingId) {
      setCategories(categories.map((c) => (c.id === editingId ? payload : c)));
    } else {
      setCategories([payload, ...categories]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Delete this building category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-blue-400" />
            <span>Building Material Categories & Rates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage classification taxonomy, benchmark rates, and specifications for building sites[cite: 1, 11].
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Building Category</span>
        </button>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">CATEGORY NAME</th>
                <th className="py-3.5 px-6">CLASSIFICATION</th>
                <th className="py-3.5 px-6">SPECIFICATION / DETAILS</th>
                <th className="py-3.5 px-6 text-right">BENCHMARK RATE</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#121c33]/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-400">{cat.id}</td>
                  <td className="py-4 px-6 font-bold text-white text-xs whitespace-nowrap">{cat.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                      {cat.classification}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-300 min-w-[200px]">{cat.description}</td>
                  <td className="py-4 px-6 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                    ₹{cat.standardRate.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">/ {cat.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setName(cat.name);
                          setClassification(cat.classification);
                          setDescription(cat.description);
                          setStandardRate(cat.standardRate);
                          setUnit(cat.unit);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Building Category' : 'Add Building Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cement & Binding Bags"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Classification *</label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Civil & Structural">Civil & Structural (Steel, Cement, Sand)</option>
                  <option value="Masonry & Walls">Masonry & Walls (AAC Blocks, Bricks)</option>
                  <option value="MEP Services">MEP Services (Plumbing, Conduits)</option>
                  <option value="Hardware & Centering">Hardware & Centering (Props, Formwork)</option>
                  <option value="Finishing & Chemicals">Finishing & Chemicals (Waterproofing, Tiles)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Specification</label>
                <textarea
                  rows={2}
                  placeholder="Standard grades and item inclusions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Benchmark Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={standardRate}
                    onChange={(e) => setStandardRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Bags">Bags</option>
                    <option value="Ton">Ton</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Meter">Meter</option>
                  </select>
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Category' : 'Save Category'}
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
// Road Material Categories & Rates Module
// ==========================================
export interface RoadMaterialCategory {
  id: string;
  name: string;
  description: string;
  standardRate: number;
  unit: string;
}

const INITIAL_ROAD_CATEGORIES: RoadMaterialCategory[] = [
  { id: 'RCAT-01', name: 'Bituminous Macadam (BM)', description: 'Dense bituminous macadam binder course', standardRate: 5000, unit: 'Brass' },
  { id: 'RCAT-02', name: 'Wet Mix Macadam (WMM)', description: 'Crushed stone aggregate base/sub-base layer', standardRate: 4500, unit: 'Brass' },
  { id: 'RCAT-03', name: 'Granular Sub-Base (GSB)', description: 'Coarse graded granular material sub-base', standardRate: 4200, unit: 'Brass' },
  { id: 'RCAT-04', name: 'Dense Bituminous Macadam (DBM)', description: 'Structural layer in flexible pavements', standardRate: 5500, unit: 'Brass' },
  { id: 'RCAT-05', name: 'Bituminous Concrete (BC)', description: 'High quality wearing course finish', standardRate: 6000, unit: 'Brass' }
];

export const RoadMaterialCategoriesModule: React.FC = () => {
  const { currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  const [categories, setCategories] = useState<RoadMaterialCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROAD_CATS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ROAD_CATEGORIES;
    } catch {
      return INITIAL_ROAD_CATEGORIES;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [standardRate, setStandardRate] = useState<number | ''>(5000);
  const [unit, setUnit] = useState('Brass');

  useEffect(() => {
    localStorage.setItem(STORAGE_ROAD_CATS_KEY, JSON.stringify(categories));
  }, [categories]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setStandardRate(5000);
    setUnit('Brass');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: RoadMaterialCategory = {
      id: editingId || `RCAT-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      description: description.trim() || 'Road construction material specification',
      standardRate: Number(standardRate) || 0,
      unit
    };

    if (editingId) {
      setCategories(categories.map((c) => (c.id === editingId ? payload : c)));
    } else {
      setCategories([payload, ...categories]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this road material category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Road Material Categories & Rates</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage standard road aggregate and mix names, specifications, and benchmark rates.
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

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">MATERIAL NAME</th>
                <th className="py-3.5 px-6">SPECIFICATION / DESCRIPTION</th>
                <th className="py-3.5 px-6 text-right">BENCHMARK RATE</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#121c33]/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-400">{cat.id}</td>
                  <td className="py-4 px-6 font-bold text-white text-xs whitespace-nowrap">{cat.name}</td>
                  <td className="py-4 px-6 text-slate-300 min-w-[200px]">{cat.description}</td>
                  <td className="py-4 px-6 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                    ₹{cat.standardRate.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ {cat.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setName(cat.name);
                          setDescription(cat.description);
                          setStandardRate(cat.standardRate);
                          setUnit(cat.unit);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Material Category' : 'Add Road Material Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bituminous Macadam (BM)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Specification</label>
                <textarea
                  rows={2}
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Standard Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={standardRate}
                    onChange={(e) => setStandardRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="Brass">Brass</option>
                    <option value="Ton">Ton</option>
                    <option value="Cu.M">Cu.M</option>
                    <option value="Load">Load</option>
                  </select>
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Category' : 'Save Category'}
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
// Sidebar Component
// ==========================================
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectType?: 'ROAD' | 'BUILDING';
  onSwitchDomain?: () => void;
  isAdminUser?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeStyle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  projectType = 'ROAD',
  onSwitchDomain,
  isAdminUser = false,
  onClose
}) => {
  const { currentUser, logout } = useERP() as any;
  const isBuilding = projectType === 'BUILDING';

  // Dynamic alert count from live local storage
  const [liveAlertCount, setLiveAlertCount] = useState<number>(0);

  useEffect(() => {
    const computeAlertCount = () => {
      try {
        const prodRaw = localStorage.getItem(STORAGE_BUILDING_PRODUCTS_KEY);
        if (!prodRaw) {
          setLiveAlertCount(0);
          return;
        }
        const prods = JSON.parse(prodRaw);
        const count = prods.filter((p: any) => Number(p.currentStock || 0) <= 20).length;
        setLiveAlertCount(count);
      } catch {
        setLiveAlertCount(0);
      }
    };

    computeAlertCount();
    window.addEventListener('storage', computeAlertCount);
    window.addEventListener('focus', computeAlertCount);
    return () => {
      window.removeEventListener('storage', computeAlertCount);
      window.removeEventListener('focus', computeAlertCount);
    };
  }, []);

  const roadOperationsItems: NavItem[] = [
    { id: 'dashboard', label: 'Site Overview', icon: LayoutDashboard },
    { id: 'road-sites', label: 'Ongoing Site', icon: Milestone, badge: 'Sites', badgeStyle: 'bg-blue-900/40 text-blue-300 border border-blue-500/40' },
    { id: 'haulage-trips', label: 'Trips', icon: Truck, badge: 'Trips', badgeStyle: 'bg-[#064E3B] text-[#34D399] border border-[#065F46]' },
    { id: 'vendor-advances', label: 'Vendor Advance', icon: CreditCard, badge: 'Advance', badgeStyle: 'bg-amber-950/80 text-amber-400 border border-amber-800/60' },
    { id: 'diesel', label: 'Diesel', icon: Fuel, badge: 'Diesel', badgeStyle: 'bg-amber-950/60 text-amber-300 border border-amber-800' },
    { id: 'site-expenses', label: 'Site Expense', icon: DollarSign, badge: 'Petty Cash', badgeStyle: 'bg-[#162032] text-blue-400 border border-[#1E293B]' }
  ];

  const roadEngineeringItems: NavItem[] = [
    { id: 'yield_calculator', label: 'Road Trip Calculator', icon: Calculator, badge: 'MoRTH', badgeStyle: 'bg-blue-900/60 text-blue-300 border border-blue-500/40 font-mono' },
    { id: 'machinery_fleet', label: 'Machinery', icon: HardHat }
  ];

  const roadConfigItems: NavItem[] = [
    { id: 'categories', label: 'Categories', icon: Tag, badge: 'Rates', badgeStyle: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' },
    { id: 'users', label: 'User Management', icon: Users, badge: 'RBAC', badgeStyle: 'bg-indigo-900/40 text-indigo-300 border border-indigo-500/40' }
  ];

  const buildingCoreItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'road-sites', label: 'Ongoing Site', icon: Milestone, badge: 'Sites', badgeStyle: 'bg-emerald-950 text-emerald-400 border border-emerald-800' },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight }
  ];

  const buildingAnalysisItems: NavItem[] = [
    { id: 'reports', label: 'Reports', icon: FileText },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: Bell, 
      badge: liveAlertCount > 0 ? liveAlertCount : undefined, 
      badgeStyle: 'bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black' 
    },
    { id: 'reorder-suggestions', label: 'Reorder Suggestions', icon: ShoppingCart },
    { id: 'equipment-register', label: 'Equipment Register', icon: Cpu },
    { id: 'attendance-salary', label: 'Attendance & Salary', icon: CalendarCheck }
  ];

  const buildingConfigItems: NavItem[] = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'yearly-archive', label: 'Yearly Archive', icon: Archive }
  ];

  const renderNavGroup = (title: string | null, items: NavItem[]) => (
    <div className="space-y-1">
      {title && (
        <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8] mb-1">
          {title}
        </div>
      )}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30' : 'text-[#94A3B8] hover:bg-[#162032] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={item.badgeStyle || `text-[9px] px-1.5 py-0.5 rounded font-black ${isActive ? 'bg-white/20 text-white' : 'bg-blue-900/40 text-blue-300 border border-blue-500/40'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <aside className="w-full h-full bg-[#0D111D] border-r border-[#1E293B] flex flex-col justify-between shrink-0 overflow-y-auto select-none font-sans z-30 scrollbar-thin scrollbar-thumb-[#1E293B]">
      <div className="p-3.5 space-y-5">
        <div className="p-3 bg-[#121927] border border-[#1E293B] rounded-2xl flex items-center justify-between shadow-sm relative">
          <div className="flex items-center gap-2.5 overflow-hidden pr-8">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-md ${isBuilding ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
              {isBuilding ? <Building2 className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-white uppercase tracking-wider truncate">CONSTRUCTION PRO</div>
              <div className="text-[10px] text-blue-400 font-mono truncate">
                {isBuilding ? 'Building Construction ERP' : 'Road Construction ERP'}
              </div>
            </div>
          </div>

          {onClose && (
            <button onClick={onClose} className="absolute right-3 lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isBuilding ? (
          <>
            {renderNavGroup(null, buildingCoreItems)}
            {renderNavGroup('ANALYSIS', buildingAnalysisItems)}
            {renderNavGroup('CONFIGURATION', buildingConfigItems)}
          </>
        ) : (
          <>
            {renderNavGroup('SITE OPERATIONS', roadOperationsItems)}
            {renderNavGroup('ENGINEERING', roadEngineeringItems)}
            {renderNavGroup('CONFIGURATION', roadConfigItems)}
          </>
        )}
      </div>

      <div className="p-3 border-t border-[#1E293B] bg-[#080C14] space-y-2 sticky bottom-0 z-10">
        {isAdminUser && onSwitchDomain && (
          <button
            onClick={() => {
              onSwitchDomain();
              if (onClose) onClose();
            }}
            className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <span>Switch to {isBuilding ? 'Road Construction' : 'Building Construction'}</span>
          </button>
        )}

        <div className="p-2 rounded-xl bg-[#121927] border border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
              {currentUser?.fullName?.charAt(0).toUpperCase() || currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{currentUser?.fullName || currentUser?.name || 'User'}</div>
              <div className="text-[10px] text-[#94A3B8] truncate">{currentUser?.role || 'SUPER_ADMIN'}</div>
            </div>
          </div>
          <button onClick={logout} title="Logout" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#162032] transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

// ==========================================
// Main Application Router
// ==========================================
export const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    selectedSiteId,
    setSelectedSiteId,
    siteSheets,
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

            {/* BUILDING Construction Tabs (Isolated) */}
            {activeDomain === 'BUILDING' && (
              <>
                {activeTab === 'products' && <ProductsMasterModule />}
                {activeTab === 'transactions' && <StockTransactionsModule />}
                {activeTab === 'categories' && <BuildingMaterialCategoriesModule />}
                {activeTab === 'reports' && <BuildingReportsModule />}
                {activeTab === 'alerts' && <BuildingAlertsModule onNavigateTab={setActiveTab} />}
                {activeTab === 'users' && <UserManagementModule />}

                {/* Scaffolding for remaining pending tabs */}
                {activeTab === 'reorder-suggestions' && <GenericView title="Reorder Suggestions" subtitle="Automated purchase order recommendations" icon={ShoppingCart} />}
                {activeTab === 'equipment-register' && <GenericView title="Equipment Register" subtitle="Centering plates, props, and batching plant logs" icon={Cpu} />}
                {activeTab === 'attendance-salary' && <GenericView title="Attendance & Salary" subtitle="Site labor muster roll and payroll disbursements" icon={CalendarCheck} />}
                {activeTab === 'yearly-archive' && <GenericView title="Yearly Archive" subtitle="Annual building records & financial closings" icon={Archive} />}
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
