import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  ArrowRight,
  Package,
  CheckCircle2,
  RefreshCw,
  Search,
  ShoppingCart,
  ArrowUpRight
} from 'lucide-react';

const STORAGE_BUILDING_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_NO_NAME_V1';
const STORAGE_BUILDING_TX_KEY = 'CONSTRUCTION_PRO_BUILDING_TRANSACTIONS_V1';

interface Props {
  onNavigateTab: (tabId: string) => void;
}

export const BuildingAlertsModule: React.FC<Props> = ({ onNavigateTab }) => {
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

  // Compute Alerts dynamically based on live stock & transactions
  const activeAlerts = useMemo(() => {
    const list: any[] = [];

    products.forEach((p) => {
      const current = Number(p.currentStock || 0);
      const unitCost = Number(p.unitCost || 0);

      // Recent Outward movement count & quantity
      const recentOutward = transactions
        .filter((t) => (t.productId === p.id || t.productName === p.category) && t.type === 'STOCK_OUT')
        .reduce((sum, t) => sum + Number(t.quantity || 0), 0);

      // Alert Type 1: Out of Stock (0 units)
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
          actionNote: 'Immediate Procurement PO Required',
          unitCost
        });
      }
      // Alert Type 2: Critical Low Stock (<= 20 units)
      else if (current <= 20) {
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
          actionNote: 'Order Reorder Batch',
          unitCost
        });
      }
      // Alert Type 3: High Outward Velocity (Outward > Current Stock)
      else if (recentOutward > current) {
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
          actionNote: 'Review Contractor Indents',
          unitCost
        });
      }
    });

    return list;
  }, [products, transactions]);

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return activeAlerts.filter((alt) => {
      const matchSeverity = severityFilter === 'ALL' || alt.severity === severityFilter;
      const matchSearch =
        alt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alt.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchSearch;
    });
  }, [activeAlerts, severityFilter, searchQuery]);

  // Counts for metric cards
  const oosCount = activeAlerts.filter((a) => a.severity === 'OUT_OF_STOCK').length;
  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const rapidDrainCount = activeAlerts.filter((a) => a.severity === 'RAPID_DRAIN').length;

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
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
            Real-time threshold telemetry tracking stockouts, critical safety buffers, and rapid consumption rates.
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

      {/* 3 Metric Overview Cards */}
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

      {/* Filter and Search Bar */}
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

      {/* Alerts Feed List */}
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

              {/* Status and Direct Shortcut */}
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

export default BuildingAlertsModule;
