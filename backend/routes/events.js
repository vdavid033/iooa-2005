const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

router.get('/events/:datum', eventsController.getEventsByDate);
router.get('/events/dates/:year/:month', eventsController.getEventDates);
router.post('/events', eventsController.createEvent);
router.put('/events/:id', eventsController.updateEvent);
router.delete('/events/:id', eventsController.deleteEvent);

module.exports = router;
