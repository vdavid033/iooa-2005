const express = require('express')
const router = express.Router()
const controller = require('../controllers/folderController')
const {verifyTokenUser, verifyTokenAdmin} = require('../authJwt')

router.use(verifyTokenUser)

router.get('/', controller.getRootFolders)
router.get('/:parentId', controller.getSubfolders)
router.post('/', verifyTokenAdmin, controller.createFolder)
router.put('/:id', verifyTokenAdmin, controller.renameFolder)
router.delete('/:id', verifyTokenAdmin, controller.deleteFolder)

module.exports = router