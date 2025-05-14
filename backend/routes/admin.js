import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: 'Jefino@1537',
  port: process.env.DB_PORT,
});

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch admin from database
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: admin.id, username: admin.username }, '8fef97441d63d12ebb057ad0d82fc5e2f87694ac133873ae4b1abe201c067a1b', {
      expiresIn: '1h',
    });

    res.json({ success: true, admin: { id: admin.id, username: admin.username }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get visitors (with pagination and search)
router.get('/visitors', async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const searchQuery = `%${search}%`;

  try {
    // Query to fetch visitors
    const query = `
      SELECT * FROM visitors
      WHERE full_name ILIKE $1 OR visitor_number ILIKE $1 OR apartment_number ILIKE $1
      ORDER BY in_time DESC
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) FROM visitors
      WHERE full_name ILIKE $1 OR visitor_number ILIKE $1 OR apartment_number ILIKE $1
    `;

    const [visitorsResult, countResult] = await Promise.all([
      pool.query(query, [searchQuery, limit, offset]),
      pool.query(countQuery, [searchQuery]),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: visitorsResult.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages },
    });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;