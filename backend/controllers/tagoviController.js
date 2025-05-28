const db = require('../db');

// Dohvati sve tagove
exports.getAllTagovi = (req, res) => {
  const sql = `
    SELECT id_tag AS value, naziv_tag AS label
    FROM tag
    ORDER BY naziv_tag ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Greška u /api/tagovi:", err);
      return res.status(500).json({ error: 'Greška u bazi.' });
    }

    res.status(200).json(results);
  });
};
