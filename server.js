require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const ejs = require('ejs')
const cors = require('cors');
const { corsOptions } = require('./config/corsOptions');
const credentials = require('./middleware/credentials');
const jwt = require('jsonwebtoken')
const { DateTime, Interval } = require('luxon')


mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection;
db.on('error', (error) => console.log(error)); // on() es para error handling
db.once('open', () => console.log('Connected to Database')) // once() nos confirma una vez que la coneccion es correcta

app.use(credentials)
app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Sirve static files (img, css, js, icons)... Acordate que para linkearlos se arranca desde /public/archivo
app.use(express.static(path.join(__dirname, 'public')));

// app.set('views', path.join(__dirname, './views'))

// app.set('view engine', 'ejs')
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, './view/contenedor/prueba.html'));
// })

app.use('/.{0}(login)?.{0}', require('./routes/loginRouter'));
app.use('/logout', require('./routes/logoutRouter'));
app.use('/register', require('./routes/registerRouter'));
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, './views/home.html'))
})
app.use('/profile', require('./routes/profileRouter'))
app.get('/match', (req, res) => {
    res.sendFile(path.join(__dirname, './views/match.html'))
});
app.get('/guestLogin', (req, res) => {
    const accessToken = jwt.sign(
        {
            "userInfo": {
                "name": 'Guest',
                "email": 'guest@hotmail.com',
                "roles": [2003],
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m'}
    )
    const refreshToken = jwt.sign(
        {
            "userInfo": {
                "name": 'Guest',
                "email": 'guest@hotmail.com',
                "roles": [2003],
            }
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d'}
    )
    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 24 * 60 * 60 * 1000 });            
    res.status(200).json({ message: 'Success Login, from server.js', accessToken: accessToken })

})
app.get('/expired', (req, res) => {
    res.sendFile(path.join(__dirname, './views/refreshToken.html'))
})

// API
app.use('/api/doubles', require('./routes/doublesRouter'))
app.use('/api/users', require('./routes/usersRouter'))
app.use('/decodeRefresh', require('./routes/decodeRefreshRouter'))
app.use('/refresh', require('./routes/refreshTokenRouter'))
app.use('/api/upMatch', require('./routes/upMatchRouter'))

app.listen(PORT, () => {
    console.log(`Listening at port: ${PORT}`)
})