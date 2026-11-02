const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Protect all admin routes
router.use(authMiddleware, authorize('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/doctors', adminController.getAdminDoctors);
router.post('/doctors', adminController.createDoctor);
router.put('/doctors/:id/status', adminController.toggleDoctorStatus);

router.get('/patients', adminController.getAdminPatients);

router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

router.get('/appointments', adminController.getAllAppointments);

module.exports = router;
