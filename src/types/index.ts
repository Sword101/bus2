export type UserRole = 'admin' | 'driver' | 'student';

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export interface AdminUser extends UserProfile {
  role: 'admin';
  adminId: string;
  department: string;
}

export interface DriverUser extends UserProfile {
  role: 'driver';
  driverId: string;
  licenseNumber: string;
  licenseExpiry: string;
  address: string;
  emergencyContact: string;
}

export interface StudentUser extends UserProfile {
  role: 'student';
  enrollmentNumber: string;
  department: string;
  courseYear: string;
}

export interface RouteStop {
  id: string;
  routeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  scheduledArrival: string; // e.g. "07:30 AM" or "07:30"
  scheduledDeparture: string;
  waitingMins: number;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  name: string;
  startPoint: string;
  endPoint: string;
  estimatedDurationMins: number;
  distanceKm: number;
  isActive: boolean;
  stops?: RouteStop[];
}

export type BusTripStatus = 'IDLE' | 'ON_TRIP' | 'PARKED' | 'OFFLINE';

export interface Bus {
  id: string;
  busNumber: string;
  registrationNumber: string;
  name: string;
  capacity: number;
  busType: string;
  model: string;
  status: 'active' | 'maintenance' | 'retired';
  assignedRouteId?: string | null;
  assignedDriverId?: string | null;
  currentTripStatus: BusTripStatus;
  selectedStudentsCount: number;
  description?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  lastGpsUpdate?: string;
  speed?: number;
  heading?: number;
}

export interface BusAssignment {
  id: string;
  busId: string;
  driverId: string;
  assignedAt: string;
  unassignedAt?: string | null;
  isActive: boolean;
}

export interface Trip {
  id: string;
  busId: string;
  driverId: string;
  routeId: string;
  startedAt: string;
  endedAt?: string | null;
  status: 'IN_PROGRESS' | 'PARKED' | 'COMPLETED' | 'CANCELLED';
  currentStopId?: string | null;
  lastLatitude?: number;
  lastLongitude?: number;
  lastUpdatedAt: string;
}

export interface StudentBusSelection {
  id: string;
  studentId: string;
  busId: string;
  routeId?: string;
  selectedAt: string;
  isActive: boolean;
}

export type NotificationCategory =
  | 'DELAY'
  | 'ROUTE_CHANGE'
  | 'DRIVER_CHANGE'
  | 'BUS_PARKED'
  | 'TRIP_START'
  | 'TRIP_END'
  | 'COMPLAINT_UPDATE'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export type ComplaintCategory =
  | 'PUNCTUALITY'
  | 'DRIVER_BEHAVIOR'
  | 'CLEANLINESS'
  | 'BREAKDOWN'
  | 'APP_ISSUE'
  | 'OTHER';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface ComplaintUpdate {
  id: string;
  complaintId: string;
  responderId: string;
  responderName: string;
  internalNote: boolean;
  statusTransition?: ComplaintStatus;
  message: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  complainantId: string;
  complainantName: string;
  complainantRole: UserRole;
  busId?: string | null;
  busNumber?: string;
  tripId?: string | null;
  subject: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  updates?: ComplaintUpdate[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
