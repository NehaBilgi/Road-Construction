import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { BOQItem } from '../../types/erp';
import {
  FileSpreadsheet,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight
} from 'lucide-react';

export const BOQCostingModule: React.FC = () => {
  const { boqItems, addBOQItem, currentProject } = useERP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [itemNumber, setItemNumber] = useState('3.01');
  const [description, setDescription] = useState('Reinforced Cement Concrete M25 in Beams and Slabs');
  const [unit, setUnit] = useState('m³');
  const [estimatedQuantity, setEstimatedQty] = useState<number>(450);
  const [tenderRate, setTenderRate] = useState<number>(6800);
  const [category, setCategory] = useState('RCC Structural');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const tenderAmount = estimatedQuantity * tenderRate;
    addBOQItem({
      projectId: currentProject?.id || 'proj-bldg-1',
      itemNumber,
      description,
      unit,
      estimatedQuantity: Number(estimatedQuantity),
      tenderRate: Number(tenderRate),
      tenderAmount,
      executedQuantity: 0,
      actualCostIncurred: 0,
      varianceAmount: 0,
      variancePercent: 0,
      category
    });

    setIsModalOpen(false);
  };

  const filteredBOQ = boqItems.filter(
    (b) =>
      b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.itemNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTenderValue = filteredBOQ.reduce((sum, b) => sum + b.tenderAmount, 0);
  const totalActualCost = filteredBOQ.reduce((sum, b) => sum + b.actualCostIncurred, 0);
  const totalCostVariance = totalTenderValue - totalActualCost;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              COMMERCIAL & CONTRACT BOQ
            </span>
            <span className="text-xs text-slate-400">Bill of Quantities & Profitability</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            BOQ Item Master & Cost Variance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare Tender BOQ estimates against actual site execution quantities and cumulative expenditures.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add BOQ Item
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total BOQ Contract Value</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            ₹{(totalTenderValue / 10000000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Cr</span>
          </div>
          <span className="text-xs text-slate-400">
            Across {filteredBOQ.length} scheduled work items
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Actual Cost Incurred</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono my-1">
            ₹{(totalActualCost / 10000000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Cr</span>
          </div>
          <span className="text-xs text-slate-400">
            Execution to date
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Gross Profit Variance</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono my-1">
            ₹{(totalCostVariance / 10000000).toFixed(2)} Cr
          </div>
          <span className="text-xs text-emerald-400/80">
            +32.4% projected gross margin
          </span>
        </div>
      </div>

      {/* BOQ ITEMS TABLE */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-amber-400" />
            Schedule of Quantities & Rates
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search BOQ item#, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Item #</th>
                <th className="py-3 px-3">Description & Category</th>
                <th className="py-3 px-3">Tender Rate</th>
                <th className="py-3 px-3">Estimated Qty</th>
                <th className="py-3 px-3">Executed Qty</th>
                <th className="py-3 px-3">Tender Amount</th>
                <th className="py-3 px-3 text-right">Actual Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredBOQ.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-amber-400">
                    {item.itemNumber}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-white block">{item.description}</span>
                    <span className="text-[10px] text-cyan-400">{item.category}</span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    ₹{item.tenderRate.toLocaleString()} / {item.unit}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {item.estimatedQuantity.toLocaleString()} {item.unit}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-white">
                    {item.executedQuantity.toLocaleString()} {item.unit}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                    ₹{item.tenderAmount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-amber-300 text-right">
                    ₹{item.actualCostIncurred.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BOQ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-amber-400" />
              Add BOQ Item
            </h3>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Item Number *</label>
                  <input
                    type="text"
                    required
                    value={itemNumber}
                    onChange={(e) => setItemNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Item Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tender Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={tenderRate}
                    onChange={(e) => setTenderRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Est Quantity</label>
                  <input
                    type="number"
                    required
                    value={estimatedQuantity}
                    onChange={(e) => setEstimatedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save BOQ Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
