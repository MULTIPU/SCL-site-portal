import React, { useState } from 'react';
import { 
  Award, BookOpen, Users, Calendar, Sparkles, CheckCircle, 
  ChevronRight, Trophy, GraduationCap, Clock, Star, 
  ShieldAlert, School, ArrowRight, Heart
} from 'lucide-react';
import { SCLDataService, RESULT_CYCLES } from '../services/dataService';
import { UserRole } from '../types';

interface HomeViewProps {
  currentRole: UserRole;
  onNavigateTab: (tab: 'home' | 'results' | 'attendance' | 'fees' | 'admin') => void;
  onOpenAdmissions: () => void;
  onOpenAnthem: () => void;
  onOpenWhatsApp: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentRole,
  onNavigateTab,
  onOpenAdmissions,
  onOpenAnthem,
  onOpenWhatsApp
}) => {
  const [activeCycleTab, setActiveCycleTab] = useState<number>(1);
  const announcements = SCLDataService.getAnnouncements();

  // Leadership Prefects
  const prefects = [
    { title: 'Head Boy', name: 'Zubair Oluwaseun Emmanuel', class: 'SSS 3 Valedictory', tag: 'Executive' },
    { title: 'Head Girl', name: 'Adeyemi Kemi Blessing', class: 'SSS 1 Science', tag: 'Academic' },
    { title: 'Senior Prefect', name: 'Johnson Daniel Peters', class: 'JSS 2 Gold', tag: 'Leadership' },
    { title: 'Sports Captain', name: 'Chukwuemeka Obinna', class: 'Basic 4 Diamond', tag: 'Athletics' }
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Hero Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3f0004] via-[#650007] to-[#8a0014] text-white p-5 sm:p-6 shadow-xl border-2 border-scl-gold/40">
        {/* Decorative background glow & orbits */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-scl-gold/15 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-amber-500/10 blur-xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-scl-gold text-[#450000] text-[11px] font-black uppercase tracking-wider mb-2.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026/2027 Academic Session</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
            Shining Child <span className="text-scl-lightgold">Leaders School</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 max-w-lg mt-1 leading-relaxed">
            Epe, Lagos State. Quality education, experienced educators, and strong moral discipline.
            Admissions open from Day Care to SSS 3.
          </p>

          {/* Slogan Banner */}
          <div className="mt-3.5 p-2.5 rounded-2xl bg-black/25 backdrop-blur-md border border-amber-300/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">⭐</span>
              <p className="text-[11px] font-bold text-amber-200 italic">
                "Raising Today's Children to Become Tomorrow's Leaders"
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAnthem}
              className="text-[10px] font-extrabold bg-scl-gold/30 hover:bg-scl-gold/50 text-amber-200 border border-scl-gold/50 px-2.5 py-1 rounded-full whitespace-nowrap transition"
            >
              Play Anthem ▶
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            <button
              type="button"
              onClick={onOpenAdmissions}
              className="px-4 py-2.5 rounded-xl bg-scl-gold hover:bg-amber-300 text-[#450000] text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition flex items-center gap-1.5"
            >
              <span>Enroll / Admission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('results')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold active:scale-95 transition flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Check Term Results</span>
            </button>
          </div>
        </div>
      </section>

      {/* Notice Ticker Banner */}
      {announcements.length > 0 && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#650007] to-[#8a0014] text-white border-2 border-scl-gold shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-scl-gold text-[#4a0008] text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
              NOTICE
            </span>
            <p className="text-xs font-bold truncate">
              {announcements[0].title} — {announcements[0].content}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('results')}
            className="text-[10px] text-amber-200 font-extrabold underline whitespace-nowrap flex-shrink-0"
          >
            Details
          </button>
        </div>
      )}

      {/* School Statistics Card */}
      <section className="bg-gradient-to-br from-[#4a0006] via-[#650007] to-[#8a0014] text-white p-4 rounded-3xl shadow-lg border border-scl-gold/30">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-300">
            Official School Census & Milestones
          </h3>
          <span className="text-[10px] text-amber-200/80">Epe Zone, Lagos</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-amber-300/20 backdrop-blur-sm">
            <b className="block text-xl sm:text-2xl font-black text-white">420+</b>
            <span className="text-[9px] uppercase tracking-wider text-amber-200 font-bold">Students</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/10 border border-amber-300/20 backdrop-blur-sm">
            <b className="block text-xl sm:text-2xl font-black text-amber-300">38</b>
            <span className="text-[9px] uppercase tracking-wider text-amber-200 font-bold">Teachers</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/10 border border-amber-300/20 backdrop-blur-sm">
            <b className="block text-xl sm:text-2xl font-black text-white">16</b>
            <span className="text-[9px] uppercase tracking-wider text-amber-200 font-bold">Streams</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/10 border border-amber-300/20 backdrop-blur-sm">
            <b className="block text-xl sm:text-2xl font-black text-emerald-400">100%</b>
            <span className="text-[9px] uppercase tracking-wider text-amber-200 font-bold">WAEC Pass</span>
          </div>
        </div>
      </section>

      {/* Quick Access Grid (clean 2x3 grid) */}
      <section className="bg-white dark:bg-[#182234] p-4 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700">
        <h3 className="font-extrabold text-sm text-scl-maroon dark:text-amber-400 mb-3 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          <span>Core School Services</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('results')}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-gray-800 dark:to-gray-800/60 border border-amber-200/70 dark:border-gray-700 text-left hover:border-amber-400 transition active:scale-97"
          >
            <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <b className="block text-xs text-scl-maroon dark:text-amber-300 font-extrabold">Results Portal</b>
              <small className="text-[10px] text-gray-500 dark:text-gray-400">Cycles 1 to 4 tests</small>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-gray-800 dark:to-gray-800/60 border border-amber-200/70 dark:border-gray-700 text-left hover:border-amber-400 transition active:scale-97"
          >
            <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <b className="block text-xs text-scl-maroon dark:text-amber-300 font-extrabold">Attendance</b>
              <small className="text-[10px] text-gray-500 dark:text-gray-400">Morning & periods 1-6</small>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('fees')}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-gray-800 dark:to-gray-800/60 border border-amber-200/70 dark:border-gray-700 text-left hover:border-amber-400 transition active:scale-97"
          >
            <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <b className="block text-xs text-scl-maroon dark:text-amber-300 font-extrabold">Fees & Slips</b>
              <small className="text-[10px] text-gray-500 dark:text-gray-400">Verify bank receipts</small>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('fees')}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-gray-800 dark:to-gray-800/60 border border-amber-200/70 dark:border-gray-700 text-left hover:border-amber-400 transition active:scale-97"
          >
            <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <b className="block text-xs text-scl-maroon dark:text-amber-300 font-extrabold">Uniform Store</b>
              <small className="text-[10px] text-gray-500 dark:text-gray-400">Blazers, sports & books</small>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenAdmissions}
            className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-gray-800 dark:to-gray-800/60 border border-amber-200/70 dark:border-gray-700 text-left hover:border-amber-400 transition active:scale-97"
          >
            <div className="w-10 h-10 rounded-xl bg-scl-maroon text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <b className="block text-xs text-scl-maroon dark:text-amber-300 font-extrabold">Admission</b>
              <small className="text-[10px] text-gray-500 dark:text-gray-400">Enroll new ward</small>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-left hover:border-emerald-500 transition active:scale-97"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Star className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <b className="block text-xs text-emerald-800 dark:text-emerald-300 font-extrabold">WhatsApp Help</b>
              <small className="text-[10px] text-gray-500 dark:text-gray-400">Direct admin contact</small>
            </div>
          </button>
        </div>
      </section>

      {/* Academic Cycles Tracker Card */}
      <section className="bg-white dark:bg-[#182234] p-4 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-extrabold text-sm text-scl-maroon dark:text-amber-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>First Term Academic Cycles (2026/2027)</span>
          </h3>
          <span className="text-[10px] bg-amber-100 dark:bg-gray-700 text-[#650007] dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
            Africa/Lagos WAT
          </span>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
          SCL conducts four 4-week structured testing cycles each term to guarantee steady learning mastery.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RESULT_CYCLES.map((cycle) => {
            const isSelected = activeCycleTab === cycle.cycleNumber;
            return (
              <div
                key={cycle.cycleNumber}
                onClick={() => setActiveCycleTab(cycle.cycleNumber)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                  isSelected 
                    ? 'bg-amber-50 dark:bg-gray-800 border-amber-400 shadow-sm' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-scl-maroon dark:text-amber-300">
                    Cycle {cycle.cycleNumber}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                    cycle.status === 'open' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {cycle.status}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                  {cycle.title.split('—')[1] || cycle.title}
                </p>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                  <span>Due: {cycle.dueDate.slice(5)}</span>
                  <span className="font-bold text-scl-maroon dark:text-amber-400">Max: {cycle.testMaxMarks}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Leadership Prefects Board */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-[#182234] dark:to-gray-900 p-4 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-sm text-scl-maroon dark:text-amber-400 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Student Leadership & Prefects Board</span>
          </h3>
          <span className="text-[10px] bg-amber-200/80 dark:bg-gray-700 text-[#450000] dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
            2026/2027
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {prefects.map((pref, i) => (
            <div 
              key={i} 
              className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-amber-200/60 dark:border-gray-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-scl-maroon dark:text-amber-400 bg-amber-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {pref.title}
                </span>
                <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 mt-1 line-clamp-1">
                  {pref.name}
                </h4>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
                {pref.class}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* School Contact Footer Info */}
      <footer className="text-center py-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p className="font-bold text-scl-maroon dark:text-amber-300">
          Shining Child Leaders School — Epe, Lagos State, Nigeria
        </p>
        <p className="text-[11px]">
          Approved by Lagos State Ministry of Basic & Secondary Education
        </p>
        <p className="text-[10px] font-mono text-gray-400">
          SCL Platform v104 • Android Application Edition
        </p>
      </footer>
    </div>
  );
};
