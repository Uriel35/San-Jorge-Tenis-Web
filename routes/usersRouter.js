
const express = require('express');
const usersController = require('../controllers/usersController');
const router = express.Router();
const rolesList = require('../config/rolesList');
const verifyRoles = require('../middleware/verifyRoles');
const verifyJWT = require('../middleware/verifyJWT')


router
    .get('/', usersController.getAllUsers)
    // .get('/', verifyJWT, verifyRoles(rolesList.Admin, rolesList.Editor, rolesList.User, rolesList.Guest), usersController.getAllUsers)
    .get('/:userId', verifyJWT, verifyRoles(rolesList.Admin, rolesList.Editor, rolesList.User, rolesList.Guest), usersController.getUser)
    // .patch('/:userId', verifyJWT, verifyRoles(rolesList.Admin, rolesList.Editor, rolesList.User), usersController.updateUser)
    .patch('/:userId', verifyJWT, verifyRoles(rolesList.Admin, rolesList.Editor), usersController.updateUser)
    .delete('/:userId', verifyJWT, verifyRoles(rolesList.Admin), usersController.deleteUser)
    .delete('/', verifyJWT, verifyRoles(rolesList.Admin), usersController.deleteAllUsers)


module.exports = router;

