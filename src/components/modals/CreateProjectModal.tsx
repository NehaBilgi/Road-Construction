import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { WorkType, ProjectStatus } from '../../types/erp';
import { X, HardHat, Building2, Milestone, Plus, Trash2, CheckCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const CreateProjectModal: React.FC<Props> = ({ onClose }) => {
  const { addProject, setWorkType } = useERP();

  const [type, setType] = useState<WorkType>('ROAD');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [expectedCompletion, setExpectedCompletion] = useState('2027-03-31');
  const [contractValue, setContractValue] = useState<number>(250000000);
  const [estimatedCost, setEstimatedCost] = useState<number>(215000000);
  const [projectManager, setProjectManager] = useState('Er. Rajesh Deshmukh');
  const [siteEngineer, setSiteEngineer] = useState('Er. Amit Sharma');
  const [supervisor, setSupervisor] = useState('Sunil Patil');
  const [totalRoadKm, setTotalRoadKm] = useState<number>(25);
  const [totalBuiltUpSqFt, setTotalBuiltUpSqFt] = useState<number>(120000);
  const [description, setDescription] = useState('');

  // Sites list
  const [sites, setSites] = useState<Array<{ name: string; location: string; supervisor: string }>>([
    { name: 'Site Package 1', location: 'Main Highway Stretch', supervisor: 'Sunil Patil' }
  ]);

  const handleAddSite = () => {
    setSites([...sites, { name: `Site Package ${sites.length + 1}`, location: location || 'Site', supervisor: 'Supervisor' }]);
  };

  const handleRemoveSite = (index: number) => {
    setSites(sites.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProj = addProject({
      name,
      code: code || (type === 'ROAD' ? 'RD-' : 'BLD-') + Math.floor(1000 + Math.random() * 9000),
      type,
      client: client || 'Infrastructure Client Ltd',
      location: location || 'Project Site, India',
      startDate,
      expectedCompletion,
      contractValue: Number(contractValue),
      estimatedCost: Number(estimatedCost),
      actualCost: 0,
      forecastFinalCost: Number(estimatedCost),
      profitOrLoss: Number(contractValue) - Number(estimatedCost),
      progressPercent: 0,
      projectManager,
      siteEngineer,
      supervisor,
      status: 'Active' as ProjectStatus,
      totalRoadKm: type === 'ROAD' ? Number(totalRoadKm) : undefined,
      totalBuiltUpSqFt: type === 'BUILDING' ? Number(totalBuiltUpSqFt) : undefined,
      description,
      sites: sites.map((s, idx) => ({
        id: 'site-' + Date.now() + '-' + idx,
        projectId: '',
        name: s.name,
        code: 'ST-' + (idx + 1),
        location: s.location,
        supervisor: s.supervisor
      }))
    });

    setWorkType(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <HardHat className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New Construction Project</h3>
              <p className="text-xs text-slate-400">Add a new Road Highway or Building project into the ERP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {/* Work Type Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Work Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('ROAD')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${
                  type === 'ROAD'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-md shadow-amber-500/10 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Milestone className="h-5 w-5 text-amber-400" />
                <span>🛣️ Road Construction</span>
              </button>

              <button
                type="button"
                onClick={() => setType('BUILDING')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${
                  type === 'BUILDING'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-md shadow-cyan-500/10 font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building2 className="h-5 w-5 text-cyan-400" />
                <span>🏢 Building Construction</span>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'ROAD' ? 'e.g. NH-66 4-Lane Coastal Highway Bypass' : 'e.g. Skyline Signature Towers (3B+G+18)'}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Code / Tender Ref
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. NH66-PKG4 / SKYT-2026"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Client / Authority
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. NHAI / PWD / Lodha Group"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Site Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Km 45 to Km 70, Ratnagiri District, Maharashtra"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Financials & Dimension */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contract Value (₹)
              </label>
              <input
                type="number"
                value={contractValue}
                onChange={(e) => setContractValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono text-amber-400 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {type === 'ROAD' ? 'Total Length (Km)' : 'Built-Up Area (sq.ft)'}
              </label>
              <input
                type="number"
                value={type === 'ROAD' ? totalRoadKm : totalBuiltUpSqFt}
                onChange={(e) =>
                  type === 'ROAD'
                    ? setTotalRoadKm(Number(e.target.value))
                    : setTotalBuiltUpSqFt(Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Dates & Personnel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Completion
              </label>
              <input
                type="date"
                value={expectedCompletion}
                onChange={(e) => setExpectedCompletion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Manager
              </label>
              <input
                type="text"
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Sites / Sections Hierarchy */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Initial Sites / Camp Locations
              </label>
              <button
                type="button"
                onClick={handleAddSite}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Site
              </button>
            </div>

            <div className="space-y-2">
              {sites.map((site, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Site / Stretch Name"
                    value={site.name}
                    onChange={(e) => {
                      const updated = [...sites];
                      updated[index].name = e.target.value;
                      setSites(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Location / Chainage"
                    value={site.location}
                    onChange={(e) => {
                      const updated = [...sites];
                      updated[index].location = e.target.value;
                      setSites(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs"
                  />
                  {sites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSite(index)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Create & Launch Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
