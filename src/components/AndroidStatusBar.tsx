import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Bell } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#3c0004] text-white/90 text-xs px-4 py-1.5 flex items-center justify-between select-none font-sans font-medium tracking-wide z-50 sticky top-0 shadow-sm">
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-[13px]">{time}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-scl-gold animate-pulse"></div>
        <Bell className="w-3 h-3 text-scl-lightgold opacity-80" />
      </div>
      <div className="flex items-center space-x-2.5">
        <span className="text-[10px] font-bold tracking-wider text-scl-lightgold/90">5G</span>
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center space-x-1">
          <span className="text-[10px]">98%</span>
          <Battery className="w-4 h-4 text-emerald-400 rotate-90" />
        </div>
      </div>
    </div>
  );
};
