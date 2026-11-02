const bcrypt = require('bcryptjs');
const db = require('../config/db');
const migrate = require('./migrate');

async function seed() {
  console.log('🌱 Starting database seeding...');
  await migrate();

  // Check if users already seeded
  const existingUsers = await db.query('SELECT COUNT(*) as count FROM users');
  const count = existingUsers[0].count || existingUsers[0]['COUNT(*)'] || 0;
  if (count > 0) {
    console.log('ℹ️ Database already contains data. Skipping seed.');
    return;
  }

  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const doctorPasswordHash = await bcrypt.hash('doctor123', 10);
  const patientPasswordHash = await bcrypt.hash('patient123', 10);

  // 1. Create Admin
  const adminRes = await db.query(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Hospital Admin', 'admin@hospital.com', adminPasswordHash, 'admin', '+19876543210']
  );
  console.log('  👤 Admin created: admin@hospital.com / admin123');

  // 2. Create Departments
  const departmentsData = [
    { name: 'Cardiology', desc: 'Advanced heart & cardiovascular medical care.', icon: 'Heart' },
    { name: 'Dermatology', desc: 'Skin, hair, cosmetic, and allergy treatments.', icon: 'Sparkles' },
    { name: 'Neurology', desc: 'Comprehensive brain, spine, and nerve disorders treatment.', icon: 'Brain' },
    { name: 'Orthopedics', desc: 'Bone, joint, ligament, and sports injury care.', icon: 'Bone' },
    { name: 'Pediatrics', desc: 'Specialized healthcare for infants, children, and adolescents.', icon: 'Baby' },
    { name: 'General Medicine', desc: 'Primary health consultations, checkups, and wellness.', icon: 'Activity' },
    { name: 'ENT', desc: 'Ear, nose, throat, and head-neck surgical consultations.', icon: 'Stethoscope' }
  ];

  const deptIds = {};
  for (const dept of departmentsData) {
    const res = await db.query(
      'INSERT INTO departments (name, description, icon) VALUES (?, ?, ?)',
      [dept.name, dept.desc, dept.icon]
    );
    deptIds[dept.name] = res.insertId;
  }
  console.log('  🏥 7 Departments seeded');

  // 3. Create Doctors
  const doctorsData = [
    {
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@hospital.com',
      phone: '+919876500001',
      dept: 'Cardiology',
      specialization: 'Interventional Cardiology',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experience: 12,
      fee: 800.00,
      duration: 15
    },
    {
      name: 'Dr. Arun Kumar',
      email: 'arun.kumar@hospital.com',
      phone: '+919876500002',
      dept: 'Dermatology',
      specialization: 'Clinical & Cosmetic Dermatology',
      qualification: 'MBBS, MD (Dermatology)',
      experience: 8,
      fee: 600.00,
      duration: 15
    },
    {
      name: 'Dr. Rajesh Mehta',
      email: 'rajesh.mehta@hospital.com',
      phone: '+919876500003',
      dept: 'Orthopedics',
      specialization: 'Joint Replacement & Arthroscopy',
      qualification: 'MBBS, MS (Orthopedics), MCh',
      experience: 16,
      fee: 900.00,
      duration: 20
    },
    {
      name: 'Dr. Ananya Iyer',
      email: 'ananya.iyer@hospital.com',
      phone: '+919876500004',
      dept: 'Pediatrics',
      specialization: 'Neonatal & Child Healthcare',
      qualification: 'MBBS, DCH, MD (Pediatrics)',
      experience: 10,
      fee: 650.00,
      duration: 15
    },
    {
      name: 'Dr. Vikram Patel',
      email: 'vikram.patel@hospital.com',
      phone: '+919876500005',
      dept: 'Neurology',
      specialization: 'Stroke & Neurophysiology',
      qualification: 'MBBS, MD, DM (Neurology)',
      experience: 14,
      fee: 1000.00,
      duration: 20
    }
  ];

  const doctorIds = [];
  for (const doc of doctorsData) {
    const userRes = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [doc.name, doc.email, doctorPasswordHash, 'doctor', doc.phone]
    );
    const docRes = await db.query(
      `INSERT INTO doctors (user_id, department_id, specialization, qualification, experience_years, consultation_fee, consultation_duration, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [userRes.insertId, deptIds[doc.dept], doc.specialization, doc.qualification, doc.experience, doc.fee, doc.duration]
    );
    doctorIds.push({ id: docRes.insertId, name: doc.name, duration: doc.duration });

    // Seed Availability: Mon to Fri (days 1 to 5)
    for (let day = 1; day <= 5; day++) {
      await db.query(
        `INSERT INTO doctor_availability (doctor_id, day_of_week, morning_start, morning_end, evening_start, evening_end, slot_duration, is_active)
         VALUES (?, ?, '09:00', '13:00', '16:00', '19:00', ?, 1)`,
        [docRes.insertId, day, doc.duration]
      );
    }
  }
  console.log(`  🩺 ${doctorsData.length} Doctors seeded with weekly schedules`);

  // 4. Create Patients
  const patientsData = [
    {
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      phone: '+919811122233',
      dob: '1995-04-12',
      gender: 'Male',
      address: '42 Lotus Enclave, New Delhi',
      emergency: '+919811122234',
      blood: 'O+'
    },
    {
      name: 'Sneha Gupta',
      email: 'sneha.gupta@example.com',
      phone: '+919822233344',
      dob: '1992-08-25',
      gender: 'Female',
      address: '7B Green Park, Mumbai',
      emergency: '+919822233345',
      blood: 'B+'
    },
    {
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phone: '+919833344455',
      dob: '1984-11-03',
      gender: 'Male',
      address: '15 Sunrise Heights, Ahmedabad',
      emergency: '+919833344456',
      blood: 'A+'
    }
  ];

  const patientIds = [];
  for (const p of patientsData) {
    const userRes = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [p.name, p.email, patientPasswordHash, 'patient', p.phone]
    );
    const patRes = await db.query(
      `INSERT INTO patients (user_id, date_of_birth, gender, address, emergency_contact, blood_group)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userRes.insertId, p.dob, p.gender, p.address, p.emergency, p.blood]
    );
    patientIds.push({ id: patRes.insertId, userId: userRes.insertId, name: p.name });
  }
  console.log(`  👤 ${patientsData.length} Patients seeded`);

  // 5. Seed Today's Appointments & Queue
  const today = new Date().toISOString().split('T')[0];
  const drPriya = doctorIds[0].id; // Dr. Priya Sharma

  // Patient 1 (Rahul) - Completed appointment earlier today
  const apt1 = await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, queue_number, status, reason, check_in_time)
     VALUES (?, ?, ?, '09:00', 1, 'COMPLETED', 'Routine cardiac checkup and BP monitoring', CURRENT_TIMESTAMP)`,
    [patientIds[0].id, drPriya, today]
  );
  await db.query(
    `INSERT INTO queues (appointment_id, doctor_id, queue_date, queue_number, status, called_at, completed_at)
     VALUES (?, ?, ?, 1, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [apt1.insertId, drPriya, today]
  );

  // Medical Record for Apt 1
  const rec1 = await db.query(
    `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, symptoms, diagnosis, notes, follow_up_date)
     VALUES (?, ?, ?, 'Mild morning dizziness, resting BP 142/90 mmHg', 'Stage 1 Essential Hypertension', 'Advised low-sodium DASH diet, 30 min daily brisk walking. Monitor BP twice weekly.', '2026-10-15')`,
    [patientIds[0].id, drPriya, apt1.insertId]
  );

  // Prescriptions for Medical Record 1
  await db.query(
    `INSERT INTO prescriptions (medical_record_id, medicine_name, dosage, frequency, duration, instructions)
     VALUES (?, 'Telmisartan', '40mg', 'Once daily (OD)', '30 days', 'Take in the morning with or without food')`,
    [rec1.insertId]
  );
  await db.query(
    `INSERT INTO prescriptions (medical_record_id, medicine_name, dosage, frequency, duration, instructions)
     VALUES (?, 'Atorvastatin', '10mg', 'Once at bedtime (HS)', '30 days', 'Take after dinner')`,
    [rec1.insertId]
  );

  // Patient 2 (Sneha) - Checked in, currently IN_PROGRESS (Queue #2)
  const apt2 = await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, queue_number, status, reason, check_in_time)
     VALUES (?, ?, ?, '09:15', 2, 'IN_PROGRESS', 'Palpitations during exercise', CURRENT_TIMESTAMP)`,
    [patientIds[1].id, drPriya, today]
  );
  await db.query(
    `INSERT INTO queues (appointment_id, doctor_id, queue_date, queue_number, status, called_at)
     VALUES (?, ?, ?, 2, 'IN_CONSULTATION', CURRENT_TIMESTAMP)`,
    [apt2.insertId, drPriya, today]
  );

  // Patient 3 (Amit) - Checked in, WAITING in Queue (Queue #3)
  const apt3 = await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, queue_number, status, reason, check_in_time)
     VALUES (?, ?, ?, '09:30', 3, 'WAITING', 'Follow-up for lipid profile review', CURRENT_TIMESTAMP)`,
    [patientIds[2].id, drPriya, today]
  );
  await db.query(
    `INSERT INTO queues (appointment_id, doctor_id, queue_date, queue_number, status)
     VALUES (?, ?, ?, 3, 'WAITING')`,
    [apt3.insertId, drPriya, today]
  );

  // 6. Seed Notifications
  await db.query(
    `INSERT INTO notifications (user_id, title, message, type, is_read)
     VALUES (?, 'Appointment Confirmed', 'Your appointment with Dr. Priya Sharma is confirmed for today at 09:30 AM. Queue Number: 3', 'appointment', 0)`,
    [patientIds[2].userId]
  );

  console.log('✅ Rich initial seed data populated successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 Login Credentials:');
  console.log('   Admin:   admin@hospital.com / admin123');
  console.log('   Doctor:  priya.sharma@hospital.com / doctor123');
  console.log('   Doctor:  arun.kumar@hospital.com / doctor123');
  console.log('   Patient: rahul.verma@example.com / patient123');
  console.log('   Patient: amit.patel@example.com / patient123');
  console.log('----------------------------------------------------');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

module.exports = seed;
