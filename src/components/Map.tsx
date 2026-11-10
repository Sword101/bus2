'use client';

import React, { useEffect, useRef } from 'react';
import { Bus, RouteStop } from '@/types';
import { ExternalLink, Navigation } from 'lucide-react';
import { BHOPAL_CENTER, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/geo-config';

interface MapProps {
  bus?: Bus;
  stops?: RouteStop[];
  allBuses?: Bus[];
  selectedStopId?: string;
  onSelectStop?: (stop: RouteStop) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

export default function Map({
  bus,
  stops = [],
  allBuses = [],
  selectedStopId,
  onSelectStop,
  height = '480px',
  zoom = DEFAULT_MAP_ZOOM,
  center,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const onSelectStopRef = useRef(onSelectStop);
  onSelectStopRef.current = onSelectStop;

  // Compute map center prioritizing center prop, live GPS, stops, and Bhopal default
  const targetLat = center
    ? center[0]
    : bus?.currentLatitude || (stops.length > 0 ? stops[0].latitude : BHOPAL_CENTER.lat);
  const targetLng = center
    ? center[1]
    : bus?.currentLongitude || (stops.length > 0 ? stops[0].longitude : BHOPAL_CENTER.lng);

  // Clean unmount on destroy
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically load Leaflet on client side
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current) {
        // Double check container hasn't already been initialized
        if ((mapContainerRef.current as any)._leaflet_id) {
          (mapContainerRef.current as any)._leaflet_id = undefined;
        }

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([targetLat, targetLng], zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        mapInstanceRef.current = map;
      } else {
        // If bus is on an active trip, smoothly follow bus coordinates
        if (bus?.currentLatitude && bus?.currentLongitude) {
          mapInstanceRef.current.panTo([bus.currentLatitude, bus.currentLongitude], {
            animate: true,
            duration: 0.8,
          });
        }
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers & polylines
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      // 1. Draw Route Stops & Polyline
      if (stops && stops.length > 0) {
        const sortedStops = [...stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
        const latLngs = sortedStops.map((s) => [s.latitude, s.longitude] as [number, number]);

        // Polyline connecting stops
        polylineRef.current = L.polyline(latLngs, {
          color: '#2563eb',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 6',
        }).addTo(map);

        sortedStops.forEach((stop, index) => {
          const isSelected = stop.id === selectedStopId;
          const isTerminal = index === 0 || index === sortedStops.length - 1;

          // Custom Stop Icon
          const stopIcon = L.divIcon({
            className: 'custom-stop-marker',
            html: `
              <div style="
                background-color: ${isSelected ? '#ef4444' : isTerminal ? '#1e293b' : '#3b82f6'};
                color: #ffffff;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 11px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">
                ${stop.sequenceOrder}
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon }).addTo(map);

          marker.bindPopup(`
            <div style="min-width: 170px; font-family: sans-serif;">
              <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
                #${stop.sequenceOrder} ${stop.name}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${stop.address}</div>
              <div style="font-size: 11px; background: #f1f5f9; padding: 4px 6px; border-radius: 4px; display: inline-block;">
                Arrival: <strong>${stop.scheduledArrival}</strong> | Departure: <strong>${stop.scheduledDeparture}</strong>
              </div>
            </div>
          `);

          marker.on('click', () => {
            if (onSelectStopRef.current) onSelectStopRef.current(stop);
          });

          markersRef.current.push(marker);
        });
      }

      // 2. Draw Buses (Single or All)
      const busesToRender = bus ? [bus] : allBuses;

      busesToRender.forEach((b) => {
        if (!b.currentLatitude || !b.currentLongitude) return;

        const isParked = b.currentTripStatus === 'PARKED';
        const isOnTrip = b.currentTripStatus === 'ON_TRIP';

        const colorBg = isParked ? '#f59e0b' : isOnTrip ? '#10b981' : '#64748b';

        // Check if GPS is stale (> 2 mins old)
        const isStale = b.lastGpsUpdate
          ? Date.now() - new Date(b.lastGpsUpdate).getTime() > 120000
          : false;

        const busIcon = L.divIcon({
          className: 'custom-bus-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              ${isOnTrip && !isStale ? '<div class="bus-marker-pulse" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: rgba(16, 185, 129, 0.4);"></div>' : ''}
              <div style="
                background-color: ${colorBg};
                color: #ffffff;
                width: 36px;
                height: 36px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                position: relative;
                z-index: 10;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 6v6"></path>
                  <path d="M15 6v6"></path>
                  <path d="M2 12h19.6"></path>
                  <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.6 19 6 17.8 6H5.2C4 6 2.9 6.6 2.6 7.8L1.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
                  <circle cx="7" cy="18" r="2"></circle>
                  <circle cx="16" cy="18" r="2"></circle>
                </svg>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([b.currentLatitude, b.currentLongitude], { icon: busIcon }).addTo(map);

        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${b.currentLatitude},${b.currentLongitude}`;

        marker.bindPopup(`
          <div style="min-width: 190px; font-family: sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 14px; color: #0f172a;">${b.busNumber}</span>
              <span style="
                background: ${colorBg};
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 9999px;
              ">
                ${isParked ? 'PARKED' : isOnTrip ? (isStale ? 'GPS STALE' : 'LIVE ON TRIP') : 'IDLE'}
              </span>
            </div>
            <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">${b.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
              Speed: <strong>${b.speed || 0} km/h</strong> | Students: <strong>${b.selectedStudentsCount || 0}</strong>
            </div>
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              font-size: 11px;
              color: #2563eb;
              text-decoration: none;
              font-weight: 600;
            ">
              Open in Google Maps &rarr;
            </a>
          </div>
        `);

        markersRef.current.push(marker);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [bus?.id, bus?.currentLatitude, bus?.currentLongitude, bus?.currentTripStatus, stops, allBuses, selectedStopId, targetLat, targetLng, zoom]);

  const externalMapLink = bus?.currentLatitude && bus?.currentLongitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${bus.currentLatitude},${bus.currentLongitude}`
    : null;

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height }} />

      {/* External Map floating action */}
      {externalMapLink && (
        <a
          href={externalMapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/95 text-slate-800 rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          <span>Google Maps</span>
        </a>
      )}

      {/* Real-time Status Overlay Badge */}
      {bus && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2 text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              bus.currentTripStatus === 'ON_TRIP'
                ? 'bg-emerald-500 animate-pulse'
                : bus.currentTripStatus === 'PARKED'
                ? 'bg-amber-500'
                : 'bg-slate-400'
            }`}
          />
          <span className="font-semibold text-slate-800">{bus.busNumber}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 capitalize">
            {bus.currentTripStatus === 'ON_TRIP'
              ? `Live • ${bus.speed || 0} km/h`
              : bus.currentTripStatus === 'PARKED'
              ? 'Parked / Layover'
              : 'Idle'}
          </span>
        </div>
      )}
    </div>
  );
}