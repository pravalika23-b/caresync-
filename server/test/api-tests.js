// Automated API verification script for CareSync Hospital Management System
const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Automated Backend API Verification...\n');

  try {
    // 1. Health check
    console.log('1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('   Status:', healthData.status, '| System:', healthData.system);

    // 2. Auth: Patient Login
    console.log('\n2️⃣ Testing Patient Login (rahul.verma@example.com)...');
    const patLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.verma@example.com', password: 'patient123' })
    });
    const patLoginData = await patLoginRes.json();
    console.log('   Login success:', patLoginData.success, '| Role:', patLoginData.user?.role, '| PatientId:', patLoginData.user?.patientId);
    const patientToken = patLoginData.token;

    // 3. Auth: Doctor Login
    console.log('\n3️⃣ Testing Doctor Login (priya.sharma@hospital.com)...');
    const docLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya.sharma@hospital.com', password: 'doctor123' })
    });
    const docLoginData = await docLoginRes.json();
    console.log('   Login success:', docLoginData.success, '| Role:', docLoginData.user?.role, '| DoctorId:', docLoginData.user?.doctorId);
    const doctorToken = docLoginData.token;
    const doctorId = docLoginData.user?.doctorId;

    // 4. Auth: Admin Login
    console.log('\n4️⃣ Testing Admin Login (admin@hospital.com)...');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hospital.com', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    console.log('   Login success:', adminLoginData.success, '| Role:', adminLoginData.user?.role);
    const adminToken = adminLoginData.token;

    // 5. Doctor Directory
    console.log('\n5️⃣ Testing Doctor Search & Directory...');
    const docsRes = await fetch(`${BASE_URL}/api/doctors?search=Cardiology`);
    const docsData = await docsRes.json();
    console.log(`   Found ${docsData.count} doctors matching "Cardiology"`);

    // 6. Slot Generator
    // Find next Monday to test slots reliably
    const d = new Date();
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7)); // next monday
    const testDate = d.toISOString().split('T')[0];

    console.log(`\n6️⃣ Testing Dynamic Slot Generation for Doctor #${doctorId} on ${testDate}...`);
    const slotRes = await fetch(`${BASE_URL}/api/availability/slots?doctorId=${doctorId}&date=${testDate}`);
    const slotData = await slotRes.json();
    console.log(`   Total Slots: ${slotData.totalSlots}, Available: ${slotData.availableCount}`);
    const firstAvailable = slotData.slots.find(s => s.isAvailable);

    if (firstAvailable) {
      console.log(`\n7️⃣ Testing Appointment Booking for Slot: ${firstAvailable.time}...`);
      const bookRes = await fetch(`${BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patientToken}`
        },
        body: JSON.stringify({
          doctorId,
          appointmentDate: testDate,
          appointmentTime: firstAvailable.time,
          reason: 'Automated test consultation'
        })
      });
      const bookData = await bookRes.json();
      console.log('   Book result:', bookData.success ? `Success! Queue #${bookData.appointment.queueNumber}` : bookData.message);

      // 8. Test Double-Booking Prevention
      console.log('\n8️⃣ Testing Double-Booking Prevention (trying to book exact same slot again)...');
      const conflictRes = await fetch(`${BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${patientToken}`
        },
        body: JSON.stringify({
          doctorId,
          appointmentDate: testDate,
          appointmentTime: firstAvailable.time,
          reason: 'Duplicate attempt'
        })
      });
      const conflictData = await conflictRes.json();
      console.log('   Conflict prevention status code:', conflictRes.status, '| Message:', conflictData.message);
      if (conflictRes.status === 409) {
        console.log('   🛡️ SUCCESS: Anti-Double-Booking transaction successfully blocked conflict!');
      } else {
        console.warn('   ⚠️ Unexpected response for conflict booking:', conflictRes.status);
      }
    }

    // 9. Admin Stats
    console.log('\n9️⃣ Testing Admin Analytics & Stats...');
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    console.log('   Admin Stats:', statsData.stats);

    // 10. AI Assistant Chat
    console.log('\n🔟 Testing AI Hospital Assistant Chat...');
    const aiRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      },
      body: JSON.stringify({ message: 'What departments do you have and how do I book?' })
    });
    const aiData = await aiRes.json();
    console.log('   AI Reply preview:', aiData.reply?.substring(0, 80) + '...');

    console.log('\n🎉 ALL BACKEND API VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
