const jwt = require("jsonwebtoken");
const config = require("./auth_config.js");

// Admin middleware
const verifyTokenAdmin = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
        return res.status(403).send({
            message: "No token provided!",
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!",
            });
        }
        
        req.user = decoded;
        req.userId = decoded.id; 
        
        if (decoded.uloga === "admin") {
            next();
        } else {
            res.status(403).send({
                message: "Require Admin Role!",
            });
        }
    });
};

// USER MIDDLEWARE - CLEAN VERSION
const verifyTokenUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ 
            message: 'Token nije poslan',
            success: false,
            error: 'NO_TOKEN'
        });
    }

    try {
        const decoded = jwt.verify(token, config.secret);
        
        
        req.user = decoded;
        
        next();
        
    } catch (err) {
        let errorResponse = {
            success: false,
            error: err.name
        };
        
        if (err.name === 'TokenExpiredError') {
            errorResponse.message = 'Token je istekao';
            return res.status(401).json(errorResponse);
        } else if (err.name === 'JsonWebTokenError') {
            errorResponse.message = 'Neispravna struktura tokena';
            return res.status(401).json(errorResponse);
        } else if (err.name === 'NotBeforeError') {
            errorResponse.message = 'Token još nije aktivan';
            return res.status(401).json(errorResponse);
        }
        
        errorResponse.message = 'Neispravan token';
        return res.status(401).json(errorResponse);
    }
};

// EXPORT OBJECT (for compatibility)
const authJwt = {
    verifyTokenAdmin: verifyTokenAdmin,
    verifyTokenUser: verifyTokenUser,
};

// Export individual functions for direct import
module.exports = authJwt;
module.exports.verifyTokenUser = verifyTokenUser;
module.exports.verifyTokenAdmin = verifyTokenAdmin;