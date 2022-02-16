
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');

const app = express();

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", userSchema);


app.get("/", function(req,res){
  res.render("home");
});


app.get("/register", function(req,res){
  res.render("register");
});

app.post("/register", function(req,res){
  // console.log(req.body.username, req.body.password);
  const newUser = new User({
    username: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if(!err){
      console.log("saved user succesfully");
      res.render("secrets");
    }
    else{console.log(err);}
  });
});


app.get("/login", function(req,res){
  res.render("login");
});

app.post("/login", function(req,res){
  // console.log(req.body.username, req.body.password);
  User.findOne({username: req.body.username}, function(err, founduser){
    if(err){
      console.log(err);
    }else{
      if(founduser){
        if(founduser.password === req.body.password){
          res.render("secrets");
        }
      }
    }
  });
});





app.listen(3000, function(){
  console.log("server started on port 3000");
});
