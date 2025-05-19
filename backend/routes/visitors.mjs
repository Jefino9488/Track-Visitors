import express from 'express';
import {pool} from "../server.mjs";

const router = express.Router();

const generateVisitorNumber = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const calculateExpectedOutTime = (inTime, duration) => {
  const inDate = new Date(inTime);
  switch (duration) {
    case '30 minutes':
      return new Date(inDate.getTime() + 30 * 60 * 1000);
    case '1 hour':
      return new Date(inDate.getTime() + 60 * 60 * 1000);
    case '2 hours':
      return new Date(inDate.getTime() + 2 * 60 * 60 * 1000);
    case '3 hours':
      return new Date(inDate.getTime() + 3 * 60 * 60 * 1000);
    case '4 hours':
      return new Date(inDate.getTime() + 4 * 60 * 60 * 1000);
    case '1 day':
      return new Date(inDate.getTime() + 24 * 60 * 60 * 1000);
    default:
      return inDate;
  }
};

router.post('/sign-in', async (req, res) => {
  const { fullName, apartmentNumber, vehicleInfo, purpose, visitDuration } = req.body;

  try {
    const visitorNumber = generateVisitorNumber();
    const inTime = new Date();
    const expectedOutTime = calculateExpectedOutTime(inTime, visitDuration);

    const query = `
      INSERT INTO visitors (
        visitor_number, full_name, apartment_number, vehicle_info, purpose,
        visit_duration, in_time, expected_out_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      visitorNumber,
      fullName,
      apartmentNumber,
      vehicleInfo || null,
      purpose,
      visitDuration,
      inTime,
      expectedOutTime,
    ];

    const result = await pool.query(query, values);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ success: false, message: 'Failed to sign in' });
  }
});

router.post('/sign-out', async (req, res) => {
  const { visitorNumber } = req.body;

  try {
    const query = `
      UPDATE visitors
      SET actual_out_time = $1
      WHERE visitor_number = $2 AND actual_out_time IS NULL
      RETURNING *
    `;
    const values = [new Date(), visitorNumber];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Visitor not found or already signed out' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Sign-out error:', error);
    res.status(500).json({ success: false, message: 'Failed to sign out' });
  }
});

export default router;