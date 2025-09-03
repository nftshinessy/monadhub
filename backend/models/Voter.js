const db = require('../config/database');

class Voter {
  static findByAddress(address, callback) {
    db.get('SELECT * FROM voters WHERE address = ?', [address], callback);
  }

  static create(address, callback) {
    db.run('INSERT INTO voters (address, last_vote_time) VALUES (?, 0)', [address], callback);
  }

  static updateVoteTime(address, timestamp, callback) {
    db.run('UPDATE voters SET last_vote_time = ? WHERE address = ?', [timestamp, address], callback);
  }
}

module.exports = Voter;