'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { BusRoute } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { BHOPAL_CENTER, BHOPAL_LANDMARKS } from '@/lib/geo-config';
import {
  Route as RouteIcon,
  Plus,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AdminRoutesPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [search, setSearch] = useState('');

  // Add Route Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [routeNumber, setRouteNumber] = useState('');
  const [name, setName] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [durationMins, setDurationMins] = useState(45);
  const [distanceKm, setDistanceKm] = useState(20);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = () => {
    setRoutes(db.getRoutes());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const cleanNum = routeNumber.trim().toUpperCase();
    if (!cleanNum || !name.trim() || !startPoint.trim() || !endPoint.trim()) {
      setModalError('Please fill in all required route fields.');
      return;
    }

    if (routes.some((r) => r.routeNumber.toUpperCase() === cleanNum)) {
      setModalError(`Route number "${cleanNum}" already exists.`);
      return;
    }

    try {
      const startLm = BHOPAL_LANDMARKS.find((lm) =>
        startPoint.trim().toLowerCase().includes(lm.name.toLowerCase()) ||
        lm.name.toLowerCase().includes(startPoint.trim().toLowerCase())
      );
      const endLm = BHOPAL_LANDMARKS.find((lm) =>
        endPoint.trim().toLowerCase().includes(lm.name.toLowerCase()) ||
        lm.name.toLowerCase().includes(endPoint.trim().toLowerCase())
      );

      const startLat = startLm ? startLm.latitude : BHOPAL_CENTER.lat;
      const startLng = startLm ? startLm.longitude : BHOPAL_CENTER.lng;
      const endLat = endLm ? endLm.latitude : 23.2163;
      const endLng = endLm ? endLm.longitude : 77.4067;

      const created = db.createRoute(
        {
          routeNumber: cleanNum,
          name: name.trim(),
          startPoint: startPoint.trim(),
          endPoint: endPoint.trim(),
          estimatedDurationMins: Number(durationMins) || 45,
          distanceKm: Number(distanceKm) || 20,
          isActive: true,
          stops: [
            {
              id: 'rs_' + Date.now() + '_1',
              routeId: '',
              name: startPoint.trim(),
              address: startLm?.address || `${startPoint.trim()} Transit Bay, Bhopal`,
              latitude: startLat,
              longitude: startLng,
              sequenceOrder: 1,
              scheduledArrival: '07:30 AM',
              scheduledDeparture: '07:35 AM',
              waitingMins: 5,
            },
            {
              id: 'rs_' + Date.now() + '_2',
              routeId: '',
              name: endPoint.trim(),
              address: endLm?.address || `${endPoint.trim()} Terminal, Bhopal`,
              latitude: endLat,
              longitude: endLng,
              sequenceOrder: 2,
              scheduledArrival: '08:20 AM',
              scheduledDeparture: '08:25 AM',
              waitingMins: 5,
            },
          ],
        },
        user?.id || 'admin'
      );

      setShowAddModal(false);
      setRouteNumber('');
      setName('');
      setStartPoint('');
      setEndPoint('');
    } catch (err: any) {
      setModalError(err?.message || 'Failed to create route');
    }
  };

  const filteredRoutes = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.routeNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.startPoint.toLowerCase().includes(search.toLowerCase()) ||
      r.endPoint.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Route & Timetable Network</h1>
              <p className="text-xs text-slate-500 mt-1">
                Configure transit corridors, ordered stops, arrival/departure timings, and GPS coordinate waypoints
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Route</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search routes by name or destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Route Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {route.routeNumber}
                        </span>
                        <span className="text-base font-black text-slate-900">{route.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>~{route.estimatedDurationMins} mins</span>
                        </span>
                        <span>•</span>
                        <span>{route.distanceKm} km</span>
                        <span>•</span>
                        <span className="font-semibold text-blue-600">{route.stops?.length || 0} stops</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 my-4 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-400">Start:</span>
                      <span className="font-bold text-slate-900">{route.startPoint}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-slate-400">End:</span>
                      <span className="font-bold text-slate-900">{route.endPoint}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {route.stops?.[0]?.scheduledArrival} &rarr; {route.stops?.[route.stops.length - 1]?.scheduledDeparture}
                  </span>
                  <Link
                    href={`/admin/routes/${route.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>Edit Stops & Map Timetable</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Add Route Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-900 border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <RouteIcon className="w-5 h-5 text-blue-600" />
                    <span>Create Transit Route</span>
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {modalError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateRoute} className="mt-4 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Route Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. RT-103"
                        value={routeNumber}
                        onChange={(e) => setRouteNumber(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono uppercase font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Route Corridor Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. West Suburban Rapid"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Origin / Start Point *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. West Station Hub"
                        value={startPoint}
                        onChange={(e) => setStartPoint(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Terminus / Destination *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. University Campus"
                        value={endPoint}
                        onChange={(e) => setEndPoint(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Est. Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={durationMins}
                        onChange={(e) => setDurationMins(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Distance (Kilometers)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                    >
                      Create Route
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
