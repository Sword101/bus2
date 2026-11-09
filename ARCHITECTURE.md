# BusTrack System Architecture

## 1. System Overview

BusTrack is a comprehensive real-time transportation operations platform designed for institutional transit (universities, colleges, corporate campuses). It synchronizes vehicle fleet management, driver telemetry, and student tracking via a unified Next.js + PostgreSQL/Supabase foundation.

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                 |
|                                                                                       |
|   +---------------------+     +-----------------------+     +---------------------+   |
|   |   Admin Dashboard   |     | Driver Mobile Console |     |  Student Live App   |   |
|   |  - Fleet / Drivers  |     |  - Start / End Trip   |     |  - Bus & Stop Search|   |
|   |  - Route & Schedule |     |  - Park Bus GPS Mode  |     |  - Rapido Live Map  |   |
|   |  - Complaints/Audit |     |  - Stop Checklist     |     |  - "Where Is Bus"   |   |
|   +----------+----------+     +-----------+-----------+     +----------+----------+   |
+--------------|----------------------------|----------------------------|--------------+
               |                            |                            |
               +----------------------------+----------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                APPLICATION & ROUTING LAYER                            |
|                                                                                       |
|   - Next.js 15+ App Router                                                            |
|   - Server Actions & Protected API Endpoints                                          |
|   - Session Guard Middleware with Role Authorization (Admin, Driver, Student)         |
|   - Resilient Storage Provider (Supabase Cloud + Local Sync Fallback)                 |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                PERSISTENCE & REALTIME LAYER                           |
|                                                                                       |
|   - PostgreSQL (15 Normalized Entities with Foreign Keys & Constraints)               |
|   - Row-Level Security (RLS) Policies per Role                                        |
|   - Supabase Realtime Channels (bus_locations, trips, notifications)                  |
|   - Geolocation Stream: HTML5 Geolocation Watcher -> Server Ingest -> Live Broadcast  |
+---------------------------------------------------------------------------------------+
```

## 2. Real-time Telemetry Pipeline

```
[Driver Phone Browser]
        |
        | (watchPosition GPS: every 5-10s with minimum delta filter)
        v
[API /api/trips/location] -> Validates driver auth, active trip & coordinate bounds
        |
        v
[PostgreSQL: bus_locations] -> Updates last known position & appends to trip track
        |
        +---> [Realtime Broadcast] ---> [Student Map Marker (Leaflet)]
        |                          ---> [Admin Fleet Overview Map]
```

## 3. Role-Based Access Control (RBAC)

1. **Admin (`role = 'admin'`)**:
   - Full read/write access across all fleet entities, routes, drivers, stops, complaints, and audit logs.
   - Capability to seed, reset, and reassign vehicles and drivers.
2. **Driver (`role = 'driver'`)**:
   - Access only to assigned bus, active trip route, and assigned stops.
   - Capability to transmit GPS coordinates, toggle trip state (Start / Park / Resume / End), and report complaints.
3. **Student (`role = 'student'`)**:
   - Access to search all public active routes and buses.
   - Single active bus selection state.
   - Read-only access to live GPS and timetable information.
   - Capability to lodge complaints and receive personal alert notifications.
