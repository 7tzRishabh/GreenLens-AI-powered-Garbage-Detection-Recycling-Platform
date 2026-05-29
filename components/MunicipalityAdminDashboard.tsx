import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Users, 
  ClipboardList, 
  BarChart3, 
  AlertTriangle, 
  Bell, 
  Settings,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  User as UserIcon,
  Shield,
  Smartphone,
  Globe,
  Mail as MailIcon,
  Camera,
  Lock as LockIcon,
  Eye,
  EyeOff,
  Save,
  Menu,
  X,
  Maximize2,
  Recycle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { DemoMap } from './DemoMap';
import { 
  CityStats, 
  PickupRequest, 
  Driver, 
  GarbageHotspot, 
  AdminNotification, 
  AdminSettings,
  WasteCategory
} from '../types';

interface MunicipalityAdminDashboardProps {
  stats: CityStats;
  requests: PickupRequest[];
  drivers: Driver[];
  hotspots: GarbageHotspot[];
  notifications: AdminNotification[];
  settings: AdminSettings;
  currentUser: { name: string; email: string };
  onLogout: () => void;
  onAssignDriver: (requestId: string, driverId: string) => void;
  onRemoveDriver: (driverId: string) => void;
  onAddDriver: (driverData: any) => void;
  onUpdateSettings: (settings: AdminSettings) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const MunicipalityAdminDashboard: React.FC<MunicipalityAdminDashboardProps> = ({
  stats,
  requests,
  drivers,
  hotspots,
  notifications,
  settings: initialSettings,
  currentUser,
  onLogout,
  onAssignDriver,
  onRemoveDriver,
  onAddDriver,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'drivers' | 'pickups' | 'analytics' | 'hotspots' | 'settings' | 'profile' | 'users' | 'dustbins'>('overview');
  const [wasteFilter, setWasteFilter] = useState<string>('all');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMainMapExpanded, setIsMainMapExpanded] = useState(false);
  const [isHotspotMapExpanded, setIsHotspotMapExpanded] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);

