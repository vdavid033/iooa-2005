const express = require('express');
const router = express.Router();
const authJwt = require('../authJwt');
const db = require('../db');

// Dohvati sve obaveze za prijavljenog korisnika
router.get('/sve-obaveze', authJwt.verifyTokenUser, (req, res) => {
  const sql = 'SELECT * FROM obaveza';
  db.query(sql, (err, results) => {
    if (res.headersSent) return;
    if (err) {
      console.error("Greška pri dohvaćanju svih obaveza:", err);
      res.status(500).json({ error: "Greška pri dohvaćanju podataka." });
    } else {
      res.status(200).json(results);
    }
  });
});

// Dodaj novu obavezu
router.post('/unosObaveze', verifyTokenAdmin, (req, res) => {
  const { datum_obaveze, vrijeme_pocetka, opis_obaveze, lokacija, profesor, kolegij, fk_tip_obaveze } = req.body;
  const sql = "INSERT INTO obaveza (datum_obaveze, vrijeme_pocetka, opis_obaveze, lokacija, profesor, kolegij, fk_tip_obaveze, fk_korisnika) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [datum_obaveze, vrijeme_pocetka, opis_obaveze, lokacija, profesor, kolegij, fk_tip_obaveze, req.userId];
  db.query(sql, values, (err, result) => {
    if (res.headersSent) return;
    if (err) {
      console.error("Greška pri unosu obaveze:", err);
      res.status(500).json({ error: "Neuspješan unos obaveze." });
    } else {
      res.status(201).json({ poruka: "Obaveza uspješno unesena.", id: result.insertId });
    }
  });
});

// Obriši obavezu
router.delete('/obaveza-brisanje/:id', authJwt.verifyTokenUser, (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM obaveza WHERE id_obaveze = ? AND fk_korisnika = ?";
  db.query(sql, [id, req.userId], (err, results) => {
    if (res.headersSent) return;
    if (err) {
      console.error("Greška pri brisanju obaveze:", err);
      res.status(500).json({ error: "Greška pri brisanju obaveze." });
    } else if (results.affectedRows > 0) {
      res.status(200).json({ message: "Obaveza uspješno obrisana." });
    } else {
      res.status(404).json({ message: "Obaveza nije pronađena." });
    }
  });
});

// Dohvati sve tipove obaveza
router.get('/tipoviObaveza', authJwt.verifyTokenUser, (req, res) => {
  const sql = "SELECT id_tipa_obaveze AS value, naziv_tipa_obaveze AS label FROM tip_obaveze";
  db.query(sql, (err, results) => {
    if (res.headersSent) return;
    if (err) {
      console.error("Greška pri dohvaćanju tipova obaveza:", err);
      res.status(500).json({ error: "Greška pri dohvaćanju tipova obaveza." });
    } else {
      res.status(200).json(results);
    }
  });
});

module.exports = router;
