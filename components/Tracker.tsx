import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, MapPin, Phone, Clock, Navigation as NavIcon, Maximize2, X as CloseIcon, CheckCircle2, ChevronRight, Recycle } from 'lucide-react';
import { DemoMap } from './DemoMap';
import { motion, AnimatePresence } from 'motion/react';
import { PickupRequest, Driver } from '../types';

interface TrackerProps {
  onBack: () => void;
  onRequestNew: () => void;
  activeRequest?: PickupRequest;
  assignedDriver?: Driver;
}

const defaultCenter = {
  lat: 23.1815,
  lng: 79.9864
};

const demoPickups = [
  {
    id: 'demo-1',
    location: 'Shiv Nagar, Jabalpur',
    status: 'On the way',
    wasteType: 'Plastic',
    time: '10 mins away',
    coordinates: { lat: 23.1945, lng: 79.9235 },
    color: '#10b981' // Emerald
  },
  {
    id: 'demo-2',
    location: 'Napier Town, Jabalpur',
    status: 'Pickup scheduled',
    wasteType: 'Glass',
    time: '25 mins away',
    coordinates: { lat: 23.1650, lng: 79.9350 },
    color: '#3b82f6' // Blue
  },
  {
    id: 'demo-3',
    location: 'Adhartal, Jabalpur',
    status: 'Completed',
    wasteType: 'Organic',
    time: 'Completed',
    coordinates: { lat: 23.2100, lng: 79.9500 },
    color: '#6b7280' // Gray
  }
];

