import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { 
  MapPin, Clock, CheckCircle2, Navigation as NavIcon, Truck, 
  User as UserIcon, Wallet, TrendingUp, Award, Star, 
  ChevronRight, Bell, ArrowUpRight, History, Leaf, 
  Zap, Recycle, Trophy, ExternalLink, Map as MapIcon,
  Ticket, Gift, Coffee, ShoppingBag, ArrowRight
} from 'lucide-react';
import { DemoMap } from './DemoMap';
import { PickupRequest, WasteCategory, DriverStats, PaymentRecord, DriverLeaderboardEntry, AppNotification, User, Reward } from '../types';

interface DriverViewProps {
  requests: PickupRequest[];
  onAcceptPickup: (id: string) => void;
  onUpdateStatus: (id: string, status: 'on_the_way' | 'arrived' | 'completed') => void;
  driverStats: DriverStats;
  payments: PaymentRecord[];
  leaderboard: DriverLeaderboardEntry[];
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  activeSection: 'driver' | 'earnings' | 'rewards' | 'impact';
  currentDriverId?: string;
  driverLocation?: { lat: number; lng: number };
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  locationError?: string | null;
  currentUser: User | null;
  onStatusChange?: (status: 'online' | 'offline') => void;
}

const DEMO_REQUESTS: any[] = [
  { id: 'demo-1', userName: 'Rohit Sharma', address: 'Napier Town, Jabalpur', wasteType: WasteCategory.Plastic, status: 'pending', timestamp: '2 mins ago', coordinates: { lat: 23.16, lng: 79.94 }, distance: '1.2 km' },
  { id: 'demo-2', userName: 'Anjali Verma', address: 'Adhartal, Jabalpur', wasteType: WasteCategory.Organic, status: 'pending', timestamp: '5 mins ago', coordinates: { lat: 23.19, lng: 79.95 }, distance: '2.5 km' },
  { id: 'demo-3', userName: 'Vikram Singh', address: 'Civil Lines, Jabalpur', wasteType: WasteCategory.Organic, status: 'pending', timestamp: '8 mins ago', coordinates: { lat: 23.17, lng: 79.93 }, distance: '0.8 km' },
  { id: 'demo-4', userName: 'Priya Das', address: 'Vijay Nagar, Jabalpur', wasteType: WasteCategory.Paper, status: 'pending', timestamp: '12 mins ago', coordinates: { lat: 23.18, lng: 79.92 }, distance: '3.1 km' },
  { id: 'demo-5', userName: 'Suresh Raina', address: 'Gokalpur, Jabalpur', wasteType: WasteCategory.Metal, status: 'pending', timestamp: '15 mins ago', coordinates: { lat: 23.20, lng: 79.97 }, distance: '4.2 km' },
  { id: 'demo-6', userName: 'Yuvraj Singh', address: 'Khamaria, Jabalpur', wasteType: WasteCategory.Glass, status: 'pending', timestamp: '20 mins ago', coordinates: { lat: 23.22, lng: 79.98 }, distance: '5.5 km' },
];

const PARTNER_STORES: Reward[] = [
  { id: '1', title: 'GreenMart Grocery', description: '10% discount on your next purchase.', cost: 300, image: '🛒' },
  { id: '2', title: 'EcoCafe', description: 'Free coffee on your next visit.', cost: 200, image: '☕' },
  { id: '3', title: 'Urban Organic Store', description: '₹100 discount on organic products.', cost: 400, image: '🌿' },
  { id: '4', title: 'City Bus Pass', description: '1 Day Travel pass.', cost: 500, image: '🚌' },
  { id: '5', title: 'Plant a Tree Initiative', description: 'Plant a tree in your name.', cost: 1500, image: '🌳' }
];

