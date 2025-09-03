require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const voteRoutes = require('./routes/votes');
const contributorRoutes = require('./routes/contributors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/contributors', contributorRoutes);

// Serve frontend static files
app.use(express.static('/var/www/monadhub/frontend'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});