import React, { useState, useEffect, useRef } from 'react';
import { Project, RiskTier } from '@projectsetu/contracts';
import { paiseToCrores } from '@/lib/formatting';
import { 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronRight, 
  AlertTriangle, 
  Compass,
  GitBranch,
  Satellite,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface IndiaProjectMapProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject?: (projectId: string) => void;
  isPublic?: boolean;
}

declare global {
  interface Window {
    L?: any;
  }
}

interface CorridorData {
  id: string;
  name: string;
  lengthKm: number;
  type: string;
  status: string;
  coordinates: [number, number][];
}

// 5 Major National Infrastructure Corridors connecting Project Nodes
const INFRASTRUCTURE_CORRIDORS: CorridorData[] = [
  {
    id: 'corridor-katra',
    name: 'Delhi-Amritsar-Katra Strategic Expressway Corridor',
    lengthKm: 670,
    type: 'National Expressway Spine',
    status: '58.4% Physical Progress (Under Active Construction)',
    coordinates: [
      [28.6139, 77.2090], // Delhi Hub
      [29.9695, 76.8783], // Kurukshetra
      [30.3752, 76.7821], // Ambala
      [30.9010, 75.8573], // Ludhiana
      [31.3260, 75.5762], // Jalandhar
      [31.6340, 74.8723], // Amritsar
      [32.3274, 75.1275], // Pathankot
      [32.7266, 74.8570], // Jammu
      [32.9916, 74.9317]  // Katra Package 4 Viaduct
    ]
  },
  {
    id: 'corridor-wdfc',
    name: 'Western Dedicated Freight & High-Speed Transit Corridor',
    lengthKm: 1483,
    type: 'Heavy Haul Rail & Highway Alignment',
    status: '68.0% Execution (Electrified Double Line)',
    coordinates: [
      [28.6139, 77.2090], // Delhi NCR
      [27.5706, 76.6346], // Alwar
      [26.9124, 75.7873], // Jaipur
      [24.5854, 73.7125], // Udaipur
      [23.0225, 72.5714], // Ahmedabad
      [22.4707, 70.0577], // Jamnagar Coastal Port Node
      [22.3072, 73.1812], // Vadodara
      [21.1702, 72.8311], // Surat
      [19.0760, 72.8777], // JNPT / Mumbai
      [18.5204, 73.8567]  // Pune Metro Extension
    ]
  },
  {
    id: 'corridor-edfc',
    name: 'Eastern Industrial & Solar Evacuation Corridor',
    lengthKm: 1856,
    type: 'Freight Corridor & 765kV Power Grid',
    status: '74.2% Operational (Multi-Modal Logistics)',
    coordinates: [
      [28.6139, 77.2090], // Delhi
      [27.1767, 78.0081], // Agra
      [26.4499, 80.3319], // Kanpur
      [25.4358, 81.8463], // Prayagraj
      [25.3176, 82.9739], // Varanasi Healthcare & Multi-Modal Terminal
      [24.5362, 81.3037], // Rewa Ultra Mega Solar Park Substation
      [24.7955, 85.0002], // Gaya
      [23.7957, 86.4304], // Dhanbad
      [22.5726, 88.3639]  // Kolkata Port
    ]
  },
  {
    id: 'corridor-ns',
    name: 'North-South Multi-Modal National Infrastructure Spine',
    lengthKm: 2180,
    type: 'National Highway & Transit Backbone',
    status: '82.0% Completed (Corridor Widening)',
    coordinates: [
      [28.6139, 77.2090], // Delhi
      [26.2183, 78.1828], // Gwalior
      [23.2599, 77.4126], // Bhopal
      [21.1458, 79.0882], // Nagpur Central Logistics Hub
      [17.3850, 78.4867], // Hyderabad
      [12.9716, 77.5946], // Bengaluru Tech & Rail Node
      [13.0067, 80.2206]  // Chennai Adyar Basin Flood Works
    ]
  },
  {
    id: 'corridor-coastal',
    name: 'Saurashtra-Konkan Coastal Industrial & Water Corridor',
    lengthKm: 890,
    type: 'Bulk Pipeline & Highway Alignment',
    status: '49.0% Progress (Desalination & Pipeline Works)',
    coordinates: [
      [22.4707, 70.0577], // Jamnagar Coastal Terminal
      [21.6032, 69.6293], // Porbandar
      [20.9159, 70.3629], // Veraval
      [21.7645, 72.1519], // Bhavnagar
      [21.1702, 72.8311], // Surat
      [19.0760, 72.8777], // Mumbai
      [18.5204, 73.8567]  // Pune
    ]
  }
];

