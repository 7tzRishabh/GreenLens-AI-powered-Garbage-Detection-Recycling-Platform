import React from 'react';
import { Home, Search, ScanLine, BarChart2, User, Gift, Truck, Wallet, Leaf, MessageSquare, History, Trophy } from 'lucide-react';
import { Tab, User as UserType } from '../types';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  currentUser: UserType | null;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, currentUser }) => {
  const isDriver = currentUser?.role === 'driver';

  const navItems = isDriver ? [
    { id: 'driver', icon: Home, label: 'Home' },
    { id: 'earnings', icon: Wallet, label: 'Earnings' },
    { id: 'impact', icon: Trophy, label: 'Leaderboard' },
    { id: 'rewards', icon: Gift, label: 'Rewards' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] : [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tracker', icon: Truck, label: 'Truck' },
    { id: 'library', icon: Search, label: 'Library' },
    { id: 'scan', icon: ScanLine, label: 'Scan', primary: true },
    { id: 'rewards', icon: Gift, label: 'Rewards' },
    { id: 'support', icon: MessageSquare, label: 'Support' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-white border-t border-gray-100 pb-safe pt-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 w-full">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.primary) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className="relative -top-5 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform active:scale-95"
              >
                <Icon size={28} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center justify-center w-12 transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {!isDriver && <span className="text-[10px] mt-1 font-medium">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};