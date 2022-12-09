
const mongoose = require('mongoose');
const { DateTime } = require('luxon')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pwd: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        default: () => DateTime.now().toFormat('dd-MM-yyyy')
    },
    roles: {
        type: Object,
        default: { 'User': 2002 }
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
                type: [[ Number ]]
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
    sex: {
        type: String,
        required: true,
        enum: ['M', 'F']
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
                    // default: () => DateTime.local(2023, 11, 14).toFormat('dd-MM-yyyy')
                },
                points: {
                    type: Number
                }
            }]
        }
    },
    streak: {
        type: Number,
        default: 0
    },
    refreshToken: {
        type: String
    }
})


module.exports = mongoose.model('User', userSchema);