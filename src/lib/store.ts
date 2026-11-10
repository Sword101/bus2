import {
  AdminUser,
  AuditLog,
  Bus,
  BusAssignment,
  BusRoute,
  Complaint,
  ComplaintStatus,
  ComplaintUpdate,
  DriverUser,
  NotificationItem,
  RouteStop,
  StudentBusSelection,
  StudentUser,
  Trip,
  UserProfile,
  UserRole,
} from '@/types';
import { BHOPAL_CENTER, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/geo-config';

// ==========================================
// Initial Master Mock Database
// ==========================================

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'a1',
    role: 'admin',
    fullName: 'System Administrator',
    email: 'admin@bustrack.local',
    phone: '+1 (555) 019-2831',
    status: 'active',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'd1',
    role: 'driver',
    fullName: 'Robert Vance',
    email: 'driver1@bustrack.local',
    phone: '+1 (555) 014-9921',
    status: 'active',
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'd2',
    role: 'driver',
    fullName: 'Marcus Sterling',
    email: 'driver2@bustrack.local',
    phone: '+1 (555) 018-7744',
    status: 'active',
    createdAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 's1',
    role: 'student',
    fullName: 'Alex Rivera',
    email: 'student1@bustrack.local',
    phone: '+1 (555) 011-4455',
    status: 'active',
    createdAt: '2026-02-01T10:15:00Z',
  },
  {
    id: 's2',
    role: 'student',
    fullName: 'Sophia Chen',
    email: 'student2@bustrack.local',
    phone: '+1 (555) 011-8899',
    status: 'active',
    createdAt: '2026-02-02T14:20:00Z',
  },
  {
    id: 's3',
    role: 'student',
    fullName: 'Ethan Walker',
    email: 'student3@bustrack.local',
    phone: '+1 (555) 011-3322',
    status: 'active',
    createdAt: '2026-02-03T16:45:00Z',
  },
];

const INITIAL_ADMINS: Record<string, AdminUser> = {
  a1: {
    ...INITIAL_PROFILES[0],
    role: 'admin',
    adminId: 'ADMIN001',
    department: 'Transit Operations Authority',
  },
};

const INITIAL_DRIVERS: Record<string, DriverUser> = {
  d1: {
    ...INITIAL_PROFILES[1],
    role: 'driver',
    driverId: 'DRIVER001',
    licenseNumber: 'DL-98214-COMM',
    licenseExpiry: '2028-12-31',
    address: '742 Evergreen Terrace, Springfield',
    emergencyContact: '+1 (555) 012-3456',
  },
  d2: {
    ...INITIAL_PROFILES[2],
    role: 'driver',
    driverId: 'DRIVER002',
    licenseNumber: 'DL-55412-COMM',
    licenseExpiry: '2027-08-15',
    address: '128 Pine Hollow Rd, Oakridge',
    emergencyContact: '+1 (555) 012-7890',
  },
};

const INITIAL_STUDENTS: Record<string, StudentUser> = {
  s1: {
    ...INITIAL_PROFILES[3],
    role: 'student',
    enrollmentNumber: 'STU2026001',
    department: 'Computer Science & Engineering',
    courseYear: '3rd Year',
  },
  s2: {
    ...INITIAL_PROFILES[4],
    role: 'student',
    enrollmentNumber: 'STU2026002',
    department: 'Electronics & Communications',
    courseYear: '2nd Year',
  },
  s3: {
    ...INITIAL_PROFILES[5],
    role: 'student',
    enrollmentNumber: 'STU2026003',
    department: 'Mechanical Engineering',
    courseYear: '4th Year',
  },
};

// Initial Mock Passwords (normalized)
const INITIAL_PASSWORDS: Record<string, string> = {
  ADMIN001: 'Admin@123',
  DRIVER001: 'Driver@123',
  DRIVER002: 'Driver@123',
  STU2026001: 'Student@123',
  STU2026002: 'Student@123',
  STU2026003: 'Student@123',
};

