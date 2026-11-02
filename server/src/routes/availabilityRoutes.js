const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Public slot checking endpoint
router.get('/slots', availabilityController.getAvailableSlots);

// Doctor endpoints
router.get('/my', authMiddleware, authorize('doctor'), availabilityController.getMyAvailability);
router.post('/schedule', authMiddleware, authorize('doctor'), availabilityController.updateDayAvailability);
router.post('/blocked-dates', authMiddleware, authorize('doctor'), availabilityController.addBlockedDate);
router.delete('/blocked-dates/:id', authMiddleware, authorize('doctor'), availabilityController.removeBlockedDate);

module.exports = router;
