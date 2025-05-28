const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupsController');
const validateMessageInput = require('../middlewares/validateMessageInput')

//Dohvat korisnika
router.get('/users/all', controller.getAllUsers);



// Grupe
router.get('/:userId', controller.getGroups); // Dohvat svih grupa
router.post('/', controller.createGroup); // Kreiranje nove grupe
router.delete('/:groupName', controller.deleteGroup); // Brisanje grupe

//Dohvati grupne poruke
router.get('/:groupName/messages', controller.getGroupMessages); // sad koristi isti naziv kao na vrhu

// Poruke
//router.post('/:groupName/messages', controller.sendMessage); // Slanje poruke u grupu
router.post('/:groupName/messages', validateMessageInput, controller.sendMessage)


// Članovi
router.get('/:groupName/members', controller.getGroupMembers);
router.post('/:groupId/members', controller.addMembersToGroup);  // Dodavanje članova u grupu
router.delete('/:groupName/members/:memberId', controller.removeMember); // Micanje člana iz grupe
router.post('/leave', controller.leaveGroup); // Izlazak iz grupe


module.exports = router;
