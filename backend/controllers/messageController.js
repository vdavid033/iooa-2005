// controllers/messageController.js
const connection = require("../db");

exports.getAllUsers = (req, res) => {
  connection.query(
    `SELECT id_korisnika, ime_korisnika, prezime_korisnika FROM korisnik ORDER BY ime_korisnika ASC`,
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({ error: "Greška pri dohvaćanju korisnika", details: error.message });
      }
      res.json(results);
    }
  );
};

exports.getMessagedUsers = (req, res) => {
  const korisnikId = req.params.id;

  connection.query(
    `SELECT DISTINCT k.id_korisnika, k.ime_korisnika, k.prezime_korisnika
     FROM korisnik k
     JOIN poruke p ON (k.id_korisnika = p.posiljatelj OR k.id_korisnika = p.primatelj)
     WHERE k.id_korisnika != ? AND (p.posiljatelj = ? OR p.primatelj = ?)
     ORDER BY k.ime_korisnika ASC`,
    [korisnikId, korisnikId, korisnikId],
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({ error: "Greška u bazi podataka", details: error.message });
      }
      res.json(results);
    }
  );
};

exports.getMessagesBetweenUsers = (req, res) => {
  const { korisnik1, korisnik2 } = req.params;

  connection.query(
    `SELECT * FROM poruke 
     WHERE (posiljatelj = ? AND primatelj = ?) 
     OR (posiljatelj = ? AND primatelj = ?)
     ORDER BY datum_vrijeme ASC`,
    [korisnik1, korisnik2, korisnik2, korisnik1],
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({ error: "Greška pri dohvaćanju poruka", details: error.message });
      }
      res.json(results);
    }
  );
};

exports.sendMessage = (req, res) => {
  const { sadrzaj, posiljatelj, primatelj } = req.body;

  connection.query(
    'INSERT INTO poruke (sadrzaj, posiljatelj, primatelj, datum_vrijeme) VALUES (?, ?, ?, NOW())',
    [sadrzaj, posiljatelj, primatelj],
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({ error: "Greška pri slanju poruke", details: error.message });
      }
      res.json({ success: true, id_poruke: results.insertId });
    }
  );
};

exports.getLastMessagesForAllContacts = (req, res) => {
  const trenutniKorisnikId = req.params.trenutniKorisnikId;

  connection.query(
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
        return res.status(500).json({ error: "Greška pri dohvaćanju poruka", details: error.message });
      }
      res.json(results);
    }
  );
};


exports.getNewMessages = (req, res) => {
  const korisnikId = req.params.id;
  const zadnjaProvjera = req.query.lastCheck || new Date(Date.now() - 3000).toISOString();

  connection.query(
    `SELECT p.*, k.ime_korisnika, k.prezime_korisnika 
     FROM poruke p
     JOIN korisnik k ON p.posiljatelj = k.id_korisnika
     WHERE p.primatelj = ? AND p.datum_vrijeme > ?
     ORDER BY p.datum_vrijeme DESC`,
    [korisnikId, zadnjaProvjera],
    (error, results) => {
      if (error) {
        console.error("SQL greška:", error);
        return res.status(500).json({ error: "Greška pri dohvaćanju novih poruka", details: error.message });
      }
      res.json(results);
    }
  );
};
