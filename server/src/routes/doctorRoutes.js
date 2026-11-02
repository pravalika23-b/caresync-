const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Public endpoints
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Doctor-only update
router.put('/profile/update', authMiddleware, authorize('doctor'), doctorController.updateDoctorProfile);

module.exports = router;
