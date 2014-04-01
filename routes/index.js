var mongoose = require('mongoose');
var db = mongoose.connect("mongodb://heroku_app23600264:me3iomdcu8pcpmlle5qhic2gqt@ds035448.mongolab.com:35448/heroku_app23600264");
var MessageSchema = require('../models/messageObjectSchema.js').MessageSchema;
var MessageModel = db.model('MessageSchema', MessageSchema);
var path = require('path');

var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.region = 'us-west-2';

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
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
exports.post = function(req, res){
    console.log(req.files);
    var pictureUrls = [];
    var tempPaths = [];
    var fileNames = [];
    var keynum = 0;
    for(key in req.files){
        tp = req.files[key].path;
        fn = req.files[key].name;
        ftype = req.files[key].type;
        fs.readFile(tp, function(err, fileBuffer){
            var s3Bucket = new AWS.S3({params: {Bucket: 'anonybox'}});
            var params = {
                Key: fn,
                Body: fileBuffer,
                ACL: 'public-read',
                ContentType: ftype
            };
            s3Bucket.putObject(params, function(err, data){
                if(err){
                    console.log("error");
                }else{
                    if(Object.keys(req.files).length-1 === keynum){
                        console.log("finished");
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
                                res.json(doc);
                            }
                        });
                    }
                    ++keynum;
                }
            });
        });
//      pictureUrls.push(fn);
//      var targetPath = path.resolve('./public/images/'+fn);
//      fs.rename(tp, targetPath, function(err,doc) {
//          if (err) throw err;
//          console.log("Upload completed!: ", doc);
//      });
    }
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
