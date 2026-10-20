import React, { useState } from 'react';
import { 
  CalendarCheck, Check, X, Clock, AlertTriangle, 
  Users, ChevronDown, CheckCheck, Save, Sparkles 
} from 'lucide-react';
import { SCLDataService } from '../services/dataService';
import { UserRole, Student, AttendanceRecord } from '../types';

interface AttendanceViewProps {
  currentRole: UserRole;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ currentRole }) => {
  const [selectedClass, setSelectedClass] = useState('JSS 2 Gold');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notification, setNotification] = useState('');

  const students = SCLDataService.getStudents().filter(s => s.className === selectedClass || selectedClass === 'All');
  const allStudents = SCLDataService.getStudents();
  
  // Local attendance map studentId -> status
  const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>(() => {
    const existing = SCLDataService.getAttendance(selectedDate);
    const map: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    existing.forEach(r => {
      if (r.period === selectedPeriod) {
        map[r.studentId] = r.status;
      }
    });
    return map;
  });

  const classList = [
    'JSS 2 Gold',
    'SSS 1 Science',
    'Basic 4 Diamond',
    'SSS 3 Commercial',
    'Nursery 2 Sunshine',
    'All'
  ];

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setStatusMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated = { ...statusMap };
    students.forEach(s => {
      updated[s.schoolId] = 'present';
    });
    setStatusMap(updated);
    setNotification('All students marked present.');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSaveAttendance = () => {
    const currentStudents = selectedClass === 'All' ? allStudents : students;
    currentStudents.forEach(s => {
      const st = statusMap[s.schoolId] || 'present';
      SCLDataService.markAttendance({
        date: selectedDate,
        className: s.className,
        period: selectedPeriod,
        teacherName: currentRole === 'teacher' ? 'Class Master' : 'Teacher on Duty',
        studentId: s.schoolId,
        studentName: s.fullName,
        status: st
      });
    });
    setNotification('Attendance records successfully saved to SCL register.');
    setTimeout(() => setNotification(''), 4000);
  };

  const presentCount = students.filter(s => (statusMap[s.schoolId] || 'present') === 'present').length;
  const absentCount = students.filter(s => statusMap[s.schoolId] === 'absent').length;
  const lateCount = students.filter(s => statusMap[s.schoolId] === 'late').length;
  const totalCount = students.length || 1;
  const attendanceRate = Math.round((presentCount / totalCount) * 100);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <section className="bg-gradient-to-r from-scl-maroon to-[#8a0014] text-white p-5 rounded-3xl shadow-lg border-2 border-scl-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#450000] flex items-center justify-center font-black shadow-md">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Student Attendance</h2>
              <p className="text-xs text-amber-200">Class Roll Call & Period Tracking (Period 0 - 6)</p>
            </div>
          </div>
          <span className="bg-white/10 text-amber-200 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/20">
            {selectedDate}
          </span>
        </div>
      </section>

      {/* Stats Summary Chips */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white dark:bg-[#182234] p-3 rounded-2xl border border-amber-200/80 dark:border-gray-700 shadow-sm">
          <b className="block text-xl font-black text-emerald-600 dark:text-emerald-400">{presentCount}</b>
          <span className="text-[10px] text-gray-500 font-bold uppercase">Present</span>
        </div>
        <div className="bg-white dark:bg-[#182234] p-3 rounded-2xl border border-amber-200/80 dark:border-gray-700 shadow-sm">
          <b className="block text-xl font-black text-red-600 dark:text-red-400">{absentCount}</b>
          <span className="text-[10px] text-gray-500 font-bold uppercase">Absent</span>
        </div>
        <div className="bg-white dark:bg-[#182234] p-3 rounded-2xl border border-amber-200/80 dark:border-gray-700 shadow-sm">
          <b className="block text-xl font-black text-amber-500 dark:text-amber-300">{lateCount}</b>
          <span className="text-[10px] text-gray-500 font-bold uppercase">Late</span>
        </div>
        <div className="bg-white dark:bg-[#182234] p-3 rounded-2xl border border-amber-200/80 dark:border-gray-700 shadow-sm">
          <b className="block text-xl font-black text-scl-maroon dark:text-amber-400">{attendanceRate}%</b>
          <span className="text-[10px] text-gray-500 font-bold uppercase">Turnout</span>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Class & Date Filter Bar */}
      <section className="bg-white dark:bg-[#182234] p-4 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700 space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
              Select Class Stream
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-amber-50/40 dark:bg-gray-900 text-xs font-bold outline-none"
            >
              {classList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
              Register Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-amber-50/40 dark:bg-gray-900 text-xs font-bold outline-none"
            />
          </div>
        </div>

        {/* Periods Bar (0 = Morning Class, 1-6 = Periods) */}
        <div>
          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
            Register Session / Period
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 0, label: 'Period 0 (Morning Roll Call)' },
              { id: 1, label: 'Period 1 (08:30)' },
              { id: 2, label: 'Period 2 (09:15)' },
              { id: 3, label: 'Period 3 (10:15)' },
              { id: 4, label: 'Period 4 (11:00)' },
              { id: 5, label: 'Period 5 (12:30)' },
              { id: 6, label: 'Period 6 (13:15)' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedPeriod === p.id 
                    ? 'bg-scl-maroon text-amber-300 shadow-sm' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Bulk Action */}
        <div className="flex justify-between items-center pt-2 border-t border-amber-200/50 dark:border-gray-700">
          <span className="text-xs text-gray-500 font-medium">
            Roster: {students.length} pupil(s) listed
          </span>
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="text-xs font-extrabold text-scl-maroon dark:text-amber-400 flex items-center gap-1 hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present</span>
          </button>
        </div>
      </section>

      {/* Attendance Roster List */}
      <section className="space-y-2.5">
        {students.map((student) => {
          const status = statusMap[student.schoolId] || 'present';
          return (
            <div
              key={student.id}
              className="bg-white dark:bg-[#182234] p-3.5 rounded-2xl shadow-sm border border-amber-200/70 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-scl-maroon text-amber-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {student.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">
                    {student.fullName}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="font-mono font-bold text-scl-maroon dark:text-amber-400">{student.schoolId}</span>
                    <span>•</span>
                    <span>{student.className}</span>
                  </div>
                </div>
              </div>

              {/* Status Chips Selector */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.schoolId, 'present')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                    status === 'present'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>Present</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.schoolId, 'late')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                    status === 'late'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Late</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.schoolId, 'absent')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                    status === 'absent'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 hover:bg-red-100'
                  }`}
                >
                  <X className="w-3 h-3" />
                  <span>Absent</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange(student.schoolId, 'excused')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                    status === 'excused'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
                  }`}
                >
                  <span>Excused</span>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSaveAttendance}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-scl-maroon to-[#8a0014] text-amber-300 font-extrabold text-xs shadow-md hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save & Synchronize Attendance Register</span>
        </button>
      </div>
    </div>
  );
};
