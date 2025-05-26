// API
const express = require('express')
const app = express()
const PORT = 3000
const cors = require('cors')

app.use(cors({
    origin: 'http://localhost:9000'
}))

app.use(express.json())

app.use('/api/folders', require('./routes/folderRoutes'))
app.use('/api/documents', require('./routes/documentRoutes'))

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})