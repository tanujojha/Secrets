require("dotenv").config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');   // we dont need to require passport-local as passport-local-mongoose will be enough and will do the most of the work in a few lines of code
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findOrCreate');

const app = express();

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "this is a secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  secrets: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});



passport.use(new GoogleStrategy({             //using google Strategy and setting the options
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"      //same callback url given when creating OAuth consent screen
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);              //logs the profile of the user sent by google
    User.findOrCreate({ googleId: profile.id }, function (err, user) {       //finding or creating user with the googleId
      return cb(err, user);
    });
  }
));



app.get("/", function(req,res){
  res.render("home");
});


app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] }));     //authenticating at the /auth/google route


  app.get('/auth/google/secrets',             //authenting at our local side
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect to secrets.
      res.redirect('/secrets');
    });


app.get("/register", function(req,res){
  res.render("register")
});


app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    // console.log("the user log is : " + user);
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local") (req, res, function(){
        res.redirect("/secrets");
      });



    }
  });
});



app.get("/login", function(req,res){
  res.render("login");
});


app.post("/login", function(req,res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});



app.get("/submit", function(req, res){
  if(req.isAuthenticated()){            //checking for authentication fo the user; it returns boolean
    res.render("submit");               //if true rendering the page; only authenticated users can post
  }else{
    res.redirect("/login");
  }
});

app.post("/submit", function(req, res){
  // console.log(req.body.secret);
  const submittedSecret = req.body.secret
  console.log(req.user);       //loging the user thats logged in and clicked the submit button

  User.findById(req.user.id, function(err, foundUser){      //finding the user that posted their secrete to add in db
    // console.log(foundUser);

    if (!err){
      foundUser.secrets = submittedSecret       //updating the secrets field of the user; note: it replaces the existing secrete if new secrete is posted by the same user
      foundUser.save(function(){
        res.redirect("/secrets")
      })
    }else{console.log(err);}

  });


});

app.get("/secrets", function(req, res){

  User.find({secrets: {$ne:null}}, function(err, foundUsers){       //finding all the users with the field secrets not  equal ($ne) to null
    // console.log(foundUsers.secrets);       //logs array of users with matching conditions
    if(!err){
      res.render("secrets", {userWithSecrets: foundUsers});
    }else{console.log(err);}
  });

});



app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});



app.listen(3000, function(){
  console.log("server started on port 3000");
});
