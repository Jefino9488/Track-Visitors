const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'visitorapp',
  password: 'Jefino@1537',
  port: '5432',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};