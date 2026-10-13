import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, Shield, Sparkles, Clock } from 'lucide-react';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-18 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand & Institution Info */}
      <div className="flex items-center space-x-3.5">
        <div className="relative group cursor-pointer">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-900 via-brand-700 to-indigo-600 p-0.5 shadow-md shadow-brand-500/10 ring-2 ring-brand-100 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <img
              src="/assets/college-logo.png"
              alt="ICET Emblem"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                // Fallback to stylized SVG emblem if image load fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-200" title="System Operational" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
              Imperial College of Engineering & Technology
            </h1>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
              <Sparkles className="w-2.5 h-2.5 mr-0.5 text-amber-500" />
              NAAC A++
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            CollegeSphere Governance Portal <span className="text-slate-300 mx-1">•</span> AY 2025-2026
          </p>
        </div>
      </div>

      {/* Clock, User Info & Actions */}
      <div className="flex items-center space-x-4">
        {/* Live Institutional Clock */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100/70 border border-slate-200/60 text-xs font-mono text-slate-600">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          <span>{timeString} IST</span>
        </div>

        {/* Notifications */}
        <button
          title="Campus Circulars & Notifications"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all relative cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-brand-600 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {user && (
          <div className="flex items-center space-x-3.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">{user.email}</p>
              <div className="mt-1 flex items-center justify-end space-x-1">
                {user.roles.map((role) => (
                  <Badge key={role} variant="info" className="text-[10px] py-0 px-2 uppercase font-bold tracking-wider">
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-xl transition-all border border-rose-200/60 cursor-pointer shadow-xs active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
