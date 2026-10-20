# Shining Child Leaders School (SCL) Portal

**SCL School Portal — Official Android Application Edition**  
*Location: Epe, Lagos State, Nigeria*  
*Motto: "Raising Today's Children to Become Tomorrow's Leaders"*

---

## Overview

The SCL Portal is an Android-optimized school management and academic portal built for **Shining Child Leaders School** (Creche, Nursery, Basic 1–5, JSS 1–3, and SSS 1–3). It provides a cohesive mobile interface adhering to Material Design 3 guidelines for parents, students, teachers, and administrative personnel.

## Core Features Preserved & Enhanced

1. **Academic Results Portal (Cycles 1–4)**
   - Continuous Assessment (CA) tracking across four 4-week testing cycles.
   - Comprehensive scorecards with letter grades (A1–F9), class rank, aggregate marks, attendance rate, and form master/principal remarks.
   - Teacher mark submission and cycle management.

2. **Student Attendance Register (Period 0–6)**
   - Morning class roll call (Period 0) and subject-by-subject period tracking (Periods 1–6).
   - One-tap status marking: *Present*, *Absent*, *Late*, *Excused*.
   - Live turnout percentages and daily census statistics.

3. **Fees & School Store**
   - Official tuition and development levy schedule by academic level.
   - Verified bank account details for direct transfers.
   - Bank receipt slip submission with automated reference scanner simulation and status tracking (*Pending*, *Confirmed*, *Rejected*).
   - Uniform and school materials catalogue with sizing and cart ordering.

4. **SCL Binary Identity Sequence & Pupil Admissions**
   - Automated SCL Binary ID allocation matching `scl_next_school_id` (`SCL` + Initials + binary/decimal sequence like `SCLJDP0000`).
   - Pupil registration workflow covering child biodata, guardian contact, and medical information.

5. **Administrative Approvals Ledger**
   - Role-gated verification (Management Admin, Technical Admin, Developer) with "first confirmation wins" rule.
   - Rejection handling with payer notification notes.
   - Staff daily clock-in register.

6. **School Anthem & Helpdesk Chooser**
   - Interactive School Anthem synthesizer with Web Audio API chime fanfare, visual equalizer, and official lyrics.
   - WhatsApp Chooser modal connecting parents and staff directly to the Parents Community, Management, Student Affairs, Technical Support, or official school email.

7. **Adaptive Android Mobile Architecture**
   - Android System Status Bar (live clock, 5G signal, WiFi, battery indicators).
   - Android Top App Bar with interactive 3D SCL coin badge flip and day/night mode toggle.
   - Material 3 Bottom Navigation Bar with active pills.
   - Floating Action Button (FAB) with Quick Actions sheet.

## Technical Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS & Material Design 3 tokens
- **Icons**: Lucide React
- **Build Tool**: Vite (configured for `0.0.0.0:3000`)
- **Storage**: Client-side resilient data layer with LocalStorage persistence
