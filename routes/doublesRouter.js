const express = require('express')
const router = express.Router();
const doublesController = require('../controllers/doublesController');

router
    .get('/', doublesController.getAllDoubles)
    .get('/:partnerId', doublesController.getOneDouble)
    .post('/', doublesController.createDouble)
    .delete('/:coupleId', doublesController.deletePartner)
    .delete('/', doublesController.deleteAllPartners)

module.exports = router;