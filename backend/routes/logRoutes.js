const express = require('express')
const router = express.Router()
const controller = require('../controllers/logController')
const { verifyTokenUser } = require('../authJwt')

router.use(verifyTokenUser)

router.get('/', controller.getDocumentLogs)

module.exports = router
