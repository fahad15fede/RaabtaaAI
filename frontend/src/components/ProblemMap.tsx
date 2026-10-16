import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NearbyProblem } from '../services/api';
import { api } from '../services/api';
import { toast } from 'sonner';

interface ProblemMapProps {
  centerLat: number;
  centerLng: number;
  problems: NearbyProblem[];
  onSupportSuccess?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  sewage: '#DC2626',       // Red
  garbage: '#EA580C',      // Orange
  water_supply: '#2563EB', // Blue
  road_damage: '#D97706',  // Amber
  street_lighting: '#CA8A04', // Yellow
  other: '#059669'         // Green
};

export const ProblemMap: React.FC<ProblemMapProps> = ({ centerLat, centerLng, problems, onSupportSuccess }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([centerLat, centerLng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap.current);
    } else {
      leafletMap.current.setView([centerLat, centerLng], 14);
    }

    const map = leafletMap.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add 2000m radius circle around user location
    L.circle([centerLat, centerLng], {
      radius: 2000,
      color: '#006600',
      fillColor: '#006600',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '4, 6'
    }).addTo(map);

    // Add current user area center marker
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `<div style="background-color:#006600; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,102,0,0.5);"></div>`,
      iconSize: [16, 16]
    });
    L.marker([centerLat, centerLng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>Your Civic Location</b><br/>Selected Area Center (2000m Radius)');

    // Add problem markers
    problems.forEach((p) => {
      const pLat = p.location?.latitude || centerLat + (Math.random() - 0.5) * 0.01;
      const pLng = p.location?.longitude || centerLng + (Math.random() - 0.5) * 0.01;
      const color = CATEGORY_COLORS[p.category] || CATEGORY_COLORS.other;

      const markerIcon = L.divIcon({
        className: 'problem-marker',
        html: `
          <div style="
            background-color: ${color};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">
            ${p.category.replace('_', ' ').toUpperCase()} • ${p.distance_m || Math.round(p.distance_km * 1000)}m
          </div>
        `,
        iconSize: [100, 24]
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'space-y-2 p-1 text-xs font-sans text-gray-800';
      popupContent.innerHTML = `
        <div style="font-weight:bold; font-size:13px; color:#111; text-transform:capitalize;">
          ${p.category.replace('_', ' ')}
        </div>
        <div style="font-size:11px; color:#4b5563;">
          ${p.description}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-weight:600; font-size:10px; color:#6b7280;">
          <span>Distance: ${p.distance_km} km</span>
          <span style="background:#e5e7eb; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${p.status}</span>
        </div>
        <div style="font-size:10px; color:#059669; font-weight:bold; margin-top:2px;">
          👥 ${p.report_count} residents affected / supporting
        </div>
        <button id="btn-support-${p.id}" style="
          width: 100%;
          margin-top: 6px;
          background-color: #006600;
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
          font-weight: 600;
          font-size: 11px;
          cursor: pointer;
        ">
          + Support This Report
        </button>
      `;

      const marker = L.marker([pLat, pLng], { icon: markerIcon }).addTo(map);
      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-support-${p.id}`);
        if (btn) {
          btn.onclick = async () => {
            try {
              const res = await api.supportComplaint(p.id);
              toast.success(res.message || 'Thank you for supporting this report!');
              if (onSupportSuccess) onSupportSuccess();
              map.closePopup();
            } catch (err: any) {
              toast.error(err.message || 'Could not support report');
            }
          };
        }
      });
    });
  }, [centerLat, centerLng, problems]);

  return (
    <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
