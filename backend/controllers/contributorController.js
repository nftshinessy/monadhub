const Contributor = require('../models/Contributor');

exports.getContributors = (req, res) => {
  Contributor.findAll((err, contributors) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Add ranking based on votes (descending order)
    const rankedContributors = contributors
      .map(contributor => ({...contributor}))
      .sort((a, b) => b.votes - a.votes)
      .map((contributor, index) => ({
        ...contributor,
        rank: index + 1
      }));
    
    res.json(rankedContributors);
  });
};

exports.searchContributors = (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username query parameter is required' });
  }
  
  Contributor.search(username, (err, contributors) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Add ranking to search results based on votes
    const rankedContributors = contributors
      .map(contributor => ({...contributor}))
      .sort((a, b) => b.votes - a.votes)
      .map((contributor, index) => ({
        ...contributor,
        rank: index + 1
      }));
    
    res.json(rankedContributors);
  });
};