// middleware/validateMessageInput.js

module.exports = function validateMessageInput(req, res, next) {
  const { senderId, content } = req.body

  if (!senderId || typeof senderId !== 'number') {
    return res.status(400).json({ error: 'senderId mora biti broj i ne smije nedostajati' })
  }

  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'content mora biti neprazan string' })
  }

  // Ako sve prođe, idemo dalje
  next()
}
