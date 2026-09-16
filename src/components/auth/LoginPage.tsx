import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  HardHat, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Milestone,
  Building2,
  Layers
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

const STORAGE_USERS_KEY = 'PAVETRACK_AUTHORIZED_PERSONNEL_V2';
const STORAGE_SESSION_KEY = 'PAVETRACK_ACTIVE_SESSION_V2';

export const LoginPage: React.FC = () => {
  const { setCurrentUser, setUserRole, setAppDomain, login } = useERP() as any;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Please enter both username and password.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch registered users from User Management storage
      const storedUsersRaw = localStorage.getItem(STORAGE_USERS_KEY);
      let registeredUsers: any[] = [];
      
      if (storedUsersRaw) {
        registeredUsers = JSON.parse(storedUsersRaw);
      }

      // Default fallback account if storage is empty
      if (!registeredUsers || registeredUsers.length === 0) {
        registeredUsers = [
          {
            id: 'usr-1',
            fullName: 'Habibulla Bilgi',
            username: 'admin',
            password: 'Password@123',
            role: 'SUPER_ADMIN',
            allowedScope: 'BOTH_ROAD_AND_BUILDING',
            department: 'Operations',
            status: 'Active'
          }
        ];
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(registeredUsers));
      }

      // 2. Validate against stored user records
      const targetUser = registeredUsers.find(
        (u: any) =>
          String(u.username || '').trim().toLowerCase() === cleanUser &&
          String(u.password || '') === cleanPass &&
          (u.status === 'Active' || !u.status)
      );

      if (!targetUser) {
        // Fallback check on context login function if present
        if (typeof login === 'function') {
          const result = login(cleanUser, cleanPass);
          if (result && result.success) {
            setIsLoading(false);
            return;
          }
        }
        setErrorMessage('Invalid username or password. Please verify your credentials.');
        setIsLoading(false);
        return;
      }

      // 3. Save active user session
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(targetUser));
      localStorage.setItem('CONSTRUCTION_PRO_ERP_STORAGE_V7_USER', JSON.stringify(targetUser));
      localStorage.setItem('PAVETRACK_CURRENT_USER', JSON.stringify(targetUser));

      if (setCurrentUser) setCurrentUser(targetUser);
      if (setUserRole) setUserRole(targetUser.role);

      // 4. Migrate directly to allocated Construction Domain Workspace
      const scope = targetUser.allowedScope || 'BOTH_ROAD_AND_BUILDING';
      const role = String(targetUser.role || '').toUpperCase();

      if (setAppDomain) {
        if (scope === 'ROAD_ONLY') {
          setAppDomain('ROAD');
        } else if (scope === 'BUILDING_ONLY') {
          setAppDomain('BUILDING');
        } else {
          // Both Domains / Super Admin: default to Road with domain-switching privileges enabled
          setAppDomain('ROAD');
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMessage('An unexpected error occurred during authentication.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-blue-600 selection:text-white relative">
      <ThemeToggle floating />
      
      <div className="w-full max-w-md bg-[#121927] border border-[#1E293B] rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <HardHat className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase mt-2">
            CONSTRUCTION PRO
          </h1>
          <p className="text-xs text-blue-400 font-mono">
            Civil Infrastructure & ERP Workspace
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Enter username (e.g. admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-medium placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#162032] border border-[#1E293B] rounded-xl text-white outline-none focus:border-blue-500 font-mono placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In & Enter Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Domain Access Badges Hint */}
        <div className="pt-4 border-t border-[#1E293B] space-y-2">
          <div className="text-[10px] text-slate-500 text-center uppercase tracking-wider font-bold">
            Automated Role & Site Migration
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap text-[10px] font-semibold text-slate-400">
            <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Milestone className="w-3 h-3" /> Road Site
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-400 border border-purple-500/30 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Building Project
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Dual Domain (Admin)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
