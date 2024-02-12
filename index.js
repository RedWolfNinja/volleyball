const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'provolleyAdmin1_',
  database: 'userDatabase'
};

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Use body-parser for handling form data
app.use(bodyParser.urlencoded({ extended: true }));

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle form submissions for registration
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Check if the username already exists
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) {
        connection.release();
        console.error('Error querying MySQL database:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length > 0) {
        connection.release();
        return res.send('Username already exists. Please choose a different username.');
      }

      // Insert the new user into the database
      connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], (err) => {
        connection.release();
        if (err) {
          console.error('Error inserting into MySQL database:', err);
          return res.status(500).send('Internal Server Error');
        }

        res.send('Registration successful! Now you can log in.');
      });
    });
  });
});

// Handle form submissions for login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Check if the entered credentials match any user in the database
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
      connection.release();
      if (err) {
        console.error('Error querying MySQL database:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length > 0) {
        const user = results[0];
        if (user.role === 'admin') {
          // Grant admin access
          res.send('Admin access granted!');
        } else {
          // Grant limited user access
          res.send('Limited user access granted!');
        }
      } else {
        res.send('Invalid username or password.');
      }
    });
  });
});

// Handle form submissions
app.post('/upload', upload.single('file'), (req, res) => {
  // Handle the file upload as needed

  // Send a response to the client
  res.send('File uploaded successfully!');
});

// Serve the homepage with the list of uploaded posts
app.get('/posts', async (req, res) => {
  try {
    const files = await fs.readdir(path.join(__dirname, 'public', 'uploads'));
    const posts = files.map(filename => {
      const [title, description] = filename.split('_');
      return { title, description, filename };
    });
    res.json(posts);
  } catch (error) {
    console.error('Error reading posts:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
