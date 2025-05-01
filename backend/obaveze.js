const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json())

const db = mysql.createConnection({
  host: "ucka.veleri.hr",
  user: "iooa",
  password: "11",
  database: "iooa_dm_veleri",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Greška pri spajanju na bazu:", err.message);
  } else {
    console.log("Uspješno spojen na MySQL bazu.");
  }
});

app.get("/api/obaveze", (req, res) => {
  const sql = "SELECT * FROM obaveza";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Greška pri dohvaćanju obaveza:", err);
      return res.status(500).json({ error: "Greška pri dohvaćanju podataka." });
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});

app.get("/api/obavezaDetalji", (req, res) => {
  const { id } = req.query;
  const sql = "SELECT * FROM obaveza WHERE id_obaveze = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Greška pri dohvaćanju detalja obaveze:", err);
      return res.status(500).json({ error: "Greška pri dohvaćanju podataka." });
    }
    res.json(results[0]);
  });
  
});

app.post("/api/unosObaveze", (req, res) => {

  const { datum_obaveze, vrijeme_pocetka, opis_obaveze, lokacija, profesor, kolegij, fk_tip_obaveze } = req.body;

  const fk_korisnika = 1;

  const sql = "INSERT INTO obaveza (datum_obaveze, vrijeme_pocetka, opis_obaveze, lokacija, profesor, kolegij, fk_tip_obaveze, fk_korisnika) VALUES (?, ?, ?, ?, ?, ?, ?,?)";

  const values = [datum_obaveze, vrijeme_pocetka, opis_obaveze, lokacija, profesor, kolegij, fk_tip_obaveze, fk_korisnika];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Greška pri unosu obaveze:", err);
      return res.status(500).json({ error: "Neuspješan unos obaveze." });
    }
    res.status(201).json({ poruka: "Obaveza uspješno unesena.", id: result.insertId });
  });
});

app.get("/api/tipoviObaveza", (req, res) => {
  const sql = "SELECT id_tipa_obaveze AS value, naziv_tipa_obaveze AS label FROM tip_obaveze";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Greška pri dohvaćanju tipova obaveza:", err);
      return res.status(500).json({ error: "Greška pri dohvaćanju tipova obaveza." });
    }
    res.json(results); // [{ value: 1, label: 'Kolokvij' }, ...]
  });
});
