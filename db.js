const sql = require('mssql');
require('dotenv').config();

const config = {
  server:   process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     1434,
  options: {
    trustServerCertificate: true,
    encrypt:                false,
    enableArithAbort:       true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('Error en SQL Server:', err);
});

module.exports = { pool, poolConnect, sql };