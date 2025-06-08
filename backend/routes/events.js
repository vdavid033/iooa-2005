const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

router.get('/:datum', eventsController.getEventsByDate);
router.get('/dates/:year/:month', eventsController.getEventDates);
router.post('/', eventsController.createEvent);
router.put('/:id', eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

module.exports = router;
