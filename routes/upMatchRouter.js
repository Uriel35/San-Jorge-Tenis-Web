const express = require('express');
const router = express.Router();
const { handleUpMatch, handleDoubleUpMatch } = require('../controllers/upMatchController');
const verifyJWT = require('../middleware/verifyJWT');
const roles_list = require('../config/rolesList');
const verifyRoles = require('../middleware/verifyRoles');
const { handleRefreshToken } = require('../controllers/refreshController');

router
    .patch('/', verifyJWT, verifyRoles(roles_list.Admin), handleUpMatch)
    .patch('/doubles', verifyJWT, verifyRoles(roles_list.Admin), handleDoubleUpMatch)

module.exports = router;

