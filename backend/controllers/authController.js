const Voter = require('../models/Voter');
const fetch = require('node-fetch');

const checkTokenOwnership = async (address) => {
  try {
    // Check first token
    const response1 = await fetch(
      `https://api.blockvision.org/v2/monad/token/gating?account=${address}&contractAddress=0x922da3512e2bebbe32bcce59adf7e6759fb8cea2`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.BLOCKVISION_API_KEY
        }
      }
    );
    
    const data1 = await response1.json();
    if (data1.result && data1.result.hasToken) {
      return true;
    }
    
    // If first token not found, check second token
    const response2 = await fetch(
      `https://api.blockvision.org/v2/monad/token/gating?account=${address}&contractAddress=0x76d37bedcf864aa2bd848b7286f1be8d42f63cb6`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.BLOCKVISION_API_KEY
        }
      }
    );
    
    const data2 = await response2.json();
    return data2.result && data2.result.hasToken;
  } catch (error) {
    console.error('Error checking token ownership:', error);
    return false;
  }
};

exports.connectWallet = async (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  
  try {
    // Check if user has the required token
    const hasToken = await checkTokenOwnership(address);
    
    if (!hasToken) {
      return res.status(403).json({ error: 'You do not own the required token' });
    }
    
    // Check if voter exists, create if not
    Voter.findByAddress(address, (err, voter) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!voter) {
        Voter.create(address, (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to create voter' });
          }
          res.json({ success: true, address, canVote: true });
        });
      } else {
        // Check if 24 hours have passed since last vote
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const canVote = now - voter.last_vote_time > twentyFourHours;
        
        res.json({ success: true, address, canVote });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};