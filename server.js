var express = require('express');
var passport = require('passport');
var Strategy = require('passport-openid').Strategy;


// Configure the OpenID strategy for use by Passport.
//
// OpenID-based strategies require a `verify` function which receives the
// OpenID identifier.  The function must invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy({
    returnURL: 'http://localhost:3000/login/openid/return',
    realm: 'http://localhost:3000/'
  },
  function(identifier, cb) {
    console.log('GOT IDENTIFER');
    console.log(identifer);
    
    return cb(null, { identifier: identifier })
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});




// Create a new Express application.
var app = express();

// Configure Express application.
app.configure(function() {
  // Configure view engine to render EJS templates.
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  
  // Use application-level middleware for common functionality, including
  // logging, parsing, and session handling.
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  
  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());
});

app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login/openid',
  passport.authenticate('openid', { failureRedirect: '/login' }));

app.get('/login/openid/return', 
  passport.authenticate('openid', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.listen(3000);
