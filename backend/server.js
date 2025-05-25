const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Konfiguracija baze podataka
const db = mysql.createConnection({
  host: 'student.veleri.hr',
  user: 'iooa',
  password: '11',
  database: 'iooa_dm_veleri',
});

// Provjera veze s bazom
db.connect(err => {
  if (err) {
    console.error('Greška pri spajanju na bazu:', err);
    return;
  }
  console.log('Uspješno spojeno na bazu podataka');
});

app.use(cors());
app.use(bodyParser.json());

// Nova ruta: Dohvaćanje svih korisnika (za novi chat)
app.get('/api/svi-korisnici', (req, res) => {
  db.query(
    `SELECT id_korisnika, ime_korisnika, prezime_korisnika FROM korisnik ORDER BY ime_korisnika ASC`,
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({
          error: "Greška pri dohvaćanju korisnika",
          details: error.message
        });
      }
      res.json(results);
    }
  );
});

// Dohvaćanje korisnika s kojima je razmijenjene poruke
app.get('/api/korisnici/:id', (req, res) => {
  const korisnikId = req.params.id;

  db.query(
    `SELECT DISTINCT k.id_korisnika, k.ime_korisnika, k.prezime_korisnika
     FROM korisnik k
     JOIN poruke p ON (k.id_korisnika = p.posiljatelj OR k.id_korisnika = p.primatelj)
     WHERE k.id_korisnika != ? AND (p.posiljatelj = ? OR p.primatelj = ?)
     ORDER BY k.ime_korisnika ASC`,
    [korisnikId, korisnikId, korisnikId],
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({ 
          error: "Greška u bazi podataka",
          details: error.message 
        });
      }
      res.json(results);
    }
  );
});

// Dohvaćanje poruka između dva korisnika
app.get('/api/poruke/:korisnik1/:korisnik2', (req, res) => {
  const { korisnik1, korisnik2 } = req.params;
  
  db.query(
    `SELECT * FROM poruke 
     WHERE (posiljatelj = ? AND primatelj = ?) 
     OR (posiljatelj = ? AND primatelj = ?)
     ORDER BY datum_vrijeme ASC`,
    [korisnik1, korisnik2, korisnik2, korisnik1],
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({ 
          error: "Greška pri dohvaćanju poruka",
          details: error.message 
        });
      }
      res.json(results);
    }
  );
});

// Slanje nove poruke
app.post('/api/poruke', (req, res) => {
  const { sadrzaj, posiljatelj, primatelj } = req.body;
  
  db.query(
    'INSERT INTO poruke (sadrzaj, posiljatelj, primatelj, datum_vrijeme) VALUES (?, ?, ?, NOW())',
    [sadrzaj, posiljatelj, primatelj],
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({ 
          error: "Greška pri slanju poruke",
          details: error.message 
        });
      }
      res.json({ success: true, id_poruke: results.insertId });
    }
  );
});

// Dohvaćanje zadnjih poruka za sve kontakte
app.get('/api/sve-poruke/:trenutniKorisnikId', (req, res) => {
  const { trenutniKorisnikId } = req.params;
  
  db.query(
    `SELECT p.* FROM poruke p
     INNER JOIN (
       SELECT 
         LEAST(posiljatelj, primatelj) AS korisnik1,
         GREATEST(posiljatelj, primatelj) AS korisnik2,
         MAX(datum_vrijeme) AS maxDatum
       FROM poruke
       WHERE posiljatelj = ? OR primatelj = ?
       GROUP BY korisnik1, korisnik2
     ) zadnje ON 
       (p.posiljatelj = zadnje.korisnik1 OR p.posiljatelj = zadnje.korisnik2) AND
       (p.primatelj = zadnje.korisnik1 OR p.primatelj = zadnje.korisnik2) AND
       p.datum_vrijeme = zadnje.maxDatum`,
    [trenutniKorisnikId, trenutniKorisnikId],
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({ 
          error: "Greška pri dohvaćanju poruka",
          details: error.message 
        });
      }
      res.json(results);
    }
  );
});

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`🚀 Server pokrenut na http://localhost:${PORT}`);
});
