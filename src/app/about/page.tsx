'use client';

import React from 'react';
import Link from 'next/link';
import DemoControlBanner from '@/components/DemoControlBanner';
import { Bus, Shield, MapPin, Zap, Users, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoControlBanner />

      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Bus className="w-4 h-4" />
          </div>
          <span className="font-black text-slate-900 text-lg">BusTrack</span>
        </Link>
        <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-blue-600">
          Back to Home &rarr;
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
            About BusTrack Intelligent Fleet System
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-6">
            BusTrack is a unified, real-time institutional bus management and passenger tracking platform engineered to eliminate guesswork in daily commutes. Designed for colleges, universities, and industrial campuses, it establishes continuous telemetry between vehicles, operations dispatchers, and commuters.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <Shield className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm mb-1">Institutional Security</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Role-based access control guarantees drivers only see their assigned vehicle, students only manage their personal travel preferences, and administrators hold fleet-wide governance.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <Zap className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm mb-1">Zero-Latency Telemetry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Driver devices stream high-frequency GPS coordinate pulses directly via HTML5 Geolocation into the live Map engine, calculating real-time stop sequence transitions.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex items-center justify-between">
            <span className="text-xs text-slate-500">BusTrack v1.0 • Enterprise Transit Edition</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              <span>Access System</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
