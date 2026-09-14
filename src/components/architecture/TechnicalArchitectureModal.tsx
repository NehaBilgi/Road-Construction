import React, { useState } from 'react';
import {
  Database,
  GitBranch,
  Server,
  Layers,
  Code2,
  Workflow,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Wifi,
  WifiOff,
  Copy,
  Check,
  FileCode,
  Smartphone,
  Cpu
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'ux_flows' | 'sync_api'>('schema');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-[#0b1220] border border-[#1e2e4a] rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-200">
        {/* Top Header */}
        <div className="p-5 bg-[#0e172a] border-b border-[#1b2845] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  SYSTEM ARCHITECTURE SPECIFICATION
                </span>
                <span className="text-[11px] text-slate-400">Offline-First Mobile & Web</span>
              </div>
              <h2 className="text-lg font-black text-white">
                Road Construction ERP & Field Ops Blueprint
              </h2>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[#060a14] rounded-xl border border-[#1b2845]">
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>1. Database Schema (ERD)</span>
            </button>
            <button
              onClick={() => setActiveTab('ux_flows')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ux_flows'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>2. Core Field UX Flows</span>
            </button>
            <button
              onClick={() => setActiveTab('sync_api')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sync_api'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>3. Offline Sync APIs</span>
            </button>
            <button
              onClick={onClose}
              className="ml-2 w-8 h-8 rounded-lg bg-[#142038] hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DATABASE SCHEMA (ERD) */}
          {activeTab === 'schema' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
                  <Database className="w-4 h-4" />
                  <span>Entity-Relationship Architecture Overview</span>
                </div>
                Optimized for PostgreSQL / SQLite (Client WatermelonDB or Room) with UUID primary keys, temporal chainage indexing, and deterministic conflict resolution timestamp columns (`synced_at`, `client_created_at`, `version`).
              </div>

              {/* Grid of Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Table 1: machines */}
                <div className="p-4 rounded-2xl bg-[#070c18] border border-[#1b2845] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#1b2845] pb-2">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Table: machines
                    </span>
                    <span className="text-[10px] text-slate-500">Fleet Master Registry</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between"><span className="text-cyan-400">id</span> <span>UUID PRIMARY KEY</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">code</span> <span>VARCHAR(20) UNIQUE</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">category</span> <span>ENUM('EARTHMOVING','COMPACTION'...)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">ownership</span> <span>ENUM('OWNED','RENTED_LEASED')</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">hourly_rate</span> <span>NUMERIC(10,2) NULL</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">current_hmr</span> <span>NUMERIC(10,2) DEFAULT 0</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">current_kmr</span> <span>BIGINT DEFAULT 0</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">avg_burn_benchmark</span> <span>NUMERIC(6,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">assigned_operator_id</span> <span>UUID FK -&gt; users.id</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">status</span> <span>ENUM('ACTIVE','IDLE','BREAKDOWN')</span></div>
                  </div>
                </div>

                {/* Table 2: trip_logs */}
                <div className="p-4 rounded-2xl bg-[#070c18] border border-[#1b2845] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#1b2845] pb-2">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Table: trip_logs
                    </span>
                    <span className="text-[10px] text-slate-500">Haulage & Trippage</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between"><span className="text-cyan-400">id</span> <span>UUID PRIMARY KEY</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">machine_id</span> <span>UUID FK -&gt; machines.id</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">source_location</span> <span>VARCHAR(150)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">dropoff_chainage_start</span> <span>NUMERIC(8,3) (e.g. 12.400)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">dropoff_chainage_end</span> <span>NUMERIC(8,3) (e.g. 14.200)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">carriageway_side</span> <span>ENUM('LHS','RHS','FULL')</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">layer_type</span> <span>ENUM('GSB','WMM','DBM','BC'...)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">net_weight_tons</span> <span>NUMERIC(8,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">challan_number</span> <span>VARCHAR(50)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">billing_amount</span> <span>NUMERIC(10,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">client_sync_status</span> <span>ENUM('SYNCED','PENDING')</span></div>
                  </div>
                </div>

                {/* Table 3: fuel_dispense_logs */}
                <div className="p-4 rounded-2xl bg-[#070c18] border border-[#1b2845] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#1b2845] pb-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Table: fuel_dispense_logs
                    </span>
                    <span className="text-[10px] text-slate-500">Bowser & Tank Outflows</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between"><span className="text-cyan-400">id</span> <span>UUID PRIMARY KEY</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">machine_id</span> <span>UUID FK -&gt; machines.id</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">fuel_source</span> <span>ENUM('SITE_BOWSER_1','PUMP'...)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">litres_dispensed</span> <span>NUMERIC(8,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">rate_per_litre</span> <span>NUMERIC(6,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">meter_type</span> <span>ENUM('HMR_HOURS','KMR_ODOMETER')</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">prev_meter_reading</span> <span>NUMERIC(10,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">curr_meter_reading</span> <span>NUMERIC(10,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">specific_consumption</span> <span>NUMERIC(6,2) (L/hr or km/L)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">is_abnormal_spike</span> <span>BOOLEAN DEFAULT FALSE</span></div>
                  </div>
                </div>

                {/* Table 4: road_layer_yield_calcs */}
                <div className="p-4 rounded-2xl bg-[#070c18] border border-[#1b2845] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#1b2845] pb-2">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Table: road_layer_yield_calcs
                    </span>
                    <span className="text-[10px] text-slate-500">Cross-Section Theoreticals</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between"><span className="text-cyan-400">id</span> <span>UUID PRIMARY KEY</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">chainage_start_km</span> <span>NUMERIC(8,3)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">chainage_end_km</span> <span>NUMERIC(8,3)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">carriageway_width_m</span> <span>NUMERIC(5,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">compacted_thickness_mm</span> <span>INTEGER</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">bulk_density_t_m3</span> <span>NUMERIC(4,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">theoretical_volume_m3</span> <span>NUMERIC(10,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">theoretical_weight_tons</span> <span>NUMERIC(10,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">actual_received_tons</span> <span>NUMERIC(10,2)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">variance_percentage</span> <span>NUMERIC(5,2)</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UX FIELD FLOWS */}
          {activeTab === 'ux_flows' && (
            <div className="space-y-6">
              {/* Flow 1: Logging a Tipper Trip */}
              <div className="p-5 rounded-2xl bg-[#070c18] border border-[#1b2845] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Flow A: Field Supervisor Logs Quarry-to-Chainage Trip Slip</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Offline Optimized (&lt; 20s entry)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643]">
                    <div className="text-[10px] font-bold text-amber-400 mb-1">STEP 1: SELECT TRUCK</div>
                    <p className="text-xs text-slate-300">Tap Tipper 8797 or scan truck QR code badge on cabin door.</p>
                  </div>
                  <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643]">
                    <div className="text-[10px] font-bold text-cyan-400 mb-1">STEP 2: MATERIAL & WEIGHT</div>
                    <p className="text-xs text-slate-300">Select GSB / WMM / DBM. Enter Weighbridge Net Tons (e.g. 26.25 T) or camera OCR snap.</p>
                  </div>
                  <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643]">
                    <div className="text-[10px] font-bold text-indigo-400 mb-1">STEP 3: CHAINAGE DROP</div>
                    <p className="text-xs text-slate-300">GPS geofence pinpoints Ch. 12+400 LHS automatically with manual slider override.</p>
                  </div>
                  <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643]">
                    <div className="text-[10px] font-bold text-emerald-400 mb-1">STEP 4: INSTANT STORE</div>
                    <p className="text-xs text-slate-300">Stored to local SQLite; background sync triggers when cellular signal resumes.</p>
                  </div>
                </div>
              </div>

              {/* Flow 2: Fuel Dispensation & Meter Verification */}
              <div className="p-5 rounded-2xl bg-[#070c18] border border-[#1b2845] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Flow B: Fuel Bowser Refueling with Mandatory Pilferage Verification</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Anti-Pilferage Lock
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643]">
                    <div className="text-[10px] font-bold text-amber-400 mb-1">1. MACHINE METER</div>
                    <p className="text-xs text-slate-300">Bowser operator opens Excavator EX-01; previous HMR (4205.5) autofills. Enters new HMR (4215.5).</p>
                  </div>
                  <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643]">
                    <div className="text-[10px] font-bold text-cyan-400 mb-1">2. NOZZLE DISPENSE</div>
                    <p className="text-xs text-slate-300">Inputs litres dispensed from digital flow meter nozzle (185 Litres).</p>
                  </div>
                  <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643]">
                    <div className="text-[10px] font-bold text-rose-400 mb-1">3. REAL-TIME SFC CHECK</div>
                    <p className="text-xs text-slate-300">Engine calculates 18.5 L/hr vs benchmark. If &gt;25% deviation, red alarm prompts justification reason.</p>
                  </div>
                  <div className="p-3 bg-[#0c1427] rounded-xl border border-[#182643]">
                    <div className="text-[10px] font-bold text-emerald-400 mb-1">4. VOUCHER & SIGN</div>
                    <p className="text-xs text-slate-300">Generates fuel receipt number, driver digital sign on glass, and updates bowser tank balance.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFLINE SYNC APIs */}
          {activeTab === 'sync_api' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-indigo-400">
                  <Server className="w-4 h-4" />
                  <span>REST & GraphQL Delta Sync Protocol</span>
                </div>
                Uses idempotency keys and client-generated UUIDs. When field devices connect to 4G/5G, a single `POST /api/v1/sync/batch` payload sends all queued offline mutations and receives delta updates with conflict resolution.
              </div>

              {/* Code Box */}
              <div className="p-4 rounded-2xl bg-[#060a14] border border-[#1b2845] space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 border-b border-[#182643] pb-2">
                  <span className="text-emerald-400 font-bold">POST /api/v1/sync/batch</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `{
  "client_id": "site-tab-ibrahim-01",
  "project_id": "proj-nh50-pkg3",
  "last_synced_timestamp": "2026-08-14T06:00:00Z",
  "mutations": [
    {
      "idempotency_key": "sync-trip-1723620000",
      "entity": "trip_logs",
      "action": "INSERT",
      "payload": {
        "id": "c7f99144-883a-4421-9988-283849182390",
        "machine_id": "m-tip-8797",
        "dropoff_chainage_start": 12.400,
        "dropoff_chainage_end": 14.200,
        "layer_type": "GRANULAR_SUB_BASE_GSB",
        "net_weight_tons": 26.25,
        "challan_number": "CH-GSB-0814-101",
        "created_at_utc": "2026-08-14T08:30:00Z"
      }
    }
  ]
}`,
                        'batch_json'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white"
                  >
                    {copiedKey === 'batch_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'batch_json' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="text-slate-300 overflow-x-auto p-2 bg-[#03060d] rounded-lg">
{`// 1. Client sends queued mutations:
POST /api/v1/sync/batch
{
  "client_id": "site-tab-ibrahim-01",
  "project_id": "proj-nh50-pkg3",
  "last_synced_timestamp": "2026-08-14T06:00:00Z",
  "mutations": [
    {
      "idempotency_key": "sync-trip-1723620000",
      "entity": "trip_logs",
      "action": "INSERT",
      "payload": {
        "id": "c7f99144-883a-4421-9988-283849182390",
        "machine_id": "m-tip-8797",
        "dropoff_chainage_start": 12.400,
        "dropoff_chainage_end": 14.200,
        "layer_type": "GRANULAR_SUB_BASE_GSB",
        "net_weight_tons": 26.25,
        "challan_number": "CH-GSB-0814-101",
        "created_at_utc": "2026-08-14T08:30:00Z"
      }
    }
  ]
}

// 2. Server Response with sync ACK + server delta changes:
200 OK
{
  "status": "SUCCESS",
  "processed_keys": ["sync-trip-1723620000"],
  "server_time": "2026-08-14T09:05:00Z",
  "delta_updates": {
    "machines": [...],
    "fuel_pricing_today": { "rate_per_litre": 92.50 }
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0e172a] border-t border-[#1b2845] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Architecture Specification v3.2 — Highway & Civil Infra Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
