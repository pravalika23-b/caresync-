const db = require('../config/db');

async function handleChat(req, res) {
  try {
    const { message } = req.body;
    const user = req.user; // optional or authenticated

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const queryLower = message.toLowerCase().trim();

    // 1. Safety Guardrail: Medical emergencies
    const emergencyKeywords = ['emergency', 'heart attack', 'severe chest pain', 'stroke', 'bleeding heavily', 'unconscious', 'suicide', 'poison'];
    if (emergencyKeywords.some(k => queryLower.includes(k))) {
      return res.json({
        success: true,
        reply: `⚠️ **Emergency Notice**: CareSync Assistant is strictly an administrative hospital scheduling assistant and does not provide medical triage or diagnosis.\n\n**If you or someone else is experiencing severe symptoms, acute chest pain, or a life-threatening condition, please call emergency services (112 / 108 / 911) or visit the nearest Hospital Emergency Room immediately.**`,
        suggestedActions: ['Emergency Contact: 112', 'Find Nearest Trauma Center']
      });
    }

    // 2. Queue Status Query
    if (queryLower.includes('queue') || queryLower.includes('my turn') || queryLower.includes('serving')) {
      if (user && user.role === 'patient') {
        const today = new Date().toISOString().split('T')[0];
        const activeApts = await db.query(
          `SELECT a.id, a.appointment_time, a.queue_number, a.status, u.name as doctor_name, dep.name as department_name,
                  q.status as queue_status
           FROM appointments a
           JOIN doctors d ON a.doctor_id = d.id
           JOIN users u ON d.user_id = u.id
           JOIN departments dep ON d.department_id = dep.id
           LEFT JOIN queues q ON a.id = q.appointment_id
           WHERE a.patient_id = ? AND a.appointment_date = ? AND a.status != 'CANCELLED'
           ORDER BY a.appointment_time ASC LIMIT 1`,
          [user.patientId, today]
        );

        if (activeApts.length > 0) {
          const apt = activeApts[0];
          return res.json({
            success: true,
            reply: `You have an appointment today with **${apt.doctor_name}** (${apt.department_name}) at **${apt.appointment_time}**.\n\n• **Your Queue Number**: #${apt.queue_number}\n• **Status**: ${apt.status}\n• **Live Queue Status**: ${apt.queue_status || 'Please check in upon arrival'}.\n\nYou can track real-time position directly on your **Live Queue** tab.`,
            suggestedActions: ['View Live Queue', 'My Appointments']
          });
        } else {
          return res.json({
            success: true,
            reply: `You do not have any active appointments scheduled for today. You can book an appointment anytime from the **Book Appointment** tab!`,
            suggestedActions: ['Book Appointment', 'View All Appointments']
          });
        }
      } else {
        return res.json({
          success: true,
          reply: `To check your live queue status, please log in to your patient account and navigate to **My Appointments** or **Live Queue**. You will receive an automated alert the moment your queue number is called!`,
          suggestedActions: ['Login as Patient', 'Book Appointment']
        });
      }
    }

    // 3. Departments Query
    if (queryLower.includes('department') || queryLower.includes('specialties') || queryLower.includes('services')) {
      const depts = await db.query('SELECT name, description FROM departments LIMIT 10');
      const deptList = depts.map(d => `• **${d.name}**: ${d.description}`).join('\n');

      return res.json({
        success: true,
        reply: `Here are our specialized clinical departments:\n\n${deptList}\n\nYou can filter doctors by any of these departments on our **Doctors** directory.`,
        suggestedActions: ['Browse Doctors', 'Book Appointment']
      });
    }

    // 4. Doctor Search Query
    if (queryLower.includes('doctor') || queryLower.includes('specialist') || queryLower.includes('cardiologist') || queryLower.includes('dermatologist')) {
      const doctors = await db.query(
        `SELECT u.name, dep.name as dept, d.specialization, d.consultation_fee 
         FROM doctors d 
         JOIN users u ON d.user_id = u.id 
         JOIN departments dep ON d.department_id = dep.id 
         WHERE d.is_active = 1 LIMIT 5`
      );

      const docList = doctors.map(d => `• **${d.name}** (${d.dept}) — ${d.specialization}, Fee: ₹${d.consultation_fee}`).join('\n');

      return res.json({
        success: true,
        reply: `Here are some of our top attending doctors:\n\n${docList}\n\nWould you like to book an appointment with any of them?`,
        suggestedActions: ['View All Doctors', 'Book Appointment']
      });
    }

    // 5. Booking Guidance
    if (queryLower.includes('book') || queryLower.includes('appointment') || queryLower.includes('schedule') || queryLower.includes('how to')) {
      return res.json({
        success: true,
        reply: `Booking an appointment on CareSync is simple and conflict-free:\n\n1. Go to **Book Appointment** in the menu.\n2. Select your required **Department** and choose your preferred **Doctor**.\n3. Pick your desired **Date** $\\rightarrow$ our system dynamically displays available 15-min time slots.\n4. Click your preferred time slot and hit **Confirm Booking**.\n5. You will instantly receive an **Appointment ID** and your assigned **Queue Number**!`,
        suggestedActions: ['Book an Appointment Now', 'View Doctors']
      });
    }

    // 6. Cancellation / Rescheduling
    if (queryLower.includes('cancel') || queryLower.includes('reschedule') || queryLower.includes('refund')) {
      return res.json({
        success: true,
        reply: `To cancel an upcoming appointment:\n\n1. Visit **My Appointments** from your dashboard.\n2. Locate the upcoming appointment.\n3. Click the **Cancel** button.\n\n*Note:* Once cancelled, the slot is immediately released for other waiting patients. You can book a new slot anytime!`,
        suggestedActions: ['My Appointments']
      });
    }

    // Default Fallback Response
    res.json({
      success: true,
      reply: `Hello! I am **CareSync Hospital Assistant**. I can help you with:\n\n• Checking doctor availability & consultation schedules\n• Step-by-step guidance on booking appointments\n• Real-time queue position & wait-time estimates\n• Information on hospital departments & specialists\n\nHow can I assist you today?`,
      suggestedActions: ['Book Appointment', 'Browse Doctors', 'Check My Queue', 'Hospital Departments']
    });
  } catch (error) {
    console.error('AI assistant error:', error);
    res.status(500).json({ success: false, message: 'AI Assistant temporarily unavailable.' });
  }
}

module.exports = {
  handleChat
};
