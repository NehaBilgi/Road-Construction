import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { WorkType, Project } from '../types/erp';
import {
  Milestone,
  Building2,
  PlusCircle,
  FolderOpen,
  Search,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Fuel,
  Users,
  ShieldCheck,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import CreateProjectModal from './modals/CreateProjectModal';

export const WorkTypeSelector: React.FC = () => {
  const {
    setWorkType,
    projects,
    setSelectedProjectId,
    setSelectedSiteId
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'ROAD' | 'BUILDING'>('ALL');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSelectWorkType = (type: WorkType) => {
    setWorkType(type);
    // Auto select first project of this type if available
    const proj = projects.find((p) => p.type === type);
    if (proj) {
      setSelectedProjectId(proj.id);
      if (proj.sites.length > 0) {
        setSelectedSiteId(proj.sites[0].id);
      }
    }
  };

  const handleSelectProject = (proj: Project) => {
    setSelectedProjectId(proj.id);
    if (proj.sites.length > 0) {
      setSelectedSiteId(proj.sites[0].id);
    }
    setWorkType(proj.type);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HardHat className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                INFRABUILD <span className="text-amber-400 font-extrabold">ERP</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Enterprise Road & Building Construction Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Single Relational Core
            </span>
          </div>
        </div>
      </header>

      {/* Main Selection Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1 flex flex-col justify-center w-full">
        {/* Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Mandatory First Step
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            CONSTRUCTION <span className="text-amber-400">ERP</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 font-semibold mt-2">
            SELECT TYPE OF WORK
          </p>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Choose your primary execution stream to enter the specialized dashboard. You can seamlessly switch modes anytime without losing project context.
          </p>
        </div>

        {/* 2 Big Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          {/* 🛣️ ROAD CONSTRUCTION CARD */}
          <div className="group relative rounded-3xl p-8 bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-slate-800 hover:border-amber-500/80 transition-all duration-300 shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                  🛣️
                </div>
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Infra & Highways
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center gap-2">
                ROAD CONSTRUCTION
              </h3>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 mb-2">
                  Comprehensive Road Workflows:
                </p>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  Earthwork • Murum • GSB • WMM • BM • DBM • BC • CC Road • Tipper Trips • Material • Diesel • Labour • Machinery • Cost/km
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-8 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Chainage Strip Mapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Tipper Trip Counter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Layer Volume (L×W×T)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Live Cost per Km</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectWorkType('ROAD')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              <span>ENTER ROAD CONSTRUCTION</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* 🏢 BUILDING CONSTRUCTION CARD */}
          <div className="group relative rounded-3xl p-8 bg-gradient-to-b from-slate-900 to-slate-900/90 border-2 border-slate-800 hover:border-cyan-500/80 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                  🏢
                </div>
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Structures & High-Rise
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center gap-2">
                BUILDING CONSTRUCTION
              </h3>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90 mb-2">
                  Comprehensive Building Workflows:
                </p>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  Foundation • RCC • Cement • Steel • BBS • Concrete • Masonry • Flooring • Electrical • Plumbing • Finishing • Labour • Cost/sq.ft
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-8 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Floor Level Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>RMC Concrete Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>RCC Calculators & BBS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Live Cost per Sq.Ft</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectWorkType('BUILDING')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              <span>ENTER BUILDING CONSTRUCTION</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Project Selector & Actions Section */}
        <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-amber-400" />
                Select Existing Project or Create New
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Trace all resources (Material, Labour, Trips, Diesel, Machinery) down to project activities
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                CREATE NEW PROJECT
              </button>

              <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({projects.length})
                </button>
                <button
                  onClick={() => setFilterType('ROAD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'ROAD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🛣️ Road ({projects.filter((p) => p.type === 'ROAD').length})
                </button>
                <button
                  onClick={() => setFilterType('BUILDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === 'BUILDING' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🏢 Building ({projects.filter((p) => p.type === 'BUILDING').length})
                </button>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project name, code (e.g. NH48, ZEN-HT), client, or location..."
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleSelectProject(proj)}
                className="group p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {proj.type === 'ROAD' ? '🛣️' : '🏢'}
                      </span>
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {proj.code}
                        </span>
                        <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded ${
                          proj.type === 'ROAD' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {proj.type}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {proj.status}
                    </span>
                  </div>

                  <h5 className="font-bold text-base text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
                    {proj.name}
                  </h5>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
                    <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="line-clamp-1">{proj.location}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-slate-200">{proj.progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          proj.type === 'ROAD' ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${proj.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Contract Value</span>
                    <span className="font-bold text-slate-200">
                      ₹{(proj.contractValue / 10000000).toFixed(2)} Cr
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      {proj.type === 'ROAD' ? 'Total Length' : 'Built-Up Area'}
                    </span>
                    <span className="font-bold text-slate-200">
                      {proj.type === 'ROAD' ? `${proj.totalRoadKm} Km` : `${proj.totalBuiltUpSqFt?.toLocaleString()} sq.ft`}
                    </span>
                  </div>
                  <div className="flex items-center text-amber-400 font-bold gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No projects match your search query.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-3 text-xs text-amber-400 font-bold hover:underline"
              >
                + Create new project
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        <p>InfraBuild Enterprise Construction Management ERP • Connected Road & Building Execution Engine</p>
      </footer>

      {/* Modal for Creating New Project */}
      {isCreateModalOpen && (
        <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};
