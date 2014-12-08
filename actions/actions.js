exports.set = function(Action, dataToSet){
    var action = new Action({
        title: dataToSet.title,
        data: dataToSet.data
    }).save(function(){
            console.log('saved action');
        });
};

exports.get = function(Action, Feature, User, io, actions){
    Action.find({}, function(err,data){
        if(data[0]) {
            var action = data[0];
            if(data[0].title == 'get features'){
                Feature.find({}, function(err, features){
                    var dataToSet = {
                        title: 'emit features',
                        data: {
                            features: features
                        }
                    };
                    actions.set(Action, dataToSet);
                });
            }
            if(data[0].title == 'emit features'){
                io.emit('features', data[0].data.features);
            }
            if(data[0].title == 'upvote'){
                Feature.find({id:data[0].data}, function(err, features){
                    if(features[0]) {
                        console.log('upvoted');
                        features[0].upvotes = features[0].upvotes + 1;
                        features[0].score = features[0].upvotes / features[0].downvotes;
                        features[0].save(function () {
                            var dataToSet = {
                                title: 'get features',
                                data: 'get features'
                            };
                            actions.set(Action, dataToSet);
                        });
                    }
                })
            }
            if(data[0].title == 'downvote'){
                Feature.find({id:data[0].data}, function(err, features){
                    if(features[0]) {
                        console.log('downvoted');
                        features[0].downvotes = features[0].downvotes + 1;
                        features[0].score = features[0].upvotes / features[0].downvotes;
                        features[0].save(function () {
                            var dataToSet = {
                                title: 'get features',
                                data: 'get features'
                            };
                            actions.set(Action, dataToSet);
                        });
                    }
                })
            }
            if(data[0].title == 'createUser'){
                var user = new User({
                    username: data[0].data.username,
                    email: data[0].data.email,
                    twitter: data[0].data.twitter,
                    password: data[0].data.password
                }).save(function(){
                       console.log('saved user');
                       io.to(data[0].data.socket).emit('userCreated', 'userCreated');
                    });
            }
            if(data[0].title == 'loginUser'){
                User.find({username : data[0].data.username},function(err, user){
                    if(user[0]){
                        if(data[0].data.password == user[0].password){
                            io.to(data[0].data.socket).emit('loggedIn', user[0]);
                        }else{
                            io.to(data[0].data.socket).emit('incorrect', 'incorrect');
                        }
                    }
                })
            }
            data[0].remove();
        }else{

        }
    });
};