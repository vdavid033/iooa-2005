const jwt = require('jsonwebtoken')
const config = require('../auth_config')

module.exports = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.status(403).json({message: 'Token nije poslan'})

   /* try {
        const decoded = jwt.verify(token, config.secret)
        if (decoded.uloga !== 1) {
            return res.status(403).json({message: 'Samo admin ima pristup'})
        }
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({message: 'Neispravan token'})
    }*/


         try {
        const decoded = jwt.verify(token, config.secret);
        
        // Dodajemo sve korisničke podatke u req.user
        req.user = {
            id: decoded.id,
            username: decoded.username,
            uloga: decoded.uloga,
            isAdmin: decoded.uloga === 1 // 1 = admin, 0 = običan korisnik
        };
        
        next(); // Dopusti pristup svim autentificiranim korisnicima
    } catch (err) {
        console.error('Greška pri verifikaciji tokena:', err);
        return res.status(403).json({ message: 'Nevažeći token' });
    }

}