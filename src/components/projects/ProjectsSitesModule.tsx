import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Project, Site, WorkType, ProjectStatus } from '../../types/erp';
import {
  FolderKanban,
  Plus,
  Search,
  MapPin,
  Calendar,
  Layers,
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  Milestone,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Edit2
} from 'lucide-react';
import CreateProjectModal from '../modals/CreateProjectModal';

export const ProjectsSitesModule: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    addSiteToProject,
    deleteProject,
    setWorkType,
    updateProject
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ROAD' | 'BUILDING'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [activeSiteProjId, setActiveSiteProjId] = useState<string>('');

  // Site modal state
  const [siteName, setSiteName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [siteSupervisor, setSiteSupervisor] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalContractValue = projects.reduce((sum, p) => sum + p.contractValue, 0);
  const totalActualCost = projects.reduce((sum, p) => sum + p.actualCost, 0);
  const totalRoadKm = projects.filter(p => p.type === 'ROAD').reduce((sum, p) => sum + (p.totalRoadKm || 0), 0);
  const totalBuiltUp = projects.filter(p => p.type === 'BUILDING').reduce((sum, p) => sum + (p.totalBuiltUpSqFt || 0), 0);

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSiteProjId || !siteName) return;
    addSiteToProject(activeSiteProjId, siteName, siteLocation || 'Main Package Location', siteSupervisor || 'Site Incharge');
    setIsSiteModalOpen(false);
    setSiteName('');
    setSiteLocation('');
    setSiteSupervisor('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              CENTRAL PROJECT REPOSITORY
            </span>
            <span className="text-xs text-slate-400">Master Projects & Sites Control</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Projects & Work Sites Master
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multi-package road stretches & high-rise building projects with live budget vs actual cost tracking.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Portfolio Value</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono my-1">
            ₹{(totalContractValue / 10000000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Cr</span>
          </div>
          <span className="text-xs text-slate-400">{projects.length} Registered Projects</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Actual Cost Expended</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono my-1">
            ₹{(totalActualCost / 10000000).toFixed(2)} <span className="text-xs font-normal text-slate-400">Cr</span>
          </div>
          <span className="text-xs text-slate-400">Materials, Labour, Fleet & Diesel</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Road Highway Network</span>
          <div className="text-2xl font-extrabold text-white font-mono my-1">
            {totalRoadKm.toFixed(1)} <span className="text-xs font-normal text-amber-400">Km</span>
          </div>
          <span className="text-xs text-slate-400">MoRTH & State Highways</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Building Built-Up Area</span>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono my-1">
            {(totalBuiltUp / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">sq.ft</span>
          </div>
          <span className="text-xs text-slate-400">Residential & Commercial Towers</span>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search project name, code, client, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setFilterType('ROAD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'ROAD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            🛣️ Road ({projects.filter((p) => p.type === 'ROAD').length})
          </button>
          <button
            onClick={() => setFilterType('BUILDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'BUILDING' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏢 Building ({projects.filter((p) => p.type === 'BUILDING').length})
          </button>
        </div>
      </div>

      {/* PROJECTS LIST CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((proj) => {
          const isSelected = selectedProjectId === proj.id;
          const profitEstimate = proj.contractValue - (proj.forecastFinalCost || proj.estimatedCost);

          return (
            <div
              key={proj.id}
              className={`p-6 rounded-3xl border transition-all ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/60 shadow-xl shadow-amber-500/5'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl text-xl ${
                    proj.type === 'ROAD' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    {proj.type === 'ROAD' ? '🛣️' : '🏢'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {proj.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        proj.type === 'ROAD' ? 'bg-amber-500/10 text-amber-300' : 'bg-cyan-500/10 text-cyan-300'
                      }`}>
                        {proj.type}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 line-clamp-1">{proj.name}</h3>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {proj.status}
                </span>
              </div>

              {/* Client & Location */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Client / Authority</span>
                  <span className="text-slate-200 font-medium truncate block">{proj.client}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Location</span>
                  <span className="text-slate-200 font-medium flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                    {proj.location}
                  </span>
                </div>
              </div>

              {/* Financial Progress */}
              <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Contract Value</span>
                  <span className="font-mono font-bold text-white">₹{(proj.contractValue / 10000000).toFixed(2)} Cr</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Actual Cost</span>
                  <span className="font-mono font-bold text-amber-400">₹{(proj.actualCost / 10000000).toFixed(2)} Cr</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Est. Profit</span>
                  <span className="font-mono font-bold text-emerald-400">₹{(profitEstimate / 10000000).toFixed(2)} Cr</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-400">Physical Progress</span>
                  <span className="text-white font-mono">{proj.progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${proj.type === 'ROAD' ? 'bg-amber-500' : 'bg-cyan-500'}`}
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Sub-Sites List */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span>Work Sites & Packages ({proj.sites.length})</span>
                  <button
                    onClick={() => {
                      setActiveSiteProjId(proj.id);
                      setIsSiteModalOpen(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Site</span>
                  </button>
                </div>

                <div className="space-y-1">
                  {proj.sites.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-slate-900 text-slate-300">
                      <span className="font-medium text-slate-200">{s.name} ({s.code})</span>
                      <span className="text-[10px] text-slate-500">{s.supervisor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setWorkType(proj.type);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isSelected ? 'Active Project' : 'Select Project'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newProg = prompt('Enter updated progress percentage (0-100):', proj.progressPercent.toString());
                      if (newProg !== null && !isNaN(Number(newProg))) {
                        updateProject(proj.id, { progressPercent: Math.min(100, Math.max(0, Number(newProg))) });
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    title="Update Progress"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete project "${proj.name}"?`)) {
                        deleteProject(proj.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs flex items-center gap-1 cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Site Modal */}
      {isSiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              Add New Work Site / Package
            </h3>

            <form onSubmit={handleAddSite} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Site / Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Package 2: Km 25 to Km 50 / Tower B North"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Site Location / Milestone</label>
                <input
                  type="text"
                  placeholder="e.g. Near Toll Plaza, NH-48"
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Site Supervisor</label>
                <input
                  type="text"
                  placeholder="e.g. R. K. Sharma (Senior Supervisor)"
                  value={siteSupervisor}
                  onChange={(e) => setSiteSupervisor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSiteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Create Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};
