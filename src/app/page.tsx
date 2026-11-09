'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import DemoControlBanner from '@/components/DemoControlBanner';
import {
  Bus,
  ShieldCheck,
  Truck,
  GraduationCap,
  Navigation,
  Clock,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  const { user, quickDemoLogin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoControlBanner />

      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight">BusTrack</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 uppercase tracking-wider">
                Fleet 2.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/about" className="hover:text-blue-600 transition">About System</Link>
            <Link href="/contact" className="hover:text-blue-600 transition">Contact Transit</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href={
                  user.role === 'admin'
                    ? '/admin/dashboard'
                    : user.role === 'driver'
                    ? '/driver/dashboard'
                    : '/student/dashboard'
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm transition"
              >
                <span>Enter {user.role.toUpperCase()} Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                  Student Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Fleet Telemetry & Live GPS
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
              Institutional Transit, <span className="text-blue-600">Perfected.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              BusTrack unites Administrators, Bus Drivers, and Students into one synchronized real-time transit ecosystem. Live bus tracking, scheduled stop timetables, passenger selection, and automated alerts.
            </p>

            {/* Quick Role Gateway Cards */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Admin Gateway */}
              <div
                onClick={() => quickDemoLogin('admin')}
                className="cursor-pointer group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-blue-600 transition">
                  Admin Control Panel
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Manage vehicle fleet, allocate drivers, configure route stops, monitor telemetry, and resolve complaints.
                </p>
                <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <span>Enter as ADMIN001</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Driver Gateway */}
              <div
                onClick={() => quickDemoLogin('driver')}
                className="cursor-pointer group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-emerald-600 transition">
                  Bus Driver Console
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Mobile-first cockpit: start trips, stream GPS coordinates, park/layover mode, and review stop sequences.
                </p>
                <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span>Enter as DRIVER001</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Student Gateway */}
              <div
                onClick={() => quickDemoLogin('student')}
                className="cursor-pointer group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-purple-600 transition">
                  Student Live App
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Rapido-style live map, Where-Is-My-Train stop timelines, search by bus/stop, and immediate delay alerts.
                </p>
                <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                  <span>Enter as STU2026001</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Complete Institutional Transit Infrastructure
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Designed from the ground up for strict operational integrity, transparent passenger communication, and continuous live tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Navigation className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-base text-slate-900 mb-2">Live GPS Telemetry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct browser Geolocation watchPosition updates streamed to passenger dashboards with stale-state detection and external Google Maps links.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Clock className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-base text-slate-900 mb-2">Where Is My Train Timelines</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visual ordered stop progression with scheduled arrival/departure times, upcoming stop highlights, and delay indicators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-bold text-base text-slate-900 mb-2">Bus Selection & Audits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enforced one-active-bus selection per student with real-time passenger counts, route change broadcast alerts, and complete audit history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-white text-sm">BusTrack</span>
            <span className="text-slate-500">| Smart Bus Management System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition">About</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
