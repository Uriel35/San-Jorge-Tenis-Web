require('dotenv').config();
const jwt = require('jsonwebtoken');

async function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: `Authorization header doesnt exists`, from: 'verifyJWT.js', invalidAccTok: true });
    // if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: `Authorization header doesnt exists`, from: 'verifyJWT.js', invalidAccTok: true }).sendFile(path.join(__dirname, '../views/refreshToken.html'));
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) {
                return res.status(403).json({ message: err.message, mensaje: 'Token no valido o no autorizado', from: 'verifyJWT.js', invalidAccTok: true });
            } // if not error            
            req.user = decoded.userInfo.name;
            req.roles = decoded.userInfo.roles;
            req.email = decoded.userInfo.email;
            req._id = decoded.userInfo._id
            if(decoded.userInfo._id == req.params.userId) {
                req.roles.push(2001);
            }
            next();
        }
    )
}

module.exports = verifyJWT;
