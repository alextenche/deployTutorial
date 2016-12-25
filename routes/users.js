var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user.js');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{
  	'title': 'register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {
    'title': 'login'
  });
});

router.post('/register',function(req, res, next){
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var confirmPassword = req.body.confirmPassword;

  // check for image fields
  if (req.files && req.files.profileImage) {
    var profileImageOriginalName = req.files.profileImage.originalname;
    var profileImageName = req.files.profileImage.name;
    var profileImageMime = req.files.profileImage.mimetype;
    var profileImagePath = req.files.profileImage.path;
    var profileImageExtension = req.files.profileImage.extension;
    var profileImageSize = req.files.profileImage.size;
  } else {
    var profileImageName = 'noimage.png';
  }

  // form validation
  req.checkBody('name', 'name field is required').notEmpty();
  req.checkBody('email', 'email field is required').notEmpty();
  req.checkBody('email', 'email is not valid').isEmail();
  req.checkBody('username', 'username field is required').notEmpty();
  req.checkBody('password', 'password field is required').notEmpty();
  req.checkBody('confirmPassword', 'passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      confirmPassword: confirmPassword
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileImageName
    });

    // create user
    User.createUser(newUser, function(err, user){
      if (err) {
        throw err;
      }
      console.log(user);
    });

    // success message
    req.flash('success', 'you are now register and may log in');

    res.location('/');
    res.redirect('/');
  }
});

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.getUserById(id, function(err, user){
    done(err, user);
  });
});


passport.use(new LocalStrategy(
  function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if (err) throw err;
    if (!user) {
      console.log('unknow user');
      return done(null, false, {message: 'unknown user'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      } else {
        console.log('invalid password');
        return done(null, false, {message: 'invalid password'});
      }
    });
  })
}));

router.post('/login', passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'invalid username or password'}),
  function(req, res){
    console.log('authentication successful');
    req.flash('success', 'you are logged in');
    res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'you have logged out');
  res.redirect('/users/login');
});

module.exports = router;
