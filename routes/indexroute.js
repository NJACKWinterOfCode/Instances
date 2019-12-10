var express     = require("express"),
    User        = require("../models/usermodel"),
    passport    = require("passport"),
    router      = express.Router({mergeParams: true});


// HOME PAGE
router.get("/", function(req, res){
    res.render("landing");
})

//REGISTRATION
router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    var {username , email, lastname , firstname , gender 
        , description1 , birthdate , role , age , profilepicture ,
         phonenumber} = req.body;
    var newUser = new User({username , email, lastname , 
        firstname , gender , description1 , birthdate , role , age , 
        profilepicture , phonenumber});
        
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success","Welcome " + user.username);
            res.redirect("/blogs");
        })
    });
});

// LOGIN
router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/blogs",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res){
});

//LOGOUT 
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success","Logged you out!");
    res.redirect("/blogs");
});

module.exports = router;