import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  ShoppingCart,
  AlertTriangle,
  Package,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Phone,
  Truck
} from 'lucide-react';

export const ReorderSuggestionsModule: React.FC = () => {
  const { materials, addStockTransaction } = useERP();

  // Low stock items requiring procurement
  const lowStockItems = materials.filter(
    (m) => m.currentStockTotal <= m.minReorderLevel
  );

  const handleCreatePO = (item: typeof materials[0]) => {
    const recommendedQty = Math.max(item.minReorderLevel * 2, 50);
    addStockTransaction({
      date: new Date().toISOString().substring(0, 10),
      materialId: item.id,
      materialName: item.name,
      type: 'PO_RECEIPT',
      projectId: 'proj-road-1',
      siteId: 'site-road-1',
      referenceNumber: `PO-AUTO-${Date.now().toString().slice(-4)}`,
      quantityIn: recommendedQty,
      quantityOut: 0,
      balanceQuantity: item.currentStockTotal + recommendedQty,
      unit: item.unit,
      unitRate: item.standardRate,
      totalValue: recommendedQty * item.standardRate,
      sourceStore: 'Authorized Vendor Depot',
      destStore: item.storeLocation,
      performedBy: 'Auto Procurement Engine',
      remarks: 'Restock order placed against low inventory threshold'
    });
    alert(`Generated Purchase Order for ${recommendedQty} ${item.unit} of ${item.name}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-amber-400" />
            Reorder Suggestions & Procurement
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated restocking engine based on minimum buffer stock and consumption velocity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c1427] border border-[#182643]">
          <div className="text-xs text-slate-400">Total Items Monitored</div>
          <div className="text-2xl font-extrabold text-white mt-1">{materials.length} SKUs</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#1f0a12] border border-rose-900/60">
          <div className="text-xs text-rose-300">Action Required (Critical)</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{lowStockItems.length} SKUs</div>
        </div>
        <div className="p-5 rounded-2xl bg-[#051c14] border border-emerald-900/60">
          <div className="text-xs text-emerald-300">Sufficient Stock Items</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{materials.length - lowStockItems.length} SKUs</div>
        </div>
      </div>

      {/* Suggested Items Table */}
      <div className="bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl overflow-hidden">
        <h3 className="text-base font-bold text-white mb-4">Urgent Restocking Queue</h3>
        
        {lowStockItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">All Stock Levels are Healthy!</p>
            <p className="text-xs text-slate-500 mt-1">No items currently below minimum buffer limits.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#182643]">
            {lowStockItems.map((item) => {
              const suggestedOrder = Math.max(item.minReorderLevel * 2, 50);
              const estimatedCost = suggestedOrder * item.standardRate;

              return (
                <div key={item.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {item.code}
                      </span>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-4">
                      <span>Category: <strong className="text-slate-200">{item.category}</strong></span>
                      <span>Current Stock: <strong className="text-rose-400">{item.currentStockTotal} {item.unit}</strong></span>
                      <span>Minimum Safe Level: <strong className="text-slate-200">{item.minReorderLevel} {item.unit}</strong></span>
                      <span>Location: <strong className="text-slate-200">{item.storeLocation}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Suggested Order</div>
                      <div className="text-sm font-bold text-emerald-400">
                        +{suggestedOrder} {item.unit}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ≈ ₹{estimatedCost.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreatePO(item)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                    >
                      Issue PO
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
