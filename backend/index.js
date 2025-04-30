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
app.get('/api/comments/:id_objava', (req, res) => {
    const id_objava = req.params.id_objava
  
    const sql = `
      SELECT * FROM komentar
      WHERE id_objava = ?
      ORDER BY datum_komentara DESC
    `
  
    db.query(sql, [id_objava], (err, results) => {
      if (err) {
        console.error('❌ Greška pri dohvaćanju komentara:', err)
        return res.status(500).json({ error: 'Greška u bazi.' })
      }
  
      res.status(200).json(results)
    })
  })
  

const PORT = 3000
app.listen(PORT, () => {
  console.log(`🚀 Backend radi na http://localhost:${PORT}`)
})
