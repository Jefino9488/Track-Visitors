// const express = require('express');
// const cors = require('cors');
// const { Pool } = require('pg');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.mjs';
import visitorRoutes from './routes/visitors.mjs';
import {Pool} from "pg";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'visitorapp',
  password: 'Jefino@1537',
  port: '5432',
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});
//
// // Import routes
// import visitorRoutes = require('./routes/visitors');
// const adminRoutes = require('./routes/admin');

// Use routes
app.use('/api/visitors', visitorRoutes);
app.use('/api/admin', adminRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, pool };