if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const bcrypt = require('bcryptjs');
const passport  = require('passport');
const flash  = require('express-flash');
const session  = require('express-session');
const methodOverride = require('method-override');


const initializePassport = require('./passport-config');
const users = [];

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const app = express();




app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false 
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));


app.get('/',checkAuthenticated, (req, res) => {
    res.render('index.ejs', {user: {name: req.user.name}});  
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');  
})

app.get('/register', checkNotAuthenticated ,(req, res) => {
    res.render('register.ejs');  
})

//Post methods for different pages, remember post is 'create'

app.post('/login', checkNotAuthenticated,passport.authenticate('local', {
    
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true

}))

app.post('/register', checkNotAuthenticated,async (req, res) => {

    try {
        const hashedPassword =  await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login');

    }
    catch (e) {

        console.log(e);
        res.redirect('/register');
        
    }
    console.log(users);  
})

app.delete('/logout', (req,res) => {
    req.logOut((err) => {
        if (err){
            console.log(err);
            return res.redirect('/');
        }
        res.redirect('/login');

    });
})

//middleware to protect routes
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()

}




app.listen(3000);