import React, { useState } from 'react';
import { X, CheckCircle2, UserPlus, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { SCLDataService } from '../services/dataService';
import { Student } from '../types';

interface AdmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentRegistered?: (student: Student) => void;
}

export const AdmissionsModal: React.FC<AdmissionsModalProps> = ({
  isOpen,
  onClose,
  onStudentRegistered
}) => {
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('JSS 1 Bronze');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dob, setDob] = useState('2014-06-12');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('Epe, Lagos State');
  const [stateOfOrigin, setStateOfOrigin] = useState('Lagos');
  const [emergencyContact, setEmergencyContact] = useState('');
  
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const classOptions = [
    'Day Care / Creche',
    'Nursery 1 Sunshine',
    'Nursery 2 Rainbow',
    'Basic 1 Sapphire',
    'Basic 2 Emerald',
    'Basic 3 Ruby',
    'Basic 4 Diamond',
    'Basic 5 Pearl',
    'JSS 1 Bronze',
    'JSS 2 Gold',
    'JSS 3 Silver',
    'SSS 1 Science',
    'SSS 1 Arts',
    'SSS 1 Commercial',
    'SSS 2 College',
    'SSS 3 Valedictory'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please provide student full name.');
      return;
    }
    if (!parentName.trim() || !parentPhone.trim()) {
      setError('Please provide parent/guardian name and phone number.');
      return;
    }

    try {
      const student = SCLDataService.registerStudent({
        fullName: fullName.trim(),
        className,
        gender,
        dateOfBirth: dob,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@student.scl.ng`,
        address: address.trim(),
        stateOfOrigin,
        admissionDate: new Date().toISOString().split('T')[0],
        emergencyContact: emergencyContact.trim() || parentPhone.trim()
      });

      setCreatedStudent(student);
      if (onStudentRegistered) onStudentRegistered(student);
      setError('');
    } catch {
      setError('Failed to complete registration. Please retry.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#182234] text-[#241b17] dark:text-gray-100 rounded-3xl shadow-2xl border border-amber-300 dark:border-gray-700 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-scl-maroon to-[#8a0014] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#450000] flex items-center justify-center font-black">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide">SCL Pupil Admission</h3>
              <p className="text-[11px] text-amber-200">Official Registration & SCL Binary ID Generation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body or Success Screen */}
        <div className="p-5 overflow-y-auto space-y-4">
          {createdStudent ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-scl-maroon dark:text-amber-400">
                  Admission Successfully Registered!
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  New student identity has been allocated on the SCL Platform sequence.
                </p>
              </div>

              {/* ID Badge Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-amber-400 rounded-2xl p-4 text-left shadow-sm">
                <div className="flex justify-between items-center border-b border-amber-200 dark:border-gray-700 pb-2 mb-2">
                  <span className="text-[10px] font-bold tracking-wider text-scl-maroon dark:text-amber-400 uppercase">
                    Shining Child Leaders Identity Card
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Allocated SCL Binary ID</p>
                    <p className="text-xl font-black font-mono text-scl-maroon dark:text-amber-300 tracking-wider">
                      {createdStudent.schoolId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdStudent.schoolId)}
                    className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#450000] text-xs font-bold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500">Student Name:</span>
                    <p className="font-bold">{createdStudent.fullName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500">Admitted Class:</span>
                    <p className="font-bold">{createdStudent.className}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500">Parent / Guardian:</span>
                    <p className="font-bold">{createdStudent.parentName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500">Parent Phone:</span>
                    <p className="font-bold">{createdStudent.parentPhone}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCreatedStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-amber-300 dark:border-gray-600 text-xs font-bold hover:bg-amber-50 dark:hover:bg-gray-800"
                >
                  Register Another Pupil
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-scl-maroon text-amber-200 text-xs font-bold hover:bg-[#7a000c]"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-amber-50/70 dark:bg-gray-800/50 p-3 rounded-2xl border border-amber-200/60 dark:border-gray-700 space-y-3">
                <span className="text-[11px] font-black uppercase text-scl-maroon dark:text-amber-400 tracking-wider">
                  1. Child Information
                </span>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Child's Full Name (Surname First) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Adeleke Olamide Victor"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Target Class *
                    </label>
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                    >
                      {classOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGender('Male')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                          gender === 'Male' 
                            ? 'bg-scl-maroon text-white border-scl-maroon' 
                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('Female')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                          gender === 'Female' 
                            ? 'bg-scl-maroon text-white border-scl-maroon' 
                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      State of Origin
                    </label>
                    <input
                      type="text"
                      value={stateOfOrigin}
                      onChange={(e) => setStateOfOrigin(e.target.value)}
                      placeholder="e.g. Lagos"
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/70 dark:bg-gray-800/50 p-3 rounded-2xl border border-amber-200/60 dark:border-gray-700 space-y-3">
                <span className="text-[11px] font-black uppercase text-scl-maroon dark:text-amber-400 tracking-wider">
                  2. Parent / Guardian Details
                </span>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Parent / Guardian Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Chief & Mrs. O. Adeleke"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@example.ng"
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Home Address in Epe / Lagos
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street name, Town, Lagos"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-scl-maroon to-[#8a0014] text-amber-300 font-extrabold text-sm shadow-md hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Admission & Allocate SCL ID</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
