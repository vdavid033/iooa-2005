const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupsController');

//Dohvat korisnika
router.get('/users/all', controller.getAllUsers);


//Dohvati grupne poruke
router.get('/:groupName/messages', controller.getGroupMessages); // sad koristi isti naziv kao na vrhu


// Grupe
router.get('/', controller.getGroups); // Dohvat svih grupa
router.post('/', controller.createGroup); // Kreiranje nove grupe
router.delete('/:groupName', controller.deleteGroup); // Brisanje grupe

// Poruke
//router.post('/:groupName/messages', controller.sendMessage); // Slanje poruke u grupu
const validateMessageInput = require('../middlewares/validateMessageInput')

router.post('/:groupName/messages', validateMessageInput, controller.sendMessage)


// Članovi
router.post('/:groupName/members', controller.addMembers);  // Dodavanje članova u grupu
router.delete('/:groupName/members/:memberId', controller.removeMember); // Micanje člana iz grupe

module.exports = router;
