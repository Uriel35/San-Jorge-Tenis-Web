const express = require('express');
const { handleProfile, handleDoubleProfile } = require('../controllers/profileController');
const router = express.Router();

router
    .get('/:userId', handleProfile)
    .get('/doubles/:doubleId', handleDoubleProfile)

module.exports = router;