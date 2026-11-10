'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import DemoControlBanner from '@/components/DemoControlBanner';
import {
  Bus,
  Lock,
  User,
  ShieldCheck,
  Truck,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide both identifier and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        // Redirect directly based on verified user role
        if (res.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (res.role === 'driver') {
          router.push('/driver/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected login error.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoControlBanner />

      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Bus className="w-4 h-4" />
          </div>
          <span className="font-black text-slate-900 text-lg">BusTrack</span>
        </Link>
        <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-blue-600">
          Back to Home &rarr;
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your designated Transit ID or Student Enrollment Number
            </p>
          </div>

          {/* 1-Click Demo Credential Auto-fillers */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
              Auto-Fill Demo Credentials
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('ADMIN001', 'Admin@123')}
                className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-[11px] font-semibold text-slate-700 flex flex-col items-center gap-0.5 transition"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('DRIVER001', 'Driver@123')}
                className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 flex flex-col items-center gap-0.5 transition"
              >
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Driver</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('STU2026001', 'Student@123')}
                className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-[11px] font-semibold text-slate-700 flex flex-col items-center gap-0.5 transition"
              >
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Student</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Account Identifier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. STU2026001, DRIVER001, ADMIN001"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Enrollment number for students, Driver ID for drivers, Admin ID for admins.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>New student? </span>
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
