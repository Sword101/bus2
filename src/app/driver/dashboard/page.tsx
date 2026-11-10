'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { DriverUser, Bus, BusRoute, Trip } from '@/types';
import {
  Truck,
  Bus as BusIcon,
  Navigation,
  Clock,
  ArrowRight,
  Shield,
  MapPin,
  AlertTriangle,
  Play,
  Square,
  CheckCircle2,
  Users,
} from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const driverUser = user as DriverUser;

  const [assignedBus, setAssignedBus] = useState<Bus | undefined>(undefined);
  const [route, setRoute] = useState<BusRoute | undefined>(undefined);
  const [activeTrip, setActiveTrip] = useState<Trip | undefined>(undefined);

  const loadData = () => {
    if (!driverUser) return;
    const buses = db.getBuses();
    const myBus = buses.find((b) => b.assignedDriverId === driverUser.id);
    setAssignedBus(myBus);

    if (myBus?.assignedRouteId) {
      setRoute(db.getRouteById(myBus.assignedRouteId));
      setActiveTrip(db.getActiveTripForBus(myBus.id));
    } else {
      setRoute(undefined);
      setActiveTrip(undefined);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [driverUser?.id]);

  return (
    <RoleGuard allowedRoles={['driver']}>
      <DashboardLayout role="driver">
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Driver Duty
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                  Welcome, {driverUser?.fullName || 'Driver'}
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Driver ID: <span className="font-mono font-bold text-white">{driverUser?.driverId}</span> • License: {driverUser?.licenseNumber}
                </p>
              </div>

              <Link
                href="/driver/trip"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                <Navigation className="w-4 h-4" />
                <span>Go to Live Trip Telemetry</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Assigned Vehicle Overview */}
          {assignedBus ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <BusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">{assignedBus.busNumber}</span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {assignedBus.registrationNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{assignedBus.name} ({assignedBus.busType})</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      assignedBus.currentTripStatus === 'ON_TRIP'
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : assignedBus.currentTripStatus === 'PARKED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Vehicle Status: {assignedBus.currentTripStatus}
                  </span>
                </div>
              </div>

              {/* Vehicle Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Route Corridor</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                    {route ? route.name : 'Unassigned'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {route ? `${route.estimatedDurationMins}m est.` : 'Contact admin'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Follower Students</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {assignedBus.selectedStudentsCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-500">Awaiting your journey</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Seating Capacity</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{assignedBus.capacity}</div>
                  <div className="text-[10px] text-slate-500">Passenger capacity</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Active Journey</div>
                  <div className="text-sm font-bold text-emerald-700 mt-1">
                    {activeTrip ? 'Trip Underway' : 'Trip Not Started'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {activeTrip ? 'GPS is streaming' : 'Ready to depart'}
                  </div>
                </div>
              </div>

              {/* Route Path Summary */}
              {route && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Corridor: {route.startPoint} &rarr; {route.endPoint}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    This route contains {route.stops?.length || 0} ordered stops. Start the journey in the Trip Control tab to begin broadcasting live GPS updates to waiting students.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h2 className="text-sm font-bold text-slate-800">No Vehicle Currently Assigned</h2>
              <p className="text-slate-500 mt-1 max-w-md mx-auto">
                You do not have an active bus duty assigned by fleet dispatch. Please check with your supervisor or administrator.
              </p>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/driver/trip"
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Live Trip Console</div>
                  <div className="text-[10px] text-slate-500">Start / Park / End Trip</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/driver/route"
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Stop Timetable</div>
                  <div className="text-[10px] text-slate-500">Arrival & departure schedule</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/driver/complaints"
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Report Incident</div>
                  <div className="text-[10px] text-slate-500">Breakdown or delays</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
