import React from 'react';
import { useRoadERP } from '../../context/RoadERPContext';
import { UserRole } from '../../types/roadERP';
import {
  HardHat,
  Cpu,
  Wifi,
  WifiOff,
  User,
  Shield,
  Layers,
  Truck,
  Fuel,
  Calculator,
  DollarSign,
  FileText,
  RefreshCw,
  MapPin
} from 'lucide-react';

interface Props {
  activeModule: 'calculator' | 'trips' | 'diesel' | 'fleet' | 'expenses' | 'analytics';
  setActiveModule: (module: 'calculator' | 'trips' | 'diesel' | 'fleet' | 'expenses' | 'analytics') => void;
  onOpenArchitecture: () => void;
}

export const RoadAppHeader: React.FC<Props> = ({
  activeModule,
  setActiveModule,
  onOpenArchitecture
}) => {
  const {
    project,
    currentUserRole,
    setCurrentUserRole,
    isOnline,
    setIsOnline,
    syncQueue,
    triggerManualSync
  } = useRoadERP();

  const NAV_ITEMS = [
    { id: 'calculator', label: '1. Yield Calculator', icon: Calculator, badge: 'Formulas' },
    { id: 'trips', label: '2. Haulage Trips', icon: Truck, badge: 'Quarry-to-Chainage' },
    { id: 'diesel', label: '3. Diesel Log', icon: Fuel, badge: 'Anti-Theft' },
    { id: 'fleet', label: '4. Fleet Registry', icon: HardHat, badge: 'Equip' },
    { id: 'expenses', label: '5. Site Expenses', icon: DollarSign, badge: 'Petty Cash' },
    { id: 'analytics', label: '6. DPR & Reports', icon: FileText, badge: 'NHAI' }
  ] as const;

  return (
    <header className="bg-[#0b1220] border-b border-[#1b2845] sticky top-0 z-40">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-[#15223c] text-xs">
        {/* Project Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-white tracking-wide">
              {project.highwayCode}
            </span>
          </div>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 font-mono hidden sm:inline">
            Ch. {project.startChainageKm} → Ch. {project.endChainageKm} ({project.pavementType})
          </span>
        </div>

        {/* Right Utility: Online status + Role switcher + Architecture Spec */}
        <div className="flex items-center gap-2.5">
          {/* Architecture Modal Button */}
          <button
            onClick={onOpenArchitecture}
            className="px-2.5 py-1 rounded-xl bg-[#142038] hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & ERD Spec</span>
          </button>

          {/* Offline/Online Network Indicator */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            title="Click to toggle offline mode simulation"
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online (4G)' : 'Offline'}</span>
            {syncQueue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {syncQueue.length}
              </span>
            )}
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-[#070c18] border border-[#1b2845] px-2.5 py-1 rounded-xl">
            <Shield className="w-3 h-3 text-amber-400" />
            <select
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
              className="bg-transparent text-slate-300 font-semibold outline-none cursor-pointer text-[11px]"
            >
              <option value="SITE_ENGINEER">Site Engineer (Ibrahim)</option>
              <option value="FLEET_MANAGER">Fleet Manager (Dharmaraj)</option>
              <option value="PROJECT_DIRECTOR">Project Director (Executive)</option>
              <option value="MACHINE_OPERATOR">Bowser / Plant Operator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3 overflow-x-auto gap-2">
          {/* App Branding */}
          <div className="flex items-center gap-3 shrink-0 mr-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white leading-tight">
                PAVETRACK PRO <span className="text-[10px] text-amber-400 font-mono">ERP</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-none">
                Road Construction & Field Ops Engine
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-1.5 shrink-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                      : 'bg-[#070c18] hover:bg-[#131f38] text-slate-300 border border-[#1b2845]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
