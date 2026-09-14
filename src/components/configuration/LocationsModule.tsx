import React, { useState } from 'react';
import { MapPin, Plus, Navigation, Building } from 'lucide-react';

export const LocationsModule: React.FC = () => {
  const [locations, setLocations] = useState([
    { id: '1', name: 'M B Bilgi Crusher Quarry Site #1', type: 'Crushing Plant & Quarry', address: 'Survey No. 44/2, Bilgi Industrial Belt', supervisor: 'Ibrahim' },
    { id: '2', name: 'Crusher Main Store & Lubricants Bin', type: 'Central Warehouse', address: 'Plant Gate #1 Store Room', supervisor: 'Mahesh Kulkarni' },
    { id: '3', name: 'NH-48 Highway Batching Plant Yard', type: 'Highway Site Camp', address: 'Km 124+200 Shirwal Bypass', supervisor: 'Sunil Patil' },
    { id: '4', name: 'Crusher Yard A (10mm/20mm Stockpile)', type: 'Aggregate Yard', address: 'North Loading Bay', supervisor: 'Somu Mulwad' },
    { id: '5', name: 'Crusher Yard B (40mm & M-Sand Bay)', type: 'Aggregate Yard', address: 'South Loading Bay', supervisor: 'Kishore Salunkhe' },
    { id: '6', name: 'Zenith Heights Tower Site Store', type: 'Building Project Site', address: 'Sector 45 Baner, Pune', supervisor: 'Er. Rohan Mehta' }
  ]);

  const [locName, setLocName] = useState('');
  const [locType, setLocType] = useState('Quarry & Plant');
  const [locAddress, setLocAddress] = useState('');
  const [locSupervisor, setLocSupervisor] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;
    setLocations([
      ...locations,
      {
        id: Date.now().toString(),
        name: locName.trim(),
        type: locType,
        address: locAddress.trim() || 'Bilgi Industrial Zone',
        supervisor: locSupervisor.trim() || 'Plant Incharge'
      }
    ]);
    setLocName('');
    setLocAddress('');
    setLocSupervisor('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-blue-400" />
            Locations & Yards Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure stone quarry pits, crushing units, asphalt plants, store sheds, and active highway site yards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Add New Location</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location Name</label>
              <input
                type="text"
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                placeholder="e.g. Quarry Pit Section C"
                required
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location Type</label>
              <select
                value={locType}
                onChange={(e) => setLocType(e.target.value)}
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none"
              >
                <option value="Crushing Plant & Quarry">Crushing Plant & Quarry</option>
                <option value="Central Warehouse">Central Warehouse / Store</option>
                <option value="Highway Site Camp">Highway Site Camp</option>
                <option value="Aggregate Yard">Aggregate Stockpile Yard</option>
                <option value="Building Project Site">Building Project Site</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Address / Coordinates</label>
              <input
                type="text"
                value={locAddress}
                onChange={(e) => setLocAddress(e.target.value)}
                placeholder="e.g. Survey No. 89, Gate 2"
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Supervisor Incharge</label>
              <input
                type="text"
                value={locSupervisor}
                onChange={(e) => setLocSupervisor(e.target.value)}
                placeholder="e.g. Ibrahim"
                className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-blue-500 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" /> Add Location
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-[#0c1427] border border-[#182643] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Active Plant Sites & Depots ({locations.length})</h3>
          <div className="space-y-3">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 rounded-xl bg-[#080e1e] border border-[#182643] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{loc.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {loc.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{loc.address}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Incharge: <strong className="text-slate-300">{loc.supervisor}</strong></div>
                </div>
                <Navigation className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
