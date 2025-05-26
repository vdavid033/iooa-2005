// Uvoz db modula za pristup bazi podataka
const db = require("../data/db");

// Dohvaća sve korisnike iz baze podataka
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id_korisnika AS id, 
             CONCAT(ime_korisnika, ' ', prezime_korisnika) AS name
      FROM korisnik
    `);
    // Add avatar placeholder to match expected frontend structure
    const users = rows.map(user => ({
      ...user,
      avatar: `https://i.pravatar.cc/150?u=${user.id}` // Using `u` param for uniqueness
    }));
    res.json(users);
  } catch (err) {
    console.error('Greška pri dohvaćanju korisnika:', err);
    res.status(500).json({ error: 'Neuspješno dohvaćanje korisnika' });
  }
};

// Dohvaća sve korisnike iz baze podataka koji pripadaju odabranoj grupi
exports.getGroupMembers = async (req, res) => {
  const groupName = req.params.groupName;

  try {
    const [rows] = await db.execute(`
      SELECT k.id_korisnika AS id, 
             CONCAT(k.ime_korisnika, ' ', k.prezime_korisnika) AS name
      FROM korisnikova_grupa kg
      JOIN korisnik k ON kg.id_korisnika = k.id_korisnika
      JOIN grupa g ON kg.id_grupe = g.id_grupe
      WHERE g.ime_grupe = ?
    `, [groupName]);

    // Add placeholder avatar URLs
    const members = rows.map(member => ({
      ...member,
      avatar: `https://i.pravatar.cc/150?u=${member.id}`
    }));

    res.json(members);
  } catch (err) {
    console.error('Greška pri dohvaćanju članova grupe:', err);
    res.status(500).json({ error: 'Neuspješno dohvaćanje članova grupe' });
  }
};

// Dohvaća sve grupe iz baze podataka
exports.getGroups = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [groups] = await db.execute(`
      SELECT g.id_grupe, g.ime_grupe, g.opis_grupe, kg.admin_status
      FROM korisnikova_grupa kg
      JOIN grupa g ON kg.id_grupe = g.id_grupe
      WHERE kg.id_korisnika = ?
    `, [userId]);

    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
};

