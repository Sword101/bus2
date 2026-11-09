'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { StudentUser, Bus, BusRoute, DriverUser } from '@/types';
import {
  Search,
  Bus as BusIcon,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Navigation,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function StudentBusSearchPage() {
  const { user } = useAuth();
  const student = user as StudentUser;

  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [currentSelectionBusId, setCurrentSelectionBusId] = useState<string | null>(null);

  // Search modes: 'BUS' | 'STOP'
  const [searchMode, setSearchMode] = useState<'BUS' | 'STOP'>('BUS');
  const [busSearchQuery, setBusSearchQuery] = useState('');
  const [stopSearchQuery, setStopSearchQuery] = useState('');

  // Confirmation Modals
  const [confirmSelectBus, setConfirmSelectBus] = useState<Bus | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    if (!student) return;
    setBuses(db.getBuses());
    setRoutes(db.getRoutes());
    setDrivers(db.getDrivers());

    const selection = db.getStudentSelection(student.id);
    setCurrentSelectionBusId(selection?.busId || null);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [student?.id]);

  const handleSelectBus = (bus: Bus) => {
    setConfirmSelectBus(bus);
  };

  const handleConfirmSelection = () => {
    if (!confirmSelectBus || !student) return;

    const ok = db.selectBusForStudent(student.id, confirmSelectBus.id);
    if (ok) {
      setCurrentSelectionBusId(confirmSelectBus.id);
      setFeedbackMsg({
        type: 'success',
        text: `You have successfully selected ${confirmSelectBus.busNumber} (${confirmSelectBus.name}). You will receive live alerts for this vehicle.`,
      });
    } else {
      setFeedbackMsg({ type: 'error', text: 'Failed to update bus selection.' });
    }
    setConfirmSelectBus(null);
  };

  const handleRemoveSelection = () => {
    if (!student) return;
    const ok = db.removeStudentSelection(student.id);
    if (ok) {
      setCurrentSelectionBusId(null);
      setFeedbackMsg({
        type: 'success',
        text: 'Your bus selection has been removed. You can select a new bus anytime.',
      });
    }
    setConfirmRemove(false);
  };

  // Filter Method 1: Bus Number / Name
  const busesMatchingNumber = buses.filter((b) => {
    const q = busSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      b.busNumber.toLowerCase().includes(q) ||
      b.registrationNumber.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q)
    );
  });

  // Filter Method 2: Stop Name / Location
  const busesMatchingStop = buses.filter((b) => {
    const q = stopSearchQuery.trim().toLowerCase();
    if (!q) return true;
    const r = routes.find((route) => route.id === b.assignedRouteId);
    if (!r || !r.stops) return false;
    return r.stops.some(
      (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
    );
  });

  const displayBuses = searchMode === 'BUS' ? busesMatchingNumber : busesMatchingStop;

  return (
    <RoleGuard allowedRoles={['student']}>
      <DashboardLayout role="student">
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Search & Select Shuttle</h1>
              <p className="text-xs text-slate-500 mt-1">
                Find your commute by vehicle number or search by your local pickup stop / landmark
              </p>
            </div>

            {currentSelectionBusId && (
              <button
                onClick={() => setConfirmRemove(true)}
                className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-semibold self-start sm:self-auto transition"
              >
                Remove Current Selection
              </button>
            )}
          </div>

          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Search Method Switcher Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
                onClick={() => setSearchMode('BUS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  searchMode === 'BUS'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BusIcon className="w-4 h-4" />
                <span>Method 1: Search by Bus #</span>
              </button>

              <button
                onClick={() => setSearchMode('STOP')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  searchMode === 'STOP'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Method 2: Search by Stop / Location</span>
              </button>
            </div>

            {searchMode === 'BUS' ? (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter bus number or name (e.g. 101, BUS-102, North Star)..."
                  value={busSearchQuery}
                  onChange={(e) => setBusSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter stop name or landmark in Bhopal (e.g. MP Nagar, New Market, MANIT, Rani Kamlapati)..."
                    value={stopSearchQuery}
                    onChange={(e) => setStopSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                  <span className="font-semibold">Bhopal Hubs:</span>
                  {['Bhopal Junction', 'MP Nagar', 'New Market', 'Rani Kamlapati', 'MANIT', 'AIIMS Bhopal', 'Lalghati', 'Shahpura Lake'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setStopSearchQuery(sug)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayBuses.map((bus) => {
              const route = routes.find((r) => r.id === bus.assignedRouteId);
              const driver = drivers.find((d) => d.id === bus.assignedDriverId);
              const isSelected = bus.id === currentSelectionBusId;
              const isOnTrip = bus.currentTripStatus === 'ON_TRIP';
              const isParked = bus.currentTripStatus === 'PARKED';

              return (
                <div
                  key={bus.id}
                  className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10' : 'border-slate-200 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-slate-900">{bus.busNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOnTrip
                                ? 'bg-emerald-100 text-emerald-800'
                                : isParked
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {bus.currentTripStatus}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{bus.name}</div>
                      </div>

                      {isSelected ? (
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectBus(bus)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                        >
                          {currentSelectionBusId ? 'Change to this Bus' : 'Select Bus'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Assigned Route:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">
                          {route ? route.name : 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Origin &rarr; Terminus:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {route ? `${route.startPoint} → ${route.endPoint}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Driver & Contact:</span>
                        <span className="font-medium text-slate-800">
                          {driver ? `${driver.fullName} (${driver.phone || 'Driver'})` : 'Fleet Dispatch'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Commuters Following:</span>
                        <span className="font-bold text-blue-600">
                          {bus.selectedStudentsCount || 0} students
                        </span>
                      </div>
                    </div>

                    {/* Intermediate Stops Tag Carousel */}
                    {route?.stops && route.stops.length > 0 && (
                      <div className="pt-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Passes through {route.stops.length} stops:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {route.stops.map((s) => (
                            <span
                              key={s.id}
                              className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                stopSearchQuery && s.name.toLowerCase().includes(stopSearchQuery.toLowerCase())
                                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              #{s.sequenceOrder} {s.name} ({s.scheduledArrival})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Reg: {bus.registrationNumber}
                    </span>
                    <Link
                      href="/student/map"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Track Vehicle</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {displayBuses.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              No shuttles found matching your query.
            </div>
          )}

          {/* Confirm Select Bus Modal */}
          {confirmSelectBus && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-slate-900 border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Confirm Bus Selection
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Are you sure you want to select <strong>{confirmSelectBus.busNumber}</strong> ({confirmSelectBus.name}) as your primary transit vehicle?
                  {currentSelectionBusId && (
                    <span className="block mt-2 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Note: This will safely replace your previous bus selection.
                    </span>
                  )}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setConfirmSelectBus(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Remove Selection Modal */}
          {confirmRemove && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-slate-900 border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-2">Remove Bus Selection?</h3>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  You will no longer receive live arrival notifications for this bus until you select another one.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setConfirmRemove(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveSelection}
                    className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
                  >
                    Remove Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
