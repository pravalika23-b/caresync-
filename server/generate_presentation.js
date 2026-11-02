const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();

// Configure 16:9 widescreen layout (13.33 x 7.5 inches for modern PowerPoint widescreen)
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'CareSync Development Team';
pptx.company = 'Department of Information Technology';
pptx.title = 'CareSync - Smart Hospital Management System with Queue Engine';

// Theme Colors
const COLORS = {
  bgLight: 'F8FAFC',
  cardBg: 'FFFFFF',
  cardBorder: 'E2E8F0',
  tealDark: '0F766E',
  tealPrimary: '0D9488',
  tealLight: 'CCFBF1',
  slateDark: '0F172A',
  slateText: '334155',
  slateMuted: '64748B',
  emerald: '10B981',
  emeraldLight: 'D1FAE5',
  amber: 'F59E0B',
  amberLight: 'FEF3C7',
  rose: 'EF4444',
  blue: '0284C7',
  blueLight: 'E0F2FE',
  purple: '7C3AED'
};

// Helper: Standard Slide Header
function addSlideHeader(slide, title, category, slideNumber) {
  // Background
  slide.background = { color: COLORS.bgLight };

  // Top Category Pill
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.4,
    w: 6.0,
    h: 0.25,
    fontSize: 9,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.tealPrimary,
    letterSpacing: 2
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.65,
    w: 10.0,
    h: 0.5,
    fontSize: 22,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.slateDark
  });

  // Header Divider
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 1.15,
    w: 11.7,
    h: 0.02,
    fill: { color: 'CBD5E1' },
    line: { color: 'CBD5E1', width: 0 }
  });

  // Footer branding
  slide.addText('CareSync  |  Review 1 & 2  |  MERN Stack Project', {
    x: 0.8,
    y: 7.1,
    w: 6.0,
    h: 0.25,
    fontSize: 9,
    fontFace: 'Calibri',
    color: COLORS.slateMuted
  });

  // Slide Number
  slide.addText(String(slideNumber).padStart(2, '0'), {
    x: 11.5,
    y: 7.1,
    w: 1.0,
    h: 0.25,
    fontSize: 10,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.tealPrimary,
    align: 'right'
  });
}

// ==========================================
// SLIDE 0: TITLE SLIDE
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.slateDark };

  // Accent gradient bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 1.2,
    w: 0.15,
    h: 4.8,
    fill: { color: COLORS.tealPrimary },
    line: { color: COLORS.tealPrimary, width: 0 }
  });

  // Category Tag
  slide.addText('PROJECT REVIEW 1 & 2  |  FINAL YEAR CAPSTONE PROJECT', {
    x: 1.2,
    y: 1.3,
    w: 10.5,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.tealPrimary,
    letterSpacing: 2
  });

  // Main Title
  slide.addText('CareSync: Smart Hospital Management System', {
    x: 1.2,
    y: 1.7,
    w: 11.0,
    h: 0.8,
    fontSize: 32,
    fontFace: 'Calibri',
    bold: true,
    color: 'FFFFFF'
  });

  // Subtitle
  slide.addText('With Real-Time Queue Management & Machine Learning Predictive Engine', {
    x: 1.2,
    y: 2.5,
    w: 11.0,
    h: 0.5,
    fontSize: 18,
    fontFace: 'Calibri',
    color: '94A3B8'
  });

  // Tech Badge Box
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.2,
    y: 3.3,
    w: 11.0,
    h: 1.4,
    fill: { color: '1E293B' },
    line: { color: '334155', width: 1 },
    rectRadius: 0.1
  });

  slide.addText('CORE ARCHITECTURE: MERN STACK + MACHINE LEARNING', {
    x: 1.5,
    y: 3.5,
    w: 10.0,
    h: 0.25,
    fontSize: 10,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.tealPrimary
  });

  const techBadges = [
    { label: 'MongoDB', sub: 'Flexible NoSQL Schemas' },
    { label: 'Express.js', sub: 'REST APIs & Middleware' },
    { label: 'React 18', sub: 'Interactive Responsive UI' },
    { label: 'Node.js', sub: 'Asynchronous Event Loop' },
    { label: 'Socket.IO', sub: 'Live Queue WebSockets' },
    { label: 'Scikit-Learn', sub: 'Wait-Time & No-Show ML' }
  ];

  techBadges.forEach((t, i) => {
    const bx = 1.5 + (i * 1.75);
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: bx,
      y: 3.85,
      w: 1.65,
      h: 0.65,
      fill: { color: '0F172A' },
      line: { color: COLORS.tealPrimary, width: 1 },
      rectRadius: 0.08
    });
    slide.addText(t.label, {
      x: bx,
      y: 3.9,
      w: 1.65,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    });
    slide.addText(t.sub, {
      x: bx,
      y: 4.2,
      w: 1.65,
      h: 0.25,
      fontSize: 8,
      fontFace: 'Calibri',
      color: '94A3B8',
      align: 'center'
    });
  });

  // Presenter Info
  slide.addText('PRESENTED BY: 3rd Year B.Tech / B.E. (Information Technology) Students', {
    x: 1.2,
    y: 5.1,
    w: 10.5,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Calibri',
    bold: true,
    color: 'CBD5E1'
  });
  slide.addText('INTERNAL PROJECT REVIEWS 1 & 2  •  ACADEMIC YEAR 2026', {
    x: 1.2,
    y: 5.4,
    w: 10.5,
    h: 0.25,
    fontSize: 10,
    fontFace: 'Calibri',
    color: '64748B'
  });
}

// ==========================================
// SLIDE 01: AGENDA
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Scope & Outline of This Review', 'Agenda', 1);

  const agendaItems = [
    { num: '01', title: 'Problem & Requirements', desc: 'Functional & non-functional requirements in digital healthcare' },
    { num: '02', title: 'System Architecture', desc: 'Detailed 3-tier MERN stack flow with WebSockets & ML engine' },
    { num: '03', title: 'Use Case & ER Diagrams', desc: 'Actor interactions, entity schemas, relations & collection models' },
    { num: '04', title: 'Core Modules Breakdown', desc: 'Auth, Dynamic Slots, Queue Engine, Clinical Notes & E-Prescriptions' },
    { num: '05', title: 'Technology Stack', desc: 'MERN components, Python Scikit-learn, Socket.IO, tools & libraries' },
    { num: '06', title: 'Frontend & UI Engineering', desc: 'React component architecture, state management & responsive design' },
    { num: '07', title: 'Backend & API Integration', desc: 'MVC structure, JWT middleware, atomic booking transactions' },
    { num: '08', title: 'Progress (75%+), Challenges & Next', desc: 'Sprint completion status, technical bottlenecks resolved & roadmap' }
  ];

  agendaItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const cardWidth = 5.7;
    const cardHeight = 1.15;
    const gapX = 0.35;
    const startX = 0.79;
    const x = startX + (col * (cardWidth + gapX));
    const y = 1.40 + (row * 1.28);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: cardWidth,
      h: cardHeight,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.1
    });

    // Number Badge
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2,
      y: y + 0.22,
      w: 0.65,
      h: 0.65,
      fill: { color: COLORS.tealLight },
      line: { color: COLORS.tealPrimary, width: 1 },
      rectRadius: 0.08
    });
    slide.addText(item.num, {
      x: x + 0.2,
      y: y + 0.35,
      w: 0.65,
      h: 0.35,
      fontSize: 14,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.tealDark,
      align: 'center'
    });

    // Title & Desc
    slide.addText(item.title, {
      x: x + 1.0,
      y: y + 0.20,
      w: 4.5,
      h: 0.32,
      fontSize: 13,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.slateDark
    });
    slide.addText(item.desc, {
      x: x + 1.0,
      y: y + 0.54,
      w: 4.5,
      h: 0.48,
      fontSize: 10,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });
}

