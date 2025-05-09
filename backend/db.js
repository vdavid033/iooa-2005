
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'student.veleri.hr',      
  user: 'iooa',      
  password: '11',
  database: 'iooa_dm_veleri',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();