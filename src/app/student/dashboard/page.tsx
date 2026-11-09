'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { StudentUser, Bus, BusRoute, DriverUser, NotificationItem, Trip } from '@/types';
import {
  GraduationCap,
  Bus as BusIcon,
  Navigation,
  Clock,
  MapPin,
  ArrowRight,
  Bell,
  Search,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Phone,
  Sparkles,
} from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const student = user as StudentUser;

  const [selectedBus, setSelectedBus] = useState<Bus | undefined>(undefined);
  const [route, setRoute] = useState<BusRoute | undefined>(undefined);
  const [driver, setDriver] = useState<DriverUser | undefined>(undefined);
  const [activeTrip, setActiveTrip] = useState<Trip | undefined>(undefined);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);

  const loadData = () => {
    if (!student) return;

    const selection = db.getStudentSelection(student.id);
    if (selection) {
      const b = db.getBusById(selection.busId);
      setSelectedBus(b);

      if (b?.assignedRouteId) {
        setRoute(db.getRouteById(b.assignedRouteId));
      }
      if (b?.assignedDriverId) {
        setDriver(db.getDriverById(b.assignedDriverId));
      }
      if (b) {
        setActiveTrip(db.getActiveTripForBus(b.id));
      }
    } else {
      setSelectedBus(undefined);
      setRoute(undefined);
      setDriver(undefined);
      setActiveTrip(undefined);
    }

    const notifications = db.getNotificationsForUser(student.id);
    setRecentNotifications(notifications.slice(0, 3));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [student?.id]);

  const isOnTrip = selectedBus?.currentTripStatus === 'ON_TRIP';
  const isParked = selectedBus?.currentTripStatus === 'PARKED';
  const isIdle = !selectedBus || selectedBus.currentTripStatus === 'IDLE' || selectedBus.currentTripStatus === 'OFFLINE';

  const externalMapLink = selectedBus?.currentLatitude && selectedBus?.currentLongitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${selectedBus.currentLatitude},${selectedBus.currentLongitude}`
    : null;

  return (
    <RoleGuard allowedRoles={['student']}>
      <DashboardLayout role="student">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Transit Pass</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                  Hi, {student?.fullName || 'Student'}!
                </h1>
                <p className="text-xs text-blue-200 mt-1">
                  Enrollment: <strong className="font-mono text-white">{student?.enrollmentNumber}</strong> • {student?.department} ({student?.courseYear})
                </p>
              </div>

              {!selectedBus ? (
                <Link
                  href="/student/search"
                  className="px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs shadow-md hover:bg-blue-50 transition flex items-center gap-2 self-start sm:self-auto"
                >
                  <Search className="w-4 h-4" />
                  <span>Find & Select Your Bus</span>
                </Link>
              ) : (
                <Link
                  href="/student/search"
                  className="px-3.5 py-2 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-medium text-xs transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Change Bus Selection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Active Bus Card */}
          {selectedBus ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-sm">
                    <BusIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-slate-900">{selectedBus.busNumber}</h2>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {selectedBus.registrationNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {selectedBus.name} • {route?.name || 'Assigned Corridor'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      isOnTrip
                        ? 'bg-emerald-100 text-emerald-800'
                        : isParked
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnTrip
                          ? 'bg-emerald-500 animate-pulse'
                          : isParked
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span>{isOnTrip ? 'Live on Route' : isParked ? 'Parked / Layover' : 'Idle at Terminal'}</span>
                  </span>

                  {externalMapLink && (
                    <a
                      href={externalMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Status Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Next Scheduled Stop</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                    {route?.stops?.[1]?.name || route?.stops?.[0]?.name || 'University Gate'}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold">
                    Scheduled: {route?.stops?.[1]?.scheduledArrival || 'On Schedule'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Telemetry Velocity</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {selectedBus.speed || 0} <span className="text-xs font-semibold text-slate-500">km/h</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Live GPS tracking</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Assigned Driver</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                    {driver ? driver.fullName : 'Fleet Staff'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {driver?.phone ? `Contact: ${driver.phone}` : 'Institutional Driver'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Fellow Passengers</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {selectedBus.selectedStudentsCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-500">Following this shuttle</div>
                </div>
              </div>

              {/* Mini Interactive Map Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <Map bus={selectedBus} stops={route?.stops || []} height="320px" zoom={13} />
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-slate-500">
                  Route Corridor: <strong>{route?.startPoint}</strong> &rarr; <strong>{route?.endPoint}</strong>
                </span>
                <Link
                  href="/student/map"
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Open Fullscreen Rapido-Style Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <BusIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">No Bus Selected Yet</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  You haven&apos;t selected a primary transit bus. Select your regular campus shuttle to receive live GPS telemetry, stop arrival alerts, and delay updates.
                </p>
              </div>
              <Link
                href="/student/search"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                <Search className="w-4 h-4" />
                <span>Search Available Campus Buses</span>
              </Link>
            </div>
          )}

          {/* Recent Transit Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Recent Transit Alerts for You</span>
              </h2>
              <Link
                href="/student/notifications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All &rarr;
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent transit notices.</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{n.title}</div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
