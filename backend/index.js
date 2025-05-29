// API
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const config = require("./auth_config.js");
const authJwt = require("./authJwt.js");
const connection = require("./db.js");

const groupsRoute = require("./routes/groups");
const foldersRoute = require("./routes/folderRoutes");
const objaveRoutes = require('./routes/objaveRoutes');
const komentariRoutes = require('./routes/komentariRoutes');
const tagoviRoutes = require('./routes/tagoviRoutes');
const kategorijeRoutes = require('./routes/kategorijeRoutes');
const messageRoutes = require("./routes/messageRoutes"); // NOVO
const eventsRoutes = require("./routes/events");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  connection.query(
    "SELECT * FROM korisnik WHERE korisnicko_ime = ?",
    [username],
    (error, results) => {
      if (error) return res.status(500).json({ success: false, message: error });
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Korisnik ne postoji" });
      }

      const user = results[0];

      bcrypt.compare(String(password), String(user.lozinka_korisnika), (err, isMatch) => {
        if (err) return res.status(500).json({ success: false, message: err });

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
          { expiresIn: "3h" }
        );

        res.status(200).json({ success: true, token });
      });
    }
  );
});

// RUTE
app.use("/api/groups", groupsRoute);
app.use("/api/folders", foldersRoute);
app.use('/api/objave', objaveRoutes);
app.use('/api/comments', komentariRoutes);
app.use('/api/tagovi', tagoviRoutes);
app.use('/api/kategorije', kategorijeRoutes);
app.use("/api/messages", messageRoutes); // NOVO
app.use("/api/events", eventsRoutes);

// SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
