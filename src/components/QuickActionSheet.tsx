import React, { useState } from 'react';
import { 
  Plus, X, UserPlus, FileCheck, CreditCard, 
  ClipboardList, Bell, HelpCircle, Music, Shield 
} from 'lucide-react';
import { UserRole } from '../types';

interface QuickActionSheetProps {
  currentRole: UserRole;
  onOpenAdmissions: () => void;
  onNavigateToTab: (tab: 'home' | 'results' | 'attendance' | 'fees' | 'admin') => void;
  onOpenWhatsApp: () => void;
  onOpenAnthem: () => void;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({
  currentRole,
  onOpenAdmissions,
  onNavigateToTab,
  onOpenWhatsApp,
  onOpenAnthem
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = ['management_admin', 'technical_admin', 'developer', 'affairs_admin'].includes(currentRole);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Actions"
        className="fixed right-4 bottom-20 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-scl-gold via-amber-400 to-amber-300 text-[#450000] shadow-[0_8px_25px_rgba(242,174,0,0.5)] border-2 border-white/60 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
      >
        <Plus className={`w-7 h-7 stroke-[3] transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Bottom Sheet Card */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white dark:bg-[#182234] text-[#241b17] dark:text-gray-100 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t-2 sm:border border-amber-400/50 p-5 animate-in slide-in-from-bottom duration-250 max-h-[85vh] overflow-y-auto"
          >
            {/* Sheet Handle & Header */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3"></div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-gray-700">
              <div>
                <h3 className="font-extrabold text-lg text-scl-maroon dark:text-amber-400">SCL Quick Actions</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fast access to school services & administrative tools</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 py-4">
              <button
                type="button"
                onClick={() => handleAction(onOpenAdmissions)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-gray-800/80 border border-amber-200 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-100/60 dark:hover:bg-gray-800 transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-scl-maroon dark:text-amber-300">Admission</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Register new pupil</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAction(() => onNavigateToTab('results'))}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-gray-800/80 border border-amber-200 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-100/60 dark:hover:bg-gray-800 transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-scl-maroon dark:text-amber-300">Check Results</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Cycle 1-4 scores</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAction(() => onNavigateToTab('fees'))}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-gray-800/80 border border-amber-200 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-100/60 dark:hover:bg-gray-800 transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-scl-maroon dark:text-amber-300">Pay Fees</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Upload transfer slip</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAction(() => onNavigateToTab('attendance'))}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-gray-800/80 border border-amber-200 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-100/60 dark:hover:bg-gray-800 transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-scl-maroon dark:text-amber-300">Attendance</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Mark daily register</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onOpenAnthem)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-gray-800/80 border border-amber-200 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-100/60 dark:hover:bg-gray-800 transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-scl-maroon dark:text-amber-300">School Anthem</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Audio & lyrics</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onOpenWhatsApp)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 transition text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <HelpCircle className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <p className="font-bold text-xs text-emerald-800 dark:text-emerald-300">Helpdesk</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">WhatsApp support</p>
                </div>
              </button>
            </div>

            {/* Admin Dedicated Section */}
            {isAdmin && (
              <div className="mt-2 pt-3 border-t border-dashed border-amber-300 dark:border-gray-700">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Shield className="w-4 h-4 text-scl-maroon dark:text-amber-400" />
                  <span className="text-[11px] font-black uppercase text-scl-maroon dark:text-amber-400">
                    Administrator Actions ({currentRole.replace('_', ' ')})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(() => onNavigateToTab('admin'))}
                    className="p-2.5 rounded-xl bg-scl-maroon text-amber-200 text-xs font-bold text-center hover:bg-[#7a000c] transition"
                  >
                    Payment Verifications
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(() => onNavigateToTab('admin'))}
                    className="p-2.5 rounded-xl bg-amber-400 text-[#450000] text-xs font-bold text-center hover:bg-amber-300 transition"
                  >
                    SCL ID Sequence
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
