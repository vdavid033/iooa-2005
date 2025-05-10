const folderService = require('../services/folderService')

exports.getRootFolders = async (req, res) => {
    try {
        const folders = await folderService.getRootFolders()
        res.json(folders)
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Error fetching root folders'})
    }
}

exports.getSubfolders = async (req, res) => {
    try {
        const folders = await folderService.getSubfolders(Number(req.params.parentId))
        res.json(folders)
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Error fetching subfolders'})
    }
}

exports.createFolder = async (req, res) => {
    try {
        const {ime_mape, id_parent_mapa, fk_kolegija} = req.body
        if (!ime_mape) return res.status(400).json({message: 'Ime mape je obavezno'})
        if (!fk_kolegija) return res.status(400).json({message: 'Mapa mora pripadati određenom kolegiju'})

        const newMap = await folderService.createFolder({ime_mape, id_parent_mapa, fk_kolegija})
        res.status(201).json(newMap)
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Error creating folder'})
    }
}

exports.renameFolder = async (req, res) => {
    try {
        const {ime_mape} = req.body
        if (!ime_mape) return res.status(400).json({message: 'Ime mape je obavezno'})

        const updated = await folderService.renameFolder(Number(req.params.id), ime_mape)
        if (!updated) return res.status(404).json({message: 'Mapa nije pronađena'})

        res.json({message: 'Mapa je ažurirana', mapa: updated})
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Error updating folder'})
    }
}

exports.deleteFolder = async (req, res) => {
    try {
        const deleted = await folderService.deleteFolder(Number(req.params.id))
        if (!deleted) return res.status(404).json({message: 'Mapa nije pronađena'})

        res.json({message: `Mapa '${deleted.ime_mape}' je obrisana`})
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Error deleting folder'})
    }
}