const INITIAL_ROUTES: BusRoute[] = [
  {
    id: 'r1',
    routeNumber: 'RT-101',
    name: 'Bhopal Junction to MANIT Tech Corridor',
    startPoint: 'Bhopal Junction Railway Station',
    endPoint: 'MANIT Bhopal Campus',
    estimatedDurationMins: 45,
    distanceKm: 14.8,
    isActive: true,
    stops: [
      {
        id: 'rs1',
        routeId: 'r1',
        name: 'Bhopal Junction Railway Station',
        address: 'Platform 1 Main Gate, Station Road, Old Bhopal',
        latitude: 23.2694,
        longitude: 77.4126,
        sequenceOrder: 1,
        scheduledArrival: '07:30 AM',
        scheduledDeparture: '07:35 AM',
        waitingMins: 5,
      },
      {
        id: 'rs2',
        routeId: 'r1',
        name: 'New Market (TT Nagar Plaza)',
        address: 'Malviya Nagar, TT Nagar Circle, Bhopal',
        latitude: 23.2361,
        longitude: 77.3994,
        sequenceOrder: 2,
        scheduledArrival: '07:48 AM',
        scheduledDeparture: '07:50 AM',
        waitingMins: 2,
      },
      {
        id: 'rs3',
        routeId: 'r1',
        name: 'MP Nagar Zone-1 (DB City Mall)',
        address: 'Hoshangabad Road, MP Nagar, Bhopal',
        latitude: 23.2332,
        longitude: 77.4332,
        sequenceOrder: 3,
        scheduledArrival: '08:02 AM',
        scheduledDeparture: '08:05 AM',
        waitingMins: 3,
      },
      {
        id: 'rs4',
        routeId: 'r1',
        name: 'Link Road 3 Crossing',
        address: 'Near Kali Mata Temple, Link Road 3, Bhopal',
        latitude: 23.2240,
        longitude: 77.4180,
        sequenceOrder: 4,
        scheduledArrival: '08:15 AM',
        scheduledDeparture: '08:17 AM',
        waitingMins: 2,
      },
      {
        id: 'rs5',
        routeId: 'r1',
        name: 'MANIT Bhopal Campus',
        address: 'Main Academic Gate, Link Road 3, Bhopal',
        latitude: 23.2163,
        longitude: 77.4067,
        sequenceOrder: 5,
        scheduledArrival: '08:25 AM',
        scheduledDeparture: '08:30 AM',
        waitingMins: 5,
      },
    ],
  },
  {
    id: 'r2',
    routeNumber: 'RT-102',
    name: 'Rani Kamlapati to AIIMS Campus Shuttle',
    startPoint: 'Rani Kamlapati Railway Station',
    endPoint: 'AIIMS Bhopal Campus',
    estimatedDurationMins: 35,
    distanceKm: 9.6,
    isActive: true,
    stops: [
      {
        id: 'rs6',
        routeId: 'r2',
        name: 'Rani Kamlapati Railway Station',
        address: 'Platform 1 Terminus, Habibganj, Bhopal',
        latitude: 23.2144,
        longitude: 77.4379,
        sequenceOrder: 1,
        scheduledArrival: '07:40 AM',
        scheduledDeparture: '07:45 AM',
        waitingMins: 5,
      },
      {
        id: 'rs7',
        routeId: 'r2',
        name: 'Shahpura Lake Bus Stop',
        address: 'Rohit Nagar / Kolar Road Junction, Bhopal',
        latitude: 23.1950,
        longitude: 77.4270,
        sequenceOrder: 2,
        scheduledArrival: '07:55 AM',
        scheduledDeparture: '07:57 AM',
        waitingMins: 2,
      },
      {
        id: 'rs8',
        routeId: 'r2',
        name: 'Saket Nagar Sector 3',
        address: 'Near Subhash Higher Secondary, Saket Nagar, Bhopal',
        latitude: 23.2010,
        longitude: 77.4480,
        sequenceOrder: 3,
        scheduledArrival: '08:08 AM',
        scheduledDeparture: '08:10 AM',
        waitingMins: 2,
      },
      {
        id: 'rs9',
        routeId: 'r2',
        name: 'AIIMS Bhopal Campus',
        address: 'Outpatient & Main Hospital Gate, Saket Nagar, Bhopal',
        latitude: 23.2069,
        longitude: 77.4600,
        sequenceOrder: 4,
        scheduledArrival: '08:20 AM',
        scheduledDeparture: '08:25 AM',
        waitingMins: 5,
      },
    ],
  },
];

const INITIAL_BUSES: Bus[] = [
  {
    id: 'b1',
    busNumber: 'BUS-101',
    registrationNumber: 'MP-04-AB-1001',
    name: 'Bhopal North Cruiser',
    capacity: 45,
    busType: 'Air Conditioned Deluxe',
    model: 'Tata Starbus Ultra 2024',
    status: 'active',
    assignedRouteId: 'r1',
    assignedDriverId: 'd1',
    currentTripStatus: 'ON_TRIP',
    selectedStudentsCount: 18,
    description: 'Bhopal central-to-campus express serving New Market and MP Nagar',
    currentLatitude: 23.2332,
    currentLongitude: 77.4332,
    lastGpsUpdate: new Date().toISOString(),
    speed: 38,
    heading: 315,
  },
  {
    id: 'b2',
    busNumber: 'BUS-102',
    registrationNumber: 'MP-04-CD-1002',
    name: 'Lake City Express',
    capacity: 40,
    busType: 'Standard Coach',
    model: 'Ashok Leyland Falcon 2023',
    status: 'active',
    assignedRouteId: 'r2',
    assignedDriverId: 'd2',
    currentTripStatus: 'IDLE',
    selectedStudentsCount: 12,
    description: 'Southern Bhopal commuter linking Rani Kamlapati with AIIMS',
    currentLatitude: 23.2144,
    currentLongitude: 77.4379,
    lastGpsUpdate: new Date().toISOString(),
    speed: 0,
    heading: 0,
  },
  {
    id: 'b3',
    busNumber: 'BUS-103',
    registrationNumber: 'MP-04-EF-1003',
    name: 'Bhopal Reserve Shuttle',
    capacity: 35,
    busType: 'Mini Bus',
    model: 'Force Traveller City 2024',
    status: 'active',
    assignedRouteId: null,
    assignedDriverId: null,
    currentTripStatus: 'PARKED',
    selectedStudentsCount: 0,
    description: 'Standby emergency vehicle parked at Central Bhopal transit depot',
    currentLatitude: 23.2599,
    currentLongitude: 77.4126,
    lastGpsUpdate: new Date().toISOString(),
    speed: 0,
    heading: 0,
  },
];

const INITIAL_ASSIGNMENTS: BusAssignment[] = [
  {
    id: 'ba1',
    busId: 'b1',
    driverId: 'd1',
    assignedAt: '2026-02-01T06:00:00Z',
    isActive: true,
  },
  {
    id: 'ba2',
    busId: 'b2',
    driverId: 'd2',
    assignedAt: '2026-02-01T06:00:00Z',
    isActive: true,
  },
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: 't1',
    busId: 'b1',
    driverId: 'd1',
    routeId: 'r1',
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: 'IN_PROGRESS',
    currentStopId: 'rs2',
    lastLatitude: 23.2332,
    lastLongitude: 77.4332,
    lastUpdatedAt: new Date().toISOString(),
  },
];

