app.use(session({
  secret: "thisisakey.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


then connect with mongodb using our old mongoose.connect("")

create schema using new mongoose.Schema({})

userSchema.plugin(passportLocalMongoose);

create Model for the userSchema

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err,user){
    if (err){
      console.log(err);
      res.redirect(/register);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secret")            ;
      });
    }
  });
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

app.get("/secrets", function(req,res){
  if(req.isAuthenticated){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});
