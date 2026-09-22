import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import {
  LayoutDashboard,
  Truck,
  Fuel,
  DollarSign,
  Calculator,
  HardHat,
  LogOut,
  Milestone,
  Users,
  Package,
  ArrowLeftRight,
  FileText,
  Bell,
  CalendarCheck,
  Tag,
  Archive,
  Building2,
  CreditCard,
  Plus,
  Compass,
  X
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectType?: 'ROAD' | 'BUILDING';
  onSwitchDomain?: () => void;
  onClose?: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeStyle?: string;
  isCustom?: boolean;
}

const STORAGE_CUSTOM_SIDEBAR_TABS = 'CONSTRUCTION_PRO_CUSTOM_SIDEBAR_TABS_V1';
const STORAGE_BUILDING_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_NO_NAME_V1';

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  projectType = 'ROAD',
  onSwitchDomain,
  onClose
}) => {
  const { currentUser, logout } = useERP() as any;
  const isBuilding = projectType === 'BUILDING';

  // Dynamic live inventory alert count from local storage
  const [liveAlertsCount, setLiveAlertsCount] = useState<number>(0);

  // Dynamic custom tabs added directly through sidebar UI
  const [customTabs, setCustomTabs] = useState<NavItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_SIDEBAR_TABS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => ({
          ...t,
          icon: Compass
        }));
      }
    } catch {}
    return [];
  });

  const [isAddTabModalOpen, setIsAddTabModalOpen] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState('');

  useEffect(() => {
    const updateAlertCount = () => {
      try {
        const raw = localStorage.getItem(STORAGE_BUILDING_PRODUCTS_KEY);
        if (!raw) return setLiveAlertsCount(0);
        const prods = JSON.parse(raw);
        if (Array.isArray(prods)) {
          const count = prods.filter(
            (p: any) => Number(p?.currentStock || 0) <= Number(p?.minThreshold || 20)
          ).length;
          setLiveAlertsCount(count);
        }
      } catch {
        setLiveAlertsCount(0);
      }
    };

    updateAlertCount();
    window.addEventListener('storage', updateAlertCount);
    window.addEventListener('focus', updateAlertCount);
    return () => {
      window.removeEventListener('storage', updateAlertCount);
      window.removeEventListener('focus', updateAlertCount);
    };
  }, []);

  const handleAddCustomTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabLabel.trim()) return;

    const slug = newTabLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newTab: NavItem = {
      id: `custom-${slug}`,
      label: newTabLabel.trim(),
      icon: Compass,
      isCustom: true
    };

    const updated = [...customTabs, newTab];
    setCustomTabs(updated);
    try {
      localStorage.setItem(
        STORAGE_CUSTOM_SIDEBAR_TABS,
        JSON.stringify(updated.map((t) => ({ id: t.id, label: t.label, isCustom: true })))
      );
    } catch {}

    setNewTabLabel('');
    setIsAddTabModalOpen(false);
    setActiveTab(newTab.id);
    if (onClose) onClose();
  };

  const handleDeleteCustomTab = (tabId: string) => {
    const updated = customTabs.filter((t) => t.id !== tabId);
    setCustomTabs(updated);
    try {
      localStorage.setItem(
        STORAGE_CUSTOM_SIDEBAR_TABS,
        JSON.stringify(updated.map((t) => ({ id: t.id, label: t.label, isCustom: true })))
      );
    } catch {}
    if (activeTab === tabId) {
      setActiveTab('dashboard');
    }
  };

  // ==========================================
  // ROAD CONSTRUCTION NAVIGATION ITEMS
  // ==========================================
  const roadOperationsItems: NavItem[] = [
    { id: 'dashboard', label: 'Site Overview', icon: LayoutDashboard },
    {
      id: 'road-sites',
      label: 'Ongoing Site',
      icon: Milestone,
      badge: 'Sites',
      badgeStyle: 'bg-blue-900/40 text-blue-300 border border-blue-500/40'
    },
    {
      id: 'haulage-trips',
      label: 'Trips',
      icon: Truck,
      badge: 'Trips',
      badgeStyle: 'bg-[#064E3B] text-[#34D399] border border-[#065F46]'
    },
    {
      id: 'vendor-advances',
      label: 'Vendor Advance',
      icon: CreditCard,
      badge: 'Advance',
      badgeStyle: 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
    },
    {
      id: 'diesel',
      label: 'Diesel',
      icon: Fuel,
      badge: 'Diesel',
      badgeStyle: 'bg-amber-950/60 text-amber-300 border border-amber-800'
    },
    {
      id: 'site-expenses',
      label: 'Site Expense',
      icon: DollarSign,
      badge: 'Petty Cash',
      badgeStyle: 'bg-[#162032] text-blue-400 border border-[#1E293B]'
    }
  ];

  const roadEngineeringItems: NavItem[] = [
    {
      id: 'yield_calculator',
      label: 'Road Trip Calculator',
      icon: Calculator,
      badge: 'MoRTH',
      badgeStyle: 'bg-blue-900/60 text-blue-300 border border-blue-500/40 font-mono'
    },
    {
      id: 'machinery_fleet',
      label: 'Machinery',
      icon: HardHat
    }
  ];

  const roadConfigItems: NavItem[] = [
    {
      id: 'categories',
      label: 'Categories',
      icon: Tag,
      badge: 'Rates',
      badgeStyle: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      badge: 'RBAC',
      badgeStyle: 'bg-indigo-900/40 text-indigo-300 border border-indigo-500/40'
    }
  ];

  // ==========================================
  // BUILDING CONSTRUCTION NAVIGATION ITEMS
  // ==========================================
  const buildingCoreItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'road-sites',
      label: 'Ongoing Site',
      icon: Milestone,
      badge: 'Sites',
      badgeStyle: 'bg-emerald-950 text-emerald-400 border border-emerald-800'
    },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight }
  ];

  const buildingAnalysisItems: NavItem[] = [
    { id: 'reports', label: 'Reports', icon: FileText },
    {
      id: 'building_calculator',
      label: 'RCC Calculator',
      icon: Calculator,
      badge: 'IS 456',
      badgeStyle: 'bg-cyan-950/60 text-cyan-300 border border-cyan-800 font-mono'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: liveAlertsCount > 0 ? liveAlertsCount : undefined,
      badgeStyle: 'bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black'
    },
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
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30'
                    : 'text-[#94A3B8] hover:bg-[#162032] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={
                      item.badgeStyle ||
                      `text-[9px] px-1.5 py-0.5 rounded font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-900/40 text-blue-300 border border-blue-500/40'
                      }`
                    }
                  >
                    {item.badge}
                  </span>
                )}
              </button>

              {item.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomTab(item.id);
                  }}
                  className="absolute right-2 top-2.5 p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove Custom Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
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
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-md ${
                isBuilding ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'
              }`}
            >
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
            <button
              onClick={onClose}
              className="absolute right-3 lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isBuilding ? (
          <div className="space-y-4">
            {renderNavGroup(null, buildingCoreItems)}
            {renderNavGroup('ANALYSIS', buildingAnalysisItems)}
            {customTabs.length > 0 && renderNavGroup('CUSTOM MODULES', customTabs)}
            {renderNavGroup('CONFIGURATION', buildingConfigItems)}

            {/* Quick Add Custom Navigation Tab button */}
            <div className="pt-1 px-1">
              <button
                type="button"
                onClick={() => setIsAddTabModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-[#1E293B] hover:border-blue-500/50 bg-[#070c18] hover:bg-[#121927] text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Add Custom Tab</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {renderNavGroup('SITE OPERATIONS', roadOperationsItems)}
            {renderNavGroup('ENGINEERING', roadEngineeringItems)}
            {customTabs.length > 0 && renderNavGroup('CUSTOM MODULES', customTabs)}
            {renderNavGroup('CONFIGURATION', roadConfigItems)}

            <div className="pt-1 px-1">
              <button
                type="button"
                onClick={() => setIsAddTabModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-[#1E293B] hover:border-blue-500/50 bg-[#070c18] hover:bg-[#121927] text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Add Custom Tab</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#1E293B] bg-[#080C14] space-y-2 sticky bottom-0 z-10 shadow-lg">
        {onSwitchDomain && (
          <button
            onClick={() => {
              onSwitchDomain();
              if (onClose) onClose();
            }}
            className="w-full py-2.5 px-2 bg-[#121927] hover:bg-[#1b263b] border border-[#1E293B] rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <span>Switch to {isBuilding ? 'Roads' : 'Buildings'}</span>
          </button>
        )}

        <div className="p-2 rounded-xl bg-[#121927] border border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'Habibulla Bilgi'}</div>
              <div className="text-[10px] text-[#94A3B8] truncate">{currentUser?.role || 'Site Engineer & Admin'}</div>
            </div>
          </div>
          <button onClick={logout} title="Logout" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#162032] transition-colors cursor-pointer shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal: Add Custom Tab from Sidebar */}
      {isAddTabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Add Module to Sidebar</span>
              </h3>
              <button
                onClick={() => setIsAddTabModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomTab} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Module / Tab Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaffolding Logs, Subcontractor Ledger"
                  value={newTabLabel}
                  onChange={(e) => setNewTabLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsAddTabModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Add Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
