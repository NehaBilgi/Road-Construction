import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  CreditCard,
  X,
  Store,
  Truck,
  Calendar,
  RotateCcw
} from 'lucide-react';

export type PayeeType = 'MATERIAL_VENDOR' | 'RENTAL_OWNER';

export interface VendorAdvanceRecord {
  id: string;
  date: string;
  siteName: string;
  payeeType?: PayeeType;
  vendorName: string;
  amount: number;
  paymentMode: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'UPI';
  referenceNo?: string;
  remarks?: string;
}

interface RentalOwnerSummary {
  ownerName: string;
  vehicleNumbers: string[];
  grossRentAmount: number;
  dieselCost: number;
  dieselLitres: number;
  netRentPayable: number;
  tripCount: number;
}

// Storage keys matching MaterialHaulageTripsModule.tsx
export const STORAGE_VENDOR_ADVANCES_KEY = 'CONSTRUCTION_PRO_VENDOR_ADVANCES_V1';
const STORAGE_HAULAGE_KEY = 'CONSTRUCTION_PRO_HAULAGE_TRIPS_V2';
const STORAGE_FLEET_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';
const STORAGE_DIESEL_KEY = 'CONSTRUCTION_PRO_DIESEL_LOGS_V1';
const STORAGE_VENDORS_KEY = 'CONSTRUCTION_PRO_VENDOR_NAMES_V1';

const formatDateDMY = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split(' ')[0].split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  }
  return dateStr;
};

const getStartOfMonthDMY = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `01-${month}-${year}`;
};

const getEndOfMonthDMY = () => {
  const d = new Date();
  const year = d.getFullYear();
  const nextMonthFirst = new Date(year, d.getMonth() + 1, 1);
  const lastDay = new Date(nextMonthFirst.getTime() - 1);
  const day = String(lastDay.getDate()).padStart(2, '0');
  const month = String(lastDay.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

const dmyToYmd = (dmyStr: string) => {
  if (!dmyStr) return '';
  const parts = dmyStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) return dmyStr;
    const [d, m, y] = parts;
    return `${y}-${m}-${d}`;
  }
  return dmyStr;
};

const ymdToDmy = (ymdStr: string) => {
  if (!ymdStr) return '';
  const parts = ymdStr.split('-');
  if (parts.length === 3) {
    if (parts[2].length === 4) return ymdStr;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
  }
  return ymdStr;
};

const toComparableDate = (dateStr: string) => {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0].split(' ')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return clean;
  if (parts[0].length === 4) {
    return `${parts[0]}${parts[1]}${parts[2]}`;
  }
  return `${parts[2]}${parts[1]}${parts[0]}`;
};

