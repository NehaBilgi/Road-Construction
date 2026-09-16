import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Truck,
  Building2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SystemUser } from './UserManagement';

const STORAGE_USERS_KEY = 'PAVETRACK_AUTHORIZED_PERSONNEL_V2';
const STORAGE_SESSION_KEY = 'PAVETRACK_ACTIVE_SESSION_V2';

export const LoginAuthModal: React.FC<{ onLoginSuccess?: (user: SystemUser) => void }> = ({
  onLoginSuccess
}) => {
  const { setCurrentUser, setUserRole, setAppDomain } = useERP() as any;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<SystemUser | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    let registeredUsers: SystemUser[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      registeredUsers = saved ? JSON.parse(saved) : [];
    } catch {
      registeredUsers = [];
    }

    // Authenticate Credentials
    const targetUser = registeredUsers.find(
      (u) =>
        u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
        u.password === password.trim() &&
        u.status === 'Active'
    );

    if (!targetUser) {
      setErrorMessage('Invalid username/password or account has been deactivated.');
      return;
    }

    // Save Active Session
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(targetUser));
    if (setCurrentUser) setCurrentUser(targetUser);
    if (setUserRole) setUserRole(targetUser.role);

    // Auto-Migration Route Resolution based on Allowed Scope
    if (targetUser.allowedScope === 'ROAD_ONLY') {
      if (setAppDomain) setAppDomain('ROAD');
      // If using React Router: navigate('/road/overview');
    } else if (targetUser.allowedScope === 'BUILDING_ONLY') {
      if (setAppDomain) setAppDomain('BUILDING');
      // If using React Router: navigate('/building/overview');
    } else {
      // Both Domains / Admin
      if (setAppDomain) setAppDomain('BOTH');
    }

    setAuthenticatedUser(targetUser);

    if (onLoginSuccess) {
      onLoginSuccess(targetUser);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/90 backdrop-blur-md font-sans text-slate-100">
      <div className="w-full max-w-md rounded-3xl bg-[#0B1322] border border-[#1E293B] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Title Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Construction Portal Access</h2>
          <p className="text-xs text-slate-400">
            Sign in to migrate directly into your authorized site workspace.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Username</label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                placeholder="e.g. admin or ramesh_patil"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 font-mono"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-[#070D18] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 placeholder-slate-500 font-mono"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Authenticate & Enter Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
