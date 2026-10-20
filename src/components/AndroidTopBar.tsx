import React, { useState } from 'react';
import { Sun, Moon, ShieldCheck, MessageCircle, Volume2, UserCheck, ChevronDown } from 'lucide-react';
import { UserRole } from '../types';

interface TopBarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  theme: 'day' | 'night';
  onThemeToggle: () => void;
  onOpenWhatsApp: () => void;
  onOpenAnthem: () => void;
}

export const AndroidTopBar: React.FC<TopBarProps> = ({
  currentRole,
  onRoleChange,
  theme,
  onThemeToggle,
  onOpenWhatsApp,
  onOpenAnthem
}) => {
  const [isCoinFlipped, setIsCoinFlipped] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'parent', label: 'Parent / Guardian', desc: 'Check wards results, pay fees & attendance' },
    { id: 'student', label: 'Student Portal', desc: 'Results check, timetables, CBT & materials' },
    { id: 'teacher', label: 'Teacher / Staff', desc: 'Upload results, mark register, lesson notes' },
    { id: 'management_admin', label: 'Management Admin', desc: 'Financial approvals, school statistics' },
    { id: 'technical_admin', label: 'Technical Admin', desc: 'ID assignment, system maintenance' },
    { id: 'affairs_admin', label: 'Student Affairs', desc: 'Discipline, admissions, pastoral care' },
    { id: 'developer', label: 'System Developer', desc: 'Full privileges, database inspector' }
  ];

  return (
    <header className="bg-gradient-to-r from-[#500004] via-[#650007] to-[#7a000c] text-white px-3 py-2.5 shadow-md sticky top-6 z-40 border-b-2 border-scl-gold/40">
      <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto">
        {/* SCL Logo Coin with 3D Flip */}
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setIsCoinFlipped(!isCoinFlipped)}
            title="Tap to flip SCL School Coin"
            className="w-12 h-12 flex-shrink-0 relative cursor-pointer perspective-600 transition-transform hover:scale-105 active:scale-95"
            style={{ perspective: '800px' }}
          >
            <div 
              className={`w-full h-full rounded-full transition-transform duration-700 transform-style-3d relative ${isCoinFlipped ? 'rotate-y-180' : ''}`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isCoinFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front of coin: SCL Crest */}
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="w-full h-full rounded-full bg-[#650007] flex flex-col items-center justify-center border border-amber-300/80">
                  <span className="text-[10px] font-black tracking-tighter text-amber-300">SCL</span>
                  <span className="text-[7px] font-bold text-white tracking-widest">EPE</span>
                </div>
              </div>
              {/* Back of coin: Motto & Star */}
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7a0009] to-[#3a0004] p-0.5 shadow-md flex items-center justify-center backface-hidden rotate-y-180 border border-amber-300"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="text-center px-1">
                  <span className="text-xs">⭐</span>
                  <p className="text-[6px] font-black text-amber-200 uppercase leading-tight">LEADERS</p>
                </div>
              </div>
            </div>
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-[15px] sm:text-base tracking-wider uppercase text-white leading-tight">
                Shining Child Leaders
              </h1>
              <span className="bg-scl-gold/30 text-scl-lightgold border border-scl-gold/50 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                Epe
              </span>
            </div>
            <p className="text-[10px] text-amber-200/90 font-medium italic tracking-wide line-clamp-1">
              "Raising Today's Children to Become Tomorrow's Leaders"
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Anthem Button */}
          <button
            type="button"
            onClick={onOpenAnthem}
            title="Listen to School Anthem"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 flex items-center justify-center border border-amber-300/40 transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* WhatsApp Chooser */}
          <button
            type="button"
            onClick={onOpenWhatsApp}
            title="School WhatsApp Helpdesk"
            className="w-8 h-8 rounded-full bg-emerald-700/80 hover:bg-emerald-600 text-white flex items-center justify-center border border-emerald-400/50 shadow-sm transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-emerald-200" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onThemeToggle}
            title={theme === 'day' ? 'Switch to Night Mode' : 'Switch to Day Mode'}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 flex items-center justify-center border border-amber-300/40 transition active:scale-95"
          >
            {theme === 'day' ? <Moon className="w-4 h-4 text-amber-200" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>

          {/* Role Pill Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="bg-amber-400 text-[#4a0008] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-amber-300 transition active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="capitalize font-black text-[11px] max-w-[70px] truncate">
                {currentRole.replace('_', ' ')}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#182234] text-[#260c0d] dark:text-gray-100 rounded-xl shadow-2xl border-2 border-amber-400/60 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2 py-1.5 border-b border-amber-200 dark:border-gray-700 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[#650007] dark:text-amber-400 tracking-wider">
                    Switch Active Persona
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {roles.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        onRoleChange(r.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition flex flex-col ${
                        currentRole === r.id 
                          ? 'bg-[#650007] text-white font-bold' 
                          : 'hover:bg-amber-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{r.label}</span>
                        {currentRole === r.id && <span className="text-[10px] bg-amber-400 text-[#4a0008] px-1.5 rounded-full font-black">Active</span>}
                      </div>
                      <span className={`text-[10px] mt-0.5 ${currentRole === r.id ? 'text-amber-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        {r.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
