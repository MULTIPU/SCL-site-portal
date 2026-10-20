export type UserRole = 
  | 'guest' 
  | 'student' 
  | 'parent' 
  | 'teacher' 
  | 'management_admin' 
  | 'technical_admin' 
  | 'affairs_admin' 
  | 'developer';

export interface SubjectScore {
  code: string;
  name: string;
  category?: 'Core' | 'Vocational' | 'Science' | 'Arts' | 'Commercial';
  testScore: number; // max 10 for test
  examScore?: number; // max 60 for exam in Cycle 4
  totalScore: number;
  grade: 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';
  remark: string;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  session: string;
  term: 'First Term' | 'Second Term' | 'Third Term';
  cycleNumber: 1 | 2 | 3 | 4;
  cycleTitle: string;
  subjects: SubjectScore[];
  totalScore: number;
  maxPossible: number;
  average: number;
  position: string;
  totalInClass: number;
  teacherRemark: string;
  principalRemark: string;
  attendanceDays: number;
  outOfDays: number;
  pinVerified: boolean;
}

export interface Student {
  id: string;
  schoolId: string; // e.g. SCLJDP0000
  fullName: string;
  className: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  stateOfOrigin: string;
  admissionDate: string;
  status: 'Active' | 'Graduated' | 'Pending';
  emergencyContact: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  period: number; // 0 = Morning Primary Class, 1..6 = Secondary Periods
  subject?: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remark?: string;
}

export interface FeeItem {
  id: string;
  title: string;
  amount: number;
  mandatory: boolean;
  applicableClasses: string[];
  term: string;
}

export interface PaymentSubmission {
  id: string;
  referenceNumber: string;
  studentId: string;
  studentName: string;
  className: string;
  amount: number;
  term: string;
  purpose: string;
  payerName: string;
  payerPhone: string;
  bankUsed: string;
  datePaid: string;
  receiptImageName?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  rejectionReason?: string;
  confirmedBy?: string;
  submittedAt: string;
}

export interface UniformItem {
  id: string;
  name: string;
  category: 'Uniform' | 'Sportswear' | 'Accessories' | 'Books';
  price: number;
  sizes: string[];
  inStock: boolean;
  description: string;
  iconName: string;
}

export interface Announcement {
  id: string;
  title: string;
  tag: string;
  content: string;
  date: string;
  pinned: boolean;
}

export interface ResultCycle {
  cycleNumber: 1 | 2 | 3 | 4;
  title: string;
  session: string;
  term: string;
  startDate: string;
  dueDate: string;
  testMaxMarks: number;
  examMaxMarks: number;
  status: 'open' | 'extended' | 'closed' | 'scheduled';
}
