import React, { useState } from 'react';
import { Tag, Plus, Check, Folder, Layers } from 'lucide-react';

export const CategoriesModule: React.FC = () => {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Lubricants & Oils', type: 'Materials', itemsCount: 4, color: 'text-blue-400 bg-blue-500/10' },
    { id: '2', name: 'DEF & Additives', type: 'Materials', itemsCount: 2, color: 'text-cyan-400 bg-cyan-500/10' },
    { id: '3', name: 'Aggregates & Basalt', type: 'Crusher Products', itemsCount: 5, color: 'text-amber-400 bg-amber-500/10' },
    { id: '4', name: 'Sand & M-Sand', type: 'Crusher Products', itemsCount: 2, color: 'text-yellow-400 bg-yellow-500/10' },
    { id: '5', name: 'Fuel / High Speed Diesel', type: 'Energy', itemsCount: 1, color: 'text-rose-400 bg-rose-500/10' },
    { id: '6', name: 'Cement & Binding Agents', type: 'Materials', itemsCount: 2, color: 'text-emerald-400 bg-emerald-500/10' },
    { id: '7', name: 'Earthmoving Plant (JCB/Excavator)', type: 'Machinery', itemsCount: 3, color: 'text-purple-400 bg-purple-500/10' },
    { id: '8', name: 'Haulage Tippers & Mixers', type: 'Fleet', itemsCount: 8, color: 'text-indigo-400 bg-indigo-500/10' }
  ]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('Materials');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCategories([
      ...categories,
      {
        id: Date.now().toString(),
        name: newCatName.trim(),
        type: newCatType,
        itemsCount: 0,
        color: 'text-blue-400 bg-blue-500/10'
      }
    ]);
    setNewCatName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-blue-400" />
            Categories Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage classification taxonomy for inventory products, crusher aggregate sizes, equipment, and labor trades.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Add New Category</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Name</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Hydraulic Filters & Belts"
                required
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3.5 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Domain Type</label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3.5 py-2 text-sm outline-none"
              >
                <option value="Materials">Materials & Spares</option>
                <option value="Crusher Products">Crusher Aggregates & Sand</option>
                <option value="Machinery">Machinery & Heavy Plant</option>
                <option value="Fleet">Haulage Fleet</option>
                <option value="Labour">Labour & Trades</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Existing Classifications ({categories.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl bg-[#080e1e] border border-[#182643] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{c.type}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.color}`}>
                  {c.itemsCount} SKUs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
