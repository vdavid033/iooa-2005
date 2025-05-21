// Uvoz glavnog Express modula koji se koristi za izgradnju web servera
const express = require('express');
const cors = require('cors')
// Kreiranje Express aplikacije (instanca servera)
const app = express();

// Definiranje porta na kojem će server slušati HTTP zahtjeve (3000 je lokalni standard)
const PORT = 3000;
app.use(cors());     
// Middleware koji omogućuje Expressu da automatski parsira JSON tijela zahtjeva
// (zamjenjuje potrebu za "body-parser" paketom)
app.use(express.json());

// Uvoz rute za rad s grupama (grupne poruke, članovi, CRUD grupe)
const groupsRoute = require('./routes/groups');

// Uvoz rute za rad s folderima (vjerojatno organizacija datoteka ili mape u aplikaciji)
const foldersRoute = require('./routes/folderRoutes');

// Registracija rute za sve zahtjeve koji počinju s /api/groups (npr. GET /api/groups/:id/messages)
app.use('/api/groups', groupsRoute);

// Registracija rute za sve zahtjeve koji počinju s /api/folders
app.use('/api/folders', foldersRoute);

// Pokretanje Express servera na definiranom portu, i ispis poruke da je sve spremno
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
