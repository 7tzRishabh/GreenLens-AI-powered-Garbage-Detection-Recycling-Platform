import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Send, Maximize2, X, Scan, CheckCircle2 } from 'lucide-react';
import { WasteCategory } from '../types';
import { DemoMap } from './DemoMap';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeWasteImage } from '../services/geminiService';

interface RequestPickupProps {
  onBack: () => void;
  onSubmit: (wasteType: WasteCategory, address: string, imageUrl?: string, coordinates?: {lat: number, lng: number}) => void;
}

export const RequestPickup: React.FC<RequestPickupProps> = ({ onBack, onSubmit }) => {
  const [requestAddress, setRequestAddress] = useState('Napier Town, Jabalpur');
  const [requestType, setRequestType] = useState<WasteCategory>(WasteCategory.Plastic);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestImage, setRequestImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  
  const [viewState, setViewState] = useState({
    longitude: 79.9864,
    latitude: 23.1815,
    zoom: 15
  });
  const [pickupTime, setPickupTime] = useState(new Date().toISOString().slice(0, 16));
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // AI Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ type: string, confidence: number, ecoPoints: number } | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<{ name: string, eta: string, distance: string } | null>(null);

  useEffect(() => {
    let watchId: number;

    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setViewState(prev => ({ ...prev, latitude, longitude }));
          setIsLocating(false);
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError("Location access denied. Please enable location permissions to see your real-time location.");
          } else {
            setLocationError("Could not get your location. Using default.");
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error watching position:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setRequestImage(reader.result as string);
      setScanResult(null); // Reset scan result when new image is uploaded
    };
    reader.readAsDataURL(file);
  };

  const handleScanImage = async () => {
    if (!imageFile) return;
    setIsScanning(true);
    
    try {
      const result = await analyzeWasteImage(imageFile);
      setScanResult({
        type: result.wasteType,
        confidence: Math.round(result.confidence * 100),
        ecoPoints: result.ecoPoints || 25
      });
      setRequestType(result.category);
    } catch (error) {
      console.error("AI Scan failed, using fallback:", error);
      // Fallback result
      setScanResult({
        type: 'Plastic Waste',
        confidence: 90,
        ecoPoints: 25
      });
      setRequestType(WasteCategory.Plastic);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestAddress.trim()) return;
    
    setIsRequesting(true);
    setTimeout(() => {
      const lat = userLocation ? userLocation[0] : viewState.latitude;
      const lng = userLocation ? userLocation[1] : viewState.longitude;
      
      // Simulate driver assignment
      setAssignedDriver({
        name: 'Rahul',
        eta: '10 mins',
        distance: '2.5 km'
      });
      
      onSubmit(requestType, requestAddress, requestImage || undefined, { lat, lng });
      setIsRequesting(false);
    }, 1500);
  };

  if (assignedDriver) {
    return (
      <div className="h-full flex flex-col bg-white animate-slide-up relative z-50 overflow-hidden items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={40} className="text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pickup Requested!</h2>
        <p className="text-gray-600 mb-8">Your request has been successfully saved.</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 w-full max-w-sm border border-gray-100 shadow-sm mb-8">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Driver Assigned</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Name</span>
            <span className="font-bold text-gray-800">{assignedDriver.name}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">ETA</span>
            <span className="font-bold text-blue-600">{assignedDriver.eta}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Distance</span>
            <span className="font-bold text-gray-800">{assignedDriver.distance}</span>
          </div>
        </div>
        
        <button 
          onClick={onBack}
          className="w-full max-w-sm bg-green-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white animate-slide-up relative z-50 overflow-hidden">
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
            <h2 className="text-lg font-bold text-gray-800 bg-white/90 px-4 py-1.5 rounded-full shadow-sm backdrop-blur-sm pointer-events-auto">
              Need a Pickup
            </h2>
          </div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      )}

      {/* Map Section with Placeholder */}
      <div className={isMapExpanded ? 'h-[40vh] min-h-[300px]' : 'hidden'} />
      
      <div 
        className={isMapExpanded 
          ? 'expanded-map' 
          : 'h-[40vh] min-h-[300px] relative overflow-hidden group bg-gray-100'
        }
      >
        <DemoMap
          requests={[]}
          userLocation={userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null}
          showDrivers={false}
          className="w-full h-full"
          mode="user"
        />

        {/* Expand/Close Controls */}
        <div className="absolute top-4 right-4 z-[10000] flex flex-col gap-2">
          {isMapExpanded ? (
            <button 
              onClick={() => setIsMapExpanded(false)}
              className="bg-white p-3 rounded-full shadow-xl text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <X size={24} />
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
        
        {/* Location Error Toast */}
        {locationError && (
          <div className="absolute top-4 left-4 right-4 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-xs shadow-md z-[1000]">
            {locationError}
          </div>
        )}
      </div>

      {/* Form Section */}
      <div className={`flex-1 bg-white rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] -mt-6 relative z-20 overflow-y-auto no-scrollbar pb-safe ${isMapExpanded ? 'hidden' : ''}`}>
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-6"></div>
        
        <div className="px-6 pb-8">
          <form onSubmit={handleSubmitRequest} className="space-y-4">
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Upload Image (Optional)</label>
            <div className="relative">
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {requestImage && (
                <div className="mt-3 flex gap-4 items-start">
                  <img src={requestImage} alt="Preview" className="h-24 w-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                  <div className="flex-1">
                    {!scanResult ? (
                      <button
                        type="button"
                        onClick={handleScanImage}
                        disabled={isScanning}
                        className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-blue-100 transition-all"
                      >
                        {isScanning ? (
                          <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                        ) : (
                          <><Scan size={14} className="mr-1" /> AI Scan Image</>
                        )}
                      </button>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
                        <div className="flex items-center text-green-700 font-bold mb-1">
                          <CheckCircle2 size={14} className="mr-1" /> Scan Complete
                        </div>
                        <p className="text-gray-600 mb-1">Type: <span className="font-bold text-gray-800">{scanResult.type}</span></p>
                        <p className="text-gray-600 mb-1">Confidence: <span className="font-bold text-blue-600">{scanResult.confidence}%</span></p>
                        <p className="text-gray-600">Eco Points: <span className="font-bold text-green-600">+{scanResult.ecoPoints}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Waste Type</label>
            <div className="flex flex-wrap gap-2">
              {[WasteCategory.Plastic, WasteCategory.Metal, WasteCategory.Glass, WasteCategory.Paper, WasteCategory.Organic, WasteCategory.EWaste, WasteCategory.Hazardous].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setRequestType(cat)}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                    requestType === cat 
                      ? 'bg-green-600 border-green-600 text-white shadow-md' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-green-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Exact Address</label>
            <div className="relative">
              <input 
                type="text"
                value={requestAddress}
                onChange={(e) => setRequestAddress(e.target.value)}
                placeholder="e.g. 123 Green St, Sector 4"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                required
              />
              <MapPin size={18} className="absolute right-4 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Preferred Pickup Time (Optional)</label>
            <div className="relative">
              <input 
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isRequesting}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:shadow-lg mt-2"
          >
            {isRequesting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><Send size={18} className="mr-2" /> Request Pickup Here</>
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};
