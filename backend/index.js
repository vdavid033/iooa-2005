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
    //id_korisnika	ime_korisnika	prezime_korisnika	korisnicko_ime	lozinka_korisnika admin_status 	
    connection.query("SELECT * FROM korisnik WHERE korisnicko_ime = ?", [username], (error, sqlresults) => {
        console.log("sqlresults ", sqlresults);
        if (error) {
          res.status(500).json({ success: false, message:error});
        } else {
          if (sqlresults.length > 0) {
            bcrypt.compare(String(passwd), String(sqlresults[0].lozinka_korisnika), (error, cmpresults) => {
              console.log(cmpresults);
              if (error) {
                res.status(500).json({ success: false, message:error});
              } else {
                if (cmpresults) {
                  console.log('OK', cmpresults);
                  const token = jwt.sign(
                    { 
                      id: sqlresults[0].id_korisnika, 
                      ime: sqlresults[0].ime_korisnika, 
                      prezime: sqlresults[0].prezime_korisnika, 
                      uloga: sqlresults[0].admin_status 
                    }, 
                    config.secret);
                  res.status(200).json({ success: true, token:token})
                  } else {
                  //console.log('Comparison error: ', error);
                  res.status(401).json({ success: false, message: "Krivo korisničko ime ili lozinka"})
                }
              }
            });
          } else {
            res.status(404).json({ success: false, message: "Korisnik ne postoji"})
          }
        }
      });
    });
    

app.listen(port, () => {
    console.log("Server running at port: " + port);
});