const express = require('express')
const router = express.Router()
//const controller = require('../controllers/documentController')
//const isAdmin = require('../middlewares/isAdmin')
// const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
const controller = require('../controllers/komentarController')
const { verifyTokenUser } = require('../authJwt')

//router.get('/:folderId', controller.getDocumentsByFolder)
// router.post('/upload', isAdmin, upload.single('file'), controller.uploadDocument)
//router.delete('/:id', isAdmin, controller.deleteDocument)
//router.get('/download/:id', controller.downloadDocument)
router.post('/', verifyTokenUser, controller.createKomentar)
router.get('/:id_objava', controller.getKomentariByObjava)

module.exports = router