'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { Complaint, ComplaintStatus } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  MessageSquareWarning,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  User,
  Bus as BusIcon,
  Shield,
  FileText,
} from 'lucide-react';

export default function AdminComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const complaintId = resolvedParams.id;
  const { user } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | undefined>(undefined);
  const [responseMsg, setResponseMsg] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [isInternal, setIsInternal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = () => {
    const c = db.getComplaints().find((item) => item.id === complaintId);
    setComplaint(c);
    if (c) setNewStatus(c.status);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [complaintId]);

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !responseMsg.trim()) return;

    db.addComplaintUpdate(
      complaint.id,
      user?.id || 'admin',
      responseMsg.trim(),
      newStatus,
      isInternal
    );

    setResponseMsg('');
    setStatusMsg('Response submitted and complainant notified.');
  };

  if (!complaint) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <DashboardLayout role="admin">
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-800">Complaint Not Found</h2>
            <Link
              href="/admin/complaints"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Complaints</span>
            </Link>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/complaints"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Complaints Desk</span>
            </Link>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                complaint.status === 'RESOLVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : complaint.status === 'NEW'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {complaint.status}
            </span>
          </div>

          {statusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Ticket Master Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {complaint.ticketNumber}
                  </span>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {complaint.category}
                  </span>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                    {complaint.priority} Priority
                  </span>
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight mt-2">
                  {complaint.subject}
                </h1>
              </div>
              <div className="text-right text-xs text-slate-400">
                Submitted on {new Date(complaint.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs border-b border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Complainant</span>
                <span className="font-bold text-slate-900">{complaint.complainantName}</span>
                <span className="text-slate-500 capitalize ml-1">({complaint.complainantRole})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Related Vehicle</span>
                <span className="font-bold text-slate-900">{complaint.busNumber || 'None Specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Last Updated</span>
                <span className="text-slate-700">{new Date(complaint.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">Complainant Description</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                {complaint.description}
              </div>
            </div>
          </div>

          {/* Activity / Response History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Resolution Updates & Correspondence ({complaint.updates?.length || 0})</span>
            </h2>

            {(!complaint.updates || complaint.updates.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No administrative updates or replies recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {complaint.updates.map((u) => (
                  <div
                    key={u.id}
                    className={`p-4 rounded-xl border text-xs ${
                      u.internalNote
                        ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-bold">
                        <span>{u.responderName}</span>
                        {u.internalNote && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-200 text-amber-800">
                            Internal Note (Hidden from Complainant)
                          </span>
                        )}
                        {u.statusTransition && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                            Status &rarr; {u.statusTransition}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(u.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="leading-relaxed">{u.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Response Form */}
            <form onSubmit={handleSubmitResponse} className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Submit Action / Complainant Response</h3>
              <textarea
                rows={3}
                placeholder="Type response to complainant or internal dispatch note..."
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">Transition Status:</span>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 font-semibold text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="NEW">NEW</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-600"
                    />
                    <span>Internal note only</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
