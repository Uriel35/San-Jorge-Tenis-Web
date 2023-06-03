const express = require('express');
const router = express.Router();
const { handleDecodeRefresh } = require('../controllers/decodeRefreshController')

router
    .get('/', handleDecodeRefresh)

module.exports = router;