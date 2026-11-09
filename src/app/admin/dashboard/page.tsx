'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { Bus, BusRoute, DriverUser, Complaint } from '@/types';
import {
  Bus as BusIcon,
  Users,
  UserCheck,
  GraduationCap,
  Navigation,
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function AdminDashboardPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const loadData = () => {
    setBuses(db.getBuses());
    setRoutes(db.getRoutes());
    setDrivers(db.getDrivers());
    setStudents(db.getAllStudents());
    setComplaints(db.getComplaints());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = db.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const totalBuses = buses.length;
  const activeBuses = buses.filter((b) => b.currentTripStatus === 'ON_TRIP').length;
  const parkedBuses = buses.filter((b) => b.currentTripStatus === 'PARKED').length;
  const idleBuses = buses.filter((b) => b.currentTripStatus === 'IDLE' || b.currentTripStatus === 'OFFLINE').length;
  const totalDrivers = drivers.length;
  const totalStudents = students.length;
  const pendingComplaints = complaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED').length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Command Overview</h1>
              <p className="text-xs text-slate-500 mt-1">
                Live monitoring, real-time bus telemetry, and institutional transit status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/buses"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <BusIcon className="w-4 h-4" />
                <span>Manage Fleet</span>
              </Link>
            </div>
          </div>

          {/* KPI Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Fleet Status</span>
                <BusIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalBuses}</div>
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="font-semibold text-emerald-600">{activeBuses} on trip</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-amber-600">{parkedBuses} parked</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{idleBuses} idle</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Drivers</span>
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalDrivers}</div>
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                Active certified operators
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Enrolled Students</span>
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                {buses.reduce((acc, b) => acc + (b.selectedStudentsCount || 0), 0)} active bus selections
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Complaints</span>
                <MessageSquareWarning className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{pendingComplaints}</div>
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className="font-semibold text-red-600">{pendingComplaints} pending</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-emerald-600">{resolvedComplaints} resolved</span>
              </div>
            </div>
          </div>

          {/* Live Fleet Map Section */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Live Fleet Telemetry Map</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time GPS tracking positions for all active and parked transit vehicles
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Broadcast Active
              </span>
            </div>

            {/* Map Container */}
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <Map allBuses={buses} height="440px" zoom={12} />
            </div>
          </div>

          {/* Active Fleet Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Fleet Operations Breakdown</h2>
              <Link href="/admin/buses" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>View Full Fleet Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Bus Number</th>
                    <th className="px-5 py-3">Name & Model</th>
                    <th className="px-5 py-3">Assigned Route</th>
                    <th className="px-5 py-3">Driver</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Followers</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {buses.map((bus) => {
                    const route = routes.find((r) => r.id === bus.assignedRouteId);
                    const driver = drivers.find((d) => d.id === bus.assignedDriverId);
                    return (
                      <tr key={bus.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{bus.busNumber}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{bus.name}</div>
                          <div className="text-[10px] text-slate-400">{bus.model || bus.busType}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          {route ? (
                            <span className="font-semibold text-blue-600">{route.name}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {driver ? (
                            <span className="font-semibold text-slate-800">{driver.fullName}</span>
                          ) : (
                            <span className="text-slate-400 italic">No driver</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              bus.currentTripStatus === 'ON_TRIP'
                                ? 'bg-emerald-100 text-emerald-800'
                                : bus.currentTripStatus === 'PARKED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {bus.currentTripStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {bus.selectedStudentsCount || 0} students
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/admin/buses/${bus.id}`}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                          >
                            Details &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