  // Update local settings when props change
  React.useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  // Driver State
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleNumber: '',
    sector: ''
  });

  // Map State
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);

  // Profile State
  const [profile, setProfile] = useState({
    name: currentUser.name,
    email: currentUser.email,
    city: 'Metropolis City',
    phone: '+91 98765 43210'
  });

  // Mock data for charts
  const wasteData = [
    { name: 'Plastic', value: 450 },
    { name: 'Organic', value: 620 },
    { name: 'Metal', value: 180 },
    { name: 'E-Waste', value: 120 },
    { name: 'Paper', value: 310 },
  ];

  const trendData = [
    { name: 'Mon', reports: 45, pickups: 40, revenue: 1200 },
    { name: 'Tue', reports: 52, pickups: 48, revenue: 1500 },
    { name: 'Wed', reports: 48, pickups: 45, revenue: 1350 },
    { name: 'Thu', reports: 61, pickups: 55, revenue: 1800 },
    { name: 'Fri', reports: 55, pickups: 50, revenue: 1650 },
    { name: 'Sat', reports: 67, pickups: 60, revenue: 2100 },
    { name: 'Sun', reports: 40, pickups: 38, revenue: 1100 },
  ];

  const MOCK_PICKUP_REQUESTS: any[] = [
    { id: '1', user: 'Rohit Sharma', location: 'Napier Town', type: 'Plastic', status: 'NEW', driver: '-', priority: 'High' },
    { id: '2', user: 'Anjali Verma', location: 'Adhartal', type: 'Organic', status: 'ASSIGNED', driver: 'Rajesh Kumar', priority: 'Medium' },
    { id: '3', user: 'Vikram Singh', location: 'Civil Lines', type: 'Metal', status: 'COMPLETED', driver: 'Suresh Pal', priority: 'Low' },
    { id: '4', user: 'Priya Das', location: 'Vijay Nagar', type: 'E-Waste', status: 'NEW', driver: '-', priority: 'High' },
    { id: '5', user: 'Amit Patel', location: 'Wright Town', type: 'Paper', status: 'ASSIGNED', driver: 'Mahesh Singh', priority: 'Medium' },
    { id: '6', user: 'Sonal Jain', location: 'Gwarighat', type: 'Organic', status: 'NEW', driver: '-', priority: 'Low' },
    { id: '7', user: 'Karan Mehra', location: 'Ranjhi', type: 'Plastic', status: 'ASSIGNED', driver: 'Rajesh Kumar', priority: 'High' },
    { id: '8', user: 'Suresh Raina', location: 'Bilhari', type: 'E-Waste', status: 'NEW', driver: '-', priority: 'Medium' },
    { id: '9', user: 'Deepika Padukone', location: 'Gorakhpur', type: 'Metal', status: 'NEW', driver: '-', priority: 'High' },
    { id: '10', user: 'Virat Kohli', location: 'South Civil Lines', type: 'Plastic', status: 'NEW', driver: '-', priority: 'High' },
    { id: '11', user: 'MS Dhoni', location: 'Cantt', type: 'Organic', status: 'ASSIGNED', driver: 'Dinesh Karthik', priority: 'Medium' },
    { id: '12', user: 'Sachin Tendulkar', location: 'Madan Mahal', type: 'Metal', status: 'COMPLETED', driver: 'Suresh Pal', priority: 'Low' },
    { id: '13', user: 'Hardik Pandya', location: 'Gokalpur', type: 'E-Waste', status: 'NEW', driver: '-', priority: 'High' },
    { id: '14', user: 'KL Rahul', location: 'Khamaria', type: 'Paper', status: 'ASSIGNED', driver: 'Mahesh Singh', priority: 'Medium' },
    { id: '15', user: 'Rishabh Pant', location: 'Panagar', type: 'Organic', status: 'NEW', driver: '-', priority: 'Low' },
  ];

  const MOCK_ACTIVE_DRIVERS: any[] = [
    { id: 'd1', name: 'Rajesh Kumar', status: 'Active', pickups: 4, rating: 4.8, vehicle: 'Truck-04', battery: '82%' },
    { id: 'd2', name: 'Suresh Pal', status: 'Active', pickups: 2, rating: 4.5, vehicle: 'Truck-12', battery: '45%' },
    { id: 'd3', name: 'Mahesh Singh', status: 'Offline', pickups: 0, rating: 4.2, vehicle: 'Van-03', battery: '12%' },
    { id: 'd4', name: 'Dinesh Karthik', status: 'Active', pickups: 5, rating: 4.9, vehicle: 'Truck-09', battery: '91%' },
    { id: 'd5', name: 'Arun Jaitley', status: 'Active', pickups: 1, rating: 4.0, vehicle: 'Van-07', battery: '68%' },
  ];

  const MOCK_ALERTS: any[] = [
    { id: 'a1', message: 'High garbage reported in Napier Town', type: 'critical', time: '5m ago' },
    { id: 'a2', message: 'Driver Rajesh assigned to Adhartal request', type: 'info', time: '12m ago' },
    { id: 'a3', message: 'Bin overflow detected at Civil Lines', type: 'warning', time: '25m ago' },
    { id: 'a4', message: 'New driver registration: Amit Kumar', type: 'info', time: '1h ago' },
  ];

  const MOCK_USERS: any[] = [
    { id: 'u1', name: 'Rahul Khanna', email: 'rahul@example.com', role: 'user', joined: '2024-01-15', points: 1250, status: 'Active' },
    { id: 'u2', name: 'Priya Sharma', email: 'priya@example.com', role: 'driver', joined: '2024-02-10', points: 850, status: 'Active' },
    { id: 'u3', name: 'Amit Verma', email: 'amit@example.com', role: 'user', joined: '2024-03-05', points: 420, status: 'Inactive' },
    { id: 'u4', name: 'Sneha Gupta', email: 'sneha@example.com', role: 'municipality_admin', joined: '2023-11-20', points: 0, status: 'Active' },
    { id: 'u5', name: 'Vikram Singh', email: 'vikram@example.com', role: 'driver', joined: '2024-01-30', points: 1100, status: 'Active' },
    { id: 'u6', name: 'Anjali Das', email: 'anjali@example.com', role: 'user', joined: '2024-03-12', points: 150, status: 'Active' },
  ];

  const MOCK_DUSTBINS: any[] = [
    { id: 'B-101', location: 'Civic Center Main Gate', fillLevel: 85, status: 'Critical', lastEmptied: '2h ago', temperature: '28°C' },
    { id: 'B-102', location: 'Napier Town Park', fillLevel: 42, status: 'Normal', lastEmptied: '5h ago', temperature: '26°C' },
    { id: 'B-103', location: 'Wright Town Market', fillLevel: 92, status: 'Critical', lastEmptied: '1h ago', temperature: '31°C' },
    { id: 'B-104', location: 'Vijay Nagar Square', fillLevel: 15, status: 'Normal', lastEmptied: '10h ago', temperature: '24°C' },
    { id: 'B-105', location: 'Civil Lines Road', fillLevel: 68, status: 'Warning', lastEmptied: '3h ago', temperature: '29°C' },
    { id: 'B-106', location: 'Adhartal Crossing', fillLevel: 30, status: 'Normal', lastEmptied: '8h ago', temperature: '27°C' },
  ];

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* System Status & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-gray-700">System Live</span>
          </div>
          <div className="h-4 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            Last Sync: Just Now
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center">
            <Plus size={14} className="mr-2" /> New Request
          </button>
          <button className="flex-1 md:flex-none px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center">
            <Filter size={14} className="mr-2" /> Filter View
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">128</h3>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-emerald-600 text-[10px] font-bold">
            <TrendingUp size={12} className="mr-1" /> ↑ 12% from yesterday
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Drivers</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">24</h3>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
              <Truck size={20} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-emerald-600 text-[10px] font-bold">
            <TrendingUp size={12} className="mr-1" /> ↑ 4% from yesterday
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ongoing</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">6</h3>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
              <Clock size={20} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-rose-600 text-[10px] font-bold">
            <ArrowDownRight size={12} className="mr-1" /> ↓ 2% from yesterday
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">42</h3>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-xl text-purple-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-emerald-600 text-[10px] font-bold">
            <TrendingUp size={12} className="mr-1" /> ↑ 15% from yesterday
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Revenue</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">₹12,450</h3>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-center mt-4 text-emerald-600 text-[10px] font-bold">
            <TrendingUp size={12} className="mr-1" /> ↑ 10% from yesterday
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Activity Graph */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Weekly Activity Overview</h3>
              <div className="flex gap-2">
                <div className="flex items-center text-[10px] font-bold text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div> Reports
                </div>
                <div className="flex items-center text-[10px] font-bold text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div> Pickups
                </div>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="pickups" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Pickup Requests Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Recent Pickup Requests</h3>
              <button className="text-emerald-600 text-xs font-bold hover:underline flex items-center">
                View All <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User / Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Waste Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_PICKUP_REQUESTS.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{req.user}</p>
                        <p className="text-[10px] text-gray-400 flex items-center"><MapPin size={10} className="mr-1" /> {req.location}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          req.type === 'Plastic' ? 'bg-blue-50 text-blue-600' :
                          req.type === 'Organic' ? 'bg-emerald-50 text-emerald-600' :
                          req.type === 'Metal' ? 'bg-amber-50 text-amber-600' :
                          'bg-purple-50 text-purple-600'
                        }`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold ${
                          req.priority === 'High' ? 'text-rose-600' :
                          req.priority === 'Medium' ? 'text-amber-600' :
                          'text-gray-400'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          req.status === 'NEW' ? 'bg-rose-100 text-rose-600' :
                          req.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-gray-600">{req.driver}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-lg transition-colors">
                            <Plus size={14} />
                          </button>
                          <button className="p-1.5 bg-gray-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Panels */}
        <div className="space-y-6">
          {/* Waste Distribution Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Waste Distribution</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {wasteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-black text-gray-800 text-sm">
                    1,680kg
                  </text>
                  <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="font-bold text-gray-400 text-[8px] uppercase tracking-widest">
                    Total
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {wasteData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                  <div className="flex items-center text-[10px] font-bold text-gray-600">
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {item.name}
                  </div>
                  <span className="text-[10px] font-black text-gray-900">{item.value}kg</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Drivers Overview */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Active Drivers</h3>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase">24 Online</span>
            </div>
            <div className="space-y-4">
              {MOCK_ACTIVE_DRIVERS.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all group">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 border border-gray-100 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${driver.id}`} alt={driver.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${driver.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-gray-800">{driver.name}</p>
                        <span className="text-[9px] font-bold text-gray-400">{driver.vehicle}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full mr-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${parseInt(driver.battery) < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: driver.battery }}
                          ></div>
                        </div>
                        <p className="text-[9px] text-gray-400 font-medium">{driver.pickups} active • ⭐ {driver.rating}</p>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 bg-white text-emerald-600 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <MapPin size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
              Manage All Drivers
            </button>
          </div>

          {/* Hotspots / Smart Dustbins */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Smart Infrastructure</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <div className="flex items-center text-rose-600 mb-2">
                  <AlertTriangle size={16} className="mr-2" />
                  <span className="text-[10px] font-black uppercase">Overflow</span>
                </div>
                <h4 className="text-2xl font-black text-rose-700">4</h4>
                <p className="text-[9px] text-rose-600 font-bold">Critical Alerts</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <div className="flex items-center text-amber-600 mb-2">
                  <MapIcon size={16} className="mr-2" />
                  <span className="text-[10px] font-black uppercase">Hotspots</span>
                </div>
                <h4 className="text-2xl font-black text-amber-700">2</h4>
                <p className="text-[9px] text-amber-600 font-bold">Active Zones</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 mb-2">
                <span>Overall City Cleanliness</span>
                <span className="text-emerald-600">82%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </div>

          {/* Admin Alerts Panel */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Admin Alerts</h3>
              <Bell size={18} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {MOCK_ALERTS.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    alert.type === 'critical' ? 'bg-rose-500 animate-pulse' :
                    alert.type === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800 leading-tight">{alert.message}</p>
                    <p className="text-[9px] text-gray-400 mt-1 font-medium">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapStatusFilter, setMapStatusFilter] = useState('All');

  const demoUsers = [
    { id: 'demo1', name: "Ravi", address: "Napier Town, Jabalpur", lat: 23.1815, lng: 79.9864, status: "Pending", wasteType: "Plastic" },
    { id: 'demo2', name: "Aman", address: "Wright Town, Jabalpur", lat: 23.1686, lng: 79.9339, status: "Assigned", wasteType: "Organic" },
    { id: 'demo3', name: "Priya", address: "Civic Center, Jabalpur", lat: 23.1747, lng: 79.9551, status: "Completed", wasteType: "Metal" }
  ];

  const renderMap = () => {
    const mapData = requests && requests.length > 0 ? requests : demoUsers;
    
    const filteredData = mapData.filter(req => {
      const matchesSearch = (req.name?.toLowerCase() || req.userName?.toLowerCase() || '').includes(mapSearchQuery.toLowerCase()) || 
                            (req.address?.toLowerCase() || '').includes(mapSearchQuery.toLowerCase());
      const matchesStatus = mapStatusFilter === 'All' || 
                            req.status.toLowerCase() === mapStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6 animate-fade-in">
        <motion.div 
          layout
          className={`bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden ${
            isMainMapExpanded ? 'fixed inset-0 z-[100] rounded-none' : 'h-[50vh] min-h-[400px]'
          }`}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <DemoMap
            requests={filteredData}
            onMarkerClick={(req) => setSelectedRequest(req)}
            className="w-full h-full"
            mode="admin"
          />

          {selectedRequest && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-xl shadow-xl z-50 w-64 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{selectedRequest.wasteType}</span>
                <span className="text-[10px] font-bold text-gray-400">{selectedRequest.timestamp ? new Date(selectedRequest.timestamp).toLocaleDateString() : 'Today'}</span>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">{selectedRequest.name || selectedRequest.userName || 'Unknown User'}</p>
              <p className="text-xs font-medium text-gray-600 leading-tight mb-2 flex items-start"><MapPin size={12} className="mr-1 mt-0.5 flex-shrink-0" /> {selectedRequest.address}</p>
              <p className="text-[10px] text-gray-500">Status: <span className={`font-bold uppercase ${
                selectedRequest.status.toLowerCase() === 'completed' ? 'text-gray-500' :
                selectedRequest.status.toLowerCase() === 'assigned' ? 'text-blue-500' :
                'text-emerald-500'
              }`}>{selectedRequest.status}</span></p>
            </div>
          )}

          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 z-10 pointer-events-none">
            <div className="flex flex-wrap gap-2 pointer-events-auto">
              <div className="bg-white p-2 rounded-xl shadow-md border border-gray-100 flex items-center">
                <Search size={16} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search name or location..." 
                  value={mapSearchQuery}
                  onChange={(e) => setMapSearchQuery(e.target.value)}
                  className="text-xs outline-none w-32 sm:w-48" 
                />
              </div>
              <select 
                value={mapStatusFilter}
                onChange={(e) => setMapStatusFilter(e.target.value)}
                className="bg-white px-2 sm:px-3 py-2 rounded-xl shadow-md border border-gray-100 text-[10px] sm:text-xs font-bold outline-none"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div className="flex gap-2 pointer-events-auto">
              {isMainMapExpanded ? (
                <button 
                  onClick={() => setIsMainMapExpanded(false)}
                  className="bg-white p-2.5 rounded-xl shadow-md text-gray-800 hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs"
                >
                  <X size={18} /> Close Fullscreen
                </button>
              ) : (
                <button 
                  onClick={() => setIsMainMapExpanded(true)}
                  className="bg-white p-2.5 rounded-xl shadow-md text-gray-700 hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs"
                >
                  <Maximize2 size={18} /> Fullscreen
                </button>
              )}
            </div>
          </div>

          {!isMainMapExpanded && (
            <div 
              className="absolute inset-0 bg-transparent cursor-pointer z-0"
              onClick={() => setIsMainMapExpanded(true)}
            />
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-md border border-gray-100 z-10">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center text-[10px] font-medium text-gray-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Pending
              </div>
              <div className="flex items-center text-[10px] font-medium text-gray-600">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Assigned
              </div>
              <div className="flex items-center text-[10px] font-medium text-gray-600">
                <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div> Completed
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Reports List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Active Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((req) => (
              <div 
                key={req.id}
                onClick={() => {
                  setSelectedRequest(req);
                  // Scroll to top if not expanded to see the map
                  if (!isMainMapExpanded) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedRequest?.id === req.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-800">{req.name || req.userName || 'Unknown User'}</h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    req.status.toLowerCase() === 'completed' ? 'bg-gray-200 text-gray-600' :
                    req.status.toLowerCase() === 'assigned' ? 'bg-blue-100 text-blue-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 flex items-start mt-2">
                  <MapPin size={14} className="mr-1.5 mt-0.5 flex-shrink-0 text-gray-400" />
                  {req.address}
                </p>
                <p className="text-[10px] text-gray-500 mt-2 font-medium">Waste Type: {req.wasteType}</p>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                No reports found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDrivers = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Driver Management</h3>
        <button 
          onClick={() => setShowAddDriver(!showAddDriver)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-green-700 transition-all"
        >
          <Plus size={18} className="mr-2" /> {showAddDriver ? 'Cancel' : 'Add New Driver'}
        </button>
      </div>

      {showAddDriver && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-800 text-sm">Create Driver Account</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Driver Name" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none" />
            <input type="email" placeholder="Email Address" value={newDriver.email} onChange={e => setNewDriver({...newDriver, email: e.target.value})} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none" />
            <input type="tel" placeholder="Phone Number" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none" />
            <input type="text" placeholder="Vehicle Number" value={newDriver.vehicleNumber} onChange={e => setNewDriver({...newDriver, vehicleNumber: e.target.value})} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none" />
            <input type="text" placeholder="Assigned Area / Sector" value={newDriver.sector} onChange={e => setNewDriver({...newDriver, sector: e.target.value})} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none" />
          </div>
          <button 
            onClick={() => {
              onAddDriver(newDriver);
              setShowAddDriver(false);
              setNewDriver({ name: '', email: '', phone: '', vehicleNumber: '', sector: '' });
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-all"
          >
            Create Driver
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={driver.avatar} alt={driver.name} className="w-10 h-10 rounded-full mr-3 border border-gray-100" />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{driver.name}</p>
                        <p className="text-[10px] text-gray-400">ID: {driver.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      driver.status === 'Active' ? 'bg-green-100 text-green-600' :
                      driver.status === 'On Pickup' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800">{driver.totalPickups}</p>
                    <p className="text-[10px] text-gray-400">Total Pickups</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-green-500">
                      <TrendingUp size={14} className="mr-1" />
                      <span className="text-sm font-bold">{driver.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => onRemoveDriver(driver.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPickups = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Pickup Monitoring</h3>
        <div className="flex gap-2">
          <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Filter by location..." className="text-xs outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Waste Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Driver</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(requests.length > 0 ? requests : MOCK_PICKUP_REQUESTS.map(m => ({
                id: m.id,
                address: m.location,
                timestamp: 'Today, 2:30 PM',
                wasteType: m.type as any,
                status: m.status.toLowerCase() === 'new' ? 'pending' : m.status.toLowerCase() as any,
                assignedDriverId: m.driver !== '-' ? drivers.find(d => d.name === m.driver)?.id : undefined
              }))).map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800">{req.address}</p>
                    <p className="text-[10px] text-gray-400">{req.timestamp}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold ${
                      req.wasteType === WasteCategory.Plastic || req.wasteType === 'Plastic' ? 'text-emerald-600' :
                      req.wasteType === WasteCategory.Organic || req.wasteType === 'Organic' ? 'text-emerald-600' :
                      req.wasteType === WasteCategory.Metal || req.wasteType === 'Metal' ? 'text-amber-600' :
                      req.wasteType === WasteCategory.Glass || req.wasteType === 'Glass' ? 'text-cyan-600' :
                      req.wasteType === WasteCategory.Paper || req.wasteType === 'Paper' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {req.wasteType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      req.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      req.status === 'on_route' || req.status === 'on_the_way' ? 'bg-blue-100 text-blue-600' :
                      req.status === 'assigned' ? 'bg-amber-100 text-amber-600' :
                      'bg-rose-100 text-rose-600'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {req.assignedDriverId ? (
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-100 rounded-full mr-2"></div>
                        <span className="text-xs font-medium text-gray-700">
                          {drivers.find(d => d.id === req.assignedDriverId)?.name || 'Assigned'}
                        </span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onAssignDriver(req.id, drivers[0].id)}
                        className="text-emerald-600 text-[10px] font-bold uppercase hover:underline"
                      >
                        Assign Now
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-emerald-600">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderHotspots = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Garbage Hotspot Detection</h3>
        <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center">
          <AlertTriangle size={12} className="mr-1" /> 3 Urgent Areas
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          layout
          className={`lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden ${
            isHotspotMapExpanded ? 'fixed inset-0 z-[100] rounded-none' : 'h-[40vh] min-h-[400px]'
          }`}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <DemoMap
            requests={hotspots.map(h => ({
              id: h.id,
              userId: 'hotspot',
              address: h.location,
              coordinates: h.coordinates,
              wasteType: WasteCategory.Plastic,
              status: h.severity === 'high' ? 'pending' : 'completed',
              timestamp: new Date().toISOString()
            }))}
            className="w-full h-full"
            mode="admin"
          />
          
          <div className="absolute top-4 right-4 z-[110]">
            {isHotspotMapExpanded ? (
              <button 
                onClick={() => setIsHotspotMapExpanded(false)}
                className="bg-white p-2.5 rounded-xl shadow-md text-gray-800 hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs"
              >
                <X size={18} /> Close Fullscreen
              </button>
            ) : (
              <button 
                onClick={() => setIsHotspotMapExpanded(true)}
                className="bg-white p-2.5 rounded-xl shadow-md text-gray-700 hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 font-bold text-xs"
              >
                <Maximize2 size={18} /> Fullscreen
              </button>
            )}
          </div>

          {!isHotspotMapExpanded && (
            <div 
              className="absolute inset-0 bg-transparent cursor-pointer z-0"
              onClick={() => setIsHotspotMapExpanded(true)}
            />
          )}
        </motion.div>

        <div className="space-y-4">
          <h4 className="font-bold text-gray-800 text-sm">Top Hotspots</h4>
          {hotspots.map(spot => (
            <div key={spot.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-800">{spot.location}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{spot.reportCount} reports this week</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                  spot.severity === 'high' ? 'bg-green-100 text-green-600' :
                  spot.severity === 'medium' ? 'bg-green-100 text-green-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {spot.severity}
                </span>
              </div>
              <button className="w-full mt-4 bg-gray-50 text-gray-600 py-2 rounded-xl text-[10px] font-bold hover:bg-gray-100 transition-all">
                Dispatch Team
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">User Management</h3>
        <div className="flex gap-2">
          <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search users..." className="text-xs outline-none" />
          </div>
          <button className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:text-emerald-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">EcoPoints</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Role Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_USERS.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <p className="text-[10px] text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      user.role === 'municipality_admin' ? 'bg-purple-50 text-purple-600' :
                      user.role === 'driver' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-600">{user.joined}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-emerald-600 font-bold text-sm">
                      <TrendingUp size={14} className="mr-1" />
                      {user.points}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-[10px] font-bold ${
                      user.status === 'Active' ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <select 
                        className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-[10px] font-bold outline-none focus:border-emerald-500 transition-colors"
                        defaultValue={user.role}
                        onChange={(e) => console.log(`Changing role of ${user.name} to ${e.target.value}`)}
                      >
                        <option value="user">User</option>
                        <option value="driver">Driver</option>
                        <option value="municipality_admin">Admin</option>
                      </select>
                      <button className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDustbins = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Smart Dustbin Network</h3>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-emerald-700 transition-all">
          <Plus size={18} className="mr-2" /> Add New Bin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DUSTBINS.map(bin => (
          <div key={bin.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-gray-50 p-3 rounded-xl text-gray-400 group-hover:text-emerald-600 transition-colors">
                <Recycle size={24} />
              </div>
              <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                bin.status === 'Critical' ? 'bg-rose-100 text-rose-600' :
                bin.status === 'Warning' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {bin.status}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-gray-900">{bin.id}</h4>
                <p className="text-xs text-gray-400 flex items-center mt-1">
                  <MapPin size={12} className="mr-1" /> {bin.location}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-400 uppercase tracking-wider">Fill Level</span>
                  <span className={bin.fillLevel > 80 ? 'text-rose-600' : 'text-emerald-600'}>{bin.fillLevel}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      bin.fillLevel > 85 ? 'bg-rose-500' :
                      bin.fillLevel > 60 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${bin.fillLevel}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 p-2 rounded-xl">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Temp</p>
                  <p className="text-xs font-black text-gray-800">{bin.temperature}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Last Empty</p>
                  <p className="text-xs font-black text-gray-800">{bin.lastEmptied}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                  Dispatch Truck
                </button>
                <button className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition-all">
                  <Settings size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-green-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover" />
              <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-lg shadow-md text-green-600 hover:text-green-700 transition-all border border-gray-100">
                <Camera size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-800">{profile.name}</h3>
              <p className="text-sm text-gray-500 font-medium">Municipality Administrator</p>
            </div>
            <button className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-all flex items-center justify-center">
              <Save size={18} className="mr-2" /> Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-800 flex items-center">
            <UserIcon size={18} className="mr-2 text-green-600" /> Personal Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
              <input 
                type="text" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
              <input 
                type="email" 
                value={profile.email} 
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Phone Number</label>
              <input 
                type="text" 
                value={profile.phone} 
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 transition-all" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-800 flex items-center">
            <Globe size={18} className="mr-2 text-green-600" /> Municipality Details
          </h4>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">City / Municipality Name</label>
              <input 
                type="text" 
                value={profile.city} 
                onChange={(e) => setProfile({...profile, city: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Role</label>
              <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-medium">
                Municipality Admin
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Department</label>
              <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-medium">
                Waste Management & Sanitation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Account Settings */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h4 className="font-bold text-gray-800 flex items-center border-b border-gray-50 pb-4">
          <LockIcon size={18} className="mr-2 text-green-600" /> Account Security
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Change Password</p>
            <div className="space-y-3">
              <div className="relative">
                <input type="password" placeholder="Current Password" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                <Eye size={16} className="absolute right-4 top-3 text-gray-400" />
              </div>
              <div className="relative">
                <input type="password" placeholder="New Password" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500" />
                <Eye size={16} className="absolute right-4 top-3 text-gray-400" />
              </div>
              <button className="w-full sm:w-auto px-6 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all">Update Password</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                <p className="text-[10px] text-gray-400">Add an extra layer of security to your account</p>
              </div>
              <button className="w-10 h-5 bg-green-600 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <div className="flex items-start">
                <Shield size={16} className="text-green-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-green-800">Security Recommendation</p>
                  <p className="text-[10px] text-green-600 mt-1">Enable 2FA to protect your administrative access from unauthorized attempts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h4 className="font-bold text-gray-800 flex items-center border-b border-gray-50 pb-4">
          <Settings size={18} className="mr-2 text-green-600" /> System Preferences
        </h4>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-800">Notification Alerts</p>
              <div className="space-y-3">
                {[
                  { id: 'reports', label: 'New Garbage Reports', desc: 'Get notified when a user reports waste' },
                  { id: 'delays', label: 'Driver Delays', desc: 'Alerts for missed or delayed pickups' },
                  { id: 'warnings', label: 'System Warnings', desc: 'Critical system and maintenance alerts' }
                ].map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-gray-700">{item.label}</p>
                      <p className="text-[10px] text-gray-400">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newSettings = {
                          ...settings,
                          notifications: { ...settings.notifications, [item.id]: !settings.notifications[item.id as keyof typeof settings.notifications] }
                        };
                        setSettings(newSettings);
                        onUpdateSettings(newSettings);
                      }}
                      className={`w-10 h-5 rounded-full relative transition-colors ${
                        settings.notifications[item.id as keyof typeof settings.notifications] ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                        settings.notifications[item.id as keyof typeof settings.notifications] ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-800">Map & Display</p>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Default Map View</label>
                  <select 
                    value={settings.defaultMapView}
                    onChange={(e) => {
                      const newSettings = { ...settings, defaultMapView: e.target.value as any };
                      setSettings(newSettings);
                      onUpdateSettings(newSettings);
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                  >
                    <option value="city">City-wide Overview</option>
                    <option value="hotspots">Hotspots Only</option>
                    <option value="pickups">Active Pickups</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Show Hotspots by Default</p>
                    <p className="text-[10px] text-gray-400">Automatically highlight high-density areas</p>
                  </div>
                  <button className="w-10 h-5 bg-green-600 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Settings */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h4 className="font-bold text-gray-800 flex items-center border-b border-gray-50 pb-4">
          <Users size={18} className="mr-2 text-green-600" /> Driver & User Management
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">Allow New Driver Registrations</p>
                <p className="text-[10px] text-gray-400">Enable public registration for new drivers</p>
              </div>
              <button className="w-10 h-5 bg-green-600 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">Manual Approval Required</p>
                <p className="text-[10px] text-gray-400">Admins must verify every new driver</p>
              </div>
              <button className="w-10 h-5 bg-green-600 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Max Pickup Distance (km)</label>
              <input type="number" defaultValue={15} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Service Zone</label>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-[10px] font-bold">Sector 1-10</span>
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-[10px] font-bold">Downtown</span>
                <button className="p-1 text-gray-400 hover:text-green-600"><Plus size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center text-green-600">
          <TrendingUp size={24} className="mr-2" />
          <span className="text-lg font-bold tracking-tight">GreenLens <span className="text-gray-400 font-medium">Admin</span></span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden lg:block">
          <div className="flex items-center text-green-600 mb-8">
            <TrendingUp size={28} className="mr-2" />
            <span className="text-xl font-bold tracking-tight">GreenLens <span className="text-gray-400 font-medium">Admin</span></span>
          </div>
        </div>

        <div className="flex-1 px-6 py-4 lg:py-0 overflow-y-auto">
          <nav className="space-y-1">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'City Overview' },
              { id: 'map', icon: MapIcon, label: 'Reports Map' },
              { id: 'drivers', icon: Truck, label: 'Drivers' },
              { id: 'pickups', icon: ClipboardList, label: 'Pickups' },
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'dustbins', icon: Recycle, label: 'Smart Bins' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'hotspots', icon: AlertTriangle, label: 'Hotspots' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-50 space-y-2">
          <button 
            onClick={() => {
              setActiveTab('settings');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'settings' 
                ? 'bg-green-50 text-green-600' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <Settings size={20} className="mr-3" />
            Settings
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-green-500 hover:bg-green-50 transition-all"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Municipality Portal</h2>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Demo Mode</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mt-1">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'map' && 'Garbage Reports Map'}
              {activeTab === 'drivers' && 'Driver Management'}
              {activeTab === 'pickups' && 'Pickup Monitoring'}
              {activeTab === 'analytics' && 'Waste Analytics'}
              {activeTab === 'hotspots' && 'Hotspot Detection'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'dustbins' && 'Smart Dustbin Network'}
              {activeTab === 'settings' && 'System Settings'}
              {activeTab === 'profile' && 'Admin Profile'}
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative">
              <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center bg-white p-1 pr-3 lg:pr-4 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
              >
                <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-8 h-8 rounded-lg mr-2 lg:mr-3" />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-400">City Authority</p>
                </div>
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-slide-up">
                    <button 
                      onClick={() => { setActiveTab('profile'); setIsProfileMenuOpen(false); }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <UserIcon size={16} className="mr-3" /> View Profile
                    </button>
                    <button 
                      onClick={() => { setActiveTab('settings'); setIsProfileMenuOpen(false); }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Settings size={16} className="mr-3" /> Settings
                    </button>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-green-500 hover:bg-green-50"
                    >
                      <LogOut size={16} className="mr-3" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'map' && renderMap()}
        {activeTab === 'drivers' && renderDrivers()}
        {activeTab === 'pickups' && renderPickups()}
        {activeTab === 'hotspots' && renderHotspots()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'dustbins' && renderDustbins()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-6">Monthly Waste Collection (Tons)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Jan', value: 400 },
                        { name: 'Feb', value: 300 },
                        { name: 'Mar', value: 600 },
                        { name: 'Apr', value: 800 },
                        { name: 'May', value: 500 },
                        { name: 'Jun', value: 900 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-6">Recycling Efficiency (%)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: 'Jan', value: 45 },
                        { name: 'Feb', value: 52 },
                        { name: 'Mar', value: 48 },
                        { name: 'Apr', value: 61 },
                        { name: 'May', value: 55 },
                        { name: 'Jun', value: 67 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
