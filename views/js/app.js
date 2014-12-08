var myApp = angular.module('myApp', ['ngRoute']).factory('socket', function ($rootScope) {
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
});



var myController = myApp.controller('myController', function($scope, $rootScope, socket){

    $scope.data = {
        newComment: '',
        loggedIn : false,
        user : undefined,
        features: [],
        incorrect: false,
        upvote : function(id, $event){
            $event.stopPropagation();
            $scope.view.main = true;
            $scope.view.feature = null;
            var whichFeature = parseInt(id);
            socket.emit('upvote', whichFeature);
        },
        downvote : function(id, $event){
            $event.stopPropagation();
            $scope.view.main = true;
            $scope.view.feature = null;
            var whichFeature = parseInt(id);
            socket.emit('downvote', whichFeature);
        },
        score: function(upvotes, downvotes){
            var score = upvotes/downvotes;
            return score;
        },
        select : function(id){
            $scope.view.main = false;
            $scope.view.feature = id;
        },
        back : function(){
            $scope.view.main = true;
            $scope.view.feature = null;
            $scope.view.account.login = false;
            $scope.view.account.register = false;
        },
        goToLogin : function(){
            $scope.view.main = false;
            $scope.view.feature = null;
            $scope.view.account.login = true;
            $scope.view.account.register = false;
            $scope.view.register.choose = false;
            $scope.view.register.email = false;
        },
        goToRegister : function(){
            $scope.view.main = false;
            $scope.view.feature = null;
            $scope.view.account.login = false;
            $scope.view.account.register = true;
            $scope.view.register.choose = true;
            $scope.view.register.email = false;
        },
        goToEmailRegister : function(){
            $scope.view.main = false;
            $scope.view.feature = null;
            $scope.view.account.login = false;
            $scope.view.account.register = true;
            $scope.view.register.choose = false;
            $scope.view.register.email = true;
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
        }
    };
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
        $scope.data.loggedIn = true;
        $scope.view.main = true;
        $scope.view.account.login = false;
    });
    socket.on('incorrect', function(data){
       $scope.data.incorrect = true;
    });
});