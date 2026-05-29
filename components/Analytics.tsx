import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserStats } from '../types';

interface AnalyticsProps {
  userStats: UserStats;
}

const WEEKLY_DATA = [
  { name: 'Mon', items: 4 },
  { name: 'Tue', items: 3 },
  { name: 'Wed', items: 7 },
  { name: 'Thu', items: 2 },
  { name: 'Fri', items: 5 },
  { name: 'Sat', items: 8 },
  { name: 'Sun', items: 6 },
];

const CATEGORY_DATA = [
  { name: 'Paper', value: 35, color: '#3b82f6' },
  { name: 'Plastic', value: 45, color: '#10b981' },
  { name: 'Glass', value: 10, color: '#f59e0b' },
  { name: 'Metal', value: 10, color: '#6366f1' },
];

export const Analytics: React.FC<AnalyticsProps> = ({ userStats }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900">Your Impact</h2>

      {/* Impact Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
          <div className="text-2xl font-bold text-green-600">{userStats.co2Saved}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">kg CO2 Saved</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
          <div className="text-2xl font-bold text-green-600">450</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">L Water Saved</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
          <div className="text-2xl font-bold text-green-600">12</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">kWh Energy</div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Recycling</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                cursor={{ fill: '#f0fdf4' }}
              />
              <Bar dataKey="items" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Diversion</h3>
        <div className="space-y-4">
            {CATEGORY_DATA.map((item) => (
                <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-medium text-gray-900">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full" 
                            style={{ width: `${item.value}%`, backgroundColor: item.color }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};