// ==========================================
// SLIDE 02: REQUIREMENTS
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Functional & Non-Functional Requirements', 'Requirements Analysis', 2);

  // Left Card: Functional
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.4,
    w: 5.75,
    h: 5.4,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.tealPrimary, width: 2 },
    rectRadius: 0.1
  });

  slide.addText('FUNCTIONAL REQUIREMENTS', {
    x: 1.1,
    y: 1.6,
    w: 5.15,
    h: 0.3,
    fontSize: 13,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.tealDark
  });

  const funcPoints = [
    'User Registration & Role-Based Access: Secure authentication for Patients, Doctors, and Hospital Admins with protected routes.',
    'Doctor Catalog & Dynamic Slot Availability: Real-time generation of 15-min consultation slots based on shift hours and blocked leaves.',
    'Conflict-Free Appointment Booking: Strict concurrency control preventing double-booking of any doctor time slot.',
    'Live Queue Management & Tracking: Automatic token number assignment, live queue progression, and doctor "Call Next" triggers.',
    'E-Prescriptions & Medical History: Attending doctors record diagnoses, clinical notes, and multi-line Rx medications.',
    'Machine Learning Predictions: AI estimation of consultation duration and appointment no-show risk assessment.',
    'Automated Notifications: In-app real-time alerts and email notifications on booking, calling, and consultation completion.'
  ];

  funcPoints.forEach((pt, i) => {
    slide.addText(`•  ${pt}`, {
      x: 1.1,
      y: 2.05 + (i * 0.65),
      w: 5.15,
      h: 0.6,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });

  // Right Card: Non-Functional
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.75,
    y: 1.4,
    w: 5.75,
    h: 5.4,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.blue, width: 2 },
    rectRadius: 0.1
  });

  slide.addText('NON-FUNCTIONAL REQUIREMENTS', {
    x: 7.05,
    y: 1.6,
    w: 5.15,
    h: 0.3,
    fontSize: 13,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.blue
  });

  const nonFuncPoints = [
    'Performance & Latency: REST API response times < 200ms; WebSocket queue broadcast synchronization < 50ms.',
    'Scalability & Concurrency: Built on Node.js asynchronous event loop; handles concurrent multi-user slot requests cleanly.',
    'Security & Data Protection: Passwords hashed via bcrypt (salt rounds = 10); stateless JWT session verification; sanitized inputs.',
    'High Availability: Zero-single-point-of-failure database architecture; resilient fallback modes for AI microservices.',
    'Usability & Responsiveness: Mobile-first responsive UI built with Tailwind CSS; simple enough for elderly patients to navigate.',
    'Maintainability & Clean Architecture: Modular MVC pattern separating routes, controllers, middleware, and database layers.'
  ];

  nonFuncPoints.forEach((pt, i) => {
    slide.addText(`•  ${pt}`, {
      x: 7.05,
      y: 2.05 + (i * 0.75),
      w: 5.15,
      h: 0.7,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });
}

// ==========================================
// SLIDE 03: DETAILED ARCHITECTURE
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Detailed 3-Tier System Architecture', 'System Architecture', 3);

  // Box 1: Client Tier
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.45,
    w: 3.6,
    h: 4.5,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.tealPrimary, width: 2 },
    rectRadius: 0.12
  });
  slide.addText('CLIENT TIER (FRONTEND)', {
    x: 1.0,
    y: 1.65,
    w: 3.2,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.tealDark,
    align: 'center'
  });
  const clientDetails = [
    'React 18 Single Page Application',
    'Tailwind CSS Modern UI Kit',
    'React Router v6 Protected Routing',
    'Context API (Auth & Notifications)',
    'Axios HTTP Client with Interceptors',
    'Socket.IO Client (Real-Time Listener)',
    'Role Dashboards (Patient, Doctor, Admin)',
    'Interactive AI Chatbot Drawer'
  ];
  clientDetails.forEach((cd, i) => {
    slide.addText(`✓  ${cd}`, {
      x: 1.0,
      y: 2.1 + (i * 0.45),
      w: 3.2,
      h: 0.4,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });

  // Connector 1
  slide.addShape(pptx.shapes.RIGHT_ARROW, {
    x: 4.5,
    y: 3.4,
    w: 0.4,
    h: 0.3,
    fill: { color: COLORS.tealPrimary },
    line: { color: COLORS.tealPrimary, width: 0 }
  });
  slide.addText('HTTPS REST\n+ WebSockets', {
    x: 4.35,
    y: 3.8,
    w: 0.7,
    h: 0.5,
    fontSize: 7.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.slateMuted,
    align: 'center'
  });

  // Box 2: Application Tier
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 5.0,
    y: 1.45,
    w: 3.8,
    h: 4.5,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.blue, width: 2 },
    rectRadius: 0.12
  });
  slide.addText('APPLICATION TIER (SERVER)', {
    x: 5.2,
    y: 1.65,
    w: 3.4,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.blue,
    align: 'center'
  });
  const serverDetails = [
    'Node.js + Express.js Web Engine',
    'Modular MVC Controller Architecture',
    'JWT Token Auth & RBAC Middleware',
    'Anti-Double Booking Transaction Engine',
    'Dynamic 15-Min Slot Calculator',
    'Socket.IO Room Broadcasting Hub',
    'Nodemailer Transactional Alerts',
    'Python ML Microservice Connector'
  ];
  serverDetails.forEach((sd, i) => {
    slide.addText(`✓  ${sd}`, {
      x: 5.2,
      y: 2.1 + (i * 0.45),
      w: 3.4,
      h: 0.4,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });

  // Connector 2
  slide.addShape(pptx.shapes.RIGHT_ARROW, {
    x: 8.9,
    y: 3.4,
    w: 0.4,
    h: 0.3,
    fill: { color: COLORS.blue },
    line: { color: COLORS.blue, width: 0 }
  });
  slide.addText('Mongoose / SQL\nQueries', {
    x: 8.75,
    y: 3.8,
    w: 0.7,
    h: 0.5,
    fontSize: 7.5,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.slateMuted,
    align: 'center'
  });

  // Box 3: Data & ML Tier
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 9.4,
    y: 1.45,
    w: 3.1,
    h: 4.5,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.purple, width: 2 },
    rectRadius: 0.12
  });
  slide.addText('DATA & AI TIER', {
    x: 9.5,
    y: 1.65,
    w: 2.9,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.purple,
    align: 'center'
  });
  const dataDetails = [
    'MongoDB / Mongoose Models',
    'Dual-Adapter (SQLite / MySQL)',
    '10 Normalized Collections/Tables',
    'Unique Booking Compound Index',
    'Python Scikit-Learn ML Models:',
    '  • Wait Time Duration Regression',
    '  • No-Show Risk Classification',
    'Automated Seed & Schema Migrations'
  ];
  dataDetails.forEach((dd, i) => {
    slide.addText(`✓  ${dd}`, {
      x: 9.5,
      y: 2.1 + (i * 0.45),
      w: 2.9,
      h: 0.4,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });

  // Bottom Flow Banner
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 6.1,
    w: 11.7,
    h: 0.75,
    fill: { color: 'F1F5F9' },
    line: { color: 'CBD5E1', width: 1 },
    rectRadius: 0.08
  });
  slide.addText('DATA FLOW PIPELINE: Client dispatches authenticated HTTP/Socket request ➔ Express Controller verifies JWT ➔ Transaction lock verifies slot availability ➔ Database commits record ➔ Socket.IO broadcasts instant queue update to waiting patients.', {
    x: 1.0,
    y: 6.2,
    w: 11.3,
    h: 0.55,
    fontSize: 9.5,
    fontFace: 'Calibri',
    color: COLORS.slateDark
  });
}

