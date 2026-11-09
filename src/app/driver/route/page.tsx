'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { DriverUser, Bus, BusRoute, RouteStop } from '@/types';
import {
  Clock,
  MapPin,
  Bus as BusIcon,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function DriverRoutePage() {
  const { user } = useAuth();
  const driver = user as DriverUser;

  const [bus, setBus] = useState<Bus | undefined>(undefined);
  const [route, setRoute] = useState<BusRoute | undefined>(undefined);
  const [stops, setStops] = useState<RouteStop[]>([]);

  const loadData = () => {
    if (!driver) return;
    const buses = db.getBuses();
    const myBus = buses.find((b) => b.assignedDriverId === driver.id);
    setBus(myBus);

    if (myBus?.assignedRouteId) {
      const r = db.getRouteById(myBus.assignedRouteId);
      setRoute(r);
      if (r?.stops) {
        setStops([...r.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder));
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [driver?.id]);

  return (
    <RoleGuard allowedRoles={['driver']}>
      <DashboardLayout role="driver">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Route Timetable</h1>
            <p className="text-xs text-slate-500 mt-1">
              Where-is-my-train sequence, scheduled arrival and departure timings, and waypoint locations
            </p>
          </div>

          {route ? (
            <>
              {/* Route Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {route.routeNumber}
                      </span>
                      <h2 className="text-lg font-black text-slate-900">{route.name}</h2>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {route.startPoint} &rarr; {route.endPoint} • ~{route.estimatedDurationMins} minutes ({route.distanceKm} km)
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
                    return (
                      <div key={stop.id} className="relative flex items-start gap-4 text-xs">
                        <div
                          className={`absolute -left-6 top-0 w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center border-2 border-white shadow ${
                            isStart
                              ? 'bg-emerald-600 text-white'
                              : isTerminal
                              ? 'bg-slate-900 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {stop.sequenceOrder}
                        </div>

                        <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{stop.name}</span>
                              {isStart && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                                  ORIGIN
                                </span>
                              )}
                              {isTerminal && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 font-bold">
                                  TERMINAL
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

              {/* Route Map */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Interactive Route Stop Waypoint Map</span>
                </h2>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <Map bus={bus} stops={stops} height="360px" zoom={13} />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h2 className="text-sm font-bold text-slate-800">No Route Assigned</h2>
              <p className="text-slate-500 mt-1">Your bus does not currently have an assigned route.</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
