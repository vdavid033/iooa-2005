const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const connection = require('../data/db') // putanja do tvoje MySQL konekcije

router.post('/', async (req, res) => {
  const { ime, prezime, korisnicko_ime, lozinka, jmbag } = req.body

  if (!ime || !prezime || !korisnicko_ime || !lozinka || !jmbag) {
    return res.status(400).json({ error: true, message: 'Sva polja su obavezna.' })
  }

  try {
    const [existing] = await connection.query(
      'SELECT * FROM korisnik WHERE korisnicko_ime = ?',
      [korisnicko_ime]
    )
    if (existing.length > 0) {
      return res.status(409).json({ error: true, message: 'Korisničko ime već postoji.' })
    }

    const hashedPassword = await bcrypt.hash(lozinka, 10)
    await connection.query(
      `INSERT INTO korisnik (ime_korisnika, prezime_korisnika, korisnicko_ime, lozinka_korisnika, jmbag_korisnika, admin_status)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [ime, prezime, korisnicko_ime, hashedPassword, jmbag]
    )

    res.json({ error: false, message: 'Korisnik uspješno registriran.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: 'Greška na serveru.' })
  }
})

module.exports = router