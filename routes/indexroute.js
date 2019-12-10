var express     = require("express"),
    User        = require("../models/usermodel"),
    passport    = require("passport"),
    router      = express.Router({mergeParams: true});
const { check, validationResult } = require('express-validator');

// HOME PAGE
router.get("/", function(req, res){
    res.render("landing");
})

//REGISTRATION
router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register",[check('email', 'Please include a valid email').isEmail().withMessage('Must be a valid email')], function(req, res){
    var {username , email, lastname , firstname , gender 
        , description1 , birthdate , role , age , profilepicture ,
         phonenumber} = req.body;
    var newUser = new User({username , email, lastname , 
        firstname , gender , description1 , birthdate , role , age , 
        profilepicture , phonenumber});
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
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