import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  Fuel,
  Download,
  ChevronDown,
  Lock,
  Check,
  Truck,
  Calendar,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export interface DieselFuelRecord {
  id: string;
  date: string;
  siteName: string;
  vehicleNumber: string;
  litres: number;
  ratePerLitre: number;
  totalCost: number;
}

export interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  category: string;
  metricType: 'KM' | 'HMR';
  ownershipType?: 'company' | 'rented';
}

const STORAGE_DIESEL_KEY = 'CONSTRUCTION_PRO_DIESEL_LOGS_V1';
const STORAGE_FLEET_KEY = 'CONSTRUCTION_PRO_FLEET_VEHICLES_V1';
const STORAGE_DEFAULT_FUEL_RATE_KEY = 'CONSTRUCTION_PRO_DEFAULT_FUEL_RATE_V1';

const DEFAULT_FLEET: FleetVehicle[] = [
  { id: 'v-1', vehicleNumber: 'KA-28-EX-8901', vehicleType: 'Hydraulic Excavator (CAT/Hitachi)', category: 'Earthmoving', metricType: 'HMR', ownershipType: 'company' },
  { id: 'v-2', vehicleNumber: 'KA-28-JC-3342', vehicleType: 'Backhoe Loader (JCB 3DX)', category: 'Earthmoving', metricType: 'HMR', ownershipType: 'rented' },
  { id: 'v-3', vehicleNumber: 'MH-12-DT-5510', vehicleType: 'Tipper / Dump Truck', category: 'Haulage', metricType: 'KM', ownershipType: 'rented' },
  { id: 'v-4', vehicleNumber: 'KA-28-TR-1092', vehicleType: 'Tractor & Trolley', category: 'Transport', metricType: 'HMR', ownershipType: 'company' },
  { id: 'v-5', vehicleNumber: 'KA-28-JP-7890', vehicleType: 'Site Jeep / Bolero / Pickup', category: 'Site Inspection', metricType: 'KM', ownershipType: 'company' },
  { id: 'v-6', vehicleNumber: 'KA-28-CR-2200', vehicleType: 'Car / SUV', category: 'Staff Transport', metricType: 'KM', ownershipType: 'company' }
];

const INITIAL_RECORDS: DieselFuelRecord[] = [
  {
    id: 'DSL-101',
    date: '2026-08-19',
    siteName: 'SINDAGI - ALMEL ROAD',
    vehicleNumber: 'MH-12-DT-5510',
    litres: 100,
    ratePerLitre: 92.50,
    totalCost: 9250.00
  }
];

// Helper: Format Date string to DD-MM-YYYY
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

// Helper: Start of current month in DD-MM-YYYY
const getStartOfMonthDMY = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `01-${month}-${year}`;
};

