import {
  Student,
  StudentResult,
  AttendanceRecord,
  PaymentSubmission,
  UniformItem,
  Announcement,
  ResultCycle,
  UserRole
} from '../types';

// SCL Binary-style ID generator matching public.scl_next_school_id and public.scl_binary_number from scl_setup.sql
export function generateSCLSchoolId(fullName: string, sequenceNumber: number): string {
  const cleanName = fullName.replace(/[^A-Za-z ]/g, '').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  let initials = words.map(w => w[0].toUpperCase()).join('').slice(0, 4);
  if (!initials) initials = 'SCL';

  let binStr = '';
  const n = sequenceNumber;
  if (n < 16) {
    binStr = n.toString(2).padStart(4, '0');
  } else {
    // 2-digit / 3-digit combination matching scl_binary_number
    binStr = (2000 + (n - 16)).toString();
  }
  return `SCL${initials}${binStr}`;
}

const STORAGE_KEYS = {
  STUDENTS: 'scl_students_v1',
  RESULTS: 'scl_results_v1',
  ATTENDANCE: 'scl_attendance_v1',
  PAYMENTS: 'scl_payments_v1',
  ANNOUNCEMENTS: 'scl_announcements_v1',
  UNIFORMS: 'scl_uniforms_v1',
  ROLE: 'scl_active_role_v1',
  THEME: 'scl_theme_mode_v1',
};

// Initial Seed Data
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    schoolId: 'SCLJDP0000',
    fullName: 'Johnson Daniel Peters',
    className: 'JSS 2 Gold',
    gender: 'Male',
    dateOfBirth: '2012-05-14',
    parentName: 'Engr. Emmanuel Peters',
    parentPhone: '+234 802 345 6789',
    parentEmail: 'emmanuel.peters@example.ng',
    address: '14 Hospital Road, Epe, Lagos State',
    stateOfOrigin: 'Lagos',
    admissionDate: '2023-09-11',
    status: 'Active',
    emergencyContact: '+234 803 111 2233'
  },
  {
    id: 'std-2',
    schoolId: 'SCLAKB0001',
    fullName: 'Adeyemi Kemi Blessing',
    className: 'SSS 1 Science',
    gender: 'Female',
    dateOfBirth: '2010-08-22',
    parentName: 'Mrs. Funke Adeyemi',
    parentPhone: '+234 813 987 6543',
    parentEmail: 'funke.adeyemi@example.ng',
    address: '8 Marina Street, Epe, Lagos State',
    stateOfOrigin: 'Ogun',
    admissionDate: '2021-09-13',
    status: 'Active',
    emergencyContact: '+234 809 444 5566'
  },
  {
    id: 'std-3',
    schoolId: 'SCLCOA0010',
    fullName: 'Chukwuemeka Obinna Alex',
    className: 'Basic 4 Diamond',
    gender: 'Male',
    dateOfBirth: '2015-11-03',
    parentName: 'Mr. Kenneth Chukwuemeka',
    parentPhone: '+234 703 555 1212',
    parentEmail: 'k.chukwuemeka@example.ng',
    address: '22 Papa Epe Expressway, Lagos',
    stateOfOrigin: 'Enugu',
    admissionDate: '2024-09-09',
    status: 'Active',
    emergencyContact: '+234 802 777 8899'
  },
  {
    id: 'std-4',
    schoolId: 'SCLZOE0011',
    fullName: 'Zubair Oluwaseun Emmanuel',
    className: 'SSS 3 Commercial',
    gender: 'Male',
    dateOfBirth: '2008-04-18',
    parentName: 'Alhaji Rasheed Zubair',
    parentPhone: '+234 805 678 1234',
    parentEmail: 'rasheed.zubair@example.ng',
    address: '5 Odo-Egiri Road, Epe, Lagos',
    stateOfOrigin: 'Lagos',
    admissionDate: '2020-09-14',
    status: 'Active',
    emergencyContact: '+234 802 888 9900'
  },
  {
    id: 'std-5',
    schoolId: 'SCLFRM0100',
    fullName: 'Fasasi Rahmat Morayo',
    className: 'Nursery 2 Sunshine',
    gender: 'Female',
    dateOfBirth: '2020-01-29',
    parentName: 'Dr. (Mrs) H. Fasasi',
    parentPhone: '+234 818 333 4455',
    parentEmail: 'h.fasasi@example.ng',
    address: '19 Oke-Balogun Quarters, Epe, Lagos',
    stateOfOrigin: 'Lagos',
    admissionDate: '2025-01-08',
    status: 'Active',
    emergencyContact: '+234 807 666 5544'
  }
];

