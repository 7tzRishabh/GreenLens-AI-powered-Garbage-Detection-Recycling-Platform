export enum WasteCategory {
  Recyclable = 'Recyclable',
  NonRecyclable = 'Non-Recyclable',
  Wet = 'Wet',
  Dry = 'Dry',
  Hazardous = 'Hazardous',
}

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  description: string;
  disposalTip: string;
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
}

export interface User {
  name: string;
  email: string;
  id: string;
  role: 'user' | 'driver' | 'municipality_admin';
}

export type Tab = 'home' | 'library' | 'scan' | 'analytics' | 'profile' | 'tracker' | 'driver' | 'rewards' | 'earnings' | 'impact' | 'admin_dashboard';

export interface PickupLocation {
  id: string;
  address: string;
  type: WasteCategory;
  status: 'pending' | 'completed';
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
}

export interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  address: string;
  wasteType: WasteCategory;
  status: 'pending' | 'assigned' | 'accepted' | 'on_route' | 'completed';
  timestamp: string;
  coordinates: { lat: number; lng: number };
  assignedDriverId?: string;
}

export interface Driver {
  id: string;
  name: string;
  status: 'Active' | 'Offline' | 'On Pickup';
  totalPickups: number;
  rating: number;
  avatar: string;
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
}
