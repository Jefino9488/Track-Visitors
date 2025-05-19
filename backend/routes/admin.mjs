import express from 'express';
import {pool} from "../server.mjs";
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (password !== admin.password) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const simpleToken = `${admin.id}_${Date.now()}`;

    res.json({ success: true, admin: { id: admin.id, username: admin.username }, token: simpleToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/visitors', async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const searchQuery = `%${search}%`;

  try {
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

router.get('/export/excel', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitors ORDER BY in_time DESC');
    const visitors = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Visitors');

    worksheet.columns = [
      { header: 'Visitor #', key: 'visitor_number', width: 15 },
      { header: 'Name', key: 'full_name', width: 25 },
      { header: 'Apartment', key: 'apartment_number', width: 15 },
      { header: 'Vehicle', key: 'vehicle_info', width: 20 },
      { header: 'Purpose', key: 'purpose', width: 25 },
      { header: 'Visit Duration', key: 'visit_duration', width: 15 },
      { header: 'In Time', key: 'in_time', width: 20 },
      { header: 'Expected Out Time', key: 'expected_out_time', width: 20 },
      { header: 'Actual Out Time', key: 'actual_out_time', width: 20 }
    ];

    visitors.forEach(visitor => {
      worksheet.addRow({
        visitor_number: visitor.visitor_number,
        full_name: visitor.full_name,
        apartment_number: visitor.apartment_number,
        vehicle_info: visitor.vehicle_info || 'N/A',
        purpose: visitor.purpose,
        visit_duration: visitor.visit_duration,
        in_time: visitor.in_time ? new Date(visitor.in_time).toLocaleString() : 'N/A',
        expected_out_time: visitor.expected_out_time ? new Date(visitor.expected_out_time).toLocaleString() : 'N/A',
        actual_out_time: visitor.actual_out_time ? new Date(visitor.actual_out_time).toLocaleString() : 'N/A'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=visitors.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
});

router.get('/export/pdf', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitors ORDER BY in_time DESC');
    const visitors = result.rows;

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=visitors.pdf');

    doc.pipe(res);

    // Add title
    doc.fontSize(16).text('Visitors Report', { align: 'center' });
    doc.moveDown();

    // Define table layout
    const tableTop = 100;
    const colWidths = [60, 100, 60, 80, 100, 60, 80, 80, 80];
    const colHeaders = ['Visitor #', 'Name', 'Apartment', 'Vehicle', 'Purpose', 'Duration', 'In Time', 'Expected Out', 'Actual Out'];

    // Draw headers
    doc.fontSize(10);
    let xPos = 30;
    colHeaders.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });

    // Draw rows
    let yPos = tableTop + 20;
    visitors.forEach((visitor, index) => {
      // Add page break if needed
      if (yPos > 500) {
        doc.addPage();
        yPos = 50;

        // Redraw headers on new page
        xPos = 30;
        colHeaders.forEach((header, i) => {
          doc.text(header, xPos, yPos, { width: colWidths[i], align: 'left' });
          xPos += colWidths[i];
        });
        yPos += 20;
      }

      // Draw row data
      xPos = 30;
      const rowData = [
        visitor.visitor_number,
        visitor.full_name,
        visitor.apartment_number,
        visitor.vehicle_info || 'N/A',
        visitor.purpose,
        visitor.visit_duration,
        visitor.in_time ? new Date(visitor.in_time).toLocaleString() : 'N/A',
        visitor.expected_out_time ? new Date(visitor.expected_out_time).toLocaleString() : 'N/A',
        visitor.actual_out_time ? new Date(visitor.actual_out_time).toLocaleString() : 'N/A'
      ];

      rowData.forEach((cell, i) => {
        doc.text(cell, xPos, yPos, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });

      yPos += 20;
    });

    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
});

router.post('/send-excel-email', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitors ORDER BY in_time DESC');
    const visitors = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Visitors');

    worksheet.columns = [
      { header: 'Visitor', key: 'visitor_number', width: 15 },
      { header: 'Name', key: 'full_name', width: 25 },
      { header: 'Apartment', key: 'apartment_number', width: 15 },
      { header: 'Vehicle', key: 'vehicle_info', width: 20 },
      { header: 'Purpose', key: 'purpose', width: 25 },
      { header: 'Visit Duration', key: 'visit_duration', width: 15 },
      { header: 'In Time', key: 'in_time', width: 20 },
      { header: 'Expected Out Time', key: 'expected_out_time', width: 20 },
      { header: 'Actual Out Time', key: 'actual_out_time', width: 20 }
    ];

    visitors.forEach(visitor => {
      worksheet.addRow({
        visitor_number: visitor.visitor_number,
        full_name: visitor.full_name,
        apartment_number: visitor.apartment_number,
        vehicle_info: visitor.vehicle_info || 'N/A',
        purpose: visitor.purpose,
        visit_duration: visitor.visit_duration,
        in_time: visitor.in_time ? new Date(visitor.in_time).toLocaleString() : 'N/A',
        expected_out_time: visitor.expected_out_time ? new Date(visitor.expected_out_time).toLocaleString() : 'N/A',
        actual_out_time: visitor.actual_out_time ? new Date(visitor.actual_out_time).toLocaleString() : 'N/A'
      });
    });

    // Save Excel file temporarily
    const filePath = path.join(__dirname, 'visitors.xlsx');
    await workbook.xlsx.writeFile(filePath);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jefinojacob9488@gmail.com",
        pass: "ozwpvfttfuhulzqb",
      },
    });

    // Email options
    const mailOptions = {
      from: 'jefinojacob9488@mail.com',
      to: 'jefinojacob1537@mail.com',
      subject: 'Visitors Report',
      text: 'The visitors report.',
      attachments: [
        {
          filename: 'visitors.xlsx',
          path: filePath
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

router.delete('/visitors/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM visitors WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.json({ success: true, message: 'Visitor deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({ success: false, message: 'Failed to delete visitor' });
  }
});

export default router;
