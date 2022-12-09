const User = require('../model/User');
const bcrypt = require('bcrypt');
const Doubles = require('../model/Doubles');
const luxon = require('luxon');

async function getAllUsers(req, res) {    
    try {
        // const allUsers = await User.find({}, 'name email roles ranking matches age streak _id sex');
        // const allUsers = await User.find({}, 'name _id');
        // Para filtrar a TODOS excepto el admin !!
        const allUsers = await User.find({ 'roles.Admin': { $ne: 2000 }}, 'name email roles age ranking matches streak _id sex');
        res.status(200).json({ users: allUsers, message: 'All users, from usersController.js' })
    } catch(err) {
        res.status(500).json({ message: err.message, from: 'usersController.js' })
    }
}

async function getUser(req, res) {
    try{
        const bodyId = req.params.userId;
        let isDoubles = false;
        let findUser = await User.findById(bodyId);
        if(!findUser) {
            // Encontrar al Doubles.
            findUser = await Doubles.findById(bodyId)
            if(!findUser) {
                return res.status(404).json({ message: 'User not found', from: 'usersController.js' })
            } else {
                isDoubles = true
            }
        }
        res.status(200).json({ user: findUser, message: 'User founded', isDoubles: isDoubles})
    } catch(err) {
        res.status(500).json({ message: err.message, from: 'usersController.js' })
    }
}

async function updateUser(req, res) {
    const bodyId = req.params.userId;
    let findUser = await User.findById(bodyId);
    let isDoubles = false;
    if(!findUser) {
        findUser = await Doubles.findById(bodyId);
        if(!findUser){
            return res.status(404).json({ message: 'User not found', from: 'usersController.js' })
        } else isDoubles = true
    }


    let { ...bodyInfo } = req.body;
    if(bodyInfo.name == undefined || bodyInfo.name == '') delete bodyInfo.name
    if(bodyInfo.email == undefined || bodyInfo.email == '') delete bodyInfo.email
    if(bodyInfo.age == undefined || bodyInfo.age == '') delete bodyInfo.age
    if(bodyInfo.sex == undefined || bodyInfo.sex == '') delete bodyInfo.sex
    if(bodyInfo.pwd == undefined || bodyInfo.pwd == '') delete bodyInfo.pwd
    else bodyInfo.pwd = await bcrypt.hash(bodyInfo.pwd, 10)


    if(bodyInfo.ranking.ranking == findUser.ranking.ranking) delete bodyInfo.ranking; // Probar !!
    if(bodyInfo.ranking !== undefined) {
        const rank = bodyInfo.ranking.ranking;
        const points = bodyInfo.ranking.ranking - findUser.ranking.ranking
        findUser.ranking.history.push({ points: points })
        const history = findUser.ranking.history;
        console.log(history);
        delete bodyInfo.ranking;

        if(isDoubles == false) {
            await User.updateOne({ _id: findUser._id }, {
                ...bodyInfo,
                "ranking.history": history,
                "ranking.ranking": rank
                // $push: { "ranking.history": { points: points} },
            })
        } else if(isDoubles == true) {
            await Doubles.updateOne({ _id: findUser._id }, {
                ...bodyInfo,
                "ranking.history": history,
                "ranking.ranking": rank
                // $push: { "ranking.history": { points: points} },
            })
        }
    } else {
        delete bodyInfo.ranking
        if(isDoubles == false) {
            await User.updateOne({ _id: findUser._id}, {
                ...bodyInfo,
            })
        } else if(isDoubles == true) {
            await Doubles.updateOne({ _id: findUser._id }, {
                ...bodyInfo
            })
        }
    }
    if(isDoubles == false) {
        res.status(200).json({ userUpdated: await User.findById(bodyId, 'name email ranking matches streak sex age roles _id'), message: 'Upload success', isDoubles: isDoubles })
    } else {
        res.status(200).json({ userUpdated: await Doubles.findById(bodyId, 'name ranking matches streak sex _id'), message: 'Upload success', isDoubles: isDoubles })
    }
}

async function deleteUser(req, res) {
    try {
        const bodyId = req.params.userId;
        const findUser = await User.findById(bodyId);
        if(!findUser) {
            return res.status(404).json({ message: 'User not found', from: 'usersController.js' })
        }
        await User.deleteOne({ _id: findUser._id });

        const allDoubles = await Doubles.find({ "players.playerId": bodyId});
        if(allDoubles.length == 1) {
            await Doubles.deleteOne({ _id: allDoubles[0]._id})
        }
        
        res.status(200).json({ message: `User "${ findUser.name }" deleted`, from: 'usersController.js', userDeleted: findUser })
    } catch(err) {
        res.status(500).json({ message: err.message, from: 'usersController.js' })
    }
}

async function deleteAllUsers(req, res) {
    try{
        await User.deleteMany({});
        await Doubles.deleteMany({})
        res.status(200).json({ message: 'All users and doubles deleted', from: 'userController.js' })
    }catch(err) {
        res.status(500).json({ message: err.message, from: 'usersController.js' })
    }
}


module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    deleteAllUsers
}