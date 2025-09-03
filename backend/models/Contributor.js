const db = require('../config/database');

class Contributor {
  static findAll(callback) {
    db.all('SELECT * FROM contributors ORDER BY votes DESC', callback);
  }

  static findByUsername(username, callback) {
    db.get('SELECT * FROM contributors WHERE username = ?', [username], callback);
  }

  static create(username, callback) {
    db.run('INSERT INTO contributors (username, votes) VALUES (?, 1)', [username], callback);
  }

  static incrementVotes(username, callback) {
    db.run('UPDATE contributors SET votes = votes + 1 WHERE username = ?', [username], callback);
  }

  static search(username, callback) {
    db.all('SELECT * FROM contributors WHERE username LIKE ? ORDER BY votes DESC', [`%${username}%`], callback);
  }
}

module.exports = Contributor;