export const RESULT_CYCLES: ResultCycle[] = [
  {
    cycleNumber: 1,
    title: 'Cycle 1 — First Four-Week Test',
    session: '2026/2027',
    term: 'First Term',
    startDate: '2026-09-14',
    dueDate: '2026-10-09',
    testMaxMarks: 10,
    examMaxMarks: 0,
    status: 'open'
  },
  {
    cycleNumber: 2,
    title: 'Cycle 2 — Second Four-Week Test',
    session: '2026/2027',
    term: 'First Term',
    startDate: '2026-10-12',
    dueDate: '2026-11-06',
    testMaxMarks: 10,
    examMaxMarks: 0,
    status: 'scheduled'
  },
  {
    cycleNumber: 3,
    title: 'Cycle 3 — Third Four-Week Test',
    session: '2026/2027',
    term: 'First Term',
    startDate: '2026-11-09',
    dueDate: '2026-12-04',
    testMaxMarks: 10,
    examMaxMarks: 0,
    status: 'scheduled'
  },
  {
    cycleNumber: 4,
    title: 'Cycle 4 — Test and Final Examination',
    session: '2026/2027',
    term: 'First Term',
    startDate: '2026-12-07',
    dueDate: '2026-12-18',
    testMaxMarks: 10,
    examMaxMarks: 60,
    status: 'scheduled'
  }
];

