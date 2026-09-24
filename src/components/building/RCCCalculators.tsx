import React from 'react';
import { Layers } from 'lucide-react';

export const BuildingCalculatorModule: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* Approved Concrete Mix Designs Table */}
      <div className="p-6 rounded-3xl bg-[#0B1220] border border-[#1E293B] shadow-2xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
          <Layers className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Approved Project Standard Concrete Mix Designs (IS 10262)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] text-slate-400 uppercase text-[10px] tracking-wider bg-[#080d19]/80">
                <th className="py-3.5 px-4">Concrete Grade</th>
                <th className="py-3.5 px-4">Nominal / Design Ratio</th>
                <th className="py-3.5 px-4">Cement Bags / m³</th>
                <th className="py-3.5 px-4">Sand (Zone II)</th>
                <th className="py-3.5 px-4">Aggregate 20mm/10mm</th>
                <th className="py-3.5 px-4">Target Compressive 28D</th>
                <th className="py-3.5 px-4">Typical Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200 font-mono">
              <tr className="hover:bg-[#121c33]/40">
                <td className="py-3.5 px-4 font-bold text-white">M15</td>
                <td className="py-3.5 px-4 text-slate-400">1 : 2 : 4</td>
                <td className="py-3.5 px-4 font-bold text-amber-400">6.3 Bags</td>
                <td className="py-3.5 px-4 text-slate-300">0.44 m³</td>
                <td className="py-3.5 px-4 text-slate-300">0.88 m³</td>
                <td className="py-3.5 px-4 text-emerald-400">20.8 MPa</td>
                <td className="py-3.5 px-4 font-sans text-slate-400">PCC Levelling, Kerbs, Bedding</td>
              </tr>
              <tr className="hover:bg-[#121c33]/40">
                <td className="py-3.5 px-4 font-bold text-white">M20</td>
                <td className="py-3.5 px-4 text-slate-400">1 : 1.5 : 3</td>
                <td className="py-3.5 px-4 font-bold text-amber-400">8.2 Bags</td>
                <td className="py-3.5 px-4 text-slate-300">0.43 m³</td>
                <td className="py-3.5 px-4 text-slate-300">0.86 m³</td>
                <td className="py-3.5 px-4 text-emerald-400">26.6 MPa</td>
                <td className="py-3.5 px-4 font-sans text-slate-400">General Slab, Beams, Lintels</td>
              </tr>
              <tr className="hover:bg-[#121c33]/40">
                <td className="py-3.5 px-4 font-bold text-white">M25</td>
                <td className="py-3.5 px-4 text-slate-400">1 : 1 : 2</td>
                <td className="py-3.5 px-4 font-bold text-amber-400">11.1 Bags</td>
                <td className="py-3.5 px-4 text-slate-300">0.39 m³</td>
                <td className="py-3.5 px-4 text-slate-300">0.78 m³</td>
                <td className="py-3.5 px-4 text-emerald-400">31.6 MPa</td>
                <td className="py-3.5 px-4 font-sans text-slate-400">High-Rise Slabs, Water Tanks, Retaining Walls</td>
              </tr>
              <tr className="hover:bg-[#121c33]/40">
                <td className="py-3.5 px-4 font-bold text-white">M30</td>
                <td className="py-3.5 px-4 text-cyan-300">Design Mix (RMC)</td>
                <td className="py-3.5 px-4 font-bold text-amber-400">8.4 Bags + Admix</td>
                <td className="py-3.5 px-4 text-slate-300">680 kg M-Sand</td>
                <td className="py-3.5 px-4 text-slate-300">1150 kg Basalt</td>
                <td className="py-3.5 px-4 text-emerald-400">38.2 MPa</td>
                <td className="py-3.5 px-4 font-sans text-slate-400">Heavily loaded columns & transfer girders</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Aliases exported to prevent any Vite build mismatch in App.tsx
export const RCCCalculators = BuildingCalculatorModule;
export default BuildingCalculatorModule;
