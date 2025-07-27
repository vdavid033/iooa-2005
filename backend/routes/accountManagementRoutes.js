const express = require('express');
const router = express.Router();
const connection = require('../data/db');
const bcrypt = require('bcrypt');

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
  }
  catch (err) {
    console.error('[Backend] error fetching users', err);
    res.status(500).json({ error: true, message: 'Greška na serveru.' });
  }
});

// PUT toggle lock
router.put('/:id/lock', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  let { lock } = req.body;

  // normalize to 0 or 1
  const normalized = (lock === true || lock === 'true' || lock === 1 || lock === '1')
    ? 1
    : (lock === false || lock === 'false' || lock === 0 || lock === '0')
      ? 0
      : null;

  if (normalized === null) {
    return res.status(400).json({ error: true, message: 'Neispravan parametar lock.' });
  }

  try {
    const [result] = await connection.query(
      'UPDATE korisnik SET zakljucan = ? WHERE id_korisnika = ?',
      [normalized, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' });
    }
    res.json({
      error: false,
      message: `Korisnik je uspješno ${normalized === 1 ? 'zaključan' : 'otključan'}.`
    });
  }
  catch (err) {
    console.error('[Backend] error updating lock', err);
    res.status(500).json({ error: true, message: 'Greška na serveru.' });
  }
});

// PUT reset user password to "123456"
router.put('/:id/resetPassword', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    // hash lozinke "123456"
    const newHash = await bcrypt.hash('123456', 10);
    const [result] = await connection.query(
      'UPDATE korisnik SET lozinka_korisnika = ? WHERE id_korisnika = ?',
      [newHash, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Korisnik nije pronađen.' });
    }
    res.json({ error: false, message: 'Lozinka korisnika je uspješno resetirana na 123456.' });
  } catch (err) {
    console.error('[Backend] reset password error', err);
    res.status(500).json({ error: true, message: 'Greška na serveru.' });
  }
});

module.exports = router;
