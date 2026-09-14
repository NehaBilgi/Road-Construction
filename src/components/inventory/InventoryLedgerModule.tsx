import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Material, StockTransaction } from '../../types/erp';
import {
  Package,
  Plus,
  ArrowRightLeft,
  Search,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Box,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const InventoryLedgerModule: React.FC = () => {
  const {
    materials,
    stockTransactions,
    addStockTransaction,
    addMaterial,
    currentProject,
    currentSite
  } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<'STOCK_MASTER' | 'TRANSACTIONS'>('STOCK_MASTER');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isNewMatModalOpen, setIsNewMatModalOpen] = useState(false);

  // New Transaction Form State
  const [txDate, setTxDate] = useState(new Date().toISOString().substring(0, 10));
  const [txType, setTxType] = useState<StockTransaction['transactionType']>('ISSUE');
  const [selectedMaterialId, setSelectedMaterialId] = useState(materials[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50);
  const [issuedToChainageOrFloor, setIssuedToChainageOrFloor] = useState('5th Floor Slab Casting');
  const [contractorOrPerson, setContractorOrPerson] = useState('Ramesh Bar Bender (Subcontractor)');
  const [referenceDocument, setReferenceDocument] = useState('MRN-2026-0819');

  // New Material Form State
  const [newMatName, setNewMatName] = useState('');
  const [newMatCode, setNewMatCode] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<Material['category']>('CEMENT');
  const [newMatUnit, setNewMatUnit] = useState('Bags');
  const [newMatRate, setNewMatRate] = useState<number>(380);
  const [newMatStock, setNewMatStock] = useState<number>(500);
  const [newMatMinStock, setNewMatMinStock] = useState<number>(100);

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId) || materials[0];

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    addStockTransaction({
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      materialCode: selectedMaterial.code,
      transactionType: txType,
      quantity: Number(quantity),
      unit: selectedMaterial.unit,
      unitRate: selectedMaterial.standardRate,
      totalValue: Number(quantity) * selectedMaterial.standardRate,
      date: txDate,
      sourceStoreId: 'central-store',
      destinationSiteOrStoreId: txType === 'ISSUE' ? (currentSite?.id || 'site-1') : undefined,
      issuedToChainageOrFloor: txType === 'ISSUE' ? issuedToChainageOrFloor : undefined,
      contractorOrPerson,
      referenceDocument
    });

    setIsTxModalOpen(false);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    addMaterial({
      name: newMatName,
      code: newMatCode || `MAT-${Date.now().toString().slice(-4)}`,
      category: newMatCategory,
      unit: newMatUnit,
      standardRate: Number(newMatRate),
      currentStockTotal: Number(newMatStock),
      minReorderLevel: Number(newMatMinStock),
      locationStock: {
        'central-store': Number(newMatStock)
      }
    });

    setIsNewMatModalOpen(false);
    setNewMatName('');
    setNewMatCode('');
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = materials.reduce((sum, m) => sum + m.currentStockTotal * m.standardRate, 0);
  const lowStockMaterials = materials.filter((m) => m.currentStockTotal <= m.minReorderLevel);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              STORE & STOCK LEDGER
            </span>
            <span className="text-xs text-slate-400">Central Stores & Site Warehouses</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Material Inventory & Stock Movement
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formula: Opening + Purchases + Transfers In - Site Issues - Transfers Out = Closing Stock Balance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewMatModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Item Master</span>
          </button>

          <button
            onClick={() => setIsTxModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Issue / Receive Stock</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Inventory Valuation</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            ₹{(totalInventoryValue / 100000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Lakhs</span>
          </div>
          <span className="text-xs text-slate-400">
            Across {materials.length} stock catalog SKUs
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Low Stock Warnings</span>
          <div className="text-2xl font-extrabold text-rose-400 font-mono my-1">
            {lowStockMaterials.length} <span className="text-xs font-normal text-slate-400">Items</span>
          </div>
          <span className="text-xs text-rose-400">
            Below safety reorder threshold
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Recent Site Issues</span>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono my-1">
            {stockTransactions.filter((t) => t.transactionType === 'ISSUE').length} <span className="text-xs font-normal text-slate-400">MRNs</span>
          </div>
          <span className="text-xs text-slate-400">
            Directly linked to Chainage/Floors
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Audit Reconciliation</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono my-1">
            100% Reconciled
          </div>
          <span className="text-xs text-slate-400">
            FIFO / Weighted Avg standard
          </span>
        </div>
      </div>

      {/* SUB TABS & SEARCH */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('STOCK_MASTER')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'STOCK_MASTER'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stock Balance Master ({materials.length})
            </button>
            <button
              onClick={() => setActiveSubTab('TRANSACTIONS')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'TRANSACTIONS'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Movement Ledger & MRNs ({stockTransactions.length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search items, SKU code, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* --- VIEW 1: STOCK MASTER --- */}
        {activeSubTab === 'STOCK_MASTER' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Material Name & SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Standard Rate</th>
                  <th className="py-3 px-3">Current Stock</th>
                  <th className="py-3 px-3">Total Value</th>
                  <th className="py-3 px-3">Safety Min Reorder</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredMaterials.map((mat) => {
                  const isLow = mat.currentStockTotal <= mat.minReorderLevel;
                  return (
                    <tr key={mat.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-white block">{mat.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400">{mat.code}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {mat.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        ₹{mat.standardRate.toLocaleString()} / {mat.unit}
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <span className={`font-extrabold text-sm ${isLow ? 'text-rose-400' : 'text-slate-100'}`}>
                          {mat.currentStockTotal.toLocaleString()} {mat.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                        ₹{(mat.currentStockTotal * mat.standardRate).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-400">
                        {mat.minReorderLevel} {mat.unit}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 justify-end w-fit ml-auto">
                            <AlertTriangle className="h-3 w-3" /> Reorder Needed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* --- VIEW 2: TRANSACTIONS --- */}
        {activeSubTab === 'TRANSACTIONS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Date & Doc Ref</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Material</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Total Value</th>
                  <th className="py-3 px-3">Allocated To (Floor/Chainage)</th>
                  <th className="py-3 px-3 text-right">Received / Subcontractor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {stockTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-white block">{tx.referenceDocument}</span>
                      <span className="text-[10px] text-slate-400">{tx.date}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.transactionType === 'ISSUE'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {tx.transactionType}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-200">
                      {tx.materialName}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {tx.quantity} {tx.unit}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold">
                      ₹{tx.totalValue.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 text-slate-300">
                      {tx.issuedToChainageOrFloor || 'Store Stock Replenishment'}
                    </td>

                    <td className="py-3.5 px-3 text-right text-slate-400 text-[11px]">
                      {tx.contractorOrPerson}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISSUE / RECEIVE TRANSACTION MODAL */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-amber-400" />
              Stock Movement & Material Requisition Note (MRN)
            </h3>

            <form onSubmit={handleCreateTx} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Transaction Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as StockTransaction['transactionType'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                  >
                    <option value="ISSUE">ISSUE TO SITE / ACTIVITY</option>
                    <option value="PURCHASE_RECEIPT">PURCHASE RECEIPT (GRN)</option>
                    <option value="TRANSFER_IN">TRANSFER IN FROM CENTRAL</option>
                    <option value="RETURN">RETURN TO STORE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Material *</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code}) - Stock: {m.currentStockTotal} {m.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Quantity ({selectedMaterial?.unit}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Document / Slip # *</label>
                  <input
                    type="text"
                    required
                    value={referenceDocument}
                    onChange={(e) => setReferenceDocument(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {txType === 'ISSUE' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Allocated Activity / Chainage / Floor *
                  </label>
                  <input
                    type="text"
                    required
                    value={issuedToChainageOrFloor}
                    onChange={(e) => setIssuedToChainageOrFloor(e.target.value)}
                    placeholder="e.g. 5th Floor Slab Casting / Km 124+400 WMM"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Contractor / Subcontractor / Receiver *
                </label>
                <input
                  type="text"
                  required
                  value={contractorOrPerson}
                  onChange={(e) => setContractorOrPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW MATERIAL MODAL */}
      {isNewMatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-cyan-400" />
              Add New Material SKU Master
            </h3>

            <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  placeholder="e.g. Tata Tiscon 12mm TMT Bar"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newMatCode}
                    onChange={(e) => setNewMatCode(e.target.value)}
                    placeholder="MAT-TMT-12"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value as Material['category'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="CEMENT">CEMENT</option>
                    <option value="STEEL">STEEL / TMT</option>
                    <option value="AGGREGATE">AGGREGATE</option>
                    <option value="SAND">SAND / M-SAND</option>
                    <option value="BITUMEN">BITUMEN</option>
                    <option value="WMM_MIX">WMM MIX</option>
                    <option value="BRICKS_BLOCKS">BRICKS / BLOCKS</option>
                    <option value="DIESEL">DIESEL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value)}
                    placeholder="Bags, Tonnes, m³"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    value={newMatRate}
                    onChange={(e) => setNewMatRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={newMatStock}
                    onChange={(e) => setNewMatStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Safety Min Reorder Level</label>
                <input
                  type="number"
                  value={newMatMinStock}
                  onChange={(e) => setNewMatMinStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
