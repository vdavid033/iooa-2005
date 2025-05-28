const express = require('express')
const router = express.Router()
//const controller = require('../controllers/documentController')
const controller = require('../controllers/objavaController')
const { verifyTokenUser } = require('../authJwt')
//const isAdmin = require('../middlewares/isAdmin')
// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })

//router.get('/:folderId', controller.getDocumentsByFolder)
// router.post('/upload', isAdmin, upload.single('file'), controller.uploadDocument)
//router.delete('/:id', isAdmin, controller.deleteDocument)
//router.get('/download/:id', controller.downloadDocument)
// Sve objave
router.get('/', controller.getAllObjave)
// Filtrirane objave po tagovima
router.get('/filtrirane', controller.getFilteredObjave)
// Jedna objava po ID-u
router.get('/:id', controller.getObjavaById)
// Kreiraj novu objavu
router.post('/', verifyTokenUser, controller.createObjava)

module.exports = router