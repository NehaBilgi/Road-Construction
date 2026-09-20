import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Boxes,
  Layers,
  Sparkles
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

export const STORAGE_BUILDING_CATEGORIES_KEY = 'CONSTRUCTION_PRO_BUILDING_CATEGORIES_V2';

const INITIAL_BUILDING_CATEGORIES: BuildingCategory[] = [
  {
    id: 'BCAT-001',
    name: 'Cement & Binding Bags',
    classification: 'Civil & Structural',
    benchmarkRate: 385,
    unit: 'Bags',
    description: 'OPC 53 Grade, PPC, and rapid-hardening white cement bags',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    id: 'BCAT-002',
    name: 'Structural Steel (TMT Rebars)',
    classification: 'Civil & Structural',
    benchmarkRate: 56000,
    unit: 'Ton',
    description: 'Fe550D TMT reinforcement bars (8mm to 25mm) and GI binding wire',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    id: 'BCAT-003',
    name: 'Aggregates & M-Sand',
    classification: 'Civil & Structural',
    benchmarkRate: 1450,
    unit: 'Ton',
    description: 'Double-washed M-Sand, Plaster P-Sand, and 20mm/40mm coarse granite metals',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  {
    id: 'BCAT-004',
    name: 'Brick & Masonry Blocks',
    classification: 'Masonry & Partitions',
    benchmarkRate: 65,
    unit: 'Nos',
    description: 'Autoclaved aerated concrete (AAC) blocks, kiln clay bricks, and solid blocks',
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  },
  {
    id: 'BCAT-005',
    name: 'Formwork & Shuttering',
    classification: 'Hardware & Centering',
    benchmarkRate: 1850,
    unit: 'Nos',
    description: 'Film-faced plywood (12mm), adjustable MS telescopic props, and tie rods',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
  {
    id: 'BCAT-006',
    name: 'Plumbing & Drainage',
    classification: 'MEP Services',
    benchmarkRate: 420,
    unit: 'Nos',
    description: 'CPVC hot/cold pressure pipes, UPVC lines, and SWR drainage fittings',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  },
  {
    id: 'BCAT-007',
    name: 'Electrical & Conduits',
    classification: 'MEP Services',
    benchmarkRate: 85,
    unit: 'Nos',
    description: 'Rigid PVC electrical conduit pipes (25mm), FR copper wiring, and DB modular boxes',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  },
  {
    id: 'BCAT-008',
    name: 'Waterproofing & Admixtures',
    classification: 'Finishing & Chemicals',
    benchmarkRate: 650,
    unit: 'Bags',
    description: 'Integral liquid waterproofing admixtures, tile adhesives, and grouting sealants',
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
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

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: BuildingCategory = {
      id: editingId || `BCAT-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      classification,
      benchmarkRate: Number(benchmarkRate) || 0,
      unit,
      description: description.trim() || undefined,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    };

    if (editingId) {
      setCategories((prev) => prev.map((c) => (c.id === editingId ? payload : c)));
    } else {
      setCategories((prev) => [payload, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      alert('Only Admin can delete categories');
      return;
    }
    if (window.confirm('Are you sure you want to permanently delete this building category?')) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-blue-400" />
            <span>Building Material Categories & Rates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Standard classification taxonomy, benchmark rates, and specifications for high-rise & commercial buildings.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by category name, classification, ID, or specification..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl text-xs text-white outline-none focus:border-blue-500 placeholder-slate-500"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">CATEGORY NAME</th>
                <th className="py-3.5 px-6">CLASSIFICATION</th>
                <th className="py-3.5 px-6">SPECIFICATION / INCLUSIONS</th>
                <th className="py-3.5 px-6 text-right">BENCHMARK RATE (₹)</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    No building categories matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-400">{cat.id}</td>
                    <td className="py-4 px-6 font-bold text-white text-xs whitespace-nowrap">
                      {cat.name}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                        {cat.classification}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 min-w-[220px]">
                      {cat.description || 'Standard building material specification'}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                      ₹{cat.benchmarkRate.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">/ {cat.unit}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setName(cat.name);
                            setClassification(cat.classification);
                            setBenchmarkRate(cat.benchmarkRate);
                            setUnit(cat.unit);
                            setDescription(cat.description || '');
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingId ? 'Edit Building Category' : 'Add Building Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
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
                  placeholder="e.g. Waterproofing Chemicals & Admixtures"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500"
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
                  <option value="MEP Services">MEP Services (Plumbing, Sanitary, Electrical)</option>
                  <option value="Hardware & Centering">Hardware & Centering (Props, Scaffolding, Ply)</option>
                  <option value="Finishing & Chemicals">Finishing & Chemicals (Putty, Paint, Waterproofing)</option>
                  <option value="Plant & Heavy Lifts">Plant & Heavy Lifts (Batching Plant, Passenger Hoists)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Benchmark Unit <span className="text-rose-500">*</span>
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
                    <option value="Sq.Ft">Sq.Ft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Benchmark Rate (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={benchmarkRate}
                    onChange={(e) => setBenchmarkRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Specification & Item Inclusions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Standard grade specifications, packaging dimensions, and project usages..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {editingId ? 'Update Category' : 'Save Category'}
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
