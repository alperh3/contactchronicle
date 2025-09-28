'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Connection {
  [key: string]: string;
  latitude?: number;
  longitude?: number;
}

interface ConnectionMapProps {
  connections: Connection[];
  onConnectionSelect: (connection: Connection) => void;
  viewMode: 'world' | 'clusters';
}

export default function ConnectionMap({ connections, onConnectionSelect, viewMode }: ConnectionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [40.7128, -74.0060], // NYC coordinates
      zoom: 2,
      zoomControl: true,
      attributionControl: false,
    });

    // Add tile layer with dark theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    connections.forEach(connection => {
      if (connection.latitude && connection.longitude) {
        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: #F8F8F8;
              color: #04090F;
              border: 2px solid #6E6E6E;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              👤
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([connection.latitude, connection.longitude], {
          icon: customIcon
        }).addTo(mapInstanceRef.current!);

        // Add click event
        marker.on('click', () => {
          onConnectionSelect(connection);
        });

        // Add popup
        const popupContent = `
          <div style="color: #04090F; font-family: system-ui, sans-serif;">
            <strong>${connection['First Name']} ${connection['Last Name']}</strong><br>
            ${connection['Company'] || 'N/A'}<br>
            <small>${connection['Position'] || 'N/A'}</small>
          </div>
        `;
        marker.bindPopup(popupContent);

        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers
    if (connections.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [connections, onConnectionSelect]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update map view based on mode
    if (viewMode === 'world') {
      mapInstanceRef.current.setView([40.7128, -74.0060], 2);
    } else if (viewMode === 'clusters') {
      // For clusters, we could implement clustering logic here
      // For now, just zoom in a bit more
      if (connections.length > 0) {
        const group = new L.FeatureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.05));
      }
    }
  }, [viewMode, connections]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
}
