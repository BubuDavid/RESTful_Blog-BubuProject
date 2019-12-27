// ===============================================================================================
//    Requirements and init variables
// ===============================================================================================
var express        = require('express'),
    expreSanitizer = require('express-sanitizer'),
    bodyParser     = require('body-parser'),
    mongoose       = require('mongoose'),
    methodOverride = require('method-override'),

    app  = express(),
    port = 5000;

// ===============================================================================================
//    Set Up
// ===============================================================================================
// To skip ".ejs" in the render function
app.set("view engine", "ejs");
// To be able to have a "public" folder where are CSS and JS
app.use(express.static("public"));
// To treat the body as an object instead a string
app.use(bodyParser.urlencoded({extended: true}));
// To forbid the use of <script> in our textarea in the edit and  create forms
app.use(expreSanitizer())
// To work cool with mongodb
mongoose.connect("mongodb://localhost:27017/restful_blogapp", {useNewUrlParser: true, useUnifiedTopology: true});
// To be able to use PUT, DELETE, ETC... Methods with express
app.use(methodOverride("_method"));

// ===============================================================================================
//    Schema
// ===============================================================================================
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// First Blog
// Blog.create({
//     title: "Test blog",
//     image: "https://miro.medium.com/max/3840/1*WpFxuBpMV9Qki4399SEV4A.jpeg",
//     body: "Hello this a blog post"
// }, function(err, blog) {
//     if(!err) {
//         console.log("Created!");
//         console.log(blog);
//     }
// });

// ===============================================================================================
//    RESTful Routes
// ===============================================================================================
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if(!err) {
            res.render("index", {blogs:blogs});
        } else {
            console.log("There's an error moose");
            console.log(err);
        }
    });
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res) {
    // Create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, blog) {
        if(!err) {
            // Redirect to the index
            res.redirect("/blogs");
        } else {
            res.render("new");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog:foundBlog});
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if(err) {
            console.log("AN ERRRRRROOOOOOORRRR!");
            console.log(err);
        } else {
            console.log(foundBlog);
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if(err) {
            res.redirect("/");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err, foundBlog) {
        if(err) {
            console.log("ERRRROOOORR!");
            res.redirect("/");
        } else {
            res.redirect("/");
        }
    });
});

// ===============================================================================================
//    Run the server
// ===============================================================================================
app.listen(port, function() {
    console.log("Blog app is running in the port: " + port);
});

// To run the data base:
// mongod --dbpath=/data