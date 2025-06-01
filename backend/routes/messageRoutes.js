// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.get('/svi-korisnici', messageController.getAllUsers);
router.get('/korisnici/:id', messageController.getMessagedUsers);
router.get('/poruke/:korisnik1/:korisnik2', messageController.getMessagesBetweenUsers);
router.post('/poruke', messageController.sendMessage);
router.get('/zadnje-poruke/:trenutniKorisnikId', messageController.getLastMessagesForAllContacts);
router.get('/new-messages/:id', messageController.getNewMessages);

module.exports = router;