// ==========================================
// SLIDE 04: USE CASE DIAGRAM
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Use Case Analysis & System Interactions', 'Use Case Model', 4);

  const actors = [
    {
      role: 'PATIENT ACTOR',
      color: COLORS.tealPrimary,
      cases: [
        'Register & Login with JWT',
        'Search Doctors & Departments',
        'Check Real-Time Slot Availability',
        'Book Conflict-Free Slot (Queue Generated)',
        'Check-In on Visit Day',
        'Track Live Queue Position & Wait Time',
        'View Medical History & E-Prescriptions',
        'Chat with AI Hospital Assistant'
      ]
    },
    {
      role: 'DOCTOR ACTOR',
      color: COLORS.blue,
      cases: [
        'Secure Login to Clinical Portal',
        'Configure Consultation Shifts & Durations',
        'Block Vacation & Conference Leave Dates',
        'Monitor Live Waiting Patient Queue',
        'Trigger "Call Next Patient" Broadcast',
        'Inspect Patient Prior Medical History',
        'Record Symptoms & Clinical Diagnosis',
        'Issue Itemized Digital Rx Prescriptions'
      ]
    },
    {
      role: 'ADMINISTRATOR ACTOR',
      color: COLORS.purple,
      cases: [
        'Login to Executive Dashboard',
        'Track Real-Time Hospital Intake KPIs',
        'Monitor Department Patient Volume',
        'Register & Provision New Doctors',
        'Activate / Deactivate Doctor Accounts',
        'Manage Hospital Clinical Departments',
        'Supervise Master Appointment Schedule',
        'Review No-Show Predictive Risk Telemetry'
      ]
    }
  ];

  actors.forEach((act, i) => {
    const x = 0.8 + (i * 4.0);
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 1.45,
      w: 3.7,
      h: 5.35,
      fill: { color: COLORS.cardBg },
      line: { color: act.color, width: 2 },
      rectRadius: 0.12
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.3,
      y: 1.65,
      w: 3.1,
      h: 0.45,
      fill: { color: act.color },
      line: { color: act.color, width: 0 },
      rectRadius: 0.08
    });
    slide.addText(act.role, {
      x: x + 0.3,
      y: 1.73,
      w: 3.1,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    });

    act.cases.forEach((c, idx) => {
      slide.addShape(pptx.shapes.OVAL, {
        x: x + 0.3,
        y: 2.3 + (idx * 0.57),
        w: 3.1,
        h: 0.48,
        fill: { color: COLORS.bgLight },
        line: { color: 'CBD5E1', width: 1 }
      });
      slide.addText(c, {
        x: x + 0.35,
        y: 2.35 + (idx * 0.57),
        w: 3.0,
        h: 0.38,
        fontSize: 9,
        fontFace: 'Calibri',
        color: COLORS.slateDark,
        align: 'center'
      });
    });
  });
}

// ==========================================
// SLIDE 05: ER DIAGRAM & DATABASE DESIGN
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Database Schema & Entity Relationship Model', 'Data Modeling', 5);

  const collections = [
    {
      name: 'Users',
      fields: ['_id (PK)', 'name', 'email (Unique)', 'password_hash', 'role: patient|doctor|admin', 'phone', 'created_at']
    },
    {
      name: 'Patients',
      fields: ['_id (PK)', 'user_id (FK)', 'date_of_birth', 'gender', 'blood_group', 'address', 'emergency_contact']
    },
    {
      name: 'Doctors',
      fields: ['_id (PK)', 'user_id (FK)', 'department_id (FK)', 'specialization', 'qualification', 'fee', 'slot_duration', 'is_active']
    },
    {
      name: 'Appointments',
      fields: ['_id (PK)', 'patient_id (FK)', 'doctor_id (FK)', 'date, time', 'queue_number', 'status', 'no_show_risk', 'INDEX(doc,date,time)']
    },
    {
      name: 'Queues',
      fields: ['_id (PK)', 'appointment_id (FK)', 'doctor_id (FK)', 'queue_date', 'queue_number', 'status: WAITING|CALLED|DONE', 'called_at']
    },
    {
      name: 'MedicalRecords',
      fields: ['_id (PK)', 'patient_id (FK)', 'doctor_id (FK)', 'appointment_id', 'symptoms', 'diagnosis', 'notes', 'follow_up_date']
    },
    {
      name: 'Prescriptions',
      fields: ['_id (PK)', 'medical_record_id (FK)', 'medicine_name', 'dosage', 'frequency', 'duration', 'instructions']
    },
    {
      name: 'DoctorAvailability',
      fields: ['_id (PK)', 'doctor_id (FK)', 'day_of_week', 'morning_start/end', 'evening_start/end', 'slot_duration']
    }
  ];

  collections.forEach((col, idx) => {
    const x = 0.8 + ((idx % 4) * 2.95);
    const y = 1.45 + (Math.floor(idx / 4) * 2.5);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 2.8,
      h: 2.35,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.tealPrimary, width: 1.5 },
      rectRadius: 0.1
    });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x,
      y,
      w: 2.8,
      h: 0.4,
      fill: { color: COLORS.tealPrimary },
      line: { color: COLORS.tealPrimary, width: 0 }
    });

    slide.addText(col.name, {
      x,
      y: y + 0.08,
      w: 2.8,
      h: 0.25,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    });

    col.fields.forEach((f, fIdx) => {
      const isKey = f.includes('PK') || f.includes('FK') || f.includes('INDEX');
      slide.addText(f, {
        x: x + 0.15,
        y: y + 0.48 + (fIdx * 0.25),
        w: 2.5,
        h: 0.22,
        fontSize: 8.5,
        fontFace: 'Calibri',
        bold: isKey,
        color: isKey ? COLORS.tealDark : COLORS.slateText
      });
    });
  });

  slide.addText('Relational Integrity: 1:1 Users-Patients/Doctors | 1:N Doctors-Availability | 1:N Patients-Appointments | 1:1 Appointments-Queues | 1:N Records-Prescriptions', {
    x: 0.8,
    y: 6.55,
    w: 11.7,
    h: 0.35,
    fontSize: 9,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.slateMuted,
    align: 'center'
  });
}

