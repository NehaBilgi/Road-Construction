import React from 'react';
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
  ShoppingCart,
  Cpu,
  CalendarCheck,
  Tag,
  Archive,
  Building2,
  X
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectType?: 'ROAD' | 'BUILDING';
  onSwitchDomain?: () => void;
  onClose?: () => void; // Added for mobile drawer auto-close
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeStyle?: string;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  projectType = 'ROAD',
  onSwitchDomain,
  onClose
}) => {
  const { currentUser, logout } = useERP();
  const isBuilding = projectType === 'BUILDING';

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
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: 3,
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
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose(); // Auto-close drawer on mobile when clicking a link
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-[0.98] ${
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

          {/* Mobile Close Button */}
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
            {renderNavGroup('CONFIGURATION', buildingConfigItems)}
          </div>
        ) : (
          <div className="space-y-4">
            {renderNavGroup('SITE OPERATIONS', roadOperationsItems)}
            {renderNavGroup('ENGINEERING', roadEngineeringItems)}
            {renderNavGroup('CONFIGURATION', roadConfigItems)}
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
              <div className="text-[10px] text-[#94A3B8] truncate">Site Engineer & Admin</div>
            </div>
          </div>
          <button onClick={logout} title="Logout" className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#162032] transition-colors cursor-pointer shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
