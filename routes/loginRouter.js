
const express = require('express');
const loginController = require('../controllers/loginController');
const router = express.Router();

router
    .get('/', loginController.handleLoginGet)
    .post('/', loginController.loginControllerFx);


module.exports = router;