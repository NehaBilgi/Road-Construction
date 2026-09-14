import React, { useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';

export interface BuildingProduct {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  status: 'Active' | 'Inactive';
  currentStock: number;
  minStock: number;
  reorderLevel: number;
  maxStock: number;
  supplier: string;
  purchaseDate: string;
  location: string;
  skuPartNo: string;
  barcode: string;
  brand: string;
  rack?: string;
  bin?: string;
  expiryDate?: string;
  description?: string;
}

const STORAGE_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_V1';

const INITIAL_PRODUCTS: BuildingProduct[] = [
  {
    id: 'PRD-001',
    name: 'Castrol Optigear 320',
    category: 'Lubricants & Oils',
    unit: 'Litre',
    unitCost: 450,
    status: 'Active',
    currentStock: 10,
    minStock: 5,
    reorderLevel: 10,
    maxStock: 100,
    supplier: 'Castrol India Ltd',
    purchaseDate: '2026-08-17',
    location: 'Central Yard',
    skuPartNo: 'CST-OG320',
    barcode: '890123456789',
    brand: 'Castrol',
    rack: 'R-02',
    bin: 'B-14',
    description: 'Heavy gear industrial oil for batching plants and lifts'
  },
  {
    id: 'PRD-002',
    name: 'TMT 550D Rebar 12mm',
    category: 'Structural Steel',
    unit: 'Ton',
    unitCost: 56000,
    status: 'Active',
    currentStock: 45,
    minStock: 15,
    reorderLevel: 20,
    maxStock: 120,
    supplier: 'Tata Steel Ltd',
    purchaseDate: '2026-08-10',
    location: 'Tower-A Yard',
    skuPartNo: 'TATA-TMT-12',
    barcode: '890987654321',
    brand: 'Tata Tiscon',
    rack: 'Open Bay 1',
    bin: 'Stack A',
    description: 'Fe550D grade high ductile steel for column casting'
  },
  {
    id: 'PRD-003',
    name: 'OPC 53 Grade Cement',
    category: 'Cement & Binding',
    unit: 'Bags',
    unitCost: 380,
    status: 'Active',
    currentStock: 420,
    minStock: 100,
    reorderLevel: 150,
    maxStock: 1000,
    supplier: 'UltraTech Cement',
    purchaseDate: '2026-08-14',
    location: 'Central Shed',
    skuPartNo: 'ULT-OPC53',
    barcode: '890456123789',
    brand: 'UltraTech',
    rack: 'Shed 1',
    bin: 'Platform C',
    description: '53 Grade Ordinary Portland Cement'
  }
];

export const ProductsMasterModule: React.FC = () => {
  const { currentUser, userRole } = useERP();
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

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Structural Steel');
  const [unit, setUnit] = useState('Nos');
  const [unitCost, setUnitCost] = useState<number | ''>(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [currentStock, setCurrentStock] = useState<number | ''>(0);
  const [minStock, setMinStock] = useState<number | ''>(0);
  const [reorderLevel, setReorderLevel] = useState<number | ''>(10);
  const [maxStock, setMaxStock] = useState<number | ''>(100);
  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2026-08-17');
  const [location, setLocation] = useState('Central Yard');
  const [skuPartNo, setSkuPartNo] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [rack, setRack] = useState('');
  const [bin, setBin] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCategory('Structural Steel');
    setUnit('Nos');
    setUnitCost(0);
    setStatus('Active');
    setCurrentStock(0);
    setMinStock(0);
    setReorderLevel(10);
    setMaxStock(100);
    setSupplier('');
    setPurchaseDate('2026-08-17');
    setLocation('Central Yard');
    setSkuPartNo('');
    setBarcode('');
    setBrand('');
    setRack('');
    setBin('');
    setExpiryDate('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: BuildingProduct = {
      id: editingId || `PRD-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category,
      unit,
      unitCost: Number(unitCost) || 0,
      status,
      currentStock: Number(currentStock) || 0,
      minStock: Number(minStock) || 0,
      reorderLevel: Number(reorderLevel) || 0,
      maxStock: Number(maxStock) || 0,
      supplier: supplier.trim() || 'General Supplier',
      purchaseDate,
      location,
      skuPartNo: skuPartNo.trim() || 'SKU-GEN',
      barcode: barcode.trim() || `${Date.now()}`,
      brand: brand.trim() || 'Standard',
      rack: rack.trim() || undefined,
      bin: bin.trim() || undefined,
      expiryDate: expiryDate || undefined,
      description: description.trim() || undefined
    };

    if (editingId) {
      setProducts(products.map((p) => (p.id === editingId ? payload : p)));
    } else {
      setProducts([payload, ...products]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      alert('Only Admin can delete products');
      return;
    }
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Products Master</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage catalog, inventory limits, and item details.
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

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, ID, barcode, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0D111D] border border-[#1E293B] rounded-2xl text-xs text-white outline-none focus:border-blue-500 placeholder-slate-500"
        />
      </div>

      {/* Products Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">NAME & DETAILS</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">LOCATION</th>
                <th className="py-3.5 px-4 text-right">STOCK</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No matching products found in inventory catalog.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.currentStock <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-[#121c33]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{item.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.brand} • SKU: {item.skuPartNo}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">{item.location}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className={`font-mono font-black text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.currentStock} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                        </div>
                        {isLow && (
                          <span className="text-[9px] font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-800">
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setName(item.name);
                              setCategory(item.category);
                              setUnit(item.unit);
                              setUnitCost(item.unitCost);
                              setStatus(item.status);
                              setCurrentStock(item.currentStock);
                              setMinStock(item.minStock);
                              setReorderLevel(item.reorderLevel);
                              setMaxStock(item.maxStock);
                              setSupplier(item.supplier);
                              setPurchaseDate(item.purchaseDate);
                              setLocation(item.location);
                              setSkuPartNo(item.skuPartNo);
                              setBarcode(item.barcode);
                              setBrand(item.brand);
                              setRack(item.rack || '');
                              setBin(item.bin || '');
                              setExpiryDate(item.expiryDate || '');
                              setDescription(item.description || '');
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              {/* Row 1: Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Castrol Optigear 320"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Structural Steel">Structural Steel (TMT Rebars)</option>
                    <option value="Cement & Binding">Cement & Binding Bags</option>
                    <option value="Lubricants & Oils">Lubricants & Oils</option>
                    <option value="Aggregates & Sand">Aggregates & Sand</option>
                    <option value="Brick & Masonry Blocks">Brick & Masonry Blocks</option>
                    <option value="Plumbing & Electrical">Plumbing & Electrical</option>
                    <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Unit, Unit Cost, Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Litre">Litre</option>
                    <option value="Ton">Ton</option>
                    <option value="Kg">Kg</option>
                    <option value="Bags">Bags</option>
                    <option value="Brass">Brass</option>
                    <option value="Meter">Meter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Stock Buffers */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Current Stock *</label>
                  <input
                    type="number"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Min Stock *</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Reorder Level *</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Stock *</label>
                  <input
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Supplier, Purchase Date, Location */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Supplier *</label>
                  <input
                    type="text"
                    required
                    placeholder="Supplier Name"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  >
                    <option value="Central Yard">Central Yard</option>
                    <option value="Tower-A Yard">Tower-A Yard</option>
                    <option value="Tower-B Yard">Tower-B Yard</option>
                    <option value="Basement Staging">Basement Staging</option>
                  </select>
                </div>
              </div>

              {/* Row 5: SKU, Barcode, Brand */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">SKU / Part No.</label>
                  <input
                    type="text"
                    placeholder="e.g. CST-OG320"
                    value={skuPartNo}
                    onChange={(e) => setSkuPartNo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Barcode</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Castrol"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              {/* Row 6: Rack, Bin, Expiry */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Rack</label>
                  <input
                    type="text"
                    placeholder="e.g. R-02"
                    value={rack}
                    onChange={(e) => setRack(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Bin</label>
                  <input
                    type="text"
                    placeholder="e.g. B-14"
                    value={bin}
                    onChange={(e) => setBin(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Used For</label>
                <textarea
                  rows={2}
                  placeholder="Brief notes about product grade and project allocation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
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
