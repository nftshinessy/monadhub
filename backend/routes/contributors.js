const express = require('express');
const router = express.Router();
const { getContributors } = require('../controllers/contributorController');

router.get('/', getContributors);

module.exports = router;