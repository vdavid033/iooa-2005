const express = require('express')
const router = express.Router()
const connection = require('../data/db')
const uploadPicture = require('../middlewares/uploadPicture')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')

router.get('/:id', async (req, res) => {
  const userId = req.params.id
  try {
    const [rows] = await connection.query('SELECT * FROM korisnik WHERE id_korisnika = ?', [userId])
    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' })
    }
    res.json({ error: false, user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: 'Greška na serveru.' })
  }
})

router.put('/:id', uploadPicture.single('slika_url'), async (req, res) => {
  const userId = req.params.id
  const { ime, prezime, korisnicko_ime, jmbag, email, telefon, adresa } = req.body

  if (!ime || !prezime || !korisnicko_ime || !jmbag || !email || !telefon || !adresa) {
    return res.status(400).json({ error: true, message: 'Sva polja su obavezna.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: true, message: 'Neispravan format emaila.' })
  }

  try {
    const [existingUser] = await connection.query(
      'SELECT * FROM korisnik WHERE korisnicko_ime = ? AND id_korisnika != ?',
      [korisnicko_ime, userId]
    )
    if (existingUser.length > 0) {
      return res.status(409).json({ error: true, message: 'Korisničko ime već postoji.' })
    }

    const [existingEmail] = await connection.query(
      'SELECT * FROM korisnik WHERE email = ? AND id_korisnika != ?',
      [email, userId]
    )
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: true, message: 'Email već postoji.' })
    }

    let updateQuery = `
      UPDATE korisnik SET ime_korisnika = ?, prezime_korisnika = ?, korisnicko_ime = ?,
      jmbag_korisnika = ?, email = ?, telefon = ?, adresa = ?
    `
    const params = [ime, prezime, korisnicko_ime, jmbag, email, telefon, adresa]

    if (req.file) {
      updateQuery += ', slika_url = ?'
      params.push(`/uploads/${req.file.filename}`)
    }
    updateQuery += ' WHERE id_korisnika = ?'
    params.push(userId)

    await connection.query(updateQuery, params)

    res.json({
      error: false,
      message: 'Podaci uspješno ažurirani.',
      profile_photo_url: req.file ? `/uploads/${req.file.filename}` : undefined
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: 'Greška na serveru.' })
  }
})

router.delete('/:id/photo', async (req, res) => {
  const userId = req.params.id
  try {
    const [rows] = await connection.query('SELECT slika_url FROM korisnik WHERE id_korisnika = ?', [userId])
    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' })
    }
    const photoPath = rows[0].slika_url
    if (photoPath) {
      const fullPath = path.join(__dirname, '../', photoPath)
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error('Error deleting profile picture:', err)
        }
      })
    }
    await connection.query('UPDATE korisnik SET slika_url = NULL WHERE id_korisnika = ?', [userId])
    res.json({ error: false, message: 'Profilna slika uspješno obrisana.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: 'Greška na serveru.' })
  }
})

router.put('/:id/changePassword', async (req, res) => {
  const userId = req.params.id
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: true, message: 'Obje lozinke su potrebne.' })
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: true, message: 'Nova lozinka mora imati najmanje 6 znakova.' })
  }

  try {
    const [rows] = await connection.query('SELECT lozinka_korisnika FROM korisnik WHERE id_korisnika = ?', [userId])
    if (rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' })
    }
    const currentHashedPassword = rows[0].lozinka_korisnika
    const match = await bcrypt.compare(oldPassword, currentHashedPassword)
    if (!match) {
      return res.status(401).json({ error: true, message: 'Stara lozinka nije ispravna.' })
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    await connection.query('UPDATE korisnik SET lozinka_korisnika = ? WHERE id_korisnika = ?', [newHashedPassword, userId])
    res.json({ error: false, message: 'Lozinka uspješno promijenjena.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: 'Greška na serveru.' })
  }
})

module.exports = router
