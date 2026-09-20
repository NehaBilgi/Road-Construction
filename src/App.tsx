import React, { useState, useEffect } from 'react';
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
  X, Plus, Edit2, Trash2, Menu, ChevronDown, Check, CreditCard
} from 'lucide-react';

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
// Header Component with Mobile Menu Toggle
// ==========================================
interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { selectedSiteId, setSelectedSiteId, siteSheets = [], logout } = useERP() as any;
  const [isSiteOpen, setIsSiteOpen] = useState(false);
  const currentSiteSheet = siteSheets.find((s: any) => s.siteId === selectedSiteId) || siteSheets[0];

  return (
    <header className="h-14 bg-[#080C14] border-b border-[#1E293B] flex items-center justify-between px-3 sm:px-4 text-xs select-none font-sans z-40 relative">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onToggleSidebar && onToggleSidebar()}
          className="p-2 lg:hidden rounded-xl bg-[#121927] hover:bg-[#162032] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsSiteOpen(!isSiteOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#121927] hover:bg-[#162032] border border-[#1E293B] rounded-xl text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-mono text-blue-400 truncate max-w-[120px] sm:max-w-[200px]">
              {currentSiteSheet ? currentSiteSheet.siteName : 'Select Site'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          </button>

          {isSiteOpen && (
            <div className="absolute left-0 mt-2 w-[280px] sm:w-80 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50">
              <div className="px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] border-b border-[#1E293B] flex items-center justify-between">
                <span>Active Sites</span>
                <span className="text-blue-400 font-mono">{siteSheets.length} Sites</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {siteSheets.map((s: any) => (
                  <div
                    key={s.siteId}
                    className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#162032] transition-colors ${
                      selectedSiteId === s.siteId ? 'bg-[#162032]/60' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSiteId(s.siteId);
                        setIsSiteOpen(false);
                      }}
                      className="flex-1 text-left cursor-pointer truncate"
                    >
                      <div className={`font-semibold truncate ${selectedSiteId === s.siteId ? 'text-blue-400 font-bold' : 'text-white'}`}>
                        {s.siteName}
                      </div>
                    </button>
                    {selectedSiteId === s.siteId && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </div>
                ))}
              </div>
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
            if (window.confirm('Are you sure you want to log out?')) {
              logout();
            }
          }}
          title="Sign out"
          className="px-2.5 py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
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
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 3, badgeStyle: 'bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black' },
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
// Road Material Categories & Rates Module (Road Domain)
// ==========================================
export interface RoadMaterialCategory {
  id: string;
  name: string;
  description: string;
  standardRate: number;
  unit: string;
}

const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_ROAD_CATEGORIES_V1';

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
// Building Material Categories & Rates Module (Building Domain - Isolated)
// ==========================================
export interface BuildingCategoryItem {
  id: string;
  name: string;
  classification: string;
  description: string;
  standardRate: number;
  unit: string;
}

const STORAGE_BUILDING_CATS_KEY = 'CONSTRUCTION_PRO_BUILDING_CATEGORIES_ISOLATED_V1';

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
                {activeTab === 'users' && <UserManagementModule />}

                {/* Scaffolding for other pending analysis/config tabs */}
                {activeTab === 'reports' && <GenericView title="Reports" subtitle="Building material consumption & stock audits" icon={FileText} />}
                {activeTab === 'alerts' && <GenericView title="Alerts" subtitle="Low inventory & critical reorder notifications" icon={Bell} />}
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
