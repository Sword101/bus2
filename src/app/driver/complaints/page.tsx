'use client';

import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { DriverUser, Bus, Complaint, ComplaintCategory, ComplaintPriority } from '@/types';
import {
  MessageSquareWarning,
  Plus,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bus as BusIcon,
  X,
} from 'lucide-react';

export default function DriverComplaintsPage() {
  const { user } = useAuth();
  const driver = user as DriverUser;

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('BREAKDOWN');
  const [priority, setPriority] = useState<ComplaintPriority>('HIGH');
  const [description, setDescription] = useState('');
  const [selectedBusId, setSelectedBusId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = () => {
    if (!driver) return;
    const userComplaints = db.getComplaintsForUser(driver.id);
    setComplaints(userComplaints);
    const allBuses = db.getBuses();
    setBuses(allBuses);

    const myBus = allBuses.find((b) => b.assignedDriverId === driver.id);
    if (myBus) setSelectedBusId(myBus.id);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [driver?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !description.trim()) {
      setError('Please provide subject and incident description.');
      return;
    }

    try {
      const created = db.createComplaint({
        complainantId: driver.id,
        complainantName: driver.fullName,
        complainantRole: 'driver',
        busId: selectedBusId || null,
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
      });

      setShowAddModal(false);
      setSubject('');
      setDescription('');
      setStatusMsg(`Incident report submitted (${created.ticketNumber}). Operations desk notified.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit complaint.');
    }
  };

  return (
    <RoleGuard allowedRoles={['driver']}>
      <DashboardLayout role="driver">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Incident Reports</h1>
              <p className="text-xs text-slate-500 mt-1">
                Report vehicle breakdowns, road blockages, mechanical faults, or operational disruptions
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Report Incident</span>
            </button>
          </div>

          {statusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Submitted Complaints List */}
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                You have not submitted any incident reports.
              </div>
            ) : (
              complaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {c.ticketNumber}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{c.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'NEW'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                        {c.category}
                      </span>
                      {c.busNumber && (
                        <span>Vehicle: <strong className="text-slate-700">{c.busNumber}</strong></span>
                      )}
                    </div>
                    <span>Submitted on {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Admin Responses */}
                  {c.updates && c.updates.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Operations Desk Updates
                      </div>
                      {c.updates
                        .filter((u) => !u.internalNote)
                        .map((u) => (
                          <div
                            key={u.id}
                            className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900"
                          >
                            <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                              <span>{u.responderName}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(u.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p>{u.message}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-900 border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquareWarning className="w-5 h-5 text-amber-600" />
                    <span>Report Vehicle or Transit Incident</span>
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {error && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Incident Subject *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Radiator coolant overheating indicator"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="BREAKDOWN">Vehicle Breakdown / Mechanical</option>
                        <option value="PUNCTUALITY">Route Delay / Traffic Jam</option>
                        <option value="CLEANLINESS">Vehicle Cleanliness</option>
                        <option value="APP_ISSUE">GPS / Mobile App Issue</option>
                        <option value="OTHER">Other Operational Issue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High (Urgent)</option>
                        <option value="CRITICAL">Critical (Road Immobilized)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Related Vehicle
                    </label>
                    <select
                      value={selectedBusId}
                      onChange={(e) => setSelectedBusId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="">No Specific Bus</option>
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.busNumber} - {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Detailed Incident Description *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specify location, symptoms, passenger safety impact, and immediate assistance needed..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-3.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                    >
                      Submit Report
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
