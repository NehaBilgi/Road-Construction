import React, { useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  LayoutDashboard,
  MapPin,
  Truck,
  CreditCard,
  Fuel,
  Receipt,
  Calculator,
  HardHat,
  Tag,
  Users,
  HardHat as LogoIcon,
  Building2,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { 
    currentUser, 
    userRole, 
    appDomain = 'ROAD', 
    setAppDomain, 
    setCurrentUser 
  } = useERP() as any;

  // 1. Strict Admin Evaluation
  const isAdmin = useMemo(() => {
    const roleCandidate = String(userRole || currentUser?.role || '').trim().toUpperCase();
    if (roleCandidate === 'SUPER_ADMIN' || roleCandidate === 'ADMIN' || roleCandidate.includes('ADMIN')) {
      return true;
    }
    if (typeof window !== 'undefined') {
      try {
        const storedUser =
          localStorage.getItem('PAVETRACK_AUTHORIZED_PERSONNEL_V2') ||
          localStorage.getItem('PAVETRACK_ACTIVE_SESSION_V2');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const parsedRole = String(parsed?.role || '').trim().toUpperCase();
          return parsedRole === 'SUPER_ADMIN' || parsedRole === 'ADMIN' || parsedRole.includes('ADMIN');
        }
      } catch {}
    }
    return false;
  }, [userRole, currentUser]);

  // 2. Domain Scope Evaluation (ROAD_ONLY / BUILDING_ONLY / BOTH)
  const userScope = useMemo(() => {
    return currentUser?.allowedScope || (isAdmin ? 'BOTH_ROAD_AND_BUILDING' : 'ROAD_ONLY');
  }, [currentUser, isAdmin]);

  const canSwitchDomain = isAdmin || userScope === 'BOTH_ROAD_AND_BUILDING';

  const handleDomainToggle = () => {
    if (!canSwitchDomain || !setAppDomain) return;
    const nextDomain = appDomain === 'ROAD' ? 'BUILDING' : 'ROAD';
    setAppDomain(nextDomain);
    onSelectTab('overview');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('PAVETRACK_ACTIVE_SESSION_V2');
      localStorage.removeItem('CONSTRUCTION_PRO_ERP_STORAGE_V7_USER');
      localStorage.removeItem('PAVETRACK_CURRENT_USER');
    }
    if (setCurrentUser) setCurrentUser(null);
    window.location.reload();
  };

  const navItemClass = (tabId: string) => `
    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none
    ${
      activeTab === tabId
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
        : 'text-slate-400 hover:text-slate-200 hover:bg-[#121927]'
    }
  `;

  return (
    <aside className="w-64 bg-[#080C14] border-r border-[#1E293B] min-h-screen flex flex-col justify-between p-4 font-sans shrink-0 no-print">
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
            <LogoIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wider uppercase">
              CONSTRUCTION PRO
            </h1>
            <p className="text-[10px] text-blue-400 font-mono">
              {appDomain === 'BUILDING' ? 'Building Construction ERP' : 'Road Construction ERP'}
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5">
          {/* Section 1: SITE OPERATIONS */}
          <div className="space-y-1">
            <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-2">
              SITE OPERATIONS
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('overview')}
              className={navItemClass('overview')}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Site Overview</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('road-sites')}
              className={navItemClass('road-sites')}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>{appDomain === 'BUILDING' ? 'Active Projects' : 'Ongoing Site'}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800">
                Sites
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('haulage-trips')}
              className={navItemClass('haulage-trips')}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4" />
                <span>{appDomain === 'BUILDING' ? 'Material Supply' : 'Trips'}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                Trips
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('vendor-advance')}
              className={navItemClass('vendor-advance')}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                <span>Vendor Advance</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800">
                Advance
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('diesel')}
              className={navItemClass('diesel')}
            >
              <div className="flex items-center gap-2.5">
                <Fuel className="w-4 h-4" />
                <span>Diesel</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800">
                Diesel
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('site-expenses')}
              className={navItemClass('site-expenses')}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4" />
                <span>Site Expense</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                Petty Cash
              </span>
            </button>
          </div>

          {/* Section 2: ENGINEERING */}
          <div className="space-y-1">
            <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-2">
              ENGINEERING
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('yield_calculator')}
              className={navItemClass('yield_calculator')}
            >
              <div className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4" />
                <span>{appDomain === 'BUILDING' ? 'Concrete Estimator' : 'Road Trip Calculator'}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-800">
                {appDomain === 'BUILDING' ? 'IS 456' : 'MoRTH'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('machinery_fleet')}
              className={navItemClass('machinery_fleet')}
            >
              <div className="flex items-center gap-2.5">
                <HardHat className="w-4 h-4" />
                <span>Machinery</span>
              </div>
            </button>
          </div>

          {/* Section 3: CONFIGURATION (ADMIN ONLY) */}
          {isAdmin && (
            <div className="space-y-1">
              <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 mb-2">
                CONFIGURATION
              </div>

              <button
                type="button"
                onClick={() => onSelectTab('categories')}
                className={navItemClass('categories')}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4" />
                  <span>Categories</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Rates
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('user_management')}
                className={navItemClass('user_management')}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>User Management</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800">
                  RBAC
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Domain Switcher + User Profile Card */}
      <div className="space-y-2 mt-auto pt-4">
        {/* Domain Scope Action / Lock */}
        {canSwitchDomain ? (
          <button
            type="button"
            onClick={handleDomainToggle}
            className="w-full py-2.5 px-3 rounded-xl bg-[#121927] hover:bg-[#1a2336] border border-[#1E293B] hover:border-slate-600 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            {appDomain === 'ROAD' ? (
              <>
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Switch to Buildings</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Switch to Road Construction</span>
              </>
            )}
          </button>
        ) : (
          <div className="w-full py-2 px-3 rounded-xl bg-[#0d1524] border border-[#1a263d] text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {userScope === 'ROAD_ONLY' ? 'Locked: Road Sites' : 'Locked: Building Projects'}
            </span>
          </div>
        )}

        {/* User Card & Logout */}
        <div className="p-3 bg-[#121927] border border-[#1E293B] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-[#1A2338] border border-[#23355A] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {currentUser?.fullName?.charAt(0).toUpperCase() || currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.fullName || currentUser?.name || currentUser?.username || 'Authorized User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">
                {currentUser?.role || 'SITE_ENGINEER'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
