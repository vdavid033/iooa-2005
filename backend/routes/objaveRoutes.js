const express = require('express')
const router = express.Router()
const controller = require('../controllers/objavaController')
const { verifyTokenUser } = require('../authJwt')

// Sve objave
router.get('/', controller.getAllObjave)
// Filtrirane objave po tagovima
router.get('/filtrirane', controller.getFilteredObjave)
// Jedna objava po ID-u
router.get('/:id', controller.getObjavaById)
// Kreiraj novu objavu
router.post('/', verifyTokenUser, controller.createObjava)
// Uredi objavu – samo ako je korisnik vlasnik
router.put('/:id', verifyTokenUser, controller.updateObjava)

module.exports = router