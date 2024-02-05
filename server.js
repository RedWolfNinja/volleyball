const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Указать URL базы данных MongoDB
const uri = "mongodb+srv://ffff:IyfO7ULstMInst5R@rpvvolley.tvif4xw.mongodb.net/?retryWrites=true&w=majority";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

// Подключение к MongoDB
mongoose.connect(uri, clientOptions)
  .then(() => console.log("Подключено к MongoDB"))
  .catch(err => console.error("Ошибка подключения к MongoDB", err));

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema, 'my_custom_users_collection');

// Регистрация пользователя
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверка, существует ли пользователь с таким email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Пользователь с таким email уже существует");
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя с хэшированным паролем
    const user = new User({ username, email, password: hashedPassword });

    // Сохранение пользователя в базе данных
    const savedUser = await user.save();

    console.log("Пользователь успешно сохранен:", savedUser);

    // Создание сессии пользователя
    req.session.user = savedUser;

    // Перенаправление на главную страницу или профиль пользователя
    res.redirect('/');
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).send("Ошибка регистрации");
  }
});

// Вход пользователя
app.post('/login', async (req, res) => {
  try {
    const { loginEmail, loginPassword } = req.body;

    // Проверка, существует ли пользователь с таким email
    const user = await User.findOne({ email: loginEmail });
    if (!user) {
      return res.status(401).send("Неверный email или пароль");
    }

    // Сравнение введенного пароля с хэшированным паролем в базе данных
    const isPasswordValid = await bcrypt.compare(loginPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).send("Неверный email или пароль");
    }

    // Создание сессии пользователя
    req.session.user = user;

    // Перенаправление на главную страницу или профиль пользователя
    res.redirect('/');
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).send("Ошибка входа");
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
