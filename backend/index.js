// API
const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

app.use('/api/folders', require('./routes/folderRoutes'))

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})