const express = require('express')
const router = express.Router()
const controller = require('../controllers/folderController')
const isAdmin = require('../middlewares/isAdmin')

router.get('/', controller.getRootFolders)
router.get('/:parentId', controller.getSubfolders)
router.post('/', isAdmin, controller.createFolder)
router.put('/:id', isAdmin, controller.renameFolder)
router.delete('/:id', isAdmin, controller.deleteFolder)

module.exports = router