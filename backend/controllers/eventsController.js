const eventService = require('../services/eventService');

exports.getEventsByDate = async (req, res) => {
  const { datum } = req.params;
  try {
    const events = await eventService.getEventsByDate(datum);
    res.json(events);
  } catch (err) {
    console.error('Greška pri dohvaćanju događaja:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getEventDates = async (req, res) => {
  const { year, month } = req.params;
  try {
    const dates = await eventService.getEventDates(year, month);
    res.json(dates);
  } catch (err) {
    console.error('Greška pri dohvaćanju datuma:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const insertId = await eventService.createEvent(req.body);
    res.status(201).json({ id: insertId });
  } catch (err) {
    console.error('Greška pri kreiranju događaja:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await eventService.updateEvent(id, req.body);
    res.json({ message: 'Događaj ažuriran' });
  } catch (err) {
    console.error('Greška pri ažuriranju događaja:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await eventService.deleteEvent(id);
    res.json({ message: 'Događaj obrisan' });
  } catch (err) {
    console.error('Greška pri brisanju događaja:', err);
    res.status(500).json({ error: err.message });
  }
};
