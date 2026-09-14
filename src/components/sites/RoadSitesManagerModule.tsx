import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Milestone,
  Building2,
  Plus,
  Trash2,
  MapPin,
  Truck,
  X
} from 'lucide-react';

interface Props {
  projectType?: 'ROAD' | 'BUILDING';
  onNavigateTab?: (tab: string) => void;
}

export const RoadSitesManagerModule: React.FC<Props> = ({ projectType = 'ROAD' }) => {
  const {
    siteSheets = [],
    setSiteSheets,
    deleteRoadSiteSection,
    addRoadSiteSection,
    selectedSiteId,
    setSelectedSiteId,
    currentUser,
    userRole
  } = useERP();

  const currentRoleStr = String(currentUser?.role || userRole || '').toLowerCase();
  const isAdmin = currentRoleStr.includes('admin');

  const isRoadDomain = projectType === 'ROAD';

  // Strict domain-based site filtering
  const filteredSites = useMemo(() => {
    return siteSheets.filter((site: any) => {
      if (site.projectType || site.category) {
        const cat = (site.projectType || site.category).toUpperCase();
        return cat === projectType;
      }
      // Smart fallback for existing legacy sites
      const name = (site.siteName || '').toLowerCase();
      const isLegacyRoad =
        name.includes('road') ||
        name.includes('stretch') ||
        name.includes('highway') ||
        name.includes('nh-') ||
        name.includes('sh-') ||
        name.includes('mulwad') ||
        name.includes('sindagi') ||
        name.includes('almel');

      return isRoadDomain ? isLegacyRoad : !isLegacyRoad;
    });
  }, [siteSheets, projectType, isRoadDomain]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State defaults directly to active domain
  const [siteCategory, setSiteCategory] = useState<'ROAD' | 'BUILDING'>(projectType);
  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState('');
  const [supervisor, setSupervisor] = useState(currentUser?.name || 'Er. Habibulla Bilgi');
  const [startKm, setStartKm] = useState<number | ''>(0);
  const [endKm, setEndKm] = useState<number | ''>(12.5);
  const [buildingFloors, setBuildingFloors] = useState('G + 12 Floors');

  const isCreatingRoad = siteCategory === 'ROAD';

  const handleDelete = (e: React.MouseEvent, siteId: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      if (deleteRoadSiteSection) {
        deleteRoadSiteSection(siteId);
      } else {
        const remaining = siteSheets.filter((s: any) => s.siteId !== siteId);
        if (setSiteSheets) setSiteSheets(remaining);
      }
    }
  };

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) return;

    const newId = addRoadSiteSection({
      siteName: siteName.trim().toUpperCase(),
      location: location.trim() || (isCreatingRoad ? 'Highway Corridor Stretch' : 'Building Site Campus'),
      supervisor: supervisor.trim() || 'Site Incharge',
      startChainageKm: isCreatingRoad ? Number(startKm) || 0 : 0,
      endChainageKm: isCreatingRoad ? Number(endKm) || 0 : 0,
      projectType: siteCategory,
      category: siteCategory,
      buildingFloors: !isCreatingRoad ? buildingFloors : undefined
    });

    setIsModalOpen(false);
    setSiteName('');
    setLocation('');
    if (newId) setSelectedSiteId(newId);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121927] border border-[#1E293B] p-5 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isRoadDomain
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                : 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isRoadDomain ? <Milestone className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isRoadDomain
                    ? 'bg-blue-950/60 text-blue-400 border border-blue-800'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                }`}
              >
                {isRoadDomain ? 'Active Road Projects' : 'Active Building Projects'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {filteredSites.length} {isRoadDomain ? 'Registered Packages' : 'Registered Buildings'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {isRoadDomain ? 'Site Section & Package Management' : 'Building Site & Tower Management'}
            </h1>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSiteCategory(projectType);
              setSiteName('');
              setLocation('');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add {isRoadDomain ? 'Ongoing Road Section' : 'Ongoing Building Site'}</span>
          </button>
        )}
      </div>

      {/* Sites Grid */}
      {filteredSites.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0c1427] border border-[#182643] text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
            {isRoadDomain ? <Milestone className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-white">
            No {isRoadDomain ? 'Road Sections' : 'Building Sites'} Active
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "+ Add Ongoing Site" above to register your first {isRoadDomain ? 'highway stretch' : 'building project'}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map((site: any) => {
            const isSelected = site.siteId === selectedSiteId;
            const siteIsRoad = (site.projectType || site.category || 'ROAD').toUpperCase() === 'ROAD';

            return (
              <div
                key={site.siteId}
                onClick={() => setSelectedSiteId(site.siteId)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-xl relative ${
                  isSelected
                    ? 'bg-[#111c36] border-blue-500 shadow-blue-950/40'
                    : 'bg-[#0c1427] border-[#182643] hover:border-slate-600'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase border ${
                        siteIsRoad
                          ? 'bg-[#080d19] text-blue-400 border-[#182643]'
                          : 'bg-[#080d19] text-emerald-400 border-emerald-900/60'
                      }`}
                    >
                      {siteIsRoad ? 'Road Section' : 'Building Site'}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{site.siteId}</span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, site.siteId, site.siteName)}
                          title="Delete Site"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors z-20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{site.siteName}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{site.location || (siteIsRoad ? 'Site Corridor Stretch' : 'Building Site Campus')}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#080d19] border border-[#182643] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Supervisor:</span>
                    <span className="font-bold text-white">{site.supervisor || 'Site Incharge'}</span>
                  </div>
                  {siteIsRoad ? (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Chainage:</span>
                      <span className="font-mono text-blue-400 font-bold">
                        Km {site.startChainageKm || 0} – {site.endChainageKm || 10}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Structure:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {site.buildingFloors || 'G + 12 Floors'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#182643] flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-400" />
                    {site.vehicles?.length || 0} Assigned Fleet
                  </span>
                  <span className={`font-bold ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                    {isSelected ? '● Active Selection' : 'Select Site'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                {isCreatingRoad ? <Milestone className="w-5 h-5 text-blue-400" /> : <Building2 className="w-5 h-5 text-emerald-400" />}
                <span>Add Ongoing {isCreatingRoad ? 'Road Section' : 'Building Site'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Construction Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSiteCategory('ROAD')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all flex items-center justify-center gap-2 ${
                      isCreatingRoad
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-[#162032] border-[#1E293B] text-slate-400'
                    }`}
                  >
                    <Milestone className="w-3.5 h-3.5" />
                    <span>Road</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSiteCategory('BUILDING')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all flex items-center justify-center gap-2 ${
                      !isCreatingRoad
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-[#162032] border-[#1E293B] text-slate-400'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Building</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isCreatingRoad ? 'Site Section Name *' : 'Building / Tower Project Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isCreatingRoad ? 'e.g. NH-50 Section Package B' : 'e.g. BILGI HEIGHTS TOWER-A'}
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isCreatingRoad ? 'Location / Corridor' : 'Site Location / Campus'}
                </label>
                <input
                  type="text"
                  placeholder={isCreatingRoad ? 'e.g. Km 12+000 to 24+500' : 'e.g. Sector 4 Commercial Zone'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Site Supervisor</label>
                <input
                  type="text"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>

              {isCreatingRoad ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Start Km</label>
                    <input
                      type="number"
                      step="0.1"
                      value={startKm}
                      onChange={(e) => setStartKm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">End Km</label>
                    <input
                      type="number"
                      step="0.1"
                      value={endKm}
                      onChange={(e) => setEndKm(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Building Structure / Floor Scope</label>
                  <input
                    type="text"
                    value={buildingFloors}
                    onChange={(e) => setBuildingFloors(e.target.value)}
                    placeholder="e.g. Basement + Ground + 12 Floors"
                    className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-emerald-400 font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30"
                >
                  Create Site Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadSitesManagerModule;
