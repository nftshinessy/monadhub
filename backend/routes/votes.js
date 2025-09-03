const express = require('express');
const { submitVote } = require('../controllers/voteController');

const router = express.Router();

router.post('/submit', submitVote);

module.exports = router;