const INITIAL_SELECTIONS: StudentBusSelection[] = [
  {
    id: 'sbs1',
    studentId: 's1',
    busId: 'b1',
    routeId: 'r1',
    selectedAt: '2026-02-02T10:00:00Z',
    isActive: true,
  },
  {
    id: 'sbs2',
    studentId: 's2',
    busId: 'b2',
    routeId: 'r2',
    selectedAt: '2026-02-03T11:00:00Z',
    isActive: true,
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    userId: 's1',
    title: 'Trip Started: Bus 101',
    message: 'Bus 101 (Bhopal North Cruiser) has departed Bhopal Junction and is en route via New Market and MP Nagar.',
    category: 'TRIP_START',
    relatedEntityId: 'b1',
    isRead: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'n2',
    userId: 'd1',
    title: 'Duty Assignment Active',
    message: 'You are assigned to Bus 101 on Route RT-101 (Bhopal Junction to MANIT Tech Corridor).',
    category: 'DRIVER_CHANGE',
    relatedEntityId: 'b1',
    isRead: true,
    createdAt: '2026-02-01T06:00:00Z',
  },
  {
    id: 'n3',
    userId: 'a1',
    title: 'Bhopal Fleet Ready',
    message: 'Morning Bhopal institutional transit readiness check completed. 2 routes operational.',
    category: 'SYSTEM',
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    ticketNumber: 'CMP-2026-01',
    complainantId: 's1',
    complainantName: 'Alex Rivera',
    complainantRole: 'student',
    busId: 'b1',
    busNumber: 'BUS-101',
    subject: 'Slight morning delay at Chetak Bridge crossing',
    category: 'PUNCTUALITY',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    description: 'MP Nagar Chetak Bridge crossing was held up by 8 minutes due to newly opened sewer line work.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updates: [
      {
        id: 'cu1',
        complaintId: 'c1',
        responderId: 'a1',
        responderName: 'System Administrator',
        internalNote: false,
        statusTransition: 'IN_PROGRESS',
        message: 'Acknowledged. Traffic advisory noted for driver dispatch. Monitoring transit time.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'c2',
    ticketNumber: 'CMP-2026-02',
    complainantId: 'd2',
    complainantName: 'Marcus Sterling',
    complainantRole: 'driver',
    busId: 'b2',
    busNumber: 'BUS-102',
    subject: 'Air conditioning cooling sensor intermittent',
    category: 'BREAKDOWN',
    priority: 'HIGH',
    status: 'NEW',
    description: 'Rear passenger AC vent cooling cuts off when idle at traffic signals.',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updates: [],
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    actorId: 'a1',
    actorName: 'System Administrator',
    action: 'SYSTEM_INITIALIZATION',
    entityType: 'FLEET',
    entityId: 'ALL',
    metadata: { version: '1.0.0', initializedEntities: 15 },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    actorId: 'a1',
    actorName: 'System Administrator',
    action: 'DRIVER_ASSIGNMENT',
    entityType: 'BUS',
    entityId: 'b1',
    metadata: { busNumber: 'BUS-101', driverId: 'd1', driverName: 'Robert Vance' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==========================================
// In-Memory Reactive Store Implementation
// ==========================================

class BusTrackStore {
  private profiles = [...INITIAL_PROFILES];
  private admins = { ...INITIAL_ADMINS };
  private drivers = { ...INITIAL_DRIVERS };
  private students = { ...INITIAL_STUDENTS };
  private passwords = { ...INITIAL_PASSWORDS };
  private routes = [...INITIAL_ROUTES];
  private buses = [...INITIAL_BUSES];
  private assignments = [...INITIAL_ASSIGNMENTS];
  private trips = [...INITIAL_TRIPS];
  private selections = [...INITIAL_SELECTIONS];
  private notifications = [...INITIAL_NOTIFICATIONS];
  private complaints = [...INITIAL_COMPLAINTS];
  private auditLogs = [...INITIAL_AUDIT_LOGS];

  private listeners: Set<() => void> = new Set();
  private demoSimulatorActive = false;
  private demoInterval: any = null;

  constructor() {
    // Attempt local storage hydration on client side
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bustrack_db_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          // If previous session used old non-Bhopal coordinates (lat > 25), migrate to Bhopal data
          const isOldNonBhopal = parsed.buses?.[0]?.currentLatitude && parsed.buses[0].currentLatitude > 25;
          if (!isOldNonBhopal) {
            if (parsed.profiles) this.profiles = parsed.profiles;
            if (parsed.admins) this.admins = parsed.admins;
            if (parsed.buses) this.buses = parsed.buses;
            if (parsed.routes) this.routes = parsed.routes;
            if (parsed.drivers) this.drivers = parsed.drivers;
            if (parsed.students) this.students = parsed.students;
            if (parsed.complaints) this.complaints = parsed.complaints;
            if (parsed.notifications) this.notifications = parsed.notifications;
            if (parsed.selections) this.selections = parsed.selections;
            if (parsed.assignments) this.assignments = parsed.assignments;
            if (parsed.trips) this.trips = parsed.trips;
            if (parsed.passwords) this.passwords = parsed.passwords;
            if (parsed.auditLogs) this.auditLogs = parsed.auditLogs;
          } else {
            this.persist();
          }
        }
      } catch (e) {
        console.warn('LocalStorage hydration error:', e);
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'bustrack_db_v1',
          JSON.stringify({
            profiles: this.profiles,
            admins: this.admins,
            buses: this.buses,
            routes: this.routes,
            drivers: this.drivers,
            students: this.students,
            complaints: this.complaints,
            notifications: this.notifications,
            selections: this.selections,
            assignments: this.assignments,
            trips: this.trips,
            passwords: this.passwords,
            auditLogs: this.auditLogs,
          })
        );
      } catch (e) {
        // quota exceeded or SSR
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Auth & Users ---
  public authenticateUser(identifier: string, pass: string): { user: UserProfile | null; error?: string } {
    const cleanId = identifier.trim().toUpperCase();

    // Check Admin
    const admin = Object.values(this.admins).find((a) => a.adminId.toUpperCase() === cleanId);
    if (admin) {
      if (this.passwords[admin.adminId] === pass) {
        return { user: admin };
      }
      return { user: null, error: 'Invalid admin credentials' };
    }

    // Check Driver
    const driver = Object.values(this.drivers).find((d) => d.driverId.toUpperCase() === cleanId);
    if (driver) {
      if (this.passwords[driver.driverId] === pass) {
        return { user: driver };
      }
      return { user: null, error: 'Invalid driver credentials' };
    }

    // Check Student by enrollment number
    const student = Object.values(this.students).find(
      (s) => s.enrollmentNumber.toUpperCase() === cleanId
    );
    if (student) {
      if (this.passwords[student.enrollmentNumber] === pass) {
        return { user: student };
      }
      return { user: null, error: 'Invalid student credentials' };
    }

    return { user: null, error: 'Account not found with this identifier' };
  }

  public getAdmins(): AdminUser[] {
    return Object.values(this.admins);
  }

  public createAdmin(
    data: {
      adminId: string;
      fullName: string;
      email?: string;
      phone?: string;
      department?: string;
      password?: string;
    },
    creatorAdminId: string
  ): { admin: AdminUser | null; error?: string } {
    const cleanId = data.adminId.trim().toUpperCase();
    if (!cleanId || !data.fullName.trim()) {
      return { admin: null, error: 'Admin ID and full name are required' };
    }

    const exists = Object.values(this.admins).some((a) => a.adminId.toUpperCase() === cleanId);
    if (exists) {
      return { admin: null, error: `Admin ID "${cleanId}" already exists` };
    }

    const newId = 'a_' + Date.now();
    const newProfile: UserProfile = {
      id: newId,
      role: 'admin',
      fullName: data.fullName.trim(),
      email: data.email?.trim() || `${cleanId.toLowerCase()}@bustrack.local`,
      phone: data.phone?.trim() || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const newAdmin: AdminUser = {
      ...newProfile,
      role: 'admin',
      adminId: cleanId,
      department: data.department?.trim() || 'Transit Operations Authority',
    };

    this.profiles.push(newProfile);
    this.admins[newId] = newAdmin;
    this.passwords[cleanId] = data.password || 'Admin@123';

    this.logAudit(creatorAdminId, 'CREATE_ADMIN', 'ADMIN', cleanId, {
      fullName: data.fullName,
      department: newAdmin.department,
    });

    this.persist();
    return { admin: newAdmin };
  }

  public registerStudent(data: {
    fullName: string;
    enrollmentNumber: string;
    password: string;
    email?: string;
    phone?: string;
    department?: string;
    courseYear?: string;
  }): { student: StudentUser | null; error?: string } {
    const normalizedEnrollment = data.enrollmentNumber.trim().toUpperCase();

    if (!normalizedEnrollment) {
      return { student: null, error: 'Enrollment number is required' };
    }

    // Enforce uniqueness across all student accounts
    const exists = Object.values(this.students).some(
      (s) => s.enrollmentNumber.toUpperCase() === normalizedEnrollment
    );
    if (exists) {
      return { student: null, error: `Enrollment number "${normalizedEnrollment}" is already registered. Please log in.` };
    }

    const newId = 's_' + Date.now();
    const newProfile: UserProfile = {
      id: newId,
      role: 'student',
      fullName: data.fullName.trim(),
      email: data.email?.trim() || `${normalizedEnrollment.toLowerCase()}@student.bustrack.local`,
      phone: data.phone?.trim() || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const newStudent: StudentUser = {
      ...newProfile,
      role: 'student',
      enrollmentNumber: normalizedEnrollment,
      department: data.department || 'General Transit',
      courseYear: data.courseYear || '1st Year',
    };

    this.profiles.push(newProfile);
    this.students[newId] = newStudent;
    this.passwords[normalizedEnrollment] = data.password;

    this.logAudit('a1', 'STUDENT_REGISTRATION', 'STUDENT', normalizedEnrollment, {
      fullName: data.fullName,
      enrollmentNumber: normalizedEnrollment,
    });

    this.persist();
    return { student: newStudent };
  }

  public changePassword(identifier: string, oldPass: string, newPass: string): { success: boolean; error?: string } {
    const cleanId = identifier.trim().toUpperCase();
    if (this.passwords[cleanId] !== oldPass) {
      return { success: false, error: 'Previous password is incorrect' };
    }
    this.passwords[cleanId] = newPass;
    this.persist();
    return { success: true };
  }

  public resetUserPassword(identifier: string, newPass: string, adminId: string): { success: boolean; error?: string } {
    const cleanId = identifier.trim().toUpperCase();
    this.passwords[cleanId] = newPass;
    this.logAudit(adminId, 'PASSWORD_RESET', 'USER', cleanId, { resetBy: adminId });
    this.persist();
    return { success: true };
  }

  // --- Buses ---
  public getBuses(): Bus[] {
    return [...this.buses];
  }

  public getBusById(id: string): Bus | undefined {
    return this.buses.find((b) => b.id === id);
  }

  public createBus(data: Omit<Bus, 'id' | 'selectedStudentsCount'>, adminId: string): Bus {
    const newBus: Bus = {
      ...data,
      id: 'b_' + Date.now(),
      selectedStudentsCount: 0,
      currentTripStatus: 'IDLE',
      currentLatitude: data.currentLatitude || BHOPAL_CENTER.lat,
      currentLongitude: data.currentLongitude || BHOPAL_CENTER.lng,
      lastGpsUpdate: new Date().toISOString(),
    };
    this.buses.push(newBus);
    this.logAudit(adminId, 'CREATE_BUS', 'BUS', newBus.id, { busNumber: newBus.busNumber });
    this.persist();
    return newBus;
  }

  public updateBus(id: string, updates: Partial<Bus>, adminId: string): Bus | null {
    const idx = this.buses.findIndex((b) => b.id === id);
    if (idx === -1) return null;

    const oldBus = this.buses[idx];
    this.buses[idx] = { ...oldBus, ...updates };

    // If driver was unassigned
    if (updates.assignedDriverId === null && oldBus.assignedDriverId) {
      this.assignments.forEach((a) => {
        if (a.busId === id && a.isActive) {
          a.isActive = false;
          a.unassignedAt = new Date().toISOString();
        }
      });
      this.notifyBusFollowers(
        id,
        'Driver Unassigned',
        `Bus ${oldBus.busNumber} currently does not have an assigned driver.`,
        'DRIVER_CHANGE'
      );
    }

    // If route changed, notify affected students & driver
    if (updates.assignedRouteId && updates.assignedRouteId !== oldBus.assignedRouteId) {
      const newRoute = this.getRouteById(updates.assignedRouteId);
      this.notifyBusFollowers(
        id,
        'Route Updated',
        `Bus ${oldBus.busNumber} has been reassigned to route ${newRoute?.name || updates.assignedRouteId}.`,
        'ROUTE_CHANGE'
      );
    } else if (updates.assignedRouteId === null && oldBus.assignedRouteId) {
      this.notifyBusFollowers(
        id,
        'Route Unassigned',
        `Bus ${oldBus.busNumber} has been temporarily unassigned from its route corridor.`,
        'ROUTE_CHANGE'
      );
    }

    this.logAudit(adminId, 'UPDATE_BUS', 'BUS', id, { updates });
    this.persist();
    return this.buses[idx];
  }

  // --- Routes & Stops ---
  public getRoutes(): BusRoute[] {
    return [...this.routes];
  }

  public getRouteById(id: string): BusRoute | undefined {
    return this.routes.find((r) => r.id === id);
  }

  public createRoute(data: Omit<BusRoute, 'id'>, adminId: string): BusRoute {
    const routeId = 'r_' + Date.now();
    const stopsWithRouteId = (data.stops || []).map((s) => ({
      ...s,
      routeId,
    }));
    const newRoute: BusRoute = {
      ...data,
      id: routeId,
      stops: stopsWithRouteId,
    };
    this.routes.push(newRoute);
    this.logAudit(adminId, 'CREATE_ROUTE', 'ROUTE', newRoute.id, { routeNumber: newRoute.routeNumber });
    this.persist();
    return newRoute;
  }

  public updateRoute(id: string, updates: Partial<BusRoute>, adminId: string): BusRoute | null {
    const idx = this.routes.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    this.routes[idx] = { ...this.routes[idx], ...updates };

    // Find buses using this route and notify followers
    const affectedBuses = this.buses.filter((b) => b.assignedRouteId === id);
    affectedBuses.forEach((b) => {
      this.notifyBusFollowers(
        b.id,
        'Schedule / Route Revision',
        `Route ${this.routes[idx].name} has updated stop times or sequence. Please check timetable.`,
        'ROUTE_CHANGE'
      );
    });

    this.logAudit(adminId, 'UPDATE_ROUTE', 'ROUTE', id, { updates });
    this.persist();
    return this.routes[idx];
  }

  // --- Drivers ---
  public getDrivers(): DriverUser[] {
    return Object.values(this.drivers);
  }

  public getDriverById(id: string): DriverUser | undefined {
    return this.drivers[id];
  }

  public createDriver(data: Omit<DriverUser, 'id' | 'role' | 'createdAt'> & { password?: string }, adminId: string): DriverUser {
    const newId = 'd_' + Date.now();
    const cleanDriverId = data.driverId.trim().toUpperCase();

    const newDriver: DriverUser = {
      id: newId,
      role: 'driver',
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      status: data.status,
      driverId: cleanDriverId,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      address: data.address,
      emergencyContact: data.emergencyContact,
      createdAt: new Date().toISOString(),
    };

    this.drivers[newId] = newDriver;
    this.profiles.push(newDriver);
    this.passwords[cleanDriverId] = data.password || 'Driver@123';

    this.logAudit(adminId, 'CREATE_DRIVER', 'DRIVER', cleanDriverId, { fullName: data.fullName });
    this.persist();
    return newDriver;
  }

  public assignDriverToBus(driverId: string, busId: string, adminId: string): boolean {
    const bus = this.buses.find((b) => b.id === busId);
    const driver = this.drivers[driverId];
    if (!bus || !driver) return false;

    // Deactivate previous active assignment for this bus
    this.assignments.forEach((a) => {
      if (a.busId === busId && a.isActive) {
        a.isActive = false;
        a.unassignedAt = new Date().toISOString();
      }
      if (a.driverId === driverId && a.isActive) {
        a.isActive = false;
        a.unassignedAt = new Date().toISOString();
      }
    });

    // Also clear other buses assigned to this driver
    this.buses.forEach((b) => {
      if (b.assignedDriverId === driverId && b.id !== busId) {
        b.assignedDriverId = null;
      }
    });

    // Assign to this bus
    bus.assignedDriverId = driverId;

    this.assignments.push({
      id: 'ba_' + Date.now(),
      busId,
      driverId,
      assignedAt: new Date().toISOString(),
      isActive: true,
    });

    // Notify Driver
    this.createNotification(
      driverId,
      'Vehicle Assignment Updated',
      `You are assigned to Bus ${bus.busNumber} (${bus.name}).`,
      'DRIVER_CHANGE',
      busId
    );

    // Notify Students following this bus
    this.notifyBusFollowers(
      busId,
      'Driver Assigned',
      `Bus ${bus.busNumber} is now assigned to Driver ${driver.fullName}.`,
      'DRIVER_CHANGE'
    );

    this.logAudit(adminId, 'ASSIGN_DRIVER', 'BUS', busId, {
      busNumber: bus.busNumber,
      driverId: driver.driverId,
      driverName: driver.fullName,
    });

    this.persist();
    return true;
  }

  public unassignDriverFromBus(busId: string, adminId: string): boolean {
    const bus = this.buses.find((b) => b.id === busId);
    if (!bus) return false;

    const oldDriverId = bus.assignedDriverId;
    bus.assignedDriverId = null;

    this.assignments.forEach((a) => {
      if (a.busId === busId && a.isActive) {
        a.isActive = false;
        a.unassignedAt = new Date().toISOString();
      }
    });

    if (oldDriverId) {
      this.createNotification(
        oldDriverId,
        'Vehicle Duty Unassigned',
        `You have been unassigned from Bus ${bus.busNumber}.`,
        'DRIVER_CHANGE',
        busId
      );
    }

    this.notifyBusFollowers(
      busId,
      'Driver Unassigned',
      `Bus ${bus.busNumber} currently does not have an assigned driver.`,
      'DRIVER_CHANGE'
    );

    this.logAudit(adminId, 'UNASSIGN_DRIVER', 'BUS', busId, { busNumber: bus.busNumber });
    this.persist();
    return true;
  }

  // --- Trip Telemetry & GPS ---
  public getActiveTripForBus(busId: string): Trip | undefined {
    return this.trips.find((t) => t.busId === busId && (t.status === 'IN_PROGRESS' || t.status === 'PARKED'));
  }

  public getTripsForBus(busId: string): Trip[] {
    return this.trips.filter((t) => t.busId === busId).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  public startTrip(busId: string, driverId: string, coords: { lat: number; lng: number }): { trip: Trip | null; error?: string } {
    const bus = this.buses.find((b) => b.id === busId);
    if (!bus) return { trip: null, error: 'Bus not found' };

    if (!bus.assignedRouteId) {
      return { trip: null, error: 'Bus does not have an assigned route' };
    }

    // Verify driver assignment
    if (bus.assignedDriverId !== driverId) {
      return { trip: null, error: 'Unauthorized: You are not assigned to this bus' };
    }

    const route = this.getRouteById(bus.assignedRouteId);
    const firstStop = route?.stops?.[0];

    const newTrip: Trip = {
      id: 'trip_' + Date.now(),
      busId,
      driverId,
      routeId: bus.assignedRouteId,
      startedAt: new Date().toISOString(),
      status: 'IN_PROGRESS',
      currentStopId: firstStop?.id,
      lastLatitude: coords.lat,
      lastLongitude: coords.lng,
      lastUpdatedAt: new Date().toISOString(),
    };

    this.trips.push(newTrip);
    bus.currentTripStatus = 'ON_TRIP';
    bus.currentLatitude = coords.lat;
    bus.currentLongitude = coords.lng;
    bus.lastGpsUpdate = new Date().toISOString();

    this.notifyBusFollowers(
      busId,
      'Trip Started',
      `Bus ${bus.busNumber} has started its journey on route ${route?.name || ''}. Track live on map!`,
      'TRIP_START'
    );

    this.logAudit(driverId, 'START_TRIP', 'TRIP', newTrip.id, { busNumber: bus.busNumber, coords });
    this.persist();
    return { trip: newTrip };
  }

  public parkTrip(tripId: string, driverId: string, coords: { lat: number; lng: number }): { success: boolean; error?: string } {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip || trip.driverId !== driverId) return { success: false, error: 'Trip not found or unauthorized' };

    trip.status = 'PARKED';
    trip.lastLatitude = coords.lat;
    trip.lastLongitude = coords.lng;
    trip.lastUpdatedAt = new Date().toISOString();

    const bus = this.buses.find((b) => b.id === trip.busId);
    if (bus) {
      bus.currentTripStatus = 'PARKED';
      bus.currentLatitude = coords.lat;
      bus.currentLongitude = coords.lng;
      bus.lastGpsUpdate = new Date().toISOString();
      bus.speed = 0;

      this.notifyBusFollowers(
        bus.id,
        'Bus Parked / Layover',
        `Bus ${bus.busNumber} is currently parked / on scheduled layover at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}.`,
        'BUS_PARKED'
      );
    }

    this.logAudit(driverId, 'PARK_BUS', 'TRIP', tripId, { coords });
    this.persist();
    return { success: true };
  }

  public resumeTrip(tripId: string, driverId: string): { success: boolean; error?: string } {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip || trip.driverId !== driverId) return { success: false, error: 'Trip not found or unauthorized' };

    trip.status = 'IN_PROGRESS';
    trip.lastUpdatedAt = new Date().toISOString();

    const bus = this.buses.find((b) => b.id === trip.busId);
    if (bus) {
      bus.currentTripStatus = 'ON_TRIP';
      bus.lastGpsUpdate = new Date().toISOString();
    }

    this.logAudit(driverId, 'RESUME_TRIP', 'TRIP', tripId);
    this.persist();
    return { success: true };
  }

  public endTrip(tripId: string, driverId: string, coords?: { lat: number; lng: number }): { success: boolean; error?: string } {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip || trip.driverId !== driverId) return { success: false, error: 'Trip not found or unauthorized' };

    trip.status = 'COMPLETED';
    trip.endedAt = new Date().toISOString();
    if (coords) {
      trip.lastLatitude = coords.lat;
      trip.lastLongitude = coords.lng;
    }

    const bus = this.buses.find((b) => b.id === trip.busId);
    if (bus) {
      bus.currentTripStatus = 'IDLE';
      bus.speed = 0;
      bus.lastGpsUpdate = new Date().toISOString();

      this.notifyBusFollowers(
        bus.id,
        'Trip Completed',
        `Bus ${bus.busNumber} has concluded its scheduled trip.`,
        'TRIP_END'
      );
    }

    this.logAudit(driverId, 'END_TRIP', 'TRIP', tripId);
    this.persist();
    return { success: true };
  }

  public updateLiveLocation(busId: string, driverId: string, lat: number, lng: number, speed = 0, heading = 0): boolean {
    const bus = this.buses.find((b) => b.id === busId);
    if (!bus || bus.assignedDriverId !== driverId) return false;

    bus.currentLatitude = lat;
    bus.currentLongitude = lng;
    bus.lastGpsUpdate = new Date().toISOString();
    bus.speed = speed;
    bus.heading = heading;

    const activeTrip = this.getActiveTripForBus(busId);
    if (activeTrip) {
      activeTrip.lastLatitude = lat;
      activeTrip.lastLongitude = lng;
      activeTrip.lastUpdatedAt = new Date().toISOString();
    }

    this.persist();
    return true;
  }

  // --- Student Bus Selection ---
  public getStudentSelection(studentId: string): StudentBusSelection | undefined {
    return this.selections.find((s) => s.studentId === studentId && s.isActive);
  }

  public selectBusForStudent(studentId: string, busId: string): boolean {
    const bus = this.buses.find((b) => b.id === busId);
    if (!bus) return false;

    // Check if previously selected a different bus
    const prevSelection = this.selections.find((s) => s.studentId === studentId && s.isActive);
    if (prevSelection) {
      if (prevSelection.busId === busId) return true; // Already selected

      // Decrement previous bus count
      const prevBus = this.buses.find((b) => b.id === prevSelection.busId);
      if (prevBus && prevBus.selectedStudentsCount > 0) {
        prevBus.selectedStudentsCount -= 1;
      }
      prevSelection.isActive = false;
    }

    // Add new selection
    this.selections.push({
      id: 'sbs_' + Date.now(),
      studentId,
      busId,
      routeId: bus.assignedRouteId || undefined,
      selectedAt: new Date().toISOString(),
      isActive: true,
    });

    bus.selectedStudentsCount = (bus.selectedStudentsCount || 0) + 1;

    // Send confirmation notification
    this.createNotification(
      studentId,
      'Bus Selected',
      `You are now following Bus ${bus.busNumber} (${bus.name}). You will receive live alerts for this vehicle.`,
      'SYSTEM',
      busId
    );

    this.logAudit(studentId, 'SELECT_BUS', 'STUDENT_SELECTION', busId, { busNumber: bus.busNumber });
    this.persist();
    return true;
  }

  public removeStudentSelection(studentId: string): boolean {
    const selection = this.selections.find((s) => s.studentId === studentId && s.isActive);
    if (!selection) return false;

    const bus = this.buses.find((b) => b.id === selection.busId);
    if (bus && bus.selectedStudentsCount > 0) {
      bus.selectedStudentsCount -= 1;
    }
    selection.isActive = false;

    this.logAudit(studentId, 'REMOVE_BUS_SELECTION', 'STUDENT_SELECTION', selection.busId);
    this.persist();
    return true;
  }

  public getStudentsFollowingBus(busId: string): StudentUser[] {
    const activeStudentIds = this.selections
      .filter((s) => s.busId === busId && s.isActive)
      .map((s) => s.studentId);
    return activeStudentIds.map((id) => this.students[id]).filter(Boolean);
  }

  public getAllStudents(): StudentUser[] {
    return Object.values(this.students);
  }

  // --- Notifications ---
  public getNotificationsForUser(userId: string): NotificationItem[] {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(
    userId: string,
    title: string,
    message: string,
    category: NotificationItem['category'] = 'SYSTEM',
    relatedEntityId?: string
  ): NotificationItem {
    const item: NotificationItem = {
      id: 'n_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      title,
      message,
      category,
      relatedEntityId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(item);
    this.persist();
    return item;
  }

  public notifyBusFollowers(busId: string, title: string, message: string, category: NotificationItem['category']) {
    const followers = this.getStudentsFollowingBus(busId);
    followers.forEach((f) => {
      this.createNotification(f.id, title, message, category, busId);
    });

    // Also notify assigned driver
    const bus = this.getBusById(busId);
    if (bus?.assignedDriverId) {
      this.createNotification(bus.assignedDriverId, title, message, category, busId);
    }
  }

  public markNotificationAsRead(id: string): boolean {
    const n = this.notifications.find((item) => item.id === id);
    if (!n) return false;
    n.isRead = true;
    this.persist();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): boolean {
    let changed = false;
    this.notifications.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        changed = true;
      }
    });
    if (changed) this.persist();
    return changed;
  }

  // --- Complaints ---
  public getComplaints(): Complaint[] {
    return [...this.complaints].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getComplaintsForUser(userId: string): Complaint[] {
    return this.complaints
      .filter((c) => c.complainantId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createComplaint(data: {
    complainantId: string;
    complainantName: string;
    complainantRole: UserRole;
    busId?: string | null;
    subject: string;
    category: Complaint['category'];
    priority: Complaint['priority'];
    description: string;
  }): Complaint {
    const bus = data.busId ? this.getBusById(data.busId) : undefined;
    const ticketNumber = `CMP-${new Date().getFullYear()}-${String(this.complaints.length + 1).padStart(3, '0')}`;

    const newComplaint: Complaint = {
      id: 'c_' + Date.now(),
      ticketNumber,
      complainantId: data.complainantId,
      complainantName: data.complainantName,
      complainantRole: data.complainantRole,
      busId: data.busId,
      busNumber: bus?.busNumber,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      status: 'NEW',
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updates: [],
    };

    this.complaints.unshift(newComplaint);

    // Notify Admins
    Object.values(this.admins).forEach((admin) => {
      this.createNotification(
        admin.id,
        `New Complaint Submitted (${ticketNumber})`,
        `[${data.category}] ${data.subject} by ${data.complainantName}.`,
        'COMPLAINT_UPDATE',
        newComplaint.id
      );
    });

    this.logAudit(data.complainantId, 'SUBMIT_COMPLAINT', 'COMPLAINT', newComplaint.id, {
      ticketNumber,
      subject: data.subject,
    });

    this.persist();
    return newComplaint;
  }

  public addComplaintUpdate(
    complaintId: string,
    responderId: string,
    message: string,
    statusTransition?: ComplaintStatus,
    internalNote = false
  ): boolean {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) return false;

    const responder = this.profiles.find((p) => p.id === responderId);
    const updateItem: ComplaintUpdate = {
      id: 'cu_' + Date.now(),
      complaintId,
      responderId,
      responderName: responder?.fullName || 'Transit Staff',
      internalNote,
      statusTransition,
      message,
      createdAt: new Date().toISOString(),
    };

    if (!complaint.updates) complaint.updates = [];
    complaint.updates.push(updateItem);
    complaint.updatedAt = new Date().toISOString();

    if (statusTransition) {
      complaint.status = statusTransition;
    }

    // Notify complainant if not an internal note
    if (!internalNote) {
      this.createNotification(
        complaint.complainantId,
        `Complaint Update (${complaint.ticketNumber})`,
        `Status: ${complaint.status}. Staff response: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
        'COMPLAINT_UPDATE',
        complaint.id
      );
    }

    this.logAudit(responderId, 'UPDATE_COMPLAINT', 'COMPLAINT', complaintId, {
      statusTransition,
      internalNote,
    });

    this.persist();
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public logAudit(actorId: string, action: string, entityType: string, entityId: string, metadata?: Record<string, any>) {
    const actor = this.profiles.find((p) => p.id === actorId);
    const log: AuditLog = {
      id: String(Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
      actorId,
      actorName: actor?.fullName || actorId,
      action,
      entityType,
      entityId,
      metadata,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    this.persist();
  }

  // --- Demo GPS Simulator ---
  // Smoothly simulates bus movement along the assigned route stops for demo and testing
  public toggleDemoSimulator(active?: boolean): boolean {
    if (active !== undefined) {
      this.demoSimulatorActive = active;
    } else {
      this.demoSimulatorActive = !this.demoSimulatorActive;
    }

    if (this.demoSimulatorActive) {
      if (!this.demoInterval) {
        let currentLegIndex = 0;
        let legStep = 0;
        const STEPS_PER_LEG = 6;

        this.demoInterval = setInterval(() => {
          const bus = this.buses.find((b) => b.id === 'b1');
          const route = this.routes.find((r) => r.id === 'r1');
          if (bus && route?.stops && route.stops.length > 1) {
            const stops = [...route.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
            const totalStops = stops.length;

            const fromStop = stops[currentLegIndex];
            const nextIndex = (currentLegIndex + 1) % totalStops;
            const toStop = stops[nextIndex];

            // fraction from 0 to 1 along the current leg
            const fraction = legStep / STEPS_PER_LEG;
            const lat = fromStop.latitude + (toStop.latitude - fromStop.latitude) * fraction;
            const lng = fromStop.longitude + (toStop.longitude - fromStop.longitude) * fraction;

            bus.currentLatitude = Number(lat.toFixed(6));
            bus.currentLongitude = Number(lng.toFixed(6));
            bus.speed = Math.round(30 + Math.sin(legStep) * 8);
            bus.lastGpsUpdate = new Date().toISOString();
            bus.currentTripStatus = 'ON_TRIP';

            const activeTrip = this.getActiveTripForBus('b1');
            if (activeTrip) {
              activeTrip.lastLatitude = bus.currentLatitude;
              activeTrip.lastLongitude = bus.currentLongitude;
              activeTrip.lastUpdatedAt = bus.lastGpsUpdate;
              // If halfway through the leg or beyond, upcoming stop is next
              activeTrip.currentStopId = fraction >= 0.5 ? toStop.id : fromStop.id;
            }

            this.persist();

            legStep++;
            if (legStep >= STEPS_PER_LEG) {
              legStep = 0;
              currentLegIndex = (currentLegIndex + 1) % totalStops;
            }
          }
        }, 3000);
      }
    } else {
      if (this.demoInterval) {
        clearInterval(this.demoInterval);
        this.demoInterval = null;
      }
    }

    this.notify();
    return this.demoSimulatorActive;
  }

  public isDemoSimulatorActive(): boolean {
    return this.demoSimulatorActive;
  }
}

// Singleton instance
export const db = new BusTrackStore();
