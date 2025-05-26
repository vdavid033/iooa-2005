const db = require('../data/db')

async function getRootFolders () {
    const [rows] = await db.query('SELECT * FROM mapa WHERE id_parent_mapa IS NULL')
    return rows
}

async function getSubfolders (parentId) {
    const [rows] = await db.query('SELECT * FROM mapa WHERE id_parent_mapa = ?', [parentId])
    return rows
}

async function createFolder ({ime_mape, id_parent_mapa = null}) {
    const [result] = await db.query(
        'INSERT INTO mapa (ime_mape, id_parent_mapa) VALUES (?, ?)',
        [ime_mape, id_parent_mapa]
    )

    const [rows] = await db.query('SELECT * FROM mapa WHERE id_mape = ?', [result.insertId])
    return rows[0]
}

async function renameFolder (id, newName) {
    await db.query('UPDATE mapa SET ime_mape = ? WHERE id_mape = ?', [newName, id])

    const [rows] = await db.query('SELECT * FROM mapa WHERE id_mape = ?', [id])
    return rows[0]
}

async function deleteFolder (id) {
    const [rows] = await db.query('SELECT * FROM mapa WHERE id_mape = ?', [id])
    await db.query('DELETE FROM mapa WHERE id_mape = ?', [id])
    return rows[0] || null
}

module.exports = {
    getRootFolders,
    getSubfolders,
    createFolder,
    renameFolder,
    deleteFolder
}