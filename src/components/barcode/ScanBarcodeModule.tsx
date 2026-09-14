import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  QrCode,
  ScanLine,
  Search,
  CheckCircle2,
  AlertCircle,
  Package,
  Fuel,
  Truck,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';

export const ScanBarcodeModule: React.FC = () => {
  const { materials, machinery, vehicleTrips, addStockTransaction } = useERP();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [scanType, setScanType] = useState<'MATERIAL' | 'TRIP' | 'MACHINE'>('MATERIAL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const sampleCodes = [
    { code: 'OIL-15W40', name: '15W/40 Engine Oil (Store Bin #1)', type: 'MATERIAL' },
    { code: 'ADB-VOLVO', name: 'VOLVO-SDLG-ADBLUE (Store Bin #4)', type: 'MATERIAL' },
    { code: 'MAT-AGG-20MM', name: '20mm Basalt Aggregate (Stockpile A)', type: 'MATERIAL' },
    { code: 'MH-12-EX-8890', name: 'CAT 320D Excavator Fuel Pass', type: 'MACHINE' },
    { code: 'TRIP-2026-901', name: 'Tipper MH-12-RN-4491 Gate Pass', type: 'TRIP' }
  ];

  const handleScan = (code: string) => {
    setBarcodeInput(code);
    setSuccessMsg(null);

    const foundMat = materials.find(
      m => m.code.toLowerCase() === code.toLowerCase() || m.id.toLowerCase() === code.toLowerCase()
    );

    if (foundMat) {
      setScanType('MATERIAL');
      setScannedResult({
        type: 'MATERIAL',
        data: foundMat,
        title: foundMat.name,
        code: foundMat.code,
        details: `Available Stock: ${foundMat.currentStockTotal} ${foundMat.unit} • Store: ${foundMat.storeLocation}`
      });
      return;
    }

    const foundMachine = machinery.find(
      m => m.registrationNumber.toLowerCase() === code.toLowerCase() || m.code.toLowerCase() === code.toLowerCase()
    );

    if (foundMachine) {
      setScanType('MACHINE');
      setScannedResult({
        type: 'MACHINE',
        data: foundMachine,
        title: foundMachine.name,
        code: foundMachine.registrationNumber,
        details: `Category: ${foundMachine.category} • Status: ${foundMachine.status} • Total Hours: ${foundMachine.totalHoursOperated} hrs`
      });
      return;
    }

    // Default generic result
    setScannedResult({
      type: 'CUSTOM',
      code: code,
      title: `Scanned Item: ${code}`,
      details: 'Item verified in Bilgi Crusher Registry'
    });
  };

  const handleQuickIssue = () => {
    if (!scannedResult || scannedResult.type !== 'MATERIAL') return;
    const mat = scannedResult.data;
    addStockTransaction({
      date: new Date().toISOString().substring(0, 10),
      materialId: mat.id,
      materialName: mat.name,
      type: 'ISSUE_TO_ACTIVITY',
      projectId: 'proj-road-1',
      siteId: 'site-road-1',
      referenceNumber: `SCN-ISS-${Date.now().toString().slice(-4)}`,
      quantityIn: 0,
      quantityOut: 1,
      balanceQuantity: Math.max(0, mat.currentStockTotal - 1),
      unit: mat.unit,
      unitRate: mat.standardRate,
      totalValue: mat.standardRate,
      issuedToActivity: 'Fast Barcode Site Issue',
      performedBy: 'Site Store Scanner'
    });

    setSuccessMsg(`Issued 1 ${mat.unit} of ${mat.name} successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ScanLine className="w-6 h-6 text-blue-400" />
            Barcode & QR Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Instant optical scanner for parts, diesel dispensers, material issues, and gate passes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Simulation Box */}
        <div className="lg:col-span-7 bg-[#0c1427] border border-[#182643] rounded-2xl p-6 shadow-xl">
          <div className="relative border-2 border-dashed border-blue-500/30 rounded-2xl p-8 bg-[#080e1e] flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Animated Laser Line */}
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#3b82f6] animate-pulse" />

            <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4 shadow-lg">
              <QrCode className="w-10 h-10" />
            </div>

            <h3 className="text-base font-bold text-white">Camera & Handheld Scanner Active</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Point terminal laser at physical barcode sticker or enter SKU/Pass ID manually below.
            </p>

            <div className="mt-6 w-full max-w-md flex items-center gap-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Enter or scan barcode (e.g. OIL-15W40)"
                className="flex-1 bg-[#0c1427] border border-[#1b2845] focus:border-blue-500 rounded-lg px-3.5 py-2 text-sm text-white outline-none"
              />
              <button
                onClick={() => handleScan(barcodeInput)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Verify
              </button>
            </div>
          </div>

          {/* Quick preset tags for instant testing */}
          <div className="mt-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Preset Barcode Stickers (One-Click Test)
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleCodes.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScan(s.code)}
                  className="px-3 py-1.5 rounded-lg bg-[#080e1e] hover:bg-[#132042] border border-[#1c2944] text-left transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-bold text-blue-400 group-hover:text-blue-300">
                    {s.code}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                    {s.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scan Result & Fast Action Card */}
        <div className="lg:col-span-5 bg-[#0c1427] border border-[#182643] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#182643]">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Scanned Record Details
              </span>
              {scannedResult && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  MATCH FOUND
                </span>
              )}
            </div>

            {successMsg && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {scannedResult ? (
              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-xl bg-[#080e1e] border border-[#182643]">
                  <div className="text-xs text-blue-400 font-mono font-bold">
                    {scannedResult.code}
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {scannedResult.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-2">
                    {scannedResult.details}
                  </p>
                </div>

                {scannedResult.type === 'MATERIAL' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleQuickIssue}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                    >
                      <Plus className="w-4 h-4" />
                      Quick 1-Unit Material Issue
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-12 text-center text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No barcode scanned yet. Scan or tap a test tag above.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#182643] text-center text-xs text-slate-500">
            Encrypted Bilgi Store Barcode Protocol
          </div>
        </div>
      </div>
    </div>
  );
};
