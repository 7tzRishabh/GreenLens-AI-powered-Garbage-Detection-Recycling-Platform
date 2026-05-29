import React from 'react';
import { UserStats, User, DriverStats } from '../types';
import { Award, Shield, Zap, TrendingUp, LogOut, Truck, MapPin, Star, Clock } from 'lucide-react';

interface ProfileProps {
  userStats: UserStats;
  driverStats?: DriverStats;
  currentUser: User | null;
  onLogout: () => void;
  onStatusChange?: (status: 'online' | 'offline') => void;
}

export const Profile: React.FC<ProfileProps> = ({ userStats, driverStats, currentUser, onLogout, onStatusChange }) => {
  const isDriver = currentUser?.role === 'driver';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center relative">
        <button 
          onClick={onLogout}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>

        <div className="relative">
            <img 
                src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=10b981&color=fff&size=128`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-emerald-50 mb-3"
            />
            <div className="absolute bottom-3 right-0 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white">
                <Shield size={14} fill="currentColor" />
            </div>
        </div>
        
        {/* Dynamic User Data */}
        <h2 className="text-xl font-bold text-gray-800">{currentUser?.name || 'Eco Warrior'}</h2>
        <p className="text-xs text-gray-400 mb-1">{currentUser?.email || 'user@example.com'}</p>
        
        {isDriver ? (
            <div className="mt-4 w-full">
                {/* Driver status removed */}
            </div>
        ) : (
            <p className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-0.5 rounded-full mt-1">Level {userStats.level}</p>
        )}
        
        <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-sm mx-auto">
            {isDriver ? (
                <>
                    <div>
                        <div className="font-bold text-lg text-gray-800">{driverStats?.totalPickups || 2}</div>
                        <div className="text-xs text-gray-500">Pickups</div>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-gray-800">{driverStats?.todayPickups || 2}</div>
                        <div className="text-xs text-gray-500">Today</div>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-gray-800">{driverStats?.onTimeRate || 0}%</div>
                        <div className="text-xs text-gray-500">On-Time</div>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-gray-800 flex items-center justify-center">
                            <Star size={16} className="text-yellow-400 mr-1" fill="currentColor" />
                            {driverStats?.rating || 0}
                        </div>
                        <div className="text-xs text-gray-500">Rating</div>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <div className="font-bold text-lg text-gray-800">{userStats.points}</div>
                        <div className="text-xs text-gray-500">Points</div>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-gray-800">{userStats.streak}</div>
                        <div className="text-xs text-gray-500">Streak</div>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-gray-800">#12</div>
                        <div className="text-xs text-gray-500">Rank</div>
                    </div>
                </>
            )}
        </div>
      </div>

      {isDriver ? (
        <div className="space-y-6">
            {/* Today's Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Clock className="mr-2 text-emerald-500" size={20} />
                    Today's Activity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-emerald-700">{driverStats?.todayPickups || 0}</div>
                        <div className="text-xs text-emerald-600 font-medium">Pickups Completed</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-blue-700">42 km</div>
                        <div className="text-xs text-blue-600 font-medium">Distance Covered</div>
                    </div>
                </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Truck className="mr-2 text-emerald-500" size={20} />
                    Vehicle Info
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Vehicle ID</span>
                        <span className="text-sm font-bold text-gray-800">MP20-TR-1023</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Waste Type</span>
                        <span className="text-sm font-bold text-gray-800">Plastic / Mixed</span>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <>
            {/* Badges */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Award className="mr-2 text-emerald-500" size={20} />
                    Achievements
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { name: 'Starter', icon: '🌱', active: true },
                        { name: 'Recycler', icon: '♻️', active: true },
                        { name: 'Streak', icon: '🔥', active: true },
                        { name: 'Pro', icon: '👑', active: false },
                    ].map((badge) => (
                        <div key={badge.name} className={`flex flex-col items-center ${badge.active ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-2 border border-gray-100">
                                {badge.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-600">{badge.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leaderboard Teaser */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <TrendingUp className="mr-2 text-blue-500" size={20} />
                        Leaderboard
                    </h3>
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">Weekly</span>
                </div>
            
                <div className="space-y-3">
                    {[
                        { name: 'Sarah Green', points: 1250, img: 11 },
                        { name: 'Mike River', points: 1100, img: 12 },
                        { name: currentUser?.name || 'You', points: userStats.points, img: 0, highlight: true },
                    ].map((user, idx) => (
                        <div key={user.name} className={`flex items-center p-3 rounded-xl ${user.highlight ? 'bg-emerald-50 border border-emerald-100' : ''}`}>
                            <div className="font-bold text-gray-400 w-6">{idx + 1}</div>
                            {user.img > 0 ? (
                            <img src={`https://picsum.photos/id/${user.img}/40/40`} className="w-8 h-8 rounded-full mr-3" alt={user.name}/>
                            ) : (
                            <div className="w-8 h-8 rounded-full mr-3 bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                {user.name.charAt(0)}
                            </div>
                            )}
                            <div className="flex-1 font-medium text-gray-700">{user.name}</div>
                            <div className="font-bold text-emerald-600">{user.points}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
      )}
    </div>
  );
};
