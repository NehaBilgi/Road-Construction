import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { HardHat, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

const STORAGE_KEYS = [
  'PAVETRACK_AUTHORIZED_PERSONNEL_V2',
  'PAVETRACK_AUTHORIZED_PERSONNEL_V1',
  'PAVETRACK_SYSTEM_USERS_V1'
];

export const LoginPage: React.FC = () => {
  const erp = useERP() as any;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const inputUser = username.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setErrorMessage('Please enter both username and password.');
      setIsLoading(false);
      return;
    }

    // 1. Gather all registered users across storage versions
    let allUsers: any[] = [];
    STORAGE_KEYS.forEach((key) => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            allUsers = [...allUsers, ...parsed];
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    // 2. Find matching user by username or email
    const matchedUser = allUsers.find(
      (u: any) =>
        (u.username && u.username.toLowerCase() === inputUser) ||
        (u.email && u.email.toLowerCase() === inputUser) ||
        (u.fullName && u.fullName.toLowerCase() === inputUser)
    );

    // 3. Fallback to ERP context login method first if user not found in local storage
    if (!matchedUser) {
      if (typeof erp?.login === 'function') {
        const res = erp.login(username.trim(), inputPass);
        if (res && res.success) {
          setIsLoading(false);
          return;
        }
      }
      setErrorMessage('User account not found. Please check username.');
      setIsLoading(false);
      return;
    }

    // 4. Validate password
    const userPass = matchedUser.password || '';
    if (userPass && userPass !== inputPass) {
      setErrorMessage('Incorrect password. Please try again.');
      setIsLoading(false);
      return;
    }

    // 5. Set session across context & localStorage
    const authenticatedUser = {
      ...matchedUser,
      status: 'Active'
    };

    try {
      localStorage.setItem('PAVETRACK_CURRENT_USER', JSON.stringify(authenticatedUser));
      localStorage.setItem('ERP_AUTH_TOKEN', 'token_' + Date.now());
    } catch {}

    if (typeof erp?.setCurrentUser === 'function') {
      erp.setCurrentUser(authenticatedUser);
    } else if (typeof erp?.setUser === 'function') {
      erp.setUser(authenticatedUser);
    } else if (typeof erp?.login === 'function') {
      erp.login(matchedUser.username || username, inputPass);
    }

    // Force refresh if the context doesn't re-render automatically
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-blue-600 selection:text-white relative">
      <ThemeToggle floating />
      <div className="w-full max-w-md bg-[#121927] border border-[#1E293B] rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <HardHat className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase mt-2">
            CONSTRUCTION PRO
          </h1>
          <p className="text-xs text-blue-400 font-mono">
            Road Construction ERP System
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
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Enter your username"
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
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
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
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Role Permissions Hint */}
        <div className="pt-4 border-t border-[#1E293B] text-[11px] text-slate-500 text-center leading-relaxed">
          Role-Based Access Control (SUPER_ADMIN • STORE_MANAGER • SITE_SUPERVISOR • SITE_ENGINEER • AUDITOR)
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
