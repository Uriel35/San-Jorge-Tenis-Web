const User = require('../model/User')

const handleLogout = async(req, res) => {
    try{
        const cookies = req.cookies;
        if(!cookies?.jwt) {
            return res.status(200).json({message: 'Cookie didnt exists', from: 'logoutController.js'})
        }
        const refreshToken = cookies.jwt;
    
        const findUser = await User.find({ refreshToken: refreshToken})
        if(findUser.length !== 1) {
            res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' })
            return res.status(200).json({ message: 'User not found with refreshToken, but cookie deleted', from: 'logoutController.js' })
        }
        
        await User.updateOne({ _id: findUser[0]._id }, { $set: { refreshToken: '' } })
        res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' })
        return res.status(200).json({ message: ' Cookie and refreshToken deleted', from: 'logoutController.js' })
    
    } catch(err) {
        res.status(500).json({ message: err.message, from: 'logoutController.js' })
    }
}

module.exports = {
    handleLogout
}