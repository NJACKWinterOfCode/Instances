var express     = require("express"),
    Blog        = require("../models/blogmodel"),
    middleware  = require("../middleware"),
    router      = express.Router({mergeParams: true});

    multer      = require("multer");

// DEFINE THE STORAGE FOR BLOG PICS IN DISKSTORAGE
var blogpic_storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, './public/uploads/blogs')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        //Saves the file
        cb(null, true);
    } else {
        //Rejects a file and does not throw an error
        req.fileFilterError = true;
        cb(null, false);
    }
}

var upload_blogpic = multer({storage: blogpic_storage, fileFilter: fileFilter});

var moment = require('moment');


// INDEX - SHOW ALL INSTANCES
router.get("/", function(req, res){
    Blog.find({}, function(err, allBlogs){
        if(err){
            console.log(err);
        } else {
            res.render("blogs/index", {blogs: allBlogs});
        }
    });
});


//SHOW INSTANCES OF ONLY LOGGED IN USER
router.get('/:user_id/myBlogs',middleware.isLoggedIn, function(req, res){
    Blog.find({user:req.params.user_id}, function(err, data){
        if(err){
            console.log(err);
        } else {
            res.render("blogs/myblogsindex", {myBlogs: data});
        }
    });
});



//NEW - ADD INSTANCE
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("blogs/new");
});

//CREATE - CREATE INSTANCE

router.post("/", middleware.isLoggedIn, upload_blogpic.array('blogpicture', 10), function(req, res){
    try{
        var name    = req.body.name;
        var image   = req.files.map(file => {return ("./" + file.path.slice(7))});

        var desc    = req.body.description;
        var author  = {
            id      : req.user._id,
            username: req.user.username
        };
        var newBlog = {name: name, image: image, description: desc, author: author, user : req.user._id};
        if(req.fileFilterError) {
            req.fileFilterError = false;
            req.flash("error","Insert images only");
            return res.redirect("/blogs/new");
        } 
        Blog.create(newBlog, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/blogs");
        }
    });
      }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// SHOW - MORE INFO PAGE
router.get("/:id", function(req, res){
    Blog.findById(req.params.id).populate('comments').populate('user',['description1','username']).exec(function(err, found){
        if(err || !found){
            console.log(err);
            req.flash("error", "Blog not found");
            res.redirect("back");
        } else {

            console.log(found);

            res.render("blogs/show", {blog: found, moment : moment});

        }
    });
});

// EDIT INSTANCE
router.get("/:id/edit", middleware.ifOwned, function(req, res){
    Blog.findById(req.params.id, function(err, found){
        res.render("blogs/edit",{blog: found});
    });
});

// UPDATE INSTANCE
router.put("/:id", middleware.ifOwned, function(req, res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, update){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }   
    });
});

// DELETE INSTANCE
router.delete("/:id", middleware.ifOwned, function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }   
    });
});  

// DELETE MYBLOG AND REDIRECT TO THE SAME PAGE
router.delete("/:id/myBlogs", middleware.ifOwned, function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect('back');
        }   
    });
});  


module.exports = router;