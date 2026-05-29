import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Truck, MapPin, Trash2, User } from 'lucide-react';
import { motion } from 'motion/react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createRoot, Root } from 'react-dom/client';

interface Coordinates {
  lat: number;
  lng: number;
}

interface DemoMapProps {
  userLocation?: Coordinates | null;
  driverLocation?: Coordinates | null;
  requests?: any[];
  onMarkerClick?: (request: any) => void;
  showRoute?: boolean;
  isDriverOnline?: boolean;
  showDrivers?: boolean;
  className?: string;
  interactive?: boolean;
  mode?: 'user' | 'driver' | 'admin';
}

export const DemoMap: React.FC<DemoMapProps> = ({
  userLocation,
  driverLocation,
  requests = [],
  onMarkerClick,
  showRoute = false,
  isDriverOnline = true,
  showDrivers = true,
  className = '',
  interactive = true,
  mode = 'admin',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const rootsRef = useRef<{ [key: string]: Root }>({});
  const isDestroying = useRef(false);

  const mapTilerKey = (import.meta as any).env.VITE_MAPTILER_KEY || 'JYTXU5dnRNoRktnFMzHy';
  const mapStyle = `https://api.maptiler.com/maps/streets-v4/style.json?key=${mapTilerKey}`;

  // Base coordinates for the center of our map (Jabalpur area roughly)
  const centerLat = 23.1815;
  const centerLng = 79.9864;

  // Simulated driver location state
  const [simulatedDriverLoc, setSimulatedDriverLoc] = useState<Coordinates>(
    driverLocation || { lat: centerLat, lng: centerLng }
  );
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!isDriverOnline || !showDrivers) return;

    const interval = setInterval(() => {
      setSimulatedDriverLoc(prev => {
        // Move randomly by a small amount
        const latChange = (Math.random() - 0.5) * 0.002;
        const lngChange = (Math.random() - 0.5) * 0.002;
        return {
          lat: prev.lat + latChange,
          lng: prev.lng + lngChange
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isDriverOnline]);

  // Use simulated location if online, otherwise use provided or center
  const currentDriverLoc = isDriverOnline ? simulatedDriverLoc : (driverLocation || { lat: centerLat, lng: centerLng });

  // Fallback demo requests if empty
  const displayRequests = useMemo(() => {
    if (requests && requests.length > 0) return requests;
    return [
      { id: 'demo1', name: "Ravi", lat: 23.1815, lng: 79.9864, wasteType: "Plastic", status: "Pending" },
      { id: 'demo2', name: "Aman", lat: 23.1686, lng: 79.9339, wasteType: "Organic", status: "Assigned" },
      { id: 'demo3', name: "Priya", lat: 23.1747, lng: 79.9551, wasteType: "E-Waste", status: "Completed" }
    ];
  }, [requests]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    isDestroying.current = false;
    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [centerLng, centerLat],
      zoom: 12,
      interactive: interactive
    });

    map.current = mapInstance;

    if (interactive) {
      mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
      mapInstance.addControl(new maplibregl.FullscreenControl(), 'top-right');
    }

    const onLoad = () => {
      if (!isDestroying.current) {
        setMapLoaded(true);
      }
    };

    mapInstance.on('load', onLoad);

    return () => {
      isDestroying.current = true;
      setMapLoaded(false);
      
      // Cleanup markers and roots immediately BEFORE map removal
      const currentRoots = { ...rootsRef.current };
      const currentMarkers = { ...markersRef.current };
      
      rootsRef.current = {};
      markersRef.current = {};

      Object.values(currentRoots).forEach((root: any) => {
        try {
          root.unmount();
        } catch (e) {
          // ignore
        }
      });

      Object.values(currentMarkers).forEach((marker: maplibregl.Marker) => {
        try {
          marker.remove();
        } catch (e) {
          // ignore
        }
      });

      if (map.current === mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.warn("Error removing map:", e);
        }
        map.current = null;
      }
    };
  }, [mapStyle, interactive]);

  // Update markers
  useEffect(() => {
    if (!map.current || !mapLoaded || isDestroying.current) return;

    // Check if map is still valid
    try {
      if (!map.current.getContainer()) return;
    } catch (e) {
      return;
    }

    const currentMarkerIds = new Set<string>();

    // Helper to safely add/update markers
    const updateMarker = (markerId: string, lat: number, lng: number, element: HTMLElement, popup?: maplibregl.Popup) => {
      if (!map.current || !mapLoaded || isDestroying.current) return;
      
      try {
        if (!markersRef.current[markerId]) {
          const marker = new maplibregl.Marker({ element })
            .setLngLat([lng, lat]);
          
          if (popup) marker.setPopup(popup);
          
          marker.addTo(map.current);
          markersRef.current[markerId] = marker;
        } else {
          markersRef.current[markerId].setLngLat([lng, lat]);
        }
      } catch (e) {
        // ignore
      }
    };

    // Add request markers
    if (mode === 'admin' || (mode === 'driver' && isDriverOnline)) {
      displayRequests.forEach((req, i) => {
        const lat = req.coordinates?.lat || req.lat;
        const lng = req.coordinates?.lng || req.lng;
        
        if (!lat || !lng) return;

        const markerId = `req-${req.id || i}`;
        currentMarkerIds.add(markerId);

        if (!markersRef.current[markerId]) {
          const el = document.createElement('div');
          el.className = 'cursor-pointer z-10';
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onMarkerClick) onMarkerClick(req);
          });

          const root = createRoot(el);
          rootsRef.current[markerId] = root;

          const popupHTML = `
            <div class="p-2 min-w-[150px]">
              <h3 class="font-bold text-gray-800 border-b pb-1 mb-1">${req.userName || req.name || 'User'}</h3>
              <p class="text-sm text-gray-600"><strong>Type:</strong> ${req.wasteType || 'General'}</p>
              <p class="text-sm text-gray-600"><strong>Status:</strong> ${req.status || 'Pending'}</p>
              <p class="text-xs text-gray-400 mt-1">${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
            </div>
          `;

          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupHTML);
          updateMarker(markerId, lat, lng, el, popup);
        } else {
          updateMarker(markerId, lat, lng, markersRef.current[markerId].getElement());
        }

        // Render React component into the marker element
        if (rootsRef.current[markerId]) {
          const isCompleted = req.status === 'Completed' || req.status === 'completed';
          const isAssigned = req.status === 'Assigned' || req.status === 'assigned';
          
          rootsRef.current[markerId].render(
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.1 }}
            >
              <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
                isCompleted ? 'bg-gray-500' :
                isAssigned ? 'bg-blue-500' :
                'bg-emerald-500'
              }`}>
                {isCompleted ? (
                  <MapPin size={14} className="text-white" />
                ) : isAssigned ? (
                  <User size={14} className="text-white" />
                ) : (
                  <Trash2 size={14} className="text-white" />
                )}
              </div>
            </motion.div>
          );
        }
      });
    }

    // Add user location marker
    if (userLocation && (mode === 'user' || mode === 'admin')) {
      const markerId = 'user-location';
      currentMarkerIds.add(markerId);

      if (!markersRef.current[markerId]) {
        const el = document.createElement('div');
        const root = createRoot(el);
        rootsRef.current[markerId] = root;
        updateMarker(markerId, userLocation.lat, userLocation.lng, el);
      } else {
        updateMarker(markerId, userLocation.lat, userLocation.lng, markersRef.current[markerId].getElement());
      }

      if (rootsRef.current[markerId]) {
        rootsRef.current[markerId].render(
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse" />
        );
      }
    }

    // Add driver location marker
    if (currentDriverLoc && (mode === 'user' || (isDriverOnline && showDrivers && (mode === 'driver' || mode === 'admin')))) {
      const markerId = 'driver-location';
      currentMarkerIds.add(markerId);

      if (!markersRef.current[markerId]) {
        const el = document.createElement('div');
        el.className = 'z-30';
        const root = createRoot(el);
        rootsRef.current[markerId] = root;
        updateMarker(markerId, currentDriverLoc.lat, currentDriverLoc.lng, el);
      } else {
        updateMarker(markerId, currentDriverLoc.lat, currentDriverLoc.lng, markersRef.current[markerId].getElement());
      }

      if (rootsRef.current[markerId]) {
        rootsRef.current[markerId].render(
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-emerald-500">
              <Truck size={20} className="text-emerald-600" />
            </div>
          </motion.div>
        );
      }
    }

    // Remove old markers
    Object.keys(markersRef.current).forEach(markerId => {
      if (!currentMarkerIds.has(markerId)) {
        const marker = markersRef.current[markerId];
        const root = rootsRef.current[markerId];
        
        delete markersRef.current[markerId];
        delete rootsRef.current[markerId];

        try {
          marker.remove();
        } catch (e) {
          console.warn(`Error removing marker ${markerId}:`, e);
        }
        
        if (root) {
          setTimeout(() => {
            try {
              root.unmount();
            } catch (e) {
              console.warn(`Error unmounting root ${markerId}:`, e);
            }
          }, 0);
        }
      }
    });

  }, [displayRequests, userLocation, currentDriverLoc, isDriverOnline, onMarkerClick, mapLoaded]);

  return (
    <div className={`relative overflow-hidden bg-[#e5e3df] ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Offline Overlay */}
      {!isDriverOnline && (
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-xl text-center">
            <Truck size={32} className="text-gray-400 mx-auto mb-2" />
            <h3 className="text-gray-800 font-bold">You are offline</h3>
            <p className="text-sm text-gray-500 mt-1">Go online to receive pickups</p>
          </div>
        </div>
      )}
    </div>
  );
};

