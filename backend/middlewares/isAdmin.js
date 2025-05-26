const db = require('../data/db')

module.exports = async (req, res, next) => {
    const korisnickoIme = req.headers['korisnicko_ime']

    if (!korisnickoIme) {
        return res.status(400).json({message: 'Nedostaje korisnicko_ime u request zaglavlju'})
    }

    try {
        const [rows] = await db.query(
            'SELECT admin_status FROM korisnik WHERE korisnicko_ime = ?',
            [korisnickoIme]
        )

        if (!rows.length) {
            return res.status(404).json({message: 'Korisnik nije pronađen'})
        }

        const isAdmin = rows[0].admin_status === 1

        if (!isAdmin) {
            return res.status(403).json({message: 'Zabranjeno – samo admin'})
        }

        next()
    } catch (err) {
        console.error('Greška u isAdmin middlewareu:', err)
        res.status(500).json({message: 'Unutarnja serverska greška'})
    }
}