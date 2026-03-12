import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';
import { WasteLibrary } from './components/WasteLibrary';
import { Analytics } from './components/Analytics';
import { Profile } from './components/Profile';
import { Tracker } from './components/Tracker';
import { DriverView } from './components/DriverView';
import { Rewards } from './components/Rewards';
import { Login } from './components/Login';
import { MunicipalityAdminDashboard } from './components/MunicipalityAdminDashboard';
import { Tab, UserStats, ScanResult, WasteCategory, User, PickupRequest, DriverStats, PaymentRecord, DriverLeaderboardEntry, AppNotification, Driver, GarbageHotspot, CityStats } from './types';

// Mock initial user stats
const INITIAL_STATS: UserStats = {
  points: 850,
  streak: 5,
  level: 'Guardian',
  co2Saved: 12.5,
  itemsRecycled: 42
};

const INITIAL_DRIVER_STATS: DriverStats = {
  todayEarnings: 450,
  todayPickups: 8,
  weeklyEarnings: 2800,
  walletBalance: 1250,
  ecoPoints: 12500,
  rating: 4.9,
  totalPickups: 452,
  onTimeRate: 98,
  wasteCollected: 1240,
  plasticRecycled: 450,
  co2Reduction: 85,
  totalCleanups: 156
};

const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: 'p1', location: 'Sector 4 Market', wasteType: WasteCategory.Recyclable, amount: 45, timestamp: 'Today, 10:30 AM' },
  { id: 'p2', location: 'Eco Ave, Sector 2', wasteType: WasteCategory.Wet, amount: 30, timestamp: 'Today, 09:15 AM' },
  { id: 'p3', location: 'Green St, Sector 1', wasteType: WasteCategory.Hazardous, amount: 60, timestamp: 'Yesterday, 04:45 PM' },
];

const MOCK_LEADERBOARD: DriverLeaderboardEntry[] = [
  { id: 'd1', name: 'Rajesh Kumar', points: 15400, avatar: 'https://i.pravatar.cc/150?u=rajesh', rank: 1 },
  { id: 'd2', name: 'Amit Singh', points: 14200, avatar: 'https://i.pravatar.cc/150?u=amit', rank: 2 },
  { id: 'd3', name: 'Suresh Raina', points: 12500, avatar: 'https://i.pravatar.cc/150?u=suresh', rank: 3 },
  { id: 'd4', name: 'Vikram Batra', points: 11800, avatar: 'https://i.pravatar.cc/150?u=vikram', rank: 4 },
];

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'New Pickup Request', message: 'New request at Sector 5, 2km away.', type: 'pickup', timestamp: '2m ago', read: false },
  { id: 'n2', title: 'Payment Credited', message: '₹45 credited to your wallet for Sector 4 pickup.', type: 'payment', timestamp: '1h ago', read: true },
  { id: 'n3', title: 'Eco Points Earned', message: 'You earned 500 bonus points for 100% on-time rate!', type: 'reward', timestamp: '3h ago', read: true },
];

const MOCK_PICKUP_REQUESTS: PickupRequest[] = [
  {
    id: 'req-1',
    userId: 'user-1',
    userName: 'John Doe',
    address: '123 Green St, Sector 4',
    wasteType: WasteCategory.Recyclable,
    status: 'pending',
    timestamp: '10:30 AM',
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'req-2',
    userId: 'user-2',
    userName: 'Jane Smith',
    address: '456 Eco Ave, Sector 2',
    wasteType: WasteCategory.Wet,
    status: 'assigned',
    timestamp: '11:15 AM',
    coordinates: { lat: 37.7833, lng: -122.4167 },
    assignedDriverId: 'd1'
  }
];

const MOCK_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Rajesh Kumar', status: 'On Pickup', totalPickups: 452, rating: 4.9, avatar: 'https://i.pravatar.cc/150?u=rajesh' },
  { id: 'd2', name: 'Amit Singh', status: 'Active', totalPickups: 385, rating: 4.7, avatar: 'https://i.pravatar.cc/150?u=amit' },
  { id: 'd3', name: 'Suresh Raina', status: 'Offline', totalPickups: 290, rating: 4.8, avatar: 'https://i.pravatar.cc/150?u=suresh' },
];

