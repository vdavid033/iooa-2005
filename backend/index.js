const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("./auth_config");
const connection = require("./data/db");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:9000" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await connection.query(
      "SELECT * FROM korisnik WHERE korisnicko_ime = ?",
      [username]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Korisnik ne postoji" });
    }

    const user = rows[0];

    if (user.zakljucan === 1) {
      return res.status(403).json({
        success: false,
        message: "Korisnik je zaključan. Obratite se adminu",
      });
    } else if (user.zakljucan === -1) {
      return res.status(403).json({
        success: false,
        message: "Korisnik čeka odobrenje admina",
      });
    }

    const isMatch = await bcrypt.compare(
      String(password),
      String(user.lozinka_korisnika)
    );

    if (!isMatch) {
      let attempts = (user.neuspjeli_pokusaji || 0) + 1;
      let updateFields = { neuspjeli_pokusaji: attempts };

      let message = "Krivo korisničko ime ili lozinka";

      if (attempts >= 5) {
        updateFields.zakljucan = 1;
        message =
          "Korisnik je zaključan zbog previše neuspjelih pokušaja, obratite se adminu";
      } else if (attempts > 1) {
        const left = 5 - attempts;
        message += `. Preostalo pokušaja: ${left}`;
      }

      await connection.query(
        "UPDATE korisnik SET neuspjeli_pokusaji = ?, zakljucan = IF(?, ?, zakljucan) WHERE id_korisnika = ?",
        [updateFields.neuspjeli_pokusaji, updateFields.zakljucan === 1 ? 1 : 0, updateFields.zakljucan === 1 ? 1 : 0, user.id_korisnika]
      );

      return res.status(attempts >= 5 ? 403 : 401).json({
        success: false,
        message,
      });
    }

    await connection.query(
      "UPDATE korisnik SET neuspjeli_pokusaji = NULL, zakljucan = 0, zadnja_prijava = NOW() WHERE id_korisnika = ?",
      [user.id_korisnika]
    );

    const token = jwt.sign(
      {
        id: user.id_korisnika,
        ime: user.ime_korisnika,
        prezime: user.prezime_korisnika,
        uloga: user.admin_status === 1 ? "admin" : "user",
      },
      config.secret,
      { expiresIn: "3h" }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Greška na serveru" });
  }
});

app.post("/logout", (req, res) => {
  res.status(200).json({ message: "Odjava uspješna" });
});

app.use("/api/groups", require("./routes/groups"));
app.use("/api/folders", require("./routes/folderRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/regaKorisnika", require("./routes/register"));
app.use("/api", require("./routes/calendarRoutes"));
app.use("/api/tagovi", require("./routes/tagoviRoutes"));
app.use("/api/kategorije", require("./routes/kategorijeRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/events", require("./routes/events"));
app.use("/api/objave", require("./routes/objaveRoutes"));
app.use("/api/comments", require("./routes/komentariRoutes"));
app.use("/api", require("./routes/reportRoutes"));
app.use("/accountUpdate", require("./routes/accountRoutes"));
app.use("/notes", require("./routes/accountNotesRoutes"));
app.use("/adminAccountCheck", require("./routes/accountManagementRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
