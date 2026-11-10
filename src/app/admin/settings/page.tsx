'use client';

import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { AdminUser } from '@/types';
import { ShieldCheck, Plus, CheckCircle2, AlertCircle, User, Lock, KeyRound } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminId, setAdminId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Transit Operations');
  const [password, setPassword] = useState('Admin@123');

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAdmins = () => {
    setAdmins(db.getAdmins());
  };

  useEffect(() => {
    loadAdmins();
    const unsub = db.subscribe(loadAdmins);
    return () => unsub();
  }, []);

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    const cleanId = adminId.trim().toUpperCase();
    if (!cleanId || !fullName.trim()) {
      setErrorMsg('Admin ID and full name are required.');
      return;
    }

    const res = db.createAdmin(
      {
        adminId: cleanId,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        department: department.trim() || undefined,
        password: password || 'Admin@123',
      },
      user?.id || 'admin'
    );

    if (res.admin) {
      setStatusMsg(`Administrator account ${cleanId} (${fullName}) created successfully.`);
      setAdminId('');
      setFullName('');
      setEmail('');
      setPassword('Admin@123');
    } else {
      setErrorMsg(res.error || 'Failed to create administrator account.');
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System & Administrator Governance</h1>
            <p className="text-xs text-slate-500 mt-1">
              Privileged access control, super-admin account protection, and authority delegation
            </p>
          </div>

          {statusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Super-admin Safeguard Banner */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Super-Admin Account Protection Active</div>
              <div className="text-slate-600 mt-0.5 leading-relaxed">
                Primary administrator <strong className="text-blue-900">ADMIN001</strong> is permanently protected against accidental deletion or removal. At least one operational super-admin is always preserved.
              </div>
            </div>
          </div>

          {/* Active Administrators Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Active Authorized Administrators ({admins.length})</h2>
            <div className="space-y-3">
              {admins.map((a) => (
                <div key={a.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center">
                      {a.fullName.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{a.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {a.adminId} • {a.email || 'N/A'} • {a.department}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.adminId === 'ADMIN001'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {a.adminId === 'ADMIN001' ? 'SUPER ADMIN' : 'OPERATIONS ADMIN'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Provision New Administrator Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Provision Secondary Administrator</span>
            </h2>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Admin ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ADMIN002"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eleanor Rigby"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="Transit Operations"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Create Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
