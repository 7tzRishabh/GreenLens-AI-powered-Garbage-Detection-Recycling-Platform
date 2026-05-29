import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center animate-slide-up z-[100]">
      <CheckCircle2 className="mr-3 flex-shrink-0" size={24} />
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
};
