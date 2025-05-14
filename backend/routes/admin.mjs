import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'visitorapp',
  password: 'Jefino@1537',
  port: '5432',
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

    // Simple password matching (no encryption)
    if (password !== admin.password) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // No JWT, just return admin data and a simple token
    const simpleToken = `${admin.id}_${Date.now()}`;

    res.json({ success: true, admin: { id: admin.id, username: admin.username }, token: simpleToken });
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
