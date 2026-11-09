# BusTrack Database Schema Specification

The database utilizes PostgreSQL with 15 normalized relational tables, strict foreign keys, timestamp auditing, and Row Level Security.

## Entity Relationship Overview

1. **`profiles`**: Extended auth user profiles.
   - `id` (UUID, PK, references auth.users)
   - `role` ('admin' | 'driver' | 'student')
   - `full_name` (TEXT)
   - `email` (TEXT)
   - `phone` (TEXT)
   - `status` ('active' | 'suspended')
   - `created_at`, `updated_at`

2. **`admins`**: Institutional admin details.
   - `id` (UUID, PK, references profiles.id)
   - `admin_id` (TEXT, UNIQUE) e.g., 'ADMIN001'
   - `department` (TEXT)

3. **`drivers`**: Driver details and credentials.
   - `id` (UUID, PK, references profiles.id)
   - `driver_id` (TEXT, UNIQUE) e.g., 'DRIVER001'
   - `license_number` (TEXT, UNIQUE)
   - `license_expiry` (DATE)
   - `address` (TEXT)
   - `emergency_contact` (TEXT)
   - `status` ('active' | 'inactive')

4. **`students`**: Student records.
   - `id` (UUID, PK, references profiles.id)
   - `enrollment_number` (TEXT, UNIQUE, Normalized uppercase) e.g., 'STU2026001'
   - `department` (TEXT)
   - `course_year` (TEXT)

5. **`routes`**: Bus transit routes.
   - `id` (UUID, PK)
   - `route_number` (TEXT, UNIQUE)
   - `name` (TEXT)
   - `start_point` (TEXT)
   - `end_point` (TEXT)
   - `estimated_duration_mins` (INTEGER)
   - `distance_km` (NUMERIC)
   - `is_active` (BOOLEAN)

6. **`route_stops`**: Ordered stops along a route.
   - `id` (UUID, PK)
   - `route_id` (UUID, FK -> routes.id ON DELETE CASCADE)
   - `name` (TEXT)
   - `address` (TEXT)
   - `latitude` (NUMERIC(10, 7))
   - `longitude` (NUMERIC(10, 7))
   - `sequence_order` (INTEGER)
   - `scheduled_arrival` (TIME)
   - `scheduled_departure` (TIME)
   - `waiting_mins` (INTEGER DEFAULT 2)

7. **`buses`**: Vehicle fleet assets.
   - `id` (UUID, PK)
   - `bus_number` (TEXT, UNIQUE)
   - `registration_number` (TEXT, UNIQUE)
   - `name` (TEXT)
   - `capacity` (INTEGER)
   - `bus_type` (TEXT)
   - `model` (TEXT)
   - `status` ('active' | 'maintenance' | 'retired')
   - `assigned_route_id` (UUID, FK -> routes.id)
   - `current_trip_status` ('IDLE' | 'ON_TRIP' | 'PARKED' | 'OFFLINE')
   - `selected_students_count` (INTEGER DEFAULT 0)

8. **`bus_assignments`**: Driver-to-bus allocation history.
   - `id` (UUID, PK)
   - `bus_id` (UUID, FK -> buses.id)
   - `driver_id` (UUID, FK -> drivers.id)
   - `assigned_at` (TIMESTAMPTZ)
   - `unassigned_at` (TIMESTAMPTZ, NULL if currently active)
   - `is_active` (BOOLEAN DEFAULT TRUE)
   - *Constraint:* UNIQUE (bus_id, is_active) WHERE is_active = TRUE
   - *Constraint:* UNIQUE (driver_id, is_active) WHERE is_active = TRUE

9. **`trips`**: Real-time or historical transit runs.
   - `id` (UUID, PK)
   - `bus_id` (UUID, FK -> buses.id)
   - `driver_id` (UUID, FK -> drivers.id)
   - `route_id` (UUID, FK -> routes.id)
   - `started_at` (TIMESTAMPTZ)
   - `ended_at` (TIMESTAMPTZ, NULL while active)
   - `status` ('IN_PROGRESS' | 'PARKED' | 'COMPLETED' | 'CANCELLED')
   - `current_stop_id` (UUID, FK -> route_stops.id)
   - `last_latitude` (NUMERIC(10, 7))
   - `last_longitude` (NUMERIC(10, 7))
   - `last_updated_at` (TIMESTAMPTZ)

10. **`bus_locations`**: Breadcrumb GPS history.
    - `id` (BIGSERIAL, PK)
    - `trip_id` (UUID, FK -> trips.id)
    - `bus_id` (UUID, FK -> buses.id)
    - `latitude` (NUMERIC(10, 7))
    - `longitude` (NUMERIC(10, 7))
    - `speed` (NUMERIC(5, 2))
    - `heading` (NUMERIC(5, 2))
    - `recorded_at` (TIMESTAMPTZ DEFAULT NOW())

11. **`student_bus_selections`**: One active bus selection per student.
    - `id` (UUID, PK)
    - `student_id` (UUID, FK -> students.id)
    - `bus_id` (UUID, FK -> buses.id)
    - `route_id` (UUID, FK -> routes.id)
    - `selected_at` (TIMESTAMPTZ DEFAULT NOW())
    - `is_active` (BOOLEAN DEFAULT TRUE)
    - *Constraint:* UNIQUE (student_id, is_active) WHERE is_active = TRUE

12. **`notifications`**: Personalized broadcast alerts.
    - `id` (UUID, PK)
    - `user_id` (UUID, FK -> profiles.id)
    - `title` (TEXT)
    - `message` (TEXT)
    - `category` ('DELAY' | 'ROUTE_CHANGE' | 'DRIVER_CHANGE' | 'BUS_PARKED' | 'TRIP_START' | 'TRIP_END' | 'COMPLAINT_UPDATE' | 'SYSTEM')
    - `related_entity_id` (UUID)
    - `is_read` (BOOLEAN DEFAULT FALSE)
    - `created_at` (TIMESTAMPTZ DEFAULT NOW())

13. **`complaints`**: Issues submitted by students/drivers.
    - `id` (UUID, PK)
    - `ticket_number` (TEXT, UNIQUE) e.g., 'CMP-1001'
    - `complainant_id` (UUID, FK -> profiles.id)
    - `bus_id` (UUID, FK -> buses.id, NULLABLE)
    - `trip_id` (UUID, FK -> trips.id, NULLABLE)
    - `subject` (TEXT)
    - `category` ('PUNCTUALITY' | 'DRIVER_BEHAVIOR' | 'CLEANLINESS' | 'BREAKDOWN' | 'APP_ISSUE' | 'OTHER')
    - `priority` ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')
    - `status` ('NEW' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED')
    - `description` (TEXT)
    - `created_at` (TIMESTAMPTZ DEFAULT NOW())

14. **`complaint_updates`**: Administrative responses & audit trail on complaints.
    - `id` (UUID, PK)
    - `complaint_id` (UUID, FK -> complaints.id ON DELETE CASCADE)
    - `responder_id` (UUID, FK -> profiles.id)
    - `internal_note` (BOOLEAN DEFAULT FALSE)
    - `status_transition` (TEXT)
    - `message` (TEXT)
    - `created_at` (TIMESTAMPTZ DEFAULT NOW())

15. **`audit_logs`**: System-wide administrative action history.
    - `id` (BIGSERIAL, PK)
    - `actor_id` (UUID, FK -> profiles.id)
    - `action` (TEXT)
    - `entity_type` (TEXT)
    - `entity_id` (TEXT)
    - `metadata` (JSONB)
    - `created_at` (TIMESTAMPTZ DEFAULT NOW())
