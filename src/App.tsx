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
  ChevronLeft, ChevronRight, FileSpreadsheet, Paperclip, Upload, RotateCcw, AlertTriangle
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
const STORAGE_STAFF_KEY = 'CONSTRUCTION_PRO_BUILDING_STAFF_V1';
const STORAGE_LABOUR_HEADCOUNT_KEY = 'CONSTRUCTION_PRO_BUILDING_LABOUR_HEADCOUNT_V1';

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
  const [searchQuery] = useState('');
  const [dateRange] = useState({
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-amber-400" />
            <span>Road Material Categories & Rates</span>
          </h1>
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
// Attendance & Payroll Module
// ==========================================
export interface BuildingEmployee {
  id: string;
  name: string;
  type: 'Employee' | 'Non-Employee';
  department: string;
  role: string;
  perDayAmount: number;
  monthlyBase: number;
  dateOfJoining: string;
  status: 'Active' | 'Inactive';
  advancesGiven: number;
  advancesDeducted: number;
  attendance: Record<number, 'P' | 'A' | 'H' | 'L' | 'O'>;
  attachedFiles?: { name: string; url: string; date: string }[];
}

export interface DailyLabourHeadcount {
  id: string;
  date: string;
  contractorOrGang: string;
  trade: string;
  presentCount: number;
  absentCount: number;
  dailyRate: number;
  remarks?: string;
  attachedFile?: string;
}

const INITIAL_STAFF: BuildingEmployee[] = [
  {
    id: 'EMP-01',
    name: 'Hassansab',
    type: 'Employee',
    department: 'Crusher',
    role: 'Staff',
    perDayAmount: 300,
    monthlyBase: 11000,
    dateOfJoining: '2026-07-01',
    status: 'Active',
    advancesGiven: 0,
    advancesDeducted: 0,
    attendance: {
      1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'P', 6: 'P', 7: 'P', 8: 'P',
      9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'A', 15: 'P',
      16: 'P', 17: 'P', 18: 'O', 19: 'O', 20: 'O'
    },
    attachedFiles: []
  },
  {
    id: 'EMP-02',
    name: 'Imamsab',
    type: 'Employee',
    department: 'Crusher',
    role: 'Staff',
    perDayAmount: 300,
    monthlyBase: 11000,
    dateOfJoining: '2026-06-15',
    status: 'Active',
    advancesGiven: 2000,
    advancesDeducted: 1000,
    attendance: {
      1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'P',
      9: 'P', 10: 'P', 11: 'P', 12: 'P', 13: 'P', 14: 'P', 15: 'P',
      16: 'P', 17: 'P', 18: 'O', 19: 'O', 20: 'P'
    },
    attachedFiles: []
  }
];

const INITIAL_LABOUR: DailyLabourHeadcount[] = [
  {
    id: 'LBR-01',
    date: '2026-09-20',
    contractorOrGang: 'Ansari Mason Gang',
    trade: 'Masons & Helpers',
    presentCount: 14,
    absentCount: 2,
    dailyRate: 750,
    remarks: 'Cast 3rd floor slab & boundary wall'
  }
];

export const AttendancePayrollModule: React.FC = () => {
  const [employees, setEmployees] = useState<BuildingEmployee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STAFF_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [labourHeadcounts, setLabourHeadcounts] = useState<DailyLabourHeadcount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LABOUR_HEADCOUNT_KEY);
      return saved ? JSON.parse(saved) : INITIAL_LABOUR;
    } catch {
      return INITIAL_LABOUR;
    }
  });

  const [activeTab, setActiveTab] = useState<'GRID' | 'LABOUR_HEADCOUNT' | 'PAYROLL' | 'REGISTER'>('GRID');
  const [payType, setPayType] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [selectedMonth] = useState('September 2026');
  const [employeeFilter, setEmployeeFilter] = useState('All Employees');
  const [payrollDateFrom, setPayrollDateFrom] = useState('2026-09-13');
  const [payrollDateTo, setPayrollDateTo] = useState('2026-09-20');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLabourModalOpen, setIsLabourModalOpen] = useState(false);
  const [drawerEmployee, setDrawerEmployee] = useState<BuildingEmployee | null>(null);
  const [activePopover, setActivePopover] = useState<{ empId: string; day: number } | null>(null);

  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [empType, setEmpType] = useState<'Employee' | 'Non-Employee'>('Employee');
  const [department, setDepartment] = useState('Crusher');
  const [role, setRole] = useState('Staff');
  const [perDayAmount, setPerDayAmount] = useState<number | ''>(300);
  const [monthlyBase, setMonthlyBase] = useState<number | ''>(11000);
  const [dateOfJoining, setDateOfJoining] = useState('2026-09-20');
  const [empStatus, setEmpStatus] = useState<'Active' | 'Inactive'>('Active');

  const [labourDate, setLabourDate] = useState('2026-09-20');
  const [contractorName, setContractorName] = useState('');
  const [labourTrade, setLabourTrade] = useState('Masons & Helpers');
  const [presentLabours, setPresentLabours] = useState<number | ''>(10);
  const [absentLabours, setAbsentLabours] = useState<number | ''>(1);
  const [dailyRate, setDailyRate] = useState<number | ''>(750);
  const [labourRemarks, setLabourRemarks] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LABOUR_HEADCOUNT_KEY, JSON.stringify(labourHeadcounts));
  }, [labourHeadcounts]);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const setDayStatus = (empId: string, day: number, status: 'P' | 'A' | 'H' | 'L' | 'O' | 'CLEAR') => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const updatedAtt = { ...emp.attendance };
        if (status === 'CLEAR') {
          delete updatedAtt[day];
        } else {
          updatedAtt[day] = status;
        }
        return { ...emp, attendance: updatedAtt };
      })
    );
    setActivePopover(null);
  };

  const filteredEmployees = employees.filter((emp) => {
    if (employeeFilter === 'All Employees') return true;
    return emp.name.toLowerCase() === employeeFilter.toLowerCase();
  });

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    if (editingEmpId) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmpId
            ? {
                ...emp,
                name: fullName.trim(),
                type: empType,
                department: department.trim() || 'General',
                role: role.trim() || 'Staff',
                perDayAmount: Number(perDayAmount) || 0,
                monthlyBase: Number(monthlyBase) || 0,
                dateOfJoining,
                status: empStatus
              }
            : emp
        )
      );
    } else {
      const newEmp: BuildingEmployee = {
        id: `EMP-${Date.now().toString().slice(-4)}`,
        name: fullName.trim(),
        type: empType,
        department: department.trim() || 'General',
        role: role.trim() || 'Staff',
        perDayAmount: Number(perDayAmount) || 0,
        monthlyBase: Number(monthlyBase) || 0,
        dateOfJoining,
        status: empStatus,
        advancesGiven: 0,
        advancesDeducted: 0,
        attendance: {},
        attachedFiles: []
      };
      setEmployees([...employees, newEmp]);
    }

    setIsAddModalOpen(false);
    setEditingEmpId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!drawerEmployee || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const newFile = {
      name: file.name,
      url: URL.createObjectURL(file),
      date: new Date().toISOString().split('T')[0]
    };

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === drawerEmployee.id
          ? { ...emp, attachedFiles: [...(emp.attachedFiles || []), newFile] }
          : emp
      )
    );
    setDrawerEmployee({
      ...drawerEmployee,
      attachedFiles: [...(drawerEmployee.attachedFiles || []), newFile]
    });
  };

  const handleSaveLabourHeadcount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorName.trim()) return;

    const newRecord: DailyLabourHeadcount = {
      id: `LBR-${Date.now().toString().slice(-4)}`,
      date: labourDate,
      contractorOrGang: contractorName.trim(),
      trade: labourTrade,
      presentCount: Number(presentLabours) || 0,
      absentCount: Number(absentLabours) || 0,
      dailyRate: Number(dailyRate) || 0,
      remarks: labourRemarks.trim() || undefined,
      attachedFile: attachedFileName || undefined
    };

    setLabourHeadcounts([newRecord, ...labourHeadcounts]);
    setIsLabourModalOpen(false);
    setContractorName('');
    setLabourRemarks('');
    setAttachedFileName('');
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 relative">
      <div className="text-xs text-slate-400">
        Track attendance, salary payouts, and advance ledgers
      </div>

      <div className="p-3.5 rounded-2xl bg-[#0c1427] border border-[#182643] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#070c18] border border-[#1e293b] rounded-xl px-2.5 py-1.5 font-bold text-slate-200">
            <ChevronLeft onClick={() => {}} className="w-4 h-4 cursor-pointer hover:text-white" />
            <span className="px-3 text-white">{selectedMonth}</span>
            <ChevronRight onClick={() => {}} className="w-4 h-4 cursor-pointer hover:text-white" />
          </div>

          <div className="flex items-center bg-[#070c18] border border-[#1e293b] p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('GRID')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'GRID' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Attendance Grid
            </button>
            <button
              onClick={() => setActiveTab('LABOUR_HEADCOUNT')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'LABOUR_HEADCOUNT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Labour Headcount ({labourHeadcounts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('PAYROLL')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'PAYROLL' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Payroll Summary
            </button>
            <button
              onClick={() => setActiveTab('REGISTER')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'REGISTER' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Employees Register
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'GRID' && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#070c18] border border-[#1e293b] rounded-xl text-white outline-none cursor-pointer font-bold"
            >
              <option value="All Employees">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setEditingEmpId(null);
              setFullName('');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>

          <button
            onClick={() => setIsLabourModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Users className="w-4 h-4" />
            <span>+ Log Labour Count</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {activeTab === 'GRID' && (
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-visible shadow-2xl relative">
          <div className="overflow-x-auto pb-10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/90">
                  <th className="py-3.5 px-4 min-w-[180px]">EMPLOYEE DETAILS</th>
                  {daysInMonth.map((d) => (
                    <th key={d} className="py-3.5 px-1 text-center font-mono w-7">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#121c33]/50 transition-colors relative">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{emp.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {emp.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{emp.department}</div>
                    </td>
                    {daysInMonth.map((d) => {
                      const status = emp.attendance[d] || 'P';
                      const isPopoverOpen = activePopover?.empId === emp.id && activePopover?.day === d;

                      const statusColors: Record<string, string> = {
                        P: 'text-emerald-400 font-black',
                        A: 'text-rose-400 bg-rose-950/40 font-black',
                        H: 'text-amber-400 font-bold',
                        L: 'text-blue-400 font-bold',
                        O: 'text-purple-400 font-bold'
                      };

                      return (
                        <td key={d} className="py-2.5 px-0.5 text-center font-mono text-[11px] relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActivePopover(isPopoverOpen ? null : { empId: emp.id, day: d })
                            }
                            className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                              statusColors[status] || 'text-slate-600'
                            }`}
                          >
                            {status}
                          </button>

                          {isPopoverOpen && (
                            <div className="fixed sm:absolute z-50 mt-1 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 w-44 bg-[#0d1322] border border-[#2b3a58] rounded-2xl shadow-2xl p-1.5 space-y-1 text-left text-xs">
                              <button
                                onClick={() => setDayStatus(emp.id, d, 'P')}
                                className="w-full px-3 py-1.5 rounded-xl hover:bg-slate-800 text-emerald-400 font-bold flex items-center justify-between cursor-pointer"
                              >
                                <span>Present</span>
                                <span className="font-mono text-[10px]">(P)</span>
                              </button>
                              <button
                                onClick={() => setDayStatus(emp.id, d, 'A')}
                                className="w-full px-3 py-1.5 rounded-xl hover:bg-slate-800 text-rose-400 font-bold flex items-center justify-between cursor-pointer"
                              >
                                <span>Absent</span>
                                <span className="font-mono text-[10px]">(A)</span>
                              </button>
                              <button
                                onClick={() => setDayStatus(emp.id, d, 'H')}
                                className="w-full px-3 py-1.5 rounded-xl hover:bg-slate-800 text-amber-400 font-bold flex items-center justify-between cursor-pointer"
                              >
                                <span>Half Day</span>
                                <span className="font-mono text-[10px]">(H)</span>
                              </button>
                              <button
                                onClick={() => setDayStatus(emp.id, d, 'L')}
                                className="w-full px-3 py-1.5 rounded-xl hover:bg-slate-800 text-blue-400 font-bold flex items-center justify-between cursor-pointer"
                              >
                                <span>Leave</span>
                                <span className="font-mono text-[10px]">(L)</span>
                              </button>
                              <button
                                onClick={() => setDayStatus(emp.id, d, 'O')}
                                className="w-full px-3 py-1.5 rounded-xl hover:bg-slate-800 text-purple-400 font-bold flex items-center justify-between cursor-pointer"
                              >
                                <span>Holiday/Off</span>
                                <span className="font-mono text-[10px]">(0)</span>
                              </button>
                              <div className="border-t border-[#1e293b] pt-1">
                                <button
                                  onClick={() => setDayStatus(emp.id, d, 'CLEAR')}
                                  className="w-full px-3 py-1.5 rounded-xl hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 font-medium text-center cursor-pointer"
                                >
                                  Clear Status
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LABOUR_HEADCOUNT' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0b1120] border border-[#1e293b]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Labours Logged</div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {labourHeadcounts.reduce((sum, l) => sum + l.presentCount, 0)} Present
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b1120] border border-[#1e293b]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Absent Labours</div>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                {labourHeadcounts.reduce((sum, l) => sum + l.absentCount, 0)} Absent
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0b1120] border border-[#1e293b]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Estimated Wage Liability</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                ₹{labourHeadcounts.reduce((sum, l) => sum + (l.presentCount * l.dailyRate), 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80">
                  <th className="py-3 px-4">DATE & ID</th>
                  <th className="py-3 px-4">CONTRACTOR / GANG</th>
                  <th className="py-3 px-4">TRADE</th>
                  <th className="py-3 px-4 text-center text-emerald-400">PRESENT</th>
                  <th className="py-3 px-4 text-center text-rose-400">ABSENT</th>
                  <th className="py-3 px-4 text-right">DAILY RATE</th>
                  <th className="py-3 px-4 text-right text-emerald-400">TOTAL PAYOUT</th>
                  <th className="py-3 px-4">ATTACHED FILE</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
                {labourHeadcounts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No labour headcounts recorded. Click "+ Log Labour Count" to start.
                    </td>
                  </tr>
                ) : (
                  labourHeadcounts.map((lbr) => (
                    <tr key={lbr.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">
                        <div>{lbr.date}</div>
                        <div className="text-[10px] text-slate-500">{lbr.id}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{lbr.contractorOrGang}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-blue-300 border border-slate-700 font-medium">
                          {lbr.trade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400 text-sm">
                        {lbr.presentCount}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-400 text-sm">
                        {lbr.absentCount}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">₹{lbr.dailyRate}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-400">
                        ₹{(lbr.presentCount * lbr.dailyRate).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        {lbr.attachedFile ? (
                          <span className="flex items-center gap-1 text-[11px] text-blue-400 underline font-mono">
                            <Paperclip className="w-3 h-3" />
                            <span>{lbr.attachedFile}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this headcount record?')) {
                              setLabourHeadcounts(labourHeadcounts.filter((l) => l.id !== lbr.id));
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PAYROLL' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-[#070c18] border border-[#1e293b] p-1 rounded-xl gap-1">
                <span className="px-3 text-xs text-slate-400 font-bold">Pay Type:</span>
                <button
                  onClick={() => setPayType('WEEKLY')}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    payType === 'WEEKLY' ? 'bg-[#2563EB] text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1. Weekly
                </button>
                <button
                  onClick={() => setPayType('MONTHLY')}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    payType === 'MONTHLY' ? 'bg-[#2563EB] text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2. Monthly
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs bg-[#070c18] border border-[#1e293b] px-3 py-1.5 rounded-xl">
                <span className="text-slate-400 font-bold">From:</span>
                <input
                  type="date"
                  value={payrollDateFrom}
                  onChange={(e) => setPayrollDateFrom(e.target.value)}
                  className="bg-transparent text-white font-mono outline-none"
                />
                <span className="text-slate-400 font-bold">To:</span>
                <input
                  type="date"
                  value={payrollDateTo}
                  onChange={(e) => setPayrollDateTo(e.target.value)}
                  className="bg-transparent text-white font-mono outline-none"
                />
              </div>
            </div>

            <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export to Tally</span>
            </button>
          </div>

          <div className="p-3.5 bg-amber-950/25 border border-amber-800/50 rounded-2xl text-amber-300 text-xs font-medium">
            <strong>Weekly formula:</strong> (Days Present × Per Day Rate) + Extra – Advance. Holidays (O), Leave (L) and Absent (A) are all treated as unpaid.
          </div>

          <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/90">
                  <th className="py-3.5 px-5">EMPLOYEE NAME</th>
                  <th className="py-3.5 px-4 text-center">DAYS PRESENT</th>
                  {payType === 'MONTHLY' && <th className="py-3.5 px-4 text-center text-rose-400">DAYS ABSENT</th>}
                  <th className="py-3.5 px-4 text-center">PER DAY AMT</th>
                  {payType === 'WEEKLY' && <th className="py-3.5 px-4 text-center text-amber-400">EXTRA ★</th>}
                  <th className="py-3.5 px-4 text-center">DEDUCT ADV.</th>
                  <th className="py-3.5 px-4 text-center text-emerald-400">NET PAYOUT</th>
                  <th className="py-3.5 px-5 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
                {employees.map((emp) => {
                  const pDays = Object.values(emp.attendance).filter((v) => v === 'P').length || 5;
                  const hDays = Object.values(emp.attendance).filter((v) => v === 'H').length;
                  const aDays = Object.values(emp.attendance).filter((v) => v === 'A').length || 2;
                  const effectivePresent = pDays + (hDays * 0.5);

                  const netWeekly = Math.max(0, (effectivePresent * emp.perDayAmount) - emp.advancesDeducted);
                  const netMonthly = Math.max(0, Math.round(((effectivePresent + 2) / 31) * emp.monthlyBase) - emp.advancesDeducted);

                  return (
                    <tr key={emp.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-4 px-5 font-bold text-white text-sm">{emp.name}</td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-emerald-400 text-sm">
                        {effectivePresent}
                      </td>
                      {payType === 'MONTHLY' && (
                        <td className="py-4 px-4 text-center font-mono font-bold text-rose-400 text-sm">{aDays}</td>
                      )}
                      <td className="py-4 px-4 text-center font-mono text-slate-300">
                        ₹{payType === 'WEEKLY' ? emp.perDayAmount : emp.monthlyBase.toLocaleString('en-IN')}
                      </td>
                      {payType === 'WEEKLY' && (
                        <td className="py-4 px-4 text-center">
                          <input
                            type="number"
                            defaultValue={0}
                            className="w-20 px-2.5 py-1.5 bg-[#162032] border border-[#1E293B] rounded-xl text-center font-mono outline-none text-white"
                          />
                        </td>
                      )}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="number"
                          value={emp.advancesDeducted}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setEmployees((prev) =>
                              prev.map((item) => (item.id === emp.id ? { ...item, advancesDeducted: val } : item))
                            );
                          }}
                          className="w-24 px-2.5 py-1.5 bg-[#162032] border border-[#1E293B] rounded-xl text-center font-mono outline-none text-white"
                        />
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          Bal: ₹{emp.advancesGiven - emp.advancesDeducted}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-black text-emerald-400 text-base">
                        ₹{(payType === 'WEEKLY' ? netWeekly : netMonthly).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => alert(`Confirmed payout for ${emp.name}`)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-700/60 font-bold text-xs hover:bg-emerald-950 cursor-pointer"
                        >
                          ✓ Confirm
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'REGISTER' && (
        <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/90">
                <th className="py-3.5 px-5">EMPLOYEE</th>
                <th className="py-3.5 px-5">ROLE / DEPT</th>
                <th className="py-3.5 px-5 text-center">ADVANCES GIVEN</th>
                <th className="py-3.5 px-5 text-center">DEDUCTED</th>
                <th className="py-3.5 px-5 text-center">OUTSTANDING</th>
                <th className="py-3.5 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {employees.map((emp) => {
                const outstanding = emp.advancesGiven - emp.advancesDeducted;
                return (
                  <tr key={emp.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-sm">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">Joined: {emp.dateOfJoining}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-white">{emp.role}</div>
                      <div className="text-[11px] text-slate-400">{emp.department}</div>
                    </td>
                    <td className="py-4 px-5 text-center font-mono font-bold text-amber-400 text-sm">
                      ₹{emp.advancesGiven.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 text-center font-mono font-bold text-emerald-400 text-sm">
                      ₹{emp.advancesDeducted.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-4 px-5 text-center font-mono font-bold text-sm ${outstanding > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      ₹{outstanding.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setDrawerEmployee(emp)}
                        className="px-4 py-1.5 rounded-xl bg-[#162032] hover:bg-slate-800 text-slate-200 border border-[#1E293B] font-bold text-xs cursor-pointer shadow-sm"
                      >
                        ••• Actions
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {drawerEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0e1626] border-l border-[#1E293B] h-full p-6 space-y-6 overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-base">
                  {drawerEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{drawerEmployee.name}</h3>
                  <p className="text-[11px] text-slate-400">{drawerEmployee.role} • {drawerEmployee.department}</p>
                </div>
              </div>
              <button onClick={() => setDrawerEmployee(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                setEditingEmpId(drawerEmployee.id);
                setFullName(drawerEmployee.name);
                setEmpType(drawerEmployee.type);
                setDepartment(drawerEmployee.department);
                setRole(drawerEmployee.role);
                setPerDayAmount(drawerEmployee.perDayAmount);
                setMonthlyBase(drawerEmployee.monthlyBase);
                setDateOfJoining(drawerEmployee.dateOfJoining);
                setEmpStatus(drawerEmployee.status);
                setIsAddModalOpen(true);
                setDrawerEmployee(null);
              }}
              className="w-full py-2 bg-[#162032] hover:bg-[#1f2d47] border border-[#1E293B] text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Staff Details & Rates</span>
            </button>

            <div className="space-y-2">
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">FINANCIAL OVERVIEW</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#070c18] border border-[#182643] rounded-xl">
                  <div className="text-[10px] text-slate-400">Monthly Base</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    ₹{drawerEmployee.monthlyBase.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-3 bg-[#070c18] border border-[#182643] rounded-xl">
                  <div className="text-[10px] text-slate-400">Per Day Rate</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">₹{drawerEmployee.perDayAmount}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">MUSTER SLIPS & ATTACHMENTS</div>
              <label className="w-full p-3 rounded-2xl bg-[#162032] hover:bg-[#1f2d47] border border-[#22365e] flex items-center gap-3 cursor-pointer">
                <Upload className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-xs font-bold text-white">Upload Muster Document / File</div>
                  <div className="text-[10px] text-slate-400">Attach signed slips, IDs, or vouchers</div>
                </div>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>

              <div className="space-y-1.5 pt-1">
                {(drawerEmployee.attachedFiles || []).map((f, i) => (
                  <div key={i} className="p-2.5 bg-[#070c18] border border-[#182643] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-white font-medium">{f.name}</span>
                    </div>
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-bold text-[10px] shrink-0">
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black tracking-wider uppercase text-slate-400">ADVANCE RECORD</div>
              <button
                onClick={() => {
                  const amt = prompt('Enter advance cash given (₹):');
                  if (amt && Number(amt) > 0) {
                    setEmployees((prev) =>
                      prev.map((e) =>
                        e.id === drawerEmployee.id ? { ...e, advancesGiven: e.advancesGiven + Number(amt) } : e
                      )
                    );
                    setDrawerEmployee(null);
                  }
                }}
                className="w-full p-3 rounded-2xl bg-[#162032] hover:bg-[#1f2d47] border border-[#22365e] flex items-center gap-3 text-left transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">Record Cash Advance</div>
                  <div className="text-[10px] text-slate-400">Log an advance handed out on site</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingEmpId ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ravi Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Employee Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmpType('Employee')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      empType === 'Employee'
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-[#1E293B] bg-[#070D18]'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                      <span>Employee</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Attendance tracked, weekly & monthly pay</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmpType('Non-Employee')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      empType === 'Non-Employee'
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-[#1E293B] bg-[#070D18]'
                    }`}
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full border border-slate-400 inline-block" />
                      <span>Non-Employee</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Fixed monthly base, no attendance needed</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Per Day Amount (₹)</label>
                  <input
                    type="number"
                    value={perDayAmount}
                    onChange={(e) => setPerDayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Monthly Base (₹)</label>
                  <input
                    type="number"
                    value={monthlyBase}
                    onChange={(e) => setMonthlyBase(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Date of Joining</label>
                  <input
                    type="date"
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Status</label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none font-bold cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {editingEmpId ? 'Update Employee' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLabourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Log Day Labour Count</span>
              </h3>
              <button onClick={() => setIsLabourModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLabourHeadcount} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={labourDate}
                    onChange={(e) => setLabourDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Trade *</label>
                  <select
                    value={labourTrade}
                    onChange={(e) => setLabourTrade(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  >
                    <option value="Masons & Helpers">Masons & Helpers</option>
                    <option value="Bar Benders">Bar Benders</option>
                    <option value="Carpenters / Shuttering">Carpenters / Shuttering</option>
                    <option value="Excavators / Earthwork">Excavators / Earthwork</option>
                    <option value="Electricians & Plumbers">Electricians & Plumbers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Contractor / Gang Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ansari Masonry Group"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-emerald-400 font-bold mb-1">Present *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={presentLabours}
                    onChange={(e) => setPresentLabours(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-rose-400 font-bold mb-1">Absent *</label>
                  <input
                    type="number"
                    min="0"
                    value={absentLabours}
                    onChange={(e) => setAbsentLabours(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-rose-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Attach Attendance Slip / File Name</label>
                <input
                  type="text"
                  placeholder="e.g. site_muster_challan_sep20.pdf"
                  value={attachedFileName}
                  onChange={(e) => setAttachedFileName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Work Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Foundation excavation & footing concreting"
                  value={labourRemarks}
                  onChange={(e) => setLabourRemarks(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsLabourModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Save Day Log
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  projectType = 'ROAD',
  onSwitchDomain,
  isAdminUser = false,
  onClose
}) => {
  const { logout } = useERP() as any;
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
      <header className="h-14 bg-[#080C14] border-b border-[#1E293B] flex items-center justify-between px-3 sm:px-4 text-xs select-none font-sans z-45 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 lg:hidden rounded-xl bg-[#121927] hover:bg-[#162032] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
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
                {activeTab === 'attendance-salary' && <AttendancePayrollModule />}
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
