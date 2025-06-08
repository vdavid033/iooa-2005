const jwt = require("jsonwebtoken");
const config = require("./auth_config.js");

verifyTokenAdmin = (req, res, next) => {
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
        if (decoded.uloga === "admin") {
            next();
        } else {
            res.status(403).send({
                message: "Require Admin Role!",
            });
        }
    });
};

verifyTokenUser = (req, res, next) => {
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
        next();
    });
};

const authJwt = {
    verifyTokenAdmin: verifyTokenAdmin,
    verifyTokenUser: verifyTokenUser,
};

module.exports = authJwt;
