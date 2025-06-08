const documentService = require('../services/documentService');

const path = require('path');

/*
exports.getDocumentsByFolder = async (req, res) => {
  try {
    const documents = await documentService.getDocumentsByFolder(
      Number(req.params.folderId),
      req.user.id // Saljemo user ID za autorizaciju
    );
    res.json(documents);
  } catch (err) {
    console.error(err);
    console.log(err);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};*/

exports.getDocumentsByFolder = async (req, res) => {
    try {
        console.log('Korisnik koji pristupa:', {
            id: req.user.id,
            uloga: req.user.uloga
        });

        const folderId = Number(req.params.folderId);
        if (isNaN(folderId)) {
            return res.status(400).json({ message: 'Nevažeći ID mape' });
        }

        const documents = await documentService.getDocumentsByFolder(folderId);
        res.json(documents);
    } catch (err) {
        console.error('Greška:', err);
        res.status(500).json({ message: 'Greška pri dohvatu dokumenata' });
    }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newDocument = await documentService.uploadDocument({
      file: req.file,
      folderId: req.body.folderId || null,
      userId: req.user.id,
      username: req.user.username
    });

    res.status(201).json(newDocument);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: err.message || 'Error uploading document',
      ...(err.fileTypeError && { invalidFileType: true })
    });
  }
};

/*
exports.deleteDocument = async (req, res) => {
  try {
    const document = await documentService.getDocumentById(Number(req.params.id));
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Provjera vlasništva
    if (document.korisnik_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to delete this document' });
    }

    await documentService.deleteDocument(Number(req.params.id));
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting document' });
  }
};
*/
exports.deleteDocument = async (req, res) => {
  try {
    console.log('Korisnik koji pokušava brisati:', req.user); // Debug log
    
    const document = await documentService.getDocumentById(Number(req.params.id));
    if (!document) {
      return res.status(404).json({ message: 'Dokument nije pronađen' });
    }

    // Debug: Ispis vlasnika dokumenta i korisnika
    console.log('Vlasnik dokumenta:', document.korisnik_id, 'Trenutni korisnik:', req.user.id);

    // Provjera da li je korisnik vlasnik dokumenta
   /* if (document.korisnik_id !== req.user.id) {
      return res.status(403).json({ message: 'Možete brisati samo svoje dokumente' });
    }*/

    await documentService.deleteDocument(Number(req.params.id));
    res.json({ message: 'Dokument uspješno obrisan' });
  } catch (err) {
    console.error('Cijela greška:', err);
    res.status(500).json({ 
      message: 'Greška pri brisanju dokumenta',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};


exports.downloadDocument = async (req, res) => {
  try {
    const document = await documentService.getDocumentById(Number(req.params.id));

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Provjera ovlasti
    if (document.korisnik_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to download this document' });
    }

    const filePath = path.join(__dirname, '../../uploads', document.filename);
    res.download(filePath, document.originalname);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error downloading document' });
  }
};

// Admin funkcije
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await documentService.getAllDocuments();
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all documents' });
  }
};

exports.adminDeleteDocument = async (req, res) => {
  try {
    await documentService.deleteDocument(Number(req.params.id));
    res.json({ message: 'Document deleted by admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting document' });
  }
};