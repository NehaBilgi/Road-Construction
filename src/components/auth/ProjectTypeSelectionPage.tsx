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
  ShieldCheck
} from 'lucide-react';

interface Props {
  onSelectProjectType: (type: 'ROAD' | 'BUILDING') => void;
}

export const ProjectTypeSelectionPage: React.FC<Props> = ({ onSelectProjectType }) => {
  const { logout, currentUser } = useERP();

  return (
    <div className="min-h-screen w-full bg-[#080C14] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 sm:pb-6 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
            <HardHat className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="truncate">
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-blue-400 font-mono uppercase block">
              CONSTRUCTION SUITE ERP
            </span>
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight uppercase truncate">
              CONSTRUCTION PRO
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-white">{currentUser?.name || 'Habibulla Bilgi'}</div>
            <div className="text-[11px] text-blue-400 font-mono">{currentUser?.role || 'Admin'}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Domain Selection Cards */}
      <div className="max-w-4xl w-full mx-auto my-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 px-2">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Select Construction Domain
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Choose your project scope to configure specialized calculators, material matrices, and telemetry logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Road Construction */}
          <div
            onClick={() => onSelectProjectType('ROAD')}
            className="p-5 sm:p-7 rounded-[1.5rem] sm:rounded-3xl bg-[#0C1427] border border-[#182643] hover:border-blue-500 hover:bg-[#111d38] transition-all cursor-pointer group shadow-2xl flex flex-col justify-between space-y-5 sm:space-y-6 relative overflow-hidden"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md group-hover:scale-110 transition-transform">
                <Milestone className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-blue-400 tracking-wider font-mono">
                  Highways & Pavements
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-300 transition-colors">
                  Road Construction ERP
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Engineered for highway packages, chainage stretches, dump truck trips, MoRTH yield estimation, and bulk diesel refueling.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 sm:pt-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#142038] text-slate-300 text-[10px] font-bold border border-[#22365e] flex items-center gap-1">
                  <Truck className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>Trippage Matrix</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#142038] text-slate-300 text-[10px] font-bold border border-[#22365e] flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>MoRTH Yield Calc</span>
                </span>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-[#182643] flex items-center justify-between text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Enter Road Projects</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </div>
          </div>

          {/* Card 2: Building Construction */}
          <div
            onClick={() => onSelectProjectType('BUILDING')}
            className="p-5 sm:p-7 rounded-[1.5rem] sm:rounded-3xl bg-[#0C1427] border border-[#182643] hover:border-emerald-500 hover:bg-[#112328] transition-all cursor-pointer group shadow-2xl flex flex-col justify-between space-y-5 sm:space-y-6 relative overflow-hidden"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-400 tracking-wider font-mono">
                  Commercial & Residential
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                  Building Construction ERP
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tailored for multi-story towers, structural footings, slabs, RCC concrete grades, steel reinforcement (BBS), and contractor bills.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 sm:pt-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#132b25] text-slate-300 text-[10px] font-bold border border-[#1d4d3e] flex items-center gap-1">
                  <Hammer className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>RCC & Structural</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#132b25] text-slate-300 text-[10px] font-bold border border-[#1d4d3e] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Floor & Tower Sites</span>
                </span>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-[#182643] flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Enter Building Projects</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E293B] pt-4 text-center text-[10px] sm:text-[11px] text-slate-500 font-mono px-2">
        Secured Infrastructure & Multi-Structure Asset Management Suite
      </div>
    </div>
  );
};

export default ProjectTypeSelectionPage;
