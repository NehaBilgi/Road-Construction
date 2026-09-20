import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export interface BuildingProduct {
  id: string;
  category: string;
  unit: string;
  unitCost: number;
  currentStock: number;
}

const STORAGE_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_NO_NAME_V1';

const INITIAL_PRODUCTS: BuildingProduct[] = [
  { id: 'PRD-001', category: 'Cement & Binding Bags', unit: 'Bags', unitCost: 385, currentStock: 420 },
  { id: 'PRD-002', category: 'Structural Steel (TMT Rebars)', unit: 'Ton', unitCost: 56000, currentStock: 45 },
  { id: 'PRD-003', category: 'Aggregates & Sand', unit: 'Ton', unitCost: 1450, currentStock: 85 },
  { id: 'PRD-004', category: 'Brick & Masonry Blocks', unit: 'Nos', unitCost: 65, currentStock: 1800 },
  { id: 'PRD-005', category: 'Hardware & Fasteners', unit: 'Nos', unitCost: 1850, currentStock: 120 },
  { id: 'PRD-006', category: 'Plumbing & Electrical', unit: 'Nos', unitCost: 420, currentStock: 160 },
  { id: 'PRD-007', category: 'Lubricants & Oils', unit: 'Litre', unitCost: 450, currentStock: 10 }
];

export const ProductsMasterModule: React.FC = () => {
  const { currentUser, userRole } = useERP() as any;
  const isAdmin = String(currentUser?.role || userRole || '').toLowerCase().includes('admin');

  const [products, setProducts] = useState<BuildingProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State: strictly Category, Unit, Cost, and Stock In
  const [category, setCategory] = useState('Cement & Binding Bags');
  const [unit, setUnit] = useState('Nos');
  const [unitCost, setUnitCost] = useState<number | ''>(100);
  const [currentStock, setCurrentStock] = useState<number | ''>(10);

  useEffect(() => {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setCategory('Cement & Binding Bags');
    setUnit('Nos');
    setUnitCost(100);
    setCurrentStock(10);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: BuildingProduct = {
      id: editingId || `PRD-${Date.now().toString().slice(-4)}`,
      category: category || 'General Materials',
      unit: unit || 'Nos',
      unitCost: Number(unitCost) || 0,
      currentStock: Number(currentStock) || 0
    };

    if (editingId) {
      setProducts((prev) => prev.map((p) => (p.id === editingId ? payload : p)));
    } else {
      setProducts((prev) => [payload, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      alert('Only Admin can delete products');
      return;
    }
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.id.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const computedTotalCost = (Number(unitCost) || 0) * (Number(currentStock) || 0);

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Products Master</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage category inventory, costs, and stock counts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by category or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl text-xs text-white outline-none focus:border-blue-500 placeholder-slate-500"
        />
      </div>

      {/* Table without Product Name */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">CATEGORY</th>
                <th className="py-3.5 px-6 text-right">COST (₹)</th>
                <th className="py-3.5 px-6 text-right">STOCK IN (NOS)</th>
                <th className="py-3.5 px-6 text-right">TOTAL COST (₹)</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    No products found in catalog.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const lineTotal = Number(item.unitCost || 0) * Number(item.currentStock || 0);
                  return (
                    <tr key={item.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-400">{item.id}</td>
                      <td className="py-4 px-6 font-bold text-white text-xs">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-200">
                        ₹{item.unitCost.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">/ {item.unit}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="font-mono font-black text-sm text-cyan-400">
                          {item.currentStock.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-black text-sm text-emerald-400">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setCategory(item.category);
                              setUnit(item.unit);
                              setUnitCost(item.unitCost);
                              setCurrentStock(item.currentStock);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Without Product Name */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                type="button"
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Category */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Cement & Binding Bags">Cement & Binding Bags</option>
                  <option value="Structural Steel (TMT Rebars)">Structural Steel (TMT Rebars)</option>
                  <option value="Aggregates & Sand">Aggregates & Sand</option>
                  <option value="Brick & Masonry Blocks">Brick & Masonry Blocks</option>
                  <option value="Plumbing & Electrical">Plumbing & Electrical</option>
                  <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                  <option value="Lubricants & Oils">Lubricants & Oils</option>
                </select>
              </div>

              {/* Unit & Unit Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Bags">Bags</option>
                    <option value="Ton">Ton</option>
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Brass">Brass</option>
                    <option value="Meter">Meter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Cost (₹) per {unit} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quantity / Nos & Live Total Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Stock In (Quantity / Nos) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-cyan-400 font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">
                    Total Cost
                  </label>
                  <div className="w-full px-3.5 py-2.5 bg-[#080d19] border border-[#1e293b] rounded-xl flex items-center justify-between min-h-[42px]">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {Number(currentStock || 0)} × ₹{Number(unitCost || 0)}
                    </span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      ₹{computedTotalCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30"
                >
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
