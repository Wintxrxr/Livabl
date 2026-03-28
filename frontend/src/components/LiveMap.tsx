import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Neighborhood } from '../types';
import { getScoreColor } from '../utils';
import { fetchNeighbourhoodBoundaries, type OsmPolygon } from '../api/overpass';

interface LiveMapProps {
  neighborhoods: Neighborhood[];
  selected: Neighborhood | null;
  onSelect: (n: Neighborhood) => void;
}

function getWardColor(score: number): string {
  if (score >= 68) return '#16a34a';
  if (score >= 45) return '#d97706';
  return '#dc2626';
}

export default function LiveMap({ neighborhoods, selected, onSelect }: LiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polygonsRef = useRef<L.Polygon[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [wardsLoaded, setWardsLoaded] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 11,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Draw real Delhi ward boundaries
  useEffect(() => {
    const map = mapRef.current;
    if (!map || wardsLoaded) return;

    let cancelled = false;

    fetchNeighbourhoodBoundaries()
      .then((wards: OsmPolygon[]) => {
        if (cancelled) return;

        polygonsRef.current.forEach((p) => p.remove());
        polygonsRef.current = [];

        wards.forEach((ward) => {
          const color = getWardColor(ward.score);
          ward.coordinates.forEach((ring) => {
            if (ring.length < 3) return;
            const polygon = L.polygon(ring, {
              color,
              fillColor: color,
              fillOpacity: 0.12,
              weight: 0.8,
              opacity: 0.5,
            });

            polygon.bindTooltip(
              `<div style="font-family:'DM Sans',sans-serif;font-size:12px;min-width:140px;">
                <div style="font-weight:600;margin-bottom:4px;">${ward.name}</div>
                <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                  <span style="color:#6b6b64;">Livability</span>
                  <span style="font-family:'DM Mono',monospace;color:${color};">${ward.score}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                  <span style="color:#6b6b64;">Healthcare</span>
                  <span style="font-family:'DM Mono',monospace;">${ward.hospital_score}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                  <span style="color:#6b6b64;">Education</span>
                  <span style="font-family:'DM Mono',monospace;">${ward.school_score}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:#6b6b64;">Pollution</span>
                  <span style="font-family:'DM Mono',monospace;">${ward.pollution_score}</span>
                </div>
              </div>`,
              { sticky: true, opacity: 0.97 }
            );

            polygon.addTo(map);
            polygonsRef.current.push(polygon);
          });
        });

        setWardsLoaded(true);
      })
      .catch((err) => {
        console.warn("[Wards] Failed to draw ward boundaries:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [wardsLoaded]);

  // Add score pins for our key neighborhoods
  useEffect(() => {
    const map = mapRef.current;
    if (!map || neighborhoods.length === 0) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    neighborhoods.forEach((n) => {
      const color = getScoreColor(n.score);
      const isSelected = selected?.id === n.id;

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: ${isSelected ? 40 : 30}px;
          height: ${isSelected ? 40 : 30}px;
          border-radius: 50%;
          background: ${isSelected ? '#1a1a18' : color};
          border: 2.5px solid white;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: ${isSelected ? 12 : 10}px;
          font-weight: 500; color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">${n.score}</div>`,
        iconSize: [isSelected ? 40 : 30, isSelected ? 40 : 30],
        iconAnchor: [isSelected ? 20 : 15, isSelected ? 20 : 15],
      });

      const marker = L.marker([n.coordinates.lat, n.coordinates.lng], {
        icon, zIndexOffset: 1000,
      });

      marker.bindPopup(L.popup({ closeButton: false, offset: [0, -12] })
        .setContent(`
          <div style="font-family:'DM Sans',sans-serif;padding:4px;min-width:150px;">
            <div style="font-size:13px;font-weight:600;margin-bottom:4px;">${n.name}</div>
            <div style="font-size:11px;color:#6b6b64;margin-bottom:6px;">${n.region}</div>
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
              <span style="color:#6b6b64;">Safety</span>
              <span style="font-family:'DM Mono',monospace;">${n.breakdown.safety}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
              <span style="color:#6b6b64;">Walkability</span>
              <span style="font-family:'DM Mono',monospace;">${n.breakdown.walkability}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;">
              <span style="color:#6b6b64;">Transit</span>
              <span style="font-family:'DM Mono',monospace;">${n.breakdown.transit}</span>
            </div>
          </div>
        `));

      marker.on('mouseover', () => marker.openPopup());
      marker.on('mouseout', () => marker.closePopup());
      marker.on('click', () => onSelect(n));
      marker.addTo(map);
      markersRef.current[n.id] = marker;
    });
  }, [neighborhoods, selected, onSelect]);

  // Fly to selected neighborhood
  useEffect(() => {
    if (!mapRef.current || !selected) return;
    mapRef.current.flyTo(
      [selected.coordinates.lat, selected.coordinates.lng],
      13, { duration: 1 }
    );
  }, [selected]);

  return (
    <div className="map-area">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
