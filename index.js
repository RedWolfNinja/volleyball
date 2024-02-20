const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'provolleyAdmin1_',
  database: 'userDatabase'
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);


const app = express();
const port = 3000;

app.use(session({
    secret : 'provolley',
    resave : true,
    saveUninitialized : true

}));

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





////#region something
// // Function to check if a username already exists
// async function isUsernameTaken(username) {
//   return new Promise((resolve, reject) => {
//     pool.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results.length > 0);
//       }
//     });
//   });
// }

// // Function to insert a new user into the database
// async function insertUser(username, password, role) {
//   return new Promise((resolve, reject) => {
//     pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], (err) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

// // Function to authenticate a user
// async function authenticateUser(username, password) {
//   return new Promise((resolve, reject) => {
//     pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results.length > 0);
//       }
//     });
//   });
// }

// module.exports = {
//   isUsernameTaken,
//   insertUser,
//   authenticateUser
// };
////#endregion

// Registration
// Registration
app.post('/register', async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = ?', [req.body.email]);

    if (!existingUser.length) {
      // Insert new user
      await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [req.body.username, req.body.email, req.body.password]);

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
    const result = await pool.query('SELECT * FROM users WHERE email = ?', [req.body.email]);


    console.log('Result from database:', result); // Add this line for debugging

    if (result.length > 0) {
      const foundUser = result[0]; // Access the first element of the result array
      const storedPass = foundUser.password;
      const passwordMatch = req.body.password === storedPass;

      console.log('Stored Password from database:', storedPass); // Add this line for debugging

      if (passwordMatch) {
        const usrname = foundUser.username;
        console.log('Username from database:', usrname); // Add this line for debugging
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