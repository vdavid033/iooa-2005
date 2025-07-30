const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const connection = require('../data/db')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "veleri.iooapp@gmail.com",
    pass: "uudnjsjeusfruaoi",
  },
})

async function notifyAdminNewUser(username, email) {
  const adminMailOptions = {
    from: '"Veleri APP" <veleri.iooapp@gmail.com>',
    to: 'tomislavhanzek1103@gmail.com',
    subject: `Novi korisnik se registrirao i čeka odobrenje: ${username}`,
    text: `Korisnik '${username}' (${email}) se registrirao i čeka odobrenje admina za aktivaciju računa.`,
  }
  try {
    await transporter.sendMail(adminMailOptions)
    console.log('Admin notified about new user registration awaiting approval')
  } catch (err) {
    console.error('Error sending notification email to admin:', err)
  }
}

async function notifyUserRegistrationWaitingApproval(username, userEmail) {
  const userMailOptions = {
    from: '"Veleri APP" <veleri.iooapp@gmail.com>',
    to: userEmail,
    subject: 'Registracija uspješna - čekate odobrenje administratora',
    text: `Poštovani/a ${username},\n\nHvala na registraciji! Vaš račun je uspješno kreiran i trenutno čeka odobrenje administratora prije nego što možete pristupiti sustavu.\n\nBit ćete obaviješteni e-mailom čim Vaš račun bude aktiviran.\n\nHvala na strpljenju i dobrodošli u VeleriSpace!`,
  }
  try {
    await transporter.sendMail(userMailOptions)
    console.log(`User notified about registration waiting approval: ${userEmail}`)
  } catch (err) {
    console.error('Error sending notification email to user:', err)
  }
}

router.post('/', async (req, res) => {
  const {
    ime,
    prezime,
    korisnicko_ime,
    lozinka,
    jmbag,
    email,
    telefon,
    adresa,
  } = req.body

  if (
    !ime || !prezime || !korisnicko_ime || !lozinka ||
    !jmbag || !email || !telefon || !adresa
  ) {
    return res.status(400).json({ error: true, message: 'Sva polja su obavezna.' })
  }

  if (!/^\d{10}$/.test(jmbag)) {
    return res.status(400).json({ error: true, message: 'JMBAG mora sadržavati točno 10 znamenki.' })
  }

  if (!/^\+385\d{8,9}$/.test(telefon)) {
    return res.status(400).json({ error: true, message: 'Telefon mora početi s +385 i imati 8 ili 9 znamenki nakon.' })
  }

  if (!/.+@.+\..+/.test(email)) {
    return res.status(400).json({ error: true, message: 'Neispravan format emaila.' })
  }

  try {
    const [existing] = await connection.query(
      'SELECT * FROM korisnik WHERE korisnicko_ime = ?',
      [korisnicko_ime]
    )
    if (existing.length > 0) {
      return res.status(409).json({ error: true, message: 'Korisničko ime već postoji.' })
    }

    const [existingEmail] = await connection.query(
      'SELECT * FROM korisnik WHERE email = ?',
      [email]
    )
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: true, message: 'Email već postoji.' })
    }

    const hashedPassword = await bcrypt.hash(lozinka, 10)

    await connection.query(
      `INSERT INTO korisnik (
          ime_korisnika, prezime_korisnika, korisnicko_ime, lozinka_korisnika,
          jmbag_korisnika, email, telefon, adresa, datum_kreiranja, zakljucan, admin_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), -1, 0)`,
      [ime, prezime, korisnicko_ime, hashedPassword, jmbag, email, telefon, adresa]
    )

    await Promise.all([
      notifyAdminNewUser(korisnicko_ime, email),
      notifyUserRegistrationWaitingApproval(korisnicko_ime, email)
    ])

    res.json({ error: false, message: 'Registracija uspješna. Vaš račun čeka odobrenje administratora.' })

  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ error: true, message: 'Greška na serveru.' })
  }
})

module.exports = router
