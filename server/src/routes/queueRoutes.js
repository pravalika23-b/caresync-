const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Patient check-in
router.post('/checkin/:id', authMiddleware, queueController.checkIn);

// Patient queue status
router.get('/patient/:id', authMiddleware, queueController.getPatientQueue);

// Doctor queue console
router.get('/doctor/board', authMiddleware, authorize('doctor'), queueController.getDoctorQueue);
router.post('/doctor/call-next', authMiddleware, authorize('doctor'), queueController.callNextPatient);
router.post('/doctor/status', authMiddleware, authorize('doctor'), queueController.updateQueueStatus);

module.exports = router;
