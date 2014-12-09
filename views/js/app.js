var myApp = angular.module('myApp', ['ngRoute', 'facebook']).factory('socket', function ($rootScope) {
    var socket = io.connect('http://localhost:3000');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}).config(function(FacebookProvider) {
    // Set your appId through the setAppId method or
    // use the shortcut in the initialize method directly.
    FacebookProvider.init('1519377984984096');
});



var myController = myApp.controller('myController', function($scope, $rootScope, socket, Facebook){
    $scope.data = {
        twitterConnected: false,
        tweets: null,
        newComment: '',
        loggedIn : false,
        pleaseLogin : false,
        user : {},
        features: [],
        incorrect: false,
        profilePic: File,
        reply: {
            featureIndex: null,
            commentIndex: null,
            replyComment: ''
        },
        twitterClick : function(){
            OAuth.initialize('MZ5Jpk4ozVnQpApySuGgvTEebP0', {cache:true});
            var authorizationResult = OAuth.create('twitter');
            OAuth.popup('twitter', {cache:true}, function(error, result) {
                if (!error) {
                    console.log(result);
                    authorizationResult = result;
                    var promise = authorizationResult.get('/1.1/statuses/home_timeline.json').done(function(data) {
                        console.log(data);
                        $scope.$apply(function(){
                            $scope.data.tweets = data;
                        });
                    });
                } else {
                    console.log(error);
                }
            });
        },
        upvote : function(id, $event){
            if($scope.data.loggedIn) {
                var whichFeature = parseInt(id);
                var dataToSend = {
                    user: $scope.data.user.username,
                    feature: whichFeature
                };
                socket.emit('upvote', dataToSend);
            }else {
                $scope.data.pleaseLogin = true;
                $scope.view.main = false;
                $scope.view.feature = null;
                $scope.view.account.login = false;
                $scope.view.account.register = false;
                $scope.view.register.choose = false;
                $scope.view.register.email = false;
            }
        },
        downvote : function(id, $event){
            if($scope.data.loggedIn) {
                var whichFeature = parseInt(id);
                var dataToSend = {
                    user: $scope.data.user.username,
                    feature: whichFeature
                };
                socket.emit('downvote', dataToSend);
            }else {
                $scope.data.pleaseLogin = true;
                $scope.view.main = false;
                $scope.view.feature = null;
                $scope.view.account.login = false;
                $scope.view.account.register = false;
                $scope.view.register.choose = false;
                $scope.view.register.email = false;
            }
        },
        score: function(upvotes, downvotes){
            var score = upvotes/downvotes;
            return score;
        },
        select : function(id){
            $scope.view.main = false;
            $scope.view.feature = id;
            $scope.data.pleaseLogin = false;
        },
        back : function(){
            $scope.view.main = true;
            $scope.view.feature = null;
            $scope.view.account.login = false;
            $scope.view.account.register = false;
            $scope.data.pleaseLogin = false;
        },
        goToLogin : function(){
            $scope.view.main = false;
            $scope.view.feature = null;
            $scope.view.account.login = true;
            $scope.view.account.register = false;
            $scope.view.register.choose = false;
            $scope.view.register.email = false;
            $scope.data.pleaseLogin = false;
        },
        goToRegister : function(){
            $scope.view.main = false;
            $scope.view.feature = null;
            $scope.view.account.login = false;
            $scope.view.account.register = true;
            $scope.view.register.choose = true;
            $scope.view.register.email = false;
            $scope.data.pleaseLogin = false;
        },
        goToEmailRegister : function(){
            $scope.view.main = false;
            $scope.view.feature = null;
            $scope.view.account.login = false;
            $scope.view.account.register = true;
            $scope.view.register.choose = false;
            $scope.view.register.email = true;
            $scope.data.pleaseLogin = false;
        },
        createUser: function(){
            socket.emit('createUser', $scope.data.user);
        },
        loginUser : function(){
            socket.emit('loginUser', $scope.data.user);
        },
        goToProfile : function(){

        },
        addComment: function(featureId){
           if($scope.data.newComment != '') {
               var dataToSend = {
                   user: $scope.data.user.username,
                   feature: featureId,
                   comment: $scope.data.newComment
               };
               socket.emit('newComment', dataToSend);
               $scope.data.newComment = '';
           }
        },
        showReplyField: function(parentIndex, index){
            $scope.data.reply.featureIndex = parentIndex;
            $scope.data.reply.commentIndex = index;
            console.log($scope.data.reply.featureIndex, $scope.data.reply.commentIndex);
        },
        cancelReply: function(){
            $scope.data.reply.featureIndex = null;
            $scope.data.reply.commentIndex = null;
        },
        sendReply: function(){
            if($scope.data.reply.replyComment != '') {
                var dataToSend = {
                    featureIndex: $scope.data.reply.featureIndex,
                    commentIndex: $scope.data.reply.commentIndex,
                    reply: $scope.data.reply.replyComment,
                    user: $scope.data.user.username
                };
                socket.emit('commentReply', dataToSend);
                $scope.data.reply.featureIndex = null;
                $scope.data.reply.commentIndex = null;
                $scope.data.reply.replyComment = '';
            }
        },
        handleProfilePic : function(){
            if($scope.data.loggedIn == true) {
                var profilePic = document.getElementById('profilePic');
                var picData;

                var file = profilePic.files[0];
                var imageType = /image.*/;

                if (file.type.match(imageType)) {
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        picData = reader.result;
                        var dataToSend = {
                            user: $scope.data.user.username,
                            data: picData
                        };
                        socket.emit('profilePic', dataToSend);
                        profilePic.value = null;
                    };
                    reader.readAsDataURL(file);
                } else {
                    console.log('i dunno, man');
                }
            }
        },
        facebooking : function() {
            console.log('zoooooom');
            // From now on you can use the Facebook service just as Facebook api says
            Facebook.login(function(responseZero) {
                // Do something with response.
                console.log(responseZero);
                getInfo(responseZero);
            });
            function getInfo(responseZero){
                Facebook.api('/me', function(responseOne) {
                    $scope.data.user.username = responseOne.first_name + ' ' + responseOne.last_name;
                    Facebook.api('/me/picture', function(responseTwo) {
                        $scope.data.user.img = responseTwo.data.url;
                        socket.emit('createUser', $scope.data.user);
                        $scope.view.account.login = false;
                    });
                });
            }
        }
    }
    $scope.view = {
        main: true,
        account:{
            login: false,
            register: false
        },
        register: {
            choose: false,
            email: false
        }
    };

    socket.on('hello', function(data){
            socket.emit('get features');
    });
    socket.on('features', function(data){
        console.log(data);
        $scope.data.features = data;
    });
    socket.on('userCreated', function(data){
       $scope.view.main = true;
        $scope.view.account.register = false;
        $scope.data.loggedIn = true;
    });
    socket.on('loggedIn', function(data){
        $scope.data.user = data;
        console.log(data);
        $scope.data.loggedIn = true;
        $scope.view.main = true;
        $scope.view.feature = null;
        $scope.view.account.login = false;
    });
    socket.on('incorrect', function(data){
       $scope.data.incorrect = true;
    });
});