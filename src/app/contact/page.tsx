'use client';

import React from 'react';
import Link from 'next/link';
import DemoControlBanner from '@/components/DemoControlBanner';
import { Bus, Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function ContactPage() {
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Campus Transit Operations Desk
          </h1>
          <p className="text-slate-600 text-sm mb-8">
            Need urgent route dispatch assistance, schedule clarification, or lost-and-found support?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3.5">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Emergency Dispatch Hotline</div>
                <div className="text-xs text-blue-700 font-mono mt-1">+1 (555) 019-2831</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Operating hours: 06:00 AM – 09:00 PM Daily</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
              <Mail className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Fleet Administration Email</div>
                <div className="text-xs text-slate-700 font-mono mt-1">transit-desk@bustrack.local</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Inquiries replied within 24 hours</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Central Terminal Office</div>
                <div className="text-xs text-slate-700 mt-1">Building B, Platform 4 Transit Centre, Main Campus</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
              <Clock className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Lost & Found Depot</div>
                <div className="text-xs text-slate-700 mt-1">Open Mon-Fri 08:00 AM – 05:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
