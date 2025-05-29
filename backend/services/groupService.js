const db = require('../data/db');

exports.getAllUsers = async () => {
  const [rows] = await db.execute(`
    SELECT id_korisnika AS id, 
           CONCAT(ime_korisnika, ' ', prezime_korisnika) AS name
    FROM korisnik
  `);
  return rows.map(user => ({
    ...user,
    avatar: `https://i.pravatar.cc/150?u=${user.id}`
  }));
};

exports.createGroup = async ({ name, description, creatorId, memberIds = [] }) => {
  if (!name || !description || !creatorId) {
    throw new Error("Ime, opis i creatorId su obavezni.");
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [creatorCheck] = await connection.query(
      "SELECT id_korisnika FROM korisnik WHERE id_korisnika = ?", [creatorId]
    );
    if (creatorCheck.length === 0) throw new Error("Korisnik (creatorId) ne postoji.");

    const uniqueMemberIds = [...new Set(memberIds.filter(id => id !== creatorId))];
    let validMemberIds = [];

    if (uniqueMemberIds.length > 0) {
      const [existingMembers] = await connection.query(
        "SELECT id_korisnika FROM korisnik WHERE id_korisnika IN (?)",
        [uniqueMemberIds]
      );
      validMemberIds = existingMembers.map(m => m.id_korisnika);
      if (validMemberIds.length !== uniqueMemberIds.length) {
        throw new Error("Neki korisnici u memberIds ne postoje.");
      }
    }

    const [groupResult] = await connection.query(
      "INSERT INTO grupa (ime_grupe, opis_grupe) VALUES (?, ?)", [name, description]
    );
    const groupId = groupResult.insertId;

    await connection.query(
      "INSERT INTO korisnikova_grupa (id_grupe, id_korisnika, admin_status) VALUES (?, ?, ?)",
      [groupId, creatorId, true]
    );

    if (validMemberIds.length > 0) {
      const memberValues = validMemberIds.map(id => [groupId, id, false]);
      await connection.query(
        "INSERT INTO korisnikova_grupa (id_grupe, id_korisnika, admin_status) VALUES ?",
        [memberValues]
      );
    }

    await connection.commit();
    connection.release();

    return {
      message: "Grupa uspješno kreirana sa članovima",
      id_grupe: groupId,
      ime_grupe: name,
      opis_grupe: description
    };
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
};
