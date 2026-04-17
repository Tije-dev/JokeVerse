const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'JokeVerse',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

async function checkDatabaseConnection() {
  try {
    const connection = await getPool().getConnection();
    connection.release();
    console.log('Connected to the database');
    return true;
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
    return false;
  }
}

module.exports = { getPool, checkDatabaseConnection };
