'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from './store';
import { AdminUser, DriverUser, StudentUser, UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerStudent: (data: {
    fullName: string;
    enrollmentNumber: string;
    password: string;
    email?: string;
    phone?: string;
    department?: string;
    courseYear?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: (targetRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved session
    try {
      const savedUser = localStorage.getItem('bustrack_current_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn('Session parse error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = db.authenticateUser(identifier, pass);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('bustrack_current_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: {
    fullName: string;
    enrollmentNumber: string;
    password: string;
    email?: string;
    phone?: string;
    department?: string;
    courseYear?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = db.registerStudent(data);
      if (res.student) {
        setUser(res.student);
        localStorage.setItem('bustrack_current_user', JSON.stringify(res.student));
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bustrack_current_user');
    router.push('/login');
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    let identifier = '';
    if (user.role === 'admin') identifier = (user as AdminUser).adminId;
    else if (user.role === 'driver') identifier = (user as DriverUser).driverId;
    else if (user.role === 'student') identifier = (user as StudentUser).enrollmentNumber;

    return db.changePassword(identifier, oldPass, newPass);
  };

  const quickDemoLogin = async (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      await login('ADMIN001', 'Admin@123');
      router.push('/admin/dashboard');
    } else if (targetRole === 'driver') {
      await login('DRIVER001', 'Driver@123');
      router.push('/driver/dashboard');
    } else if (targetRole === 'student') {
      await login('STU2026001', 'Student@123');
      router.push('/student/dashboard');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isLoading,
        login,
        registerStudent,
        logout,
        changePassword,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
