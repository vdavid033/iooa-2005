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

app.post('/api/objave', (req, res) => {
  const { naslov, sadrzaj, datum, fk_korisnik, fk_kategorija, tagovi } = req.body

  if (!naslov || !sadrzaj || !datum || !fk_korisnik) {
    return res.status(400).json({ error: 'Nedostaju potrebni podaci za objavu.' })
  }

  const sqlObjava = `
    INSERT INTO objava (naslov_objave, sadrzaj_objave, datum_objave, fk_korisnik, fk_kategorija)
    VALUES (?, ?, ?, ?, ?)
  `

  db.query(sqlObjava, [naslov, sadrzaj, datum, fk_korisnik, fk_kategorija], (err, result) => {
    if (err) {
      console.error('❌ Greška pri spremanju objave:', err)
      return res.status(500).json({ error: 'Greška pri unosu objave.' })
    }

    const id_objava = result.insertId

    if (Array.isArray(tagovi) && tagovi.length > 0) {
      const tagSql = `
        INSERT INTO objava_tag (fk_objava, fk_tag)
        VALUES ?
      `
      const tagVrijednosti = tagovi.map(tagId => [id_objava, tagId])

      db.query(tagSql, [tagVrijednosti], (tagErr) => {
        if (tagErr) {
          console.error('❌ Greška pri spremanju tagova:', tagErr)
          return res.status(500).json({ error: 'Objava spremljena, ali tagovi nisu.' })
        }

        res.status(201).json({ message: 'Objava i tagovi spremljeni!', id_objava })
      })
    } else {
      res.status(201).json({ message: 'Objava spremljena bez tagova.', id_objava })
    }
  })
})

app.get('/api/objave', (req, res) => {
  const sql = `
    SELECT 
      o.id_objava AS id,
      o.naslov_objave AS title,
      LEFT(o.sadrzaj_objave, 200) AS preview,
      o.datum_objave AS date,
      k.korisnicko_ime AS author,
      kf.ime_kategorija_forum AS category,
      o.id_objava
    FROM objava o
    LEFT JOIN korisnik k ON o.fk_korisnik = k.id_korisnika
    LEFT JOIN kategorija_forum kf ON o.fk_kategorija = kf.id_kategorija_forum
    ORDER BY o.datum_objave DESC
  `

  db.query(sql, async (err, results) => {
    if (err) {
      console.error('❌ Greška pri dohvaćanju objava:', err)
      return res.status(500).json({ error: 'Greška pri dohvaćanju objava.' })
    }

    const postIds = results.map(r => r.id)
    if (postIds.length === 0) return res.json([])

    const tagSql = `
      SELECT ot.fk_objava, t.naziv_tag
      FROM objava_tag ot
      JOIN tag t ON ot.fk_tag = t.id_tag
      WHERE ot.fk_objava IN (?)
    `
    db.query(tagSql, [postIds], (tagErr, tagResults) => {
      if (tagErr) {
        console.error('❌ Greška pri dohvaćanju tagova za objave:', tagErr)
        return res.status(500).json({ error: 'Greška pri dohvaćanju tagova.' })
      }

      const tagMap = {}
      tagResults.forEach(({ fk_objava, naziv_tag }) => {
        if (!tagMap[fk_objava]) tagMap[fk_objava] = []
        tagMap[fk_objava].push(naziv_tag)
      })

      const finalResults = results.map(post => ({
        ...post,
        tags: tagMap[post.id] || [],
        comments: 0 
      }))

      res.json(finalResults)
    })
  })
})

app.get('/api/kategorije', (req, res) => {
  const sql = `
    SELECT id_kategorija_forum AS value, ime_kategorija_forum AS label
    FROM kategorija_forum
    ORDER BY label ASC
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Greška pri dohvaćanju kategorija:', err)
      return res.status(500).json({ error: 'Greška pri dohvaćanju kategorija.' })
    }

    res.status(200).json(results)
  })
})

app.get('/api/tagovi', (req, res) => {
  db.query('SELECT id_tag AS value, naziv_tag AS label FROM tag', (err, results) => {
    if (err) return res.status(500).json({ error: 'Greška u bazi' })
    res.status(200).json(results)
  })
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
