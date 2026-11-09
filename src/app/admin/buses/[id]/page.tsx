'use client';

import React, { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { Bus, BusRoute, DriverUser, Trip, StudentUser } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  Bus as BusIcon,
  ArrowLeft,
  MapPin,
  UserCheck,
  Clock,
  Navigation,
  ExternalLink,
  Users,
  Shield,
  Activity,
  History,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Phone,
  FileText,
} from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function AdminBusDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const busId = resolvedParams.id;
  const { user } = useAuth();

  const [bus, setBus] = useState<Bus | undefined>(undefined);
  const [route, setRoute] = useState<BusRoute | undefined>(undefined);
  const [driver, setDriver] = useState<DriverUser | undefined>(undefined);
  const [allDrivers, setAllDrivers] = useState<DriverUser[]>([]);
  const [allRoutes, setAllRoutes] = useState<BusRoute[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | undefined>(undefined);
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [followers, setFollowers] = useState<StudentUser[]>([]);

  // Edit / Reassignment mode
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    const b = db.getBusById(busId);
    setBus(b);
    if (b) {
      if (b.assignedRouteId) {
        setRoute(db.getRouteById(b.assignedRouteId));
        setSelectedRouteId(b.assignedRouteId);
      }
      if (b.assignedDriverId) {
        setDriver(db.getDriverById(b.assignedDriverId));
        setSelectedDriverId(b.assignedDriverId);
      }
      setActiveTrip(db.getActiveTripForBus(busId));
      setTripHistory(db.getTripsForBus(busId));
      setFollowers(db.getStudentsFollowingBus(busId));
    }
    setAllDrivers(db.getDrivers());
    setAllRoutes(db.getRoutes());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [busId]);

  const handleUpdateAssignment = () => {
    if (!bus) return;
    setStatusMsg(null);

    // Update driver if changed
    if (selectedDriverId !== (bus.assignedDriverId || '')) {
      if (selectedDriverId) {
        db.assignDriverToBus(selectedDriverId, bus.id, user?.id || 'admin');
      } else {
        db.updateBus(bus.id, { assignedDriverId: null }, user?.id || 'admin');
      }
    }

    // Update route if changed
    if (selectedRouteId !== (bus.assignedRouteId || '')) {
      db.updateBus(bus.id, { assignedRouteId: selectedRouteId || null }, user?.id || 'admin');
    }

    setStatusMsg({ type: 'success', text: 'Assignments updated successfully and affected parties notified.' });
  };

  if (!bus) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <DashboardLayout role="admin">
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Vehicle Not Found</h2>
            <p className="text-xs text-slate-500 mt-1">The bus ID requested does not exist in fleet registry.</p>
            <Link
              href="/admin/buses"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Buses</span>
            </Link>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  const externalMapLink = bus.currentLatitude && bus.currentLongitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${bus.currentLatitude},${bus.currentLongitude}`
    : null;

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* Top navigation & back link */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin/buses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Fleet Directory</span>
            </Link>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  bus.currentTripStatus === 'ON_TRIP'
                    ? 'bg-emerald-100 text-emerald-800'
                    : bus.currentTripStatus === 'PARKED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {bus.currentTripStatus}
              </span>
            </div>
          </div>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Master Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-sm">
                  <BusIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{bus.busNumber}</h1>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                      {bus.registrationNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {bus.name} • {bus.model || bus.busType} ({bus.capacity} seats)
                  </p>
                </div>
              </div>

              {externalMapLink && (
                <a
                  href={externalMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition self-start lg:self-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Follower Commuters</div>
                <div className="text-lg font-black text-slate-900 mt-1">{bus.selectedStudentsCount || 0}</div>
                <div className="text-[10px] text-slate-500">Students following this vehicle</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Telemetry Speed</div>
                <div className="text-lg font-black text-slate-900 mt-1">{bus.speed || 0} km/h</div>
                <div className="text-[10px] text-slate-500">Current GPS velocity</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Last Coordinate Ping</div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {bus.lastGpsUpdate ? new Date(bus.lastGpsUpdate).toLocaleTimeString() : 'N/A'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {bus.currentLatitude?.toFixed(4)}, {bus.currentLongitude?.toFixed(4)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Active Trip State</div>
                <div className="text-sm font-bold text-emerald-700 mt-1">
                  {activeTrip ? 'In Progress' : 'No Active Trip'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {activeTrip ? `Started ${new Date(activeTrip.startedAt).toLocaleTimeString()}` : 'Vehicle idle'}
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Map and Route Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Leaflet Map */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Real-Time Map Telemetry</span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  Coordinates: {bus.currentLatitude?.toFixed(5)}, {bus.currentLongitude?.toFixed(5)}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <Map bus={bus} stops={route?.stops || []} height="420px" zoom={13} />
              </div>
            </div>

            {/* Assignments & Reallocation Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Fleet Reallocation & Duty</span>
                </h2>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Assigned Driver
                    </label>
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="">No Driver Assigned</option>
                      {allDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.driverId} - {d.fullName}
                        </option>
                      ))}
                    </select>
                    {driver && (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-xl text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>{driver.phone || 'No phone recorded'}</span>
                        </div>
                        <div className="text-slate-500">License: {driver.licenseNumber} (Exp: {driver.licenseExpiry})</div>
                        <div className="text-slate-500">Emergency: {driver.emergencyContact}</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Assigned Route
                    </label>
                    <select
                      value={selectedRouteId}
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="">No Route Assigned</option>
                      {allRoutes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.routeNumber} - {r.name}
                        </option>
                      ))}
                    </select>
                    {route && (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-xl text-[11px] space-y-1">
                        <div className="font-semibold text-slate-900">{route.name}</div>
                        <div className="text-slate-500">Start: {route.startPoint}</div>
                        <div className="text-slate-500">End: {route.endPoint}</div>
                        <div className="text-slate-500">Est. Duration: {route.estimatedDurationMins} mins ({route.stops?.length || 0} stops)</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={handleUpdateAssignment}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Save & Notify Parties
                </button>
              </div>
            </div>
          </div>

          {/* Ordered Stops List (Where Is My Train style preview) */}
          {route && route.stops && route.stops.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Assigned Route Timetable & Ordered Stops</span>
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200">
                {route.stops.map((stop, index) => (
                  <div key={stop.id} className="relative flex items-start gap-4 text-xs">
                    <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow">
                      {stop.sequenceOrder}
                    </div>
                    <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{stop.name}</div>
                        <div className="text-slate-500 text-[11px]">{stop.address}</div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-700 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-400">Arr: </span>
                          <span className="font-bold">{stop.scheduledArrival}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div>
                          <span className="text-slate-400">Dep: </span>
                          <span className="font-bold">{stop.scheduledDeparture}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="text-slate-500">Wait {stop.waitingMins}m</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Following Students Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Students Enrolled for this Vehicle ({followers.length})</span>
            </h2>
            {followers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No students currently have this bus selected as their primary vehicle.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {followers.map((f) => (
                  <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">{f.fullName}</div>
                    <div className="text-[11px] text-blue-600 font-mono font-semibold">{f.enrollmentNumber}</div>
                    <div className="text-[11px] text-slate-500">{f.department} • {f.courseYear}</div>
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
