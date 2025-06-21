const db = require('../db')

exports.createKomentar = (req, res) => {
  const { id_objava, sadrzaj_komentara } = req.body
  const id_korisnika = req.user.id

  if (!id_objava || !sadrzaj_komentara || !id_korisnika) {
    return res.status(400).json({ error: 'Nedostaju podaci.' })
  }

  const sql = `
    INSERT INTO komentar (id_objava, id_korisnika, sadrzaj_komentara, datum_komentara)
    VALUES (?, ?, ?, NOW())
  `
  db.query(sql, [id_objava, id_korisnika, sadrzaj_komentara], (err, result) => {
    if (err) return res.status(500).json({ error: 'Greška pri unosu komentara.' })
    res.status(201).json({ message: 'Komentar spremljen!', id_komentar: result.insertId })
  })
}

exports.getKomentariByObjava = (req, res) => {
  const id_objava = req.params.id_objava

  const sql = `
    SELECT k.id_komentar, k.id_objava, k.id_korisnika, k.sadrzaj_komentara, k.datum_komentara,
           u.korisnicko_ime AS username
    FROM komentar k
    LEFT JOIN korisnik u ON k.id_korisnika = u.id_korisnika
    WHERE k.id_objava = ?
    ORDER BY k.datum_komentara DESC
  `
  db.query(sql, [id_objava], (err, results) => {
    if (err) return res.status(500).json({ error: 'Greška u bazi.' })

    const komentari = results.map(r => ({
      id_komentar: r.id_komentar,
      id_objava: r.id_objava,
      id_korisnika: r.id_korisnika,
      sadrzaj_komentara: r.sadrzaj_komentara,
      datum_komentara: r.datum_komentara,
      username: r.username || null
    }))

    res.status(200).json(komentari)
  })
}
