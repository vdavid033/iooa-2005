const db = require('../db');

// Dohvati sve kategorije
exports.getAllKategorije = (req, res) => {
  const sql = `
    SELECT id_kategorija_forum AS value, ime_kategorija_forum AS label
    FROM kategorija_forum
    ORDER BY ime_kategorija_forum ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Greška u /api/kategorije:", err);
      return res.status(500).json({ error: 'Greška u bazi.' });
    }

    res.status(200).json(results);
  });
};
