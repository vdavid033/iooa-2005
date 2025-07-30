const express = require('express');
const router = express.Router();
const connection = require('../data/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "veleri.iooapp@gmail.com",
    pass: "uudnjsjeusfruaoi",
  },
});

// Function to generate secure random password
function generateRandomPassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  let password = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

// Helper to send lock status email
async function sendLockStatusEmail(toEmail, username, fromStatus, toStatus) {
  let subject, text;

  if (fromStatus === -1 && toStatus === 0) {
    subject = 'Obavijest: Vaš račun je odobren';
    text = `Poštovani/a ${username},\n\nVaš zahtjev za registraciju je odobren. Možete koristiti svoj račun.`;
  } else if (fromStatus === 0 && toStatus === 1) {
    subject = 'Obavijest: Vaš račun je zaključan';
    text = `Poštovani/a ${username},\n\nVaš korisnički račun je zaključan. Molimo obratite se administratoru za dodatne informacije.`;
  } else if (fromStatus === 1 && toStatus === 0) {
    subject = 'Obavijest: Vaš račun je otključan';
    text = `Poštovani/a ${username},\n\nVaš korisnički račun je sada otključan. Možete se prijaviti kao i obično.`;
  } else {
    return;
  }

  const mailOptions = {
    from: '"Veleri APP" <veleri.iooapp@gmail.com>',
    to: toEmail,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
}

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await connection.query(`
      SELECT 
        id_korisnika,
        ime_korisnika,
        prezime_korisnika,
        korisnicko_ime,
        jmbag_korisnika,
        email,
        telefon,
        adresa,
        datum_kreiranja,
        zakljucan,
        admin_status
      FROM korisnik
    `);
    res.json({ error: false, users: rows });
  } catch (err) {
    console.error('[Backend] error fetching users', err);
    res.status(500).json({ error: true, message: 'Greška na serveru.' });
  }
});

// PUT toggle lock
// PUT toggle lock
router.put('/:id/lock', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { lock } = req.body;

  const normalized = (lock === true || lock === 'true' || lock === 1 || lock === '1')
    ? 1
    : (lock === false || lock === 'false' || lock === 0 || lock === '0')
      ? 0
      : null;

  if (normalized === null) {
    return res.status(400).json({ error: true, message: 'Neispravan parametar lock.' });
  }

  try {
    // Get current user info
    const [users] = await connection.query(
      'SELECT korisnicko_ime, email, zakljucan FROM korisnik WHERE id_korisnika = ?',
      [userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' });
    }
    const user = users[0];
    const previousStatus = user.zakljucan;

    // Build update query and params
    let updateQuery = 'UPDATE korisnik SET zakljucan = ?';
    const params = [normalized];

    // If unlocking, reset neuspjelih_pokusaja to 0
    if (normalized === 0) {
      updateQuery += ', neuspjeli_pokusaji = 0';
    }

    updateQuery += ' WHERE id_korisnika = ?';
    params.push(userId);

    // Execute update
    const [result] = await connection.query(updateQuery, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' });
    }

    // Send notification email only if status changed
    if (previousStatus !== normalized) {
      sendLockStatusEmail(user.email, user.korisnicko_ime, previousStatus, normalized)
        .then(() => console.log(`Email sent to ${user.email} about lock status change from ${previousStatus} to ${normalized}`))
        .catch(err => console.error('Error sending lock status email:', err));
    }

    res.json({
      error: false,
      message: `Korisnik je uspješno ${normalized === 1 ? 'zaključan' : 'otključan'}.`,
    });
  } catch (err) {
    console.error('[Backend] error updating lock', err);
    res.status(500).json({ error: true, message: 'Greška na serveru.' });
  }
});

// PUT reset password with secure random password and email notification
router.put('/:id/resetPassword', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    const [users] = await connection.query('SELECT korisnicko_ime, email FROM korisnik WHERE id_korisnika = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' });
    }
    const user = users[0];

    const newPassword = generateRandomPassword(16);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await connection.query('UPDATE korisnik SET lozinka_korisnika = ? WHERE id_korisnika = ?', [hashedPassword, userId]);

    const mailOptions = {
      from: '"Veleri APP" <veleri.iooapp@gmail.com>',
      to: user.email,
      subject: 'Reset lozinke - Vaša nova lozinka',
      text: `Poštovani/a ${user.korisnicko_ime},

Vaša lozinka je resetirana. Vaša nova lozinka je:

${newPassword}

Molimo Vas da se što prije prijavite i promijenite svoju lozinku.

Ako niste zahtijevali ovaj reset, molimo kontaktirajte podršku.

Srdačan pozdrav,
VeleriSpace tim`
    };

    await transporter.sendMail(mailOptions);
    res.json({ error: false, message: 'Lozinka korisnika je uspješno resetirana i nova lozinka je poslana na email.' });
  } catch (err) {
    console.error('[Backend] reset password error', err);
    res.status(500).json({ error: true, message: 'Greška na serveru prilikom resetiranja lozinke.' });
  }
});

module.exports = router;
