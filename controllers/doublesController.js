const Doubles = require('../model/Doubles');
const User = require('../model/User')

const getAllDoubles = async (req, res) => {
    try{
        const allDoubles = await Doubles.find();
        // console.log(allDoubles);
        res.status(200).json({ message: 'All doubles', from: 'doublesController.js', data: allDoubles })

    } catch(err) {
        res.status(500).json({ message: err.message, from: 'doublesController.js' })
    }
}

const getOneDouble = async (req, res) => {
    try {
        const FIND_PARTNERS = await Doubles.find({ "players.playerId": req.params.partnerId});
        if(FIND_PARTNERS.length !== 1) return res.status(404).json({ partner: false, message: 'Pareja inexistente' })
        res.status(200).json({ partner: FIND_PARTNERS[0], message: 'Probando...' })
    } catch(err) {
        res.status(500).json({ message: err.message, from: 'doublesController.js' })
    }
}

const createDouble = async (req, res) => {
    let { player1Id, player2Id } = req.body;

    const player1 = await User.findById(player1Id)
    if(!player1) return res.status(404).json({ message: `Player doesn't exists`, from: 'doublesController.js'})
    const player2 = await User.findById(player2Id)
    if(!player2) return res.status(404).json({ message: `Player doesn't exists`, from: 'doublesController.js'})

    if(player1.id == player2.id) return res.status(409).json({ message: `Cannot select the same person twice`, from: 'doublesController.js' })
    if(player1.sex !== player2.sex) return res.status(409).json({ message: `Player with diferents sex caterogie`, from: 'doublesController.js' })
    const allDoubles = await Doubles.find();
    const p1AllreadyExists = allDoubles.find(item => {
        return item.players[0].playerId == player1.id || item.players[1].playerId == player1.id
    });
    const p2AllreadyExists = allDoubles.find(item => {
        return item.players[0].playerId == player2.id || item.players[1].playerId == player2.id
    });

    if(p1AllreadyExists !== undefined) return res.status(409).json({ message: `Player ${ player1.name } has allready partner`, from: 'doublesController.js '})
    if(p2AllreadyExists !== undefined) return res.status(409).json({ message: `Player ${ player2.name } has allready partner`, from: 'doublesController.js '});

    const newPartners = await Doubles.create({
        name: player1.name + ' / ' + player2.name,
        players: [
            {
                name: player1.name,
                playerId: player1._id,
                sex: player1.sex
            },
            {
                name: player2.name,
                playerId: player2._id,
                sex: player2.sex
            }
        ],
        sex: player1.sex
    });

    res.status(201).json({ message: `Partners created`, from: 'doublesController.js', allCouples: await Doubles.find({}) })
}

const deletePartner = async (req, res) => {
    try {
        const findCouple = await Doubles.findById(req.params.coupleId);
        await Doubles.deleteOne({ _id: findCouple._id })
        res.status(200).json({ message: `${ findCouple.name } couple has been deleted`, couple: findCouple, from: 'doublesController.js' })
    } catch(err) {
        res.status(500).json({ message: err.message, from: 'doublesController.js' })        
    }
}

const deleteAllPartners = async (req, res) => {
    try{
        await Doubles.deleteMany({})
        res.status(200).json({ message: 'All partners deleted', data: await Doubles.find(), from: 'doublesController.js' })
    } catch(err) {
        res.status(500).json({ message: err.message, from: 'doublesController.js' })
    }
}

module.exports = {
    getAllDoubles,
    getOneDouble,
    createDouble,
    deletePartner,
    deleteAllPartners
}