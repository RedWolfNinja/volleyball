const mysql = require('mysql');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'provolleyAdmin1_',
  database: 'userDatabase'
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Function to create the 'users' table if it doesn't exist
function createUsersTable() {
    pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(255) DEFAULT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      }
    });
  }

// Check and create the 'users' table on application start
createUsersTable();

// Function to check if a username already exists
async function isUsernameTaken(username) {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0);
      }
    });
  });
}

// Function to insert a new user into the database
async function insertUser(username, password, role) {
  return new Promise((resolve, reject) => {
    pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Function to authenticate a user
async function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0);
      }
    });
  });
}

module.exports = {
  isUsernameTaken,
  insertUser,
  authenticateUser
};
