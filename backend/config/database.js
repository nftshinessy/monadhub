const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
  // Voters table
  db.run(`CREATE TABLE IF NOT EXISTS voters (
    address TEXT PRIMARY KEY,
    last_vote_time INTEGER
  )`);
  
  // Contributors table
  db.run(`CREATE TABLE IF NOT EXISTS contributors (
    username TEXT PRIMARY KEY,
    votes INTEGER DEFAULT 0
  )`);
});

module.exports = db;