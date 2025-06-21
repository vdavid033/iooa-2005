const db = require('../db')

exports.createObjava = (req, res) => {
  const { naslov, sadrzaj, datum, fk_kategorija, tagovi } = req.body
  const fk_korisnik = req.user.id

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
    SELECT o.id_objava AS id, 
           o.naslov_objave AS title, 
           LEFT(o.sadrzaj_objave, 200) AS preview,
           o.datum_objave AS date, 
           o.edited_at, 
           o.edit_count,
           o.fk_korisnik AS authorId,
           k.korisnicko_ime AS author, 
           kf.ime_kategorija_forum AS category
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
    SELECT DISTINCT o.id_objava AS id, 
                    o.naslov_objave AS title, 
                    LEFT(o.sadrzaj_objave, 200) AS preview,
                    o.datum_objave AS date,
                    o.edited_at,
                    o.edit_count,
                    o.fk_korisnik AS authorId,
                    k.korisnicko_ime AS author, 
                    kf.ime_kategorija_forum AS category
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

// getObjavaById s dodatnim podacima za edit
exports.getObjavaById = (req, res) => {
  const id = req.params.id
  const sql = `
    SELECT o.id_objava AS id, 
           o.naslov_objave AS naslov,
           o.naslov_objave AS title,  
           o.sadrzaj_objave AS sadrzaj, 
           o.datum_objave, 
           o.edited_at, 
           o.edit_count,
           o.fk_korisnik AS id_korisnika,
           o.fk_korisnik AS authorId,
           o.fk_kategorija,
           k.korisnicko_ime AS username, 
           kf.ime_kategorija_forum AS kategorija
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

// updateObjava s kategorijama i tagovima
exports.updateObjava = (req, res) => {
  const { id } = req.params
  const { naslov, sadrzaj, fk_kategorija, tagovi } = req.body
  
  console.log('UPDATE OBJAVA - Full Edit Mode');
  console.log('Request data:', { naslov, sadrzaj, fk_kategorija, tagovi });
  
  if (!req.user || !req.user.id) {
    return res.status(403).json({ 
      error: 'Korisnik nije autentificiran',
      success: false 
    })
  }
  
  const fk_korisnik = req.user.id

  // VALIDACIJA - svi potrebni podaci
  const errors = {}
  
  // Validacija naslova
  if (!naslov || naslov.trim().length === 0) {
    errors.naslov = 'Naslov objave je obavezan'
  } else if (naslov.length > 100) {
    errors.naslov = 'Naslov ne može biti duži od 100 znakova'
  }
  
  // Validacija sadržaja
  if (!sadrzaj || sadrzaj.trim().length === 0) {
    errors.sadrzaj = 'Sadržaj objave je obavezan'
  } else if (sadrzaj.length > 256) {
    errors.sadrzaj = 'Sadržaj ne može biti duži od 256 znakova'
  }
  
  // Validacija kategorije
  if (!fk_kategorija) {
    errors.kategorija = 'Kategorija je obavezna'
  }
  
  // Validacija tagova
  if (tagovi && Array.isArray(tagovi) && tagovi.length > 5) {
    errors.tagovi = 'Maksimalno 5 tagova je dozvoljeno'
  }
  
  // Ako ima grešaka, vrati ih
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      error: Object.values(errors).join(', '),
      errors: errors,
      success: false 
    })
  }

  // Provjeri vlasništvo objave
  const checkSql = 'SELECT * FROM objava WHERE id_objava = ? AND fk_korisnik = ?'
  db.query(checkSql, [id, fk_korisnik], (err, results) => {
    if (err) {
      console.error('Database error during ownership check:', err);
      return res.status(500).json({ error: 'Greška na serveru' })
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Objava nije pronađena ili nemate dozvolu za uređivanje' 
      })
    }

    console.log('User is owner, proceeding with full update...');

    // Ažuriraj osnovne podatke objave
    const updateObjavaSQL = `
      UPDATE objava 
      SET naslov_objave = ?, 
          sadrzaj_objave = ?, 
          fk_kategorija = ?,
          edited_at = CURRENT_TIMESTAMP,
          edit_count = edit_count + 1 
      WHERE id_objava = ? AND fk_korisnik = ?
    `
    
    console.log('Updating objava with:', {
      naslov: naslov.trim(),
      sadrzaj: sadrzaj.trim(),
      fk_kategorija: fk_kategorija,
      id: id,
      fk_korisnik: fk_korisnik
    });
    
    db.query(updateObjavaSQL, [naslov.trim(), sadrzaj.trim(), fk_kategorija, id, fk_korisnik], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Objava update error:', updateErr);
        return res.status(500).json({ error: 'Greška pri ažuriranju objave' })
      }

      console.log('Objava basic data updated successfully');

      // Ažuriraj tagove
      updateTags(id, tagovi, (tagError) => {
        if (tagError) {
          console.error('Tags update error:', tagError);
          return res.status(500).json({ error: 'Objava ažurirana, ali greška pri tagovima' })
        }

        console.log('Tags updated successfully');

        //  USPJEŠAN RESPONSE
        res.json({
          success: true,
          message: 'Objava uspješno ažurirana',
          objava: {
            id: parseInt(id),
            naslov: naslov.trim(),
            sadrzaj: sadrzaj.trim(),
            fk_kategorija: fk_kategorija,
            tagovi: tagovi || [],
            edited_at: new Date().toISOString()
          }
        })
      })
    })
  })
}

// Ažuriranje tagova
function updateTags(objavaId, newTagovi, callback) {
  console.log('Updating tags for objava:', objavaId);
  console.log('New tags:', newTagovi);
  
  // STEP 1: Obriši postojeće tagove
  const deleteTagsSQL = 'DELETE FROM objava_tag WHERE fk_objava = ?'
  
  db.query(deleteTagsSQL, [objavaId], (deleteErr, deleteResult) => {
    if (deleteErr) {
      console.error('Error deleting old tags:', deleteErr);
      return callback(deleteErr)
    }
    
    console.log('Old tags deleted, deleted count:', deleteResult.affectedRows);
    
    // STEP 2: Dodaj nove tagove (ako postoje)
    if (!newTagovi || !Array.isArray(newTagovi) || newTagovi.length === 0) {
      console.log('No new tags to add');
      return callback(null)
    }
    
    const insertTagsSQL = 'INSERT INTO objava_tag (fk_objava, fk_tag) VALUES ?'
    const tagValues = newTagovi.map(tagId => [objavaId, tagId])
    
    console.log('Inserting new tags:', tagValues);
    
    db.query(insertTagsSQL, [tagValues], (insertErr, insertResult) => {
      if (insertErr) {
        console.error('Error inserting new tags:', insertErr);
        return callback(insertErr)
      }
      
      console.log('New tags inserted, inserted count:', insertResult.affectedRows);
      callback(null)
    })
  })
}