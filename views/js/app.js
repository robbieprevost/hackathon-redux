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
        features: [{
            icon: '',
            title: '',
            id: 0,
            description: '',
            upvotes: 0,
            downvotes: 0,
            comments: [],
            score: 0
        },{
            icon: '',
            title: '',
            id: 1,
            description: '',
            upvotes: 0,
            downvotes: 0,
            comments: [],
            score: 0
        },{
            icon: '',
            title: '',
            id: 2,
            description: '',
            upvotes: 0,
            downvotes: 0,
            comments: [],
            score: 0
        },{
            icon: '',
            title: '',
            id: 3,
            description: '',
            upvotes: 0,
            downvotes: 0,
            comments: [],
            score: 0
        },{
            icon: '',
            title: '',
            id: 4,
            description: '',
            upvotes: 0,
            downvotes: 0,
            comments: [],
            score: 0
        }],
        upvote : function(id){
            var whichFeature = parseInt(id);
            socket.emit('upvote', whichFeature);
        },
        downvote : function(id){
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
        }
    };
    $scope.view = {
        main: true
    };

    socket.on('hello', function(data){
            socket.emit('get features');
    });
    socket.on('features', function(data){
        console.log(data);
        for(var i = 0;i<data.length;i++){
            for(var j = 0; j< $scope.data.features.length;j++) {
                if(data[i].id == $scope.data.features[j].id) {
                    $scope.data.features[j].icon = data[i].icon;
                    $scope.data.features[j].id = data[i].id;
                    $scope.data.features[j].description = data[i].description;
                    $scope.data.features[j].upvotes = data[i].upvotes;
                    $scope.data.features[j].downvotes = data[i].downvotes;
                    $scope.data.features[j].comments = data[i].comments;
                    $scope.data.features[j].score = data[i].score;
                    $scope.data.features[j].title = data[i].title;
                }
            }
        }
    });
});