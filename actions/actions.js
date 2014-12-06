exports.set = function(Action, dataToSet){
    var action = new Action({
        title: dataToSet.title,
        data: dataToSet.data
    }).save(function(){
            console.log('saved action');
        });
};

exports.get = function(Action, Feature, io, actions){
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
                                title: 'emit features',
                                data: {
                                    features: features
                                }
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
                                title: 'emit features',
                                data: {
                                    features: features
                                }
                            };
                            actions.set(Action, dataToSet);
                        });
                    }
                })
            }
            data[0].remove();
        }else{

        }
    });
};