import React from 'react';
import { Home, Award, CalendarCheck, CreditCard, ShieldAlert } from 'lucide-react';

export type NavTab = 'home' | 'results' | 'attendance' | 'fees' | 'admin';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingVerificationsCount?: number;
}

export const AndroidBottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingVerificationsCount = 0
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'results' as NavTab, label: 'Results', icon: Award },
    { id: 'attendance' as NavTab, label: 'Attendance', icon: CalendarCheck },
    { id: 'fees' as NavTab, label: 'Fees & Store', icon: CreditCard },
    { id: 'admin' as NavTab, label: 'Admin Portal', icon: ShieldAlert, badge: pendingVerificationsCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#350003] dark:bg-[#0c1421] border-t border-scl-gold/30 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 relative group focus:outline-none"
            >
              {/* Material 3 active pill indicator */}
              <div 
                className={`w-14 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive 
                    ? 'bg-scl-gold text-[#450000] shadow-sm scale-105' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-0.5 bg-red-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-white">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span 
                className={`text-[10px] mt-0.5 font-bold tracking-tight transition-colors duration-150 ${
                  isActive ? 'text-scl-gold font-extrabold' : 'text-white/60'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
