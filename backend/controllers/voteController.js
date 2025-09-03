const Voter = require('../models/Voter');
const Contributor = require('../models/Contributor');

exports.submitVote = (req, res) => {
  const { address, usernames } = req.body;
  
  if (!address || !usernames || !Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: 'Invalid request data' });
  }
  
  if (usernames.length > 3) {
    return res.status(400).json({ error: 'You can vote for up to 3 users only' });
  }
  
  // Check for duplicates case-insensitively
  const normalizedUsernames = usernames.map(u => u.toLowerCase());
  const uniqueNormalized = [...new Set(normalizedUsernames)];
  if (uniqueNormalized.length !== normalizedUsernames.length) {
    return res.status(400).json({ error: 'Duplicate usernames are not allowed' });
  }
  
  // Validate each original username
  for (const username of usernames) {
    if (!isValidUsername(username)) {
      return res.status(400).json({ error: `Invalid username: ${username}` });
    }
  }
  
  // Check if user can vote
  Voter.findByAddress(address, (err, voter) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!voter) {
      return res.status(404).json({ error: 'Voter not found' });
    }
    
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (now - voter.last_vote_time < twentyFourHours) {
      return res.status(403).json({ error: 'You can only vote once every 24 hours' });
    }
    
    // Process votes using normalized usernames
    let processed = 0;
    const errors = [];
    
    normalizedUsernames.forEach(normalizedUsername => {
      Contributor.findByUsername(normalizedUsername, (err, contributor) => {
        if (err) {
          errors.push(`Error processing vote for ${normalizedUsername}`);
        } else if (contributor) {
          Contributor.incrementVotes(normalizedUsername, (err) => {
            if (err) errors.push(`Error updating votes for ${normalizedUsername}`);
          });
        } else {
          Contributor.create(normalizedUsername, (err) => {
            if (err) errors.push(`Error creating contributor ${normalizedUsername}`);
          });
        }
        
        processed++;
        
        if (processed === normalizedUsernames.length) {
          if (errors.length > 0) {
            return res.status(500).json({ error: errors.join(', ') });
          }
          
          Voter.updateVoteTime(address, now, (err) => {
            if (err) {
              console.error('Error updating vote time:', err);
            }
            res.json({ success: true, message: 'Votes submitted successfully' });
          });
        }
      });
    });
  });
};

function isValidUsername(username) {
  const regex = /^[a-zA-Z0-9_]{1,15}$/;
  return regex.test(username);
}