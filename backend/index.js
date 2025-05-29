const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const eventsRoutes = require('./routes/events');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// SVE rute iz routes/events.js sada idu pod /api
app.use('/api', eventsRoutes);

app.listen(port, () => {
  console.log(`Server radi na http://localhost:${port}`);
});
