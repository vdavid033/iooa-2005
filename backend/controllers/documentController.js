const documentService = require('../services/documentService');

// Mapiraj fingirane korisnike
const fakeUsers = {
  'marko456': 1,
  'ivana123': 2
};

exports.getDocumentsByFolder = async (req, res) => {
  try {
    const documents = await documentService.getDocumentsByFolder(Number(req.params.folderId));
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri dohvatu dokumenata' });
  }
};

exports.getDocumentsByUser = async (req, res) => {
  try {
    const documents = await documentService.getDocumentsByUser(Number(req.params.userId));
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri dohvatu dokumenata korisnika' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nije odabran dokument' });
    }

    const username = req.headers.korisnicko_ime;
    const userId = fakeUsers[username];

    if (!userId) {
      return res.status(400).json({ message: 'Korisničko ime nije prepoznato' });
    }

    const folderId = req.body.folderId || null;

    const newDocument = await documentService.uploadDocument({
      file: req.file,
      folderId,
      userId
    });

    res.status(201).json(newDocument);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Greška pri uploadu dokumenta' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const deleted = await documentService.deleteDocument(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: 'Dokument nije pronađen' });
    }
    res.json({ message: 'Dokument uspješno obrisan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri brisanju dokumenta' });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const document = await documentService.getDocumentById(Number(req.params.id));
    if (!document) {
      return res.status(404).json({ message: 'Dokument nije pronađen' });
    }

    const filePath = path.join(__dirname, '../../', document.putanja);
    res.download(filePath, document.ime_dokumenta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri preuzimanju dokumenta' });
  }
};
