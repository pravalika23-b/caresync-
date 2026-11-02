const express = require('express');
const router = express.Router();
const aiAssistantController = require('../controllers/aiAssistantController');
const { verifyToken } = require('../config/jwt');
const db = require('../config/db');

// Optional auth middleware so assistant can personalize if logged in
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const users = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.userId]);
      if (users.length > 0) {
        req.user = users[0];
        if (req.user.role === 'patient') {
          const pat = await db.query('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
          if (pat.length > 0) req.user.patientId = pat[0].id;
        }
      }
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
}

router.post('/chat', optionalAuth, aiAssistantController.handleChat);

module.exports = router;