const DEMO_PAYMENTS: any[] = [
  { id: 'dp1', location: 'Napier Town', wasteType: WasteCategory.Plastic, amount: 120, timestamp: 'Today, 2:30 PM', status: 'Completed' },
  { id: 'dp2', location: 'Civic Center', wasteType: WasteCategory.Organic, amount: 80, timestamp: 'Today, 11:15 AM', status: 'Completed' },
  { id: 'dp3', location: 'Adhartal', wasteType: WasteCategory.Metal, amount: 200, timestamp: 'Yesterday, 4:45 PM', status: 'Completed' },
  { id: 'dp4', location: 'Wright Town', wasteType: WasteCategory.Paper, amount: 60, timestamp: 'Yesterday, 2:00 PM', status: 'Pending' },
  { id: 'dp5', location: 'Gwarighat', wasteType: WasteCategory.Organic, amount: 150, timestamp: '2 days ago', status: 'Completed' },
];

export const DriverView: React.FC<DriverViewProps> = ({ 
  requests: propRequests, 
  onAcceptPickup,
  onUpdateStatus, 
  driverStats: propDriverStats, 
  payments: propPayments, 
  leaderboard, 
  notifications,
  onMarkNotificationsRead,
  activeSection,
  currentDriverId,
  driverLocation,
  onLocationUpdate,
  locationError,
  currentUser,
  onStatusChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(currentUser?.driverStatus === 'online');
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [redeemedId, setRedeemedId] = useState<string | null>(null);

  // Track real driver location
  useEffect(() => {
    if (!isOnDuty || !navigator.geolocation) return;

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      onLocationUpdate?.({ lat: latitude, lng: longitude });
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error("Driver location error:", error);
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnDuty, onLocationUpdate]);

  const handleRedeem = (reward: Reward) => {
    if (driverStats.ecoPoints >= reward.cost) {
      setRedeemedId(reward.id);
      setTimeout(() => setRedeemedId(null), 3000);
    }
  };

  // Fallback logic for demo data
  const requests = propRequests.length > 0 ? propRequests : DEMO_REQUESTS;
  const payments = propPayments.length > 0 ? propPayments : DEMO_PAYMENTS;
  const driverStats = {
    ...propDriverStats,
    walletBalance: propDriverStats.walletBalance || 750,
    todayEarnings: propDriverStats.todayEarnings || 500,
    weeklyEarnings: propDriverStats.weeklyEarnings || 2500,
    totalPickups: propDriverStats.totalPickups || 2,
    todayPickups: propDriverStats.todayPickups || 2,
  };
  
  const toggleStatus = () => {
    const newStatus = isOnDuty ? 'offline' : 'online';
    setIsOnDuty(!isOnDuty);
    onStatusChange?.(newStatus);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const activePickup = requests.find(r => 
    ['accepted', 'on_the_way', 'arrived'].includes(r.status) && 
    r.assignedDriverId === currentDriverId
  );

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const routeGeoJSON = driverLocation && activePickup ? {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [driverLocation.lng, driverLocation.lat],
        [activePickup.coordinates.lng, activePickup.coordinates.lat]
      ]
    }
  } : null;

  const [viewState, setViewState] = useState({
    longitude: driverLocation?.lng || 79.94,
    latitude: driverLocation?.lat || 23.16,
    zoom: 13
  });

  // Update viewState when driverLocation changes
  useEffect(() => {
    if (driverLocation) {
      setViewState(prev => ({
        ...prev,
        longitude: driverLocation.lng,
        latitude: driverLocation.lat
      }));
    }
  }, [driverLocation]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header with Notifications */}
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeSection === 'driver' && 'Pickups'}
              {activeSection === 'earnings' && 'Earnings'}
              {activeSection === 'rewards' && 'Rewards'}
              {activeSection === 'impact' && 'Leaderboard'}
            </h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Demo Mode</span>
          </div>
          <p className="text-gray-500 text-sm">Welcome back, {currentUser?.name || 'Driver'}</p>
        </div>
        <div className="flex items-center gap-2 mr-4">
          <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isOnDuty ? 'text-emerald-600' : 'text-gray-400'}`}>
            {isOnDuty ? 'On Duty' : 'Off Duty'}
          </span>
          <button 
            onClick={toggleStatus}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative flex items-center shadow-inner ${isOnDuty ? 'bg-emerald-500' : 'bg-gray-200'}`}
          >
            <div 
              className={`absolute w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out transform ${isOnDuty ? 'translate-x-6' : 'translate-x-1'}`} 
            />
          </button>
        </div>
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) onMarkNotificationsRead();
            }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-up">
              <div className="p-4 border-bottom border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h4 className="font-bold text-sm text-gray-800">Notifications</h4>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                  <CheckCircle2 size={16} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-emerald-50/30' : ''}`}>
                    <div className="flex items-start">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        n.type === 'pickup' ? 'bg-blue-100 text-blue-600' :
                        n.type === 'reward' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {n.type === 'pickup' ? <Truck size={14} /> : n.type === 'reward' ? <Award size={14} /> : <Wallet size={14} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-gray-800">{n.title}</p>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            n.status === 'New' ? 'bg-emerald-100 text-emerald-700' :
                            n.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {n.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] text-gray-400 mt-1">{n.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1">
            <Star size={14} fill="currentColor" />
          </div>
          <p className="text-[9px] text-gray-500 font-medium">Rating</p>
          <p className="text-xs font-bold text-gray-800">{driverStats.rating}</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-1">
            <Truck size={14} />
          </div>
          <p className="text-[9px] text-gray-500 font-medium">Pickups</p>
          <p className="text-xs font-bold text-gray-800">{driverStats.totalPickups}</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-7 h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-1">
            <Clock size={14} />
          </div>
          <p className="text-[9px] text-gray-500 font-medium">On-Time</p>
          <p className="text-xs font-bold text-gray-800">{driverStats.onTimeRate}%</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-1">
            <Recycle size={14} />
          </div>
          <p className="text-[9px] text-gray-500 font-medium">Eco Pts</p>
          <p className="text-xs font-bold text-gray-800">{(driverStats.ecoPoints || 850).toLocaleString()}</p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="animate-slide-up">
        {activeSection === 'driver' && (
          <div className="space-y-6">
            {/* Prominent Eco Points Card for Driver Dashboard */}
            <motion.div 
              animate={{ backgroundColor: ["#dcfce7", "#bbf7d0", "#dcfce7"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-3xl p-6 shadow-xl border border-green-200 flex items-center justify-between overflow-hidden relative group"
            >
              {/* Premium Glow Effect */}
              <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-green-400/20 blur-3xl rounded-full z-0 group-hover:bg-green-400/30 transition-colors duration-500"></div>
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/40 blur-2xl rounded-full z-0"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 shadow-sm border border-green-200">
                    <Recycle size={20} />
                  </div>
                  <span className="text-xs font-bold text-green-900 uppercase tracking-widest">Your Eco Points</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-green-900 tracking-tight drop-shadow-sm">
                    {(driverStats.ecoPoints || 850).toLocaleString()}
                  </span>
                  <span className="text-green-600/60 font-bold text-xl">pts</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="px-3 py-1 bg-white text-green-700 rounded-full text-[10px] font-bold border border-green-200 shadow-sm flex items-center">
                    <Trophy size={12} className="mr-1.5 text-amber-500" />
                    Ranked #3 in your area
                  </div>
                  <div className="px-3 py-1 bg-white text-green-700 rounded-full text-[10px] font-bold border border-green-200 shadow-sm flex items-center">
                    <Award size={12} className="mr-1.5 text-blue-500" />
                    Top 5% eco driver
                  </div>
                </div>
              </div>
              <div className="relative z-10 bg-gradient-to-br from-green-600 to-green-500 p-5 rounded-2xl shadow-lg shadow-green-200 text-white transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Leaf size={36} />
              </div>
            </motion.div>

            {/* Map Preview */}
            <div className="bg-gray-100 rounded-2xl h-64 relative overflow-hidden border border-gray-200 shadow-inner group">
              <DemoMap
                requests={requests}
                driverLocation={driverLocation}
                isDriverOnline={isOnDuty}
                onMarkerClick={(req) => setSelectedRequest(req)}
                mode="driver"
                className="w-full h-full"
              />

              {/* Selected Request Popup */}
              {selectedRequest && (
                <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-40 animate-fade-in">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{selectedRequest.userName}</h4>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin size={12} className="mr-1" /> {selectedRequest.address}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedRequest(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                      {selectedRequest.wasteType.join(', ')}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">
                      {selectedRequest.estimatedWeight} kg
                    </span>
                  </div>
                  {selectedRequest.status === 'pending' && (
                    <button
                      onClick={() => {
                        onAcceptPickup(selectedRequest.id);
                        setSelectedRequest(null);
                      }}
                      className="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Accept Pickup
                    </button>
                  )}
                </div>
              )}

              {/* Offline Overlay */}
              {!isOnDuty && (
                <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] z-30 flex items-center justify-center">
                  <div className="bg-white px-6 py-4 rounded-2xl shadow-xl text-center max-w-[80%]">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Truck size={24} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">You're Offline</h3>
                    <p className="text-xs text-gray-500 mb-4">Go online to receive new pickup requests in your area.</p>
                    <button 
                      onClick={toggleStatus}
                      className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors w-full"
                    >
                      Go Online
                    </button>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none z-20">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center pointer-events-auto">
                  <NavIcon size={14} className="text-emerald-600 mr-2" />
                  <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Live Route Map</span>
                </div>
                <button className="bg-emerald-600 text-white px-3 py-2 rounded-xl shadow-lg flex items-center text-[10px] font-bold hover:bg-emerald-700 transition-all pointer-events-auto">
                  <Zap size={12} className="mr-1" /> Optimize Route
                </button>
              </div>
              
              {/* Location Error Toast */}
              {locationError && (
                <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-xs shadow-md z-[1000]">
                  {locationError}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                Pickup Requests <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px]">{requests.filter(r => r.status !== 'completed').length}</span>
              </h3>
              
              {/* Scrollable container for requests */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pb-4">
                {/* Active Pickup (if any) */}
                {activePickup && (
                <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 shadow-md animate-pulse-subtle">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center mr-3 shadow-sm">
                        <Truck size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900 text-sm">Active Pickup: {activePickup.address}</h4>
                        <p className="text-xs text-emerald-700">{activePickup.userName} • <span className="font-bold">{activePickup.wasteType}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-emerald-200 text-emerald-800 rounded-full text-[10px] font-bold uppercase">
                        {activePickup.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {activePickup.status === 'accepted' && (
                      <button 
                        onClick={() => onUpdateStatus(activePickup.id, 'on_the_way')}
                        className="col-span-2 bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Start Journey
                      </button>
                    )}
                    {activePickup.status === 'on_the_way' && (
                      <button 
                        onClick={() => onUpdateStatus(activePickup.id, 'arrived')}
                        className="col-span-2 bg-blue-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        I have Arrived
                      </button>
                    )}
                    {activePickup.status === 'arrived' && (
                      <button 
                        onClick={() => onUpdateStatus(activePickup.id, 'completed')}
                        className="col-span-2 bg-emerald-600 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        <CheckCircle2 size={16} className="mr-2" /> Complete Pickup
                      </button>
                    )}
                    <button 
                      onClick={() => openInGoogleMaps(activePickup.coordinates.lat, activePickup.coordinates.lng)}
                      className="col-span-2 bg-white text-emerald-600 border border-emerald-200 py-3 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-emerald-50 transition-colors mt-2"
                    >
                      <NavIcon size={16} className="mr-2" /> Get Directions
                    </button>
                  </div>
                </div>
              )}

              {/* Pending Requests */}
              {pendingRequests.map((pickup) => (
                  <div 
                    key={pickup.id} 
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border-l-4 border-l-amber-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        {pickup.imageUrl ? (
                          <img src={pickup.imageUrl} alt="Waste" className="w-10 h-10 rounded-xl object-cover mr-3 border border-gray-200" />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                            pickup.wasteType === WasteCategory.Plastic ? 'bg-blue-100 text-blue-600' :
                            pickup.wasteType === WasteCategory.Metal ? 'bg-gray-100 text-gray-600' :
                            pickup.wasteType === WasteCategory.Glass ? 'bg-cyan-100 text-cyan-600' :
                            pickup.wasteType === WasteCategory.Paper ? 'bg-amber-100 text-amber-600' :
                            pickup.wasteType === WasteCategory.Organic ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <Recycle size={20} />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{pickup.address}</h4>
                          <div className="flex items-center mt-1">
                            <UserIcon size={12} className="text-gray-400 mr-1" />
                            <p className="text-xs text-gray-500">{pickup.userName} • <span className="text-emerald-600 font-medium">{pickup.wasteType}</span></p>
                          </div>
                          {pickup.distance && (
                            <div className="flex items-center mt-1 text-[10px] text-emerald-600 font-bold">
                              <NavIcon size={10} className="mr-1" /> {pickup.distance} away
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase">
                          <Clock size={12} className="mr-1" />
                          {pickup.timestamp}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[8px] font-bold uppercase">Pending</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => onAcceptPickup(pickup.id)}
                        disabled={!!activePickup}
                        className={`flex-[2] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center transition-colors ${
                          activePickup 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        Accept Pickup
                      </button>
                      <button 
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => openInGoogleMaps(pickup.coordinates.lat, pickup.coordinates.lng)}
                        className="w-12 bg-gray-50 text-gray-600 py-2.5 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <MapIcon size={18} />
                      </button>
                    </div>
                    {activePickup && (
                      <p className="text-[9px] text-gray-400 mt-2 text-center italic">Complete your active pickup to accept more</p>
                    )}
                  </div>
                ))}
              </div>

              {requests.filter(r => r.status === 'completed').length > 0 && (
                <div className="pt-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recently Completed</h4>
                  <div className="space-y-3 opacity-60">
                    {requests.filter(r => r.status === 'completed').slice(0, 3).map(pickup => (
                      <div key={pickup.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <CheckCircle2 size={16} className="text-emerald-500 mr-2" />
                          <div>
                            <p className="text-xs font-bold text-gray-700">{pickup.address}</p>
                            <p className="text-[10px] text-gray-500">{pickup.wasteType}</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-600">+₹25</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'earnings' && (
          <div className="space-y-6">
            {/* Wallet Balance */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Wallet Balance</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">₹{driverStats.walletBalance.toLocaleString()}</h2>
              </div>
              <button className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm">
                Withdraw
              </button>
            </div>

            {/* Earnings Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Today's Earnings</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1">₹{driverStats.todayEarnings}</h3>
                <div className="flex items-center mt-2 text-emerald-600 text-[10px] font-bold">
                  <TrendingUp size={12} className="mr-1" /> {driverStats.todayPickups} Pickups
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Weekly Earnings</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1">₹{driverStats.weeklyEarnings}</h3>
                <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-[8px] text-gray-400 mt-1 font-medium">75% of weekly goal</p>
              </div>
            </div>

            {/* Payment History */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Payment History</h3>
                <button className="text-emerald-600 text-xs font-bold flex items-center">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {payments.map((payment: any) => (
                  <div key={payment.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mr-3">
                        <History size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Pickup Completed</p>
                        <p className="text-[10px] text-gray-400">{payment.timestamp} • {payment.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">+₹{payment.amount}</p>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        payment.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {payment.status || 'Completed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'rewards' && (
          <div className="space-y-6">
            {/* Eco Points Card */}
            <motion.div 
              animate={{ backgroundColor: ["#dcfce7", "#bbf7d0", "#dcfce7"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-3xl p-6 shadow-xl border border-green-200 relative overflow-hidden group"
            >
              {/* Premium Glow Effect */}
              <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-green-400/20 blur-3xl rounded-full z-0 group-hover:bg-green-400/30 transition-colors duration-500"></div>
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/40 blur-2xl rounded-full z-0"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 mr-3 shadow-sm border border-green-200">
                        <Recycle size={20} />
                      </div>
                      <p className="text-green-900 text-xs font-bold uppercase tracking-widest">Total Eco Points</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-5xl font-black text-green-900 tracking-tight drop-shadow-sm">
                        {(driverStats.ecoPoints || 850).toLocaleString()}
                      </h2>
                      <span className="text-green-600/60 font-bold text-xl">pts</span>
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <div className="px-3 py-1 bg-white text-green-700 rounded-full text-[10px] font-bold flex items-center shadow-sm border border-green-200">
                        <TrendingUp size={12} className="mr-1.5 text-emerald-500" />
                        Ranked #3 in your area
                      </div>
                      <div className="px-3 py-1 bg-white text-green-700 rounded-full text-[10px] font-bold flex items-center shadow-sm border border-green-200">
                        <Award size={12} className="mr-1.5 text-blue-500" />
                        Top 5% eco driver
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-600 to-green-500 p-5 rounded-2xl shadow-lg shadow-green-200 text-white transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <Leaf size={36} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Badges */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800">Your Badges</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Leaf, label: 'Green Hero', color: 'bg-emerald-100 text-emerald-600' },
                  { icon: Zap, label: 'Waste Warrior', color: 'bg-blue-100 text-blue-600' },
                  { icon: Award, label: 'Eco Champion', color: 'bg-purple-100 text-purple-600' },
                ].map((badge, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <div className={`w-12 h-12 ${badge.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <badge.icon size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-800 leading-tight">{badge.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Stores */}
            <div className="grid grid-cols-1 gap-4">
              <h3 className="font-bold text-gray-800">Partner Stores</h3>
              {PARTNER_STORES.map((reward) => {
                const canAfford = driverStats.ecoPoints >= reward.cost;
                const isRedeemed = redeemedId === reward.id;

                return (
                  <div 
                    key={reward.id} 
                    className={`bg-white border rounded-2xl p-4 flex items-center shadow-sm transition-all ${
                      canAfford ? 'border-green-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-3xl mr-4">
                      {reward.image}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{reward.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{reward.description}</p>
                      <div className="flex items-center text-green-700 font-bold text-sm">
                        <Ticket size={14} className="mr-1" /> {reward.cost} pts
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford || isRedeemed}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isRedeemed 
                          ? 'bg-green-100 text-green-800' 
                          : canAfford 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isRedeemed ? (
                        <span className="flex items-center"><CheckCircle2 size={14} className="mr-1" /> Claimed</span>
                      ) : (
                        'Redeem'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSection === 'impact' && (
          <div className="space-y-6">
            {/* Eco Impact Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-2">
                  <Leaf size={20} className="text-emerald-200 mr-2" />
                  <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Total CO2 Saved</p>
                </div>
                <h2 className="text-4xl font-bold">{driverStats.co2Reduction} <span className="text-xl font-normal">kg</span></h2>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-emerald-200 mb-1">
                      <Zap size={14} className="mr-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Plastic Recycled</span>
                    </div>
                    <p className="text-2xl font-bold">{driverStats.plasticRecycled} <span className="text-sm font-normal">kg</span></p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-emerald-200 mb-1">
                      <CheckCircle2 size={14} className="mr-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Total Cleanups</span>
                    </div>
                    <p className="text-2xl font-bold">{driverStats.totalCleanups}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-4">Impact Milestone</h4>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
                      Level 4 Eco-Warrior
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-emerald-600">
                      85%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-100">
                  <div style={{ width: "85%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
                </div>
                <p className="text-[10px] text-gray-500 text-center italic">"You've saved the equivalent of 12 trees this month!"</p>
              </div>
            </div>

            <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center hover:bg-gray-800 transition-all shadow-lg">
              <ExternalLink size={18} className="mr-2" /> Share Your Impact
            </button>

            {/* Leaderboard */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800">Top Drivers</h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.id} className={`p-4 flex justify-between items-center ${idx !== leaderboard.length - 1 ? 'border-b border-gray-50' : ''} ${entry.id === currentDriverId ? 'bg-emerald-50/50' : ''}`}>
                    <div className="flex items-center">
                      <div className="w-6 text-xs font-bold text-gray-400">#{entry.rank}</div>
                      <img src={entry.avatar} alt={entry.name} className="w-8 h-8 rounded-full mr-3 border-2 border-white shadow-sm" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">{entry.name}</p>
                        <p className="text-[10px] text-gray-500">{entry.points.toLocaleString()} pts</p>
                      </div>
                    </div>
                    {entry.rank === 1 && <Trophy size={16} className="text-yellow-500" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Green Box - Driver Impact */}
      <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Leaf size={20} />
            </div>
            <h3 className="font-bold text-emerald-900">The Green Box</h3>
          </div>
          <p className="text-emerald-800 text-sm font-medium leading-relaxed">
            "Eco-Driving Tip: Maintaining a steady speed and avoiding rapid acceleration can improve fuel efficiency by up to 30%."
          </p>
          <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold cursor-pointer hover:underline">
            View more driving tips <ChevronRight size={14} className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
