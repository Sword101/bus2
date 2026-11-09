'use client';

import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { NotificationItem } from '@/types';
import { Bell, CheckCheck, Clock, ShieldCheck } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadData = () => {
    if (!user) return;
    setNotifications(db.getNotificationsForUser(user.id));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [user?.id]);

  const handleMarkAllRead = () => {
    if (user) db.markAllNotificationsAsRead(user.id);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Administrative Alerts</h1>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                System-wide alerts, new complaint filings, driver duty changes, and operational notices
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All as Read</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                No administrative alerts on file.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition flex items-start justify-between gap-4 ${
                    !n.isRead ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                      <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                        {n.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => db.markNotificationAsRead(n.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap bg-blue-50 px-2.5 py-1 rounded-lg"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
