const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupsController');

// Grupe
router.get('/', controller.getGroups); // Dohvat svih grupa
router.post('/', controller.createGroup); // Kreiranje nove grupe
router.delete('/:groupName', controller.deleteGroup); // Brisanje grupe

// Poruke
router.post('/:groupName/messages', controller.sendMessage); // Slanje poruke u grupu

// Članovi
router.post('/:groupName/members', controller.addMembers);  // Dodavanje članova u grupu
router.delete('/:groupName/members/:memberId', controller.removeMember); // Micanje člana iz grupe

module.exports = router;
