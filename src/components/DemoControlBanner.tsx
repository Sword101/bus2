'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/store';
import { ShieldCheck, Truck, GraduationCap, Play, Square, Info } from 'lucide-react';

export default function DemoControlBanner() {
  const { user, quickDemoLogin } = useAuth();
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setIsSimulating(db.isDemoSimulatorActive());
  }, []);

  const handleToggleSimulator = () => {
    const nextState = db.toggleDemoSimulator();
    setIsSimulating(nextState);
  };

  return (
    <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-600 text-white text-[10px]">
          Demo Console
        </span>
        <span className="text-slate-300 hidden sm:inline">
          Quick Switcher:
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => quickDemoLogin('admin')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Admin (ADMIN001)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => quickDemoLogin('driver')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'driver'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Driver (DRIVER001 - Bus 101)"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Driver</span>
          </button>
          <button
            onClick={() => quickDemoLogin('student')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition ${
              user?.role === 'student'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Student (STU2026001)"
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
            <span>Student</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleSimulator}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition ${
            isSimulating
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isSimulating ? (
            <>
              <Square className="w-3 h-3 fill-current" />
              <span>Pause GPS Sim</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Simulate Bus 101 GPS</span>
            </>
          )}
        </button>

        {isSimulating && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 animate-pulse font-mono">
            ● GPS Streaming
          </span>
        )}
      </div>
    </div>
  );
}
