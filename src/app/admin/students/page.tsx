'use client';

import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { StudentUser, Bus, BusRoute } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  GraduationCap,
  Search,
  Filter,
  KeyRound,
  Bus as BusIcon,
  BookOpen,
  Calendar,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [search, setSearch] = useState('');
  const [busFilter, setBusFilter] = useState('ALL');

  // Password reset modal
  const [resetModalStudent, setResetModalStudent] = useState<StudentUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = () => {
    setStudents(db.getAllStudents());
    setBuses(db.getBuses());
    setRoutes(db.getRoutes());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStudent || !newPassword) return;

    db.resetUserPassword(resetModalStudent.enrollmentNumber, newPassword, user?.id || 'admin');
    setResetModalStudent(null);
    setNewPassword('');
    setStatusMsg(`Password reset successfully for student ${resetModalStudent.enrollmentNumber}.`);
  };

  const filteredStudents = students.filter((s) => {
    const selection = db.getStudentSelection(s.id);
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollmentNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    const matchesBus = busFilter === 'ALL' || selection?.busId === busFilter;
    return matchesSearch && matchesBus;
  });

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Commuter Directory</h1>
              <p className="text-xs text-slate-500 mt-1">
                Enrolled students, bus selections, department mapping, and credential administration
              </p>
            </div>
          </div>

          {statusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Quick Bus Selection Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {buses.map((bus) => (
              <div key={bus.id} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{bus.busNumber}</span>
                  <span className="text-blue-600 font-black">{bus.selectedStudentsCount || 0}</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{bus.name}</div>
              </div>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, enrollment #, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter Bus:
              </span>
              <select
                value={busFilter}
                onChange={(e) => setBusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="ALL">All Vehicles</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.busNumber} - {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Enrollment Number</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Department & Year</th>
                    <th className="px-5 py-3">Selected Bus</th>
                    <th className="px-5 py-3">Assigned Route</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map((s) => {
                    const selection = db.getStudentSelection(s.id);
                    const selectedBus = selection ? buses.find((b) => b.id === selection.busId) : null;
                    const selectedRoute = selectedBus?.assignedRouteId
                      ? routes.find((r) => r.id === selectedBus.assignedRouteId)
                      : null;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-blue-600">
                          {s.enrollmentNumber}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{s.fullName}</td>
                        <td className="px-5 py-3.5">
                          <div>{s.department}</div>
                          <div className="text-[10px] text-slate-400">{s.courseYear}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          {selectedBus ? (
                            <span className="font-bold text-slate-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              {selectedBus.busNumber} ({selectedBus.name})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No Selection</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {selectedRoute ? (
                            <span className="font-semibold text-slate-700">{selectedRoute.name}</span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setResetModalStudent(s)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 px-2.5 py-1 rounded-lg transition"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Reset Pass</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reset Password Modal */}
          {resetModalStudent && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-slate-900 border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Reset Student Password</span>
                  </h2>
                  <button
                    onClick={() => setResetModalStudent(null)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
                  <p className="text-xs text-slate-600">
                    Set a new password for student <strong>{resetModalStudent.fullName}</strong> ({resetModalStudent.enrollmentNumber}).
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      New Password
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Student@2026"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetModalStudent(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
