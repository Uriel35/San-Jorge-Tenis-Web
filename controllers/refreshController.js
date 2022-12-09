require('dotenv').config()
const User = require('../model/User');
const jwt = require('jsonwebtoken');

async function handleRefreshToken(req, res, next) {
    const cookies = req.cookies;
    if(!cookies?.jwt) {
        return res.status(401).json({ message: `Cookie 'jwt' doesnt exists`, from: `refreshController.js`, unvalidTok: true });
    }
    const refreshToken = cookies.jwt;
    
    const findUser = await User.find({ refreshToken: refreshToken })
    if(findUser.length !== 1) {
        return res.status(403).json({ message: `User not found with refresh Token`, from: 'refreshController.js', unvalidTok: true }); // Forbidden
    }

    // Evaluate JWT
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || findUser[0].name !== decoded.userInfo.name ) return res.status(400).json({ message: err, from: `RefreshController.js`, unvalidTok: true });
            const roles = Object.values(findUser[0].roles);
            const accessToken = jwt.sign(
                { "userInfo": {
                    "name": decoded.name,
                    "_id": decoded._id,
                    // "roles": decoded.roles,
                    "roles": roles, // Esta nos da los valores, NO el objeto
                    "email": decoded.email
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );
            res.status(200).json({ accessToken: accessToken, message: 'Access token refreshed' })   
        }
    )    
};

module.exports = {
    handleRefreshToken
}