export const VendorAdvancesModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId, currentUser, userRole } = useERP() as any;

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
      return saved ? JSON.parse(saved) : ['MBB CRUSHER', 'GIRGOANKAR', 'Mahalaxmi Stone Crusher'];
    } catch {
      return ['MBB CRUSHER', 'GIRGOANKAR', 'Mahalaxmi Stone Crusher'];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [fromDate, setFromDate] = useState<string>(getStartOfMonthDMY);
  const [toDate, setToDate] = useState<string>(getEndOfMonthDMY);

  // Form state
  const [payeeType, setPayeeType] = useState<PayeeType>('RENTAL_OWNER');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [siteName, setSiteName] = useState(activeSiteName);
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<VendorAdvanceRecord['paymentMode']>('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Read Trips, Fleet, and Diesel logs to compute Gross Rent, Diesel Deductions, and Net Payable
  const rentalOwners = useMemo<RentalOwnerSummary[]>(() => {
    let haulageTrips: any[] = [];
    let fleetVehicles: any[] = [];
    let dieselLogs: any[] = [];

    try {
      const savedTrips = localStorage.getItem(STORAGE_HAULAGE_KEY);
      if (savedTrips) haulageTrips = JSON.parse(savedTrips);
    } catch {
      haulageTrips = [];
    }

    try {
      const savedFleet = localStorage.getItem(STORAGE_FLEET_KEY);
      if (savedFleet) fleetVehicles = JSON.parse(savedFleet);
    } catch {
      fleetVehicles = [];
    }

    try {
      const savedDiesel = localStorage.getItem(STORAGE_DIESEL_KEY);
      if (savedDiesel) dieselLogs = JSON.parse(savedDiesel);
    } catch {
      dieselLogs = [];
    }

    const fleetMap = new Map<string, any>();
    fleetVehicles.forEach((v) => {
      fleetMap.set((v.vehicleNumber || '').trim().toUpperCase(), v);
    });

    const summaryMap: Record<string, RentalOwnerSummary> = {};

    haulageTrips.forEach((trip) => {
      const tripSite = (trip.siteName || '').trim();
      if (tripSite && activeSiteName && tripSite.toLowerCase() !== activeSiteName.toLowerCase()) {
        return;
      }

      const vehNumber = (trip.vehicleNumber || '').trim().toUpperCase();
      const matchedFleet = fleetMap.get(vehNumber);

      const owner = (trip.ownerName || matchedFleet?.ownerName || '').trim();
      const isRental = trip.isRental || matchedFleet?.ownershipType === 'rented' || Boolean(owner);

      if (isRental && owner) {
        const tripCount = Number(trip.dayTrips) || 1;
        const rentalRate = matchedFleet?.rentalAmount ?? Number(trip.ratePerBrass) ?? 1500;
        const tripCost = tripCount * rentalRate;

        if (!summaryMap[owner]) {
          summaryMap[owner] = {
            ownerName: owner,
            vehicleNumbers: [],
            grossRentAmount: 0,
            dieselCost: 0,
            dieselLitres: 0,
            netRentPayable: 0,
            tripCount: 0
          };
        }

        if (vehNumber && !summaryMap[owner].vehicleNumbers.includes(vehNumber)) {
          summaryMap[owner].vehicleNumbers.push(vehNumber);
        }

        summaryMap[owner].grossRentAmount += tripCost;
        summaryMap[owner].tripCount += tripCount;
      }
    });

    // Minus Diesel: Aggregate diesel logs for all vehicles owned by each owner
    Object.values(summaryMap).forEach((summary) => {
      const upperVehicles = summary.vehicleNumbers.map((v) => v.toUpperCase());

      const matchingDieselLogs = dieselLogs.filter((d) => {
        const logVeh = (d.vehicleNumber || '').trim().toUpperCase();
        const logSite = (d.siteName || '').trim().toLowerCase();
        const matchSite = !activeSiteName || !logSite || logSite === activeSiteName.toLowerCase();
        return matchSite && upperVehicles.includes(logVeh);
      });

      const totalDieselCost = matchingDieselLogs.reduce(
        (sum, log) => sum + (Number(log.totalCost) || 0),
        0
      );
      const totalDieselLitres = matchingDieselLogs.reduce(
        (sum, log) => sum + (Number(log.litres) || 0),
        0
      );

      summary.dieselCost = totalDieselCost;
      summary.dieselLitres = totalDieselLitres;
      // Net Amount after deducting Diesel
      summary.netRentPayable = Math.max(0, summary.grossRentAmount - totalDieselCost);
    });

    return Object.values(summaryMap);
  }, [activeSiteName, isModalOpen]);

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

      const recComp = toComparableDate(a.date);
      const fromComp = toComparableDate(fromDate);
      const toComp = toComparableDate(toDate);

      if (fromComp && recComp < fromComp) return false;
      if (toComp && recComp > toComp) return false;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        a.vendorName.toLowerCase().includes(q) ||
        (a.referenceNo || '').toLowerCase().includes(q) ||
        a.date.includes(q) ||
        formatDateDMY(a.date).includes(q);

      return matchSite && matchQuery;
    });
  }, [advances, activeSiteName, fromDate, toDate, searchQuery]);

  const totalAdvancePaid = useMemo(() => {
    return filtered.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  }, [filtered]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setPayeeType('RENTAL_OWNER');
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
      alert('Access Denied: Only administrators have permission to edit records.');
      return;
    }
    setEditingId(rec.id);
    setPayeeType(rec.payeeType || 'MATERIAL_VENDOR');
    setDate(dmyToYmd(rec.date));
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
      alert('Access Denied: Only administrators have permission to delete records.');
      return;
    }
    if (window.confirm('Delete this payment advance record?')) {
      setAdvances((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSelectRentalOwner = (owner: string) => {
    setVendorName(owner);
    const summary = rentalOwners.find((o) => o.ownerName === owner);
    if (summary) {
      // Auto-set the NET Amount (Gross Rent MINUS Diesel)
      setAmount(summary.netRentPayable > 0 ? summary.netRentPayable : '');

      const vehList = summary.vehicleNumbers.join('/');
      if (summary.dieselCost > 0) {
        setRemarks(
          `Net rent: Gross ₹${summary.grossRentAmount.toLocaleString('en-IN')} - Diesel ₹${summary.dieselCost.toLocaleString('en-IN')} (${summary.tripCount} trips, ${vehList})`
        );
      } else {
        setRemarks(
          `Rent payout for ${summary.tripCount} trip(s) [${vehList}]`
        );
      }
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
    if (payeeType === 'MATERIAL_VENDOR' && trimmedVendor && !savedVendors.includes(trimmedVendor)) {
      const updated = [trimmedVendor, ...savedVendors];
      setSavedVendors(updated);
      localStorage.setItem(STORAGE_VENDORS_KEY, JSON.stringify(updated));
    }

    const newRecord: VendorAdvanceRecord = {
      id: editingId || `ADV-${Date.now().toString().slice(-4)}`,
      date: ymdToDmy(date),
      siteName: siteName.trim() || activeSiteName,
      payeeType,
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
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Vendor & Rental Advances</h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Record payments to material vendors and rental vehicle owners for {activeSiteName}.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>+ Record Payment / Advance</span>
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

      {/* Search & Date Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1427] border border-[#182643]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-6 relative">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Search Records</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by payee name, ref no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 placeholder-slate-500 text-xs"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-400">
                From Date <span className="text-slate-500 font-normal">({fromDate})</span>
              </label>
              <button
                type="button"
                onClick={() => setFromDate(getStartOfMonthDMY())}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                Start of Month
              </button>
            </div>
            <div className="relative flex items-center bg-[#080d19] border border-[#1E293B] rounded-xl px-3 py-1.5 focus-within:border-amber-500">
              <Calendar className="w-4 h-4 text-amber-400 mr-2 shrink-0 pointer-events-none" />
              <input
                type="date"
                value={dmyToYmd(fromDate)}
                onChange={(e) => setFromDate(ymdToDmy(e.target.value))}
                className="w-full bg-transparent text-white outline-none font-mono text-xs cursor-pointer"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-400">
                To Date <span className="text-slate-500 font-normal">({toDate})</span>
              </label>
              <button
                type="button"
                onClick={() => setToDate(getEndOfMonthDMY())}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                End of Month
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 flex items-center bg-[#080d19] border border-[#1E293B] rounded-xl px-3 py-1.5 focus-within:border-amber-500">
                <Calendar className="w-4 h-4 text-amber-400 mr-2 shrink-0 pointer-events-none" />
                <input
                  type="date"
                  value={dmyToYmd(toDate)}
                  onChange={(e) => setToDate(ymdToDmy(e.target.value))}
                  className="w-full bg-transparent text-white outline-none font-mono text-xs cursor-pointer"
                />
              </div>

              {(fromDate !== getStartOfMonthDMY() || toDate !== getEndOfMonthDMY() || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setFromDate(getStartOfMonthDMY());
                    setToDate(getEndOfMonthDMY());
                    setSearchQuery('');
                  }}
                  title="Reset all filters"
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase text-slate-400 bg-[#080d19]/80">
              <th className="py-3 px-4">DATE</th>
              <th className="py-3 px-4">PAYEE NAME</th>
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
                  No advance payments recorded for {activeSiteName} in the selected date range.
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const isRental = a.payeeType === 'RENTAL_OWNER';
                return (
                  <tr key={a.id} className="hover:bg-[#121c33]/50">
                    <td className="py-3 px-4 font-mono text-slate-300">{formatDateDMY(a.date)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isRental ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Vehicle Owner
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Store className="w-3 h-3" /> Vendor
                          </span>
                        )}
                        <span className={`font-bold ${isRental ? 'text-blue-300' : 'text-emerald-300'}`}>
                          {a.vendorName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{a.paymentMode}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {a.referenceNo && <span className="font-mono text-white mr-2">Ref: {a.referenceNo}</span>}
                      <span>{a.remarks || '—'}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-amber-400">
                      ₹{a.amount.toLocaleString('en-IN')}
                    </td>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#121927] border border-[#1E293B] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>{editingId ? 'Edit Payment Record' : 'Record Advance / Rental Payment'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payee Type Selection Tabs */}
            <div className="flex bg-[#080d19] p-1 rounded-xl border border-[#1E293B]">
              <button
                type="button"
                onClick={() => {
                  setPayeeType('RENTAL_OWNER');
                  setVendorName('');
                  setAmount('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  payeeType === 'RENTAL_OWNER'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Rental Vehicle Owner</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayeeType('MATERIAL_VENDOR');
                  setVendorName('');
                  setAmount('');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  payeeType === 'MATERIAL_VENDOR'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Material Vendor</span>
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
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none cursor-pointer"
                />
              </div>

              {payeeType === 'RENTAL_OWNER' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-bold">
                      Select Rental Owner (from Trips) *
                    </label>
                    <span className="text-[10px] text-blue-400 font-mono">
                      {rentalOwners.length} owners found
                    </span>
                  </div>

                  {rentalOwners.length > 0 ? (
                    <select
                      required
                      value={vendorName}
                      onChange={(e) => handleSelectRentalOwner(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#162032] border border-[#1E293B] focus:border-blue-500 rounded-xl text-white outline-none cursor-pointer font-medium"
                    >
                      <option value="">-- Choose Owner from Haulage Trips --</option>
                      {rentalOwners.map((owner) => (
                        <option key={owner.ownerName} value={owner.ownerName}>
                          {owner.ownerName} ({owner.vehicleNumbers.join('/') || 'Vehicles'}) — {owner.tripCount} trips {owner.dieselCost > 0 ? `(Net: ₹${owner.netRentPayable.toLocaleString('en-IN')} | Diesel: -₹${owner.dieselCost.toLocaleString('en-IN')})` : `(₹${owner.netRentPayable.toLocaleString('en-IN')})`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Type owner name"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                    />
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Vendor / Quarry Supplier Name *</label>
                  <input
                    type="text"
                    list="vendor-adv-list"
                    required
                    placeholder="e.g. MBB CRUSHER / GIRGOANKAR"
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
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-bold">
                    {payeeType === 'RENTAL_OWNER' ? 'Net Amount to Pay (₹) *' : 'Amount to Pay (₹) *'}
                  </label>
                  {payeeType === 'RENTAL_OWNER' && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      (Trip Rent - Diesel deducted)
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0.00"
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
                    <option value="CASH">Cash (Petty Cash)</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Ref / UTR No.</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-9876543210"
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
                  placeholder={
                    payeeType === 'RENTAL_OWNER'
                      ? 'e.g. Rent payment for tipper trips'
                      : 'e.g. GSB supply advance payment'
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-white cursor-pointer ${
                    payeeType === 'RENTAL_OWNER'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  {editingId ? 'Update Record' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorAdvancesModule;
