
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');

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


const saltRounds = 10;      //defining the salt rounds


app.get("/", function(req,res){
  res.render("home");
});


app.get("/register", function(req,res){
  res.render("register");
});

app.post("/register", function(req,res){
  bcrypt.hash(req.body.password, saltRounds, function(err, hash){   //salting and hashing the password
    const newUser = new User({
      username: req.body.username,
      password: hash                            //storing the hashed pass in db
    });
    newUser.save(function(err){
      if(!err){
        console.log("saved user succesfully");
        res.render("secrets");
      }
      else{console.log(err);}
    });
  });

});


app.get("/login", function(req,res){
  res.render("login");
});

app.post("/login", function(req,res){

  User.findOne({username: req.body.username}, function(err, founduser){
    if(err){
      console.log(err);
    }else{
      if(founduser){
        bcrypt.compare(req.body.password,founduser.password, function(err, result){   //comparing the passwords
          // console.log(result);        //its boolean and returns true or false
          if (result === true){
            res.render("secrets");
          }
        });
      }
    }
  });
});





app.listen(3000, function(){
  console.log("server started on port 3000");
});
