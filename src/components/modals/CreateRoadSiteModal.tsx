import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Milestone, X, Trash2, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newSiteId: string) => void;
  siteIdToEdit?: string; // Optional: Pass siteId if editing/deleting existing site
}

export const CreateRoadSiteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  siteIdToEdit
}) => {
  const { addRoadSiteSection, deleteSite, projects, selectedSiteId } = useERP();

  const [siteName, setSiteName] = useState('');
  const [siteKm, setSiteKm] = useState<number | ''>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) return;

    const km = Number(siteKm) || 10;

    const newId = addRoadSiteSection({
      siteName: siteName.trim(),
      startChainageKm: 0,
      endChainageKm: km,
      location: status === 'Active' ? 'Active Site Stretch' : 'Inactive Stretch',
      supervisor: 'Site Incharge',
      vehicles: ['8797', '7352', '7353', '9579', '9580']
    });

    if (onSuccess) {
      onSuccess(newId);
    }
    onClose();
  };

  const handleDelete = () => {
    const targetId = siteIdToEdit || selectedSiteId;
    if (!targetId) return;

    if (window.confirm(`Are you sure you want to delete this ongoing site?`)) {
      deleteSite(targetId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-[#121927] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Milestone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {siteIdToEdit ? 'Manage Ongoing Site' : 'Add Ongoing Site'}
              </h2>
              <p className="text-[11px] text-slate-400">Set site stretch details and status</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simplified Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Name of Site */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">
              Site Name <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Babaleshwar to Tikota Bypass Stretch"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 font-medium"
            />
          </div>

          {/* 2. Site in KM */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">
              Site Length (KM) <span className="text-blue-400">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              placeholder="e.g. 14.5"
              value={siteKm}
              onChange={(e) => setSiteKm(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 font-mono"
            />
          </div>

          {/* 3. Status (Active / Inactive) */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">Site Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Active'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-[#162032] border-[#1E293B] text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Active</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Inactive'
                    ? 'bg-rose-950/40 border-rose-500 text-rose-300 shadow-sm'
                    : 'bg-[#162032] border-[#1E293B] text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Inactive</span>
              </button>
            </div>
          </div>

          {/* 4. Action Buttons + Delete Option */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
            {/* Delete Option */}
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Site</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Save Site
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoadSiteModal;
