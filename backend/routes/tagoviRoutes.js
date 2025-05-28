const express = require('express')
const router = express.Router()
const controller = require('../controllers/tagoviController')

router.get('/', controller.getAllTagovi)

module.exports = router
