import React, { useState, useEffect } from 'react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidTopBar } from './components/AndroidTopBar';
import { AndroidBottomNav, NavTab } from './components/AndroidBottomNav';
import { QuickActionSheet } from './components/QuickActionSheet';
import { WhatsAppChooserModal } from './components/WhatsAppChooserModal';
import { AnthemPlayerModal } from './components/AnthemPlayerModal';
import { AdmissionsModal } from './components/AdmissionsModal';

import { HomeView } from './views/HomeView';
import { ResultsView } from './views/ResultsView';
import { AttendanceView } from './views/AttendanceView';
import { FeesStoreView } from './views/FeesStoreView';
import { AdminPortalView } from './views/AdminPortalView';

import { SCLDataService } from './services/dataService';
import { UserRole } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>(() => SCLDataService.getActiveRole());
  const [theme, setTheme] = useState<'day' | 'night'>(() => SCLDataService.getTheme());

  // Modals state
  const [isAdmissionsOpen, setIsAdmissionsOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isAnthemOpen, setIsAnthemOpen] = useState(false);

  // Sync theme with HTML root class
  useEffect(() => {
    if (theme === 'night') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    SCLDataService.setTheme(theme);
  }, [theme]);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    SCLDataService.setActiveRole(role);
  };

  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'day' ? 'night' : 'day'));
  };

  // Pending payments count for badge
  const pendingCount = SCLDataService.getPayments().filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f7f2ea] dark:bg-[#0d1421] text-[#241b17] dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* Android Device Container Wrapper */}
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col bg-[#fffbf4] dark:bg-[#111827] shadow-2xl relative min-h-screen">
        
        {/* Android System Status Bar */}
        <AndroidStatusBar />

        {/* Top App Bar */}
        <AndroidTopBar
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          onOpenAnthem={() => setIsAnthemOpen(true)}
        />

        {/* Main View Area */}
        <main className="flex-1 p-3.5 sm:p-4 overflow-y-auto">
          {currentTab === 'home' && (
            <HomeView
              currentRole={currentRole}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenAdmissions={() => setIsAdmissionsOpen(true)}
              onOpenAnthem={() => setIsAnthemOpen(true)}
              onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
            />
          )}

          {currentTab === 'results' && (
            <ResultsView currentRole={currentRole} />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView currentRole={currentRole} />
          )}

          {currentTab === 'fees' && (
            <FeesStoreView currentRole={currentRole} />
          )}

          {currentTab === 'admin' && (
            <AdminPortalView
              currentRole={currentRole}
              onOpenAdmissions={() => setIsAdmissionsOpen(true)}
            />
          )}
        </main>

        {/* Floating Action Button & Quick Action Sheet */}
        <QuickActionSheet
          currentRole={currentRole}
          onOpenAdmissions={() => setIsAdmissionsOpen(true)}
          onNavigateToTab={(tab) => setCurrentTab(tab)}
          onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          onOpenAnthem={() => setIsAnthemOpen(true)}
        />

        {/* Android Material 3 Bottom Navigation Bar */}
        <AndroidBottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          pendingVerificationsCount={pendingCount}
        />

        {/* WhatsApp Helpdesk Chooser Modal */}
        <WhatsAppChooserModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
        />

        {/* School Anthem Player Modal */}
        <AnthemPlayerModal
          isOpen={isAnthemOpen}
          onClose={() => setIsAnthemOpen(false)}
        />

        {/* Pupil Admission Modal */}
        <AdmissionsModal
          isOpen={isAdmissionsOpen}
          onClose={() => setIsAdmissionsOpen(false)}
          onStudentRegistered={() => {
            // Refresh state
          }}
        />
      </div>
    </div>
  );
};