// Stvara novu grupu u bazi podataka
exports.createGroup = async (req, res) => {
  const { name, description, creatorId, memberIds = [] } = req.body;

  if (!name || !description || !creatorId) {
    return res.status(400).json({
      error: "Neispravan zahtjev. Ime, opis i creatorId su obavezni.",
    });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Provjera da creatorId postoji
    const [creatorCheck] = await connection.query(
      "SELECT id_korisnika FROM korisnik WHERE id_korisnika = ?",
      [creatorId]
    );
    if (creatorCheck.length === 0) {
      throw new Error("Korisnik (creatorId) ne postoji.");
    }
    console.log(`Creator ID ${creatorId} postoji.`);

    // Provjerava da svi memberIds postoje
    const uniqueMemberIds = [
      ...new Set(memberIds.filter((id) => id !== creatorId)),
    ];
    let validMemberIds = [];
    if (uniqueMemberIds.length > 0) {
      const [existingMembers] = await connection.query(
        "SELECT id_korisnika FROM korisnik WHERE id_korisnika IN (?)",
        [uniqueMemberIds]
      );
      validMemberIds = existingMembers.map((m) => m.id_korisnika);

      if (validMemberIds.length !== uniqueMemberIds.length) {
        throw new Error("Neki korisnici u memberIds ne postoje.");
      }
    }

    // 1. Stvaranje grupe
    const [groupResult] = await connection.query(
      "INSERT INTO grupa (ime_grupe, opis_grupe) VALUES (?, ?)",
      [name, description]
    );
    const groupId = groupResult.insertId;

    // 2. Dodavanje creatorId kao admin
    await connection.query(
      "INSERT INTO korisnikova_grupa (id_grupe, id_korisnika, admin_status) VALUES (?, ?, ?)",
      [groupId, creatorId, true]
    );

    // 3. Dodavanje ostalih članova kao ne-admin
    if (validMemberIds.length > 0) {
      const memberValues = validMemberIds.map((id) => [groupId, id, false]);
      await connection.query(
        "INSERT INTO korisnikova_grupa (id_grupe, id_korisnika, admin_status) VALUES ?",
        [memberValues]
      );
    }

    // Ako je sve prošlo, transakcija se commit-a
    await connection.commit();
    connection.release();

    res.status(201).json({
      message: "Grupa uspješno kreirana sa članovima",
      id_grupe: groupId,
      ime_grupe: name,
      opis_grupe: description,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Greška pri stvaranju grupe s članovima:", error.message);
    res
      .status(500)
      .json({ error: "Greška pri stvaranju grupe", details: error.message });
  }
};

// Slanje poruke u grupu
exports.sendMessage = async (req, res) => {
  const { groupName } = req.params;
  const { senderId, content } = req.body;

  if (!senderId || !content) {
    return res
      .status(400)
      .json({ error: "SenderId i sadržaj poruke su obavezni" });
  }

  try {
    // Provjera dal grupa postoji
    const [group] = await db.query(
      "SELECT id_grupe FROM grupa WHERE ime_grupe = ?",
      [groupName]
    );
    if (group.length === 0) {
      return res.status(404).json({ error: "Grupa nije pronađena" });
    }

    const groupId = group[0].id_grupe;
    console.log(`Grupa ID: ${groupId}`);

    // Provjera dal korisnik postoji u grupi
    const [userGroupCheck] = await db.query(
      "SELECT id_korisnikova_grupa FROM korisnikova_grupa WHERE id_korisnika = ? AND id_grupe = ?",
      [senderId, groupId]
    );

    if (userGroupCheck.length === 0) {
      return res.status(400).json({ error: "Korisnik nije član ove grupe." });
    }

    const userGroupId = userGroupCheck[0].id_korisnikova_grupa;
    console.log(`Korisnikova grupa ID: ${userGroupId}`);

    // Provjerava da li postoji `userGroupId`
    if (!userGroupId) {
      return res.status(400).json({ error: "Nevažeći ID korisničke grupe" });
    }

    // ispis podataka koji se unose u grupnu_poruku u konzolu
    console.log(
      `Spremanje poruke - UserGroupId: ${userGroupId}, SenderId: ${senderId}, Content: ${content}`
    );

    // Spremanje poruke u grupu
    const [result] = await db.query(
      "INSERT INTO grupna_poruka (fk_korisnikove_grupe, fk_posiljatelja, sadrzaj_grupne_poruke, datum_i_vrijeme_grupne_poruke) VALUES (?, ?, ?, NOW())",
      [userGroupId, senderId, content]
    );

    console.log("Rezultat unosa:", result); // Provjerite rezultat unosa u tablicu

    // Provjerava je li unos poruke uspio
    if (result.affectedRows > 0) {
      return res.status(201).json({ message: "Poruka uspješno poslana" });
    } else {
      return res
        .status(500)
        .json({ error: "Došlo je do greške prilikom slanja poruke." });
    }
  } catch (error) {
    console.error("Greška pri slanju poruke:", error.message);
    res
      .status(500)
      .json({ error: "Greška pri slanju poruke", details: error.message });
  }
};

// Dodavanje člana u grupu
exports.addMembers = async (req, res) => {
  const { groupName } = req.params;
  const { memberIds } = req.body;

  if (!memberIds || memberIds.length === 0) {
    return res.status(400).json({ error: "MemberIds su obavezni" });
  }

  try {
    const [group] = await db.query(
      "SELECT id_grupe FROM grupa WHERE ime_grupe = ?",
      [groupName]
    );

    if (group.length === 0) {
      return res.status(404).json({ error: "Grupa nije pronađena" });
    }

    const groupId = group[0].id_grupe;

    // Dodavanje članova u grupu
    const memberValues = memberIds.map((id) => [groupId, id, false]);
    await db.query(
      "INSERT INTO korisnikova_grupa (id_grupe, id_korisnika, admin_status) VALUES ?",
      [memberValues]
    );

    res.status(200).json({ message: "Članovi uspješno dodani" });
  } catch (error) {
    console.error("Greška pri dodavanju članova:", error.message);
    res
      .status(500)
      .json({ error: "Greška pri dodavanju članova", details: error.message });
  }
};

exports.leaveGroup = async (req, res) => {
  const { userId, groupId } = req.body;

  if (!userId || !groupId) {
    return res.status(400).json({ error: "userId i groupId su obavezni." });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Provjeri je li korisnik admin
    const [userEntry] = await connection.query(
      `SELECT admin_status FROM korisnikova_grupa 
       WHERE id_korisnika = ? AND id_grupe = ?`,
      [userId, groupId]
    );

    if (userEntry.length === 0) {
      throw new Error("Korisnik nije član ove grupe.");
    }

    const isAdmin = userEntry[0].admin_status === 1;

    // 2. Obriši korisnika iz grupe
    await connection.query(
      `DELETE FROM korisnikova_grupa 
       WHERE id_korisnika = ? AND id_grupe = ?`,
      [userId, groupId]
    );

    // 3. Provjeri ima li još članova u grupi
    const [remainingMembers] = await connection.query(
      `SELECT id_korisnikova_grupa FROM korisnikova_grupa 
       WHERE id_grupe = ? ORDER BY id_korisnikova_grupa ASC`,
      [groupId]
    );

    if (remainingMembers.length === 0) {
      // 4. Ako je korisnik bio zadnji, obriši grupu
      await connection.query(
        `DELETE FROM grupa WHERE id_grupe = ?`,
        [groupId]
      );
      await connection.commit();
      connection.release();

      return res.status(200).json({ message: "Grupa je izbrisana jer je ostala bez članova." });
    }

    // 5. Ako je bio admin, postavi novog admina
    if (isAdmin) {
      const newAdminId = remainingMembers[0].id_korisnikova_grupa;

      await connection.query(
        `UPDATE korisnikova_grupa SET admin_status = 1 
         WHERE id_korisnikova_grupa = ?`,
        [newAdminId]
      );
    }

    await connection.commit();
    connection.release();

    res.status(200).json({ message: "Uspješno ste napustili grupu." });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("Greška pri napuštanju grupe:", err.message);
    res.status(500).json({ error: "Greška pri napuštanju grupe", details: err.message });
  }
};

// Dodavanje novih članova u grupu
exports.addMembersToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userIds} = req.body;

  if (!groupId || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "Nedostaje groupId ili lista korisnika." });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Provjera da grupa postoji
    const [group] = await connection.query(
      `SELECT * FROM grupa WHERE id_grupe = ?`,
      [groupId]
    );
    if (group.length === 0) {
      throw new Error("Grupa ne postoji.");
    }

    // 3. Dodaj korisnike u grupu (admin_status = 0)
    const values = userIds.map(id => [id, groupId, 0]);
    await connection.query(
      `INSERT IGNORE INTO korisnikova_grupa (id_korisnika, id_grupe, admin_status) VALUES ?`,
      [values]
    );

    await connection.commit();
    connection.release();
    res.status(200).json({ message: "Članovi su dodani u grupu." });

  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("Greška pri dodavanju članova:", err.message);
    res.status(500).json({ error: "Greška pri dodavanju članova", details: err.message });
  }
};

