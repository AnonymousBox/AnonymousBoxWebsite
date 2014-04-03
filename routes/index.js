var mongoose = require('mongoose');
var db = mongoose.connect("mongodb://heroku_app23600264:me3iomdcu8pcpmlle5qhic2gqt@ds035448.mongolab.com:35448/heroku_app23600264");
var MessageSchema = require('../models/messageObjectSchema.js').MessageSchema;
var MessageModel = db.model('MessageSchema', MessageSchema);
var path = require('path');

var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
});

var average = 0;
var getAverage = function(){
    var staytimes = 0;
    var staylen = 0
    MessageModel.find({}).select('staytime').exec(function(err, docs){
        docs.forEach(function(e){
            if(e.staytime){
                staytimes += e.staytime;
                staylen++;
            }
        });
        return staytimes/staylen
    });
}
exports.list = function(req, res){
    res.render('index.jade');
};
postFilesToS3 = function(files){
    console.log("files "+files);
    for(var i = 0; i < files.length; ++i){
        var s3Bucket = new AWS.S3({params: {Bucket: 'anonybox'}});
        var tp = files[i]["tp"];
        var fn = files[i]["fn"];
        var ftype= files[i]["ftype"];
        console.log("tp: "+ tp);
        fs.readFile(tp, function(err, fileBuffer){
                console.log("rf tp: "+tp);
                var params = {
                    Key: fn,
                    Body: fileBuffer,
                    ACL: 'public-read',
                    ContentType: ftype
                };
                console.log("params: "+ JSON.stringify(params));
                s3Bucket.putObject(params, function(err, data){
                    if(err){
                        console.log("error" + err);
                    }else{
                        console.log("worked, data: "+JSON.stringify(data));
                    }
                });
        });
    }
}
exports.post = function(req, res){
    //console.log(req.files);
    var pictureUrls = [];
    var files = [];
    for(key in req.files){
        var tp = req.files[key].path;
        var fn = req.files[key].name;
        var ftype = req.files[key].ftype;
        pictureUrls.push(fn);
        files.push({"fn": fn, "tp":tp, "ftype": ftype});
        console.log("tp: "+ tp);
        
    }
        console.log("picture urls: ", pictureUrls);
        messageObject = {
            message: req.body.message,
            staytime: req.body.staytime,
            pictureurls: pictureUrls
        };
        var postMessage = new MessageModel(messageObject);
        postMessage.save(function(err, doc){
            if(err || !doc){
                throw 'Error';
            }else{
                console.log("created");
                console.log(doc);
                postFilesToS3(files);
                res.json(doc);
            }
        });
//this is the old code, not dependent on amazon s3
//      pictureUrls.push(fn);
//      var targetPath = path.resolve('./public/images/'+fn);
//      fs.rename(tp, targetPath, function(err,doc) {
//          if (err) throw err;
//          console.log("Upload completed!: ", doc);
//      });
};
exports.getmessages = function(req, res){
    MessageModel.find().sort({_id:-1}).exec(function(err, docs){
        if(!err){
            res.json(docs);
        }else{
            console.log("got error");
        }
    });
};
