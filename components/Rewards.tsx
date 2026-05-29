import React, { useState } from 'react';
import { Ticket, Gift, Coffee, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Reward, UserStats } from '../types';

const PARTNER_STORES: Reward[] = [
  {
    id: '1',
    title: 'GreenMart Grocery',
    description: '10% discount on your next purchase.',
    cost: 300,
    image: '🛒'
  },
  {
    id: '2',
    title: 'EcoCafe',
    description: 'Free coffee on your next visit.',
    cost: 200,
    image: '☕'
  },
  {
    id: '3',
    title: 'Urban Organic Store',
    description: '₹100 discount on organic products.',
    cost: 400,
    image: '🌿'
  },
  {
    id: '4',
    title: 'City Bus Pass',
    description: '1 Day Travel pass.',
    cost: 500,
    image: '🚌'
  },
  {
    id: '5',
    title: 'Plant a Tree Initiative',
    description: 'Plant a tree in your name.',
    cost: 1500,
    image: '🌳'
  }
];

interface RewardsProps {
  userStats: UserStats;
  onRedeem: (cost: number) => void;
}

export const Rewards: React.FC<RewardsProps> = ({ userStats, onRedeem }) => {
  const [redeemedId, setRedeemedId] = useState<string | null>(null);

  const handleRedeem = (reward: Reward) => {
    if (userStats.points >= reward.cost) {
      onRedeem(reward.cost);
      setRedeemedId(reward.id);
      setTimeout(() => setRedeemedId(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Gift className="mr-2 text-green-600" /> Rewards & Vouchers
        </h1>
        <p className="text-gray-500 text-sm">Exchange your EcoPoints for amazing rewards.</p>
      </header>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <p className="text-gray-600 text-sm font-medium">Available Balance</p>
        <div className="flex items-baseline mt-1">
          <h2 className="text-4xl font-bold text-gray-800">{userStats.points.toLocaleString()}</h2>
          <span className="ml-2 text-gray-600 font-medium">EcoPoints</span>
        </div>
      </div>

      {/* Badges Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800">Your Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-green-200 shadow-sm text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-[10px] font-bold text-gray-800 leading-tight">Eco Starter</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-green-200 shadow-sm text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-2">
              <Gift size={24} />
            </div>
            <p className="text-[10px] font-bold text-gray-800 leading-tight">Recycling Hero</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-2">
              <ArrowRight size={24} />
            </div>
            <p className="text-[10px] font-bold text-gray-600 leading-tight">Master Recycler</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h3 className="font-semibold text-gray-800">Partner Stores</h3>
        {PARTNER_STORES.map((reward) => {
          const canAfford = userStats.points >= reward.cost;
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

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800">How EcoPoints Work</h3>
        
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <h4 className="font-bold text-gray-800 text-sm mb-1">Garbage Scan Reward</h4>
            <p className="text-xs text-gray-600">When a user scans garbage using the "Identify Waste" AI scanner, give the user 10 EcoPoints for each successful scan. Only reward once per scan.</p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <h4 className="font-bold text-gray-800 text-sm mb-1">Weight-Based Reward</h4>
            <p className="text-xs text-gray-600 mb-2">When garbage is collected through a pickup request, calculate EcoPoints based on weight. Give 10 EcoPoints for every 1 kg of garbage collected.</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-green-100">
                <p className="font-bold text-gray-800 text-xs">1 kg</p>
                <p className="text-[10px] text-gray-600">10 pts</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-green-100">
                <p className="font-bold text-gray-800 text-xs">2 kg</p>
                <p className="text-[10px] text-gray-600">20 pts</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-green-100">
                <p className="font-bold text-gray-800 text-xs">5 kg</p>
                <p className="text-[10px] text-gray-600">50 pts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
