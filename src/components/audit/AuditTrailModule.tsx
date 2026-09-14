import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { AuditLogEntry } from '../../types/erp';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Activity,
  Layers,
  FileCheck,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const AuditTrailModule: React.FC = () => {
  const {
    auditLogs,
    vehicleTrips,
    updateVehicleTripStatus,
    measurements,
    userRole
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'AUDIT_LOGS' | 'APPROVAL_QUEUE'>('AUDIT_LOGS');

  // Pending items for approval
  const pendingTrips = vehicleTrips.filter((t) => t.approvalStatus === 'SUBMITTED' || t.approvalStatus === 'DRAFT');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  const uniqueModules = Array.from(new Set(auditLogs.map((l) => l.module)));

  const handleExportCSV = () => {
    const headers = 'Timestamp,Module,Transaction ID,User,Email,Action,Details\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.timestamp}","${l.module}","${l.transactionId}","${l.userName}","${l.userEmail}","${l.action}","${l.details.replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InfraBuild_Audit_Log_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              IMMUTABLE SECURITY & COMPLIANCE
            </span>
            <span className="text-xs text-slate-400">Enterprise Governance</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Audit Trail & Approvals Workflow
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological forensic logging of every ERP mutation with JE/AE/Owner multi-level approval stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-amber-400" />
            <span>Export Audit Log CSV</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Immutable Logs</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            {auditLogs.length} <span className="text-xs font-normal text-slate-400">Events</span>
          </div>
          <span className="text-xs text-slate-400">Recorded across all operations</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Authorizations</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono my-1">
            {pendingTrips.length} <span className="text-xs font-normal text-slate-400">Records</span>
          </div>
          <span className="text-xs text-slate-400">Awaiting Manager / Owner sign-off</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Security Level</span>
          <div className="text-xl font-extrabold text-emerald-400 font-mono my-1">
            {userRole}
          </div>
          <span className="text-xs text-emerald-400">Role-Based Access Control (RBAC) Active</span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-800 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`pb-3 px-4 transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'AUDIT_LOGS'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>System Audit Log ({filteredLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVAL_QUEUE')}
          className={`pb-3 px-4 transition-colors flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === 'APPROVAL_QUEUE'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Sign-Off & Approval Queue ({pendingTrips.length})</span>
        </button>
      </div>

      {activeTab === 'AUDIT_LOGS' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit trail, user, details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              >
                <option value="ALL">All Modules</option>
                {uniqueModules.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="APPROVE">APPROVE</option>
                <option value="POST">POST</option>
                <option value="DELETE">DELETE</option>
                <option value="ADJUST">ADJUST</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Module</th>
                  <th className="py-3 px-3">User & Email</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Details & Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {l.timestamp}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-bold text-cyan-300">{l.module}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="font-bold text-white block">{l.userName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{l.userEmail}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.action === 'CREATE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : l.action === 'DELETE'
                          ? 'bg-rose-500/10 text-rose-400'
                          : l.action === 'APPROVE'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300 max-w-md">
                      {l.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'APPROVAL_QUEUE' && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-amber-400" />
              Pending Tipper & RMC Trips Awaiting Approval ({pendingTrips.length})
            </h3>
          </div>

          {pendingTrips.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm font-bold text-slate-300">All trip tickets & entries are verified!</p>
              <p className="text-xs text-slate-500 mt-1">No pending authorization items in queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTrips.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-amber-400 text-xs">{t.tripNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300">{t.vehicleType}</span>
                      <span className="text-[10px] text-slate-500">{t.date}</span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      {t.actualLoadedQty} {t.unit} of {t.materialName} → {t.destinationLocation}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Driver: {t.driverName} • Vehicle: {t.vehicleNumber} • Amount: ₹{t.totalAmount.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateVehicleTripStatus(t.id, 'APPROVED')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve & Post</span>
                    </button>
                    <button
                      onClick={() => updateVehicleTripStatus(t.id, 'DRAFT')}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Return to Draft
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
