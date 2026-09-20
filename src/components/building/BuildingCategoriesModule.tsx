import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Layers,
  Coins
} from 'lucide-react';

export interface BuildingCategory {
  id: string;
  name: string;
  classification: string;
  benchmarkRate: number;
  unit: string;
  description?: string;
  color?: string;
}

export const STORAGE_BUILDING_CATEGORIES_KEY = 'CONSTRUCTION_PRO_BUILDING_CATEGORIES_ISOLATED_V1';

const INITIAL_BUILDING_CATEGORIES: BuildingCategory[] = [
  {
    id: 'BCAT-001',
    name: 'Cement & Binding Bags',
    classification: 'Civil & Structural',
    benchmarkRate: 385,
    unit: 'Bags',
    description: 'OPC 53 Grade, PPC, and white cement bags'
  },
  {
    id: 'BCAT-002',
    name: 'Structural Steel (TMT Rebars)',
    classification: 'Civil & Structural',
    benchmarkRate: 56000,
    unit: 'Ton',
    description: 'Fe550D TMT reinforcement bars and GI binding wire'
  },
  {
    id: 'BCAT-003',
    name: 'Aggregates & M-Sand',
    classification: 'Civil & Structural',
    benchmarkRate: 1450,
    unit: 'Ton',
    description: 'Double-washed M-Sand, Plaster P-Sand, 20mm granite'
  },
  {
    id: 'BCAT-004',
    name: 'Brick & Masonry Blocks',
    classification: 'Masonry & Partitions',
    benchmarkRate: 65,
    unit: 'Nos',
    description: 'AAC blocks, kiln red bricks, solid concrete blocks'
  },
  {
    id: 'BCAT-005',
    name: 'Formwork & Shuttering',
    classification: 'Hardware & Centering',
    benchmarkRate: 1850,
    unit: 'Nos',
    description: 'Film-faced plywood (12mm), adjustable telescopic jack props'
  },
  {
    id: 'BCAT-006',
    name: 'Plumbing & Drainage',
    classification: 'MEP Services',
    benchmarkRate: 420,
    unit: 'Nos',
    description: 'CPVC hot/cold pipes and UPVC drainage fittings'
  },
  {
    id: 'BCAT-007',
    name: 'Electrical & Conduiting',
    classification: 'MEP Services',
    benchmarkRate: 85,
    unit: 'Nos',
    description: 'Heavy PVC conduit pipes, FR copper wiring'
  },
  {
    id: 'BCAT-008',
    name: 'Waterproofing & Chemicals',
    classification: 'Finishing & Chemicals',
    benchmarkRate: 650,
    unit: 'Bags',
    description: 'Integral liquid waterproofing compounds and tile adhesives'
  }
];

export const BuildingCategoriesModule: React.FC = () => {
  const { currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  const [categories, setCategories] = useState<BuildingCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BUILDING_CATEGORIES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BUILDING_CATEGORIES;
    } catch {
      return INITIAL_BUILDING_CATEGORIES;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [classification, setClassification] = useState('Civil & Structural');
  const [benchmarkRate, setBenchmarkRate] = useState<number | ''>(500);
  const [unit, setUnit] = useState('Nos');
  const [description, setDescription] = useState('');

  // Synchronize state with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_BUILDING_CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setClassification('Civil & Structural');
    setBenchmarkRate(500);
    setUnit('Nos');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BuildingCategory) => {
    setEditingId(item.id);
    setName(item.name);
    setClassification(item.classification || 'Civil & Structural');
    setBenchmarkRate(item.benchmarkRate);
    setUnit(item.unit);
    setDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rate = Number(benchmarkRate) || 0;

    if (editingId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: name.trim(),
                classification,
                benchmarkRate: rate,
                unit,
                description: description.trim() || undefined
              }
            : c
        )
      );
    } else {
      const payload: BuildingCategory = {
        id: `BCAT-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        classification,
        benchmarkRate: rate,
        unit,
        description: description.trim() || undefined
      };
      setCategories((prev) => [payload, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, categoryName: string) => {
    if (!isAdmin) {
      alert('Access Denied: Only administrators have permission to delete categories.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const filtered = categories.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.classification.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-blue-400" />
            <span>Building Material Categories & Rates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage category benchmark costs, measurement units, and catalog specifications[cite: 1, 11].
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Material Category</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by category name, classification, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl text-xs text-white outline-none focus:border-blue-500 placeholder-slate-500"
        />
      </div>

      {/* Categories Card List matching your layout */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl p-5 shadow-2xl space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No building material categories match your search. Click "+ Add Material Category" to register one.
          </div>
        ) : (
          filtered.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              {/* Category Name & Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {cat.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800/80 text-blue-300 border border-slate-700">
                    {cat.classification}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    ({cat.id})
                  </span>
                </div>
              </div>

              {/* Rate & Action Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-[#1e293b]/60 pt-2 sm:pt-0">
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ₹{Number(cat.benchmarkRate || 0).toLocaleString('en-IN')}{' '}
                  <span className="text-slate-400 text-xs font-normal">/ {cat.unit}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 rounded-xl bg-[#121927] hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-[#1E293B] hover:border-blue-500/40 transition-colors cursor-pointer"
                    title="Edit Rate & Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-2 rounded-xl bg-[#121927] hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-[#1E293B] hover:border-rose-500/40 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-400" />
                <span>{editingId ? 'Edit Category Rate' : 'Add Material Category'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ready-Mix Concrete (M25)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Domain Classification <span className="text-rose-500">*</span>
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Civil & Structural">Civil & Structural (Steel, Cement, Aggregates)</option>
                  <option value="Masonry & Partitions">Masonry & Partitions (AAC Blocks, Bricks)</option>
                  <option value="MEP Services">MEP Services (Plumbing, Conduits, Wiring)</option>
                  <option value="Hardware & Centering">Hardware & Centering (Props, Formwork, Plywood)</option>
                  <option value="Finishing & Chemicals">Finishing & Chemicals (Waterproofing, Putty)</option>
                  <option value="Plant & Heavy Lifts">Plant & Heavy Machinery (Batching, Hoists)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Benchmark Rate (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={benchmarkRate}
                    onChange={(e) => setBenchmarkRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Nos">Nos / Units</option>
                    <option value="Bags">Bags</option>
                    <option value="Ton">Ton / MT</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Brass">Brass</option>
                    <option value="Meter">Meter</option>
                    <option value="Cu.M">Cu.M</option>
                    <option value="Sq.Ft">Sq.Ft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Specification & Item Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Grade tolerances, standard packaging specs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Rate' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingCategoriesModule;