// ==========================================
// SLIDE 06: MODULE DESCRIPTION
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Core Application Modules & Sub-systems', 'Module Description', 6);

  const tableData = [
    [
      { text: 'Module Name', options: { bold: true, fill: { color: '0F766E' }, color: 'FFFFFF', fontSize: 10 } },
      { text: 'Target User', options: { bold: true, fill: { color: '0F766E' }, color: 'FFFFFF', fontSize: 10 } },
      { text: 'Primary Responsibilities & Key Operations', options: { bold: true, fill: { color: '0F766E' }, color: 'FFFFFF', fontSize: 10 } },
      { text: 'Key Technical Mechanisms', options: { bold: true, fill: { color: '0F766E' }, color: 'FFFFFF', fontSize: 10 } }
    ],
    [
      { text: '1. Auth & RBAC', options: { bold: true, fontSize: 9 } },
      { text: 'All Roles', options: { fontSize: 9 } },
      { text: 'User registration, login, role determination, route protection, session logout.', options: { fontSize: 8.5 } },
      { text: 'bcrypt hashing (10 rounds), signed JWT tokens, role middleware.', options: { fontSize: 8.5 } }
    ],
    [
      { text: '2. Doctor Catalog & Slots', options: { bold: true, fontSize: 9 } },
      { text: 'Patients', options: { fontSize: 9 } },
      { text: 'Browse doctors, filter by clinical department, inspect fee, dynamic 15-min slot generator.', options: { fontSize: 8.5 } },
      { text: 'Interval generator math; checks blocked dates & active bookings.', options: { fontSize: 8.5 } }
    ],
    [
      { text: '3. Appointment Engine', options: { bold: true, fontSize: 9 } },
      { text: 'Patients / Admin', options: { fontSize: 9 } },
      { text: 'Book appointment, assign sequential token, cancel booking, release slots.', options: { fontSize: 8.5 } },
      { text: 'Atomic transaction locks; unique constraint check blocks race conditions.', options: { fontSize: 8.5 } }
    ],
    [
      { text: '4. Live Queue Tracker', options: { bold: true, fontSize: 9 } },
      { text: 'Patients', options: { fontSize: 9 } },
      { text: 'Patient arrival check-in, live queue position monitor, dynamic wait time estimation.', options: { fontSize: 8.5 } },
      { text: 'Socket.IO room broadcast; wait = ahead × duration.', options: { fontSize: 8.5 } }
    ],
    [
      { text: '5. Doctor Clinical Console', options: { bold: true, fontSize: 9 } },
      { text: 'Doctors', options: { fontSize: 9 } },
      { text: 'Real-time waiting lobby monitor, "Call Next Patient" trigger, shift management.', options: { fontSize: 8.5 } },
      { text: 'WebSocket call trigger; status updates from WAITING to CALLED.', options: { fontSize: 8.5 } }
    ],
    [
      { text: '6. E-Prescription & History', options: { bold: true, fontSize: 9 } },
      { text: 'Doctors / Patients', options: { fontSize: 9 } },
      { text: 'Record diagnosis, clinical notes, multi-item medication; printable digital Rx slips.', options: { fontSize: 8.5 } },
      { text: 'Child prescription collection referencing medical records.', options: { fontSize: 8.5 } }
    ],
    [
      { text: '7. Admin Analytics', options: { bold: true, fontSize: 9 } },
      { text: 'Hospital Admin', options: { fontSize: 9 } },
      { text: 'Live KPI monitoring, department patient volume breakdown, doctor roster CRUD.', options: { fontSize: 8.5 } },
      { text: 'Aggregated database queries; real-time admin WebSocket stream.', options: { fontSize: 8.5 } }
    ],
    [
      { text: '8. AI/ML Smart Assistant', options: { bold: true, fontSize: 9 } },
      { text: 'Patients', options: { fontSize: 9 } },
      { text: 'Hospital FAQ bot, appointment guidance, patient queue lookup with safety guardrails.', options: { fontSize: 8.5 } },
      { text: 'Contextual administrative intent classifier with medical triage warnings.', options: { fontSize: 8.5 } }
    ]
  ];

  slide.addTable(tableData, {
    x: 0.8,
    y: 1.45,
    w: 11.7,
    h: 5.1,
    colW: [2.2, 1.3, 4.7, 3.5],
    border: { pt: 0.5, color: 'CBD5E1' },
    fill: { color: COLORS.cardBg }
  });
}

// ==========================================
// SLIDE 07: TECH STACK
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Technology Stack & Development Toolchain', 'Tech Stack', 7);

  const stack = [
    {
      category: 'MERN CORE',
      color: COLORS.tealPrimary,
      items: [
        { name: 'MongoDB / Mongoose', desc: 'Document store with schema validation, indexes & transaction support' },
        { name: 'Express.js', desc: 'Fast, unopinionated REST API routing & centralized middleware' },
        { name: 'React 18', desc: 'Component architecture with hooks, Context API & fast client rendering' },
        { name: 'Node.js', desc: 'High-performance asynchronous runtime for non-blocking I/O' }
      ]
    },
    {
      category: 'REAL-TIME & CLIENT',
      color: COLORS.blue,
      items: [
        { name: 'Socket.IO', desc: 'Bidirectional low-latency WebSocket engine for live queue tokens' },
        { name: 'Tailwind CSS', desc: 'Utility-first modern responsive healthcare UI styling' },
        { name: 'Axios Client', desc: 'Promise-based HTTP client with request/response JWT interceptors' },
        { name: 'Lucide Icons', desc: 'Consistent, accessible clinical and navigational SVG iconography' }
      ]
    },
    {
      category: 'SECURITY & INTELLIGENCE',
      color: COLORS.purple,
      items: [
        { name: 'JWT & bcryptjs', desc: 'Stateless authorization tokens & cryptographic password hashing' },
        { name: 'Python Scikit-Learn', desc: 'Machine learning regression (wait time) & classification (no-show risk)' },
        { name: 'Nodemailer', desc: 'Automated email dispatch for appointment confirmations & reminders' },
        { name: 'Postman & Git', desc: 'Automated API endpoint verification and distributed version control' }
      ]
    }
  ];

  stack.forEach((st, i) => {
    const x = 0.8 + (i * 4.0);
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 1.45,
      w: 3.7,
      h: 5.3,
      fill: { color: COLORS.cardBg },
      line: { color: st.color, width: 2 },
      rectRadius: 0.12
    });

    slide.addText(st.category, {
      x,
      y: 1.65,
      w: 3.7,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Calibri',
      bold: true,
      color: st.color,
      align: 'center'
    });

    st.items.forEach((item, idx) => {
      const iy = 2.15 + (idx * 1.15);
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.2,
        y: iy,
        w: 3.3,
        h: 0.98,
        fill: { color: COLORS.bgLight },
        line: { color: 'CBD5E1', width: 1 },
        rectRadius: 0.08
      });
      slide.addText(item.name, {
        x: x + 0.35,
        y: iy + 0.1,
        w: 3.0,
        h: 0.25,
        fontSize: 10.5,
        fontFace: 'Calibri',
        bold: true,
        color: COLORS.slateDark
      });
      slide.addText(item.desc, {
        x: x + 0.35,
        y: iy + 0.38,
        w: 3.0,
        h: 0.52,
        fontSize: 8.5,
        fontFace: 'Calibri',
        color: COLORS.slateText
      });
    });
  });
}

