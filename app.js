var express = require('express');
var app = express();
var http = require('http').createServer(app);
var mongoose = require('mongoose');
var actions = require('./actions/actions');
var io = require('socket.io').listen(http);
mongoose.connect('mongodb://localhost:27017', function(){
    console.log('mongoose connected');
});

var userSchema = new mongoose.Schema({
    username: String,
    email: String,
    twitter : String,
    password : String,
    comments: Array
});

var User = mongoose.model('User', userSchema);

var featureSchema = new mongoose.Schema({
    icon: String,
    title: String,
    id: Number,
    description: String,
    upvotes: Number,
    downvotes: Number,
    comments: Array,
    score: Number
});

var Feature = mongoose.model('Feature', featureSchema);

function saveFeatures(Feature){
    var features = [
        {
            icon: 'fa fa-facebook-square',
            title: "facebook login",
            id: 0,
            description: "login with facebook...",
            upvotes: 11,
            downvotes: 4,
            comments: [{
                name: 'bob',
                comment: 'i love it',
                replies: []
            },{
                name: 'bob',
                comment: 'boo',
                replies: []
            }],
            score: 0
        },
        {
            icon: 'fa fa-twitter-square',
            title: "Twitter Feed",
            id: 1,
            description: "display the user's twitter feed",
            upvotes: 102,
            downvotes: 4,
            comments: [{
                name: 'bob',
                comment: 'i love it',
                replies: []
            },{
                name: 'bob',
                comment: 'boo',
                replies: []
            }],
            score: 0
        },
        {   icon: 'fa fa-comments-o',
            title: "Threaded comments",
            id: 2,
            description: "allow users to have access to threaded comments",
            upvotes: 1011,
            downvotes: 4,
            comments: [{
                name: 'bob',
                comment: 'i love it',
                replies: []
            },{
                name: 'bob',
                comment: 'boo',
                replies: []
            }],
            score: 0
        },
        {
            icon: 'fa fa-cloud',
            title: "Today's weather",
            id: 3,
            description: "get weather.com information according to zip code",
            upvotes: 1,
            downvotes: 4,
            comments: [{
                name: 'bob',
                comment: 'i love it',
                replies: []
            },{
                name: 'bob',
                comment: 'boo',
                replies: []
            }],
            score: 0
        },
        {
            icon: 'fa fa-camera-retro',
            title: "Add profile pic",
            id: 4,
            description: "allow users to upload a profile pic",
            upvotes: 103,
            downvotes: 4,
            comments: [{
                name: 'bob',
                comment: 'i love it',
                replies: []
            },{
                name: 'bob',
                comment: 'boo',
                replies: []
            }],
            score: 0
        }]

    for(var i = 0;i<features.length;i++){
        var score = features[i].upvotes / features[i].downvotes;
        var feature = new Feature({
            icon: features[i].icon,
            title: features[i].title,
            id: features[i].id,
            description: features[i].description,
            upvotes: features[i].upvotes,
            downvotes: features[i].downvotes,
            comments: features[i].comments,
            score: score
        }).save(function(){
                console.log('saved feature');
            })
    }
}

//saveFeatures(Feature);

var actionSchema = new mongoose.Schema({
    title: String,
    data: {}
});


var Action = mongoose.model('Action', actionSchema);
var actionsInterval = setInterval(function(){
    actions.get(Action, Feature, User, io, actions)
}, 100);

app.use(express.static(__dirname + '/views'));
app.get('/', function(req, res){
    res.render('index.html');
});


io.on('connection', function(socket){
    console.log('connected to socket:' + socket.id);
    var socketId = socket.id;
    io.to(socketId).emit('hello', 'hello');
    socket.on('get features', function(){
        var dataToSet = {
            title: 'get features',
            data: 'get features'
        };
        actions.set(Action, dataToSet);
    });
    socket.on('upvote', function(data){
        console.log('upvote');
        var dataToSet = {
            title: 'upvote',
            data: data
        };
        actions.set(Action, dataToSet);
    });
    socket.on('downvote', function(data){
        console.log('downvote');
        var dataToSet = {
            title: 'downvote',
            data: data
        };
        actions.set(Action, dataToSet);
    });
    socket.on('createUser', function(data){
        data.socket = socketId;
        var dataToSet = {
            title: 'createUser',
            data: data
        };
        actions.set(Action, dataToSet);
    });
    socket.on('loginUser', function(data){
        console.log('loginUser');
        data.socket = socketId;
        var dataToSet = {
            title: 'loginUser',
            data: data
        };
        actions.set(Action, dataToSet);
    });
    socket.on('newComment', function(data){
        console.log('newComment');
        var dataToSet = {
            title: 'addComment',
            data: data
        };
       actions.set(Action, dataToSet);
    });
});


http.listen(3000);