import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import { Plus, Search, Trash2, Edit2, CreditCard, X, Store } from 'lucide-react';

export interface VendorAdvanceRecord {
  id: string;
  date: string;
  siteName: string;
  vendorName: string;
  amount: number;
  paymentMode: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'UPI';
  referenceNo?: string;
  remarks?: string;
}

export const STORAGE_VENDOR_ADVANCES_KEY = 'CONSTRUCTION_PRO_VENDOR_ADVANCES_V1';
const STORAGE_VENDORS_KEY = 'CONSTRUCTION_PRO_VENDOR_NAMES_V1';

export const VendorAdvancesModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId, currentUser, userRole } = useERP() as any;

  // Determine if active session has Admin privileges
  const currentRole = String(userRole || currentUser?.role || '').toUpperCase();
  const isAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN';

  const currentActiveSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const activeSiteName = currentActiveSite?.siteName || siteSheets[0]?.siteName || 'MULWAD';

  const [advances, setAdvances] = useState<VendorAdvanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VENDOR_ADVANCES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedVendors, setSavedVendors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VENDORS_KEY);
      return saved ? JSON.parse(saved) : ['gigaonkar', 'Mahalaxmi Stone Crusher', 'Bilgi Hot Mix Plant Quarry #1'];
    } catch {
      return ['gigaonkar', 'Mahalaxmi Stone Crusher', 'Bilgi Hot Mix Plant Quarry #1'];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [siteName, setSiteName] = useState(activeSiteName);
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<VendorAdvanceRecord['paymentMode']>('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VENDOR_ADVANCES_KEY, JSON.stringify(advances));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed saving advances', e);
    }
  }, [advances]);

  const filtered = useMemo(() => {
    return advances.filter((a) => {
      const matchSite = !activeSiteName || a.siteName === activeSiteName;
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || a.vendorName.toLowerCase().includes(q) || (a.referenceNo || '').toLowerCase().includes(q);
      return matchSite && matchQuery;
    });
  }, [advances, activeSiteName, searchQuery]);

  const totalAdvancePaid = useMemo(() => {
    return filtered.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [filtered]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setSiteName(activeSiteName);
    setVendorName('');
    setAmount('');
    setPaymentMode('UPI');
    setReferenceNo('');
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleEdit = (rec: VendorAdvanceRecord) => {
    if (!isAdmin) {
      alert('Access Denied: Only administrators have permission to edit vendor advances.');
      return;
    }
    setEditingId(rec.id);
    setDate(rec.date);
    setSiteName(rec.siteName);
    setVendorName(rec.vendorName);
    setAmount(rec.amount);
    setPaymentMode(rec.paymentMode);
    setReferenceNo(rec.referenceNo || '');
    setRemarks(rec.remarks || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      alert('Access Denied: Only administrators have permission to delete vendor advances.');
      return;
    }
    if (window.confirm('Delete this vendor advance payment record?')) {
      setAdvances((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && !isAdmin) {
      alert('Access Denied: Only administrators can update existing records.');
      return;
    }
    if (amount === '' || !vendorName.trim()) return;

    const trimmedVendor = vendorName.trim();
    if (trimmedVendor && !savedVendors.includes(trimmedVendor)) {
      const updated = [trimmedVendor, ...savedVendors];
      setSavedVendors(updated);
      localStorage.setItem(STORAGE_VENDORS_KEY, JSON.stringify(updated));
    }

    const newRecord: VendorAdvanceRecord = {
      id: editingId || `ADV-${Date.now().toString().slice(-4)}`,
      date,
      siteName: siteName.trim() || activeSiteName,
      vendorName: trimmedVendor,
      amount: Number(amount),
      paymentMode,
      referenceNo: referenceNo.trim(),
      remarks: remarks.trim()
    };

    if (editingId) {
      setAdvances(advances.map((a) => (a.id === editingId ? newRecord : a)));
    } else {
      setAdvances([newRecord, ...advances]);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-slate-100 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Vendor Advances</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Record advance payments to material vendors for {activeSiteName} (auto-deducted from purchase statements).
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>+ Record Vendor Advance</span>
        </button>
      </div>

      {/* Summary Stat */}
      <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#1E293B] shadow-xl flex items-center justify-between max-w-sm">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Advances Paid</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">₹{totalAdvancePaid.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{filtered.length} advance transactions</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Search */}
      <div className="p-3 rounded-2xl bg-[#0c1427] border border-[#182643] flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by vendor name, ref no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80">
              <th className="py-3 px-4">DATE</th>
              <th className="py-3 px-4">VENDOR NAME</th>
              <th className="py-3 px-4">PAYMENT MODE</th>
              <th className="py-3 px-4">REF / REMARKS</th>
              <th className="py-3 px-4 text-right">ADVANCE AMOUNT (₹)</th>
              <th className="py-3 px-4 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No advance payments recorded for {activeSiteName}.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#121c33]/50">
                  <td className="py-3 px-4 font-mono text-slate-300">{a.date}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-400/70" />
                    <span>{a.vendorName}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{a.paymentMode}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {a.referenceNo && <span className="font-mono text-white mr-2">Ref: {a.referenceNo}</span>}
                    <span>{a.remarks || '—'}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-amber-400">₹{a.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-center">
                    {isAdmin ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(a)}
                          className="p-1 rounded text-slate-400 hover:text-blue-400 cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-600 font-mono text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#121927] border border-[#1E293B] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>{editingId ? 'Edit Vendor Advance' : 'Record Advance to Vendor'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Vendor / Supplier Name *</label>
                <input
                  type="text"
                  list="vendor-adv-list"
                  required
                  placeholder="e.g. Supplier Name "
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
                <datalist id="vendor-adv-list">
                  {savedVendors.map((v, i) => (
                    <option key={i} value={v} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Advance Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e: any) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="UPI">UPI / GPay</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ref / UTR No.</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-12345"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. GSB supply advance payment"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white cursor-pointer">
                  {editingId ? 'Update Advance' : 'Save Advance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
