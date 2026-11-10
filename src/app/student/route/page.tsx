'use client';

import React, { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { StudentUser, Bus, BusRoute, RouteStop, Trip } from '@/types';
import { Clock, MapPin, Bus as BusIcon, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StudentRoutePage() {
  const { user } = useAuth();
  const student = user as StudentUser;

  const [bus, setBus] = useState<Bus | undefined>(undefined);
  const [route, setRoute] = useState<BusRoute | undefined>(undefined);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | undefined>(undefined);

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
        } else {
          setStops([]);
        }
      } else {
        setRoute(undefined);
        setStops([]);
      }
      if (b) {
        setActiveTrip(db.getActiveTripForBus(b.id));
      } else {
        setActiveTrip(undefined);
      }
    } else {
      setBus(undefined);
      setRoute(undefined);
      setStops([]);
      setActiveTrip(undefined);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [student?.id]);

  if (!bus || !route) {
    return (
      <RoleGuard allowedRoles={['student']}>
        <DashboardLayout role="student">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <Clock className="w-10 h-10 text-blue-600 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">No Bus Route Selected</h2>
            <p className="text-xs text-slate-500">
              Select your transit bus to view its stop timings and Where-Is-My-Train sequence.
            </p>
            <Link
              href="/student/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              <span>Search Buses &rarr;</span>
            </Link>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  const isOnTrip = bus.currentTripStatus === 'ON_TRIP';
  let nextStopIndex = -1;
  if (isOnTrip && stops.length > 0) {
    if (activeTrip?.currentStopId) {
      const idx = stops.findIndex((s) => s.id === activeTrip.currentStopId);
      nextStopIndex = idx !== -1 ? idx : (stops.length > 1 ? 1 : 0);
    } else {
      nextStopIndex = stops.length > 1 ? 1 : 0;
    }
  }

  return (
    <RoleGuard allowedRoles={['student']}>
      <DashboardLayout role="student">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Route Timetable</h1>
            <p className="text-xs text-slate-500 mt-1">
              Where-is-my-train sequence for <strong className="text-slate-800">{bus.busNumber}</strong> ({route.name})
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {route.routeNumber}
                  </span>
                  <h2 className="text-lg font-black text-slate-900">{route.name}</h2>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {route.startPoint} → {route.endPoint} • ~{route.estimatedDurationMins} minutes ({route.distanceKm} km)
                </div>
              </div>
              <div className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                {stops.length} Scheduled Stops
              </div>
            </div>

            {/* Where Is My Train Timeline */}
            <div className="mt-6 relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200">
              {stops.map((stop, index) => {
                const isStart = index === 0;
                const isTerminal = index === stops.length - 1;
                const isNext = isOnTrip && index === nextStopIndex;
                const isPassed = isOnTrip && nextStopIndex !== -1 && index < nextStopIndex;

                return (
                  <div key={stop.id} className="relative flex items-start gap-4 text-xs">
                    <div
                      className={`absolute -left-6 top-0 w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center border-2 border-white shadow ${
                        isPassed
                          ? 'bg-slate-400 text-white'
                          : isNext
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse'
                          : isStart
                          ? 'bg-emerald-600 text-white'
                          : isTerminal
                          ? 'bg-slate-900 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {stop.sequenceOrder}
                    </div>

                    <div
                      className={`flex-1 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isNext ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
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
                          {isStart && !isPassed && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                              ORIGIN
                            </span>
                          )}
                          {isTerminal && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 font-bold">
                              TERMINAL
                            </span>
                          )}
                          {isPassed && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 font-medium">
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
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
