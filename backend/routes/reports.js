const express = require('express')
const router = express.Router()
const db = require('../db') 

router.post('/reports', async (req, res) => {
  const { ID_Objava, ID_Korisnika, razlog_prijave, opis_prijave } = req.body

  if (!ID_Objava || !ID_Korisnika || !razlog_prijave) {
    return res.status(400).json({ message: 'Nedostaju potrebni podaci' })
  }

  try {
    await db.query(
      'INSERT INTO prijava (ID_Korisnika, ID_Objava, razlog_prijave, opis_prijave, datum_prijave) VALUES (?, ?, ?, ?, NOW())',
      [ID_Korisnika, ID_Objava, razlog_prijave, opis_prijave]
    )
    res.status(201).json({ message: 'Prijava je uspješno poslana' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Greška pri slanju prijave' })
  }
})

module.exports = router
