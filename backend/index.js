// API
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('./auth_config')
const authJwt = require('./authJwt')
const connection = require('./data/db')

const app = express()
const PORT = 3000

app.use(cors({origin: 'http://localhost:9000'}))
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))

app.post("/api/login", async (req, res) => {
    try {
        const {username, password} = req.body

        const [rows] = await connection.query(
            'SELECT * FROM korisnik WHERE korisnicko_ime = ?',
            [username]
        )

        if (!rows.length) {
            return res.status(404).json({success: false, message: "Korisnik ne postoji"})
        }

        const user = rows[0]
        const isMatch = await bcrypt.compare(String(password), String(user.lozinka_korisnika))

        if (!isMatch) {
            return res.status(401).json({success: false, message: "Krivo korisničko ime ili lozinka"})
        }

        const token = jwt.sign(
            {
                id: user.id_korisnika,
                ime: user.ime_korisnika,
                prezime: user.prezime_korisnika,
                uloga: user.admin_status === 1 ? 'admin' : 'user',
            },
            config.secret,
            {expiresIn: '3h'}
        )

        res.status(200).json({success: true, token})
    } catch (err) {
        console.error(err)
        res.status(500).json({success: false, message: "Greška na serveru"})
    }
})

app.post('/logout', (req, res) => {
    res.status(200).json({message: 'Odjava uspješna'})
})

app.use('/api/folders', require('./routes/folderRoutes'))
app.use('/api/documents', require('./routes/documentRoutes'))

/*const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const config = require("./auth_config.js");
const authJwt = require("./authJwt.js");
const connection = require("./db.js");*/

const groupsRoute = require("./routes/groups");
const foldersRoute = require("./routes/folderRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LOGIN ROUTE
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  connection.query(
    "SELECT * FROM korisnik WHERE korisnicko_ime = ?",
    [username],
    (error, results) => {
      if (error) {
        return res.status(500).json({ success: false, message: error });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Korisnik ne postoji" });
      }

      const user = results[0];

      bcrypt.compare(String(password), String(user.lozinka_korisnika), (err, isMatch) => {
        if (err) {
          return res.status(500).json({ success: false, message: err });
        }

        if (!isMatch) {
          return res.status(401).json({ success: false, message: "Krivo korisničko ime ili lozinka" });
        }

        const token = jwt.sign(
          {
            id: user.id_korisnika,
            ime: user.ime_korisnika,
            prezime: user.prezime_korisnika,
            uloga: user.admin_status,
          },
          config.secret,
          { expiresIn: '3h' }
        );

        res.status(200).json({ success: true, token });
      });
    }
  );
});

// Other routes
app.use("/api/groups", groupsRoute);
app.use("/api/folders", foldersRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
