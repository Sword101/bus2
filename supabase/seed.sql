-- ====================================================================
-- BusTrack: Initial Database Seed
-- Standard Demo Accounts, Buses, Routes, Stops, and Complaints
-- ====================================================================

-- 1. Profiles & Role Entities
-- Admin: ADMIN001
INSERT INTO public.profiles (id, role, full_name, email, phone, status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'admin', 'System Administrator', 'admin@bustrack.local', '+1 (555) 019-2831', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admins (id, admin_id, department)
VALUES ('a0000000-0000-0000-0000-000000000001', 'ADMIN001', 'Transit Operations Authority')
ON CONFLICT (id) DO NOTHING;

-- Drivers: DRIVER001 & DRIVER002
INSERT INTO public.profiles (id, role, full_name, email, phone, status)
VALUES 
('d0000000-0000-0000-0000-000000000001', 'driver', 'Robert Vance', 'driver1@bustrack.local', '+1 (555) 014-9921', 'active'),
('d0000000-0000-0000-0000-000000000002', 'driver', 'Marcus Sterling', 'driver2@bustrack.local', '+1 (555) 018-7744', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.drivers (id, driver_id, license_number, license_expiry, address, emergency_contact, status)
VALUES 
('d0000000-0000-0000-0000-000000000001', 'DRIVER001', 'DL-98214-COMM', '2028-12-31', '742 Evergreen Terrace, Springfield', '+1 (555) 012-3456', 'active'),
('d0000000-0000-0000-0000-000000000002', 'DRIVER002', 'DL-55412-COMM', '2027-08-15', '128 Pine Hollow Rd, Oakridge', '+1 (555) 012-7890', 'active')
ON CONFLICT (id) DO NOTHING;

-- Students: STU2026001, STU2026002, STU2026003
INSERT INTO public.profiles (id, role, full_name, email, phone, status)
VALUES 
('s0000000-0000-0000-0000-000000000001', 'student', 'Alex Rivera', 'student1@bustrack.local', '+1 (555) 011-4455', 'active'),
('s0000000-0000-0000-0000-000000000002', 'student', 'Sophia Chen', 'student2@bustrack.local', '+1 (555) 011-8899', 'active'),
('s0000000-0000-0000-0000-000000000003', 'student', 'Ethan Walker', 'student3@bustrack.local', '+1 (555) 011-3322', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.students (id, enrollment_number, department, course_year)
VALUES 
('s0000000-0000-0000-0000-000000000001', 'STU2026001', 'Computer Science & Engineering', '3rd Year'),
('s0000000-0000-0000-0000-000000000002', 'STU2026002', 'Electronics & Communications', '2nd Year'),
('s0000000-0000-0000-0000-000000000003', 'STU2026003', 'Mechanical Engineering', '4th Year')
ON CONFLICT (id) DO NOTHING;

-- 2. Routes (Bhopal Metro & Institutional Transit)
INSERT INTO public.routes (id, route_number, name, start_point, end_point, estimated_duration_mins, distance_km, is_active)
VALUES 
('r0000000-0000-0000-0000-000000000001', 'RT-101', 'Bhopal Junction to MANIT Tech Corridor', 'Bhopal Junction Railway Station', 'MANIT Bhopal Campus', 45, 14.8, true),
('r0000000-0000-0000-0000-000000000002', 'RT-102', 'Rani Kamlapati to AIIMS Campus Shuttle', 'Rani Kamlapati Railway Station', 'AIIMS Bhopal Campus', 35, 9.6, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Route Stops for Route 101 (Bhopal)
INSERT INTO public.route_stops (id, route_id, name, address, latitude, longitude, sequence_order, scheduled_arrival, scheduled_departure, waiting_mins)
VALUES 
('rs000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000001', 'Bhopal Junction Railway Station (Start)', 'Platform 1 Main Gate, Station Road, Old Bhopal', 23.2694, 77.4126, 1, '07:30:00', '07:35:00', 5),
('rs000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0000-000000000001', 'New Market (TT Nagar Plaza)', 'Malviya Nagar, TT Nagar Circle, Bhopal', 23.2361, 77.3994, 2, '07:48:00', '07:50:00', 2),
('rs000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0000-000000000001', 'MP Nagar Zone-1 (DB City Mall)', 'Hoshangabad Road, MP Nagar, Bhopal', 23.2332, 77.4332, 3, '08:02:00', '08:05:00', 3),
('rs000000-0000-0000-0000-000000000004', 'r0000000-0000-0000-0000-000000000001', 'Link Road 3 Crossing', 'Near Kali Mata Temple, Link Road 3, Bhopal', 23.2240, 77.4180, 4, '08:15:00', '08:17:00', 2),
('rs000000-0000-0000-0000-000000000005', 'r0000000-0000-0000-0000-000000000001', 'MANIT Bhopal Campus (End)', 'Main Academic Gate, Link Road 3, Bhopal', 23.2163, 77.4067, 5, '08:25:00', '08:30:00', 5)
ON CONFLICT (id) DO NOTHING;

-- Route Stops for Route 102 (Bhopal)
INSERT INTO public.route_stops (id, route_id, name, address, latitude, longitude, sequence_order, scheduled_arrival, scheduled_departure, waiting_mins)
VALUES 
('rs000000-0000-0000-0000-000000000006', 'r0000000-0000-0000-0000-000000000002', 'Rani Kamlapati Railway Station (Start)', 'Platform 1 Terminus, Habibganj, Bhopal', 23.2144, 77.4379, 1, '07:40:00', '07:45:00', 5),
('rs000000-0000-0000-0000-000000000007', 'r0000000-0000-0000-0000-000000000002', 'Shahpura Lake Bus Stop', 'Rohit Nagar / Kolar Road Junction, Bhopal', 23.1950, 77.4270, 2, '07:55:00', '07:57:00', 2),
('rs000000-0000-0000-0000-000000000008', 'r0000000-0000-0000-0000-000000000002', 'Saket Nagar Sector 3', 'Near Subhash Higher Secondary, Saket Nagar, Bhopal', 23.2010, 77.4480, 3, '08:08:00', '08:10:00', 2),
('rs000000-0000-0000-0000-000000000009', 'r0000000-0000-0000-0000-000000000002', 'AIIMS Bhopal Campus (End)', 'Outpatient & Main Hospital Gate, Saket Nagar, Bhopal', 23.2069, 77.4600, 4, '08:20:00', '08:25:00', 5)
ON CONFLICT (id) DO NOTHING;

-- 4. Buses
INSERT INTO public.buses (id, bus_number, registration_number, name, capacity, bus_type, model, status, assigned_route_id, current_trip_status, selected_students_count, description)
VALUES 
('b0000000-0000-0000-0000-000000000001', 'BUS-101', 'MP-04-AB-1001', 'Bhopal North Cruiser', 45, 'Air Conditioned Deluxe', 'Tata Starbus Ultra 2024', 'active', 'r0000000-0000-0000-0000-000000000001', 'ON_TRIP', 18, 'Primary morning and evening shuttle connecting Bhopal Junction, MP Nagar, and MANIT'),
('b0000000-0000-0000-0000-000000000002', 'BUS-102', 'MP-04-CD-1002', 'Lake City Express', 40, 'Standard Coach', 'Ashok Leyland Falcon 2023', 'active', 'r0000000-0000-0000-0000-000000000002', 'IDLE', 12, 'Southern Bhopal corridor connecting Rani Kamlapati and AIIMS'),
('b0000000-0000-0000-0000-000000000003', 'BUS-103', 'MP-04-EF-1003', 'Bhopal Reserve Shuttle', 35, 'Mini Bus', 'Force Traveller City 2024', 'active', NULL, 'PARKED', 0, 'Spare fleet vehicle on standby at central Bhopal transit depot')
ON CONFLICT (id) DO NOTHING;

-- 5. Bus Assignments
INSERT INTO public.bus_assignments (id, bus_id, driver_id, assigned_at, is_active)
VALUES 
('ba000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NOW(), true),
('ba000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', NOW(), true)
ON CONFLICT (id) DO NOTHING;

-- 6. Student Bus Selection
INSERT INTO public.student_bus_selections (id, student_id, bus_id, route_id, selected_at, is_active)
VALUES 
('sb000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000001', NOW(), true)
ON CONFLICT (id) DO NOTHING;
