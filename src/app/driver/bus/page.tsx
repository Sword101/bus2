'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { DriverUser, Bus, BusRoute } from '@/types';
import {
  Bus as BusIcon,
  Shield,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export default function DriverBusPage() {
  const { user } = useAuth();
  const driver = user as DriverUser;

  const [bus, setBus] = useState<Bus | undefined>(undefined);
  const [route, setRoute] = useState<BusRoute | undefined>(undefined);

  const loadData = () => {
    if (!driver) return;
    const buses = db.getBuses();
    const myBus = buses.find((b) => b.assignedDriverId === driver.id);
    setBus(myBus);

    if (myBus?.assignedRouteId) {
      setRoute(db.getRouteById(myBus.assignedRouteId));
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [driver?.id]);

  if (!bus) {
    return (
      <RoleGuard allowedRoles={['driver']}>
        <DashboardLayout role="driver">
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-800">No Bus Assigned</h2>
            <p className="text-xs text-slate-500 mt-1">
              Please contact the fleet administrator to assign a vehicle to your driver profile.
            </p>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['driver']}>
      <DashboardLayout role="driver">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Vehicle Specifications</h1>
            <p className="text-xs text-slate-500 mt-1">
              Detailed technical and operational specifications for your duty bus
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  <BusIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900">{bus.busNumber}</h2>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                      {bus.registrationNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{bus.name}</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Vehicle Class & Model</div>
                <div className="text-sm font-bold text-slate-900">{bus.busType}</div>
                <div className="text-slate-600 font-medium">Model: {bus.model || 'Standard Institutional'}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Passenger Capacity</div>
                <div className="text-sm font-bold text-slate-900">{bus.capacity} Authorized Seats</div>
                <div className="text-slate-600 font-medium">{bus.selectedStudentsCount || 0} enrolled followers</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Assigned Route</div>
                <div className="text-sm font-bold text-slate-900">{route ? route.name : 'Unassigned'}</div>
                <div className="text-slate-600 font-medium">
                  {route ? `${route.startPoint} → ${route.endPoint}` : 'N/A'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Fleet Asset ID</div>
                <div className="text-xs font-mono font-bold text-slate-800">{bus.id}</div>
                <div className="text-slate-600 font-medium">Fleet status: {bus.status}</div>
              </div>
            </div>

            {bus.description && (
              <div className="pt-4 border-t border-slate-100">
                <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">Operational Fleet Notes</div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {bus.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