// Uklanjanje člana iz grupe
exports.removeMember = async (req, res) => {
  const { groupName, memberId } = req.params;
  console.log("Params received:", req.params);

  try {
    const [group] = await db.query(
      "SELECT id_grupe FROM grupa WHERE ime_grupe = ?",
      [groupName]
    );

    if (group.length === 0) {
      return res.status(404).json({ error: "Grupa ne postoji." });
    }

    const groupId = group[0].id_grupe;

    // Provjera ako je uklonjeni član administrator, u tom slučaju dodjeli se  novi admin status nekom od člana grupe
    const [adminCheck] = await db.query(
      "SELECT admin_status FROM korisnikova_grupa WHERE id_grupe = ? AND id_korisnika = ?",
      [groupId, memberId]
    );

    if (adminCheck.length > 0 && adminCheck[0].admin_status === true) {
      // Ako je administrator, treba dodijeliti novi admin
      const [newAdmin] = await db.query(
        "SELECT id_korisnika FROM korisnikova_grupa WHERE id_grupe = ? AND admin_status = false LIMIT 1",
        [groupId]
      );
      if (newAdmin.length > 0) {
        const newAdminId = newAdmin[0].id_korisnika;
        await db.query(
          "UPDATE korisnikova_grupa SET admin_status = true WHERE id_grupe = ? AND id_korisnika = ?",
          [groupId, newAdminId]
        );
        console.log(`Novi dodijeljeni administrator: ${newAdminId}`);
      }
    }

    // Uklanjanje člana iz grupe
    console.log(`Brisanje člana: memberId=${memberId}, groupId=${groupId}`);
    const result = await db.query(
      "DELETE FROM korisnikova_grupa WHERE id_grupe = ? AND id_korisnika = ?",
      [groupId, memberId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Član nije pronađen u grupi ili je već uklonjen." });
    }

    res.status(200).json({ message: "Član je uspješno izbrisan iz grupe" });
    
  } catch (error) {
    console.error("Greška tijekom brisanja člana iz grupe:", error.message);
    res
      .status(500)
      .json({ error: "Greška tijekom brisanja člana", details: error.message });
  }
};

// Brisanje grupe
exports.deleteGroup = async (req, res) => {
  const { groupName } = req.params;

  try {
    // 1. Provjera se postoji li grupa s tim imenom
    const [group] = await db.query(
      "SELECT id_grupe FROM grupa WHERE ime_grupe = ?",
      [groupName]
    );

    if (group.length === 0) {
      return res.status(404).json({ error: "Grupa nije pronađena" });
    }

    const groupId = group[0].id_grupe;

    // 2. Dohvacaju se svi ID-jevi korisnikova_grupa samo za ovu grupu
    const [userGroups] = await db.query(
      "SELECT id_korisnikova_grupa FROM korisnikova_grupa WHERE id_grupe = ?",
      [groupId]
    );

    const userGroupIds = userGroups.map((row) => row.id_korisnikova_grupa);

    // 3. Ako ima povezanih poruka brisu se
    if (userGroupIds.length > 0) {
      await db.query(
        "DELETE FROM grupna_poruka WHERE fk_korisnikove_grupe IN (?)",
        [userGroupIds]
      );
    }

    // 4. Brišu se sve veze korisnika s ovom grupom
    await db.query("DELETE FROM korisnikova_grupa WHERE id_grupe = ?", [
      groupId,
    ]);

    // 5. Briše se grupa
    await db.query("DELETE FROM grupa WHERE id_grupe = ?", [groupId]);

    res
      .status(200)
      .json({ message: "Grupa i sve povezane poruke uspješno izbrisane" });
  } catch (error) {
    console.error("Greška pri brisanju grupe:", error.message);
    res.status(500).json({
      error: "Greška pri brisanju grupe",
      details: error.message,
    });
  }
};

// Novi endpoint za dohvaćanje svih poruka iz grupe
exports.getGroupMessages = async (req, res) => {
  const { groupName } = req.params;

  try {
    // 1. Pronađi ID grupe po imenu
    const [group] = await db.query(
      "SELECT id_grupe FROM grupa WHERE ime_grupe = ?",
      [groupName]
    );

    if (group.length === 0) {
      return res.status(404).json({ error: "Grupa nije pronađena" });
    }

    const groupId = group[0].id_grupe;

    // 2. Dohvati sve poruke u toj grupi, zajedno s imenom pošiljatelja
    const [messages] = await db.query(
      `
      SELECT 
      gp.id_grupne_poruke,
       gp.sadrzaj_grupne_poruke,
      gp.datum_i_vrijeme_grupne_poruke,
      k.ime_korisnika AS ime_korisnika,
      k.id_korisnika
      FROM grupna_poruka gp
      JOIN korisnikova_grupa kg ON gp.fk_korisnikove_grupe = kg.id_korisnikova_grupa
      JOIN korisnik k ON gp.fk_posiljatelja = k.id_korisnika
      WHERE kg.id_grupe = ?
      ORDER BY gp.datum_i_vrijeme_grupne_poruke ASC
      `,
      [groupId]
      );

    res.json(messages);
  } catch (error) {
    console.error("Greška pri dohvaćanju poruka:", error.message);
    res
      .status(500)
      .json({ error: "Greška pri dohvaćanju poruka", details: error.message });
  }
};
