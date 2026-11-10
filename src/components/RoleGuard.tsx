'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  const allowedRolesKey = allowedRoles.join(',');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!allowedRoles.includes(user.role)) {
        // Redirect to their respective authorized dashboard
        if (user.role === 'admin') router.push('/admin/dashboard');
        else if (user.role === 'driver') router.push('/driver/dashboard');
        else if (user.role === 'student') router.push('/student/dashboard');
      }
    }
  }, [user, role, isLoading, allowedRolesKey, router]);

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium text-slate-600">Verifying authorized access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
