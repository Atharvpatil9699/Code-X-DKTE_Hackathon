import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Complaint, IssueCategory, SeverityLevel } from '../types';
import {
  MapPin,
  Filter,
  Layers,
  Sparkles,
  LocateFixed,
  ChevronRight,
  ShieldAlert,
  Clock,
} from 'lucide-react';

declare const L: any;

export const CivicMapView: React.FC = () => {
  const { setSelectedComplaintId, refreshTrigger } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/complaints');
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [refreshTrigger]);

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const matchCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchSev = selectedSeverity === 'ALL' || c.severity === selectedSeverity;
    const matchStat =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ACTIVE' && !['CLOSED', 'RESOLVED'].includes(c.status)) ||
      (selectedStatus === 'RESOLVED' && ['CLOSED', 'RESOLVED', 'CITIZEN_VERIFICATION'].includes(c.status));
    return matchCat && matchSev && matchStat;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || typeof L === 'undefined') return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([18.5204, 73.8567], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
    }
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || typeof L === 'undefined') return;

    markersLayerRef.current.clearLayers();

    filtered.forEach((c) => {
      const isCritical = c.severity === 'CRITICAL';
      const isHigh = c.severity === 'HIGH';

      const color = isCritical ? '#dc2626' : isHigh ? '#ea580c' : c.severity === 'MEDIUM' ? '#d97706' : '#10b981';

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-civic-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
            border: 2px solid white;
            ${isCritical ? 'animation: pulse 1.5s infinite;' : ''}
          ">
            ${isCritical ? '!' : '●'}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([c.latitude, c.longitude], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-xs space-y-1.5';
      popupContent.innerHTML = `
        <div class="font-bold text-slate-900">${c.complaintNumber}</div>
        <div class="text-slate-800 font-semibold">${c.issueType}</div>
        <div class="text-slate-500">${c.address}</div>
        <div class="flex items-center gap-1.5 mt-1">
          <span style="background:${color}; color:white; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">
            ${c.severity}
          </span>
          <span style="background:#e2e8f0; color:#334155; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">
            ${c.status.replace('_', ' ')}
          </span>
        </div>
      `;

      const inspectBtn = document.createElement('button');
      inspectBtn.innerText = 'Inspect Ticket Details →';
      inspectBtn.className =
        'mt-2 w-full py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px] cursor-pointer text-center';
      inspectBtn.onclick = () => {
        setSelectedComplaintId(c.id);
      };
      popupContent.appendChild(inspectBtn);

      marker.bindPopup(popupContent);
      markersLayerRef.current.addLayer(marker);
    });
  }, [filtered, setSelectedComplaintId]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapInstanceRef.current.setView([pos.coords.latitude, pos.coords.longitude], 15);
    });
  };

  return (
    <div className="space-y-4">
      {/* Map Control Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Live Civic GIS Issue Map
          </h2>
          <p className="text-xs text-slate-500">
            Real-time geolocation pins of citizen defects across municipal wards ({filtered.length} visible)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Road">Roads</option>
            <option value="Garbage">Solid Waste / Garbage</option>
            <option value="Streetlight">Streetlights</option>
            <option value="Water">Water Supply</option>
            <option value="Drainage">Drainage</option>
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="ALL">All Records</option>
            <option value="ACTIVE">Active Unresolved</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>

          <button
            onClick={handleLocateMe}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Pan map to your current GPS position"
          >
            <LocateFixed className="w-4 h-4" />
            Locate Me
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md h-[600px] w-full z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs z-10 space-y-1.5">
          <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Severity Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
            <span>Critical Hazard (6h SLA)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span>High Severity (24h SLA)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Medium (48h SLA)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Low (72h SLA)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
