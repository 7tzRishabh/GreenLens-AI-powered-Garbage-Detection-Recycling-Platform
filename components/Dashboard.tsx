import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Droplets, Zap, ArrowRight, Recycle, Truck, ChevronRight, Gift, MapPin, Send, Leaf, Award, History, Package, Star } from 'lucide-react';
import { UserStats, Tab, User, WasteCategory, PickupRequest } from '../types';
import { SmartDustbin } from './SmartDustbin';
import { EcoPointsCard } from './EcoPointsCard';

interface DashboardProps {
  userStats: UserStats;
  ecoPoints: number;
  currentUser: User | null;
  onScanClick: () => void;
  onTrackClick?: () => void;
  onRewardsClick?: () => void;
  onRequestPickup?: () => void;
  pickupRequests?: PickupRequest[];
  rewardHistory?: any[];
  pointsEarned?: number | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  userStats, 
  ecoPoints,
  currentUser, 
  onScanClick, 
  onTrackClick,
  onRewardsClick,
  onRequestPickup,
  pickupRequests = [],
  rewardHistory = [],
  pointsEarned
}) => {
  const navigate = useNavigate();
  const hasActivePickup = pickupRequests.some(r => r.userId === currentUser?.id && r.status !== 'completed');
  
  const MOCK_USER_ACTIVITIES: any[] = [
    { 
      id: 'mock-1', 
      title: 'Pickup Request Created', 
      details: 'Napier Town, Jabalpur', 
      type: 'pickup', 
      status: 'PENDING', 
      createdAt: new Date(Date.now() - 3600000).toISOString() 
    },
    { 
      id: 'mock-2', 
      title: 'Waste Scanned', 
      details: 'Scanned plastic waste (+20 eco points)', 
      type: 'scan', 
      status: 'SUCCESS', 
      createdAt: new Date(Date.now() - 7200000).toISOString() 
    },
    { 
      id: 'mock-3', 
      title: 'Reward Redeemed', 
      details: 'Redeemed Fuel Voucher (500 pts)', 
      type: 'reward', 
      status: 'REDEEMED', 
      createdAt: new Date(Date.now() - 86400000).toISOString() 
    },
    { 
      id: 'mock-4', 
      title: 'Pickup Completed', 
      details: 'Pickup completed by driver', 
      type: 'pickup', 
      status: 'SUCCESS', 
      createdAt: new Date(Date.now() - 172800000).toISOString() 
    },
    { 
      id: 'mock-5', 
      title: 'Eco Points Earned', 
      details: 'Earned 50 eco points', 
      type: 'points', 
      status: 'EARNED', 
      createdAt: new Date(Date.now() - 259200000).toISOString() 
    },
  ];

  const allActivities = React.useMemo(() => {
    const activities: any[] = [];
    
    // Add real pickup requests
    pickupRequests.filter(r => r.userId === currentUser?.id).forEach(r => {
      activities.push({
        id: r.id,
        title: r.status === 'completed' ? 'Pickup Completed' : 'Pickup Request Created',
        details: r.address,
        type: 'pickup',
        status: r.status === 'completed' ? 'SUCCESS' : 'PENDING',
        createdAt: r.createdAt || r.timestamp
      });
    });
    
    // Add real reward history
    rewardHistory.forEach(rh => {
      activities.push({
        id: rh.id,
        title: 'Reward Redeemed',
        details: rh.rewardTitle || 'Redeemed reward',
        type: 'reward',
        status: 'REDEEMED',
        createdAt: rh.createdAt || rh.timestamp
      });
    });
    
    // If no real activities, use mock data
    if (activities.length === 0) {
      return MOCK_USER_ACTIVITIES;
    }
    
    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [pickupRequests, rewardHistory, currentUser]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Hello, {currentUser?.name.split(' ')[0] || 'Eco Warrior'} 👋</h1>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Demo Mode</span>
          </div>
          <p className="text-gray-500 text-sm">Welcome to GreenLens.</p>
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm border border-green-100">
           <img 
             src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=16a34a&color=fff`}
             alt="Profile" 
             className="w-10 h-10 rounded-full" 
           />
        </div>
      </header>

      {/* Main Stats Card */}
      <EcoPointsCard userStats={{ ...userStats, points: ecoPoints }} onRewardsClick={onRewardsClick} pointsEarned={pointsEarned} />

      {/* Pickup Request Section */}
      <div className="bg-emerald-50 rounded-2xl p-5 shadow-sm border border-emerald-100 relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-100/50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mr-4 shadow-sm">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {hasActivePickup ? 'Pickup in Progress' : 'Need a Pickup?'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {hasActivePickup 
                  ? 'Track your driver in real-time' 
                  : 'Request a driver to your location'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => hasActivePickup ? navigate('/tracker') : navigate('/request-pickup')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              hasActivePickup 
                ? 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
            }`}
          >
            {hasActivePickup ? 'Track Now' : 'Request Now'}
          </button>
        </div>
      </div>

      {/* Smart Dustbin Status */}
      <SmartDustbin />

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => navigate('/scan')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center justify-center text-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <Recycle size={32} />
              </div>
              <span className="font-bold text-gray-900 text-lg">Scan Waste</span>
              <p className="text-xs text-gray-500 mt-1">Identify and categorize your trash instantly</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <button className="text-emerald-600 text-sm font-bold flex items-center hover:underline">
            View All <ArrowRight size={14} className="ml-1" />
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {allActivities.length > 0 ? (
            allActivities
              .slice(0, 5)
              .map((item, i) => {
                const diff = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60000);
                const timeAgo = diff < 1 ? 'Just now' : diff < 60 ? `${diff} mins ago` : diff < 1440 ? `${Math.floor(diff / 60)} hours ago` : `${Math.floor(diff / 1440)} days ago`;
                
                const getStatusDisplay = (status: string) => {
                  switch(status) {
                    case 'SUCCESS': return { text: 'SUCCESS', color: 'text-emerald-600', bg: 'bg-emerald-50' };
                    case 'PENDING': return { text: 'PENDING', color: 'text-amber-600', bg: 'bg-amber-50' };
                    case 'REDEEMED': return { text: 'REDEEMED', color: 'text-blue-600', bg: 'bg-blue-50' };
                    case 'EARNED': return { text: 'EARNED', color: 'text-green-600', bg: 'bg-green-50' };
                    default: return { text: status, color: 'text-gray-500', bg: 'bg-gray-50' };
                  }
                };

                const getIcon = (type: string) => {
                  switch(type) {
                    case 'pickup': return <Package size={20} />;
                    case 'scan': return <Recycle size={20} />;
                    case 'reward': return <Gift size={20} />;
                    case 'points': return <Star size={20} />;
                    default: return <History size={20} />;
                  }
                };

                const statusInfo = getStatusDisplay(item.status);

                return (
                  <div key={item.id || i} className="p-4 border-b border-gray-50 last:border-0 flex items-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={item.type === 'pickup' ? () => navigate('/tracker') : undefined}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-sm ${statusInfo.bg} ${statusInfo.color}`}>
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{timeAgo} • {item.details}</p>
                    </div>
                    <div className="text-right ml-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <History size={24} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No recent activity yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Rewards & Badges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Rewards</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <Award size={24} />
            </div>
            <span className="font-bold text-gray-900 text-sm">Eco Starter</span>
            <p className="text-[10px] text-gray-500 mt-1">First scan completed</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <Recycle size={24} />
            </div>
            <span className="font-bold text-gray-900 text-sm">Recycling Hero</span>
            <p className="text-[10px] text-gray-500 mt-1">50+ items recycled</p>
          </div>
        </div>
      </div>

      {/* Green Box - Eco Tips */}
      <div className="bg-green-50 rounded-xl p-5 border border-green-100 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Leaf size={20} />
            </div>
            <h3 className="font-bold text-green-900">The Green Box</h3>
          </div>
          <p className="text-green-800 text-sm font-medium leading-relaxed">
            "Did you know? Recycling one glass bottle saves enough energy to power a computer for 25 minutes."
          </p>
          <div className="mt-4 flex items-center text-green-600 text-xs font-bold cursor-pointer hover:underline">
            Learn more eco-tips <ChevronRight size={14} className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};