const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const connection = require('../data/db') // path to your MySQL connection

router.post('/', async (req, res) => {
  const { ime, prezime, korisnicko_ime, lozinka, jmbag, email, telefon, adresa } = req.body

  // Validate all mandatory fields
  if (
    !ime ||
    !prezime ||
    !korisnicko_ime ||
    !lozinka ||
    !jmbag ||
    !email ||
    !telefon ||
    !adresa
  ) {
    return res.status(400).json({ error: true, message: 'Sva polja su obavezna.' })
  }

  try {
    // Check if korisnicko_ime already exists
    const [existing] = await connection.query(
      'SELECT * FROM korisnik WHERE korisnicko_ime = ?',
      [korisnicko_ime]
    )
    if (existing.length > 0) {
      return res.status(409).json({ error: true, message: 'Korisničko ime već postoji.' })
    }

    // Optionally check if email exists (if needed)
    const [existingEmail] = await connection.query(
      'SELECT * FROM korisnik WHERE email = ?',
      [email]
    )
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: true, message: 'Email već postoji.' })
    }

    const hashedPassword = await bcrypt.hash(lozinka, 10)

    // Insert user with additional fields and default values
    await connection.query(
      `INSERT INTO korisnik (
        ime_korisnika, prezime_korisnika, korisnicko_ime, lozinka_korisnika,
        jmbag_korisnika, email, telefon, adresa, datum_kreiranja, zakljucan, admin_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1, 0)`,
      [ime, prezime, korisnicko_ime, hashedPassword, jmbag, email, telefon, adresa]
    )

    res.json({ error: false, message: 'Korisnik uspješno registriran.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: 'Greška na serveru.' })
  }
})

module.exports = router
