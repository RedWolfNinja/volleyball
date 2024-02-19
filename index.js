const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const users = require('./data').userDB;
const mysql = require('mysql');

const app = express();
const port = 3000;


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'provolleyAdmin1_',
  database: 'userDatabase',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});



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

// Serve static files from the 'public' directory
app.use(express.static('public'));

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


// Registration
app.post('/register', async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = ?', [req.body.email]);

    if (!existingUser.length) {
      // Insert new user
      await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [req.body.username, req.body.email, req.body.password]);

      console.log('User registered:', req.body.email);
      res.send("<div align ='center'><h2>Registration successful</h2></div><br><br><div align='center'><a href='./login.html'>login</a></div><br><br><div align='center'><a href='./registration.html'>Register another user</a></div>");
    } else {
      res.send("<div align ='center'><h2>Email already used</h2></div><br><br><div align='center'><a href='./registration.html'>Register again</a></div>");
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE email = ?', [req.body.email]);
    const foundUser = result[0];
    
    console.log('Result from database:', result); // Add this line for debugging

    if (result.length > 0) {
      const foundUser = result[0];
      const storedPass = foundUser.password;
      const passwordMatch = req.body.password === storedPass;

      if (passwordMatch) {
        const usrname = foundUser.username;
        res.send(`<div align ='center'><h2>Login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${usrname}</h3></div><br><br><div align='center'><a href='./login.html'>Logout</a></div>`);
      } else {
        res.send("<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='./login.html'>Login again</a></div>");
      }
    } else {
      res.send("<div align ='center'><h2>User not found</h2></div><br><br><div align='center'><a href='./login.html'>Login again</a><div>");
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});


process.on('exit', () => {
  db.end();
});

process.on('SIGINT', () => {
  db.end();
  process.exit();
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