export const Tracker: React.FC<TrackerProps> = ({ onBack, onRequestNew, activeRequest, assignedDriver }) => {
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [simulatedTruckLocation, setSimulatedTruckLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showRoute, setShowRoute] = useState(true);

  const [viewState, setViewState] = useState({
    longitude: 79.9864,
    latitude: 23.1815,
    zoom: 12
  });
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const newLoc = { lat: latitude, lng: longitude };
      setUserLocation(newLoc);
      setLocationError(null);
      
      if (activeRequest && !assignedDriver) {
        setViewState(prev => ({ ...prev, latitude, longitude }));
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error("Error getting location:", error);
      if (error.code === error.PERMISSION_DENIED) {
        setLocationError("Please enable location access to request a pickup.");
      } else {
        setLocationError("Could not detect your location. Using default.");
      }
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeRequest, assignedDriver]);

  // Simulate truck movement ONLY if no real driver is assigned for demo
  useEffect(() => {
    if (!activeRequest || assignedDriver || !userLocation) {
      setSimulatedTruckLocation(null);
      return;
    }

    if (!simulatedTruckLocation) {
      setSimulatedTruckLocation({
        lat: userLocation.lat + 0.01,
        lng: userLocation.lng + 0.01
      });
      return;
    }

    const interval = setInterval(() => {
      setSimulatedTruckLocation(prev => {
        if (!prev) return null;
        
        const target = activeRequest.coordinates;
        const latDiff = target.lat - prev.lat;
        const lngDiff = target.lng - prev.lng;
        
        const step = 0.01;
        const newLat = prev.lat + latDiff * step;
        const newLng = prev.lng + lngDiff * step;
        
        if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
          return prev;
        }
        
        return { lat: newLat, lng: newLng };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeRequest, userLocation, assignedDriver]);

  // Calculate ETA and distance
  useEffect(() => {
    const truckLoc = activeRequest?.driverLocation || assignedDriver?.location || simulatedTruckLocation;
    const targetLoc = activeRequest?.coordinates || userLocation;

    if (truckLoc && targetLoc) {
      // Use realistic demo values if driver is assigned
      if (assignedDriver || activeRequest?.assignedDriverId) {
        // Random distance between 1 and 8 km
        const randomDist = (Math.random() * 7 + 1).toFixed(1);
        setDistance(`${randomDist} km`);
        
        // Random ETA between 5 and 20 mins
        const randomMins = Math.floor(Math.random() * 16 + 5);
        setDuration(`${randomMins} mins away`);
      } else {
        // Fallback for simulation
        const latDiff = targetLoc.lat - truckLoc.lat;
        const lngDiff = targetLoc.lng - truckLoc.lng;
        const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // approx km
        
        setDistance(`${dist.toFixed(0)} km`);
        
        const mins = Math.ceil((dist / 16) * 60);
        if (mins < 1) {
          setDuration('Arriving now');
        } else {
          setDuration(`${mins} mins away`);
        }
      }
    }
  }, [simulatedTruckLocation, assignedDriver, activeRequest, userLocation]);

  // Center map when request or driver changes
  useEffect(() => {
    const truckLoc = activeRequest?.driverLocation || assignedDriver?.location || simulatedTruckLocation;
    const targetLoc = activeRequest?.coordinates || (activeRequest ? userLocation : null);

    if (truckLoc && targetLoc) {
      setViewState(prev => ({
        ...prev,
        latitude: (truckLoc.lat + targetLoc.lat) / 2,
        longitude: (truckLoc.lng + targetLoc.lng) / 2,
        zoom: 14
      }));
    }
  }, [activeRequest, assignedDriver, simulatedTruckLocation]);

  const pickupLocation = (activeRequest && activeRequest.coordinates) 
    ? activeRequest.coordinates 
    : userLocation || defaultCenter;
  
  const driverLocation = activeRequest?.driverLocation || assignedDriver?.location || simulatedTruckLocation;

  const routeGeoJSON = showRoute && driverLocation && pickupLocation ? {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [driverLocation.lng, driverLocation.lat],
        [pickupLocation.lng, pickupLocation.lat]
      ]
    }
  } : null;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Finding Driver';
      case 'accepted': return 'Driver Assigned';
      case 'on_the_way': return 'Driver on the way';
      case 'arrived': return 'Driver Arrived';
      case 'completed': return 'Pickup Completed';
      default: return 'Processing';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white animate-fade-in relative z-50">
      {/* Header */}
      {!isMapExpanded && (
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between bg-gradient-to-b from-white/80 to-transparent backdrop-blur-[2px]">
          <button 
            onClick={onBack}
            className="bg-white p-2.5 rounded-full shadow-md text-gray-700 hover:bg-gray-50 active:scale-95 transition-all relative z-20"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-lg font-bold text-gray-800 bg-white/90 px-4 py-1.5 rounded-full shadow-sm backdrop-blur-sm pointer-events-auto">
              {activeRequest ? getStatusText(activeRequest.status) : 'Tracking Vehicle'}
            </h1>
          </div>
          <div className="w-10"></div>
        </div>
      )}

      {/* Map Area */}
      <div className={isMapExpanded ? 'h-[40vh] min-h-[300px]' : 'hidden'} />
      
      <div 
        className={isMapExpanded ? 'expanded-map' : 'h-[40vh] min-h-[300px] relative overflow-hidden group bg-gray-100'}
      >
        <DemoMap
          requests={activeRequest ? [activeRequest] : []}
          driverLocation={driverLocation || undefined}
          showDrivers={false}
          mode="user"
          className="w-full h-full"
        />
        
        {/* Expand/Close Controls */}
        <div className="absolute top-4 right-4 z-[10000] flex flex-col gap-2">
          {isMapExpanded ? (
            <button 
              onClick={() => setIsMapExpanded(false)}
              className="bg-white p-3 rounded-full shadow-xl text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <CloseIcon size={24} />
            </button>
          ) : (
            <button 
              onClick={() => setIsMapExpanded(true)}
              className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-md text-gray-700 hover:bg-white active:scale-95 transition-all"
            >
              <Maximize2 size={20} />
            </button>
          )}
        </div>

        {!isMapExpanded && (
          <div 
            className="absolute inset-0 cursor-pointer z-[105]" 
            onClick={() => setIsMapExpanded(true)}
            style={{ top: '80px' }}
          />
        )}
      </div>

      {/* Bottom Sheet Info Panel */}
      <div className={`flex-1 bg-white rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] -mt-6 relative z-20 overflow-y-auto no-scrollbar pb-safe ${isMapExpanded ? 'hidden' : ''}`}>
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-6"></div>
        
        <div className="px-6 pb-8">
          {activeRequest ? (
            <>
              {/* Time & Status */}
              <div className="flex justify-between items-end mb-6">
                  <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">
                        {activeRequest.status === 'pending' ? 'Finding Driver...' : 'Estimated Arrival'}
                      </p>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {activeRequest.status === 'pending' ? 'Searching for nearby trucks' : duration}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">{distance ? `${distance} away` : ''}</p>
                  </div>
                  <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        activeRequest.status === 'pending' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'
                      }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                            activeRequest.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          {getStatusText(activeRequest.status)}
                      </span>
                  </div>
              </div>

              {/* Driver Card */}
              {(assignedDriver || activeRequest.assignedDriverName) && (
                <div className="flex items-center bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm border-2 border-white">
                        <Truck size={24} />
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="font-bold text-gray-800">{activeRequest.assignedDriverName || assignedDriver?.name}</h3>
                        <p className="text-xs text-gray-500">Eco-Driver • Verified</p>
                    </div>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm border border-gray-100 hover:bg-emerald-50">
                        <Phone size={20} />
                    </button>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-0 relative">
                  <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-200"></div>

                  {[
                      { title: 'Request Placed', time: new Date(activeRequest.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), status: 'completed' },
                      { title: 'Driver Assigned', time: activeRequest.assignedDriverId ? 'Completed' : 'Pending', status: activeRequest.assignedDriverId ? 'completed' : 'current' },
                      { title: 'Driver on Route', time: activeRequest.status === 'on_the_way' ? 'In Progress' : 'Pending', status: activeRequest.status === 'on_the_way' ? 'current' : (['arrived', 'completed'].includes(activeRequest.status) ? 'completed' : 'upcoming') },
                      { title: 'Pickup Completed', time: activeRequest.status === 'completed' ? 'Done' : 'Pending', status: activeRequest.status === 'completed' ? 'completed' : 'upcoming' },
                  ].map((step, idx) => (
                      <div key={idx} className="flex items-start relative mb-6 last:mb-0">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white ${
                              step.status === 'completed' ? 'border-emerald-500 text-emerald-500' :
                              step.status === 'current' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
                          }`}>
                              {step.status === 'completed' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                              {step.status === 'current' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />}
                          </div>
                          <div className="ml-4 flex-1">
                              <p className={`text-sm font-semibold ${step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-800'}`}>
                                  {step.title}
                              </p>
                              <p className="text-xs text-gray-500">{step.time}</p>
                          </div>
                      </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center py-10">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No Active Pickups</h3>
              <p className="text-sm text-gray-500 px-10">Request a pickup to track your waste collection in real-time.</p>
              <button 
                onClick={onRequestNew}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all mt-4"
              >
                Request New Pickup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
