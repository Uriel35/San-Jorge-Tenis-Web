const path = require('path')

const handleProfile = async (req, res) => {
    res.sendFile(path.join(__dirname, '../views/profile.html'))
}

const handleDoubleProfile = async (req,res) => {
    res.sendFile(path.join(__dirname, '../views/profile-double.html'))
}

module.exports = { handleProfile, handleDoubleProfile }