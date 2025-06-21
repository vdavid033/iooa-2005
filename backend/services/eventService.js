const db = require('../data/db');

exports.getEventsByDate = async (date) => {
  const [rows] = await db.query(`
    SELECT 
      d.id_dogadjaja AS id,
      d.naziv_dogadjaja AS headline,
      d.opis_dogadjaja AS description,
      d.lokacija_dogadjaja AS location,
      k.naziv_kategorije_dogadjaja AS category,
      d.datum_dogadjaja AS date,
      TIME_FORMAT(d.vrijeme_pocetka_dogadjaja, '%H:%i') AS time,
      d.fk_korisnika AS userId,
      u.ime_korisnika AS firstName,
      u.prezime_korisnika AS lastName
    FROM dogadjaj d
    JOIN kategorija_dogadjaja k ON d.fk_kategorije_dogadjaja = k.id_kategorije_dogadjaja
    JOIN korisnik u ON d.fk_korisnika = u.id_korisnika
    WHERE d.datum_dogadjaja = ?
  `, [date]);

  return rows;
};

exports.getEventDates = async (year, month) => {
  const firstDay = `${year}-${month.padStart(2, '0')}-01`;
  const lastDay = `${year}-${month.padStart(2, '0')}-31`;

  const [rows] = await db.query(`
    SELECT DISTINCT datum_dogadjaja AS date
    FROM dogadjaj
    WHERE datum_dogadjaja BETWEEN ? AND ?
  `, [firstDay, lastDay]);

  return rows.map(row => row.date);
};

exports.createEvent = async (data) => {
  const { headline, description, location, categoryId, date, time, userId } = data;

  const [result] = await db.query(`
    INSERT INTO dogadjaj (
      naziv_dogadjaja, opis_dogadjaja, lokacija_dogadjaja,
      fk_kategorije_dogadjaja, datum_dogadjaja,
      vrijeme_pocetka_dogadjaja, fk_korisnika
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [headline, description, location, categoryId, date, time, userId]);

  return result.insertId;
};

exports.updateEvent = async (id, data) => {
  const { headline, description, location, categoryId, date, time } = data;

  await db.query(`
    UPDATE dogadjaj
    SET naziv_dogadjaja = ?, opis_dogadjaja = ?, lokacija_dogadjaja = ?,
        fk_kategorije_dogadjaja = ?, datum_dogadjaja = ?, vrijeme_pocetka_dogadjaja = ?
    WHERE id_dogadjaja = ?
  `, [headline, description, location, categoryId, date, time, id]);
};

exports.deleteEvent = async (id) => {
  await db.query('DELETE FROM dogadjaj WHERE id_dogadjaja = ?', [id]);
};
