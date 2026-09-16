import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Milestone,
  Building2,
  HardHat,
  LogOut,
  ArrowRight,
  Truck,
  Layers,
  Hammer,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface Props {
  onSelectProjectType: (type: 'ROAD' | 'BUILDING') => void;
}

export const ProjectTypeSelectionPage: React.FC<Props> = ({ onSelectProjectType }) => {
  const { logout, currentUser, userRole } = useERP() as any;

  const isAdmin = String(userRole || currentUser?.role || '').toUpperCase().includes('ADMIN');
  const userScope = currentUser?.allowedScope || 'ROAD_ONLY';

  // Only Admins and BOTH_ROAD_AND_BUILDING have dual power
  const hasFullPower = isAdmin || userScope === 'BOTH_ROAD_AND_BUILDING';
  const canSelectRoad = hasFullPower || userScope === 'ROAD_ONLY';
  const canSelectBuilding = hasFullPower || userScope === 'BUILDING_ONLY';

  return (
    <div className="min-h-screen w-full bg-[#080C14] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-blue-400 font-mono uppercase block">
              CONSTRUCTION SUITE ERP
            </span>
            <h1 className="text-base sm:text-lg font-black text-white uppercase">
              CONSTRUCTION PRO
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-white">{currentUser?.fullName || currentUser?.name || 'User'}</div>
            <div className="text-[10px] text-blue-400 font-mono">{currentUser?.role || 'User'}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] text-slate-400 hover:text-rose-400 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Domain Selection Matrix */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Select Construction Domain</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {hasFullPower
              ? 'Administrator privilege active: Choose between Highway Road Corridors or Building Construction projects.'
              : 'Authorized Domain Access Portal.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option 1: Road */}
          <div
            onClick={() => {
              if (canSelectRoad) onSelectProjectType('ROAD');
            }}
            className={`p-6 rounded-3xl bg-[#0C1427] border transition-all flex flex-col justify-between space-y-5 ${
              canSelectRoad
                ? 'border-[#182643] hover:border-blue-500 hover:bg-[#111d38] cursor-pointer group shadow-xl'
                : 'border-[#182643]/40 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Milestone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-400 font-mono uppercase">Highways & Pavements</span>
                <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors">
                  Road Construction ERP
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage road stretches, dump truck trips, MoRTH yield estimation, and diesel bowsers.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#182643] flex items-center justify-between text-xs font-bold text-blue-400">
              {canSelectRoad ? (
                <>
                  <span>Enter Road Projects</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Locked (Building Role)
                </span>
              )}
            </div>
          </div>

          {/* Option 2: Building */}
          <div
            onClick={() => {
              if (canSelectBuilding) onSelectProjectType('BUILDING');
            }}
            className={`p-6 rounded-3xl bg-[#0C1427] border transition-all flex flex-col justify-between space-y-5 ${
              canSelectBuilding
                ? 'border-[#182643] hover:border-emerald-500 hover:bg-[#112328] cursor-pointer group shadow-xl'
                : 'border-[#182643]/40 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase">Structures & Towers</span>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                  Building Construction ERP
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Multi-story towers, structural footings, slabs, RCC concrete grades, and BBS reinforcement.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#182643] flex items-center justify-between text-xs font-bold text-emerald-400">
              {canSelectBuilding ? (
                <>
                  <span>Enter Building Projects</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Locked (Road Role)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1E293B] pt-4 text-center text-[10px] text-slate-500 font-mono">
        Role-Based Access Control Active
      </div>
    </div>
  );
};

export default ProjectTypeSelectionPage;
