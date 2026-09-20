import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Tag, Plus, Building2, Milestone, Trash2 } from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  type: string;
  itemsCount: number;
  color: string;
}

const STORAGE_ROAD_CATS_KEY = 'CONSTRUCTION_PRO_CATEGORIES_ROAD_V2';
const STORAGE_BUILDING_CATS_KEY = 'CONSTRUCTION_PRO_CATEGORIES_BUILDING_V2';

// 1. Road Construction Categories (Isolated)
const INITIAL_ROAD_CATEGORIES: CategoryItem[] = [
  { id: 'RC-1', name: 'Bituminous Macadam (BM)', type: 'Asphalt & Bitumen', itemsCount: 4, color: 'text-amber-400 bg-amber-500/10' },
  { id: 'RC-2', name: 'Dense Bituminous Macadam (DBM)', type: 'Asphalt & Bitumen', itemsCount: 3, color: 'text-amber-400 bg-amber-500/10' },
  { id: 'RC-3', name: 'Wet Mix Macadam (WMM)', type: 'Base & Sub-Base', itemsCount: 5, color: 'text-yellow-400 bg-yellow-500/10' },
  { id: 'RC-4', name: 'Granular Sub-Base (GSB)', type: 'Base & Sub-Base', itemsCount: 6, color: 'text-yellow-400 bg-yellow-500/10' },
  { id: 'RC-5', name: 'High Speed Diesel (HSD)', type: 'Fuel & Energy', itemsCount: 2, color: 'text-rose-400 bg-rose-500/10' },
  { id: 'RC-6', name: 'Lubricants & Hydraulic Oils', type: 'Machinery Spares', itemsCount: 5, color: 'text-blue-400 bg-blue-500/10' },
  { id: 'RC-7', name: 'Heavy Earthmoving (JCB/Excavators)', type: 'Machinery', itemsCount: 4, color: 'text-purple-400 bg-purple-500/10' },
  { id: 'RC-8', name: 'Haulage Tipper Fleet', type: 'Fleet', itemsCount: 12, color: 'text-indigo-400 bg-indigo-500/10' }
];

// 2. Building Construction Categories (Isolated)
const INITIAL_BUILDING_CATEGORIES: CategoryItem[] = [
  { id: 'BC-1', name: 'Cement & Binding Bags', type: 'Civil & Structural', itemsCount: 6, color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'BC-2', name: 'Structural Steel (TMT Rebars)', type: 'Civil & Structural', itemsCount: 8, color: 'text-blue-400 bg-blue-500/10' },
  { id: 'BC-3', name: 'Aggregates & M-Sand', type: 'Civil & Structural', itemsCount: 5, color: 'text-amber-400 bg-amber-500/10' },
  { id: 'BC-4', name: 'Brick & Masonry Blocks', type: 'Masonry', itemsCount: 4, color: 'text-yellow-400 bg-yellow-500/10' },
  { id: 'BC-5', name: 'Plumbing & Drainage (CPVC/UPVC)', type: 'MEP Services', itemsCount: 7, color: 'text-cyan-400 bg-cyan-500/10' },
  { id: 'BC-6', name: 'Electrical & Conduits', type: 'MEP Services', itemsCount: 6, color: 'text-indigo-400 bg-indigo-500/10' },
  { id: 'BC-7', name: 'Formwork & Shuttering (Props/Ply)', type: 'Hardware & Centering', itemsCount: 5, color: 'text-purple-400 bg-purple-500/10' },
  { id: 'BC-8', name: 'Waterproofing & Admixtures', type: 'Finishing & Chemicals', itemsCount: 3, color: 'text-teal-400 bg-teal-500/10' }
];