// Helper: End of current month in DD-MM-YYYY
const getEndOfMonthDMY = () => {
  const d = new Date();
  const year = d.getFullYear();
  const nextMonthFirst = new Date(year, d.getMonth() + 1, 1);
  const lastDay = new Date(nextMonthFirst.getTime() - 1);
  const day = String(lastDay.getDate()).padStart(2, '0');
  const month = String(lastDay.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

// Conversion helper: DD-MM-YYYY -> YYYY-MM-DD
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

// Conversion helper: YYYY-MM-DD -> DD-MM-YYYY
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

// Converts date to comparable YYYYMMDD string
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

export const DieselFuelManagementModule: React.FC = () => {
  const { siteSheets = [], selectedSiteId, currentUser, userRole } = useERP() as any;

  // Admin access validation
  const currentRole = String(userRole || currentUser?.role || '').toUpperCase();
  const isAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN';

  const currentActiveSite = siteSheets.find((s: any) => s.siteId === selectedSiteId);
  const activeSiteName = currentActiveSite?.siteName || siteSheets[0]?.siteName || 'SINDAGI - ALMEL ROAD';

  const [records, setRecords] = useState<DieselFuelRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DIESEL_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem(STORAGE_DIESEL_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  });

  // Machinery fleet state
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FLEET_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_FLEET;
    } catch {
      return DEFAULT_FLEET;
    }
  });

  // Default editable fuel rate
  const [defaultSavedRate, setDefaultSavedRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DEFAULT_FUEL_RATE_KEY);
      return saved ? Number(saved) : 92.50;
    } catch {
      return 92.50;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Date Range State in DD-MM-YYYY format
  const [fromDate, setFromDate] = useState<string>(getStartOfMonthDMY);
  const [toDate, setToDate] = useState<string>(getEndOfMonthDMY);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [siteName, setSiteName] = useState(activeSiteName);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isVehicleMenuOpen, setIsVehicleMenuOpen] = useState(false);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);

  const [litres, setLitres] = useState<number | ''>('');
  const [ratePerLitre, setRatePerLitre] = useState<number | ''>(defaultSavedRate);
  const [rateSavedNotice, setRateSavedNotice] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(e.target as Node)) {
        setIsVehicleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedFleet = localStorage.getItem(STORAGE_FLEET_KEY);
        setFleetVehicles(savedFleet ? JSON.parse(savedFleet) : DEFAULT_FLEET);

        const savedRate = localStorage.getItem(STORAGE_DEFAULT_FUEL_RATE_KEY);
        if (savedRate) setDefaultSavedRate(Number(savedRate));
      } catch {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_DIESEL_KEY, JSON.stringify(records));
  }, [records]);

  const computedTotalCost = useMemo(() => {
    const ltrs = Number(litres) || 0;
    const rate = Number(ratePerLitre) || 0;
    return ltrs * rate;
  }, [litres, ratePerLitre]);

  // Dynamically filter records by the active site and date range
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSite = r.siteName === activeSiteName;

      const recComp = toComparableDate(r.date);
      const fromComp = toComparableDate(fromDate);
      const toComp = toComparableDate(toDate);

      if (fromComp && recComp < fromComp) return false;
      if (toComp && recComp > toComp) return false;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        r.vehicleNumber.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        formatDateDMY(r.date).includes(q);

      return matchSite && matchQuery;
    });
  }, [records, activeSiteName, fromDate, toDate, searchQuery]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSiteName, fromDate, toDate, searchQuery]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalLitresDispensed = filtered.reduce((sum, r) => sum + r.litres, 0);
  const totalFuelCost = filtered.reduce((sum, r) => sum + r.totalCost, 0);

  const handleSaveDefaultRate = () => {
    if (ratePerLitre !== '' && Number(ratePerLitre) > 0) {
      const newRate = Number(ratePerLitre);
      setDefaultSavedRate(newRate);
      localStorage.setItem(STORAGE_DEFAULT_FUEL_RATE_KEY, String(newRate));
      setRateSavedNotice(true);
      setTimeout(() => setRateSavedNotice(false), 2000);
    }
  };

  const handleOpenAdd = () => {
    try {
      const savedFleet = localStorage.getItem(STORAGE_FLEET_KEY);
      if (savedFleet) {
        setFleetVehicles(JSON.parse(savedFleet));
      }
    } catch {}

    setEditingId(null);
    setDate(new Date().toISOString().substring(0, 10));
    setSiteName(activeSiteName);
    setVehicleNumber('');
    setIsVehicleMenuOpen(false);
    setLitres('');
    setRatePerLitre(defaultSavedRate);
    setIsModalOpen(true);
  };

  const handleEdit = (record: DieselFuelRecord) => {
    if (!isAdmin) {
      alert('Access Denied: Only administrators have permission to edit fuel records.');
      return;
    }
    setEditingId(record.id);
    setDate(dmyToYmd(record.date));
    setSiteName(record.siteName);
    setVehicleNumber(record.vehicleNumber);
    setIsVehicleMenuOpen(false);
    setLitres(record.litres);
    setRatePerLitre(record.ratePerLitre);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      alert('Access Denied: Only administrators have permission to delete fuel records.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this fuel record?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && !isAdmin) {
      alert('Access Denied: Only administrators can update existing records.');
      return;
    }
    if (litres === '' || ratePerLitre === '' || !vehicleNumber.trim()) return;

    const record: DieselFuelRecord = {
      id: editingId || `DSL-${Date.now().toString().slice(-4)}`,
      date: ymdToDmy(date),
      siteName: siteName.trim() || activeSiteName,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      litres: Number(litres),
      ratePerLitre: Number(ratePerLitre),
      totalCost: computedTotalCost
    };

    if (editingId) {
      setRecords(records.map((r) => (r.id === editingId ? record : r)));
    } else {
      setRecords([record, ...records]);
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Site Name', 'Vehicle Number', 'Litres', 'Rate/Litre', 'Total Cost'];
    const rows = filtered.map((r) => [
      formatDateDMY(r.date),
      `"${r.siteName}"`,
      `"${r.vehicleNumber}"`,
      r.litres,
      r.ratePerLitre,
      r.totalCost
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Diesel_Fuel_Log_${activeSiteName}_${Date.now()}.csv`;
    link.click();
  };

  const selectedVehicleObj = useMemo(() => {
    return fleetVehicles.find(
      (v) => v.vehicleNumber.trim().toUpperCase() === vehicleNumber.trim().toUpperCase()
    );
  }, [fleetVehicles, vehicleNumber]);

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Diesel Fuel Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">Track daily fuel dispensing, vehicle consumption, and costs for {activeSiteName}.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#142038] hover:bg-[#1f2f52] border border-[#22365e] text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Fuel Dispense</span>
          </button>
        </div>
      </div>

      {/* Search & DD-MM-YYYY Date Range Filter Bar */}
      <div className="p-4 rounded-3xl bg-[#0c1427] border border-[#182643]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Search Records</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by vehicle number or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#080d19] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500 placeholder-slate-500 text-xs"
              />
            </div>
          </div>

          {/* From Date (DD-MM-YYYY) */}
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

          {/* To Date (DD-MM-YYYY) */}
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[#0c1427] border border-amber-900/40">
          <div className="text-[11px] font-semibold text-slate-400">Total Litres Dispensed ({activeSiteName})</div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-1">
            {totalLitresDispensed.toLocaleString()} <span className="text-sm font-normal text-slate-400">L</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1427] border border-emerald-900/40">
          <div className="text-[11px] font-semibold text-slate-400">Total Fuel Cost</div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            ₹{totalFuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Fuel Log Table */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#1E293B] bg-[#0d1527]/50 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Diesel Fuel Dispense Reconciliation Log</h2>
          <span className="text-xs text-slate-400">{filtered.length} Entries Recorded</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-[#080d19]/80">
                <th className="py-3.5 px-6">DATE</th>
                <th className="py-3.5 px-6">SITE NAME</th>
                <th className="py-3.5 px-6">VEHICLE NUMBER</th>
                <th className="py-3.5 px-4 text-right">LITRES DISPENSED</th>
                <th className="py-3.5 px-4 text-right">RATE / LITRE</th>
                <th className="py-3.5 px-6 text-right">TOTAL VOUCHER COST (₹)</th>
                <th className="py-3.5 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No fuel dispense logs found for {activeSiteName} in the selected date range.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#121c33]/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-300">
                      {formatDateDMY(r.date)}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">{r.siteName}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded bg-amber-900/30 text-amber-400 border border-amber-700/50 font-mono font-bold">
                        {r.vehicleNumber}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-black text-amber-400 text-sm">
                      {r.litres.toFixed(1)} L
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-400">
                      ₹{r.ratePerLitre.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-black text-emerald-400 text-sm">
                      ₹{r.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-950/40 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono text-xs pr-2">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION CONTROLS BAR --- */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 bg-[#080d19] border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-white">{Math.min(filtered.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
                <strong className="text-white">{Math.min(filtered.length, currentPage * pageSize)}</strong> of{' '}
                <strong className="text-white">{filtered.length}</strong> entries
              </span>

              <div className="flex items-center gap-1.5 ml-2 border-l border-[#1E293B] pl-3">
                <span className="text-[11px] text-slate-500">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#121c2e] border border-slate-700/80 rounded-lg px-2 py-1 text-white text-xs outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Page Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First Page"
                className="p-1.5 rounded-lg bg-[#121c2e] border border-slate-700/80 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronsLeft size={15} />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous Page"
                className="p-1.5 rounded-lg bg-[#121c2e] border border-slate-700/80 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="px-3 py-1 font-mono text-white text-xs">
                Page <strong className="text-amber-400">{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Next Page"
                className="p-1.5 rounded-lg bg-[#121c2e] border border-slate-700/80 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Last Page"
                className="p-1.5 rounded-lg bg-[#121c2e] border border-slate-700/80 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-400" />
                <span>{editingId ? 'Edit Fuel Record' : 'Log Fuel Dispense'}</span>
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Date & Site */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Site / Project *</label>
                  {siteSheets.length > 0 ? (
                    <div className="relative">
                      <select
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-cyan-400 font-bold appearance-none outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {siteSheets.map((s: any) => (
                          <option key={s.siteId} value={s.siteName} className="bg-[#0f172a] text-white">
                            {s.siteName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-amber-500"
                    />
                  )}
                </div>
              </div>

              {/* Vehicle Number: Type directly or pick from auto-suggest dropdown */}
              <div className="relative" ref={vehicleDropdownRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold">Vehicle Number *</label>
                  {selectedVehicleObj && (
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span>{selectedVehicleObj.vehicleType}</span>
                      <span>•</span>
                      <span className={selectedVehicleObj.ownershipType === 'rented' ? 'text-purple-400 font-bold' : 'text-sky-400 font-bold'}>
                        {selectedVehicleObj.ownershipType === 'rented' ? 'Rented' : 'Company'}
                      </span>
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Add Vehicle No"
                    value={vehicleNumber}
                    onFocus={() => setIsVehicleMenuOpen(true)}
                    onChange={(e) => {
                      setVehicleNumber(e.target.value.toUpperCase());
                      setIsVehicleMenuOpen(true);
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#162032] border border-[#1E293B] focus:border-amber-500 rounded-xl text-white font-mono font-bold uppercase outline-none placeholder:text-slate-500 placeholder:font-normal placeholder:font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setIsVehicleMenuOpen(!isVehicleMenuOpen)}
                    className="absolute right-3 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isVehicleMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isVehicleMenuOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50 max-h-56 overflow-y-auto">
                    <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-[#1E293B]">
                      Registered Fleet Vehicles
                    </div>

                    {fleetVehicles
                      .filter((v) =>
                        !vehicleNumber ||
                        v.vehicleNumber.toLowerCase().includes(vehicleNumber.toLowerCase()) ||
                        v.vehicleType.toLowerCase().includes(vehicleNumber.toLowerCase())
                      )
                      .map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setVehicleNumber(v.vehicleNumber);
                            setIsVehicleMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-[#162032] transition-colors cursor-pointer text-left ${
                            vehicleNumber.toUpperCase() === v.vehicleNumber.toUpperCase() ? 'bg-[#162032]/80' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="font-mono font-bold text-white">{v.vehicleNumber}</span>
                            <span className="text-slate-400 text-[11px] truncate">— {v.vehicleType}</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                              v.ownershipType === 'rented'
                                ? 'bg-purple-950/60 border border-purple-800 text-purple-300'
                                : 'bg-blue-950/60 border border-blue-800 text-blue-300'
                            }`}
                          >
                            {v.ownershipType === 'rented' ? 'Rented' : 'Company'}
                          </span>
                        </button>
                      ))}

                    {vehicleNumber && !fleetVehicles.some(v => v.vehicleNumber.toUpperCase() === vehicleNumber.trim().toUpperCase()) && (
                      <div
                        onClick={() => setIsVehicleMenuOpen(false)}
                        className="px-3.5 py-2 text-[11px] text-emerald-400 bg-emerald-950/20 border-t border-[#1E293B] cursor-pointer hover:bg-emerald-950/40 flex items-center justify-between"
                      >
                        <span>Use entered vehicle: <strong className="font-mono">{vehicleNumber}</strong></span>
                        <span className="text-[10px] text-slate-400 font-sans">(Click to confirm)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Litres & Rate per Litre with Default Rate Lock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Litres Dispensed *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    placeholder="e.g. 50"
                    value={litres}
                    onChange={(e) => setLitres(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-bold">Rate/Litre (₹) *</label>
                    <button
                      type="button"
                      onClick={handleSaveDefaultRate}
                      title="Save this rate as the default for future entries"
                      className={`text-[10px] flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded transition cursor-pointer ${
                        rateSavedNotice
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60'
                      }`}
                    >
                      {rateSavedNotice ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-2.5 h-2.5" />
                          <span>Set Default</span>
                        </>
                      )}
                    </button>
                  </div>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={ratePerLitre}
                    onChange={(e) => setRatePerLitre(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-[#1E293B] flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-slate-300">Total Voucher Cost:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ₹{computedTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black shadow-lg shadow-amber-600/30 cursor-pointer transition-all"
                >
                  {editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DieselFuelManagementModule;
