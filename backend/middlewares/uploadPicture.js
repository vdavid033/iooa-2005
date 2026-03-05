const multer = require('multer')
const path = require('path')

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // ensure this folder exists and is writable
  },
  filename: (req, file, cb) => {
    const userId = req.params.id || 'unknown'
    const ext = path.extname(file.originalname)
    cb(null, `profile_${userId}_${Date.now()}${ext}`)
  }
})

const upload = multer({ storage })

module.exports = upload
