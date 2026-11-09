'use client';

import React, { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { BusRoute, RouteStop } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { BHOPAL_CENTER, BHOPAL_LANDMARKS } from '@/lib/geo-config';
import {
  Route as RouteIcon,
  ArrowLeft,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Clock,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Navigation,
} from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function AdminRouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const routeId = resolvedParams.id;
  const { user } = useAuth();

  const [route, setRoute] = useState<BusRoute | undefined>(undefined);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stop add state
  const [showAddStop, setShowAddStop] = useState(false);
  const [stopName, setStopName] = useState('');
  const [stopAddress, setStopAddress] = useState('');
  const [stopLat, setStopLat] = useState<number>(BHOPAL_CENTER.lat);
  const [stopLng, setStopLng] = useState<number>(BHOPAL_CENTER.lng);
  const [arrTime, setArrTime] = useState('08:00 AM');
  const [depTime, setDepTime] = useState('08:02 AM');
  const [waitingMins, setWaitingMins] = useState(2);

  const loadData = () => {
    const r = db.getRouteById(routeId);
    setRoute(r);
    if (r?.stops) {
      setStops([...r.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder));
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [routeId]);

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stops.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...stops];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Reassign sequence orders
    const updated = reordered.map((s, idx) => ({ ...s, sequenceOrder: idx + 1 }));
    setStops(updated);
  };

  const handleRemoveStop = (id: string) => {
    const remaining = stops.filter((s) => s.id !== id);
    const updated = remaining.map((s, idx) => ({ ...s, sequenceOrder: idx + 1 }));
    setStops(updated);
  };

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopName.trim()) return;

    const newStop: RouteStop = {
      id: 'rs_' + Date.now(),
      routeId,
      name: stopName.trim(),
      address: stopAddress.trim() || `${stopName.trim()} Transit Stop`,
      latitude: Number(stopLat) || BHOPAL_CENTER.lat,
      longitude: Number(stopLng) || BHOPAL_CENTER.lng,
      sequenceOrder: stops.length + 1,
      scheduledArrival: arrTime,
      scheduledDeparture: depTime,
      waitingMins: Number(waitingMins) || 2,
    };

    setStops([...stops, newStop]);
    setShowAddStop(false);
    setStopName('');
    setStopAddress('');
  };

  const handleSaveRoute = () => {
    if (!route) return;

    const res = db.updateRoute(
      route.id,
      {
        stops,
        startPoint: stops.length > 0 ? stops[0].name : route.startPoint,
        endPoint: stops.length > 0 ? stops[stops.length - 1].name : route.endPoint,
      },
      user?.id || 'admin'
    );

    if (res) {
      setStatusMsg({
        type: 'success',
        text: 'Route timetable and stop sequence saved. Passengers notified of schedule update.',
      });
    } else {
      setStatusMsg({ type: 'error', text: 'Failed to update route.' });
    }
  };

  if (!route) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <DashboardLayout role="admin">
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Route Not Found</h2>
            <Link
              href="/admin/routes"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Routes</span>
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
              href="/admin/routes"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Routes</span>
            </Link>
            <button
              onClick={handleSaveRoute}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Route Timetable</span>
            </button>
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

          {/* Route Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">
                    {route.routeNumber}
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{route.name}</h1>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Start: <strong>{route.startPoint}</strong></span>
                  <span>&rarr;</span>
                  <span>End: <strong>{route.endPoint}</strong></span>
                  <span>•</span>
                  <span>{route.estimatedDurationMins} minutes</span>
                  <span>•</span>
                  <span>{stops.length} ordered stops</span>
                </div>
              </div>
              <button
                onClick={() => setShowAddStop(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stop</span>
              </button>
            </div>
          </div>

          {/* Map Preview of Route */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Route Stop Waypoints & Corridor Path</span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Click any numbered waypoint for schedule details
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <Map stops={stops} height="380px" zoom={13} />
            </div>
          </div>

          {/* Ordered Stops Management List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Ordered Stops & Scheduled Timetable ({stops.length})</span>
            </h2>

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                      {stop.sequenceOrder}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{stop.name}</div>
                      <div className="text-slate-500 text-[11px]">{stop.address}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Lat: {stop.latitude} | Lng: {stop.longitude}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="flex items-center gap-2 font-mono text-[11px] bg-white px-3 py-1.5 rounded-lg border border-slate-200">
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
                      <span className="text-slate-500">Wait {stop.waitingMins}m</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveStop(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveStop(index, 'down')}
                        disabled={index === stops.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveStop(stop.id)}
                        title="Remove Stop"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Stop Modal */}
          {showAddStop && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 border border-slate-200">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Add Intermediate Transit Stop</span>
                </h2>

                <form onSubmit={handleAddStop} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                      Quick Pick from Bhopal Landmarks
                    </label>
                    <select
                      onChange={(e) => {
                        const lm = BHOPAL_LANDMARKS.find((item) => item.name === e.target.value);
                        if (lm) {
                          setStopName(lm.name);
                          setStopAddress(lm.address);
                          setStopLat(lm.latitude);
                          setStopLng(lm.longitude);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="">Select a known Bhopal location (optional)...</option>
                      {BHOPAL_LANDMARKS.map((lm) => (
                        <option key={lm.name} value={lm.name}>
                          {lm.name} ({lm.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                      Stop Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MP Nagar Zone-1, New Market, MANIT..."
                      value={stopName}
                      onChange={(e) => setStopName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                      Street Address / Landmark
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite Main Emergency Gate"
                      value={stopAddress}
                      onChange={(e) => setStopAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={stopLat}
                        onChange={(e) => setStopLat(Number(e.target.value))}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={stopLng}
                        onChange={(e) => setStopLng(Number(e.target.value))}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                        Arrival Time
                      </label>
                      <input
                        type="text"
                        placeholder="07:45 AM"
                        value={arrTime}
                        onChange={(e) => setArrTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                        Departure Time
                      </label>
                      <input
                        type="text"
                        placeholder="07:47 AM"
                        value={depTime}
                        onChange={(e) => setDepTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                        Wait (Mins)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={waitingMins}
                        onChange={(e) => setWaitingMins(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStop(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                    >
                      Append Stop
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
