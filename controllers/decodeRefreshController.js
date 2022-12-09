require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../model/User')

const handleDecodeRefresh = async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) {
        return res.status(401).json({ message: `Cookie 'jwt' doesnt exists`, from: `decodeRefreshController.js` });
    } 
    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            const findGuestRol = decoded.userInfo.roles.map(role => role == 2003 ? true : false).find(val => val === true);
            if(findGuestRol) {
                return res.status(200).json({ message: `Guest decoded`, from: `decodeRefreshController.js`, decoded: { ...decoded.userInfo}, isGuest: true })
            };
            
            const findUser = await User.find({ refreshToken: refreshToken })
            if(findUser.length !== 1) {
                return res.status(403).json({ message: `User not found with refresh Token`, from: 'decodeRefreshController.js' }); // Forbidden
            }
            if(err || findUser[0].name !== decoded.userInfo.name ) return res.status(400).json({ message: err, from: `RefreshController.js` });
            
            const result = { ...decoded.userInfo };
            
            if(!req.headers.originurl) {
                return res.status(200).json({ decoded: result })
            } else {
                if(decoded.userInfo._id == req.headers.originurl || decoded.userInfo.roles[0] == 2000 ) {
                    return res.status(200).json({ decoded: result, editor: true })   
                }
                return res.status(200).json({ decoded: result })
            }
        }
    )
    
}

module.exports = {
    handleDecodeRefresh
}