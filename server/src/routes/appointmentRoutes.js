const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Patient books appointment
router.post('/', authMiddleware, authorize('patient'), appointmentController.bookAppointment);

// Patient appointments
router.get('/my', authMiddleware, authorize('patient'), appointmentController.getMyPatientAppointments);

// Doctor appointments
router.get('/doctor', authMiddleware, authorize('doctor'), appointmentController.getDoctorAppointments);

// Cancel appointment (patient or doctor or admin)
router.put('/:id/cancel', authMiddleware, appointmentController.cancelAppointment);

module.exports = router;
