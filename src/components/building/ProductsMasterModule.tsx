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

// Bumped to V2 so that the newly added construction inventory loads immediately
const STORAGE_PRODUCTS_KEY = 'CONSTRUCTION_PRO_BUILDING_PRODUCTS_V2';

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
    description: 'Fe550D grade high ductile steel for column and slab casting'
  },
  {
    id: 'PRD-003',
    name: 'TMT 550D Rebar 16mm',
    category: 'Structural Steel',
    unit: 'Ton',
    unitCost: 56500,
    status: 'Active',
    currentStock: 32,
    minStock: 10,
    reorderLevel: 15,
    maxStock: 100,
    supplier: 'JSW Steel',
    purchaseDate: '2026-08-12',
    location: 'Central Yard',
    skuPartNo: 'JSW-TMT-16',
    barcode: '890987654322',
    brand: 'JSW Neosteel',
    rack: 'Open Bay 2',
    bin: 'Stack B',
    description: 'Heavy structural reinforcement steel for main columns'
  },
  {
    id: 'PRD-004',
    name: 'GI Binding Wire (18 Gauge)',
    category: 'Structural Steel',
    unit: 'Kg',
    unitCost: 78,
    status: 'Active',
    currentStock: 350,
    minStock: 100,
    reorderLevel: 150,
    maxStock: 800,
    supplier: 'Standard Hardware Supplies',
    purchaseDate: '2026-08-15',
    location: 'Central Shed',
    skuPartNo: 'BW-GI-18G',
    barcode: '890456789012',
    brand: 'Standard GI',
    rack: 'R-01',
    bin: 'B-04',
    description: 'Galvanized annealed binding wire for tying rebar cages'
  },
  {
    id: 'PRD-005',
    name: 'OPC 53 Grade Cement',
    category: 'Cement & Binding',
    unit: 'Bags',
    unitCost: 385,
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
    expiryDate: '2026-11-14',
    description: 'High strength 53 Grade Ordinary Portland Cement for structural concrete'
  },
  {
    id: 'PRD-006',
    name: 'PPC Blended Cement',
    category: 'Cement & Binding',
    unit: 'Bags',
    unitCost: 360,
    status: 'Active',
    currentStock: 280,
    minStock: 80,
    reorderLevel: 120,
    maxStock: 800,
    supplier: 'ACC Limited',
    purchaseDate: '2026-08-11',
    location: 'Central Shed',
    skuPartNo: 'ACC-PPC-BAG',
    barcode: '890456123790',
    brand: 'ACC Suraksha',
    rack: 'Shed 1',
    bin: 'Platform D',
    expiryDate: '2026-11-11',
    description: 'Pozzolana blended cement for masonry blockwork and wall plastering'
  },
  {
    id: 'PRD-007',
    name: 'M-Sand (Manufactured Sand)',
    category: 'Aggregates & Sand',
    unit: 'Ton',
    unitCost: 1450,
    status: 'Active',
    currentStock: 85,
    minStock: 25,
    reorderLevel: 40,
    maxStock: 250,
    supplier: 'Deccan Crushers Ltd',
    purchaseDate: '2026-08-16',
    location: 'Central Yard',
    skuPartNo: 'AGG-MSAND-01',
    barcode: '890789123456',
    brand: 'Crushed Metal',
    rack: 'Yard Stockpile',
    bin: 'Bay 1',
    description: 'Zone II double washed sand for RCC structural mix'
  },
  {
    id: 'PRD-008',
    name: 'Coarse Aggregate (20mm Metal)',
    category: 'Aggregates & Sand',
    unit: 'Ton',
    unitCost: 1200,
    status: 'Active',
    currentStock: 110,
    minStock: 30,
    reorderLevel: 50,
    maxStock: 300,
    supplier: 'Deccan Crushers Ltd',
    purchaseDate: '2026-08-16',
    location: 'Central Yard',
    skuPartNo: 'AGG-20MM-GRN',
    barcode: '890789123457',
    brand: 'Crushed Granite',
    rack: 'Yard Stockpile',
    bin: 'Bay 2',
    description: 'Angular 20mm aggregate for slab and beam concrete'
  },
  {
    id: 'PRD-009',
    name: 'AAC Lightweight Blocks (600x200x150mm)',
    category: 'Brick & Masonry Blocks',
    unit: 'Nos',
    unitCost: 65,
    status: 'Active',
    currentStock: 1800,
    minStock: 500,
    reorderLevel: 800,
    maxStock: 4000,
    supplier: 'Magicrete Building Solutions',
    purchaseDate: '2026-08-08',
    location: 'Tower-A Yard',
    skuPartNo: 'AAC-BLK-6IN',
    barcode: '890567123890',
    brand: 'Magicrete',
    rack: 'Open Yard 3',
    bin: 'Stack C',
    description: 'Autoclaved aerated concrete masonry blocks for external and internal walls'
  },
  {
    id: 'PRD-010',
    name: 'Film-Faced Shuttering Plywood (12mm BWP)',
    category: 'Hardware & Fasteners',
    unit: 'Nos',
    unitCost: 1850,
    status: 'Active',
    currentStock: 120,
    minStock: 30,
    reorderLevel: 50,
    maxStock: 300,
    supplier: 'CenturyPly Infrastructure',
    purchaseDate: '2026-08-09',
    location: 'Central Shed',
    skuPartNo: 'SHT-PLY-12MM',
    barcode: '890678234901',
    brand: 'Century Marine',
    rack: 'R-03',
    bin: 'B-01',
    description: 'Film-faced shuttering panels for slab and column formwork'
  },
  {
    id: 'PRD-011',
    name: 'Adjustable Telescopic Steel Props',
    category: 'Hardware & Fasteners',
    unit: 'Nos',
    unitCost: 1250,
    status: 'Active',
    currentStock: 250,
    minStock: 50,
    reorderLevel: 80,
    maxStock: 500,
    supplier: 'BuildPro Scaffolds',
    purchaseDate: '2026-08-02',
    location: 'Basement Staging',
    skuPartNo: 'SCF-PROP-2M',
    barcode: '890678234902',
    brand: 'BuildPro',
    rack: 'Bay S-1',
    bin: 'Rack P',
    description: '2m to 3.5m adjustable heavy duty MS props for slab centering'
  },
  {
    id: 'PRD-012',
    name: 'CPVC Pipe SDR 11 - 1" (3m)',
    category: 'Plumbing & Electrical',
    unit: 'Nos',
    unitCost: 420,
    status: 'Active',
    currentStock: 160,
    minStock: 40,
    reorderLevel: 60,
    maxStock: 300,
    supplier: 'Astral Pipes Ltd',
    purchaseDate: '2026-08-13',
    location: 'Central Shed',
    skuPartNo: 'AST-CPVC-1IN',
    barcode: '890123987456',
    brand: 'Astral',
    rack: 'R-04',
    bin: 'Pipe Rack A',
    description: 'Pressure pipes for hot and cold internal concealed water supply'
  },
  {
    id: 'PRD-013',
    name: 'PVC Heavy Electrical Conduit 25mm (3m)',
    category: 'Plumbing & Electrical',
    unit: 'Nos',
    unitCost: 85,
    status: 'Active',
    currentStock: 320,
    minStock: 100,
    reorderLevel: 150,
    maxStock: 600,
    supplier: 'Finolex Industries',
    purchaseDate: '2026-08-12',
    location: 'Central Shed',
    skuPartNo: 'FIN-CND-25MM',
    barcode: '890123987457',
    brand: 'Finolex',
    rack: 'R-04',
    bin: 'Pipe Rack B',
    description: 'Impact-resistant rigid PVC electrical conduits for casting embedded lines'
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
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('Nos');
  const [unitCost, setUnitCost] = useState<number | ''>(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [currentStock, setCurrentStock] = useState<number | ''>(0);
  const [minStock, setMinStock] = useState<number | ''>(0);
  const [reorderLevel, setReorderLevel] = useState<number | ''>(10);
  const [maxStock, setMaxStock] = useState<number | ''>(100);
  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2026-09-20');
  const [location, setLocation] = useState('');
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
    setCategory('');
    setUnit('Nos');
    setUnitCost(0);
    setStatus('Active');
    setCurrentStock(0);
    setMinStock(0);
    setReorderLevel(10);
    setMaxStock(100);
    setSupplier('');
    setPurchaseDate('2026-09-20');
    setLocation('');
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
      category: category || 'General Materials',
      unit,
      unitCost: Number(unitCost) || 0,
      status,
      currentStock: Number(currentStock) || 0,
      minStock: Number(minStock) || 0,
      reorderLevel: Number(reorderLevel) || 0,
      maxStock: Number(maxStock) || 0,
      supplier: supplier.trim() || 'General Supplier',
      purchaseDate,
      location: location || 'Central Yard',
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

      {/* Add / Edit Product Modal - Refined to match dark card mockup layout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {editingId ? 'Edit Product Details' : 'Add New Product'}
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
              
              {/* Row 1: Product Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Castrol Optigear 320"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer transition-colors"
                  >
                    <option value="" disabled>— Select Category —</option>
                    <option value="Structural Steel">Structural Steel (TMT Rebars)</option>
                    <option value="Cement & Binding">Cement & Binding Bags</option>
                    <option value="Aggregates & Sand">Aggregates & Sand</option>
                    <option value="Brick & Masonry Blocks">Brick & Masonry Blocks</option>
                    <option value="Plumbing & Electrical">Plumbing & Electrical</option>
                    <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                    <option value="Lubricants & Oils">Lubricants & Oils</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Unit, Unit Cost, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer transition-colors"
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
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Unit Cost (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Current Stock, Min Stock, Reorder Level, Max Stock */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Current Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white font-medium outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Min Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Reorder Level <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Max Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row 4: Supplier, Purchase Date, Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Supplier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Supplier Name"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Purchase Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer transition-colors"
                  >
                    <option value="" disabled>— Select Location —</option>
                    <option value="Central Yard">Central Yard</option>
                    <option value="Tower-A Yard">Tower-A Yard</option>
                    <option value="Tower-B Yard">Tower-B Yard</option>
                    <option value="Basement Staging">Basement Staging</option>
                    <option value="Central Shed">Central Shed</option>
                  </select>
                </div>
              </div>

              {/* Row 5: SKU, Barcode, Brand */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    SKU / Part No.
                  </label>
                  <input
                    type="text"
                    placeholder="CST-OG320"
                    value={skuPartNo}
                    onChange={(e) => setSkuPartNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Castrol"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row 6: Rack, Bin, Expiry Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Rack
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R-02"
                    value={rack}
                    onChange={(e) => setRack(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Bin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B-14"
                    value={bin}
                    onChange={(e) => setBin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row 7: Description / Used For */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Description / Used For
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief notes about product grade and project allocation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#131b2e] border border-[#1e293b] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 resize-none transition-colors"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30"
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
