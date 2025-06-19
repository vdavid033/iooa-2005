const express = require('express')
const router = express.Router()
const db = require('../db')
const isAdmin = require('../middlewares/isAdmin')

router.post('/reports', (req, res) => {
  const { ID_Objava, ID_Korisnika, razlog_prijave, opis_prijave } = req.body

  if (!ID_Objava || !ID_Korisnika || !razlog_prijave) {
    return res.status(400).json({ message: 'Nedostaju potrebni podaci' })
  }

  db.query(
    `INSERT INTO prijava (
      ID_Korisnika, 
      ID_Objava, 
      razlog_prijave, 
      opis_prijave, 
      datum_prijave
    ) VALUES (?, ?, ?, ?, NOW())`,
    [ID_Korisnika, ID_Objava, razlog_prijave, opis_prijave],
    (err) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ message: 'Greška pri slanju prijave' })
      }
      res.status(201).json({ message: 'Prijava je uspješno poslana' })
    }
  )
})

router.get('/admin/reports', isAdmin, (req, res) => {
  db.query(
    `SELECT 
      p.ID_Prijava,
      p.ID_Objava,
      p.razlog_prijave,
      p.opis_prijave,
      p.datum_prijave,
      k.korisnicko_ime
    FROM prijava p
    JOIN korisnik k ON p.ID_Korisnika = k.id_korisnika
    ORDER BY p.datum_prijave DESC`,
    (err, results) => {
      if (err) {
        console.error('SQL error:', err)
        return res.status(500).json({ message: 'Greška pri dohvaćanju prijava' })
      }
      res.json(results)
    }
  )
})

router.post('/admin/reports/:id/ignore', isAdmin, (req, res) => {
  const reportId = req.params.id
  db.query('DELETE FROM prijava WHERE ID_Prijava = ?', [reportId], (err) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ message: 'Greška pri ignoriranju prijave' })
    }
    res.json({ message: 'Prijava ignorirana' })
  })
})

router.post('/admin/reports/:id/delete-post', isAdmin, (req, res) => {
  const reportId = req.params.id

  db.query('SELECT ID_Objava FROM prijava WHERE ID_Prijava = ?', [reportId], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ message: 'Greška pri dohvaćanju prijave' })
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Prijava nije pronađena' })
    }

    const postId = results[0].ID_Objava

    db.query('DELETE FROM objava_tag WHERE fk_objava = ?', [postId], (err) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ message: 'Greška pri brisanju povezanih tagova' })
      }

      db.query('DELETE FROM objava WHERE ID_Objava = ?', [postId], (err) => {
        if (err) {
          console.error(err)
          return res.status(500).json({ message: 'Greška pri brisanju objave' })
        }

        db.query('DELETE FROM prijava WHERE ID_Objava = ?', [postId], (err) => {
          if (err) {
            console.error(err)
            return res.status(500).json({ message: 'Greška pri brisanju prijava' })
          }

          res.json({ message: 'Objava, tagovi i prijave su obrisani' })
        })
      })
    })
  })
})

module.exports = router
