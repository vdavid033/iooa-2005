const folderService = require('../services/folderService')

exports.getRootFolders = async (req, res) => {
    try {
        const folders = await folderService.getRootFolders()
        res.json(folders)
    } catch (err) {
        res.status(500).json({message: 'Došlo je do greške prilikom učitavanja mapa.'})
    }
}

exports.getSubfolders = async (req, res) => {
    try {
        const folders = await folderService.getSubfolders(Number(req.params.parentId))
        res.json(folders)
    } catch (err) {
        res.status(500).json({message: 'Došlo je do greške prilikom učitavanja podmapa.'})
    }
}

exports.createFolder = async (req, res) => {
    try {
        const {ime_mape, id_parent_mapa} = req.body
        if (!ime_mape) return res.status(400).json({message: 'Ime mape je obavezno'})

        const newMap = await folderService.createFolder({ime_mape, id_parent_mapa})
        res.status(201).json(newMap)
    } catch (err) {
        res.status(500).json({message: 'Dogodila se greška prilikom kreiranja mape.'})
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
        res.status(500).json({message: 'Dogodila se greška prilikom preimenovanja mape.'})
    }
}

exports.deleteFolder = async (req, res) => {
    try {
        const deleted = await folderService.deleteFolder(Number(req.params.id))
        if (!deleted) return res.status(404).json({message: 'Mapa nije pronađena'})

        res.json({message: `Mapa '${deleted.ime_mape}' je obrisana`})
    } catch (err) {
        res.status(500).json({message: 'Dogodila se greška prilikom brisanja mape.'})
    }
}