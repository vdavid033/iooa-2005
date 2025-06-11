const express = require('express')
const router = express.Router()
const controller = require('../controllers/documentController')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const {verifyTokenUser} = require('../authJwt')

router.use(verifyTokenUser)

router.get('/:folderId', controller.getDocumentsByFolder)
router.post('/upload', upload.single('file'), controller.uploadDocument)
router.delete('/:id', controller.deleteDocument)
router.get('/download/:id', controller.downloadDocument)

module.exports = router