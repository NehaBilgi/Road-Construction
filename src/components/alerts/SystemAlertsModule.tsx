import React from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Bell,
  AlertTriangle,
  Fuel,
  Users,
  Package,
  Wrench,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';

export const SystemAlertsModule: React.FC = () => {
  const { materials, attendanceRecords, dieselLogs, machinery } = useERP();

  const lowStockItems = materials.filter(m => m.currentStockTotal <= m.minReorderLevel);
  const absentStaff = attendanceRecords.filter(a => a.status === 'Absent');

  const alerts = [
    ...lowStockItems.map(m => ({
      id: `alert-stk-${m.id}`,
      type: 'STOCK_CRITICAL',
      title: `Low Stock: ${m.name}`,
      description: `Current quantity (${m.currentStockTotal} ${m.unit}) is below safety threshold (${m.minReorderLevel} ${m.unit}).`,
      severity: 'HIGH',
      time: 'Just now',
      module: 'Warehouse & Stores'
    })),
    ...absentStaff.map(a => ({
      id: `alert-att-${a.id}`,
      type: 'ABSENT_STAFF',
      title: `Absent Shift Staff: ${a.workerName}`,
      description: `Staff member marked absent for shift: ${a.activity || 'Operations'}. Substitute coverage advised.`,
      severity: 'MEDIUM',
      time: '05:30 AM',
      module: 'Muster Roll & Workforce'
    })),
    {
      id: 'alert-dsl-1',
      type: 'DIESEL_DISPENSE',
      title: 'High Volume Dispense: 115L to CAT 320D Excavator',
      description: 'Logged at Site Bowser-01 with verified meter reading 3420.0 hrs.',
      severity: 'INFO',
      time: 'Today 06:15 AM',
      module: 'Diesel Management'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-rose-500" />
            System Alerts & Critical Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time monitoring for inventory shortages, staff muster gaps, machinery maintenance, and diesel dispense spikes.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border transition-all ${
              alert.severity === 'HIGH'
                ? 'bg-[#180a13] border-rose-900/60'
                : alert.severity === 'MEDIUM'
                ? 'bg-[#181308] border-amber-900/60'
                : 'bg-[#0c1427] border-[#182643]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.severity === 'HIGH'
                      ? 'bg-rose-900/40 text-rose-400 border border-rose-700/50'
                      : alert.severity === 'MEDIUM'
                      ? 'bg-amber-900/40 text-amber-400 border border-amber-700/50'
                      : 'bg-blue-900/40 text-blue-400 border border-blue-700/50'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alert.severity === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300'
                          : alert.severity === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{alert.description}</p>
                  <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-3">
                    <span>Module: <strong className="text-slate-400">{alert.module}</strong></span>
                    <span>•</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-[#080e1e] border border-slate-700/50 text-[11px] font-semibold text-slate-300">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
