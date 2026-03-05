const express = require('express')
const router = express.Router()
const connection = require('../data/db')

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId
  try {
    const [rows] = await connection.query(
      'SELECT ID_Biljeska, naziv_biljeske, sadrzaj_biljeske, datum_biljeske, ID_korisnika FROM biljeske WHERE ID_korisnika = ? ORDER BY ID_Biljeska',
      [userId]
    )
    res.json({ error: false, notes: rows })
  } catch (err) {
    console.error('Failed to fetch notes:', err)
    res.status(500).json({ error: true, message: 'Greška na serveru prilikom dohvaćanja bilješki.' })
  }
})

router.post('/', async (req, res) => {
  const { naziv_biljeske, sadrzaj_biljeske, ID_korisnika } = req.body

  if (!naziv_biljeske || !sadrzaj_biljeske || !ID_korisnika) {
    return res.status(400).json({ error: true, message: 'Sva polja su obavezna.' })
  }
  if (typeof sadrzaj_biljeske !== 'string' || sadrzaj_biljeske.length === 0 || sadrzaj_biljeske.length > 500) {
    return res.status(400).json({ error: true, message: 'Sadržaj bilješke mora biti između 1 i 500 znakova.' })
  }

  try {
    const [countRows] = await connection.query('SELECT COUNT(*) as cnt FROM biljeske WHERE ID_korisnika = ?', [ID_korisnika])
    if (countRows.length && countRows[0].cnt >= 100) {
      return res.status(400).json({ error: true, message: 'Maksimalno 100 bilješki je dozvoljeno.' })
    }

    const now = new Date()
    const [result] = await connection.query(
      'INSERT INTO biljeske (naziv_biljeske, sadrzaj_biljeske, datum_biljeske, ID_korisnika) VALUES (?, ?, ?, ?)',
      [naziv_biljeske, sadrzaj_biljeske, now, ID_korisnika]
    )

    res.json({
      error: false,
      note: {
        ID_Biljeska: result.insertId,
        naziv_biljeske,
        sadrzaj_biljeske,
        datum_biljeske: now,
        ID_korisnika
      }
    })
  } catch (err) {
    console.error('Failed to insert note:', err)
    res.status(500).json({ error: true, message: 'Greška na serveru prilikom dodavanja bilješke.' })
  }
})

router.put('/:noteId', async (req, res) => {
  const noteId = req.params.noteId
  const { naziv_biljeske, sadrzaj_biljeske } = req.body

  if (!naziv_biljeske || typeof naziv_biljeske !== 'string' || naziv_biljeske.trim().length === 0 || naziv_biljeske.length > 100) {
    return res.status(400).json({ error: true, message: 'Naziv bilješke mora biti između 1 i 100 znakova.' })
  }

  if (!sadrzaj_biljeske || typeof sadrzaj_biljeske !== 'string' || sadrzaj_biljeske.trim().length === 0 || sadrzaj_biljeske.length > 500) {
    return res.status(400).json({ error: true, message: 'Sadržaj bilješke mora biti između 1 i 500 znakova.' })
  }

  try {
    const now = new Date()
    const [result] = await connection.query(
      'UPDATE biljeske SET naziv_biljeske = ?, sadrzaj_biljeske = ?, datum_biljeske = ? WHERE ID_Biljeska = ?',
      [naziv_biljeske.trim(), sadrzaj_biljeske.trim(), now, noteId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Bilješka nije pronađena.' })
    }
    res.json({
      error: false,
      message: 'Bilješka uspješno ažurirana.',
      datum_biljeske: now
    })
  } catch (err) {
    console.error('Failed to update note:', err)
    res.status(500).json({ error: true, message: 'Greška na serveru prilikom ažuriranja bilješke.' })
  }
})


router.delete('/:noteId', async (req, res) => {
  const noteId = req.params.noteId
  try {
    const [result] = await connection.query('DELETE FROM biljeske WHERE ID_Biljeska = ?', [noteId])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Bilješka nije pronađena.' })
    }
    res.json({ error: false, message: 'Bilješka uspješno obrisana.' })
  } catch (err) {
    console.error('Failed to delete note:', err)
    res.status(500).json({ error: true, message: 'Greška na serveru prilikom brisanja bilješke.' })
  }
})

module.exports = router
