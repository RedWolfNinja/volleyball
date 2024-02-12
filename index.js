const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const { isUsernameTaken, insertUser, authenticateUser } = require('./database');

const session = require('express-session');


const app = express();
const port = 3000;

app.use(session({
    secret : 'provolley',
    resave : true,
    saveUninitialized : true

}));


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

// Handle form submissions for registration
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const isTaken = await isUsernameTaken(username);

    if (isTaken) {
      return res.send('Username already exists. Please choose a different username.');
    }

    await insertUser(username, password, role);

    res.send('Registration successful! Now you can log in.');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle form submissions for login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const isAuthenticated = await authenticateUser(username, password);

    if (isAuthenticated) {
      res.send('User access granted!');
    } else {
      res.send('Invalid credentials. Please try again.');
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
