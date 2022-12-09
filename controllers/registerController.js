
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerControllerFx = async (req, res) => {
    try {
        const { email, pwd, name, roles, sex } = req.body;
        if(!email || !pwd || !name || !sex) return res.status(404).json({ message: 'Fields required, from registerController.js' })
        
        const findUser = await User.find({ $or:[{ email: email }, { name: name }] });
        if(findUser.length !== 0) return res.status(409).json({ message: 'Email or Name allready exists, from registerController.js' });
        
        const hashPwd = await bcrypt.hash(pwd, 10);        
        const newUser = await User.create({
            name: name,
            email: email,
            pwd: hashPwd,
            roles: roles,
            sex: sex
        })
        await newUser.save();

        res.status(201).json({ message: 'User created', user: await User.find({ email: email }) })
        
    } catch(error) {
        res.status(500).json({ error: error.message, from: 'registerController.js' })
    }
}

module.exports = { registerControllerFx };