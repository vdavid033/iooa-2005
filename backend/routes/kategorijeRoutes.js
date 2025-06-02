const express = require('express')
const router = express.Router()
const controller = require('../controllers/kategorijeController')

router.get('/', controller.getAllKategorije)

module.exports = router
