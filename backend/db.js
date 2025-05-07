const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'student.veleri.hr',
  user: 'iooa',
  password: '11',
  database: 'iooa_dm_veleri'
});

db.connect(err => {
  if (err) {
    console.error('Greška kod spajanja na bazu:', err);
  } else {
    console.log('Spojeno na MySQL bazu!');
  }
});

module.exports = db;
