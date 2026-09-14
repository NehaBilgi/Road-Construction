import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Truck,
  CreditCard,
  Fuel,
  DollarSign,
  Calculator,
  HardHat,
  Sliders,
  Users,
  Building2,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export const RoadERPSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-[#080C14] border-r border-[#1E293B] min-h-screen flex flex-col justify-between p-4 text-slate-300 select-none">
      <div className="space-y-6">
        
        {/* App Branding */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-wider">CONSTRUCTION PRO</div>
            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Road Construction ERP</div>
          </div>
        </div>

        {/* SITE OPERATIONS SECTION */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Site Operations
          </div>

          {/* Site Overview */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Site Overview</span>
            </div>
          </button>

          {/* Ongoing Site */}
          <button
            onClick={() => setActiveTab('road-sites')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'road-sites'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Ongoing Site</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60">
              Sites
            </span>
          </button>

          {/* Trips */}
          <button
            onClick={() => setActiveTab('haulage-trips')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'haulage-trips'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4" />
              <span>Trips</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              Trips
            </span>
          </button>

          {/* Vendor Advance */}
          <button
            onClick={() => setActiveTab('vendor-advances')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vendor-advances'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Vendor Advance</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60">
              Advance
            </span>
          </button>

          {/* Diesel */}
          <button
            onClick={() => setActiveTab('diesel')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'diesel'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Fuel className="w-4 h-4 text-amber-400" />
              <span>Diesel</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60">
              Diesel
            </span>
          </button>

          {/* Site Expense */}
          <button
            onClick={() => setActiveTab('site-expenses')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'site-expenses'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Site Expense</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              Petty Cash
            </span>
          </button>
        </div>

        {/* ENGINEERING SECTION */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Engineering
          </div>

          {/* Road Trip Calculator */}
          <button
            onClick={() => setActiveTab('yield_calculator')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'yield_calculator'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Road Trip Calculator</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60">
              MoRTH
            </span>
          </button>

          {/* Machinery */}
          <button
            onClick={() => setActiveTab('machinery_fleet')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'machinery_fleet'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>Machinery</span>
            </div>
          </button>
        </div>

        {/* CONFIGURATION SECTION */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Configuration
          </div>

          {/* Categories */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Categories</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              Rates
            </span>
          </button>

          {/* User Management */}
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-[#121927]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-purple-400" />
              <span>User Management</span>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800/60">
              RBAC
            </span>
          </button>
        </div>
      </div>

      {/* Profile Footer */}
      <div className="pt-4 border-t border-[#1E293B]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#0F172A] border border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
              H
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-white">Habibulla Bilgi (Director)</div>
              <div className="text-[10px] text-slate-400">Site Engineer & Admin</div>
            </div>
          </div>
          <button title="Logout" className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
