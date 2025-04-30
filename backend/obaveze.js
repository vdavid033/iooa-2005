const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

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
