const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentController');
const isAdmin = require('../middlewares/isAdmin'); 
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


router.get('/:folderId', isAdmin, controller.getDocumentsByFolder);
router.post('/upload', isAdmin, upload.single('file'), controller.uploadDocument);
router.delete('/:id',  isAdmin, controller.deleteDocument); 
router.get('/download/:id',isAdmin, controller.downloadDocument);

module.exports = router;