const INITIAL_RESULTS: StudentResult[] = [
  {
    id: 'res-1',
    studentId: 'SCLJDP0000',
    studentName: 'Johnson Daniel Peters',
    className: 'JSS 2 Gold',
    session: '2026/2027',
    term: 'First Term',
    cycleNumber: 1,
    cycleTitle: 'Cycle 1 — First Four-Week Test',
    subjects: [
      { code: 'MTH', name: 'Mathematics', category: 'Core', testScore: 9, totalScore: 9, grade: 'A1', remark: 'Excellent' },
      { code: 'ENG', name: 'English Studies', category: 'Core', testScore: 8, totalScore: 8, grade: 'B2', remark: 'Very Good' },
      { code: 'BST', name: 'Basic Science & Tech', category: 'Science', testScore: 10, totalScore: 10, grade: 'A1', remark: 'Distinction' },
      { code: 'CIV', name: 'Civic Education', category: 'Core', testScore: 9, totalScore: 9, grade: 'A1', remark: 'Excellent' },
      { code: 'AGR', name: 'Agricultural Science', category: 'Vocational', testScore: 8, totalScore: 8, grade: 'B2', remark: 'Very Good' },
      { code: 'YOR', name: 'Yoruba Language', category: 'Arts', testScore: 7, totalScore: 7, grade: 'B3', remark: 'Good' },
      { code: 'CMP', name: 'Computer Studies', category: 'Vocational', testScore: 10, totalScore: 10, grade: 'A1', remark: 'Distinction' },
      { code: 'BUS', name: 'Business Studies', category: 'Commercial', testScore: 9, totalScore: 9, grade: 'A1', remark: 'Excellent' }
    ],
    totalScore: 70,
    maxPossible: 80,
    average: 87.5,
    position: '2nd',
    totalInClass: 28,
    teacherRemark: 'Daniel has demonstrated exceptional academic capability and moral conduct.',
    principalRemark: 'An outstanding performance. Keep aiming for the pinnacle of excellence.',
    attendanceDays: 24,
    outOfDays: 24,
    pinVerified: true
  },
  {
    id: 'res-2',
    studentId: 'SCLAKB0001',
    studentName: 'Adeyemi Kemi Blessing',
    className: 'SSS 1 Science',
    session: '2026/2027',
    term: 'First Term',
    cycleNumber: 1,
    cycleTitle: 'Cycle 1 — First Four-Week Test',
    subjects: [
      { code: 'MTH', name: 'General Mathematics', category: 'Core', testScore: 10, totalScore: 10, grade: 'A1', remark: 'Distinction' },
      { code: 'ENG', name: 'English Language', category: 'Core', testScore: 9, totalScore: 9, grade: 'A1', remark: 'Excellent' },
      { code: 'PHY', name: 'Physics', category: 'Science', testScore: 9, totalScore: 9, grade: 'A1', remark: 'Excellent' },
      { code: 'CHM', name: 'Chemistry', category: 'Science', testScore: 8, totalScore: 8, grade: 'B2', remark: 'Very Good' },
      { code: 'BIO', name: 'Biology', category: 'Science', testScore: 10, totalScore: 10, grade: 'A1', remark: 'Distinction' },
      { code: 'FMT', name: 'Further Mathematics', category: 'Science', testScore: 9, totalScore: 9, grade: 'A1', remark: 'Excellent' },
      { code: 'CIV', name: 'Civic Education', category: 'Core', testScore: 8, totalScore: 8, grade: 'B2', remark: 'Very Good' },
      { code: 'ICT', name: 'Data Processing', category: 'Vocational', testScore: 10, totalScore: 10, grade: 'A1', remark: 'Distinction' }
    ],
    totalScore: 73,
    maxPossible: 80,
    average: 91.25,
    position: '1st',
    totalInClass: 24,
    teacherRemark: 'Brilliant student with keen interest in science research and disciplined leadership.',
    principalRemark: 'Exemplary leadership and scholarship. Deserving of our Senior Academic Laurel.',
    attendanceDays: 24,
    outOfDays: 24,
    pinVerified: true
  }
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '2026-10-19',
    className: 'JSS 2 Gold',
    period: 0,
    teacherName: 'Mr. B. O. Adeleke (Class Teacher)',
    studentId: 'SCLJDP0000',
    studentName: 'Johnson Daniel Peters',
    status: 'present'
  },
  {
    id: 'att-2',
    date: '2026-10-19',
    className: 'JSS 2 Gold',
    period: 1,
    subject: 'Mathematics',
    teacherName: 'Mrs. T. A. Balogun',
    studentId: 'SCLJDP0000',
    studentName: 'Johnson Daniel Peters',
    status: 'present'
  },
  {
    id: 'att-3',
    date: '2026-10-19',
    className: 'SSS 1 Science',
    period: 0,
    teacherName: 'Mr. S. K. Ogundele',
    studentId: 'SCLAKB0001',
    studentName: 'Adeyemi Kemi Blessing',
    status: 'present'
  },
  {
    id: 'att-4',
    date: '2026-10-19',
    className: 'Basic 4 Diamond',
    period: 0,
    teacherName: 'Miss C. N. Eze',
    studentId: 'SCLCOA0010',
    studentName: 'Chukwuemeka Obinna Alex',
    status: 'late',
    remark: 'Arrived at 8:15 AM due to traffic on Epe-Ijebu Ode road'
  }
];

const INITIAL_PAYMENTS: PaymentSubmission[] = [
  {
    id: 'pay-1',
    referenceNumber: 'SCL-TXN-20261019-9821',
    studentId: 'SCLJDP0000',
    studentName: 'Johnson Daniel Peters',
    className: 'JSS 2 Gold',
    amount: 145000,
    term: 'First Term',
    purpose: 'Tuition & Development Package',
    payerName: 'Engr. Emmanuel Peters',
    payerPhone: '+234 802 345 6789',
    bankUsed: 'Zenith Bank PLC',
    datePaid: '2026-10-15',
    receiptImageName: 'receipt_zenith_peters.jpg',
    status: 'confirmed',
    confirmedBy: 'management_admin',
    submittedAt: '2026-10-15 14:32'
  },
  {
    id: 'pay-2',
    referenceNumber: 'SCL-TXN-20261018-4412',
    studentId: 'SCLAKB0001',
    studentName: 'Adeyemi Kemi Blessing',
    className: 'SSS 1 Science',
    amount: 32000,
    term: 'First Term',
    purpose: 'Uniform & Laboratory Wear Set',
    payerName: 'Mrs. Funke Adeyemi',
    payerPhone: '+234 813 987 6543',
    bankUsed: 'First Bank of Nigeria',
    datePaid: '2026-10-18',
    receiptImageName: 'receipt_firstbank_adeyemi.pdf',
    status: 'pending',
    submittedAt: '2026-10-18 09:15'
  }
];