const MOCK_HOTSPOTS: GarbageHotspot[] = [
  { id: 'h1', location: 'Sector 5 Market', reportCount: 15, coordinates: { lat: 45, lng: 30 }, severity: 'high' },
  { id: 'h2', location: 'Industrial Area Phase 2', reportCount: 12, coordinates: { lat: 60, lng: 50 }, severity: 'medium' },
  { id: 'h3', location: 'Central Park North', reportCount: 8, coordinates: { lat: 30, lng: 20 }, severity: 'low' },
];

const MOCK_CITY_STATS: CityStats = {
  totalReportsToday: 42,
  pickupsCompletedToday: 28,
  activeDrivers: 12,
  totalWasteCollected: 4.5
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_STATS);
  const [driverStats, setDriverStats] = useState<DriverStats>(INITIAL_DRIVER_STATS);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>(MOCK_PICKUP_REQUESTS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [hotspots, setHotspots] = useState<GarbageHotspot[]>(MOCK_HOTSPOTS);
  const [cityStats, setCityStats] = useState<CityStats>(MOCK_CITY_STATS);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Inactivity Logout Logic
  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_LIMIT) {
        handleLogout();
      }
    }, 60000); // Check every minute

    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [currentUser, lastActivity]);

  // Check for saved user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ecoSnapUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      if (user.role === 'driver') setActiveTab('driver');
      else if (user.role === 'municipality_admin') setActiveTab('admin_dashboard');
      else setActiveTab('home');
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('ecoSnapUser', JSON.stringify(user));
    setCurrentUser(user);
    if (user.role === 'driver') setActiveTab('driver');
    else if (user.role === 'municipality_admin') setActiveTab('admin_dashboard');
    else setActiveTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('ecoSnapUser');
    setCurrentUser(null);
    setActiveTab('home'); // Reset tab
  };

  // Gamification Logic
  const handleScanComplete = (result: ScanResult) => {
    // Award points based on category
    let pointsToAdd = 0;
    if (result.category === WasteCategory.Recyclable) pointsToAdd = 50;
    else if (result.category === WasteCategory.Wet) pointsToAdd = 30;
    else if (result.category === WasteCategory.Hazardous) pointsToAdd = 100; // Bonus for safe disposal
    else pointsToAdd = 10;

    setUserStats(prev => ({
      ...prev,
      points: prev.points + pointsToAdd,
      itemsRecycled: prev.itemsRecycled + 1,
      co2Saved: parseFloat((prev.co2Saved + 0.5).toFixed(1)) // Mock CO2 calc
    }));
  };

  const handleRedeem = (cost: number) => {
    setUserStats(prev => ({
      ...prev,
      points: prev.points - cost
    }));
  };

  const handleRequestPickup = (wasteType: WasteCategory, address: string) => {
    const newRequest: PickupRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser?.id || 'anon',
      userName: currentUser?.name || 'Anonymous',
      address: address,
      wasteType: wasteType,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      coordinates: { lat: 37.7749 + (Math.random() - 0.5) * 0.01, lng: -122.4194 + (Math.random() - 0.5) * 0.01 }
    };
    setPickupRequests(prev => [newRequest, ...prev]);
  };

  const handleUpdatePickupStatus = (id: string, status: 'accepted' | 'completed') => {
    setPickupRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    
    if (status === 'completed') {
      // Update driver stats on completion
      setDriverStats(prev => ({
        ...prev,
        todayEarnings: prev.todayEarnings + 50,
        todayPickups: prev.todayPickups + 1,
        walletBalance: prev.walletBalance + 50,
        ecoPoints: prev.ecoPoints + 100,
        totalPickups: prev.totalPickups + 1,
        wasteCollected: prev.wasteCollected + 5,
        totalCleanups: prev.totalCleanups + 1
      }));

      // Add notification
      const newNotif: AppNotification = {
        id: `n-${Date.now()}`,
        title: 'Pickup Completed',
        message: 'You earned ₹50 and 100 Eco Points!',
        type: 'payment',
        timestamp: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAssignDriver = (requestId: string, driverId: string) => {
    setPickupRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'assigned', assignedDriverId: driverId } : req
    ));
  };

  const handleRemoveDriver = (driverId: string) => {
    setDrivers(prev => prev.filter(d => d.id !== driverId));
  };

  const handleAddDriver = () => {
    const newDriver: Driver = {
      id: `d-${Date.now()}`,
      name: 'New Driver',
      status: 'Offline',
      totalPickups: 0,
      rating: 5.0,
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`
    };
    setDrivers(prev => [...prev, newDriver]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            userStats={userStats}
            currentUser={currentUser} 
            onScanClick={() => setActiveTab('scan')} 
            onTrackClick={() => setActiveTab('tracker')}
            onRewardsClick={() => setActiveTab('rewards')}
            onRequestPickup={handleRequestPickup}
          />
        );
      case 'scan':
        return <Scanner onScanComplete={handleScanComplete} />;
      case 'library':
        return <WasteLibrary />;
      case 'analytics':
        return <Analytics userStats={userStats} />;
      case 'profile':
        return <Profile userStats={userStats} currentUser={currentUser} onLogout={handleLogout} />;
      case 'tracker':
        return <Tracker onBack={() => setActiveTab('home')} />;
      case 'driver':
      case 'earnings':
      case 'impact':
      case 'rewards':
        if (currentUser?.role === 'driver') {
          return (
            <DriverView 
              requests={pickupRequests} 
              onUpdateStatus={handleUpdatePickupStatus}
              driverStats={driverStats}
              payments={MOCK_PAYMENTS}
              leaderboard={MOCK_LEADERBOARD}
              notifications={notifications}
              onMarkNotificationsRead={handleMarkNotificationsRead}
              activeSection={activeTab === 'driver' || activeTab === 'earnings' || activeTab === 'rewards' || activeTab === 'impact' ? activeTab : 'driver'}
            />
          );
        }
        if (activeTab === 'rewards') {
          return <Rewards userStats={userStats} onRedeem={handleRedeem} />;
        }
        return (
          <Dashboard 
            userStats={userStats} 
            currentUser={currentUser}
            onScanClick={() => setActiveTab('scan')} 
            onTrackClick={() => setActiveTab('tracker')}
            onRewardsClick={() => setActiveTab('rewards')}
            onRequestPickup={handleRequestPickup}
          />
        );
      default:
        return (
          <Dashboard 
            userStats={userStats} 
            currentUser={currentUser}
            onScanClick={() => setActiveTab('scan')} 
            onTrackClick={() => setActiveTab('tracker')}
            onRewardsClick={() => setActiveTab('rewards')}
            onRequestPickup={handleRequestPickup}
          />
        );
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-emerald-600">Loading...</div>;
  }

  // Auth Guard
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentUser.role === 'municipality_admin') {
    return (
      <MunicipalityAdminDashboard 
        stats={cityStats}
        requests={pickupRequests}
        drivers={drivers}
        hotspots={hotspots}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAssignDriver={handleAssignDriver}
        onRemoveDriver={handleRemoveDriver}
        onAddDriver={handleAddDriver}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Mobile-first container */}
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden">
        
        {/* Main Content Area */}
        <main className={`min-h-screen overflow-y-auto no-scrollbar scroll-smooth ${activeTab !== 'tracker' ? 'px-5 pt-8 pb-20' : ''}`}>
            {renderContent()}
        </main>

        {/* Navigation - Hide tracking bar when in detailed tracking view */}
        {activeTab !== 'tracker' && (
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
        )}
        
      </div>
      
      {/* Styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default App;