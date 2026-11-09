'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import DemoControlBanner from './DemoControlBanner';
import NotificationBell from './NotificationBell';
import {
  LayoutDashboard,
  Bus as BusIcon,
  Users,
  MapPin,
  GraduationCap,
  MessageSquareWarning,
  History,
  Navigation,
  LogOut,
  Menu,
  X,
  UserCheck,
  Shield,
  Route,
  Clock,
  KeyRound,
  FileText,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Bus Fleet', href: '/admin/buses', icon: BusIcon },
  { label: 'Drivers', href: '/admin/drivers', icon: UserCheck },
  { label: 'Routes & Stops', href: '/admin/routes', icon: Route },
  { label: 'Students', href: '/admin/students', icon: GraduationCap },
  { label: 'Complaints Desk', href: '/admin/complaints', icon: MessageSquareWarning },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
];

const DRIVER_NAV: NavItem[] = [
  { label: 'Driver Console', href: '/driver/dashboard', icon: LayoutDashboard },
  { label: 'Trip Control & GPS', href: '/driver/trip', icon: Navigation },
  { label: 'My Bus Details', href: '/driver/bus', icon: BusIcon },
  { label: 'Route Timetable', href: '/driver/route', icon: Route },
  { label: 'Incident Reports', href: '/driver/complaints', icon: MessageSquareWarning },
  { label: 'Change Password', href: '/driver/profile', icon: KeyRound },
];

const STUDENT_NAV: NavItem[] = [
  { label: 'My Bus Hub', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Search & Select Bus', href: '/student/search', icon: BusIcon },
  { label: 'Live GPS Map', href: '/student/map', icon: Navigation },
  { label: 'Route Timetable', href: '/student/route', icon: Clock },
  { label: 'Help & Complaints', href: '/student/complaints', icon: MessageSquareWarning },
  { label: 'My Profile', href: '/student/profile', icon: GraduationCap },
];

export default function DashboardLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'driver' ? DRIVER_NAV : STUDENT_NAV;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Demo Quick Switcher Banner */}
      <DemoControlBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 flex-col bg-slate-900 border-r border-slate-800 text-slate-300">
          <div className="p-5 flex items-center gap-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black tracking-wider shadow">
              <BusIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">BusTrack</div>
              <div className="text-[11px] text-slate-400 capitalize tracking-wide font-medium">
                {role} Portal
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile in Sidebar Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.fullName || 'Transit User'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email || role}</div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-blue-400 border border-slate-700">
                {role}
              </span>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-red-600/80 rounded-md transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 capitalize hidden sm:inline">
                  {role} Workspace
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <NotificationBell />
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900">{user?.fullName}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-slate-900 text-slate-200 border-b border-slate-800 p-4 space-y-1 z-40">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