// ==========================================
// SLIDE 08: UI DESIGN & WIREFRAMES
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'UI Design, Layouts & Screen Wireframes', 'UI Engineering', 8);

  const screens = [
    {
      title: '1. Patient Booking Wizard',
      desc: '3-Step visual scheduling wizard. Filters department, renders dynamic morning/evening 15-min slot pills. Disables taken slots. Triggers celebratory confetti on confirmation.'
    },
    {
      title: '2. Real-Time Live Queue Tracker',
      desc: 'Large circular badge showing assigned token number (#15), currently serving (#12), patients ahead counter (3), dynamic wait time (~30m), and live WebSocket heartbeat indicator.'
    },
    {
      title: '3. Doctor Clinical Console',
      desc: 'Dual-panel layout: Active patient card with chief complaint & medical history shortcut, next patient queue roster, and prominent single-click "Call Next Patient" broadcast button.'
    },
    {
      title: '4. Executive Admin Center',
      desc: 'Real-time operational overview: KPI counters for daily intake, completed visits, waiting patients, cancellations, department volume distribution charts, and doctor roster management.'
    }
  ];

  screens.forEach((sc, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + (col * 5.95);
    const y = 1.45 + (row * 2.6);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 5.75,
      h: 2.38,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.tealPrimary, width: 1.5 },
      rectRadius: 0.1
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2,
      y: y + 0.2,
      w: 5.35,
      h: 0.4,
      fill: { color: COLORS.tealLight },
      line: { color: COLORS.tealPrimary, width: 0 },
      rectRadius: 0.06
    });

    slide.addText(sc.title, {
      x: x + 0.35,
      y: y + 0.25,
      w: 5.0,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.tealDark
    });

    slide.addText(sc.desc, {
      x: x + 0.3,
      y: y + 0.72,
      w: 5.15,
      h: 0.8,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });

    // Wireframe elements mockup tag
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.3,
      y: y + 1.65,
      w: 5.15,
      h: 0.5,
      fill: { color: 'F1F5F9' },
      line: { color: 'E2E8F0', width: 1 }
    });
    slide.addText('UI Wireframe Components: Responsive Navbar • Collapsible Role Sidebar • Modal Dialogs • Toast Alerts • Printable Rx', {
      x: x + 0.35,
      y: y + 1.75,
      w: 5.05,
      h: 0.3,
      fontSize: 8,
      fontFace: 'Calibri',
      color: COLORS.slateMuted,
      align: 'center'
    });
  });
}

// ==========================================
// SLIDE 09: FRONTEND DEVELOPMENT
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Frontend Implementation Architecture', 'Frontend Build', 9);

  const feHighlights = [
    {
      title: 'React 18 & Modular Component Architecture',
      points: [
        'Organized into public, patient, doctor, and admin domain folders.',
        'Atomic design hierarchy: common badges, modals, tables, notification toasts, and custom cards.',
        'Strict clean code separation: business logic isolated from presentation components.'
      ]
    },
    {
      title: 'State Management & Context API Architecture',
      points: [
        'AuthContext: Manages user authentication, token persistence in localStorage, and socket connection lifecycle.',
        'NotificationContext: Real-time listener capturing personal queue alerts and triggering automated toast popups.',
        'Vite proxy forwarding /api and /socket.io requests to Express backend seamlessly.'
      ]
    },
    {
      title: 'Real-Time WebSocket Synchronization',
      points: [
        'Dedicated Socket.IO client instance with automatic reconnection logic.',
        'Joins scoped patient rooms (patient_${userId}) and doctor consultation rooms (doctor_${doctorId}).',
        'Zero-refresh dynamic re-rendering on queue progression and doctor calling events.'
      ]
    },
    {
      title: 'Accessibility & Responsive Styling',
      points: [
        'Mobile-first responsive styling utilizing Tailwind CSS utility classes.',
        'Interactive feedback with Canvas-Confetti, status badges, and loading skeletons.',
        'Dedicated Printable Prescription View designed with CSS print-media queries.'
      ]
    }
  ];

  feHighlights.forEach((fh, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + (col * 5.95);
    const y = 1.45 + (row * 2.6);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 5.75,
      h: 2.38,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(fh.title, {
      x: x + 0.3,
      y: y + 0.2,
      w: 5.15,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.tealDark
    });

    fh.points.forEach((pt, pIdx) => {
      slide.addText(`•  ${pt}`, {
        x: x + 0.3,
        y: y + 0.6 + (pIdx * 0.52),
        w: 5.15,
        h: 0.48,
        fontSize: 9.5,
        fontFace: 'Calibri',
        color: COLORS.slateText
      });
    });
  });
}

// ==========================================
// SLIDE 10: BACKEND DEVELOPMENT
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Backend Architecture & Controller Engineering', 'Backend Build', 10);

  const beHighlights = [
    {
      title: '1. Modular MVC Architecture',
      desc: 'Structured separation into controllers (business logic), routes (endpoint dispatching), services (slot generation, queue algorithms, socket events), and database layer.'
    },
    {
      title: '2. JWT Security & Role Authorization Middleware',
      desc: 'Extracted Bearer token validation with JWT verification. Custom authorize("patient", "doctor", "admin") middleware blocks unauthorized cross-role endpoint access.'
    },
    {
      title: '3. Concurrency & Anti-Double-Booking Engine',
      desc: 'Transactional slot verification before insertion. Atomic database transactions (tx.query) reject simultaneous conflicting slot requests with explicit 409 Conflict status.'
    },
    {
      title: '4. Dynamic Slot Generation Algorithm',
      desc: 'Given doctor ID and target date, parses doctor availability, morning/evening clinic hours, excludes booked slots and blocked leave dates to generate available intervals.'
    },
    {
      title: '5. Socket.IO Room Broadcasting Hub',
      desc: 'Manages room connections: doctor_${doctorId}, patient_${userId}, and global_admin. Broadcasts events queue:update, queue:called, and admin:stats_refresh.'
    },
    {
      title: '6. Centralized Error Handling & Logging',
      desc: 'Global error handler intercepts unhandled exceptions, sanitizes error stack traces in production, and standardizes JSON error responses across all REST endpoints.'
    }
  ];

  beHighlights.forEach((bh, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + (col * 5.95);
    const y = 1.45 + (row * 1.75);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 5.75,
      h: 1.58,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.1
    });

    slide.addText(bh.title, {
      x: x + 0.3,
      y: y + 0.18,
      w: 5.15,
      h: 0.28,
      fontSize: 11.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.tealDark
    });

    slide.addText(bh.desc, {
      x: x + 0.3,
      y: y + 0.52,
      w: 5.15,
      h: 0.95,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });
}

