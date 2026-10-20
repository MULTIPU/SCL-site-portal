import React, { useState } from 'react';
import { 
  CreditCard, ShoppingBag, CheckCircle, Upload, 
  FileCheck, AlertCircle, Sparkles, Building, Copy, Check, Info 
} from 'lucide-react';
import { SCLDataService } from '../services/dataService';
import { UserRole, UniformItem, PaymentSubmission } from '../types';

interface FeesStoreViewProps {
  currentRole: UserRole;
}

export const FeesStoreView: React.FC<FeesStoreViewProps> = ({ currentRole }) => {
  const [activeTab, setActiveTab] = useState<'fees' | 'upload' | 'store'>('fees');
  
  // Payment Form state
  const [studentId, setStudentId] = useState('SCLJDP0000');
  const [amount, setAmount] = useState('145000');
  const [purpose, setPurpose] = useState('First Term Tuition & Development Package');
  const [bankUsed, setBankUsed] = useState('Zenith Bank');
  const [payerName, setPayerName] = useState('Engr. Emmanuel Peters');
  const [payerPhone, setPayerPhone] = useState('+234 802 345 6789');
  const [referenceNumber, setReferenceNumber] = useState('ZEN-20261019-8971');
  const [submissionSuccess, setSubmissionSuccess] = useState<PaymentSubmission | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [copiedBank, setCopiedBank] = useState(false);

  // Uniform Store state
  const uniforms = SCLDataService.getUniforms();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderNotification, setOrderNotification] = useState('');

  const filteredUniforms = uniforms.filter(u => selectedCategory === 'All' || u.category === selectedCategory);

  const handleSimulateOCR = () => {
    setOcrStatus('Analyzing receipt image with SCL OCR Scanner...');
    setTimeout(() => {
      const generatedRef = `TXN-${Date.now().toString().slice(-6)}`;
      setReferenceNumber(generatedRef);
      setOcrStatus(`Extracted Ref: ${generatedRef} • Amount: ₦${parseInt(amount).toLocaleString()} • Bank: ${bankUsed}`);
    }, 700);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !amount || !payerName) return;

    const student = SCLDataService.getStudentById(studentId);
    const newPayment = SCLDataService.submitPayment({
      referenceNumber: referenceNumber || `SCL-REF-${Date.now().toString().slice(-6)}`,
      studentId: studentId.toUpperCase(),
      studentName: student?.fullName || payerName,
      className: student?.className || 'General',
      amount: parseFloat(amount) || 0,
      term: 'First Term',
      purpose,
      payerName,
      payerPhone,
      bankUsed,
      datePaid: new Date().toISOString().split('T')[0]
    });

    // As mandated by AUDIT_REPORT.md spec #1: Clear image and file memory immediately after submission
    setOcrStatus('');
    setSubmissionSuccess(newPayment);
  };

  const handleAddToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setOrderNotification('Item added to school package cart.');
    setTimeout(() => setOrderNotification(''), 2500);
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = uniforms.find(u => u.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-scl-maroon to-[#8a0014] text-white p-5 rounded-3xl shadow-lg border-2 border-scl-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#450000] flex items-center justify-center font-black shadow-md">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Fees & School Store</h2>
              <p className="text-xs text-amber-200">Official Term Schedule, Slip Upload & Uniform Catalogue</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/25 p-1 rounded-2xl mt-4 border border-white/20 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('fees')}
            className={`flex-1 py-1.5 rounded-xl transition ${activeTab === 'fees' ? 'bg-amber-400 text-[#450000] shadow' : 'text-white'}`}
          >
            Fee Structure
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-xl transition ${activeTab === 'upload' ? 'bg-amber-400 text-[#450000] shadow' : 'text-white'}`}
          >
            Upload Slip
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`flex-1 py-1.5 rounded-xl transition ${activeTab === 'store' ? 'bg-amber-400 text-[#450000] shadow' : 'text-white'}`}
          >
            Uniform Store {cartItemCount > 0 && `(${cartItemCount})`}
          </button>
        </div>
      </section>

      {orderNotification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{orderNotification}</span>
        </div>
      )}

      {/* Tab 1: Fee Structure & Account Details */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          {/* Official Bank Account Card */}
          <section className="bg-gradient-to-br from-[#12235d] to-[#1e3a8a] text-white p-5 rounded-3xl shadow-lg border-2 border-amber-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Official School Bank Account
                </span>
              </div>
              <span className="text-[10px] bg-amber-400 text-[#12235d] px-2 py-0.5 rounded-full font-black">
                Verified
              </span>
            </div>

            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 mb-3">
              <p className="text-[10px] text-blue-200 uppercase font-bold">Account Name</p>
              <p className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                SHINING CHILD LEADERS SCHOOL
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/15">
                <div>
                  <p className="text-[10px] text-blue-200 uppercase font-bold">Bank Name</p>
                  <p className="font-bold text-xs">Zenith Bank PLC</p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-200 uppercase font-bold">Account Number</p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono font-black text-sm text-amber-300">1014589201</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('1014589201');
                        setCopiedBank(true);
                        setTimeout(() => setCopiedBank(false), 2000);
                      }}
                      className="text-amber-200 hover:text-white"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-blue-100 italic leading-relaxed">
              * Note: Please include student name and SCL Binary ID in the transfer narration. 
              After payment, submit the receipt reference on the "Upload Slip" tab.
            </p>
          </section>

          {/* Fee Schedules by Section */}
          <section className="bg-white dark:bg-[#182234] p-4 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700 space-y-3">
            <h3 className="font-extrabold text-sm text-scl-maroon dark:text-amber-400">
              Termly Fee Schedule (2026/2027 Session)
            </h3>

            <div className="space-y-2.5">
              {[
                { 
                  level: 'Early Years & Creche / Nursery',
                  tuition: 95000, 
                  devLevy: 20000, 
                  materials: 25000,
                  total: 140000,
                  features: 'Montessori learning, phonic kits, mid-day snack oversight'
                },
                { 
                  level: 'Primary Section (Basic 1 - 5)',
                  tuition: 110000, 
                  devLevy: 25000, 
                  materials: 30000,
                  total: 165000,
                  features: 'Coding & robotics introductory modules, French, club activities'
                },
                { 
                  level: 'Junior Secondary (JSS 1 - 3)',
                  tuition: 125000, 
                  devLevy: 30000, 
                  materials: 35000,
                  total: 190000,
                  features: 'CBT lab access, basic science practicals, pre-vocational studies'
                },
                { 
                  level: 'Senior Secondary (SSS 1 - 3)',
                  tuition: 145000, 
                  devLevy: 35000, 
                  materials: 40000,
                  total: 220000,
                  features: 'Physics/Chem/Bio labs, WAEC/NECO intensive seminars, mock exams'
                }
              ].map((sch, i) => (
                <div 
                  key={i}
                  className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-gray-800/60 border border-amber-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-xs text-scl-maroon dark:text-amber-300">
                      {sch.level}
                    </h4>
                    <span className="font-black text-sm text-emerald-700 dark:text-emerald-400">
                      ₦{sch.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                    <span>Tuition: ₦{sch.tuition.toLocaleString()}</span>
                    <span>Levy: ₦{sch.devLevy.toLocaleString()}</span>
                    <span>Books/ICT: ₦{sch.materials.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 italic">
                    Includes: {sch.features}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Upload Slip & Receipt Verification */}
      {activeTab === 'upload' && (
        <section className="bg-white dark:bg-[#182234] p-5 rounded-3xl shadow-md border border-amber-200/80 dark:border-gray-700 space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-200 dark:border-gray-700 pb-3">
            <Upload className="w-5 h-5 text-scl-maroon dark:text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-scl-maroon dark:text-amber-400">Bank Transfer Slip Submission</h3>
              <p className="text-[11px] text-gray-500">Automated Receipt OCR & Direct Ledger Verification</p>
            </div>
          </div>

          {submissionSuccess ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <div>
                <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300">
                  Payment Submitted for Verification
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  Reference: <span className="font-mono font-bold">{submissionSuccess.referenceNumber}</span>
                </p>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                  Amount: ₦{submissionSuccess.amount.toLocaleString()} for {submissionSuccess.studentName} ({submissionSuccess.studentId})
                </p>
                <span className="inline-block mt-2 bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-0.5 rounded-full">
                  Status: PENDING ADMIN CONFIRMATION
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionSuccess(null)}
                className="mt-2 px-4 py-2 bg-scl-maroon text-amber-200 rounded-xl text-xs font-bold"
              >
                Submit Another Receipt
              </button>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Student SCL Binary ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="e.g. SCLJDP0000"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-amber-50/40 dark:bg-gray-900 text-xs font-mono font-bold uppercase outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Amount Paid (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="145000"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-amber-50/40 dark:bg-gray-900 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Payer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Depositor Name"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Payer Phone Number
                  </label>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="+234 800..."
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Bank Used
                  </label>
                  <select
                    value={bankUsed}
                    onChange={(e) => setBankUsed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-bold outline-none"
                  >
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="First Bank">First Bank</option>
                    <option value="GTBank">Guaranty Trust Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="UBA">United Bank for Africa</option>
                    <option value="OPay">OPay / PalmPay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Transaction / Session Ref
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. ZEN-20261019-8971"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              {/* OCR Assistant Trigger */}
              <div className="p-3 bg-amber-50 dark:bg-gray-800 rounded-2xl border border-dashed border-amber-400 flex items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="font-bold text-scl-maroon dark:text-amber-400 block">
                    Fast OCR Receipt Reader
                  </span>
                  <span className="text-[10px] text-gray-500">Auto-fills ref code from payment slip image</span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateOCR}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-[#450000] text-xs font-extrabold hover:bg-amber-300"
                >
                  Scan Slip
                </button>
              </div>

              {ocrStatus && (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded-xl text-[11px] font-mono">
                  {ocrStatus}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-scl-maroon text-amber-300 font-extrabold text-xs shadow-md hover:bg-[#7a000c] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit Slip for School Verification</span>
              </button>
            </form>
          )}
        </section>
      )}

      {/* Tab 3: Uniform & School Materials Catalogue */}
      {activeTab === 'store' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {['All', 'Uniform', 'Sportswear', 'Accessories', 'Books'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat 
                    ? 'bg-scl-maroon text-amber-300 shadow-sm' 
                    : 'bg-white dark:bg-[#182234] text-gray-700 dark:text-gray-300 border border-amber-200 dark:border-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredUniforms.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#182234] p-4 rounded-3xl shadow-sm border border-amber-200/80 dark:border-gray-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] bg-amber-100 dark:bg-gray-700 text-scl-maroon dark:text-amber-400 px-2 py-0.5 rounded-full font-black uppercase">
                      {item.category}
                    </span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-gray-100 mt-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.sizes.map(s => (
                      <span key={s} className="text-[9px] border border-amber-300 dark:border-gray-600 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-amber-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-600 font-bold">In Stock (Bursary)</span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-scl-maroon hover:bg-[#7a000c] text-amber-200 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Order Item</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Floating Box */}
          {cartItemCount > 0 && (
            <div className="p-4 bg-gradient-to-r from-scl-maroon to-[#8a0014] text-white rounded-3xl shadow-xl border-2 border-scl-gold flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-200">School Store Cart ({cartItemCount} items)</p>
                <p className="text-base font-black">Total: ₦{cartTotal.toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderNotification(`Order for ₦${cartTotal.toLocaleString()} placed with School Bursary.`);
                  setCart({});
                }}
                className="px-4 py-2 rounded-xl bg-scl-gold text-[#450000] text-xs font-black uppercase hover:bg-amber-300"
              >
                Checkout & Add to Bill
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
