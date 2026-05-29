export enum WasteCategory {
  Plastic = 'Plastic',
  Metal = 'Metal',
  Glass = 'Glass',
  Paper = 'Paper',
  Organic = 'Organic',
  EWaste = 'E-Waste',
  Hazardous = 'Hazardous',
  Unknown = 'Unknown'
}

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  recyclableStatus: 'Recyclable' | 'Non-Recyclable' | 'Compostable';
  dustbinColor: string;
  disposalInstructions: string;
  environmentalTip: string;
}

export interface UserStats {
  points: number;
  streak: number;
  level: string;
  co2Saved: number; // in kg
  itemsRecycled: number;
}

export interface ScanResult {
  wasteType: string;
  category: WasteCategory;
  confidence: number;
  disposalTip: string;
  isHazardous: boolean;
  ecoPoints?: number;
}

export interface User {
  name: string;
  email: string;
  id: string;
  role: 'user' | 'driver' | 'municipality_admin';
  location?: { lat: number; lng: number };
  points: number;
  itemsRecycled: number;
  co2Saved: number;
  streak: number;
  dailyScansCount?: number;
  lastScanDate?: string;
  scannedImageHashes?: string[];
  driverStatus?: 'online' | 'offline';
  totalPickups?: number;
  rating?: number;
  walletBalance?: number;
}

export type Tab = 'home' | 'library' | 'scan' | 'analytics' | 'profile' | 'tracker' | 'driver' | 'rewards' | 'earnings' | 'impact' | 'admin_dashboard' | 'request_pickup' | 'support';

export interface PickupLocation {
  id: string;
  address: string;
  type: WasteCategory;
  status: 'pending' | 'accepted' | 'on_the_way' | 'arrived' | 'completed';
  timestamp: string;
  coordinates: { lat: number; lng: number };
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  image: string;
  code?: string;
}

export interface DriverStats {
  todayEarnings: number;
  todayPickups: number;
  weeklyEarnings: number;
  walletBalance: number;
  ecoPoints: number;
  rating: number;
  totalPickups: number;
  onTimeRate: number;
  wasteCollected: number; // kg
  plasticRecycled: number; // kg
  co2Reduction: number; // kg
  totalCleanups: number;
}

export interface PaymentRecord {
  id: string;
  location: string;
  wasteType: WasteCategory;
  amount: number;
  timestamp: string;
}

export interface DriverLeaderboardEntry {
  id: string;
  name: string;
  points: number;
  avatar: string;
  rank: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'pickup' | 'reward' | 'payment';
  timestamp: string;
  read: boolean;
  status: 'New' | 'Active' | 'Completed';
}

export interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'accepted' | 'on_the_way' | 'arrived' | 'completed';
  createdAt: string;
  weight?: number; // in kg
  imageUrl?: string;
  address: string;
  wasteType: WasteCategory;
  timestamp: string;
  coordinates: { lat: number; lng: number };
  assignedDriverId?: string;
  assignedDriverName?: string;
  driverLocation?: { lat: number; lng: number };
}

export interface Driver {
  id: string;
  name: string;
  status: 'Active' | 'Offline' | 'On Pickup';
  totalPickups: number;
  rating: number;
  avatar: string;
  location?: { lat: number; lng: number };
}

export interface GarbageHotspot {
  id: string;
  location: string;
  reportCount: number;
  coordinates: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high';
}

export interface CityStats {
  totalReportsToday: number;
  pickupsCompletedToday: number;
  activeDrivers: number;
  totalWasteCollected: number; // in tons
  totalUsers: number;
  totalPickups: number;
  totalDrivers: number;
}

export interface AdminSettings {
  defaultMapView: 'city' | 'hotspots' | 'pickups';
  notifications: {
    reports: boolean;
    delays: boolean;
    warnings: boolean;
  };
  management: {
    allowRegistration: boolean;
    autoApprove: boolean;
    maxDistance: number;
  };
  serviceZones: string[];
}

export interface AdminNotification {
  id: string;
  message: string;
  type: 'request' | 'completion' | 'driver';
  timestamp: string;
  read: boolean;
}
