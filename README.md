# BusTrack — Smart Bus Management & Live Tracking System

BusTrack is an enterprise-grade, modern, responsive, real-time Bus Management & Live Tracking platform designed for institutional transit (colleges, universities, and industrial campuses).

It unifies **Administrators**, **Bus Drivers**, and **Students** around a synchronized telemetry pipeline, offering live vehicle tracking, stop schedule progression, passenger bus selections, notification broadcasts, and incident complaint resolution.

---

## 🚀 Live Demo & Quick Evaluation

The application includes a persistent **Demo Console Banner** at the top with a **1-click Role Switcher** and a **Live GPS Simulator**:

| Role | Identifier | Password | Description |
| :--- | :--- | :--- | :--- |
| **Administrator** | `ADMIN001` | `Admin@123` | Full fleet oversight, route stop editor, driver allocation, and complaints desk |
| **Bus Driver** | `DRIVER001` | `Driver@123` | Mobile-first cockpit: start/park/end trip, live GPS broadcast, stop sequence |
| **Student Commuter** | `STU2026001` | `Student@123` | Dual bus search, single active bus selection, Rapido map, Where-Is-My-Train |

> **Auto-fill in UI:** On the [`/login`](http://localhost:3000/login) page, click any of the three role buttons to automatically populate demo credentials.

---

## 🛠 Technology Stack

- **Framework:** Next.js (App Router, Server Actions, Dynamic Client Components)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS & PostCSS
- **Maps & Telemetry:** Leaflet, OpenStreetMap Tile Providers, HTML5 Geolocation API
- **Icons:** Lucide React
- **Database & Realtime:** PostgreSQL schema with Supabase JS client + Resilient reactive in-memory/localStorage fallback for instant zero-configuration local runs

---

## 📱 Role-Based Portals & Key Capabilities

### 1. 🛡 Admin Dashboard (`/admin/*`)
- **Fleet Command Overview (`/admin/dashboard`):** Real-time operational metrics (total, active, parked, idle buses, drivers, enrolled students, complaint triage) and fleet-wide live map.
- **Fleet Asset Directory (`/admin/buses`):** Add vehicles, search by plate/number, filter by live status.
- **Dedicated Bus Telemetry (`/admin/buses/[id]`):** Speed gauges, last GPS ping, passenger follower count, driver reallocation with automatic passenger notification and audit trail.
- **Driver Roster (`/admin/drivers`):** Commercial license tracking, bus assignments, account creation, and password resets.
- **Route & Timetable Network (`/admin/routes`):** Interactive stop editor (`/admin/routes/[id]`), drag/move stop sequences, modify arrival/departure times, and Leaflet polyline preview.
- **Student Commuter Directory (`/admin/students`):** Search by enrollment number/name, filter by followed bus, review department distributions.
- **Complaints Resolution Desk (`/admin/complaints`):** Triage grievances, post internal dispatch notes, send replies to commuters, transition ticket status (NEW &rarr; IN_PROGRESS &rarr; RESOLVED).
- **System Audit Logs (`/admin/audit-logs`):** Tamper-evident ledger of administrative and operational actions.
- **Governance (`/admin/settings`):** Delegate administrator accounts with permanent super-admin protection.

### 2. 🚌 Bus Driver Console (`/driver/*`)
- **Mobile-First Cockpit (`/driver/dashboard`):** Streamlined for vehicle phone mounts.
- **Live Trip Control (`/driver/trip`):**
  - **Start Trip:** Verifies GPS permission, acquires coordinate fix, transitions bus to `ON_TRIP`, and streams coordinates.
  - **Park Bus:** Distinct layover status saving parking coordinates and alerting passengers.
  - **Resume Trip:** Resumes active journey back to `ON_TRIP`.
  - **Conclude Trip:** Finalizes trip, records completion timestamp, and sets status to `IDLE`.
- **Route Timetable (`/driver/route`):** Where-Is-My-Train stop progression with scheduled timings.
- **Vehicle Specifications (`/driver/bus`):** Assigned vehicle parameters, capacity, and operational notes.
- **Incident Reports (`/driver/complaints`):** Report mechanical breakdowns or road hazards.
- **Driver Security (`/driver/profile`):** Secure password update requiring previous password verification.

### 3. 🎓 Student Commuter App (`/student/*`)
- **Commute Hub (`/student/dashboard`):** Live followed shuttle status, next scheduled stop, driver contact, and passenger count.
- **Dual-Method Search (`/student/search`):**
  - *Method 1:* Search by bus number or name.
  - *Method 2:* Search by pickup stop or landmark with instant suggestions.
  - *Bus Selection:* Enforces one active bus per student, atomic follower count updates, safe swap confirmation, and removal option.
- **Rapido-Style Live Tracker (`/student/map`):** Leaflet live tracking map with smooth pulse markers, stale GPS warning (> 90s), and Google Maps external navigation link.
- **Where-Is-My-Train Timeline (`/student/route`):** Visual stop timeline distinguishing passed, next, and upcoming stops.
- **Alert Inbox (`/student/notifications`):** In-app notices for departures, delays, schedule updates, and complaint responses.
- **Support Desk (`/student/complaints`):** Submit service feedback and receive staff replies.
- **Student Profile (`/student/profile`):** Registered enrollment record and credential change.

---

## 🗄 Database Architecture

The system is backed by a 15-entity normalized PostgreSQL relational schema (`supabase/schema.sql`):

1. `profiles`: Extended user accounts with role authorization.
2. `admins`: Administrative authority records.
3. `drivers`: Commercial driver licenses, expiration dates, emergency contacts.
4. `students`: Unique uppercase normalized enrollment numbers (`STU...`), department, year.
5. `routes`: Transit corridors, start/end points, estimated duration, distance.
6. `route_stops`: Ordered stops, latitude/longitude waypoints, scheduled arrival/departure.
7. `buses`: Unique bus numbers, license plates, seating capacity, trip status.
8. `bus_assignments`: Driver-to-bus allocations (strictly enforced 1:1 active constraints).
9. `trips`: Historical transit runs, start/end timestamps, current stop linkage.
10. `bus_locations`: GPS coordinate breadcrumb stream (lat, lng, speed, heading).
11. `student_bus_selections`: Single active bus selection per student.
12. `notifications`: Personal alerts (delay, route change, driver change, complaint update).
13. `complaints`: Grievance tickets with category and priority.
14. `complaint_updates`: Administrative replies and internal notes.
15. `audit_logs`: Tamper-evident ledger of administrative and operational actions.

---

## 💻 Local Installation & Setup

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Clone & Install Dependencies
```bash
cd bus2
npm install
```

### 2. Configure Environment Variables (Optional for Supabase Cloud)
Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
> **Zero-Setup Mode:** If Supabase credentials are not provided, BusTrack automatically boots into the high-fidelity local reactive store pre-seeded with realistic data, allowing full evaluation immediately out of the box.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ☁️ Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. (Optional) Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Environment Variables.
4. Click **Deploy**. Next.js App Router will generate all 31 static and dynamic pages automatically.

---

## 🔒 Security & Data Integrity

- **Enrollment Number Uniqueness:** Normalized uppercase with duplicate rejection in database and store layers.
- **Role Verification:** Protected dashboard routes with client & server-side `RoleGuard` verification.
- **Password Security:** Salted hashes in production Supabase Auth; verification of previous password before updating.
- **Stale Telemetry Safeguards:** Stale GPS indicators (> 90 seconds) prevent misleading passengers when a driver device loses signal.