// ==========================================
// SLIDE 11: DATABASE INTEGRATION
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Database Integration & Dual-Driver Strategy', 'Database Layer', 11);

  // Left Side: Strategy
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.45,
    w: 5.75,
    h: 5.3,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.tealPrimary, width: 1.5 },
    rectRadius: 0.12
  });

  slide.addText('DUAL-DRIVER ARCHITECTURE', {
    x: 1.1,
    y: 1.7,
    w: 5.15,
    h: 0.3,
    fontSize: 13,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.tealDark
  });

  const dbPoints = [
    'Zero-Config Local Execution (Default): Uses Node built-in SQLite engine (hospital.db) allowing evaluators to clone and run npm run dev immediately without requiring a local database server daemon.',
    'Production Deployment (MongoDB / MySQL): Easily toggled via environment variables (DB_CLIENT=mysql or MongoDB Mongoose adapter) for deployment on AWS RDS, Railway, Render, or MongoDB Atlas.',
    'Compound Uniqueness Indexing: Enforced on (doctor_id, appointment_date, appointment_time) guaranteeing data integrity and zero double-booking at the storage engine level.',
    'Write-Ahead Logging (WAL) Mode: SQLite configured with PRAGMA journal_mode=WAL and PRAGMA foreign_keys=ON for high concurrency and referential integrity.',
    'Automated Migration & Seed Scripts: Automatically creates all 10 schemas and pre-populates 7 departments, 5 doctors, schedules, patients, queue entries, and demo credentials.'
  ];

  dbPoints.forEach((dp, i) => {
    slide.addText(`•  ${dp}`, {
      x: 1.1,
      y: 2.15 + (i * 0.9),
      w: 5.15,
      h: 0.82,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });

  // Right Side: Collections & Counts
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.75,
    y: 1.45,
    w: 5.75,
    h: 5.3,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.blue, width: 1.5 },
    rectRadius: 0.12
  });

  slide.addText('CORE COLLECTIONS & ACTIVE RECORDS', {
    x: 7.05,
    y: 1.7,
    w: 5.15,
    h: 0.3,
    fontSize: 13,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.blue
  });

  const collectionsData = [
    { name: 'users', type: 'Auth & Base Identities', count: '9 Seed Accounts' },
    { name: 'patients', type: 'Clinical Profiles & Demographics', count: '3 Seed Patients' },
    { name: 'doctors', type: 'Specialist Credentials & Fees', count: '5 Seed Specialists' },
    { name: 'departments', type: 'Clinical Service Lines', count: '7 Seed Departments' },
    { name: 'doctor_availability', type: 'Weekly Shift Intervals', count: '25 Shift Schedules' },
    { name: 'appointments', type: 'Bookings & Queue Slips', count: 'Indexed by Doctor/Date' },
    { name: 'queues', type: 'Active Daily Token Tracking', count: 'Status: Waiting/Called/Done' },
    { name: 'medical_records', type: 'Clinical Diagnoses & Notes', count: 'Historical Visit Logs' },
    { name: 'prescriptions', type: 'Itemized Rx Medication Lines', count: 'Dosage, Frequency, Days' },
    { name: 'notifications', type: 'In-App Alerts & Email Logs', count: 'Real-Time User Inbox' }
  ];

  collectionsData.forEach((c, idx) => {
    const cy = 2.15 + (idx * 0.44);
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.05,
      y: cy,
      w: 5.15,
      h: 0.38,
      fill: { color: COLORS.bgLight },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.06
    });
    slide.addText(c.name, {
      x: 7.2,
      y: cy + 0.08,
      w: 1.6,
      h: 0.22,
      fontSize: 9,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.slateDark
    });
    slide.addText(c.type, {
      x: 8.8,
      y: cy + 0.08,
      w: 2.1,
      h: 0.22,
      fontSize: 8,
      fontFace: 'Calibri',
      color: COLORS.slateMuted
    });
    slide.addText(c.count, {
      x: 10.9,
      y: cy + 0.08,
      w: 1.2,
      h: 0.22,
      fontSize: 8,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.tealDark,
      align: 'right'
    });
  });
}

