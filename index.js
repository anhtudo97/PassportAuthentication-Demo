const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require("fs");
const app = express();

const port = 3000;

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: "mysecret",
	cookie:{
		maxAge:1000*60*5;
	}
}));
app.use(Passport.initialize());
app.use(Passport.session());

app.get('/', (req, res) => res.render('index'));

app.route('/login').get((req, res) => res.render('login')).post(Passport.authenticate('local', {
	failureRedirect: '/login',
	successRedirect: '/loginOK'
}));

app.get('/private', (req,res)=>{
	if(req.isAuthenticated()){
		res.send('Welcome to private page');
	}else{
		res.send('You are not login');
	}

})

app.get('/loginOK', (req, res) => res.send('Login successfull!'));

Passport.use(new LocalStrategy(
	(username, password, done) => {
		fs.readFile('./UserDB.json', (err, data) => {
			const db = JSON.parse(data);
			const userRecord = db.find(user => user.usr == username);
			if (userRecord && userRecord.pwd == password) {
				return done(null, userRecord);
			} else {
				return done(null, false);
			}
		})
	}
))

Passport.serializeUser((user, done) => {
	done(null, user.usr)
});

Passport.deserializeUser((name, done) => {
	fs.readFile('./UserDB.json', (err, data) => {
		const db = JSON.parse(data);
		const userRecord = db.find(user => user.usr == name);
		if (userRecord) {
			return done(null, userRecord);
		} else {
			return done(null, false);
		}
	})
})

app.listen(port, () => console.log(`Server is listening on port ${port}`));