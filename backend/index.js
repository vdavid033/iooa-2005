// API
const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())


const db = mysql.createConnection({
  host: 'student.veleri.hr',
  user: 'iooa',      
  password: '11',  
  database: 'iooa_dm_veleri'      
})


db.connect(err => {
  if (err) {
    console.error('❌ Greška pri spajanju na bazu:', err)
  } else {
    console.log('✅ Spojeno na MySQL bazu!')
  }
})


app.post('/api/comments', (req, res) => {
  const { id_objava, id_korisnika, sadrzaj_komentara } = req.body

  if (!id_objava || !id_korisnika || !sadrzaj_komentara) {
    return res.status(400).json({ error: 'Nedostaju podaci.' })
  }

  const sql = `
    INSERT INTO komentar (id_objava, id_korisnika, sadrzaj_komentara, datum_komentara)
    VALUES (?, ?, ?, NOW())
  `
  db.query(sql, [id_objava, id_korisnika, sadrzaj_komentara], (err, result) => {
    if (err) {
      console.error('❌ Greška pri unosu komentara:', err)
      return res.status(500).json({ error: 'Greška pri unosu komentara.' })
    }
    res.status(201).json({ message: 'Komentar spremljen!', id_komentar: result.insertId })
  })
})


const PORT = 3000
app.listen(PORT, () => {
  console.log(`🚀 Backend radi na http://localhost:${PORT}`)
})
