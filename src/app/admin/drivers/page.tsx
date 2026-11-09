'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { DriverUser, Bus } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  UserCheck,
  Plus,
  Search,
  KeyRound,
  Bus as BusIcon,
  Phone,
  Shield,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Lock,
} from 'lucide-react';

export default function AdminDriversPage() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetModalDriver, setResetModalDriver] = useState<DriverUser | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Add form fields
  const [driverId, setDriverId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [password, setPassword] = useState('Driver@123');
  const [assignedBusId, setAssignedBusId] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = () => {
    setDrivers(db.getDrivers());
    setBuses(db.getBuses());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const cleanId = driverId.trim().toUpperCase();
    if (!cleanId || !fullName.trim() || !licenseNumber.trim()) {
      setModalError('Driver ID, full name, and license number are required.');
      return;
    }

    if (drivers.some((d) => d.driverId.toUpperCase() === cleanId)) {
      setModalError(`Driver ID "${cleanId}" already exists.`);
      return;
    }

    try {
      const newD = db.createDriver(
        {
          driverId: cleanId,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || `${cleanId.toLowerCase()}@driver.bustrack.local`,
          licenseNumber: licenseNumber.trim().toUpperCase(),
          licenseExpiry: licenseExpiry || '2028-12-31',
          address: address.trim(),
          emergencyContact: emergencyContact.trim(),
          status: 'active',
          password: password || 'Driver@123',
        },
        user?.id || 'admin'
      );

      if (assignedBusId) {
        db.assignDriverToBus(newD.id, assignedBusId, user?.id || 'admin');
      }

      setShowAddModal(false);
      // Reset form
      setDriverId('');
      setFullName('');
      setPhone('');
      setEmail('');
      setLicenseNumber('');
      setAddress('');
      setEmergencyContact('');
      setAssignedBusId('');
      setStatusMsg(`Driver ${newD.fullName} (${cleanId}) registered successfully.`);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to create driver');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalDriver || !newPassword) return;

    db.resetUserPassword(resetModalDriver.driverId, newPassword, user?.id || 'admin');
    setResetModalDriver(null);
    setNewPassword('');
    setStatusMsg(`Password reset successfully for ${resetModalDriver.driverId}`);
  };

  const handleAssignBus = (dId: string, bId: string) => {
    if (bId) {
      db.assignDriverToBus(dId, bId, user?.id || 'admin');
      setStatusMsg('Bus assignment updated.');
    }
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.driverId.toLowerCase().includes(search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Operations</h1>
              <p className="text-xs text-slate-500 mt-1">
                Authorized commercial vehicle operators, duty rosters, and credential audits
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Driver</span>
            </button>
          </div>

          {statusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by driver ID, name, or license..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Driver Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDrivers.map((driver) => {
              const assignedBus = buses.find((b) => b.assignedDriverId === driver.id);
              return (
                <div
                  key={driver.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-base">{driver.fullName}</div>
                          <div className="text-[11px] font-mono font-bold text-blue-600">{driver.driverId}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {driver.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs py-3 border-y border-slate-100">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Assigned Bus:</span>
                        {assignedBus ? (
                          <span className="font-bold text-slate-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            {assignedBus.busNumber} ({assignedBus.name})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No Bus Assigned</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">License Number:</span>
                        <span className="font-mono text-slate-800">{driver.licenseNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">License Expiry:</span>
                        <span className="text-slate-700">{driver.licenseExpiry || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-medium text-slate-800">{driver.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-slate-50">
                    {/* Quick Bus Reassign Dropdown */}
                    <select
                      value={assignedBus?.id || ''}
                      onChange={(e) => handleAssignBus(driver.id, e.target.value)}
                      className="text-[11px] font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="">Change Assigned Bus...</option>
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.busNumber} - {b.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => setResetModalDriver(driver)}
                      title="Reset driver password"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Driver Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-900 border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>Enroll Driver</span>
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

                <form onSubmit={handleCreateDriver} className="mt-4 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Driver ID *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DRIVER003"
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value.toUpperCase())}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono uppercase font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. James Peterson"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        License Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DL-77889-COMM"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        License Expiry
                      </label>
                      <input
                        type="date"
                        value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-1111"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Initial Password
                      </label>
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Initial Assigned Bus
                      </label>
                      <select
                        value={assignedBusId}
                        onChange={(e) => setAssignedBusId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="">No Bus Assigned</option>
                        {buses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.busNumber} - {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      placeholder="Street address, City"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
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
                      Enroll Driver
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reset Password Modal */}
          {resetModalDriver && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-slate-900 border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Reset Password</span>
                  </h2>
                  <button
                    onClick={() => setResetModalDriver(null)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
                  <p className="text-xs text-slate-600">
                    Set a new password for driver <strong>{resetModalDriver.fullName}</strong> ({resetModalDriver.driverId}).
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      New Password
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Driver@2026"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetModalDriver(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Update Password
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