export const IndiaProjectMap: React.FC<IndiaProjectMapProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  isPublic = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const corridorsGroupRef = useRef<any>(null);

  const [activeProject, setActiveProject] = useState<Project | null>(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0] || null;
  });

  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | RiskTier>('all');
  const [showDarkCorridors, setShowDarkCorridors] = useState<boolean>(true);
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorData | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const [isLeafletReady, setIsLeafletReady] = useState<boolean>(false);

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    if (selectedRiskFilter === 'all') return true;
    return p.lastAssessment?.riskTier === selectedRiskFilter;
  });

  const getPinColor = (tier?: RiskTier) => {
    switch (tier) {
      case 'critical':
        return '#EF4444'; // Red 500
      case 'high':
        return '#F97316'; // Orange 500
      case 'medium':
        return '#F59E0B'; // Amber 500
      case 'low':
      default:
        return '#10B981'; // Emerald 500
    }
  };

  // 1. Initialize Leaflet Map with STRICTLY SATELLITE MAPPING
  useEffect(() => {
    let checkInterval: any = null;

    const initMap = () => {
      if (!window.L || !mapContainerRef.current) return false;

      // Clean up existing instance
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const L = window.L;

      // Center on India
      const indiaCenter: [number, number] = [22.5, 79.8];
      const map = L.map(mapContainerRef.current, {
        center: indiaCenter,
        zoom: 5,
        minZoom: 4,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        dragging: true,
        doubleClickZoom: true,
        touchZoom: true
      });

      // ONLY SATELLITE MAPPING: Esri World Imagery (High-Res Orbital Multispectral)
      // Zero API key required, zero watermarks, 100% free high-resolution satellite imagery
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
      }).addTo(map);

      // Add Semi-transparent Political Borders & National Place Labels overlay for high-definition geography
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Reference &copy; Esri',
        maxZoom: 18,
        opacity: 0.85
      }).addTo(map);

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      corridorsGroupRef.current = L.layerGroup().addTo(map);
      markersGroupRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
      setIsLeafletReady(true);

      // Invalidate size immediately and with backoff to guarantee 100% canvas coverage
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 350);
      setTimeout(() => map.invalidateSize(), 900);

      return true;
    };

    if (!initMap()) {
      checkInterval = setInterval(() => {
        if (initMap()) {
          clearInterval(checkInterval);
        }
      }, 200);
    }

    // ResizeObserver ensures canvas adapts on sidebar collapse or layout resize
    let ro: ResizeObserver | null = null;
    if (mapContainerRef.current) {
      ro = new ResizeObserver(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      });
      ro.observe(mapContainerRef.current);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (ro) ro.disconnect();
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // 2. Render Dark Line Infrastructure Corridors on Satellite Terrain
  useEffect(() => {
    if (!leafletMapRef.current || !corridorsGroupRef.current || !window.L) return;
    const L = window.L;
    const corridorsGroup = corridorsGroupRef.current;
    corridorsGroup.clearLayers();

    if (!showDarkCorridors) return;

    INFRASTRUCTURE_CORRIDORS.forEach(corridor => {
      // Outer Dark Obsidian Shadow/Casing
      const outerDarkLine = L.polyline(corridor.coordinates, {
        color: '#020617', // Deep obsidian black
        weight: 8,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
      });

      // Inner Dark Line with Cyan Radar Core
      const isSelected = selectedCorridor?.id === corridor.id;
      const innerLineColor = isSelected ? '#38BDF8' : '#0F172A'; // Obsidian slate by default, bright cyan when selected
      const innerWeight = isSelected ? 4.5 : 3.5;

      const innerLine = L.polyline(corridor.coordinates, {
        color: innerLineColor,
        weight: innerWeight,
        opacity: 0.98,
        dashArray: isSelected ? undefined : '10, 6',
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Interactive hover & click on corridor
      innerLine.on('mouseover', () => {
        innerLine.setStyle({ color: '#38BDF8', weight: 5, dashArray: undefined });
      });

      innerLine.on('mouseout', () => {
        if (selectedCorridor?.id !== corridor.id) {
          innerLine.setStyle({ color: '#0F172A', weight: 3.5, dashArray: '10, 6' });
        }
      });

      innerLine.on('click', () => {
        setSelectedCorridor(corridor);
        if (leafletMapRef.current) {
          leafletMapRef.current.fitBounds(innerLine.getBounds(), { padding: [50, 50], duration: 1.0 });
        }
      });

      // Tooltip for Dark Corridor
      innerLine.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; padding: 4px 6px; background-color: #020617; color: #F8FAFC; border: 1px solid #334155; border-radius: 8px;">
          <div style="font-weight: 800; color: #38BDF8;">${corridor.name}</div>
          <div style="color: #94A3B8; font-size: 10px; margin-top: 2px;">
            ${corridor.type} • Length: <strong>${corridor.lengthKm} km</strong>
          </div>
          <div style="font-size: 10px; font-weight: 700; color: #10B981; margin-top: 3px;">
            ${corridor.status}
          </div>
        </div>
      `, {
        direction: 'center',
        sticky: true,
        opacity: 0.98
      });

      corridorsGroup.addLayer(outerDarkLine);
      corridorsGroup.addLayer(innerLine);
    });
  }, [showDarkCorridors, selectedCorridor, isLeafletReady]);

  // 3. Render Markers with Anti-Overlap Smart Pin Cards
  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current || !window.L) return;
    const L = window.L;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    filteredProjects.forEach(proj => {
      const lat = proj.coordinates?.lat || 22.0;
      const lng = proj.coordinates?.lng || 79.0;
      const color = getPinColor(proj.lastAssessment?.riskTier);
      const isSelected = activeProject?.id === proj.id;
      const costCr = paiseToCrores(proj.currentApprovedCostPaise);
      const isExpanded = isSelected || currentZoom >= 7;

      // Smart Responsive Marker:
      // When zoomed out, renders as high-visibility orbital target pin to prevent overlap.
      // When selected or zoomed in, shows the full fixed card badge with project details.
      const customIcon = L.divIcon({
        className: 'custom-leaflet-satellite-marker',
        iconSize: isExpanded ? [150, 38] : [32, 32],
        iconAnchor: isExpanded ? [75, 19] : [16, 16],
        html: `
          <div class="relative flex items-center justify-center group cursor-pointer" style="filter: drop-shadow(0 4px 14px rgba(0,0,0,0.8));">
            <!-- Pulsing Radar Ring -->
            ${proj.lastAssessment?.riskTier === 'critical' || isSelected ? `
              <span class="absolute inline-flex w-8 h-8 rounded-full opacity-70 animate-ping pointer-events-none" style="background-color: ${color};"></span>
            ` : ''}

            ${isExpanded ? `
              <!-- Expanded Detailed Card Badge (Selected or Zoomed In) -->
              <div class="relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-200 select-none ${
                isSelected 
                  ? 'bg-slate-950 text-white ring-2 ring-blue-400 scale-105 border-blue-400' 
                  : 'bg-slate-950/95 text-slate-100 border-slate-700/80 hover:border-slate-400'
              }" style="backdrop-filter: blur(8px);">
                <span class="relative flex h-2.5 w-2.5 shrink-0">
                  <span class="inline-flex rounded-full h-2.5 w-2.5 shadow-sm" style="background-color: ${color};"></span>
                </span>
                <div class="flex flex-col text-left leading-tight min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-black text-[10px] text-blue-400 shrink-0">${proj.code.split('-')[0]}</span>
                    <span class="font-extrabold text-[11px] text-white truncate max-w-[85px]">${proj.name}</span>
                  </div>
                  <div class="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                    <span class="font-bold text-slate-200 font-mono">₹${costCr} Cr</span>
                    <span class="text-slate-600">•</span>
                    <span class="font-bold uppercase tracking-tight" style="color: ${color};">
                      ${proj.lastAssessment?.riskTier || 'Low'}
                    </span>
                  </div>
                </div>
              </div>
            ` : `
              <!-- Compact Orbital Target Pin (Prevents Overlap at National Zoom) -->
              <div class="relative w-7 h-7 rounded-full bg-slate-950/95 border-2 border-white flex items-center justify-center shadow-lg transition-transform hover:scale-125" style="border-color: ${color};">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color};"></span>
              </div>
            `}
          </div>
        `
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setActiveProject(proj);
        setSelectedCorridor(null);
        if (onSelectProject) onSelectProject(proj.id);
        leafletMapRef.current.flyTo([lat, lng], Math.max(leafletMapRef.current.getZoom(), 8), {
          duration: 0.8
        });
      });

      // Fixed Text Tooltip
      marker.bindTooltip(`
        <div style="font-family: inherit; font-size: 11px; padding: 4px 6px; background-color: #020617; color: #FFFFFF; border: 1px solid #334155; border-radius: 8px; max-width: 260px;">
          <div style="font-weight: 800; font-size: 12px; color: #FFFFFF;">${proj.name}</div>
          <div style="color: #94A3B8; font-size: 10px; margin-top: 2px;">
            ${proj.publicLocation} • <span style="font-family: monospace; font-weight: 700; color: #F8FAFC;">₹${costCr} Cr</span>
          </div>
          <div style="font-weight: 700; text-transform: uppercase; margin-top: 4px; color: ${color};">
            ${proj.lastAssessment?.riskTier || 'Low'} Risk Score (${proj.lastAssessment?.riskScore || 20}/100)
          </div>
          <div style="font-size: 10px; color: #E2E8F0; margin-top: 3px;">
            Forecast: <strong>+${proj.lastAssessment?.predictedDelayDays || 15} Days Delay</strong>
          </div>
        </div>
      `, {
        direction: 'top',
        offset: isExpanded ? [0, -18] : [0, -14],
        opacity: 0.98
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredProjects, activeProject, selectedCorridor, currentZoom, isLeafletReady]);

  // Pan to selected project
  const handleSelectFromList = (proj: Project) => {
    setActiveProject(proj);
    setSelectedCorridor(null);
    if (onSelectProject) onSelectProject(proj.id);
    if (leafletMapRef.current && proj.coordinates) {
      leafletMapRef.current.flyTo([proj.coordinates.lat, proj.coordinates.lng], 8, {
        duration: 1.0
      });
    }
  };

  const handleResetView = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([22.5, 79.8], 5, { duration: 0.8 });
    }
    setSelectedCorridor(null);
  };

  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl transition-all">
      {/* 1. Header with Satellite Mode Confirmation & Dark Line Corridors Toggle */}
      <div className="p-4 sm:px-6 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Satellite className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                National Satellite Infrastructure Radar
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Orbital Satellite Imagery (High-Res)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-resolution satellite topography with national infrastructure corridors & asset risk telemetry
            </p>
          </div>
        </div>

        {/* Controls: Dark Corridors Toggle & Risk Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dark Corridors Toggle Button */}
          <button
            onClick={() => setShowDarkCorridors(!showDarkCorridors)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              showDarkCorridors 
                ? 'bg-slate-800 text-blue-300 border-blue-400/40 shadow-xs' 
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title="Toggle National Dark Corridors (Freight & Expressway Spines)"
          >
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span>Dark Corridors ({showDarkCorridors ? 'ON' : 'OFF'})</span>
          </button>

          {/* Risk Filter Select */}
          <select
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value as any)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Tiers ({projects.length})</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* 2. Main Map Viewport & Right Intelligence Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* Map Canvas Container */}
        <div className="lg:col-span-8 relative bg-[#070E1A] overflow-hidden min-h-[520px] flex flex-col justify-end">
          {/* Leaflet DOM container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full min-h-[520px] z-10" 
            style={{ minHeight: '520px', width: '100%', height: '100%' }}
          />

          {/* Floating Zoom & Extent Reset */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-slate-800 text-white">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-px bg-slate-800 my-0.5" />
            <button
              onClick={handleResetView}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Reset View to National Extent"
              aria-label="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Dark Corridors Banner when selected */}
          {selectedCorridor && (
            <div className="absolute top-4 left-4 z-20 max-w-md bg-slate-950/95 backdrop-blur-md p-3.5 rounded-2xl border border-blue-500/40 text-white shadow-2xl space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-blue-400">
                  Active Dark Line Corridor
                </span>
                <button
                  onClick={() => setSelectedCorridor(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
              <h4 className="text-xs font-black text-white">{selectedCorridor.name}</h4>
              <p className="text-[11px] text-slate-400">{selectedCorridor.type} • Length: <strong className="text-slate-200">{selectedCorridor.lengthKm} km</strong></p>
              <p className="text-[10px] text-emerald-400 font-bold">{selectedCorridor.status}</p>
            </div>
          )}

          {/* Floating Risk Legend on Map */}
          <div className="absolute bottom-3 left-3 z-20 bg-slate-950/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-800 text-white text-[10px] flex items-center gap-3.5 shadow-2xl">
            <span className="text-slate-400 font-extrabold uppercase tracking-wider">Risk Tiers:</span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" /> Low
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" /> Medium
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" /> High
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-sm" /> Critical
            </span>
          </div>

          {/* Geodetic Standard Attribution */}
          <div className="absolute bottom-3 right-3 z-20 text-[10px] text-slate-400 font-mono bg-slate-950/90 px-2.5 py-1 rounded-xl border border-slate-800/80 backdrop-blur-md hidden sm:block">
            Esri World Imagery (High-Res Satellite) • WGS-84
          </div>
        </div>

        {/* 3. Right Intelligence Drawer (Fully Fixed Text & Telemetry) */}
        <div className="lg:col-span-4 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 flex flex-col justify-between overflow-y-auto max-h-[640px]">
          {activeProject ? (
            <div className="space-y-4">
              {/* Project Header Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                    {activeProject.sector}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {activeProject.code}
                  </span>
                </div>
                <h4 className="text-base font-black text-slate-900 leading-snug">
                  {activeProject.name}
                </h4>
                <p className="text-xs text-slate-600 flex items-start gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{activeProject.publicLocation}</span>
                </p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
                  <span>Implementing Agency:</span>
                  <strong className="text-slate-800 truncate max-w-[180px]">{activeProject.implementingAgencyName}</strong>
                </div>
              </div>

              {/* Sanctioned Cost & Risk Rating */}
              <div className="grid grid-cols-2 gap-2.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Sanctioned Cost
                  </span>
                  <span className="font-black text-slate-900 text-base mt-0.5 block font-mono">
                    ₹{paiseToCrores(activeProject.currentApprovedCostPaise)} Cr
                  </span>
                  <span className="text-[10px] text-slate-400">Approved Outlay</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    AI Risk Index
                  </span>
                  <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase mt-1 border ${
                    activeProject.lastAssessment?.riskTier === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                    activeProject.lastAssessment?.riskTier === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    activeProject.lastAssessment?.riskTier === 'medium' ? 'bg-amber-50 text-amber-800 border-amber-200' : 
                    'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {activeProject.lastAssessment?.riskTier || 'Low'} ({activeProject.lastAssessment?.riskScore || 20}/100)
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">XGBoost calibrated</span>
                </div>

                {/* Physical Progress Bar */}
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-medium">Physical Execution:</span>
                    <strong className="text-blue-700 font-mono font-bold">55.0% Complete</strong>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: '55%' }} 
                    />
                  </div>
                </div>
              </div>

              {/* Predictive Delay Alert Card (Fully Fixed Text) */}
              {activeProject.lastAssessment && (
                <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs">Delay Forecast: +{activeProject.lastAssessment.predictedDelayDays} Days</span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed break-words font-medium">
                    {activeProject.lastAssessment.topDrivers[0]?.plainLanguageSummary || 'Schedule divergence driven by prerequisite milestone and right-of-way approvals.'}
                  </p>
                </div>
              )}

              {/* Action Link Button */}
              <Link
                to={isPublic ? `/public/projects/${activeProject.id}` : `/app/projects/${activeProject.id}`}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20 group"
              >
                <span>{isPublic ? 'Open Citizen Summary' : 'Open Project Workspace'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Select any project marker on the map to inspect its spatial intelligence and risk forecast.
            </div>
          )}

          {/* Quick Project Switcher List */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              National Infrastructure Portfolio ({filteredProjects.length})
            </span>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {filteredProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectFromList(p)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                    activeProject?.id === p.id 
                      ? 'bg-blue-600 text-white font-bold shadow-xs' 
                      : 'hover:bg-slate-200/80 text-slate-700 bg-white border border-slate-200/70'
                  }`}
                >
                  <span className="truncate pr-2">{p.name}</span>
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                    style={{ backgroundColor: getPinColor(p.lastAssessment?.riskTier) }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
