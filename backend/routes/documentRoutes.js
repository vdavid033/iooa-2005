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

router.get('/:folderId', controller.getDocumentsByFolder);
router.post('/upload', upload.single('file'), controller.uploadDocument);
router.delete('/:id', controller.deleteDocument); // isAdmin middleware je komentiran
router.get('/download/:id', controller.downloadDocument);

module.exports = router;