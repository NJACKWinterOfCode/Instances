var Blog = require("../models/blogmodel"),
    Comment = require("../models/commentmodel");

var middlewareObj = {};

// FUNCTIONS
middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", " You need to be logged in to do that!");
    res.redirect("/login");
};

middlewareObj.ifOwned = function(req, res, next) {
    if (req.isAuthenticated()) {
        Blog.findById(req.params.id, function(err, found) {
            if (err || !found) {
                req.flash("error", "Blog not found!");
                res.redirect("/blogs");
            } else {
                if (found.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", " You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", " You need to be logged in to do that!");
        res.redirect("back");
    }
}


middlewareObj.ifOwnedComment = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, found) {
            if (err || !found) {
                req.flash("error", "Comment not found!");
                res.redirect("back");
            } else {
                if (found.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", " You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", " You need to be logged in to do that!");
        res.redirect("back");
    }
}

module.exports = middlewareObj;