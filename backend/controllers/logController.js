const db = require('../data/db')

exports.getDocumentLogs = async (req, res) => {
  try {
    // Select all dokument columns including timestamps and join user info
    const sql = `
            SELECT d.id_dokumenta,
              d.ime_dokumenta,
              d.putanja,
              d.datum_kreiranja,
              d.datum_izmjene,
              d.fk_mape,
              CONCAT(u.ime_korisnika, ' ', u.prezime_korisnika) AS user_fullname,
              m.ime_mape AS mapa
            FROM dokument d
            LEFT JOIN korisnik u ON d.fk_korisnika = u.id_korisnika
            LEFT JOIN mapa m ON d.fk_mape = m.id_mape
            ORDER BY d.datum_kreiranja DESC
    `

    const [rows] = await db.query(sql)

    // Map dokument table columns to UI field names
    const mapped = rows.map(r => ({
      id: r.id_dokumenta,
      user_fullname: r.user_fullname || null,
      document: r.ime_dokumenta,
      path: r.putanja,
      created_at: r.datum_kreiranja,
      updated_at: r.datum_izmjene,
      mapa: r.mapa || '',
      fk_mape: r.fk_mape
    }))

    res.json(mapped)
  } catch (err) {
    console.error('getDocumentLogs error', err)
    res.status(500).json({ message: 'Greška pri dohvatu dnevnika dokumenata' })
  }
}
