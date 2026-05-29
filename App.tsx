import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import { RequestPickup } from './components/RequestPickup';
import { Toast } from './components/Toast';
import { Tab, UserStats, ScanResult, WasteCategory, User, PickupRequest, DriverStats, PaymentRecord, DriverLeaderboardEntry, AppNotification, Driver, GarbageHotspot, CityStats, AdminSettings, AdminNotification } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, updateDoc, query, where, getDocs, addDoc, getDoc, deleteDoc, increment } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './utils/firestoreErrorHandler';

import { Support } from './components/Support';

// Mock initial user stats
const INITIAL_STATS: UserStats = {
  points: 120,
  streak: 5,
  level: 'Green Champion',
  co2Saved: 12.5,
  itemsRecycled: 42
};

const INITIAL_DRIVER_STATS: DriverStats = {
  todayEarnings: 500,
  todayPickups: 2,
  weeklyEarnings: 2500,
  walletBalance: 750,
  ecoPoints: 850,
  rating: 4.8,
  totalPickups: 2,
  onTimeRate: 95,
  wasteCollected: 150,
  plasticRecycled: 42,
  co2Reduction: 12.5,
  totalCleanups: 15
};

const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: 'p1', location: 'Sector 4 Market', wasteType: WasteCategory.Plastic, amount: 45, timestamp: 'Today, 10:30 AM' },
  { id: 'p2', location: 'Eco Ave, Sector 2', wasteType: WasteCategory.Organic, amount: 30, timestamp: 'Today, 09:15 AM' },
  { id: 'p3', location: 'Green St, Sector 1', wasteType: WasteCategory.Metal, amount: 60, timestamp: 'Yesterday, 04:45 PM' },
];

const MOCK_LEADERBOARD: DriverLeaderboardEntry[] = [
  { id: 'd1', name: 'Rajesh Kumar', points: 15400, avatar: 'https://i.pravatar.cc/150?u=rajesh', rank: 1 },
  { id: 'd2', name: 'Amit Singh', points: 14200, avatar: 'https://i.pravatar.cc/150?u=amit', rank: 2 },
  { id: 'd3', name: 'Suresh Raina', points: 12500, avatar: 'https://i.pravatar.cc/150?u=suresh', rank: 3 },
  { id: 'd4', name: 'Vikram Batra', points: 11800, avatar: 'https://i.pravatar.cc/150?u=vikram', rank: 4 },
];

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: '1', title: '🚚 New pickup request', message: 'Shiv Nagar', type: 'pickup', timestamp: '2 mins ago', read: false, status: 'New' },
  { id: '2', title: '📍 Pickup assigned', message: 'Napier Town', type: 'pickup', timestamp: '5 mins ago', read: false, status: 'Active' },
  { id: '3', title: '⚠️ Smart dustbin 70% full', message: 'Nearby alert', type: 'pickup', timestamp: '8 mins ago', read: false, status: 'Active' },
  { id: '4', title: '🚛 Driver on the way', message: 'To pickup location', type: 'pickup', timestamp: '10 mins ago', read: true, status: 'Active' },
  { id: '5', title: '✅ Pickup completed', message: 'Successfully delivered', type: 'payment', timestamp: '20 mins ago', read: true, status: 'Completed' },
];

const MOCK_HOTSPOTS: GarbageHotspot[] = [
  { id: 'h1', location: 'Shiv Nagar, Jabalpur', reportCount: 25, coordinates: { lat: 23.16, lng: 79.94 }, severity: 'high' },
  { id: 'h2', location: 'Napier Town, Jabalpur', reportCount: 18, coordinates: { lat: 23.17, lng: 79.93 }, severity: 'medium' },
  { id: 'h3', location: 'Adhartal, Jabalpur', reportCount: 12, coordinates: { lat: 23.19, lng: 79.95 }, severity: 'low' },
];

const MOCK_CITY_STATS: CityStats = {
  totalReportsToday: 60,
  pickupsCompletedToday: 12,
  activeDrivers: 25,
  totalWasteCollected: 150,
  totalUsers: 1250,
  totalPickups: 450,
  totalDrivers: 42
};

const MOCK_REWARD_HISTORY = [
  { id: 'r1', reason: 'Collection vehicle assigned', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), status: 'Active' },
  { id: 'r2', reason: 'Driver is on the way', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), status: 'Active' },
  { id: 'r3', reason: 'Smart dustbin is full', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), status: 'Active' },
  { id: 'r4', reason: 'Collection vehicle arrived', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), status: 'Completed' },
  { id: 'r5', reason: 'Garbage collection completed', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), status: 'Completed' },
];

