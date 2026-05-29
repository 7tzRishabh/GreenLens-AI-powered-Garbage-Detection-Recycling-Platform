import React, { useState, useEffect } from 'react';
import { Trash2, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export const SmartDustbin: React.FC = () => {
  const [fillLevel, setFillLevel] = useState(0);
  
  useEffect(() => {
    // Animate to 70% on mount
    const timer = setTimeout(() => {
      setFillLevel(70);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (level: number) => {
    if (level < 60) return 'bg-green-500';
    if (level <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (level: number) => {
    if (level < 60) return 'text-green-600';
    if (level <= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center text-lg">
            <Trash2 size={18} className="mr-2 text-gray-700" />
            Smart Dustbin Status
          </h3>
          <p className="text-xs text-gray-500 flex items-center mt-1.5">
            <MapPin size={12} className="mr-1" /> Smart Dustbin - Jabalpur
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center justify-end tracking-wider">
            <Clock size={12} className="mr-1" /> Updated Just Now
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Dustbin Visual */}
        <div className="relative w-20 h-28 bg-gray-100 rounded-b-xl rounded-t-sm border-2 border-gray-300 overflow-hidden flex-shrink-0 shadow-inner">
          {/* Dustbin Lid (visual only) */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-300 z-10"></div>
          
          {/* Fill Level */}
          <motion.div 
            className={`absolute bottom-0 left-0 right-0 ${getStatusColor(fillLevel)} opacity-90`}
            initial={{ height: '0%' }}
            animate={{ height: `${fillLevel}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Liquid wave effect */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-2 bg-white/20"
              animate={{ 
                x: ['-5%', '5%', '-5%'],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bin Fill Level</p>
          <div className="flex items-end gap-2 mb-3">
            <h4 className={`text-4xl font-extrabold tracking-tight ${getStatusText(fillLevel)}`}>
              {fillLevel}%
            </h4>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${getStatusColor(fillLevel)}`}
              initial={{ width: '0%' }}
              animate={{ width: `${fillLevel}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          
          <p className="text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
            {fillLevel > 80 
              ? 'Bin is almost full. Pickup recommended.' 
              : fillLevel >= 60 
                ? 'Bin is filling up. Monitor status.' 
                : 'Bin has plenty of space.'}
          </p>
        </div>
      </div>
    </div>
  );
};
