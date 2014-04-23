var mongoose = require('mongoose');
var db = mongoose.connect(process.env.MONGOLAB_URI);
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
exports.getAverage = function(req,res){
    var staytimes = 0;
    var staylen = 0
    MessageModel.find({}).select('staytime').exec(function(err, docs){
        docs.forEach(function(e){
            console.log(parseInt(e.staytime));
            if(e.staytime){
                staytimes += parseInt(e.staytime);
                staylen++;
            }
        });
    });
    res.json(staytimes/staylen);
}
exports.list = function(req, res){
    res.render('index.jade');
};
postFileToS3 = function(file){
        var s3Bucket = new AWS.S3({params: {Bucket: 'anonybox'}});
        var tp = file["tp"];
        var fn = file["fn"];
        var ftype= file["ftype"];
        console.log("tp: "+ tp);
        fs.readFile(tp, function(err, fileBuffer){
            if(err) throw err;
            console.log("rf tp: "+tp);
            var params = {
                Key: fn,
                Body: fileBuffer,
                ACL: 'public-read',
                ContentType: ftype
            };
            s3Bucket.putObject(params, function(err, data){
                if(err){
                    console.log("error" + err);
                }else{
                    console.log("worked, data: "+JSON.stringify(data));
                }
            });
        });
}
exports.post = function(req, res){
    //console.log(req.files);
    var pictureUrls = [];
    for(key in req.files){
        var tp = req.files[key].path;
        var fn = req.files[key].name;
        var ftype = req.files[key].ftype;
        pictureUrls.push(fn);
        postFileToS3({"fn": fn, "tp":tp, "ftype": ftype});
        
    }
        console.log("picture urls: ", pictureUrls);
        messageObject = {
            message: req.body.message,
            staytime: req.body.staytime,
            distance: req.body.distance,
            temperature: req.body.temperature,
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
