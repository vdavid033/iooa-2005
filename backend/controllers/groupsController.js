const groupService = require('../services/groupService');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await groupService.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Greška pri dohvaćanju korisnika:', err);
    res.status(500).json({ error: 'Neuspješno dohvaćanje korisnika' });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const result = await groupService.createGroup(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Greška pri stvaranju grupe:", err.message);
    res.status(500).json({ error: "Greška pri stvaranju grupe", details: err.message });
  }
};
