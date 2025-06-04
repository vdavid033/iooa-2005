const express = require('express')
const router = express.Router()
const controller = require('../controllers/documentController')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const {verifyTokenUser, verifyTokenAdmin} = require('../authJwt')

router.use(verifyTokenUser)

router.get('/:folderId', controller.getDocumentsByFolder)
router.post('/upload', verifyTokenAdmin, upload.single('file'), controller.uploadDocument)
router.delete('/:id', verifyTokenAdmin, controller.deleteDocument)
router.get('/download/:id', controller.downloadDocument)

module.exports = router