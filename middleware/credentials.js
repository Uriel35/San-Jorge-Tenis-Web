const { allowedOrigins } = require('../config/corsOptions');

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if(allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
        // res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
        // res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
    }
    next();
}

module.exports = credentials;