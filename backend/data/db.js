// Uvoz mysql2 modula
/*const mysql = require('mysql2');

// Kreiranje MySQL veze pomoću mysql2 modula
const pool = mysql.createPool({
  host: 'student.veleri.hr',     
  port: 3306,                     
  user: 'iooa',   
  password: '11',      
  database: 'iooa_dm_veleri',      
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exportamo promise-based verziju konekcije radi lakšeg korištenja s async/await
const db = pool.promise();*/

//module.exports = db;
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
    host: 'student.veleri.hr',
    user: 'iooa',
    password: '11',
    database: 'iooa_dm_veleri',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

module.exports = pool
