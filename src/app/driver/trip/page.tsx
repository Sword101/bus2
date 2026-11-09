'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { RoleGuard } from '@/components/RoleGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { db } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { DriverUser, Bus, BusRoute, Trip } from '@/types';
import { BHOPAL_CENTER } from '@/lib/geo-config';
import {
  Navigation,
  Play,
  Square,
  Pause,
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

type GpsState = 'INITIALIZING' | 'ACTIVE' | 'DENIED' | 'UNAVAILABLE' | 'SIMULATED' | 'OFF';

export default function DriverTripControlPage() {
  const { user } = useAuth();
  const driver = user as DriverUser;

  const [bus, setBus] = useState<Bus | undefined>(undefined);
  const [route, setRoute] = useState<BusRoute | undefined>(undefined);
  const [activeTrip, setActiveTrip] = useState<Trip | undefined>(undefined);

  // GPS Telemetry State
  const [gpsState, setGpsState] = useState<GpsState>('OFF');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [confirmEndTrip, setConfirmEndTrip] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  const loadData = () => {
    if (!driver) return;
    const allBuses = db.getBuses();
    const myBus = allBuses.find((b) => b.assignedDriverId === driver.id);
    setBus(myBus);

    if (myBus?.assignedRouteId) {
      setRoute(db.getRouteById(myBus.assignedRouteId));
      const trip = db.getActiveTripForBus(myBus.id);
      setActiveTrip(trip);

      if (myBus.currentLatitude && myBus.currentLongitude) {
        setCurrentCoords({ lat: myBus.currentLatitude, lng: myBus.currentLongitude });
      }
      if (myBus.lastGpsUpdate) {
        setLastUpdateTime(myBus.lastGpsUpdate);
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [driver?.id]);

  // Clean up GPS watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const startGpsTracking = (busId: string) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsState('UNAVAILABLE');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGpsState('INITIALIZING');
    setErrorMessage(null);

    // Initial position lookup
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const spd = pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : 0;
        const hdg = pos.coords.heading || 0;

        setCurrentCoords({ lat, lng });
        setSpeed(spd);
        setHeading(hdg);
        setGpsState('ACTIVE');
        setLastUpdateTime(new Date().toISOString());

        db.updateLiveLocation(busId, driver.id, lat, lng, spd, hdg);

        // Begin continuous watchPosition
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const wLat = watchPos.coords.latitude;
            const wLng = watchPos.coords.longitude;
            const wSpd = watchPos.coords.speed ? Number((watchPos.coords.speed * 3.6).toFixed(1)) : 0;
            const wHdg = watchPos.coords.heading || 0;

            setCurrentCoords({ lat: wLat, lng: wLng });
            setSpeed(wSpd);
            setHeading(wHdg);
            setGpsState('ACTIVE');
            setLastUpdateTime(new Date().toISOString());

            db.updateLiveLocation(busId, driver.id, wLat, wLng, wSpd, wHdg);
          },
          (err) => {
            console.warn('GPS Watch error:', err);
            if (err.code === err.PERMISSION_DENIED) {
              setGpsState('DENIED');
              setErrorMessage('Location permission was denied. Please allow location access in your browser settings.');
            } else {
              setGpsState('UNAVAILABLE');
              setErrorMessage(`GPS position unavailable: ${err.message}`);
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 15000,
          }
        );
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsState('DENIED');
          setErrorMessage('Location permission denied. Please enable location permissions in browser settings to start the trip.');
        } else {
          // Fallback to route start stop coordinates or Bhopal center for testing / local demo
          const fallbackLat = route?.stops?.[0]?.latitude || BHOPAL_CENTER.lat;
          const fallbackLng = route?.stops?.[0]?.longitude || BHOPAL_CENTER.lng;
          setCurrentCoords({ lat: fallbackLat, lng: fallbackLng });
          setGpsState('SIMULATED');
          setLastUpdateTime(new Date().toISOString());
          db.updateLiveLocation(busId, driver.id, fallbackLat, fallbackLng, 32, 0);
          setStatusFeedback('Physical GPS unavailable; activated route coordinates for demonstration.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsState('OFF');
  };

  const handleStartTrip = () => {
    if (!bus) return;
    setErrorMessage(null);
    setStatusFeedback(null);

    const initialLat = currentCoords?.lat || route?.stops?.[0]?.latitude || BHOPAL_CENTER.lat;
    const initialLng = currentCoords?.lng || route?.stops?.[0]?.longitude || BHOPAL_CENTER.lng;

    const res = db.startTrip(bus.id, driver.id, { lat: initialLat, lng: initialLng });
    if (res.trip) {
      setActiveTrip(res.trip);
      startGpsTracking(bus.id);
      setStatusFeedback('Trip started! Live GPS telemetry is now broadcasting to students.');
    } else {
      setErrorMessage(res.error || 'Failed to start trip.');
    }
  };

  const handleParkBus = () => {
    if (!bus || !activeTrip) return;
    const parkLat = currentCoords?.lat || bus.currentLatitude || BHOPAL_CENTER.lat;
    const parkLng = currentCoords?.lng || bus.currentLongitude || BHOPAL_CENTER.lng;

    const res = db.parkTrip(activeTrip.id, driver.id, { lat: parkLat, lng: parkLng });
    if (res.success) {
      stopGpsTracking();
      setStatusFeedback('Bus parked at current coordinates. Students notified of layover status.');
    } else {
      setErrorMessage(res.error || 'Failed to set parked state.');
    }
  };

  const handleResumeTrip = () => {
    if (!bus || !activeTrip) return;
    const res = db.resumeTrip(activeTrip.id, driver.id);
    if (res.success) {
      startGpsTracking(bus.id);
      setStatusFeedback('Trip resumed! Resumed broadcasting live telemetry.');
    } else {
      setErrorMessage(res.error || 'Failed to resume trip.');
    }
  };

  const handleEndTrip = () => {
    if (!bus || !activeTrip) return;

    const finalLat = currentCoords?.lat || bus.currentLatitude;
    const finalLng = currentCoords?.lng || bus.currentLongitude;

    const res = db.endTrip(activeTrip.id, driver.id, { lat: finalLat || BHOPAL_CENTER.lat, lng: finalLng || BHOPAL_CENTER.lng });
    if (res.success) {
      stopGpsTracking();
      setActiveTrip(undefined);
      setConfirmEndTrip(false);
      setStatusFeedback('Trip concluded successfully. Final telemetry saved.');
    } else {
      setErrorMessage(res.error || 'Failed to conclude trip.');
    }
  };

  if (!bus) {
    return (
      <RoleGuard allowedRoles={['driver']}>
        <DashboardLayout role="driver">
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-900">No Vehicle Assigned</h2>
            <p className="text-xs text-slate-500 mt-1">
              You must have an assigned vehicle to access live trip telemetry.
            </p>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  const isTripUnderway = bus.currentTripStatus === 'ON_TRIP';
  const isParked = bus.currentTripStatus === 'PARKED';
  const isIdle = bus.currentTripStatus === 'IDLE' || bus.currentTripStatus === 'OFFLINE';

  return (
    <RoleGuard allowedRoles={['driver']}>
      <DashboardLayout role="driver">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trip Control Cockpit</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isTripUnderway
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : isParked
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {bus.currentTripStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Vehicle: <strong className="text-slate-800">{bus.busNumber}</strong> ({bus.registrationNumber}) • Route: <strong className="text-slate-800">{route?.name || 'Unassigned'}</strong>
              </p>
            </div>
          </div>

          {/* Feedback & Error Banners */}
          {statusFeedback && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusFeedback}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Operational Alert</div>
                <div>{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Background Throttling Warning Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Driver Geolocation Guidance:</span> Mobile web browsers may pause GPS location streaming if you switch away or lock the device screen. Please keep this browser window open on your vehicle dashboard mount during active trips.
            </div>
          </div>

          {/* Primary Trip Action Controls Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="max-w-md mx-auto space-y-4">
              {isIdle && (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">Ready for Scheduled Departure</h2>
                  <p className="text-xs text-slate-500">
                    Clicking Start Trip will request browser GPS access, mark the bus as ON TRIP, and broadcast live coordinates to waiting passengers.
                  </p>
                  <button
                    onClick={handleStartTrip}
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Scheduled Journey</span>
                  </button>
                </div>
              )}

              {isTripUnderway && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span>TRIP ACTIVE • BROADCASTING LIVE TELEMETRY</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleParkBus}
                      className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Park Bus / Layover</span>
                    </button>
                    <button
                      onClick={() => setConfirmEndTrip(true)}
                      className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Conclude Trip</span>
                    </button>
                  </div>
                </div>
              )}

              {isParked && (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                    <Pause className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">Vehicle Currently Parked</h2>
                  <p className="text-xs text-slate-500">
                    Bus is in layover mode at saved parking coordinates. Waiting passengers are informed that the vehicle is idle.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleResumeTrip}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Resume Journey</span>
                    </button>
                    <button
                      onClick={() => setConfirmEndTrip(true)}
                      className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Conclude Trip</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* End Trip Confirmation Modal */}
            {confirmEndTrip && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-slate-900 shadow-xl border border-slate-200">
                  <h3 className="font-bold text-base text-slate-900 mb-2">Conclude Active Journey?</h3>
                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                    This will stop location streaming, record the final arrival timestamp, and mark the bus as idle.
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setConfirmEndTrip(false)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEndTrip}
                      className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
                    >
                      Yes, Conclude Trip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Telemetry Status Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>GPS Status</span>
              </div>
              <div className="text-base font-black text-slate-900 mt-1 uppercase">
                {gpsState}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {gpsState === 'ACTIVE' ? 'Hardware Locked' : 'Streaming idle'}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Current Speed</span>
              </div>
              <div className="text-xl font-black text-slate-900 mt-1">
                {speed} <span className="text-xs font-semibold text-slate-500">km/h</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Heading {heading}°
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Last Telemetry Ping</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString() : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {currentCoords ? `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}` : 'Waiting fix'}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Next Stop</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                {route?.stops?.[1]?.name || route?.stops?.[0]?.name || 'Terminal'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {route?.stops?.[1]?.scheduledArrival || 'On Schedule'}
              </div>
            </div>
          </div>

          {/* Live Driver Interactive Map */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Vehicle Telemetry & Route Map</span>
              </h2>
              {currentCoords && (
                <span className="text-[11px] font-mono text-slate-500">
                  {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                </span>
              )}
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <Map bus={bus} stops={route?.stops || []} height="360px" zoom={13} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
