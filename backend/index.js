const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('./auth_config');
const authJwt = require('./authJwt');
const connection = require('./data/db');

const groupsRoute = require('./routes/groups');
const foldersRoute = require('./routes/folderRoutes');
const documentsRoute = require('./routes/documentRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const registerRoute = require('./routes/register')



const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:9000' }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await connection.query(
      'SELECT * FROM korisnik WHERE korisnicko_ime = ?',
      [username]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Korisnik ne postoji" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(String(password), String(user.lozinka_korisnika));

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Krivo korisničko ime ili lozinka" });
    }

    const token = jwt.sign(
      {
        id: user.id_korisnika,
        ime: user.ime_korisnika,
        prezime: user.prezime_korisnika,
        uloga: user.admin_status === 1 ? 'admin' : 'user',
      },
      config.secret,
      { expiresIn: '3h' }
    );

    res.status(200).json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Greška na serveru" });
  }
});

// LOGOUT (dummy)
app.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Odjava uspješna' });
});

// Rute
app.use('/api/groups', groupsRoute);
app.use('/api/folders', foldersRoute);
app.use('/api/documents', documentsRoute);
app.use('/regaKorisnika', registerRoute)
app.use('/api', calendarRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