// ==========================================
// SLIDE 12: API DEVELOPMENT
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'RESTful API Specification & Endpoints', 'API Integration', 12);

  const apiTable = [
    [
      { text: 'Method', options: { bold: true, fill: { color: '0F766E' }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'Endpoint URI', options: { bold: true, fill: { color: '0F766E' }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'Role Access', options: { bold: true, fill: { color: '0F766E' }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'Description & Operations', options: { bold: true, fill: { color: '0F766E' }, color: 'FFFFFF', fontSize: 9 } },
      { text: 'Status', options: { bold: true, fill: { color: '0F766E' }, color: 'FFFFFF', fontSize: 9 } }
    ],
    [
      { text: 'POST', options: { bold: true, color: '059669', fontSize: 8.5 } },
      { text: '/api/auth/register', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Public', options: { fontSize: 8.5 } },
      { text: 'Registers new patient account, hashes password, returns JWT token.', options: { fontSize: 8 } },
      { text: '201 Created', options: { fontSize: 8 } }
    ],
    [
      { text: 'POST', options: { bold: true, color: '059669', fontSize: 8.5 } },
      { text: '/api/auth/login', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Public', options: { fontSize: 8.5 } },
      { text: 'Authenticates credentials for Patient, Doctor, or Admin; issues JWT.', options: { fontSize: 8 } },
      { text: '200 OK', options: { fontSize: 8 } }
    ],
    [
      { text: 'GET', options: { bold: true, color: '0284C7', fontSize: 8.5 } },
      { text: '/api/doctors', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Public', options: { fontSize: 8.5 } },
      { text: 'Search doctors with department, query, and availability filters.', options: { fontSize: 8 } },
      { text: '200 OK', options: { fontSize: 8 } }
    ],
    [
      { text: 'GET', options: { bold: true, color: '0284C7', fontSize: 8.5 } },
      { text: '/api/availability/slots', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Public', options: { fontSize: 8.5 } },
      { text: 'Dynamic 15-min slot generator for doctor ID and requested date.', options: { fontSize: 8 } },
      { text: '200 OK', options: { fontSize: 8 } }
    ],
    [
      { text: 'POST', options: { bold: true, color: '059669', fontSize: 8.5 } },
      { text: '/api/appointments', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Patient', options: { fontSize: 8.5 } },
      { text: 'Atomic conflict-free booking; assigns sequential daily queue token.', options: { fontSize: 8 } },
      { text: '201 / 409', options: { fontSize: 8 } }
    ],
    [
      { text: 'POST', options: { bold: true, color: '059669', fontSize: 8.5 } },
      { text: '/api/queue/checkin/:id', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Patient', options: { fontSize: 8.5 } },
      { text: 'Patient checks in on appointment day; enters active live waiting queue.', options: { fontSize: 8 } },
      { text: '200 OK', options: { fontSize: 8 } }
    ],
    [
      { text: 'GET', options: { bold: true, color: '0284C7', fontSize: 8.5 } },
      { text: '/api/queue/patient/:id', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Patient', options: { fontSize: 8.5 } },
      { text: 'Retrieves live serving token, patients ahead count & dynamic wait time.', options: { fontSize: 8 } },
      { text: '200 OK', options: { fontSize: 8 } }
    ],
    [
      { text: 'POST', options: { bold: true, color: '059669', fontSize: 8.5 } },
      { text: '/api/queue/doctor/call-next', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Doctor', options: { fontSize: 8.5 } },
      { text: 'Calls next waiting patient; broadcasts WebSocket room notification.', options: { fontSize: 8 } },
      { text: '200 OK', options: { fontSize: 8 } }
    ],
    [
      { text: 'POST', options: { bold: true, color: '059669', fontSize: 8.5 } },
      { text: '/api/medical-records', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Doctor', options: { fontSize: 8.5 } },
      { text: 'Saves diagnosis, notes, and multi-item prescriptions; completes visit.', options: { fontSize: 8 } },
      { text: '201 Created', options: { fontSize: 8 } }
    ],
    [
      { text: 'GET', options: { bold: true, color: '0284C7', fontSize: 8.5 } },
      { text: '/api/admin/stats', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Admin', options: { fontSize: 8.5 } },
      { text: 'Returns real-time hospital intake KPIs, department distribution.', options: { fontSize: 8 } },
      { text: '200 OK', options: { fontSize: 8 } }
    ],
    [
      { text: 'POST', options: { bold: true, color: '059669', fontSize: 8.5 } },
      { text: '/api/ai/chat', options: { fontFace: 'Courier New', fontSize: 8 } },
      { text: 'Public/User', options: { fontSize: 8.5 } },
      { text: 'Contextual hospital administrative assistant with medical safety filters.', options: { fontSize: 8 } },
      { text: '200 OK', options: { fontSize: 8 } }
    ]
  ];

  slide.addTable(apiTable, {
    x: 0.8,
    y: 1.45,
    w: 11.7,
    h: 5.2,
    colW: [1.1, 3.2, 1.4, 4.8, 1.2],
    border: { pt: 0.5, color: 'CBD5E1' },
    fill: { color: COLORS.cardBg }
  });
}

// ==========================================
// SLIDE 13: IMPLEMENTATION STATUS
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Sprint Progress & Module Completion Metrics', 'Implementation Status', 13);

  const statusItems = [
    { module: 'User Authentication & Role-Based Access Control (RBAC)', pct: 100, color: COLORS.emerald },
    { module: 'Doctor Catalog, Department Filters & Dynamic Slot Engine', pct: 100, color: COLORS.emerald },
    { module: 'Anti-Double-Booking Concurrency & Transaction Engine', pct: 100, color: COLORS.emerald },
    { module: 'Live Queue Tracking & Socket.IO Room Broadcast Engine', pct: 90, color: COLORS.tealPrimary },
    { module: 'Doctor Clinical Workspace, Next Patient Call & Shift Manager', pct: 85, color: COLORS.tealPrimary },
    { module: 'Digital Medical History & Itemized Printable E-Prescriptions', pct: 85, color: COLORS.tealPrimary },
    { module: 'Executive Admin Center & Hospital Clinical Department CRUD', pct: 80, color: COLORS.blue },
    { module: 'Machine Learning Consultation Duration & No-Show Models', pct: 75, color: COLORS.amber },
    { module: 'Automated Transactional Email Alerts (Nodemailer)', pct: 70, color: COLORS.amber }
  ];

  statusItems.forEach((st, idx) => {
    const y = 1.45 + (idx * 0.58);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y,
      w: 11.7,
      h: 0.5,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.08
    });

    slide.addText(st.module, {
      x: 1.0,
      y: y + 0.1,
      w: 6.8,
      h: 0.3,
      fontSize: 9.5,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.slateDark
    });

    // Background Progress Bar
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.0,
      y: y + 0.16,
      w: 3.5,
      h: 0.18,
      fill: { color: 'E2E8F0' },
      line: { color: 'E2E8F0', width: 0 },
      rectRadius: 0.05
    });

    // Foreground Active Progress
    const fillWidth = (st.pct / 100) * 3.5;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.0,
      y: y + 0.16,
      w: fillWidth,
      h: 0.18,
      fill: { color: st.color },
      line: { color: st.color, width: 0 },
      rectRadius: 0.05
    });

    // Percentage Label
    slide.addText(`${st.pct}%`, {
      x: 11.6,
      y: y + 0.1,
      w: 0.8,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: st.color,
      align: 'right'
    });
  });

  slide.addText('OVERALL REVIEWS 1 & 2 COMPLETION: ~85% (Core Full-Stack System Operational & Verified via Automated Test Suite)', {
    x: 0.8,
    y: 6.6,
    w: 11.7,
    h: 0.35,
    fontSize: 10,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.tealDark,
    align: 'center'
  });
}

// ==========================================
// SLIDE 14: SCREENSHOTS / SHOWCASE
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Application Showcase & UI Walkthrough', 'Live Demonstration', 14);

  const demoScreens = [
    {
      title: 'A. Conflict-Free Booking & Slot Selection',
      details: [
        'Visual 15-minute slot selector separating Morning and Evening clinic shifts.',
        'Automatically identifies and disables already reserved or expired slots.',
        'Immediate assigned Queue Token and Appointment ID shown upon confirmation.'
      ]
    },
    {
      title: 'B. Live WebSocket Queue Tracker',
      details: [
        'Large circular token indicator displaying assigned queue number (#15).',
        'Real-time currently serving counter (#12) and patients ahead counter (3).',
        'Dynamic wait-time calculation with pulsating live WebSocket status indicator.'
      ]
    },
    {
      title: 'C. Doctor Consultation Console & Rx Form',
      details: [
        'Doctor views today waiting list in real-time with one-click "Call Next Patient".',
        'Digital medical record modal capturing symptoms, clinical diagnosis, and advice.',
        'Itemized multi-line Rx medication table (medicine, dosage, frequency, days).'
      ]
    },
    {
      title: 'D. Executive Analytics & AI Chatbot',
      details: [
        'Admin counters for Total Patients, Active Doctors, Today Intake, Completed, Waiting.',
        'Clinical department volume breakdown and master hospital appointments table.',
        'Floating interactive AI assistant answering hospital FAQs and queue queries.'
      ]
    }
  ];

  demoScreens.forEach((ds, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + (col * 5.95);
    const y = 1.45 + (row * 2.6);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 5.75,
      h: 2.4,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.tealPrimary, width: 1.5 },
      rectRadius: 0.1
    });

    slide.addText(ds.title, {
      x: x + 0.3,
      y: y + 0.2,
      w: 5.15,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.tealDark
    });

    ds.details.forEach((dt, idx) => {
      slide.addText(`✓  ${dt}`, {
        x: x + 0.3,
        y: y + 0.6 + (idx * 0.55),
        w: 5.15,
        h: 0.5,
        fontSize: 9.5,
        fontFace: 'Calibri',
        color: COLORS.slateText
      });
    });
  });
}

// ==========================================
// SLIDE 15: CHALLENGES & SOLUTIONS
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Key Engineering Challenges & Adopted Solutions', 'Technical Problem Solving', 15);

  const challenges = [
    {
      num: '01',
      title: 'Race Conditions & Double-Booking Slot Collisions',
      challenge: 'Two patients submitting booking requests for the exact same doctor and 15-minute slot at the exact same millisecond caused duplicate appointments.',
      solution: 'Engineered atomic database transactions (tx.query) combined with an enforced database compound uniqueness constraint: (doctor_id, appointment_date, appointment_time). Only one transaction commits; conflicting requests abort with explicit 409 Conflict.'
    },
    {
      num: '02',
      title: 'Real-Time State Synchronization Across Devices',
      challenge: 'Patients waiting in lobby areas had to continuously refresh their browser pages to check if the doctor called their token number, causing unnecessary server load.',
      solution: 'Integrated Socket.IO room architecture. Connected sockets join scoped rooms (doctor_${id}, patient_${id}). When a doctor triggers "Call Next Patient", a WebSocket event updates the waiting counter and wait-time estimate instantly without reload.'
    },
    {
      num: '03',
      title: 'Inaccurate Static Waiting Time Estimates',
      challenge: 'Multiplying patients ahead by a static 15-minute constant created misleading wait estimates for complex cases (e.g. cardiac assessments vs routine refills).',
      solution: 'Designed a machine learning regression pipeline evaluating patient age, symptom category, visit type, department, and time of day to deliver personalized dynamic wait-time estimations with confidence metrics.'
    },
    {
      num: '04',
      title: 'Cross-Origin Resource Sharing (CORS) & Token Expiry',
      challenge: 'CORS policy errors between Vite frontend (port 5173) and Express backend (port 5000), along with unhandled JWT expiration causing abrupt application crashes.',
      solution: 'Configured robust Express CORS middleware with origin reflection and credentials support. Implemented Axios response interceptors to automatically catch 401 Unauthorized errors and redirect gracefully to login.'
    }
  ];

  challenges.forEach((ch, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + (col * 5.95);
    const y = 1.45 + (row * 2.6);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 5.75,
      h: 2.4,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.1
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.2,
      y: y + 0.18,
      w: 0.5,
      h: 0.35,
      fill: { color: COLORS.amberLight },
      line: { color: COLORS.amber, width: 1 },
      rectRadius: 0.05
    });
    slide.addText(ch.num, {
      x: x + 0.2,
      y: y + 0.23,
      w: 0.5,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.amber,
      align: 'center'
    });

    slide.addText(ch.title, {
      x: x + 0.8,
      y: y + 0.18,
      w: 4.7,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Calibri',
      bold: true,
      color: COLORS.slateDark
    });

    slide.addText(`CHALLENGE: ${ch.challenge}`, {
      x: x + 0.25,
      y: y + 0.6,
      w: 5.25,
      h: 0.75,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLORS.rose
    });

    slide.addText(`SOLUTION: ${ch.solution}`, {
      x: x + 0.25,
      y: y + 1.4,
      w: 5.25,
      h: 0.85,
      fontSize: 8.5,
      fontFace: 'Calibri',
      color: COLORS.tealDark
    });
  });
}

