import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.mjs';
import visitorRoutes from './routes/visitors.mjs';
import {Pool} from "pg";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use('/api/visitors', visitorRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, pool };