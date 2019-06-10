var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/messageboard');

// Models
var CommentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    comment: {
        type: String,
        required: true,
        maxlength: 60,
        minlength: 3
    },
}, {
    timestamps: true
});
var Comment = mongoose.model('Comment', CommentSchema);

var MessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    message: {
        type: String,
        required: true,
        maxlength: 60,
        minlength: 3
    },
    comments: [CommentSchema],
}, {
    timestamps: true
});
var Message = mongoose.model('Message', MessageSchema);

// Views/URLs
// this route is the main page displaying the comments/messages and allowing the user to add more.
app.get('/', function (req, res) {
    Message.find({}, function (err, messages) {
        console.log(messages);
        res.render('index', {
            all_messages: messages
        });
    });
});

// this route adds a new message to the database
app.post('/new/message', function (req, res) {
    console.log("POST DATA", req.body);
    Message.create(req.body, function (err, data) {
        if (err){
            console.log("Flawed!")
        }
        else{
            console.log("Message successfully added to data")
            res.redirect('/');
        }
    })
});

// this route adds a new comment to the database
app.post('/new/comment', function (req, res) {
    console.log("POST DATA", req.body);
    Comment.create(req.body, function (err, data) {
        console.log(data);
        if (err) {
            console.log("Errors!")
        } else {
            console.log("Checkpoint")
            Message.findOneAndUpdate({_id: req.body.messageID}, {$push: {comments: data}}, function (err, data) {
                if (err) {
                    console.log("Could not update the message")
                } else {
                    console.log("Comment successfully added to Message!")
                    res.redirect('/');
                }
            })
        }
    })
})


app.listen(8000, function () {
    console.log("listening on port 8000");
});