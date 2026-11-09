'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { Bus, BusRoute, DriverUser } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { BHOPAL_CENTER } from '@/lib/geo-config';
import {
  Bus as BusIcon,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Edit2,
  X,
  Check,
  AlertCircle,
  MapPin,
  UserCheck,
} from 'lucide-react';

export default function AdminBusesPage() {
  const { user } = useAuth();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newName, setNewName] = useState('');
  const [newCapacity, setNewCapacity] = useState(40);
  const [newBusType, setNewBusType] = useState('Standard Coach');
  const [newModel, setNewModel] = useState('');
  const [newRouteId, setNewRouteId] = useState('');
  const [newDriverId, setNewDriverId] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = () => {
    setBuses(db.getBuses());
    setRoutes(db.getRoutes());
    setDrivers(db.getDrivers());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newBusNumber.trim() || !newRegNumber.trim() || !newName.trim()) {
      setModalError('Bus number, registration, and name are required.');
      return;
    }

    // Check unique bus number
    if (buses.some((b) => b.busNumber.toUpperCase() === newBusNumber.trim().toUpperCase())) {
      setModalError(`Bus number "${newBusNumber}" already exists.`);
      return;
    }

    try {
      const created = db.createBus(
        {
          busNumber: newBusNumber.trim().toUpperCase(),
          registrationNumber: newRegNumber.trim().toUpperCase(),
          name: newName.trim(),
          capacity: Number(newCapacity) || 40,
          busType: newBusType,
          model: newModel.trim(),
          status: 'active',
          assignedRouteId: newRouteId || null,
          assignedDriverId: newDriverId || null,
          currentTripStatus: 'IDLE',
          description: newDescription.trim(),
          currentLatitude: BHOPAL_CENTER.lat,
          currentLongitude: BHOPAL_CENTER.lng,
          speed: 0,
        },
        user?.id || 'admin'
      );

      // If driver was selected, assign driver
      if (newDriverId) {
        db.assignDriverToBus(newDriverId, created.id, user?.id || 'admin');
      }

      setShowAddModal(false);
      // Reset form
      setNewBusNumber('');
      setNewRegNumber('');
      setNewName('');
      setNewModel('');
      setNewRouteId('');
      setNewDriverId('');
      setNewDescription('');
    } catch (err: any) {
      setModalError(err?.message || 'Failed to create bus');
    }
  };

  const filteredBuses = buses.filter((b) => {
    const matchesSearch =
      b.busNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ON_TRIP' && b.currentTripStatus === 'ON_TRIP') ||
      (statusFilter === 'PARKED' && b.currentTripStatus === 'PARKED') ||
      (statusFilter === 'IDLE' && (b.currentTripStatus === 'IDLE' || b.currentTripStatus === 'OFFLINE'));
    return matchesSearch && matchesStatus;
  });

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet Asset Directory</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage buses, route assignments, driver allocations, and capacity metrics
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by bus #, plate, or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ON_TRIP">On Trip (Live)</option>
                <option value="PARKED">Parked / Layover</option>
                <option value="IDLE">Idle / Offline</option>
              </select>
            </div>
          </div>

          {/* Bus Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBuses.map((bus) => {
              const route = routes.find((r) => r.id === bus.assignedRouteId);
              const driver = drivers.find((d) => d.id === bus.assignedDriverId);
              return (
                <div
                  key={bus.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900">{bus.busNumber}</span>
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
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{bus.name}</div>
                      </div>
                      <span className="text-[11px] font-mono font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {bus.registrationNumber}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs py-3 border-y border-slate-100">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" /> Route:
                        </span>
                        <span className="font-semibold text-slate-900 truncate max-w-[160px]">
                          {route ? route.name : 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Driver:
                        </span>
                        <span className="font-semibold text-slate-900 truncate max-w-[160px]">
                          {driver ? driver.fullName : 'No Driver Assigned'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Capacity & Type:</span>
                        <span className="font-semibold text-slate-800">
                          {bus.capacity} seats ({bus.busType})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Selected Students:</span>
                        <span className="font-bold text-blue-600">
                          {bus.selectedStudentsCount || 0} enrolled
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Model: {bus.model || 'Standard'}
                    </span>
                    <Link
                      href={`/admin/buses/${bus.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <span>Manage & Live Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBuses.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              No buses match your filter criteria.
            </div>
          )}

          {/* Add Bus Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-900 border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BusIcon className="w-5 h-5 text-blue-600" />
                    <span>Add New Fleet Bus</span>
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
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

                <form onSubmit={handleCreateBus} className="mt-4 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Bus Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BUS-104"
                        value={newBusNumber}
                        onChange={(e) => setNewBusNumber(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        License Plate *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DL-01-GH-1004"
                        value={newRegNumber}
                        onChange={(e) => setNewRegNumber(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Bus Nickname *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. East Metro Flyer"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Capacity (Seats)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="80"
                        value={newCapacity}
                        onChange={(e) => setNewCapacity(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Bus Type
                      </label>
                      <select
                        value={newBusType}
                        onChange={(e) => setNewBusType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="Air Conditioned Deluxe">Air Conditioned Deluxe</option>
                        <option value="Standard Coach">Standard Coach</option>
                        <option value="Mini Bus">Mini Bus</option>
                        <option value="Electric Shuttle">Electric Shuttle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Make / Model
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tata Starbus 2024"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Assign Route
                      </label>
                      <select
                        value={newRouteId}
                        onChange={(e) => setNewRouteId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="">No Route Assigned</option>
                        {routes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.routeNumber} - {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Assign Driver
                      </label>
                      <select
                        value={newDriverId}
                        onChange={(e) => setNewDriverId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="">No Driver Assigned</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.driverId} - {d.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Fleet Operational Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Service notes, route constraints, etc."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
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
                      Create Bus
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
