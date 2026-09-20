import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
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
  Bell, CalendarCheck, Tag, Archive, Building2,
  X, Plus, Edit2, Trash2, Menu, ChevronDown, Check, CreditCard,
  Download, Search, ArrowDownLeft, ArrowUpRight, Layers, AlertCircle,
  AlertTriangle, TrendingDown, CheckCircle2, ArrowRight, RotateCcw
} from 'lucide-react';

// ==========================================
// Error Boundary (Prevents Blank Screen)
// ==========================================
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  errorText: string;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorText: error.message || 'Unknown runtime error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white">Dashboard Encountered an Error</h1>
          <p className="text-xs text-slate-400 max-w-md font-mono bg-[#121927] p-3 rounded-xl border border-[#1E293B]">
            {this.state.errorText}
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30"
          >
            <RotateCcw className="w-4 h-4" /> Reset Session & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
// Building Reports Module
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

  const filteredProducts = productAuditReport.filter((p) =>
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-100">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Stock Value</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            ₹{totalHoldingValuation.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consumed at Site</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-2">
            ₹{totalConsumedExpenditure.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e293b] shadow-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inward Deliveries</div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-2">
            ₹{totalInwardProcurement.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">CATEGORY</th>
                <th className="py-3.5 px-5 text-right">UNIT RATE</th>
                <th className="py-3.5 px-5 text-right">INWARD</th>
                <th className="py-3.5 px-5 text-right">CONSUMED</th>
                <th className="py-3.5 px-5 text-right">BALANCE</th>
                <th className="py-3.5 px-5 text-right">HOLDING (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No products recorded yet.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-400">{p.id}</td>
                    <td className="py-3.5 px-5 font-bold text-white">{p.category}</td>
                    <td className="py-3.5 px-5 text-right font-mono">₹{p.unitCost}</td>
                    <td className="py-3.5 px-5 text-right text-blue-400 font-mono">+{p.totalInwardQty}</td>
                    <td className="py-3.5 px-5 text-right text-rose-400 font-mono">-{p.totalOutwardQty}</td>
                    <td className="py-3.5 px-5 text-right text-cyan-400 font-mono font-bold">{p.currentStock} {p.unit}</td>
                    <td className="py-3.5 px-5 text-right text-emerald-400 font-mono font-bold">₹{p.holdingValue.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Building Alerts Module
// ==========================================
export const BuildingAlertsModule: React.FC<{ onNavigateTab: (tabId: string) => void }> = ({ onNavigateTab }) => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    try {
      const prodRaw = localStorage.getItem(STORAGE_BUILDING_PRODUCTS_KEY);
      if (prodRaw) setProducts(JSON.parse(prodRaw));
    } catch {}
  }, []);

  const lowStock = (products || []).filter((p) => Number(p.currentStock || 0) <= 20);

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-rose-500" />
            <span>Inventory Alerts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Critical material buffer levels.</p>
        </div>
        <button
          onClick={() => onNavigateTab('products')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          View Products
        </button>
      </div>

      <div className="space-y-3">
        {lowStock.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#0b1120] border border-[#1e293b] text-center text-slate-400 text-xs">
            All inventory levels are healthy.
          </div>
        ) : (
          lowStock.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-[#0b1120] border border-rose-900/40 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">{p.category}</div>
                <div className="text-[10px] text-rose-400">Remaining stock: {p.currentStock} {p.unit}</div>
              </div>
              <button
                onClick={() => onNavigateTab('products')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                Restock
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==========================================
// Building Material Categories Module (Add, Edit, Delete)
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
            Manage category benchmark costs, measurement units, and catalog types[cite: 1, 11].
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

// ==========================================
// Road Material Categories & Rates Module (Add, Edit, Delete)
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

  const handleOpenEdit = (item: RoadMaterialCategory) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
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
            ? { ...c, name: name.trim(), description: description.trim(), standardRate: rateNum, unit }
            : c
        )
      );
    } else {
      const newCategory: RoadMaterialCategory = {
        id: `RCAT-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        description: description.trim() || 'Road construction material specification',
        standardRate: rateNum,
        unit
      };
      setCategories((prev) => [...prev, newCategory]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-amber-400" />
            <span>Road Material Categories & Rates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage standard road aggregate and mix names, specifications, and benchmark rates[cite: 5].
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

      {/* Categories Cards List */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-5 shadow-2xl space-y-3">
        {categories.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No road material categories added yet. Click "+ Add Material Category" to get started.
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {c.name}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    ({c.id})
                  </span>
                </div>
                {c.description && (
                  <p className="text-[11px] text-slate-400">{c.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-[#1e293b]/60 pt-2 sm:pt-0">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingId ? 'Edit Road Category' : 'Add Road Material Category'}
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
                  Material Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bituminous Macadam (BM)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Description / Specification
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Binder layer mix specification..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
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
                    <option value="Brass">Brass</option>
                    <option value="Ton">Ton</option>
                    <option value="Cu.M">Cu.M</option>
                    <option value="Load">Load</option>
                    <option value="Nos">Nos</option>
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
// Header Component
// ==========================================
interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { selectedSiteId, setSelectedSiteId, siteSheets = [], logout } = useERP() as any;
  const [isSiteOpen, setIsSiteOpen] = useState(false);
  
  const safeSiteSheets = Array.isArray(siteSheets) ? siteSheets : [];
  const currentSiteSheet = safeSiteSheets.find((s: any) => s?.siteId === selectedSiteId || s?.id === selectedSiteId) || safeSiteSheets[0];

  return (
    <header className="h-14 bg-[#080C14] border-b border-[#1E293B] flex items-center justify-between px-3 sm:px-4 text-xs select-none font-sans z-40 relative">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onToggleSidebar && onToggleSidebar()}
          className="p-2 lg:hidden rounded-xl bg-[#121927] hover:bg-[#162032] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsSiteOpen(!isSiteOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#121927] hover:bg-[#162032] border border-[#1E293B] rounded-xl text-white font-bold text-xs cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-mono text-blue-400 truncate max-w-[120px] sm:max-w-[200px]">
              {currentSiteSheet?.siteName || currentSiteSheet?.name || 'Selected Site'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          </button>

          {isSiteOpen && safeSiteSheets.length > 0 && (
            <div className="absolute left-0 mt-2 w-64 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50">
              {safeSiteSheets.map((s: any) => (
                <button
                  key={s.siteId || s.id}
                  onClick={() => {
                    setSelectedSiteId(s.siteId || s.id);
                    setIsSiteOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-[#162032] text-white flex justify-between"
                >
                  <span>{s.siteName || s.name}</span>
                  {(s.siteId || s.id) === selectedSiteId && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <InstallAppButton />
        <ThemeToggle />
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to log out?')) logout();
          }}
          className="px-2.5 py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline text-[11px] font-semibold">Logout</span>
        </button>
      </div>
    </header>
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

  const buildingCoreItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'road-sites', label: 'Ongoing Site', icon: Milestone, badge: 'Sites' },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight }
  ];

  const buildingAnalysisItems = [
    { id: 'reports', label: 'Reports', icon: FileText },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: Bell, 
      badge: liveAlertCount > 0 ? liveAlertCount : undefined 
    },
    { id: 'attendance-salary', label: 'Attendance & Salary', icon: CalendarCheck }
  ];

  const buildingConfigItems = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'yearly-archive', label: 'Yearly Archive', icon: Archive }
  ];

  const roadOperationsItems = [
    { id: 'dashboard', label: 'Site Overview', icon: LayoutDashboard },
    { id: 'road-sites', label: 'Ongoing Site', icon: Milestone },
    { id: 'haulage-trips', label: 'Trips', icon: Truck },
    { id: 'vendor-advances', label: 'Vendor Advance', icon: CreditCard },
    { id: 'diesel', label: 'Diesel', icon: Fuel },
    { id: 'site-expenses', label: 'Site Expense', icon: DollarSign }
  ];

  const roadEngineeringItems = [
    { id: 'yield_calculator', label: 'Road Trip Calculator', icon: Calculator },
    { id: 'machinery_fleet', label: 'Machinery', icon: HardHat }
  ];

  const roadConfigItems = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'users', label: 'User Management', icon: Users }
  ];

  const renderNav = (items: any[], title?: string) => (
    <div className="space-y-1 mb-4">
      {title && <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8] mb-1">{title}</div>}
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              isActive ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30' : 'text-[#94A3B8] hover:bg-[#162032] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                item.id === 'alerts'
                  ? 'bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center'
                  : 'bg-blue-900/40 text-blue-300'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="w-full h-full bg-[#0D111D] border-r border-[#1E293B] flex flex-col justify-between overflow-y-auto font-sans p-3">
      <div>
        <div className="p-3 bg-[#121927] border border-[#1E293B] rounded-2xl flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-black text-white">CONSTRUCTION PRO</div>
              <div className="text-[10px] text-blue-400 font-mono">{isBuilding ? 'Building ERP' : 'Road ERP'}</div>
            </div>
          </div>
        </div>

        {isBuilding ? (
          <>
            {renderNav(buildingCoreItems)}
            {renderNav(buildingAnalysisItems, 'ANALYSIS')}
            {renderNav(buildingConfigItems, 'CONFIGURATION')}
          </>
        ) : (
          <>
            {renderNav(roadOperationsItems, 'SITE OPERATIONS')}
            {renderNav(roadEngineeringItems, 'ENGINEERING')}
            {renderNav(roadConfigItems, 'CONFIGURATION')}
          </>
        )}
      </div>

      <div className="pt-2 border-t border-[#1E293B]">
        {isAdminUser && onSwitchDomain && (
          <button
            onClick={onSwitchDomain}
            className="w-full py-2 px-3 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
          >
            Switch to {isBuilding ? 'Road' : 'Building'}
          </button>
        )}
        <button
          onClick={logout}
          className="w-full py-2 px-3 bg-[#121927] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
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
    siteSheets = [],
    currentUser,
    userRole,
    appDomain,
    setAppDomain
  } = useERP() as any;

  const currentRoleStr = String(userRole || currentUser?.role || '').toUpperCase();
  const isAdmin = currentRoleStr.includes('ADMIN');
  const userScope = currentUser?.allowedScope || 'ROAD_ONLY';

  const [projectType, setProjectType] = useState<'ROAD' | 'BUILDING' | null>(() => {
    if (!isAdmin) return userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD';
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

  const safeSiteSheets = Array.isArray(siteSheets) ? siteSheets : [];
  const activeDomain = projectType || (userScope === 'BUILDING_ONLY' ? 'BUILDING' : 'ROAD');

  if (!isAuthenticated) return <LoginPage />;

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

  if (!hasSelectedSite || !selectedSiteId || safeSiteSheets.length === 0) {
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
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="flex flex-1 relative h-[calc(100vh-56px)] overflow-hidden">
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

        <main className="flex-1 w-full min-w-0 p-6 overflow-y-auto max-h-[calc(100vh-56px)]">
          <div className="max-w-7xl mx-auto pb-12 w-full">
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
    <AppErrorBoundary>
      <ERPProvider>
        <RoadERPProvider>
          <AppContent />
        </RoadERPProvider>
      </ERPProvider>
    </AppErrorBoundary>
  );
};

export default App;
