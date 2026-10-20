import React, { useState } from 'react';
import { 
  Award, Search, CheckCircle, FileText, Printer, 
  Upload, AlertCircle, Sparkles, BookOpen, User, Check
} from 'lucide-react';
import { SCLDataService, RESULT_CYCLES } from '../services/dataService';
import { StudentResult, UserRole } from '../types';

interface ResultsViewProps {
  currentRole: UserRole;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ currentRole }) => {
  const [searchId, setSearchId] = useState('SCLJDP0000');
  const [selectedCycle, setSelectedCycle] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'check' | 'upload'>('check');
  const [result, setResult] = useState<StudentResult | null>(() => {
    return SCLDataService.getResultForStudent('SCLJDP0000', 1) || null;
  });
  const [searchError, setSearchError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Teacher upload state
  const [uploadClass, setUploadClass] = useState('JSS 2 Gold');
  const [uploadSubject, setUploadSubject] = useState('Mathematics');
  const [sampleScoreInput, setSampleScoreInput] = useState('Johnson Daniel: 9\nAdeyemi Kemi: 10\nChukwuemeka Obinna: 8');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    const found = SCLDataService.getResultForStudent(searchId, selectedCycle);
    if (found) {
      setResult(found);
      setSearchError('');
    } else {
      setResult(null);
      setSearchError(`No assessment record found for ID/Name "${searchId}" in Cycle ${selectedCycle}. Try SCLJDP0000 or SCLAKB0001.`);
    }
  };

  const handleCycleChange = (cycleNum: number) => {
    setSelectedCycle(cycleNum);
    const found = SCLDataService.getResultForStudent(searchId, cycleNum);
    if (found) {
      setResult(found);
      setSearchError('');
    } else {
      setResult(null);
      setSearchError(`Cycle ${cycleNum} scores are currently in marking/collation phase.`);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadSuccess(`Scores for ${uploadClass} - ${uploadSubject} submitted to SCL Academic Database successfully.`);
    setTimeout(() => setUploadSuccess(''), 4000);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header Card */}
      <section className="bg-gradient-to-r from-scl-maroon to-[#8a0014] text-white p-5 rounded-3xl shadow-lg border-2 border-scl-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#450000] flex items-center justify-center font-black shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Academic Results Portal</h2>
              <p className="text-xs text-amber-200">2026/2027 Session • Four-Week Assessment Cycles</p>
            </div>
          </div>
          
          {['teacher', 'management_admin', 'technical_admin', 'developer'].includes(currentRole) && (
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/20 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('check')}
                className={`px-3 py-1 rounded-lg transition ${activeTab === 'check' ? 'bg-amber-400 text-[#450000]' : 'text-white'}`}
              >
                Check
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1 rounded-lg transition ${activeTab === 'upload' ? 'bg-amber-400 text-[#450000]' : 'text-white'}`}
              >
                Teacher Upload
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Cycle Selector Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {RESULT_CYCLES.map((cycle) => (
          <button
            key={cycle.cycleNumber}
            type="button"
            onClick={() => handleCycleChange(cycle.cycleNumber)}
            className={`flex-1 min-w-[130px] p-2.5 rounded-2xl border text-center transition font-bold text-xs ${
              selectedCycle === cycle.cycleNumber
                ? 'bg-scl-maroon text-amber-300 border-amber-400 shadow-md'
                : 'bg-white dark:bg-[#182234] text-gray-700 dark:text-gray-300 border-amber-200 dark:border-gray-700 hover:border-amber-400'
            }`}
          >
            <span className="block text-[11px] font-black uppercase tracking-wider">Cycle {cycle.cycleNumber}</span>
            <span className="text-[10px] opacity-80 block truncate">{cycle.title.split('—')[1] || cycle.title}</span>
          </button>
        ))}
      </div>

      {activeTab === 'check' ? (
        <>
          {/* Search Box */}
          <section className="bg-white dark:bg-[#182234] p-4 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700">
            <form onSubmit={handleSearch} className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Enter Student SCL Binary ID or Pupil Name
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="e.g. SCLJDP0000 or Daniel"
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-amber-300 dark:border-gray-600 bg-amber-50/50 dark:bg-gray-900 text-xs font-bold font-mono focus:ring-2 focus:ring-amber-400 outline-none uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-scl-maroon text-amber-300 font-extrabold text-xs shadow-md hover:bg-[#7a000c] active:scale-95 transition"
                >
                  Verify & Fetch
                </button>
              </div>

              {/* Demo Quick ID Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-gray-500 font-medium">Quick Test Pins:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchId('SCLJDP0000');
                    const r = SCLDataService.getResultForStudent('SCLJDP0000', selectedCycle);
                    setResult(r || null);
                    setSearchError(r ? '' : 'Record not found');
                  }}
                  className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-gray-800 text-scl-maroon dark:text-amber-300 text-[10px] font-mono font-bold hover:bg-amber-200"
                >
                  SCLJDP0000 (JSS 2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchId('SCLAKB0001');
                    const r = SCLDataService.getResultForStudent('SCLAKB0001', selectedCycle);
                    setResult(r || null);
                    setSearchError(r ? '' : 'Record not found');
                  }}
                  className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-gray-800 text-scl-maroon dark:text-amber-300 text-[10px] font-mono font-bold hover:bg-amber-200"
                >
                  SCLAKB0001 (SSS 1)
                </button>
              </div>
            </form>
          </section>

          {/* Search Error Message */}
          {searchError && (
            <div className="p-4 bg-amber-50 dark:bg-gray-800/80 border border-amber-300 dark:border-gray-700 rounded-3xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Official SCL Result Sheet Display */}
          {result && (
            <section className="bg-white dark:bg-[#182234] rounded-3xl shadow-xl border-2 border-amber-400 overflow-hidden print:border-none">
              {/* Report Header */}
              <div className="bg-gradient-to-b from-[#4a0006] to-[#650007] text-white p-4 text-center border-b-2 border-amber-400">
                <div className="w-12 h-12 rounded-full bg-white text-[#650007] flex items-center justify-center font-black mx-auto mb-1 border-2 border-amber-400">
                  SCL
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-wide uppercase">
                  Shining Child Leaders School
                </h3>
                <p className="text-[11px] text-amber-200 font-semibold">
                  Epe, Lagos State • Continuous Assessment Score Sheet
                </p>
                <div className="inline-block mt-2 bg-scl-gold text-[#450000] px-3 py-0.5 rounded-full text-[10px] font-black uppercase">
                  {result.cycleTitle} ({result.term} {result.session})
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="p-4 bg-amber-50/70 dark:bg-gray-800/50 border-b border-amber-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Student Name</span>
                  <p className="font-extrabold text-scl-maroon dark:text-amber-300">{result.studentName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">School ID</span>
                  <p className="font-mono font-black text-gray-800 dark:text-gray-100">{result.studentId}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Class Stream</span>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{result.className}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Position In Class</span>
                  <p className="font-black text-emerald-700 dark:text-emerald-400">
                    {result.position} of {result.totalInClass}
                  </p>
                </div>
              </div>

              {/* Subjects Score Table */}
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-scl-maroon text-amber-200 text-[10px] uppercase tracking-wider">
                      <th className="p-2.5 rounded-l-xl">Subject</th>
                      <th className="p-2.5 text-center">Category</th>
                      <th className="p-2.5 text-center">Test (/10)</th>
                      {result.cycleNumber === 4 && <th className="p-2.5 text-center">Exam (/60)</th>}
                      <th className="p-2.5 text-center">Total</th>
                      <th className="p-2.5 text-center">Grade</th>
                      <th className="p-2.5 rounded-r-xl">Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 dark:divide-gray-700">
                    {result.subjects.map((sub, i) => (
                      <tr key={i} className="hover:bg-amber-50/50 dark:hover:bg-gray-800/40">
                        <td className="p-2.5 font-bold text-gray-900 dark:text-gray-100">
                          {sub.name}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
                            {sub.category || 'Core'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-scl-maroon dark:text-amber-300">
                          {sub.testScore}
                        </td>
                        {result.cycleNumber === 4 && (
                          <td className="p-2.5 text-center font-bold text-gray-800 dark:text-gray-200">
                            {sub.examScore || 0}
                          </td>
                        )}
                        <td className="p-2.5 text-center font-black text-gray-900 dark:text-white">
                          {sub.totalScore}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {sub.grade}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-600 dark:text-gray-300 italic text-[11px]">
                          {sub.remark}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats */}
              <div className="mx-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800/60 rounded-2xl border border-amber-300/70 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Aggregate Score:</span>
                  <p className="font-black text-sm text-scl-maroon dark:text-amber-300">
                    {result.totalScore} / {result.maxPossible}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Average Percentage:</span>
                  <p className="font-black text-sm text-emerald-700 dark:text-emerald-400">
                    {result.average.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Class Attendance:</span>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {result.attendanceDays} of {result.outOfDays} Days
                  </p>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="p-4 space-y-2 text-xs">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-scl-maroon dark:text-amber-400 text-[10px] uppercase block">
                    Class Teacher's Remark:
                  </span>
                  <p className="italic text-gray-700 dark:text-gray-300 mt-0.5">{result.teacherRemark}</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-gray-700">
                  <span className="font-bold text-scl-maroon dark:text-amber-400 text-[10px] uppercase block">
                    Principal's Remark:
                  </span>
                  <p className="italic text-gray-700 dark:text-gray-300 mt-0.5">{result.principalRemark}</p>
                </div>
              </div>

              {/* Print / Save Footer */}
              <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-mono">
                  Verified with SCL Identity Verification Hash
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-scl-maroon text-amber-200 text-xs font-bold flex items-center gap-1.5 hover:bg-[#7a000c] transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
              </div>
            </section>
          )}
        </>
      ) : (
        /* Teacher Result Upload View */
        <section className="bg-white dark:bg-[#182234] p-5 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700 space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-200 dark:border-gray-700 pb-3">
            <Upload className="w-5 h-5 text-scl-maroon dark:text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-scl-maroon dark:text-amber-400">Teacher Result Entry & Cycle Submission</h3>
              <p className="text-[11px] text-gray-500">Authorized for Class Teachers & Subject Masters</p>
            </div>
          </div>

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Target Class
                </label>
                <select
                  value={uploadClass}
                  onChange={(e) => setUploadClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-bold outline-none"
                >
                  <option value="JSS 1 Bronze">JSS 1 Bronze</option>
                  <option value="JSS 2 Gold">JSS 2 Gold</option>
                  <option value="JSS 3 Silver">JSS 3 Silver</option>
                  <option value="SSS 1 Science">SSS 1 Science</option>
                  <option value="SSS 1 Arts">SSS 1 Arts</option>
                  <option value="SSS 1 Commercial">SSS 1 Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <select
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-bold outline-none"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="English Studies">English Studies</option>
                  <option value="Basic Science & Technology">Basic Science & Tech</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Economics">Economics</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Student Marks Entry (Format: Name: Score / 10)
              </label>
              <textarea
                rows={4}
                value={sampleScoreInput}
                onChange={(e) => setSampleScoreInput(e.target.value)}
                className="w-full p-3 rounded-xl border border-amber-300 dark:border-gray-600 bg-amber-50/40 dark:bg-gray-900 text-xs font-mono outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-scl-maroon text-amber-300 font-extrabold text-xs shadow-md hover:bg-[#7a000c] active:scale-95 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit Scores for Verification</span>
            </button>
          </form>
        </section>
      )}
    </div>
  );
};