export const CategoriesModule: React.FC = () => {
  const { appDomain, currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  // Identify active domain
  const isBuilding = useMemo(() => {
    try {
      const session = sessionStorage.getItem('CONSTRUCTION_PRO_DOMAIN_SESSION');
      if (session === 'BUILDING') return true;
      if (session === 'ROAD') return false;
    } catch {}
    return appDomain === 'BUILDING' || currentUser?.allowedScope === 'BUILDING_ONLY';
  }, [appDomain, currentUser]);

  const storageKey = isBuilding ? STORAGE_BUILDING_CATS_KEY : STORAGE_ROAD_CATS_KEY;
  const initialData = isBuilding ? INITIAL_BUILDING_CATEGORIES : INITIAL_ROAD_CATEGORIES;

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  // Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState(isBuilding ? 'Civil & Structural' : 'Asphalt & Bitumen');

  // Synchronize when switching domains
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setCategories(saved ? JSON.parse(saved) : initialData);
      setNewCatType(isBuilding ? 'Civil & Structural' : 'Asphalt & Bitumen');
    } catch {
      setCategories(initialData);
    }
  }, [storageKey, isBuilding]);

  // Persist changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(categories));
  }, [categories, storageKey]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newItem: CategoryItem = {
      id: `${isBuilding ? 'BC' : 'RC'}-${Date.now().toString().slice(-4)}`,
      name: newCatName.trim(),
      type: newCatType,
      itemsCount: 0,
      color: isBuilding ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'
    };

    setCategories([newItem, ...categories]);
    setNewCatName('');
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      alert('Only Admin can delete categories');
      return;
    }
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header with Active Domain Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                isBuilding
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}
            >
              {isBuilding ? <Building2 className="w-3 h-3" /> : <Milestone className="w-3 h-3" />}
              {isBuilding ? 'Building Construction Domain' : 'Road Construction Domain'}
            </span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-blue-400" />
            <span>{isBuilding ? 'Building Material Categories' : 'Road Material Categories'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBuilding
              ? 'Classification taxonomy for structural civil, MEP plumbing/electrical, masonry, and architectural finishes.'
              : 'Classification taxonomy for asphalt layers, WMM/GSB granular mixes, fuel, and earthmoving machinery.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">
            Add {isBuilding ? 'Building' : 'Road'} Category
          </h3>
          <form onSubmit={handleAdd} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Category Name *</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder={isBuilding ? 'e.g. Waterproofing Chemicals' : 'e.g. Bituminous Concrete (BC)'}
                required
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Domain Classification *</label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs outline-none cursor-pointer"
              >
                {isBuilding ? (
                  <>
                    <option value="Civil & Structural">Civil & Structural (Steel/Cement/Aggregates)</option>
                    <option value="Masonry">Masonry (AAC Blocks/Bricks)</option>
                    <option value="MEP Services">MEP Services (Plumbing & Electrical)</option>
                    <option value="Hardware & Centering">Hardware & Centering (Props/Shuttering)</option>
                    <option value="Finishing & Chemicals">Finishing & Chemicals (Putty/Waterproofing)</option>
                    <option value="Plant & Lifts">Batching Plant, Hoists & Lifts</option>
                  </>
                ) : (
                  <>
                    <option value="Asphalt & Bitumen">Asphalt & Bitumen (BM/DBM/BC)</option>
                    <option value="Base & Sub-Base">Base & Sub-Base (WMM/GSB)</option>
                    <option value="Crusher Aggregates">Crusher Aggregates (10mm, 20mm, 40mm, GSB)</option>
                    <option value="Fuel & Energy">Fuel & Energy (HSD Diesel)</option>
                    <option value="Machinery">Machinery & Heavy Plant (Excavator/Paver)</option>
                    <option value="Fleet">Haulage Fleet (Tippers)</option>
                  </>
                )}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-2 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">
              {isBuilding ? 'Building' : 'Road'} Classifications ({categories.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Key: {storageKey}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-[#080e1e] border border-[#182643] flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{c.type}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.color}`}>
                    {c.itemsCount} SKUs
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesModule;
