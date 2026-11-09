# BusTrack API & Route Endpoints

## 1. Authentication Endpoints

- `POST /api/auth/register`: Student self-registration with enrollment number validation.
- `POST /api/auth/login`: Unified role-based login (Student via Enrollment, Driver via Driver ID, Admin via Admin ID).
- `POST /api/auth/logout`: Clears session token / cookies.
- `POST /api/auth/change-password`: Verifies previous password and updates credentials.
- `POST /api/auth/reset-password`: Admin-only reset of user credentials.

## 2. Admin Operations

- `GET /api/admin/overview`: Fleet KPIs, active trip counts, student counts, complaint counts.
- `GET|POST /api/admin/buses`: List and create buses.
- `GET|PUT|DELETE /api/admin/buses/[id]`: Retrieve, update, or deactivate a bus.
- `GET|POST /api/admin/drivers`: List and create drivers.
- `PUT /api/admin/drivers/[id]/assign`: Assign or reassign driver to bus (with audit & student notification).
- `GET|POST /api/admin/routes`: List and create transit routes with ordered stops.
- `PUT /api/admin/routes/[id]`: Update route stops, sequence, and scheduled times.
- `GET /api/admin/students`: Student directory with bus selection mapping and enrollment search.
- `GET /api/admin/complaints`: List all complaints with filtering.
- `POST /api/admin/complaints/[id]/respond`: Add response, internal note, or status update.

## 3. Driver Telemetry & Trip Control

- `GET /api/driver/assigned-bus`: Fetch driver's active vehicle, route, and stop schedule.
- `POST /api/driver/trip/start`: Start trip, verify location permissions, update status to `ON_TRIP`.
- `POST /api/driver/trip/location`: Ingest live GPS coordinates (latitude, longitude, speed, heading).
- `POST /api/driver/trip/park`: Park bus at current coordinates, status to `PARKED`.
- `POST /api/driver/trip/resume`: Resume parked trip back to `ON_TRIP`.
- `POST /api/driver/trip/end`: Conclude trip, mark completed, notify passengers.

## 4. Student Operations

- `GET /api/student/buses`: Search buses by number or stop location.
- `POST /api/student/selection`: Atomically select or change followed bus.
- `DELETE /api/student/selection`: Remove active bus selection.
- `GET /api/student/live-tracking/[busId]`: Fetch live GPS location, ETA, and stop progress.

## 5. Complaints & Notifications

- `GET|POST /api/complaints`: List user's complaints or submit a new ticket.
- `GET /api/notifications`: Retrieve in-app notifications with unread counts.
- `PUT /api/notifications/[id]/read`: Mark notification as read.
- `PUT /api/notifications/read-all`: Mark all notifications as read.