const INITIAL_UNIFORMS: UniformItem[] = [
  {
    id: 'uni-1',
    name: 'Primary Boys Complete Uniform',
    category: 'Uniform',
    price: 18500,
    sizes: ['Size 26', 'Size 28', 'Size 30', 'Size 32'],
    inStock: true,
    description: 'Gold check short-sleeve shirt with maroon tailored shorts and school crest patch.',
    iconName: 'Shirt'
  },
  {
    id: 'uni-2',
    name: 'Primary Girls Pinafore & Shirt',
    category: 'Uniform',
    price: 19500,
    sizes: ['Size 26', 'Size 28', 'Size 30', 'Size 32', 'Size 34'],
    inStock: true,
    description: 'Smart pleated maroon pinafore dress with gold check inner collared blouse.',
    iconName: 'Sparkles'
  },
  {
    id: 'uni-3',
    name: 'Secondary College Blazer',
    category: 'Uniform',
    price: 26000,
    sizes: ['Small (36)', 'Medium (38)', 'Large (40)', 'XL (42)'],
    inStock: true,
    description: 'Premium SCL deep maroon blazer with embroidered golden school motto and buttons.',
    iconName: 'Shield'
  },
  {
    id: 'uni-4',
    name: 'SCL House Sportswear Tracksuit',
    category: 'Sportswear',
    price: 15000,
    sizes: ['Age 6-8', 'Age 9-11', 'Age 12-14', 'Adult S/M'],
    inStock: true,
    description: 'Breathable sports polo shirt with matching athletic joggers for inter-house sports.',
    iconName: 'Trophy'
  },
  {
    id: 'uni-5',
    name: 'Embroidered School Cardigan',
    category: 'Accessories',
    price: 12500,
    sizes: ['Size 28', 'Size 30', 'Size 32', 'Size 34', 'Size 36'],
    inStock: true,
    description: 'Warm v-neck knitwear cardigan with gold stripes on collar and cuffs.',
    iconName: 'Heart'
  },
  {
    id: 'uni-6',
    name: 'Customised 60-Leaves Exercise Books (Pack of 10)',
    category: 'Books',
    price: 6500,
    sizes: ['Pack of 10', 'Pack of 20'],
    inStock: true,
    description: 'High quality ruled paper with SCL emblem, times table, and national anthem on back.',
    iconName: 'BookOpen'
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: 'Cycle 1 Test Submission & Verification Window',
    tag: 'Academic Notice',
    content: 'Teachers and parents are notified that Cycle 1 test assessments are live. Results for the first four-week academic cycle will be available for checking online.',
    date: '2026-10-18',
    pinned: true
  },
  {
    id: 'anc-2',
    title: 'Mid-Term Break & Inter-House Sports Briefing',
    tag: 'School Calendar',
    content: 'All parents are invited to the preliminary Inter-House Sports meeting following the scheduled mid-term evaluation. Check uniform store for new sports house colours.',
    date: '2026-10-16',
    pinned: true
  },
  {
    id: 'anc-3',
    title: 'New SCL Digital Student ID Card System',
    tag: 'Administration',
    content: 'The school has migrated to the secure SCL Binary-style ID sequence (e.g. SCLJDP0000). Every student and staff member is issued this identifier.',
    date: '2026-10-10',
    pinned: false
  }
];

export class SCLDataService {
  private static get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // Active Role Management
  static getActiveRole(): UserRole {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'parent';
  }

  static setActiveRole(role: UserRole): void {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }

  // Theme Management
  static getTheme(): 'day' | 'night' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'day' | 'night') || 'day';
  }

  static setTheme(theme: 'day' | 'night'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  // Students
  static getStudents(): Student[] {
    return this.get(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  static getStudentById(id: string): Student | undefined {
    const list = this.getStudents();
    const clean = id.trim().toUpperCase();
    return list.find(s => s.schoolId.toUpperCase() === clean || s.id === id);
  }

  static registerStudent(data: Omit<Student, 'id' | 'schoolId' | 'status'>): Student {
    const students = this.getStudents();
    const newSeq = students.length;
    const schoolId = generateSCLSchoolId(data.fullName, newSeq);
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      schoolId,
      status: 'Active'
    };
    students.unshift(newStudent);
    this.set(STORAGE_KEYS.STUDENTS, students);
    return newStudent;
  }

  // Results
  static getResults(): StudentResult[] {
    return this.get(STORAGE_KEYS.RESULTS, INITIAL_RESULTS);
  }

  static getResultForStudent(studentIdOrPin: string, cycleNumber: number = 1): StudentResult | undefined {
    const results = this.getResults();
    const clean = studentIdOrPin.trim().toUpperCase();
    return results.find(r => 
      (r.studentId.toUpperCase() === clean || r.studentName.toUpperCase().includes(clean)) &&
      r.cycleNumber === cycleNumber
    );
  }

  static saveResult(result: StudentResult): void {
    const results = this.getResults();
    const idx = results.findIndex(r => r.id === result.id);
    if (idx >= 0) {
      results[idx] = result;
    } else {
      results.unshift(result);
    }
    this.set(STORAGE_KEYS.RESULTS, results);
  }

  // Attendance
  static getAttendance(date?: string, className?: string): AttendanceRecord[] {
    const records = this.get(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    return records.filter(r => {
      if (date && r.date !== date) return false;
      if (className && r.className !== className) return false;
      return true;
    });
  }

  static markAttendance(record: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
    const records = this.get(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const existingIdx = records.findIndex(r => 
      r.date === record.date &&
      r.studentId === record.studentId &&
      r.period === record.period
    );
    const updated: AttendanceRecord = {
      ...record,
      id: existingIdx >= 0 ? records[existingIdx].id : `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    if (existingIdx >= 0) {
      records[existingIdx] = updated;
    } else {
      records.unshift(updated);
    }
    this.set(STORAGE_KEYS.ATTENDANCE, records);
    return updated;
  }

  // Payments & Receipt Verification
  static getPayments(): PaymentSubmission[] {
    return this.get(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  }

  static submitPayment(payment: Omit<PaymentSubmission, 'id' | 'status' | 'submittedAt'>): PaymentSubmission {
    const payments = this.getPayments();
    const newRecord: PaymentSubmission = {
      ...payment,
      id: `pay-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    payments.unshift(newRecord);
    this.set(STORAGE_KEYS.PAYMENTS, payments);
    return newRecord;
  }

  // Spec #1 from AUDIT_REPORT.md: Role-gated confirmation & rejection
  static confirmPayment(paymentId: string, role: UserRole): { success: boolean; message: string } {
    if (!['management_admin', 'technical_admin', 'developer'].includes(role)) {
      return { success: false, message: 'Unauthorized: only management, technical, or developer admins can confirm payments.' };
    }
    const payments = this.getPayments();
    const item = payments.find(p => p.id === paymentId);
    if (!item) return { success: false, message: 'Payment record not found.' };

    item.status = 'confirmed';
    item.confirmedBy = role;
    this.set(STORAGE_KEYS.PAYMENTS, payments);
    return { success: true, message: `Payment ${item.referenceNumber} has been verified and confirmed.` };
  }

  static rejectPayment(paymentId: string, role: UserRole, reason: string): { success: boolean; message: string } {
    if (!['management_admin', 'technical_admin', 'developer'].includes(role)) {
      return { success: false, message: 'Unauthorized: only management, technical, or developer admins can reject payments.' };
    }
    const payments = this.getPayments();
    const item = payments.find(p => p.id === paymentId);
    if (!item) return { success: false, message: 'Payment record not found.' };

    item.status = 'rejected';
    item.rejectionReason = reason || 'Unverified bank receipt or incorrect amount';
    this.set(STORAGE_KEYS.PAYMENTS, payments);
    return { success: true, message: `Payment rejected. Notification sent to payer.` };
  }

  // Uniforms
  static getUniforms(): UniformItem[] {
    return this.get(STORAGE_KEYS.UNIFORMS, INITIAL_UNIFORMS);
  }

  // Announcements
  static getAnnouncements(): Announcement[] {
    return this.get(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }
}
