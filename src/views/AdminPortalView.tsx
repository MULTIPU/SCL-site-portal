import React, { useState } from 'react';
import { 
  ShieldAlert, CheckCircle, XCircle, Users, Clock, 
  Search, Check, AlertCircle, FileText, KeyRound, Edit3 
} from 'lucide-react';
import { SCLDataService, generateSCLSchoolId } from '../services/dataService';
import { UserRole, PaymentSubmission, Student } from '../types';

interface AdminPortalViewProps {
  currentRole: UserRole;
  onOpenAdmissions: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ currentRole, onOpenAdmissions }) => {
  const [activeSection, setActiveSection] = useState<'payments' | 'identities' | 'staff' | 'cms'>('payments');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  // Payments State
  const [payments, setPayments] = useState<PaymentSubmission[]>(() => SCLDataService.getPayments());
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Payment receipt could not be verified on Zenith Bank portal');

  // Identities State
  const students = SCLDataService.getStudents();
  const [testName, setTestName] = useState('Oladipo Samuel Babatunde');
  const [testSeq, setTestSeq] = useState(5);
  const [computedId, setComputedId] = useState(() => generateSCLSchoolId('Oladipo Samuel Babatunde', 5));

  // Staff Attendance Check-in State
  const [staffCheckins, setStaffCheckins] = useState([
    { name: 'Mr. Adeleke B. O.', role: 'JSS 2 Class Master', time: '07:28 AM', status: 'On-time' },
    { name: 'Mrs. Balogun T. A.', role: 'Senior Mathematics', time: '07:35 AM', status: 'On-time' },
    { name: 'Mr. Ogundele S. K.', role: 'Physics Master', time: '07:42 AM', status: 'On-time' },
    { name: 'Miss Eze C. N.', role: 'Basic 4 Teacher', time: '08:02 AM', status: 'Late' },
  ]);

  const canApprove = ['management_admin', 'technical_admin', 'developer'].includes(currentRole);

  const handleConfirm = (id: string) => {
    const res = SCLDataService.confirmPayment(id, currentRole);
    if (res.success) {
      setPayments(SCLDataService.getPayments());
      setActionFeedback({ type: 'ok', message: res.message });
    } else {
      setActionFeedback({ type: 'err', message: res.message });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleReject = (id: string) => {
    const res = SCLDataService.rejectPayment(id, currentRole, rejectReason);
    if (res.success) {
      setPayments(SCLDataService.getPayments());
      setActionFeedback({ type: 'ok', message: res.message });
      setRejectId(null);
    } else {
      setActionFeedback({ type: 'err', message: res.message });
    }
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleCalculateTestId = () => {
    const id = generateSCLSchoolId(testName, testSeq);
    setComputedId(id);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-[#500004] via-[#650007] to-[#8a0014] text-white p-5 rounded-3xl shadow-lg border-2 border-scl-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#450000] flex items-center justify-center font-black shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Administrative Portal</h2>
              <p className="text-xs text-amber-200">
                Logged in as: <span className="font-bold underline uppercase">{currentRole.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex bg-black/25 p-1 rounded-2xl mt-4 border border-white/20 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('payments')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${activeSection === 'payments' ? 'bg-amber-400 text-[#450000] shadow' : 'text-white'}`}
          >
            Payments Verification ({payments.filter(p => p.status === 'pending').length} Pending)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('identities')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${activeSection === 'identities' ? 'bg-amber-400 text-[#450000] shadow' : 'text-white'}`}
          >
            SCL Binary IDs ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('staff')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${activeSection === 'staff' ? 'bg-amber-400 text-[#450000] shadow' : 'text-white'}`}
          >
            Staff Clock-in
          </button>
        </div>
      </section>

      {/* Role Notice */}
      {!canApprove && activeSection === 'payments' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>
            Notice: Current persona "{currentRole.replace('_', ' ')}" has read-only access. Switch to <strong>Management Admin</strong>, <strong>Technical Admin</strong>, or <strong>Developer</strong> in the top bar to approve/reject payments.
          </span>
        </div>
      )}

      {actionFeedback && (
        <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
          actionFeedback.type === 'ok' 
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300' 
            : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-300'
        }`}>
          {actionFeedback.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Section 1: Payments Verification Ledger */}
      {activeSection === 'payments' && (
        <section className="bg-white dark:bg-[#182234] p-4 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-scl-maroon dark:text-amber-400">
              Payment Submissions Ledger
            </h3>
            <span className="text-xs text-gray-500">First Confirmation Wins Rule</span>
          </div>

          <div className="space-y-3">
            {payments.map((pay) => (
              <div 
                key={pay.id}
                className="p-3.5 rounded-2xl border border-amber-200 dark:border-gray-700 bg-amber-50/40 dark:bg-gray-800/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-scl-maroon dark:text-amber-300">
                      {pay.referenceNumber}
                    </span>
                    <span className="text-[10px] text-gray-500 ml-2">({pay.datePaid})</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    pay.status === 'confirmed' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : pay.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pay.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500">Student:</span>
                    <p className="font-bold">{pay.studentName} ({pay.studentId})</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500">Amount:</span>
                    <p className="font-black text-emerald-700 dark:text-emerald-400">₦{pay.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500">Payer / Bank:</span>
                    <p className="font-bold">{pay.payerName} • {pay.bankUsed}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500">Purpose:</span>
                    <p className="font-bold truncate">{pay.purpose}</p>
                  </div>
                </div>

                {pay.confirmedBy && (
                  <p className="text-[10px] text-emerald-600 font-bold">
                    Confirmed by: {pay.confirmedBy.replace('_', ' ')}
                  </p>
                )}
                {pay.rejectionReason && (
                  <p className="text-[10px] text-red-600 font-bold">
                    Rejection Note: {pay.rejectionReason}
                  </p>
                )}

                {/* Verification Actions (Gated by Role) */}
                {pay.status === 'pending' && canApprove && (
                  <div className="flex gap-2 pt-2 border-t border-amber-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => handleConfirm(pay.id)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectId(rejectId === pay.id ? null : pay.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Reject Reason input dialog */}
                {rejectId === pay.id && (
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-gray-800 border border-red-300 dark:border-red-800 space-y-2 mt-2">
                    <label className="block text-[10px] font-bold text-red-700 dark:text-red-300">
                      Reason for Rejection:
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-red-300 outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectId(null)}
                        className="px-2.5 py-1 text-xs text-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(pay.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: SCL Binary ID Sequence Inspector */}
      {activeSection === 'identities' && (
        <section className="bg-white dark:bg-[#182234] p-4 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-scl-maroon dark:text-amber-400">
                SCL Binary ID Sequence & Allocator
              </h3>
              <p className="text-[11px] text-gray-500">
                Algorithm: SCL + 4 Initials + (0000..1111 binary / 2000 sequence)
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAdmissions}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#450000] text-xs font-bold"
            >
              + New Pupil
            </button>
          </div>

          {/* Test ID Generator Box */}
          <div className="p-3.5 bg-amber-50/80 dark:bg-gray-800 rounded-2xl border border-amber-300 dark:border-gray-700 space-y-2.5">
            <span className="text-[10px] font-bold uppercase text-scl-maroon dark:text-amber-400 block">
              Test Sequence Generation Algorithm
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Full Name"
                className="px-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-gray-600 outline-none"
              />
              <input
                type="number"
                value={testSeq}
                onChange={(e) => setTestSeq(parseInt(e.target.value) || 0)}
                placeholder="Sequence Number"
                className="px-3 py-1.5 text-xs rounded-xl border border-amber-300 dark:border-gray-600 outline-none"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleCalculateTestId}
                className="px-3 py-1.5 bg-scl-maroon text-amber-200 text-xs font-bold rounded-xl"
              >
                Compute ID
              </button>
              <span className="font-mono font-black text-sm text-scl-maroon dark:text-amber-300 bg-white dark:bg-gray-900 px-3 py-1 rounded-xl border border-amber-300">
                {computedId}
              </span>
            </div>
          </div>

          {/* Enrolled Pupils with Allocated IDs */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              Enrolled Pupils Master List
            </span>
            {students.map((std) => (
              <div 
                key={std.id}
                className="p-3 rounded-2xl border border-amber-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{std.fullName}</p>
                  <p className="text-[10px] text-gray-500">{std.className} • Admitted {std.admissionDate}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-scl-maroon dark:text-amber-300 block text-xs">
                    {std.schoolId}
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                    {std.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Staff Clock-in Register */}
      {activeSection === 'staff' && (
        <section className="bg-white dark:bg-[#182234] p-4 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-scl-maroon dark:text-amber-400">
              Staff Daily Clock-in Registry
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              GPS Verified
            </span>
          </div>

          <div className="space-y-2">
            {staffCheckins.map((st, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl border border-amber-200 dark:border-gray-700 bg-amber-50/40 dark:bg-gray-800/50 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{st.name}</p>
                  <p className="text-[10px] text-gray-500">{st.role}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200 block">
                    {st.time}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    st.status === 'On-time' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {st.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
