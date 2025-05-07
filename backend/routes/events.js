const express = require('express');
const router = express.Router();
const db = require('../db');

// GET događaji po datumu
router.get('/:date', (req, res) => {
  const sql = `
    SELECT 
      d.id_dogadjaja AS id,
      d.naziv_dogadjaja AS headline,
      d.opis_dogadjaja AS description,
      d.lokacija_dogadjaja AS location,
      k.naziv_kategorije_dogadjaja AS category,
      k.boja_kategorije_dogadjaja AS color,
      d.datum_dogadjaja AS date,
      d.vrijeme_pocetka_dogadjaja AS time
    FROM dogadjaj d
    JOIN kategorija_dogadjaja k ON d.fk_kategorije_dogadjaja = k.id_kategorije_dogadjaja
    WHERE d.datum_dogadjaja = ?
  `;
  db.query(sql, [req.params.date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST novi događaj
router.post('/', (req, res) => {
  const { headline, description, location, categoryId, date, time, userId } = req.body;
  const sql = `
    INSERT INTO dogadjaj (
      naziv_dogadjaja, opis_dogadjaja, lokacija_dogadjaja,
      fk_kategorije_dogadjaja, datum_dogadjaja,
      vrijeme_pocetka_dogadjaja, fk_korisnika
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [headline, description, location, categoryId, date, time, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId });
  });
});

// DELETE događaj
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM dogadjaj WHERE id_dogadjaja = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Događaj obrisan' });
  });
});

module.exports = router;