const MOCK_PICKUP_REQUESTS: PickupRequest[] = [
  { id: 'p1', userId: 'u1', userName: 'User 1', address: 'Shiv Nagar, Jabalpur', wasteType: WasteCategory.Plastic, status: 'accepted', timestamp: '10 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.16, lng: 79.94 }, latitude: 23.16, longitude: 79.94 },
  { id: 'p2', userId: 'u2', userName: 'User 2', address: 'Napier Town, Jabalpur', wasteType: WasteCategory.Organic, status: 'pending', timestamp: '25 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.17, lng: 79.93 }, latitude: 23.17, longitude: 79.93 },
  { id: 'p3', userId: 'u3', userName: 'User 3', address: 'Adhartal, Jabalpur', wasteType: WasteCategory.Metal, status: 'completed', timestamp: '1 hour', createdAt: new Date().toISOString(), coordinates: { lat: 23.19, lng: 79.95 }, latitude: 23.19, longitude: 79.95 },
  { id: 'p4', userId: 'u4', userName: 'Virat Kohli', address: 'South Civil Lines, Jabalpur', wasteType: WasteCategory.Plastic, status: 'pending', timestamp: '5 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.15, lng: 79.92 }, latitude: 23.15, longitude: 79.92 },
  { id: 'p5', userId: 'u5', userName: 'MS Dhoni', address: 'Cantt, Jabalpur', wasteType: WasteCategory.Organic, status: 'accepted', timestamp: '15 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.14, lng: 79.96 }, latitude: 23.14, longitude: 79.96 },
  { id: 'p6', userId: 'u6', userName: 'Sachin Tendulkar', address: 'Madan Mahal, Jabalpur', wasteType: WasteCategory.Metal, status: 'completed', timestamp: '2 hours', createdAt: new Date().toISOString(), coordinates: { lat: 23.18, lng: 79.91 }, latitude: 23.18, longitude: 79.91 },
  { id: 'p7', userId: 'u7', userName: 'Hardik Pandya', address: 'Gokalpur, Jabalpur', wasteType: WasteCategory.Glass, status: 'pending', timestamp: '12 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.20, lng: 79.97 }, latitude: 23.20, longitude: 79.97 },
  { id: 'p8', userId: 'u8', userName: 'KL Rahul', address: 'Khamaria, Jabalpur', wasteType: WasteCategory.Paper, status: 'accepted', timestamp: '30 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.22, lng: 79.98 }, latitude: 23.22, longitude: 79.98 },
  { id: 'p9', userId: 'u9', userName: 'Rishabh Pant', address: 'Panagar, Jabalpur', wasteType: WasteCategory.Organic, status: 'pending', timestamp: '45 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.25, lng: 80.00 }, latitude: 23.25, longitude: 80.00 },
  { id: 'p10', userId: 'u10', userName: 'Jasprit Bumrah', address: 'Vijay Nagar, Jabalpur', wasteType: WasteCategory.Plastic, status: 'pending', timestamp: '8 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.18, lng: 79.92 }, latitude: 23.18, longitude: 79.92 },
  { id: 'p11', userId: 'u11', userName: 'Ravindra Jadeja', address: 'Wright Town, Jabalpur', wasteType: WasteCategory.Paper, status: 'pending', timestamp: '15 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.165, lng: 79.935 }, latitude: 23.165, longitude: 79.935 },
  { id: 'p12', userId: 'u12', userName: 'Shubman Gill', address: 'Gwarighat, Jabalpur', wasteType: WasteCategory.Organic, status: 'pending', timestamp: '20 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.12, lng: 79.95 }, latitude: 23.12, longitude: 79.95 },
  { id: 'p13', userId: 'u13', userName: 'Mohammed Shami', address: 'Ranjhi, Jabalpur', wasteType: WasteCategory.Metal, status: 'pending', timestamp: '35 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.19, lng: 80.01 }, latitude: 23.19, longitude: 80.01 },
  { id: 'p14', userId: 'u14', userName: 'Suryakumar Yadav', address: 'Garha, Jabalpur', wasteType: WasteCategory.Glass, status: 'pending', timestamp: '18 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.15, lng: 79.90 }, latitude: 23.15, longitude: 79.90 },
  { id: 'p15', userId: 'u15', userName: 'Shreyas Iyer', address: 'Bilhari, Jabalpur', wasteType: WasteCategory.Paper, status: 'pending', timestamp: '22 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.13, lng: 79.98 }, latitude: 23.13, longitude: 79.98 },
  { id: 'p16', userId: 'u16', userName: 'Ishan Kishan', address: 'Sadar, Jabalpur', wasteType: WasteCategory.Organic, status: 'pending', timestamp: '10 mins', createdAt: new Date().toISOString(), coordinates: { lat: 23.14, lng: 79.95 }, latitude: 23.14, longitude: 79.95 },
];

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);

  // Sync activeTab with route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path === '/scan') setActiveTab('scan');
    else if (path === '/library') setActiveTab('library');
    else if (path === '/analytics') setActiveTab('analytics');
    else if (path === '/profile') setActiveTab('profile');
    else if (path === '/tracker') setActiveTab('tracker');
    else if (path === '/request-pickup') setActiveTab('request_pickup');
    else if (path === '/support') setActiveTab('support');
    else if (path === '/rewards') setActiveTab('rewards');
    else if (path === '/wallet') setActiveTab('earnings');
    else if (path === '/leaderboard') setActiveTab('impact');
    else if (path === '/driver') setActiveTab('driver');
  }, [location.pathname]);

  // Sync route with activeTab (for backward compatibility with setActiveTab calls)
  const handleSetActiveTab = (tabOrFn: Tab | ((prev: Tab) => Tab)) => {
    const tab = typeof tabOrFn === 'function' ? tabOrFn(activeTab) : tabOrFn;
    setActiveTab(tab);
    if (tab === 'home') navigate('/');
    else if (tab === 'scan') navigate('/scan');
    else if (tab === 'library') navigate('/library');
    else if (tab === 'analytics') navigate('/analytics');
    else if (tab === 'profile') navigate('/profile');
    else if (tab === 'tracker') navigate('/tracker');
    else if (tab === 'request_pickup') navigate('/request-pickup');
    else if (tab === 'support') navigate('/support');
    else if (tab === 'rewards') navigate(currentUser?.role === 'driver' ? '/rewards' : '/rewards');
    else if (tab === 'driver') navigate('/driver');
    else if (tab === 'earnings') navigate('/wallet');
    else if (tab === 'impact') navigate('/leaderboard');
    else if (tab === 'admin_dashboard') navigate('/driver');
  };
  const [ecoPoints, setEcoPoints] = useState(() => Number(localStorage.getItem("ecoPoints")) || 120);

  useEffect(() => {
    localStorage.setItem("ecoPoints", ecoPoints.toString());
  }, [ecoPoints]);

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const savedStats = localStorage.getItem('userStats');
    return savedStats ? JSON.parse(savedStats) : INITIAL_STATS;
  });
  const [driverStats, setDriverStats] = useState<DriverStats>(INITIAL_DRIVER_STATS);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>(MOCK_PICKUP_REQUESTS);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [hotspots, setHotspots] = useState<GarbageHotspot[]>(MOCK_HOTSPOTS);
  const [cityStats, setCityStats] = useState<CityStats>(MOCK_CITY_STATS);

  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(userStats));
  }, [userStats]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    defaultMapView: 'city',
    notifications: { reports: true, delays: true, warnings: true },
    management: { allowRegistration: true, autoApprove: false, maxDistance: 15 },
    serviceZones: ['Sector 1-10', 'Downtown']
  });
  const [rewardHistory, setRewardHistory] = useState<any[]>(MOCK_REWARD_HISTORY);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [driverLocationError, setDriverLocationError] = useState<string | null>(null);

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

  // Firebase Auth Listener
  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = undefined;
      }

      if (user) {
        // Fetch user document
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as any;
            console.log("Firestore update received:", userData);
            const newPoints = userData.points ?? 120;
            const newStreak = userData.streak ?? 15;
            const newCo2 = userData.co2Saved ?? 2.4;
            const newRecycled = userData.itemsRecycled ?? 15;
            
            console.log("New points from Firestore:", newPoints);

            const appUser: User = {
              id: user.uid,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              points: newPoints,
              itemsRecycled: newRecycled,
              co2Saved: newCo2,
              streak: newStreak,
              dailyScansCount: userData.dailyScansCount || 0,
              lastScanDate: userData.lastScanDate || '',
              scannedImageHashes: userData.scannedImageHashes || []
            };
            setCurrentUser(appUser);

            // Auto-upgrade new users or users with 0 points for demo purposes
            if ((userData.points === 0 || userData.points === undefined) && 
                (userData.streak === 0 || userData.streak === undefined)) {
              updateDoc(userDocRef, {
                points: 120,
                streak: 15,
                co2Saved: 2.4,
                itemsRecycled: 15
              }).catch(console.error);
            }
            
            // Removed setUserStats here to prevent Firestore from overwriting local state in demo mode
            // setUserStats(prev => ({
            //   points: Math.max(prev.points, newPoints),
            //   streak: newStreak,
            //   level: Math.max(prev.points, newPoints) > 1000 ? 'Guardian' : 'Starter',
            //   co2Saved: Math.max(prev.co2Saved, newCo2),
            //   itemsRecycled: Math.max(prev.itemsRecycled, newRecycled)
            // }));

            if (userData.role === 'driver') {
              setDriverStats({
                ...INITIAL_DRIVER_STATS,
                totalPickups: userData.totalPickups || 0,
                rating: userData.rating || 5.0,
                walletBalance: userData.walletBalance || 0,
                ecoPoints: userData.points || 0,
              });
              handleSetActiveTab(prev => prev === 'home' ? 'driver' : prev);
            } else if (userData.role === 'municipality_admin') {
              handleSetActiveTab(prev => prev === 'home' ? 'admin_dashboard' : prev);
            }
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching user document:", error);
          setIsLoading(false);
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
      unsubscribe();
    };
  }, []);

  // Fetch Pickup Requests
  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(collection(db, 'pickupRequests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests: PickupRequest[] = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as PickupRequest);
      });
      // Sort by createdAt descending
      requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPickupRequests(requests.length > 0 ? requests : MOCK_PICKUP_REQUESTS);
    }, (error) => {
      console.error("Error fetching pickup requests:", error);
      handleFirestoreError(error, OperationType.GET, 'pickupRequests');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch Drivers
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'users'), where('role', '==', 'driver'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driversList: Driver[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        driversList.push({
          id: docSnap.id,
          name: data.name,
          status: data.driverStatus === 'online' ? 'Active' : 'Offline',
          totalPickups: data.totalPickups || 0,
          rating: data.rating || 5.0,
          avatar: `https://ui-avatars.com/api/?name=${data.name}&background=16a34a&color=fff`,
          location: data.location
        });
      });
      setDrivers(driversList);
    }, (error) => {
      console.error("Error fetching drivers:", error);
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch Notifications
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'municipality_admin') return;

    const q = query(collection(db, 'notifications'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: AdminNotification[] = [];
      snapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as AdminNotification);
      });
      setNotifications(notifications);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch Admin Settings
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'municipality_admin') return;

    const settingsRef = doc(db, 'admin_settings', 'config');
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AdminSettings);
      }
    }, (error) => {
      console.error("Error fetching admin settings:", error);
      handleFirestoreError(error, OperationType.GET, 'admin_settings/config');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Driver Location Tracking
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'driver') return;

    let watchId: number;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const userRef = doc(db, 'users', currentUser.id);
            await updateDoc(userRef, {
              location: { lat: latitude, lng: longitude }
            });
            setDriverLocationError(null);
          } catch (error) {
            console.error("Error updating driver location:", error);
            handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.id}`);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setDriverLocationError("Location access denied. Please enable location permissions to see your real-time location.");
          } else {
            setDriverLocationError("Could not get your location. Using default.");
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const userRef = doc(db, 'users', currentUser.id);
            await updateDoc(userRef, {
              location: { lat: latitude, lng: longitude }
            });
            setDriverLocationError(null);
          } catch (error) {
            console.error("Error updating driver location:", error);
            handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.id}`);
          }
        },
        (error) => {
          console.error("Error watching position:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setDriverLocationError("Geolocation is not supported by your browser.");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [currentUser]);

  // Fetch Drivers
  useEffect(() => {
    if (!currentUser) return;

    // If user is a regular user, they only need to fetch the driver assigned to their active request
    // If user is admin or driver, they might need the full list
    const q = query(collection(db, 'users'), where('role', '==', 'driver'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const driverList: Driver[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        driverList.push({
          id: doc.id,
          name: data.name,
          status: data.driverStatus || 'Offline',
          totalPickups: data.totalPickups || 0,
          rating: data.rating || 5.0,
          avatar: `https://i.pravatar.cc/150?u=${doc.id}`,
          location: data.location
        });
      });
      setDrivers(driverList);
    }, (error) => {
      console.error("Error fetching drivers:", error);
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch Reward History
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'rewardHistory'), where('userId', '==', currentUser.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history: any[] = [];
      snapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRewardHistory(history);
    }, (error) => {
      console.error("Error fetching reward history:", error);
      handleFirestoreError(error, OperationType.GET, 'rewardHistory');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Auto-assign simulation for demo
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') return;

    const pendingRequest = pickupRequests.find(r => r.userId === currentUser.id && r.status === 'pending');
    if (pendingRequest) {
      const timer = setTimeout(async () => {
        try {
          const requestRef = doc(db, 'pickupRequests', pendingRequest.id);
          await updateDoc(requestRef, {
            status: 'assigned',
            assignedDriverId: 'mock-driver-1',
            assignedDriverName: 'Rajesh Kumar'
          });
          
          // Add a notification
          setNotifications(prev => [{
            id: `n-${Date.now()}`,
            title: 'Driver Assigned',
            message: 'Rajesh Kumar is on his way for your pickup!',
            type: 'pickup',
            timestamp: 'Just now',
            read: false
          }, ...prev]);
        } catch (error) {
          console.error("Error in auto-assign simulation:", error);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pickupRequests, currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
    setCurrentUser(null);
    handleSetActiveTab('home'); // Reset tab
  };

  const handleStatusChange = async (status: 'online' | 'offline') => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, { driverStatus: status });
    } catch (error) {
      console.error("Error updating status:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  // Gamification Logic
  const handleScanComplete = async (result: ScanResult, imageData?: string) => {
    if (!currentUser) return;

    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'users', currentUser.id);
    
    // Fetch latest user data to check limits
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() as any : null;

    if (!userData) {
      console.error("User data not found in Firestore for ID:", currentUser.id);
      setError("User profile not found. Please try logging out and in again.");
      return;
    }

    const dailyScansCount = userData.lastScanDate === today ? (userData.dailyScansCount || 0) : 0;
    const scannedImageHashes = userData.scannedImageHashes || [];

    // 1. Prevent Abuse: Limit to 10 rewarded scans per day
    if (dailyScansCount >= 10) {
      setNotifications(prev => [{
        id: `n-${Date.now()}`,
        title: 'Daily Limit Reached',
        message: 'You have reached the limit of 10 rewarded scans for today. You can still scan, but won\'t earn points.',
        type: 'reward',
        timestamp: 'Just now',
        read: false
      }, ...prev]);
      return;
    }

    // 2. Prevent Abuse: Duplicate scans of the same image
    let imageHash = '';
    if (imageData) {
      // Simple hash function for string
      let hash = 0;
      for (let i = 0; i < imageData.length; i++) {
        const char = imageData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      imageHash = hash.toString();
      
      if (scannedImageHashes.includes(imageHash)) {
        setNotifications(prev => [{
          id: `n-${Date.now()}`,
          title: 'Duplicate Scan',
          message: 'This item has already been scanned and rewarded.',
          type: 'reward',
          timestamp: 'Just now',
          read: false
        }, ...prev]);
        return;
      }
    }

    const pointsToAdd = result.ecoPoints || Math.floor(Math.random() * (60 - 20 + 1) + 20); // Use points from Scanner or random
    console.log("Points to add:", pointsToAdd);
    
    // Optimistic update
    setUserStats(prev => {
        console.log("Optimistic update, prev points:", prev.points);
        return {
            ...prev,
            points: prev.points + pointsToAdd,
            itemsRecycled: prev.itemsRecycled + 1,
            co2Saved: parseFloat((prev.co2Saved + 0.2).toFixed(1))
        };
    });

    setPointsEarned(pointsToAdd);
    setTimeout(() => setPointsEarned(null), 3000); // Reset after animation

    try {
      const newScannedHashes = imageHash ? [...scannedImageHashes, imageHash].slice(-100) : scannedImageHashes;
      
      const updateData: any = {
        points: increment(pointsToAdd),
        itemsRecycled: increment(1),
        co2Saved: increment(0.2),
        lastScanDate: today,
        scannedImageHashes: newScannedHashes
      };

      if (userData.lastScanDate === today) {
        updateData.dailyScansCount = increment(1);
      } else {
        updateData.dailyScansCount = 1;
      }

      console.log("Updating Firestore with:", updateData);
      await updateDoc(userRef, updateData);
      console.log("Firestore updated successfully");

      await addDoc(collection(db, 'rewardHistory'), {
        userId: currentUser.id,
        points: pointsToAdd,
        reason: `Scanned ${result.wasteType}`,
        timestamp: new Date().toISOString()
      });

      setNotifications(prev => [{
        id: `n-${Date.now()}`,
        title: 'Points Earned!',
        message: `🎉 You earned ${pointsToAdd} EcoPoints for recycling!`,
        type: 'reward',
        timestamp: 'Just now',
        read: false
      }, ...prev]);
      setToastMessage(`🎉 You earned ${pointsToAdd} EcoPoints for recycling!`);

    } catch (error) {
      console.error("Error updating user stats:", error);
      // Removed revert logic to ensure local state persists in demo mode
      // handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.id}`);
    }
  };

  const handleRedeem = async (cost: number) => {
    if (!currentUser) return;
    try {
      // Optimistic update
      setEcoPoints(prev => prev - cost);
      setUserStats(prev => ({
        ...prev,
        points: prev.points - cost
      }));

      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        points: increment(-cost)
      });

      await addDoc(collection(db, 'rewardHistory'), {
        userId: currentUser.id,
        points: -cost,
        reason: 'Redeemed reward',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error redeeming points:", error);
      // Removed revert logic to ensure local state persists in demo mode
      // handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.id}`);
    }
  };

  const handleRequestPickup = async (wasteType: WasteCategory, address: string, imageUrl?: string, coordinates?: {lat: number, lng: number}) => {
    if (!currentUser) return;

    const lat = coordinates?.lat ?? 0;
    const lng = coordinates?.lng ?? 0;
    
    try {
      const pickupRef = collection(db, 'pickupRequests');
      await addDoc(pickupRef, {
        userId: currentUser.id,
        userName: currentUser.name,
        latitude: lat,
        longitude: lng,
        wasteType,
        address,
        imageUrl: imageUrl || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        coordinates: { lat, lng }
      });

      setNotifications(prev => [{
        id: `n-${Date.now()}`,
        title: 'Pickup Requested',
        message: `Your ${wasteType} pickup request has been placed. Finding nearby drivers...`,
        type: 'pickup',
        timestamp: 'Just now',
        read: false,
        status: 'New'
      }, ...prev]);

      setToastMessage("Pickup request sent successfully. Finding a driver...");
      handleSetActiveTab('tracker');

    } catch (error) {
      console.error("Error requesting pickup:", error);
      handleFirestoreError(error, OperationType.CREATE, 'pickupRequests');
    }
  };

  const handleUpdateDriverStatus = async (status: 'online' | 'offline') => {
    if (!currentUser || currentUser.role !== 'driver') return;
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, { driverStatus: status });
      setToastMessage(`You are now ${status}`);
    } catch (error) {
      console.error("Error updating driver status:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.id}`);
    }
  };

  const handleDriverLocationUpdate = async (location: { lat: number; lng: number }) => {
    if (!currentUser || currentUser.role !== 'driver') return;

    // Update local state
    setCurrentUser(prev => prev ? { ...prev, location } : null);

    // Update Firestore user document
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, { location });

      // Also update any active pickup requests assigned to this driver
      const activeRequests = pickupRequests.filter(r => 
        r.assignedDriverId === currentUser.id && 
        ['accepted', 'on_the_way', 'arrived'].includes(r.status)
      );

      for (const req of activeRequests) {
        const reqRef = doc(db, 'pickupRequests', req.id);
        await updateDoc(reqRef, { driverLocation: location });
      }
    } catch (error) {
      console.error("Error updating driver location:", error);
    }
  };

  const handleAcceptPickup = async (requestId: string) => {
    if (!currentUser || currentUser.role !== 'driver') return;
    try {
      const requestRef = doc(db, 'pickupRequests', requestId);
      const requestSnap = await getDoc(requestRef);
      const requestData = requestSnap.data() as PickupRequest;
      
      // Use driver's real location or a point ~8km away from the request for a realistic demo start
      const driverLoc = currentUser.location || { 
        lat: (requestData.coordinates?.lat || 23.18) + 0.06, 
        lng: (requestData.coordinates?.lng || 79.98) + 0.04 
      };

      await updateDoc(requestRef, {
        status: 'accepted',
        assignedDriverId: currentUser.id,
        assignedDriverName: currentUser.name,
        driverLocation: driverLoc
      });

      await addDoc(collection(db, 'notifications'), {
        userId: requestData.userId,
        title: 'Driver Assigned',
        message: `${currentUser.name} is on the way for your pickup!`,
        type: 'pickup',
        timestamp: new Date().toISOString(),
        read: false
      });

      setToastMessage("Pickup accepted! Start moving to the location.");
    } catch (error) {
      console.error("Error accepting pickup:", error);
      handleFirestoreError(error, OperationType.UPDATE, `pickupRequests/${requestId}`);
    }
  };

  const handleUpdatePickupStatus = async (requestId: string, status: 'on_the_way' | 'arrived' | 'completed') => {
    if (!currentUser || currentUser.role !== 'driver') return;
    try {
      const requestRef = doc(db, 'pickupRequests', requestId);
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completionTime = new Date().toISOString();
        
        const requestSnap = await getDoc(requestRef);
        const requestData = requestSnap.data() as PickupRequest;
        
        const userRef = doc(db, 'users', requestData.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const pointsForUser = 50;
          await updateDoc(userRef, {
            points: (userData.points || 0) + pointsForUser,
            itemsRecycled: (userData.itemsRecycled || 0) + 1
          });

          await addDoc(collection(db, 'rewardHistory'), {
            userId: requestData.userId,
            points: pointsForUser,
            reason: `Pickup completed`,
            timestamp: new Date().toISOString()
          });
        }

        const driverRef = doc(db, 'users', currentUser.id);
        const driverSnap = await getDoc(driverRef);
        if (driverSnap.exists()) {
          const driverData = driverSnap.data();
          await updateDoc(driverRef, {
            totalPickups: (driverData.totalPickups || 0) + 1,
            walletBalance: (driverData.walletBalance || 0) + 25
          });
        }
      }

      await updateDoc(requestRef, updateData);
      setToastMessage(`Status updated to ${status.replace(/_/g, ' ')}`);
    } catch (error) {
      console.error("Error updating pickup status:", error);
      handleFirestoreError(error, OperationType.UPDATE, `pickupRequests/${requestId}`);
    }
  };

  const handleCancelPickup = async (requestId: string) => {
    if (!currentUser) return;
    try {
      const requestRef = doc(db, 'pickupRequests', requestId);
      await deleteDoc(requestRef);
      handleSetActiveTab('home');
      setToastMessage("Pickup request cancelled.");
    } catch (error) {
      console.error("Error cancelling pickup:", error);
      handleFirestoreError(error, OperationType.DELETE, `pickupRequests/${requestId}`);
    }
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAssignDriver = async (requestId: string, driverId: string) => {
    try {
      const requestRef = doc(db, 'pickupRequests', requestId);
      const driver = drivers.find(d => d.id === driverId);
      await updateDoc(requestRef, { 
        status: 'accepted', 
        assignedDriverId: driverId,
        assignedDriverName: driver?.name || 'Driver'
      });
    } catch (error) {
      console.error("Error assigning driver:", error);
      handleFirestoreError(error, OperationType.UPDATE, `pickupRequests/${requestId}`);
    }
  };

  const handleUpdateSettings = async (newSettings: AdminSettings) => {
    try {
      const settingsRef = doc(db, 'admin_settings', 'config');
      await setDoc(settingsRef, newSettings, { merge: true });
    } catch (error) {
      console.error("Error updating settings:", error);
      handleFirestoreError(error, OperationType.UPDATE, 'admin_settings/config');
    }
  };

  const handleRemoveDriver = async (driverId: string) => {
    try {
      // In a real app, we might just mark them as inactive or delete the user doc
      // For now, we'll just update their role or status
      const driverRef = doc(db, 'users', driverId);
      await updateDoc(driverRef, { driverStatus: 'Offline' });
    } catch (error) {
      console.error("Error removing driver:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${driverId}`);
    }
  };

  const handleAddDriver = async (driverData: any) => {
    try {
      // In a real app, we would use Firebase Admin SDK to create the user
      // For now, we will add the driver to the 'users' collection
      await addDoc(collection(db, 'users'), {
        ...driverData,
        role: 'driver',
        driverStatus: 'Offline',
        totalPickups: 0,
        rating: 5.0,
        walletBalance: 0,
        createdAt: new Date().toISOString()
      });
      setToastMessage("Driver added successfully.");
    } catch (error) {
      console.error("Error adding driver:", error);
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-emerald-600">Loading...</div>;
  }

  // Auth Guard
  if (!currentUser) {
    return <Login />;
  }

  if (currentUser.role === 'municipality_admin') {
    const derivedCityStats = {
      totalReportsToday: pickupRequests.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length,
      pickupsCompletedToday: pickupRequests.filter(r => r.status === 'completed' && new Date(r.completionTime || r.timestamp).toDateString() === new Date().toDateString()).length,
      activeDrivers: drivers.filter(d => d.status === 'Active').length,
      totalWasteCollected: parseFloat((pickupRequests.filter(r => r.status === 'completed').length * 1.5).toFixed(1))
    };

    return (
      <MunicipalityAdminDashboard 
        stats={derivedCityStats}
        requests={pickupRequests}
        drivers={drivers}
        hotspots={hotspots}
        notifications={notifications}
        settings={settings}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAssignDriver={handleAssignDriver}
        onRemoveDriver={handleRemoveDriver}
        onAddDriver={handleAddDriver}
        onUpdateSettings={handleUpdateSettings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Mobile-first container */}
      <div className="max-w-md mx-auto bg-white h-[100dvh] relative shadow-2xl overflow-hidden flex flex-col">
        
        {/* Toast Notification */}
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}

        {/* Main Content Area */}
        <main className={`flex-1 no-scrollbar scroll-smooth flex flex-col ${(activeTab !== 'tracker' && activeTab !== 'request_pickup' && activeTab !== 'support') ? 'px-5 pt-8 pb-6' : ''} ${activeTab === 'support' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  userStats={userStats}
                  ecoPoints={ecoPoints}
                  currentUser={currentUser} 
                  onScanClick={() => handleSetActiveTab('scan')} 
                  onTrackClick={() => handleSetActiveTab('tracker')}
                  onRewardsClick={() => handleSetActiveTab('rewards')}
                  onRequestPickup={() => handleSetActiveTab('request_pickup')}
                  pickupRequests={pickupRequests}
                  rewardHistory={rewardHistory}
                  pointsEarned={pointsEarned}
                />
              } />
              <Route path="/scan" element={
                <Scanner 
                  onScanComplete={(result, imageData) => handleScanComplete(result, imageData)} 
                  onRequestPickup={(wasteType, address, imageUrl) => handleRequestPickup(wasteType, address, imageUrl)}
                  setEcoPoints={setEcoPoints}
                />
              } />
              <Route path="/library" element={<WasteLibrary />} />
              <Route path="/analytics" element={<Analytics userStats={userStats} />} />
              <Route path="/profile" element={
                <Profile userStats={userStats} driverStats={driverStats} currentUser={currentUser} onLogout={handleLogout} onStatusChange={handleStatusChange} />
              } />
              <Route path="/tracker" element={
                <Tracker 
                  onBack={() => handleSetActiveTab('home')} 
                  activeRequest={pickupRequests.find(r => r.userId === currentUser?.id && r.status !== 'completed')} 
                  assignedDriver={pickupRequests.find(r => r.userId === currentUser?.id && r.status !== 'completed')?.assignedDriverId ? drivers.find(d => d.id === pickupRequests.find(r => r.userId === currentUser?.id && r.status !== 'completed')?.assignedDriverId) : undefined} 
                />
              } />
              <Route path="/request-pickup" element={
                <RequestPickup 
                  onBack={() => handleSetActiveTab('home')}
                  onSubmit={(wasteType, address, imageUrl, coordinates) => {
                    handleRequestPickup(wasteType, address, imageUrl, coordinates);
                  }}
                />
              } />
              <Route path="/support" element={<Support />} />
              <Route path="/rewards" element={
                currentUser?.role === 'driver' ? (
                  <DriverView 
                    requests={pickupRequests} 
                    onAcceptPickup={handleAcceptPickup}
                    onUpdateStatus={handleUpdatePickupStatus}
                    driverStats={driverStats}
                    payments={pickupRequests
                      .filter(req => req.status === 'completed' && req.assignedDriverId === currentUser.id)
                      .map(req => ({
                        id: req.id,
                        location: req.address,
                        wasteType: req.wasteType,
                        amount: 50,
                        timestamp: new Date(req.completionTime || req.timestamp).toLocaleString()
                      }))}
                    leaderboard={drivers
                      .sort((a, b) => (b.totalPickups || 0) - (a.totalPickups || 0))
                      .map((d, index) => ({
                        id: d.id,
                        name: d.name,
                        points: (d.totalPickups || 0) * 100,
                        avatar: d.avatar,
                        rank: index + 1
                      }))}
                    notifications={MOCK_NOTIFICATIONS}
                    onMarkNotificationsRead={handleMarkNotificationsRead}
                    activeSection="rewards"
                    currentDriverId={currentUser.id}
                    driverLocation={currentUser.location}
                    onLocationUpdate={handleDriverLocationUpdate}
                    locationError={driverLocationError}
                    currentUser={currentUser}
                    onStatusChange={handleUpdateDriverStatus}
                  />
                ) : <Rewards userStats={userStats} onRedeem={handleRedeem} />
              } />
              {/* Driver Routes */}
              <Route path="/wallet" element={
                currentUser?.role === 'driver' ? (
                  <DriverView 
                    requests={pickupRequests} 
                    onAcceptPickup={handleAcceptPickup}
                    onUpdateStatus={handleUpdatePickupStatus}
                    driverStats={driverStats}
                    payments={pickupRequests
                      .filter(req => req.status === 'completed' && req.assignedDriverId === currentUser.id)
                      .map(req => ({
                        id: req.id,
                        location: req.address,
                        wasteType: req.wasteType,
                        amount: 50,
                        timestamp: new Date(req.completionTime || req.timestamp).toLocaleString()
                      }))}
                    leaderboard={drivers
                      .sort((a, b) => (b.totalPickups || 0) - (a.totalPickups || 0))
                      .map((d, index) => ({
                        id: d.id,
                        name: d.name,
                        points: (d.totalPickups || 0) * 100,
                        avatar: d.avatar,
                        rank: index + 1
                      }))}
                    notifications={MOCK_NOTIFICATIONS}
                    onMarkNotificationsRead={handleMarkNotificationsRead}
                    activeSection="earnings"
                    currentDriverId={currentUser.id}
                    driverLocation={currentUser.location}
                    onLocationUpdate={handleDriverLocationUpdate}
                    locationError={driverLocationError}
                    currentUser={currentUser}
                    onStatusChange={handleUpdateDriverStatus}
                  />
                ) : <Dashboard userStats={userStats} currentUser={currentUser} onScanClick={() => handleSetActiveTab('scan')} onTrackClick={() => handleSetActiveTab('tracker')} onRewardsClick={() => handleSetActiveTab('rewards')} onRequestPickup={() => handleSetActiveTab('request_pickup')} pickupRequests={pickupRequests} rewardHistory={rewardHistory} />
              } />
              <Route path="/leaderboard" element={
                currentUser?.role === 'driver' ? (
                  <DriverView 
                    requests={pickupRequests} 
                    onAcceptPickup={handleAcceptPickup}
                    onUpdateStatus={handleUpdatePickupStatus}
                    driverStats={driverStats}
                    payments={pickupRequests
                      .filter(req => req.status === 'completed' && req.assignedDriverId === currentUser.id)
                      .map(req => ({
                        id: req.id,
                        location: req.address,
                        wasteType: req.wasteType,
                        amount: 50,
                        timestamp: new Date(req.completionTime || req.timestamp).toLocaleString()
                      }))}
                    leaderboard={drivers
                      .sort((a, b) => (b.totalPickups || 0) - (a.totalPickups || 0))
                      .map((d, index) => ({
                        id: d.id,
                        name: d.name,
                        points: (d.totalPickups || 0) * 100,
                        avatar: d.avatar,
                        rank: index + 1
                      }))}
                    notifications={MOCK_NOTIFICATIONS}
                    onMarkNotificationsRead={handleMarkNotificationsRead}
                    activeSection="impact"
                    currentDriverId={currentUser.id}
                    driverLocation={currentUser.location}
                    onLocationUpdate={handleDriverLocationUpdate}
                    locationError={driverLocationError}
                    currentUser={currentUser}
                    onStatusChange={handleUpdateDriverStatus}
                  />
                ) : <Dashboard userStats={userStats} currentUser={currentUser} onScanClick={() => handleSetActiveTab('scan')} onTrackClick={() => handleSetActiveTab('tracker')} onRewardsClick={() => handleSetActiveTab('rewards')} onRequestPickup={() => handleSetActiveTab('request_pickup')} pickupRequests={pickupRequests} rewardHistory={rewardHistory} />
              } />
              <Route path="/driver" element={
                currentUser?.role === 'driver' ? (
                  <DriverView 
                    requests={pickupRequests} 
                    onAcceptPickup={handleAcceptPickup}
                    onUpdateStatus={handleUpdatePickupStatus}
                    driverStats={driverStats}
                    payments={pickupRequests
                      .filter(req => req.status === 'completed' && req.assignedDriverId === currentUser.id)
                      .map(req => ({
                        id: req.id,
                        location: req.address,
                        wasteType: req.wasteType,
                        amount: 50,
                        timestamp: new Date(req.completionTime || req.timestamp).toLocaleString()
                      }))}
                    leaderboard={drivers
                      .sort((a, b) => (b.totalPickups || 0) - (a.totalPickups || 0))
                      .map((d, index) => ({
                        id: d.id,
                        name: d.name,
                        points: (d.totalPickups || 0) * 100,
                        avatar: d.avatar,
                        rank: index + 1
                      }))}
                    notifications={MOCK_NOTIFICATIONS}
                    onMarkNotificationsRead={handleMarkNotificationsRead}
                    activeSection={
                      activeTab === 'earnings' ? 'earnings' : 
                      activeTab === 'impact' ? 'impact' : 
                      activeTab === 'rewards' ? 'rewards' : 'driver'
                    }
                    currentDriverId={currentUser.id}
                    driverLocation={currentUser.location}
                    onLocationUpdate={handleDriverLocationUpdate}
                    locationError={driverLocationError}
                    currentUser={currentUser}
                    onStatusChange={handleUpdateDriverStatus}
                  />
                ) : <Dashboard userStats={userStats} currentUser={currentUser} onScanClick={() => handleSetActiveTab('scan')} onTrackClick={() => handleSetActiveTab('tracker')} onRewardsClick={() => handleSetActiveTab('rewards')} onRequestPickup={() => handleSetActiveTab('request_pickup')} pickupRequests={pickupRequests} rewardHistory={rewardHistory} />
              } />
            </Routes>
        </main>

        {/* Navigation - Hide tracking bar when in detailed tracking view */}
        {(activeTab !== 'tracker' && activeTab !== 'request_pickup') && (
          <div className="sticky bottom-0 w-full z-50 bg-white">
            <Navigation activeTab={activeTab} setActiveTab={handleSetActiveTab} currentUser={currentUser} />
          </div>
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