'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { StudentUser, Bus, BusRoute, RouteStop, Trip } from '@/types';
import {
  Navigation,
  ExternalLink,
  Clock,
  MapPin,
  Bus as BusIcon,
  AlertCircle,
  RotateCcw,
  List,
  Compass,
} from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function StudentLiveMapPage() {
  const { user } = useAuth();
  const student = user as StudentUser;

  const [bus, setBus] = useState<Bus | undefined>(undefined);
  const [route, setRoute] = useState<BusRoute | undefined>(undefined);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | undefined>(undefined);
  const [selectedStop, setSelectedStop] = useState<RouteStop | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'MAP' | 'TIMELINE'>('MAP');

  const loadData = () => {
    if (!student) return;
    const selection = db.getStudentSelection(student.id);
    if (selection) {
      const b = db.getBusById(selection.busId);
      setBus(b);
      if (b?.assignedRouteId) {
        const r = db.getRouteById(b.assignedRouteId);
        setRoute(r);
        if (r?.stops) {
          setStops([...r.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder));
        }
      }
      if (b) {
        setActiveTrip(db.getActiveTripForBus(b.id));
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [student?.id]);

  if (!bus) {
    return (
      <RoleGuard allowedRoles={['student']}>
        <DashboardLayout role="student">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <BusIcon className="w-12 h-12 text-blue-600 mx-auto" />
            <h2 className="text-lg font-black text-slate-900">No Bus Selected For Tracking</h2>
            <p className="text-xs text-slate-500">
              Please choose a campus bus to track its live coordinates and stop progression on the map.
            </p>
            <Link
              href="/student/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition"
            >
              <span>Search Available Buses &rarr;</span>
            </Link>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  const isStale = bus.lastGpsUpdate
    ? Date.now() - new Date(bus.lastGpsUpdate).getTime() > 90000
    : false;

  const externalMapLink = bus.currentLatitude && bus.currentLongitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${bus.currentLatitude},${bus.currentLongitude}`
    : null;

  return (
    <RoleGuard allowedRoles={['student']}>
      <DashboardLayout role="student">
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live Vehicle Telemetry</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    bus.currentTripStatus === 'ON_TRIP'
                      ? isStale
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : bus.currentTripStatus === 'PARKED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {bus.currentTripStatus === 'ON_TRIP'
                    ? isStale
                      ? 'GPS SIGNAL STALE'
                      : 'LIVE EN ROUTE'
                    : bus.currentTripStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tracking <strong className="text-slate-800">{bus.busNumber}</strong> ({bus.name}) on route <strong className="text-slate-800">{route?.name || 'Assigned Corridor'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* View Switcher: Map vs Timeline */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                <button
                  onClick={() => setViewMode('MAP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'MAP'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Map Tracker</span>
                </button>
                <button
                  onClick={() => setViewMode('TIMELINE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'TIMELINE'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Stop Timeline</span>
                </button>
              </div>

              {externalMapLink && (
                <a
                  href={externalMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Google Maps</span>
                </a>
              )}
            </div>
          </div>

          {/* Stale Alert Warning */}
          {isStale && bus.currentTripStatus === 'ON_TRIP' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                GPS location updates may be delayed or phone is in low connectivity. Showing last reported position from{' '}
                {new Date(bus.lastGpsUpdate || '').toLocaleTimeString()}.
              </span>
            </div>
          )}

          {/* Live Telemetry Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Speed</div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {bus.speed || 0} <span className="text-xs font-normal text-slate-500">km/h</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Real-time GPS</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Upcoming Stop</div>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                {route?.stops?.[1]?.name || route?.stops?.[0]?.name || 'Terminal'}
              </div>
              <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                Arrival: {route?.stops?.[1]?.scheduledArrival || 'On Time'}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Last Coordinate Fix</div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {bus.lastGpsUpdate ? new Date(bus.lastGpsUpdate).toLocaleTimeString() : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {bus.currentLatitude?.toFixed(4)}, {bus.currentLongitude?.toFixed(4)}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Route End</div>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                {route?.endPoint || 'Campus Terminus'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Est. ~{route?.estimatedDurationMins}m journey
              </div>
            </div>
          </div>

          {/* Main Map or Timeline View */}
          {viewMode === 'MAP' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Interactive Live Tracking Map</span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  Click any stop marker for scheduled arrival time
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <Map
                  bus={bus}
                  stops={stops}
                  selectedStopId={selectedStop?.id}
                  onSelectStop={(s) => setSelectedStop(s)}
                  height="480px"
                  zoom={13}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Where-Is-My-Train Stop Progression</span>
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200">
                {stops.map((stop, index) => {
                  const isCompleted = index === 0 && bus.currentTripStatus === 'ON_TRIP';
                  const isNext = index === 1 && bus.currentTripStatus === 'ON_TRIP';

                  return (
                    <div key={stop.id} className="relative flex items-start gap-4 text-xs">
                      <div
                        className={`absolute -left-6 top-0 w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center border-2 border-white shadow ${
                          isCompleted
                            ? 'bg-slate-400 text-white'
                            : isNext
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {stop.sequenceOrder}
                      </div>

                      <div
                        className={`flex-1 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isNext
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{stop.name}</span>
                            {isNext && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                                NEXT STOP
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                                Passed
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">{stop.address}</div>
                        </div>

                        <div className="flex items-center gap-3 font-mono text-[11px] bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                          <div>
                            <span className="text-slate-400">Arr: </span>
                            <span className="font-bold text-slate-800">{stop.scheduledArrival}</span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <div>
                            <span className="text-slate-400">Dep: </span>
                            <span className="font-bold text-slate-800">{stop.scheduledDeparture}</span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-sans">{stop.waitingMins}m wait</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
