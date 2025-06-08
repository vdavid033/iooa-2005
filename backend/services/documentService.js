const db = require('../data/db');
const fs = require('fs');
const path = require('path');

async function getDocumentsByFolder(folderId) {
  const [rows] = await db.query(
    'SELECT * FROM dokument WHERE fk_mape = ?',
    [folderId]
  );
  return rows;
}

/*async function getDocumentsByFolder(folderId, userId) {
  // Example using Sequelize
  return await Document.findAll({
    where: {
      folder_id: folderId,
      user_id: userId 
    }
  });
}*/

async function getDocumentsByUser(userId) {
  const [rows] = await db.query(
    'SELECT * FROM dokument WHERE fk_korisnika = ?',
    [userId]
  );
  return rows;
}

async function uploadDocument({ file, folderId = null, userId }) {
  if (!userId) {
    throw new Error('Korisnički ID je obavezan');
  }

  const userUploadDir = path.join(__dirname, '../../uploads', String(userId));
  if (!fs.existsSync(userUploadDir)) {
    fs.mkdirSync(userUploadDir, { recursive: true });
  }

  const newFileName = `${Date.now()}-${file.originalname}`;
  const newPath = path.join(userUploadDir, newFileName);
  fs.renameSync(file.path, newPath);

  const relativePath = `uploads/${userId}/${newFileName}`;

  const [result] = await db.query(
    'INSERT INTO dokument (ime_dokumenta, putanja, fk_mape, fk_korisnika) VALUES (?, ?, ?, ?)',
    [file.originalname, relativePath, folderId, userId]
  );

  const [rows] = await db.query('SELECT * FROM dokument WHERE id_dokumenta = ?', [result.insertId]);
  return rows[0];
}

async function deleteDocument(documentId) {
  try {
    // 1. Dobivanje dokumenta iz baze
    const [rows] = await db.query('SELECT * FROM dokument WHERE id_dokumenta = ?', [documentId]);
    if (!rows[0]) throw new Error('Dokument nije pronađen');

    // 2. Brisanje fizičke datoteke (ako postoji)
    const filePath = path.join(__dirname, '../../', rows[0].putanja);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 3. Brisanje iz baze
    const [result] = await db.query('DELETE FROM dokument WHERE id_dokumenta = ?', [documentId]);
    return result;
  } catch (err) {
    console.error('Greška u servisu:', err);
    throw err;
  }
}

async function getDocumentById(documentId) {
  const [rows] = await db.query('SELECT * FROM dokument WHERE id_dokumenta = ?', [documentId]);
  return rows[0] || null;
}

module.exports = {
  getDocumentsByFolder,
  getDocumentsByUser,
  uploadDocument,
  deleteDocument,
  getDocumentById
};
