const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { signToken } = require('../config/jwt');

async function register(req, res) {
  try {
    const { name, email, password, phone, dateOfBirth, gender, address, emergencyContact, bloodGroup } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // 2. Check if email already exists
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create User & Patient profile atomically
    const result = await db.transaction(async (tx) => {
      const userRes = await tx.query(
        'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), passwordHash, 'patient', phone || null]
      );
      const userId = userRes.insertId;

      const patRes = await tx.query(
        `INSERT INTO patients (user_id, date_of_birth, gender, address, emergency_contact, blood_group)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, dateOfBirth || null, gender || 'Other', address || null, emergencyContact || null, bloodGroup || null]
      );

      return { userId, patientId: patRes.insertId };
    });

    const token = signToken({ userId: result.userId, role: 'patient' });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to CareSync.',
      token,
      user: {
        id: result.userId,
        patientId: result.patientId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: 'patient',
        phone: phone || null,
        bloodGroup: bloodGroup || null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again later.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // 1. Fetch user by email
    const users = await db.query(
      'SELECT id, name, email, password_hash, role, phone FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // 2. Compare bcrypt password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 3. Attach role-specific metadata
    let patientId = null;
    let doctorId = null;
    let extraData = {};

    if (user.role === 'patient') {
      const pat = await db.query('SELECT id, date_of_birth, gender, blood_group FROM patients WHERE user_id = ?', [user.id]);
      if (pat.length > 0) {
        patientId = pat[0].id;
        extraData = { dateOfBirth: pat[0].date_of_birth, gender: pat[0].gender, bloodGroup: pat[0].blood_group };
      }
    } else if (user.role === 'doctor') {
      const doc = await db.query(
        `SELECT d.id, d.department_id, dep.name as department_name, d.specialization, d.is_active 
         FROM doctors d
         JOIN departments dep ON d.department_id = dep.id
         WHERE d.user_id = ?`,
        [user.id]
      );
      if (doc.length > 0) {
        if (!doc[0].is_active) {
          return res.status(403).json({ success: false, message: 'Your doctor account is currently inactive. Please contact administration.' });
        }
        doctorId = doc[0].id;
        extraData = {
          departmentId: doc[0].department_id,
          departmentName: doc[0].department_name,
          specialization: doc[0].specialization
        };
      }
    }

    const token = signToken({ userId: user.id, role: user.role });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        patientId,
        doctorId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...extraData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again later.' });
  }
}

async function getMe(req, res) {
  try {
    const user = req.user;
    let profileData = {};

    if (user.role === 'patient') {
      const pat = await db.query('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      if (pat.length > 0) profileData = pat[0];
    } else if (user.role === 'doctor') {
      const doc = await db.query(
        `SELECT d.*, dep.name as department_name 
         FROM doctors d
         JOIN departments dep ON d.department_id = dep.id
         WHERE d.user_id = ?`,
        [user.id]
      );
      if (doc.length > 0) profileData = doc[0];
    }

    res.json({
      success: true,
      user: {
        ...user,
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, dateOfBirth, gender, address, emergencyContact, bloodGroup } = req.body;

    if (name) {
      await db.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name.trim(), phone || null, userId]);
    }

    if (req.user.role === 'patient') {
      await db.query(
        `UPDATE patients 
         SET date_of_birth = ?, gender = ?, address = ?, emergency_contact = ?, blood_group = ?
         WHERE user_id = ?`,
        [dateOfBirth || null, gender || null, address || null, emergencyContact || null, bloodGroup || null, userId]
      );
    }

    res.json({ success: true, message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
