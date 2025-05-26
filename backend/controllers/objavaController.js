const db = require('../db')

exports.createObjava = (req, res) => {
  const { naslov, sadrzaj, datum, fk_kategorija, tagovi } = req.body
  const fk_korisnik = req.userId

  if (!naslov || !sadrzaj || !datum || !fk_korisnik) {
    return res.status(400).json({ error: 'Nedostaju podaci.' })
  }

  const sql = `
    INSERT INTO objava (naslov_objave, sadrzaj_objave, datum_objave, fk_korisnik, fk_kategorija)
    VALUES (?, ?, ?, ?, ?)
  `
  db.query(sql, [naslov, sadrzaj, datum, fk_korisnik, fk_kategorija], (err, result) => {
    if (err) return res.status(500).json({ error: 'Greška pri unosu objave.' })

    const id_objava = result.insertId
    if (Array.isArray(tagovi) && tagovi.length > 0) {
      const tagSql = `INSERT INTO objava_tag (fk_objava, fk_tag) VALUES ?`
      const tagValues = tagovi.map(tagId => [id_objava, tagId])

      db.query(tagSql, [tagValues], tagErr => {
        if (tagErr) {
          console.error(tagErr)
          return res.status(500).json({ error: 'Objava spremljena, ali tagovi nisu.' })
        }
        res.status(201).json({ message: 'Objava i tagovi spremljeni!', id_objava })
      })
    } else {
      res.status(201).json({ message: 'Objava spremljena bez tagova.', id_objava })
    }
  })
}

exports.getAllObjave = (req, res) => {
  const sql = `
    SELECT o.id_objava AS id, o.naslov_objave AS title, LEFT(o.sadrzaj_objave, 200) AS preview,
           o.datum_objave AS date, k.korisnicko_ime AS author, kf.ime_kategorija_forum AS category
    FROM objava o
    LEFT JOIN korisnik k ON o.fk_korisnik = k.id_korisnika
    LEFT JOIN kategorija_forum kf ON o.fk_kategorija = kf.id_kategorija_forum
    ORDER BY o.datum_objave DESC
  `
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Greška pri dohvaćanju objava.' })

    const postIds = results.map(r => r.id)
    if (postIds.length === 0) return res.json([])

    const tagSql = `SELECT ot.fk_objava, t.naziv_tag FROM objava_tag ot JOIN tag t ON ot.fk_tag = t.id_tag WHERE ot.fk_objava IN (?)`
    db.query(tagSql, [postIds], (tagErr, tagResults) => {
      if (tagErr) return res.status(500).json({ error: 'Greška pri dohvaćanju tagova.' })

      const tagMap = {}
      tagResults.forEach(({ fk_objava, naziv_tag }) => {
        tagMap[fk_objava] = tagMap[fk_objava] || []
        tagMap[fk_objava].push(naziv_tag)
      })

      const komentarSql = `SELECT id_objava, COUNT(*) AS broj_komentara FROM komentar GROUP BY id_objava`
      db.query(komentarSql, (komErr, komResults) => {
        if (komErr) return res.status(500).json({ error: 'Greška pri komentarima.' })

        const komentarMap = {}
        komResults.forEach(({ id_objava, broj_komentara }) => {
          komentarMap[id_objava] = broj_komentara
        })

        const finalResults = results.map(post => ({
          ...post,
          tags: tagMap[post.id] || [],
          comments: komentarMap[post.id] || 0
        }))

        res.json(finalResults)
      })
    })
  })
}

exports.getFilteredObjave = (req, res) => {
  const { tagovi } = req.query
  if (!tagovi) return res.status(400).json({ error: 'Tagovi nisu poslani.' })

  const tagList = tagovi.split(',')
  const placeholders = tagList.map(() => '?').join(',')
  const sql = `
    SELECT DISTINCT o.id_objava AS id, o.naslov_objave AS title, LEFT(o.sadrzaj_objave, 200) AS preview,
                    o.datum_objave AS date, k.korisnicko_ime AS author, kf.ime_kategorija_forum AS category
    FROM objava o
    JOIN objava_tag ot ON o.id_objava = ot.fk_objava
    JOIN tag t ON ot.fk_tag = t.id_tag
    LEFT JOIN korisnik k ON o.fk_korisnik = k.id_korisnika
    LEFT JOIN kategorija_forum kf ON o.fk_kategorija = kf.id_kategorija_forum
    WHERE t.naziv_tag IN (${placeholders})
    ORDER BY o.datum_objave DESC
  `
  db.query(sql, tagList, (err, results) => {
    if (err) return res.status(500).json({ error: 'Greška pri filtriranju.' })

    const postIds = results.map(r => r.id)
    if (postIds.length === 0) return res.json([])

    const tagSql = `
      SELECT ot.fk_objava, t.naziv_tag
      FROM objava_tag ot JOIN tag t ON ot.fk_tag = t.id_tag
      WHERE ot.fk_objava IN (?)
    `
    db.query(tagSql, [postIds], (tagErr, tagResults) => {
      if (tagErr) return res.status(500).json({ error: 'Greška pri tagovima.' })

      const tagMap = {}
      tagResults.forEach(({ fk_objava, naziv_tag }) => {
        tagMap[fk_objava] = tagMap[fk_objava] || []
        tagMap[fk_objava].push(naziv_tag)
      })

      const finalResults = results.map(post => ({
        ...post,
        tags: tagMap[post.id] || [],
        comments: 0
      }))

      res.json(finalResults)
    })
  })
}

exports.getObjavaById = (req, res) => {
  const id = req.params.id
  const sql = `
    SELECT o.id_objava AS id, o.naslov_objave AS naslov, o.sadrzaj_objave AS sadrzaj, o.datum_objave,
           o.fk_korisnik AS id_korisnika, k.korisnicko_ime AS username, kf.ime_kategorija_forum AS kategorija
    FROM objava o
    LEFT JOIN korisnik k ON o.fk_korisnik = k.id_korisnika
    LEFT JOIN kategorija_forum kf ON o.fk_kategorija = kf.id_kategorija_forum
    WHERE o.id_objava = ?
  `
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Greška u bazi.' })
    if (results.length === 0) return res.status(404).json({ error: 'Objava nije pronađena.' })

    const post = results[0]
    const tagSql = `SELECT t.naziv_tag FROM objava_tag ot JOIN tag t ON ot.fk_tag = t.id_tag WHERE ot.fk_objava = ?`
    db.query(tagSql, [id], (tagErr, tagResults) => {
      if (tagErr) return res.status(500).json({ error: 'Greška pri tagovima.' })
      post.tagovi = tagResults.map(r => r.naziv_tag)
      res.status(200).json(post)
    })
  })
}
