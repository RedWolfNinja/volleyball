const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const util = require('util');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'provolleyAdmin1_',
  database: 'userDatabase',
};

const pool = mysql.createPool(dbConfig);
const poolQuery = util.promisify(pool.query).bind(pool);

const app = express();
const port = 3000;

app.use(session({
  secret: 'provolley',
  resave: true,
  saveUninitialized: true,
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Make sure to create a 'views' folder in your project


// Handle form submissions
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Generate a unique post ID using the generatePostId function
    const postId = generatePostId();

    // Create a new folder for the post using the post ID
    const postFolderPath = path.join(__dirname, 'public', 'uploads', postId);
    await fs.mkdir(postFolderPath);

    // Sample post information (replace this with your actual data)
    const postInfo = {
      postId: postId,  // Include postId in postInfo
      title: req.body.title,
      description: req.body.description,
      media: `/uploads/${postId}/${req.file.filename}`, // Assuming you want to store the relative path
    };

    // Save post information as a JSON file
    await fs.writeFile(path.join(postFolderPath, 'post_info.json'), JSON.stringify(postInfo));

    // Move the uploaded file to the post folder
    await fs.rename(req.file.path, path.join(postFolderPath, req.file.filename));

    res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error('Error handling upload:', err);
    res.status(500).send('Internal Server Error');
  }
});   


function generatePostId() {
  // Create a timestamp
  const timestamp = new Date().getTime();

  // Generate a random number (you may use a more sophisticated method if needed)
  const randomComponent = Math.floor(Math.random() * 1000);

  // Concatenate timestamp and random number to create a unique ID
  const postId = `${timestamp}_${randomComponent}`;

  return postId;
}

// Use body-parser for handling form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

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
    const result = await poolQuery('SELECT * FROM users WHERE email = ?', [req.body.email]);


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



app.get('/posts/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const postFolderPath = path.join(__dirname, 'public', 'uploads', postId);
    const fileInfo = await fs.readFile(path.join(postFolderPath, 'post_info.json'), 'utf-8');

    // Parse JSON content
    const postInfo = JSON.parse(fileInfo);

    // Render the post template with dynamic data
    res.render('post', { postInfo });
  } catch (error) {
    console.error('Error reading post content:', error);
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