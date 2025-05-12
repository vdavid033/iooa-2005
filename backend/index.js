// Uvoz potrebnih modula
//const express = require('express');
const bodyParser = require('body-parser'); // Za parsiranje JSON tijela
const mysql = require('mysql2'); 
//const app = express();
//const port = process.env.PORT || 3000; // Port na kojem će server slušati

// Uvoz rute (routes) za grupe
const groupsRoute = require('./routes/groups');

// Middleware za parsiranje JSON tijela
app.use(bodyParser.json());  // Omogućava parsiranje JSON-a u tijelu zahtjeva

// Postavljanje ruta
app.use('/api/groups', groupsRoute);  

// Pokretanje servera
/*app.listen(port, () => {
  console.log(`Server pokrenut na portu ${port}`);
});*/
// API
const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

app.use('/api/folders', require('./routes/folderRoutes'))

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