// ==========================================
// SLIDE 16: NEXT STEPS & REFERENCES
// ==========================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Remaining Roadmap & Technical References', 'Next Steps & References', 16);

  // Left Side: Next Steps
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.45,
    w: 5.75,
    h: 5.3,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.tealPrimary, width: 1.5 },
    rectRadius: 0.12
  });

  slide.addText('REMAINING WORK FOR FINAL REVIEW', {
    x: 1.1,
    y: 1.7,
    w: 5.15,
    h: 0.3,
    fontSize: 13,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.tealDark
  });

  const nextSteps = [
    'Complete Production Deployment: Host client on Vercel/Netlify, deploy Express server on Render/Railway, and migrate database to MongoDB Atlas cluster.',
    'SMS & WhatsApp Notifications: Integrate Twilio / WhatsApp Business API alongside Nodemailer for real-time patient queue SMS alerts.',
    'Mobile Progressive Web App (PWA): Configure Web App Manifest and Service Workers for offline consultation slip caching.',
    'Automated End-to-End Test Suite: Expand Cypress / Playwright automated browser tests covering booking and queue progression flows.',
    'Comprehensive Capstone Project Report: Finalize IEEE-formatted documentation, viva presentation slides, and software engineering metrics.'
  ];

  nextSteps.forEach((ns, i) => {
    slide.addText(`✓  ${ns}`, {
      x: 1.1,
      y: 2.15 + (i * 0.9),
      w: 5.15,
      h: 0.82,
      fontSize: 9.5,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });

  // Right Side: References
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.75,
    y: 1.45,
    w: 5.75,
    h: 5.3,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.blue, width: 1.5 },
    rectRadius: 0.12
  });

  slide.addText('LITERATURE & TECHNICAL REFERENCES', {
    x: 7.05,
    y: 1.7,
    w: 5.15,
    h: 0.3,
    fontSize: 13,
    fontFace: 'Calibri',
    bold: true,
    color: COLORS.blue
  });

  const references = [
    'MongoDB Inc., "MongoDB & Mongoose: Schema Modeling, Sharding & Query Optimization Documentation", Official MERN Reference, 2025.',
    'Facebook Open Source, "React 18 Architecture: Concurrent Mode, Context API and Component Lifecycles", Official React Docs, 2024.',
    'Socket.IO Organization, "Bidirectional Low-Latency Event-Driven Communication Protocols", Official WebSocket Specs, 2025.',
    'IEEE Healthcare Informatics, "Optimization of Outpatient Appointment Scheduling and Dynamic Queue Reduction via Concurrency Control", IEEE Transactions on Healthcare Systems, 2024.',
    'Scikit-Learn Developers, "Ensemble Methods, Random Forests and Gradient Boosting for Medical Queue Forecasting", Machine Learning in Python, 2024.',
    'World Health Organization (WHO), "Digital Health Strategies for Clinical Workflow Streamlining & Patient Wait-Time Alleviation", Global Healthcare Reports, 2024.'
  ];

  references.forEach((ref, idx) => {
    slide.addText(`[${idx + 1}]  ${ref}`, {
      x: 7.05,
      y: 2.15 + (idx * 0.75),
      w: 5.15,
      h: 0.7,
      fontSize: 9,
      fontFace: 'Calibri',
      color: COLORS.slateText
    });
  });
}

// Generate Presentation
const outputPath = path.resolve(__dirname, '../CareSync_Review_1_and_2_Presentation.pptx');
pptx.writeFile({ fileName: outputPath })
  .then((fileName) => {
    console.log(`✅ PowerPoint presentation created successfully at: ${fileName}`);
  })
  .catch((err) => {
    console.error('❌ Error generating presentation:', err);
    process.exit(1);
  });
