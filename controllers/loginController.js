const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const handleLoginGet = async(req, res) => {
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' })
    res.sendFile(path.join(__dirname, '../views/LoginRegister.html'))
}

const loginControllerFx = async (req, res) => {
    try {
        const { email, pwd } = req.body;

        if(!email || !pwd) return res.status(400).json({ message: 'Fields required, from loginController.js', incomplete: true });

        const findUser = await User.find({ email: email });
        if(findUser.length !== 1) {
            return res.status(404).json({ message: 'Cannot find User email, from loginController.js', notFound: true });
        }
        const matchPass = await bcrypt.compare(pwd, findUser[0].pwd);

        if(matchPass) {
            const roles = Object.values(findUser[0].roles); //
            const accessToken = jwt.sign(
                { "userInfo": {
                    "name": findUser[0].name,
                    "email": findUser[0].email,
                    "roles": roles, // Si no usa 'roles' definido mas arriba
                    "_id": findUser[0]._id
                }},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m'}
            )
            const refreshToken = jwt.sign(
                { "userInfo": {
                    "email": findUser[0].email,
                    "name": findUser[0].name,
                    "roles": roles,
                    "_id": findUser[0]._id
                }},
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d'}
            )

            await User.updateOne({ _id: findUser[0]._id }, { $set: { refreshToken: refreshToken }})
            res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 24 * 60 * 60 * 1000 });            
            res.status(200).json({ message: 'Success Login, from loginController.js', accessToken: accessToken, user: await User.find({ _id: findUser[0]._id }) })
        } else {
            res.status(400).json({ message: 'Password incorrect, from loginControler.js', pwdUnvalid: true })
        }

    } catch(err) {
        res.status(500).json({ message: err.message, from: 'loginController.js' })
    }
}

module.exports = { loginControllerFx, handleLoginGet };


