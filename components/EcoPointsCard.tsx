import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Gift, Leaf, Recycle } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'motion/react';
import { UserStats } from '../types';

interface EcoPointsCardProps {
  userStats: UserStats;
  onRewardsClick?: () => void;
  pointsEarned?: number | null;
}

export const EcoPointsCard: React.FC<EcoPointsCardProps> = ({ userStats, onRewardsClick, pointsEarned }) => {
  const navigate = useNavigate();
  const count = useMotionValue(userStats.points - (pointsEarned || 0));
  const rounded = useTransform(count, Math.round);
  const pulseAnimation = React.useMemo(() => ({
    scale: [1, 1.05, 1],
    boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 20px rgba(16, 185, 129, 0.5)", "0 0 0px rgba(16, 185, 129, 0)"]
  }), []);

  useEffect(() => {
    const animation = animate(count, userStats.points, {
      duration: 1.5,
      ease: "easeOut",
    });

    return animation.stop;
  }, [userStats.points, count]);

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      animate={pointsEarned ? pulseAnimation : {}}
      className="relative rounded-2xl p-6 shadow-xl shadow-emerald-500/20 overflow-hidden group cursor-pointer"
      style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #16a34a 50%, #14b8a6 100%)' 
      }}
    >
      <AnimatePresence>
        {pointsEarned && (
          <motion.div
            key="points-animation"
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1.5 }}
            exit={{ opacity: 0, y: -100 }}
            className="absolute z-50 text-white font-black text-2xl drop-shadow-lg"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            +{pointsEarned} pts
          </motion.div>
        )}
      </AnimatePresence>
      {/* Animated Background Patterns */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -right-20 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none"
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-300/30 rounded-full blur-3xl pointer-events-none"
      />

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 right-1/3 text-white/20 pointer-events-none"
      >
        <Leaf size={24} />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-12 right-1/4 text-white/20 pointer-events-none"
      >
        <Recycle size={32} />
      </motion.div>

      {/* Glass Overlay for Top Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-emerald-50 text-xs font-semibold uppercase tracking-wider mb-1 opacity-90 drop-shadow-sm">Total Eco Points</p>
            <motion.h2 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              {rounded}
            </motion.h2>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/30">
              <Flame size={16} className="text-orange-300 mr-1.5 drop-shadow-sm" />
              <span className="text-sm font-bold text-white drop-shadow-sm">{userStats.streak} Day Streak</span>
            </div>
            <button 
              onClick={() => navigate('/rewards')}
              className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-white/30 transition-all shadow-sm border border-white/30 group/btn"
            >
              <Gift size={16} className="text-white mr-2 group-hover/btn:scale-110 transition-transform drop-shadow-sm" />
              <span className="text-sm font-bold text-white drop-shadow-sm">Redeem</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-sm border border-white/20 hover:bg-white/20 transition-colors">
            <p className="text-emerald-50 text-[11px] font-bold uppercase tracking-wider mb-1 drop-shadow-sm">CO2 Saved</p>
            <p className="font-extrabold text-2xl text-white drop-shadow-md">{userStats.co2Saved} <span className="text-sm text-emerald-100 font-semibold">kg</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow-sm border border-white/20 hover:bg-white/20 transition-colors">
            <p className="text-emerald-50 text-[11px] font-bold uppercase tracking-wider mb-1 drop-shadow-sm">Items Recycled</p>
            <p className="font-extrabold text-2xl text-white drop-shadow-md">{userStats.itemsRecycled}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
