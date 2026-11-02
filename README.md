# 🏥 CareSync — Smart Hospital Management System with Real-Time Queue & Appointment Engine

A production-grade, full-stack hospital management web platform engineered to eliminate crowded waiting rooms through **conflict-free appointment booking**, **live WebSocket queue tracking**, **doctor consultation & digital prescription workflows**, and **centralized administrative analytics**.

---

## 🌟 Key Technical Highlights for Evaluators & Recruiters

* **Anti-Double-Booking Concurrency Control**: Uses database-level uniqueness constraints and atomic transactions (`tx.query`) to guarantee that two patients booking simultaneously for the exact same doctor and 15-minute slot never overlap. Returns explicit `409 Conflict` on race conditions.
* **Real-Time Queue Synchronization via Socket.IO**: Live bidirectional WebSocket updates. When a doctor clicks *"Call Next Patient"* or completes a consultation, waiting patients' positions and wait-time estimations refresh instantly across active devices without page reload.
* **Algorithmic Waiting Time Prediction**:
  $$\text{Estimated Wait Time} = \text{Patients Ahead} \times \text{Doctor's Consultation Duration}$$
* **Role-Based Portals (RBAC)**: Distinct interfaces for **Patients**, **Doctors**, and **Hospital Administrators** protected by JSON Web Tokens (`jsonwebtoken`) and bcrypt password hashing.
* **Dual-Driver Relational Architecture**: Runs out-of-the-box locally with zero configuration via SQLite (`hospital.db`), while fully compatible with cloud-hosted MySQL/MariaDB via environment variables (`DB_CLIENT=mysql`).
* **AI Hospital Administrative Assistant**: Interactive assistant widget that answers hospital FAQs, department hours, booking navigation, and queries the user's active queue token directly from the database with built-in medical safety guardrails.

---

## 👥 User Roles & Features

### 👤 1. Patient Portal
* **One-Click Demo Logins & Registration**: Full profile management with blood group, demographics, and emergency contacts.
* **Specialist Search & Department Filtering**: Explore certified doctors by clinical departments (Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, General Medicine, ENT).
* **Dynamic Slot Booking**: View real-time morning/evening 15-minute consultation slots. Booked or passed slots are automatically disabled.
* **Live Queue Tracker**: View token number, currently serving number, patients ahead, dynamic wait times, and active room alerts.
* **Digital Medical History**: View past diagnoses, clinical notes, and itemized prescriptions with a **Printable Prescription Modal**.

### 👨‍⚕️ 2. Doctor Workspace
* **Clinical Queue Console**: View today's waiting list in real time. Single-click **"Call Next Patient"** broadcasts alert to patient's phone/screen.
* **Consultation & Prescription Module**: Record symptoms, diagnoses, doctor advice, and multi-line Rx medication with dosage, frequency, and duration. Automatically marks appointments as completed.
* **Weekly Availability Manager**: Configure morning and evening clinic shifts, custom slot durations (10/15/20/30 mins), and toggle working days.
* **Blocked Leave Manager**: Block vacation or conference dates so patients cannot book slots during doctor absences.

### 🛡️ 3. Hospital Administration
* **Operational KPI Dashboard**: Real-time counters for Total Patients, Active Doctors, Today's Intake, Completed, Waiting, and Cancelled appointments.
* **Department Load Analytics**: Visual breakdown of patient volume across medical departments.
* **Doctor Roster Management**: Create doctor accounts, configure department assignments, and toggle active/inactive status.
* **Department CRUD**: Add, edit, or remove hospital departments.
* **Master Appointment Logs**: Cross-departmental search with filters by date, status, and specialist.

---

## 🔑 Ready Demo Accounts

| Role | Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `rahul.verma@example.com` | `patient123` | Patient dashboard, appointments, live queue |
| **Doctor** | `priya.sharma@hospital.com` | `doctor123` | Cardiology console, call next patient, Rx form |
| **Doctor** | `arun.kumar@hospital.com` | `doctor123` | Dermatology console & schedule management |
| **Admin** | `admin@hospital.com` | `admin123` | Analytics, doctor CRUD, department management |

*(One-click demo login buttons are also built directly into the login screen!)*

---

## 🗄️ Normalized Relational Database Design

```
users (id, name, email, password_hash, role, phone, created_at)
  │
  ├── patients (id, user_id, date_of_birth, gender, address, emergency_contact, blood_group)
  │     └── appointments (id, patient_id, doctor_id, appointment_date, appointment_time, queue_number, status, ...)
  │           ├── queues (id, appointment_id, doctor_id, queue_date, queue_number, status, called_at, ...)
  │           └── medical_records (id, patient_id, doctor_id, symptoms, diagnosis, notes, follow_up_date)
  │                 └── prescriptions (id, medical_record_id, medicine_name, dosage, frequency, duration, instructions)
  │
  ├── doctors (id, user_id, department_id, specialization, qualification, experience_years, consultation_fee, ...)
  │     ├── doctor_availability (id, doctor_id, day_of_week, morning_start, morning_end, evening_start, evening_end, ...)
  │     └── doctor_blocked_dates (id, doctor_id, blocked_date, reason)
  │
  └── notifications (id, user_id, title, message, type, is_read, created_at)

departments (id, name, description, icon, created_at)
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18+ (tested and verified on Node v24)
* **npm**: v9+

### 1. Start the Backend Server
```bash
cd server
npm install
npm run seed     # Migrates and seeds departments, doctors, and sample queue tokens
npm run dev      # Starts Express & Socket.IO server on http://localhost:5000

```

### 2. Start the Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser!

### 3. Run Automated API Verification Suite
```bash
cd server
npm run test:api
```
Verifies health check, patient/doctor/admin authentication, slot generation, atomic booking, 409 double-booking prevention, admin analytics, and AI assistant chat.

---

## 🌐 Production Cloud Deployment (MySQL)

To switch the application from zero-config SQLite to a managed MySQL database (e.g. AWS RDS, PlanetScale, Railway, Render):

1. Open `server/.env`:
   ```env
   DB_CLIENT=mysql
   DB_HOST=your-mysql-host.com
   DB_PORT=3306
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=hospital_management
   ```
2. Run database migration:
   ```bash
   npm run migrate
   npm run seed
   ```
3. Build the frontend for production:
   ```bash
   cd client
   npm run build
   ```
   The optimized production bundle will be generated in `client/dist/`.

---

## 📡 Core API Specification

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new patient account |
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT |
| `/api/doctors` | `GET` | Public | Browse doctors with department filters |
| `/api/availability/slots` | `GET` | Public | Dynamic slot generator for doctor & date |
| `/api/appointments` | `POST` | Patient | Conflict-free atomic slot booking |
| `/api/appointments/my` | `GET` | Patient | List patient's upcoming and past visits |
| `/api/queue/checkin/:id` | `POST` | Patient | Check in on visit day & enter active queue |
| `/api/queue/patient/:id` | `GET` | Patient | Real-time queue position & wait estimation |
| `/api/queue/doctor/board` | `GET` | Doctor | Doctor console: waiting list & room patient |
| `/api/queue/doctor/call-next`| `POST` | Doctor | Calls next waiting patient & broadcasts event |
| `/api/medical-records` | `POST` | Doctor | Save diagnosis & e-prescriptions |
| `/api/admin/stats` | `GET` | Admin | Real-time operational KPIs & intake metrics |
| `/api/admin/doctors` | `POST` | Admin | Register new doctor & auto-provision hours |
| `/api/ai/chat` | `POST` | Public/Patient | AI Hospital Assistant scheduling queries |

---

## 🎓 Resume & Portfolio Summary (For Interviews)

> *"Developed CareSync, a full-stack Smart Hospital & Queue Management platform using React, Node.js, Express, MySQL/SQLite, and Socket.IO. Engineered an anti-double-booking transaction engine preventing scheduling race conditions and integrated dynamic WebSocket room broadcasts to synchronize live patient waiting positions in real-time, reducing hospital lobby wait anxiety. Implemented role-based workspaces for patients, doctors, and administrators with structured digital medical records and an administrative AI chatbot."*
