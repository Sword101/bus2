# BusTrack - Known Issues & Mitigation Log

## 1. Browser Geolocation Background Throttling
- **Issue:** Modern mobile browsers (iOS Safari, Android Chrome) pause or throttle `watchPosition()` updates when the browser tab is minimized or the screen turns off.
- **Mitigation:** The system displays a clear operational advisory banner for drivers recommending to keep the screen active while on an active trip. The backend detects when coordinates become stale (> 60 seconds without update) and displays a "GPS Stale / Reconnecting" indicator on student and admin maps instead of misleading users with false real-time claims.

## 2. Leaflet SSR in Next.js App Router
- **Issue:** Leaflet relies on the browser `window` and `navigator` objects, causing runtime crashes if imported statically during Server-Side Rendering (SSR).
- **Mitigation:** All Leaflet map components are loaded dynamically with `{ ssr: false }` or encapsulated within client-only guards with clean skeleton loading placeholders.

## 3. Offline / Local Demo Resilience
- **Issue:** When running in local evaluation without a live Supabase project configured with `NEXT_PUBLIC_SUPABASE_URL`, real-time remote connections would fail.
- **Mitigation:** Built a seamless hybrid storage adapter. If live Supabase credentials are provided in `.env.local`, BusTrack talks directly to Supabase cloud PostgreSQL & Realtime. If not provided or disconnected, BusTrack operates with full transactional in-memory / persistent mock storage seeded with realistic data, ensuring 100% functionality out of the box with zero setup friction.
