const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');   // we dont need to require passport-local as passport-local-mongoose will be enough and will do the most of the work in a few lines of code


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
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", function(req,res){
  res.render("home");
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



app.get("/secrets", function(req, res){
  // console.log(req.isAuthenticated());    //returns boolean
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});



app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});



app.listen(3000, function(){
  console.log("server started on port 3000");
});
