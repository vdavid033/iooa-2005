const db = require('../data/db')
const fs = require('fs')
const path = require('path')

async function getDocumentsByFolder(folderId) {
  const [rows] = await db.query(
    'SELECT * FROM dokument WHERE fk_mape = ?',
    [folderId]
  )
  return rows
}

async function uploadDocument({ file, folderId, userId }) {
  const uploadDir = path.join(__dirname, '../../uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  
  const newFileName = `${Date.now()}-${file.originalname}`
  const newPath = path.join(uploadDir, newFileName)
  fs.renameSync(file.path, newPath)

  const [result] = await db.query(
    'INSERT INTO dokument (ime_dokumenta, putanja, fk_mape, fk_korisnika) VALUES (?, ?, ?, ?)',
    [file.originalname, `/uploads/${newFileName}`, folderId, userId]
  )

  const [rows] = await db.query('SELECT * FROM dokument WHERE id_dokumenta = ?', [result.insertId])
  return rows[0]
}

async function deleteDocument(documentId) {
  const [rows] = await db.query('SELECT * FROM dokument WHERE id_dokumenta = ?', [documentId])
  await db.query('DELETE FROM dokument WHERE id_dokumenta = ?', [documentId])

  return rows[0] || null
}

async function getDocumentById(documentId) {
  const [rows] = await db.query('SELECT * FROM dokument WHERE id_dokumenta = ?', [documentId])
  return rows[0] || null
}

module.exports = {
  getDocumentsByFolder,
  uploadDocument,
  deleteDocument,
  getDocumentById
}