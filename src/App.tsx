import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Menu,
  ChevronDown,
  Building2,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  LogOut
} from 'lucide-react';
import CreateRoadSiteModal from './modals/CreateRoadSiteModal';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<Props> = ({ onToggleSidebar }) => {
  const erpContext = useERP();
  const {
    selectedSiteId,
    setSelectedSiteId,
    siteSheets,
    userRole,
    logout
  } = erpContext;

  const [isSiteOpen, setIsSiteOpen] = useState(false);
  const [isAddRoadSiteOpen, setIsAddRoadSiteOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<{ id: string; name: string } | null>(null);

  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'OWNER' || userRole === 'Admin';
  const currentSiteSheet = siteSheets.find((s) => s.siteId === selectedSiteId) || siteSheets[0];

  const handleExecuteDeleteSite = () => {
    if (!siteToDelete) return;
    const targetId = siteToDelete.id;

    if (typeof (erpContext as any).deleteSite === 'function') {
      (erpContext as any).deleteSite(targetId);
    } else {
      try {
        const savedDeleted = localStorage.getItem('CONSTRUCTION_PRO_DELETED_SITE_IDS');
        const list = savedDeleted ? JSON.parse(savedDeleted) : [];
        if (!list.includes(targetId)) {
          list.push(targetId);
          localStorage.setItem('CONSTRUCTION_PRO_DELETED_SITE_IDS', JSON.stringify(list));
        }
      } catch (e) {
        console.error(e);
      }
      window.location.reload();
    }
    setSiteToDelete(null);
    setIsSiteOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      if (typeof logout === 'function') {
        logout();
      } else {
        sessionStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <header className="h-14 bg-[#080C14] border-b border-[#1E293B] flex items-center justify-between px-3 sm:px-4 text-xs select-none font-sans z-40 relative">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* MOBILE HAMBURGER TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => {
            if (onToggleSidebar) onToggleSidebar();
          }}
          className="p-2 lg:hidden rounded-xl bg-[#121927] hover:bg-[#162032] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Site Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSiteOpen(!isSiteOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#121927] hover:bg-[#162032] border border-[#1E293B] rounded-xl text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-mono text-blue-400 truncate max-w-[120px] sm:max-w-[200px]">
              {currentSiteSheet ? currentSiteSheet.siteName : 'Select Site'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          </button>

          {isSiteOpen && (
            <div className="absolute left-0 mt-2 w-[280px] sm:w-80 bg-[#121927] border border-[#1E293B] rounded-2xl shadow-2xl py-1.5 z-50">
              <div className="px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] border-b border-[#1E293B] flex items-center justify-between">
                <span>Active Sites</span>
                <span className="text-blue-400 font-mono">{siteSheets.length} Sites</span>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {siteSheets.map((s) => (
                  <div
                    key={s.siteId}
                    className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#162032] transition-colors ${
                      selectedSiteId === s.siteId ? 'bg-[#162032]/60' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSiteId(s.siteId);
                        setIsSiteOpen(false);
                      }}
                      className="flex-1 text-left cursor-pointer truncate"
                    >
                      <div className={`font-semibold truncate ${selectedSiteId === s.siteId ? 'text-blue-400 font-bold' : 'text-white'}`}>
                        {s.siteName}
                      </div>
                    </button>
                    {selectedSiteId === s.siteId && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </div>
                ))}
              </div>

              {isSuperAdmin && (
                <div className="p-2 border-t border-[#1E293B] bg-[#0D111D]">
                  <button
                    onClick={() => {
                      setIsSiteOpen(false);
                      setIsAddRoadSiteOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Site</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          className="px-2.5 py-1.5 rounded-xl bg-[#121927] hover:bg-rose-950/40 border border-[#1E293B] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline text-[11px] font-semibold">Logout</span>
        </button>
      </div>

      <CreateRoadSiteModal isOpen={isAddRoadSiteOpen} onClose={() => setIsAddRoadSiteOpen(false)} />
    </header>
  );
};

export default Header;
