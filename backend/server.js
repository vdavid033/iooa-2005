// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

// Omogućava komunikaciju između frontenda i backend-a
app.use(cors());
app.use(bodyParser.json());

//  Dohvaćanje svih korisnika (osim trenutnog)
app.get('/api/korisnici/:trenutniKorisnikId', async (req, res) => {
  try {
    const [korisnici] = await db.query(
      'SELECT id_korisnika, ime_korisnika, prezime_korisnika FROM korisnik WHERE id_korisnika != ?',
      [req.params.trenutniKorisnikId]
    );
    res.json(korisnici);
  } catch (err) {
    res.status(500).json({ error: "Greška pri dohvaćanju korisnika!" });
  }
});

// Dohvaćanje poruka između dva korisnika
app.get('/api/poruke/:korisnik1/:korisnik2', async (req, res) => {
  try {
    const [poruke] = await db.query(
      `SELECT * FROM poruke 
       WHERE (posiljatelj = ? AND primatelj = ?) 
       OR (posiljatelj = ? AND primatelj = ?)
       ORDER BY datum_vrijeme ASC`,
      [req.params.korisnik1, req.params.korisnik2, req.params.korisnik2, req.params.korisnik1]
    );
    res.json(poruke);
  } catch (err) {
    res.status(500).json({ error: "Greška pri dohvaćanju poruka!" });
  }
});

// ✅ 3. Slanje nove poruke
app.post('/api/poruke', async (req, res) => {
  try {
    const { sadrzaj, posiljatelj, primatelj } = req.body;
    const [result] = await db.query(
      'INSERT INTO poruke (sadrzaj, posiljatelj, primatelj, datum_vrijeme) VALUES (?, ?, ?, NOW())',
      [sadrzaj, posiljatelj, primatelj]
    );
    res.json({ success: true, id_poruke: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Greška pri slanju poruke!" });
  }
});

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`🚀 Server je pokrenut na http://localhost:${PORT}`);
});

