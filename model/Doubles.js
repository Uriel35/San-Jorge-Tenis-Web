const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const doublesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        required: true,
        enum: ['M', 'F']
    },
    players: {
        type: [{
            _id: false,
            name: String,
            playerId: String,
            sex: String
        }]
    },
    ranking: {
        ranking: {
            type: Number,
            default: 1000
        },
        history: {
            type: [{
                _id: false,
                date: {
                    type: String,
                    default: () => DateTime.now().toFormat('dd-MM-yyyy')
                },
                points: {
                    type: Number
                }
            }]
        }
    },
    matches: {
        type: [{
            _id: false,
            result: Boolean,
            date: {
                type: String,
                default: () => DateTime.now().toFormat('dd-MM-yyyy')
            },
            score: {
                type: [[Number]]
            },
            resign: {
                type: Boolean,
                default: false
            },
            rival: {
                type: String
            },
            breaks: {
                win: Number,
                lose: Number
            },
            points: {
                type: Number
            }
        }]
    },
    createdAt: {
        type: String,
        default: () => DateTime.now().toFormat('dd-MM-yyyy')
    },
    streak: {
        type: Number,
        default: 0
    },
})

module.exports = mongoose.model('Doubles', doublesSchema);
