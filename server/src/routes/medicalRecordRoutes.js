const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Doctor creates record
router.post('/', authMiddleware, authorize('doctor'), medicalRecordController.createMedicalRecord);

// View patient history
router.get('/patient/:patientId', authMiddleware, medicalRecordController.getPatientHistory);
router.get('/my-history', authMiddleware, authorize('patient'), medicalRecordController.getPatientHistory);

// Single record details
router.get('/:id', authMiddleware, medicalRecordController.getRecordById);

module.exports = router;
