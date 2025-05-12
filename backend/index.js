// API

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require ("jsonwebtoken");
const config = require("./auth_config.js");
const authJwt = require("./authJwt.js");
const connection = require("./db.js")
   


const app = express();
const port = 3001;


// Parser za JSON podatke
app.use(bodyParser.json());

// Parser za podatke iz formi
app.use(bodyParser.urlencoded({ extended: true }));
 
//app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/api/login", (req, res) => {
    const data = req.body;
    const username = data.username;
    const passwd = data.password;

    console.log("Primljeni podaci:", data); // Log za ulazne podatke

    connection.query("SELECT * FROM korisnik WHERE korisnicko_ime = ?", [username], (error, sqlresults) => {
        console.log("Rezultat SQL upita:", sqlresults); // Log za SQL rezultate
        if (error) {
            console.error("Greška u SQL upitu:", error);
            res.status(500).json({ success: false, message: error });
        } else {
            if (sqlresults.length > 0) {
                bcrypt.compare(String(passwd), String(sqlresults[0].lozinka_korisnika), (error, cmpresults) => {
                    console.log("Rezultat usporedbe lozinki:", cmpresults); // Log za usporedbu lozinki
                    if (error) {
                        console.error("Greška pri usporedbi lozinki:", error);
                        res.status(500).json({ success: false, message: error });
                    } else {
                        if (cmpresults) {
                            const token = jwt.sign(
                                { 
                                    id: sqlresults[0].id_korisnika, 
                                    ime: sqlresults[0].ime_korisnika, 
                                    prezime: sqlresults[0].prezime_korisnika, 
                                    uloga: sqlresults[0].admin_status 
                                }, 
                                config.secret
                            );
                            console.log("Generirani token:", token); // Log za generirani token
                            res.status(200).json({ success: true, token: token });
                        } else {
                            res.status(401).json({ success: false, message: "Krivo korisničko ime ili lozinka" });
                        }
                    }
                });
            } else {
                res.status(404).json({ success: false, message: "Korisnik ne postoji" });
            }
        }
    });
});



app.listen(port, () => {
    console.log("Server running at port: " + port);
});


