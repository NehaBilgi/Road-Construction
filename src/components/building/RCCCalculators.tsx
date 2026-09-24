import React from 'react';
import { Calculator } from 'lucide-react';

export const BuildingCalculatorModule: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      <div className="p-6 rounded-3xl bg-[#0B1220] border border-[#1E293B] shadow-2xl space-y-2 text-center py-16">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
          <Calculator className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white tracking-tight">RCC Calculator Module</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Structural dimension inputs, yield outputs, and mix design tables have been cleared.
        </p>
      </div>
    </div>
  );
};

export const RCCCalculators = BuildingCalculatorModule;
export default BuildingCalculatorModule;
