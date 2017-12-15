const formidable = require("formidable");
const myDb = require("../moudel/db.js");
const md5 = require("../moudel/md5.js");
const fs = require("fs");
const path = require("path");
const gm = require("gm");
var sd = require("silly-datetime");

//显示首页
exports.showIndex = function (req, res, next) {
    res.render("index", {
        "login": req.session.login == 1 ? true : false,
        "userName": req.session.login == 1 ? req.session.userName : "",
        "active": "index",
        "userPic": req.session.login == 1 ? req.session.userPic : "userPic.jpg"
    });
}

//显示注册页面
exports.showRegister = function (req, res, next) {
    res.render("register", {
        "login": req.session.login == 1 ? true : false,
        "userName": req.session.login == 1 ? req.session.userName : "",
        "active": "register"
    });
}

//显示登录页面
exports.showLogin = function (req, res, next) {
    res.render("login", {
        "login": req.session.login == 1 ? true : false,
        "userName": req.session.login == 1 ? req.session.userName : "",
        "active": "login"
    });
}

//显示头像上传页面
exports.showSetVia = function (req, res, next) {
    if (req.session.login != "1") {
        res.send("非法操作！！！");
        return;
    }
    res.render("setVia", {
        "login": true,
        "userName": req.session.userName,
        "active": "setVia"
    });
}

//显示裁剪
exports.showCrop = function (req, res, next) {
    if (req.session.login != "1") {
        res.send("非法操作！！！");
        return;
    }

    res.render("crop", {
        "login": true,
        "userName": req.session.userName,
        "active": "setVia",
        "Via": req.session.Via
    });
}

//显示个人中心
exports.myInfo = function(req, res, next){
    if (req.session.login != "1") {
        res.send("非法操作！！！");
        return;
    }
    var userName = req.session.userName;
    myDb._find("shoushou", "users", { "userName": userName }, function (err, result) {
        if(err){console.log(err);return;}
        res.render("myInfo",{
            "login": true,
            "userName": userName,
            "active": "myInfo",
            "userPic": result[0].userPic,
            "signature" : result[0].signatureText || ""
        });
    });
    
}

//显示好友列表
exports.friendList = function(req, res, next){
    myDb._find("shoushou", "users", {}, function (err, result) {
        if(err){console.log(err);return;};
        res.render("friendList",{
            "login": req.session.login == 1 ? true : false,
            "userName": req.session.login == 1 ? req.session.userName : "",
            "active": "friendList",
            "result" : result
        });
    });
}

//显示好友信息
exports.curFirendInfo = function(req, res, next){
    var userName = req.query.userName;
    myDb._find("shoushou", "users", {"userName":userName}, function (err, result) {
        if(err){console.log(err);return;};
        res.render("curFirendInfo",{
            "login": req.session.login == 1 ? true : false,
            "userName": req.session.login == 1 ? req.session.userName : "",
            "user" : userName,
            "userPic": result[0].userPic,
            "signatureText": result[0].signatureText,
            "active": "friendList"
        });
    });
}

//注册
exports.doRegister = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var userName = fields.userName;
        var user_password = md5(md5(fields.user_password) + "@#$%^^$&%^*^&@#$@$");
        myDb._find("shoushou", "users", { "userName": userName }, function (err, result) {
            if (err) { res.send("0"); return; }

            if (result.length != 0) { res.send("-1"); return; }

            myDb._insertOne("shoushou", "users",
                { "userName": userName, "user_password": user_password, "userPic": "userPic.jpg" },
                function (err, result) {
                    if (err) { res.send("0"); return; }
                    req.session.login = 1;
                    req.session.userName = userName;
                    req.session.userPic = "userPic.jpg";
                    res.send("1");
            });
        });
    });
}

//登录
exports.doLogin = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(err){console.log(err);return;}
        var userName = fields.userName;
        var user_password = md5(md5(fields.user_password) + "@#$%^^$&%^*^&@#$@$");
        myDb._find("shoushou", "users", { "userName": userName }, function (err, result) {
            if (err) { res.send("0"); return; }
            if (result.length != 0) {
                if (user_password == result[0].user_password) {
                    req.session.login = 1;
                    req.session.userName = userName;
                    req.session.userPic = result[0].userPic;
                    res.send("1"); return;
                } else {
                    res.send("-2"); return;
                }
            } else {
                res.send("-1"); return;
            }

        });
    });
}

//退出登录
exports.logout = function(req, res, next){
    req.session.login = false;
    req.session.userName = false;
    req.session.userPic = false;
    res.redirect("/");
}

//头像上传
exports.doUploadPic = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "../public/userPic");
    form.parse(req, function (err, fields, files) {
        var oldPath = files.uploadPic.path;
        var extname = path.extname(files.uploadPic.name);
        var newPath = path.join(__dirname, "../public/userPic/", req.session.userName + extname);
        fs.rename(oldPath, newPath, function (err) {
            if (err) { res.send("上传失败"); return; }
            req.session.Via = req.session.userName + extname;
            res.redirect("/myInfo/crop");
        });
    });
}

//头像裁剪
exports.doCrop = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var w = fields.w;
        var h = fields.h;
        var x = fields.x;
        var y = fields.y;
        var picPath = path.join(__dirname, "../public/userPic/", req.session.Via);
        gm(picPath)
            .crop(w, h, x, y)
            .resize(100, 100, '!')
            .write(picPath, function (err) {
                if(err){res.send("-1");return;}
                myDb._updateMany(
                    "shoushou", 
                    "users", 
                    { "userName": req.session.userName }, 
                    {$set:{"userPic": req.session.Via}},
                    function(err, result){
                        if(err){res.send("-1");return;}
                        req.session.userPic = req.session.Via;
                        res.send("1");
                    }
                );
        });
    });
}

//发表帖子
exports.doPostCard = function(req, res, next){
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "../public/cardPic");
    form.parse(req, function (err, fields, files) {
        var userName = req.session.userName;
        var userPic = req.session.userPic;
        var title = fields.title;
        var content = fields.content;
        var oldPath = files.cardPic.path;
        var extname = path.extname(files.cardPic.name);
        var myPostCardPic = req.session.userName + sd.format(new Date(), 'YYYYMMDDHHmmss') + parseInt(Math.random() * 899 + 100)  + extname;
        var newPath = path.join(__dirname, "../public/cardPic/", myPostCardPic);
        fs.rename(oldPath, newPath, function (err) {
            if (err) { console.log(err); return; }
            myDb._insertOne("shoushou", "postCards",
                { "userName": userName, 
                    "title": title, 
                    "content":content, 
                    "myPostCardPic":myPostCardPic,
                    "userPic": userPic,
                    "dateTime": sd.format(new Date(), 'YYYYMMDDHHmmss')
                },
                function (err, result) {
                    if (err) { console.log(err); return; }
                    res.redirect("/");
            });
        });
    });
}

//获取所有帖子
exports.getAllCard = function(req, res, next){
    var page = parseInt(req.query.page);
    myDb._find("shoushou", "postCards", {},{"showLineData":6,"page":page,"sort":{"dateTime":-1}}, function (err, result) {
        if (err) { console.log(err); return; }
        res.json(result);
    });
}

//分页
exports.getCount = function(req, res, next){
    myDb._count("shoushou", "postCards", {}, function(err, result){
        if(err){console.log(err);return;}
        res.send(result.toString());
    });
}

//编辑个性签名
exports.doSignature = function(req, res, next){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(err){res.send("-1");return;}
        var signatureText = fields.signatureText;
        myDb._updateMany(
            "shoushou", 
            "users", 
            { "userName": req.session.userName }, 
            {$set:{"signatureText": signatureText}},
            function(err, result){
                if(err){res.send("-1");return;}
                res.send("1");
            }
        );
    });
}

//我的帖子
exports.myCard = function(req, res, next){
    var userName = req.query.userName;
    myDb._find("shoushou", "postCards", {"userName":userName},{"sort":{"dateTime":-1}}, function (err, result) {
        if (err) { console.log(err); return; }
        res.json(result);
    });
}

//个人档
exports.record = function(req, res, next){
    var userName = req.query.userName;
    myDb._find("shoushou", "users", {"userName":userName}, function (err, result) {
        if (err) { console.log(err); return; }
        res.json(result);
    });
}

//设置个人档
exports.doSetBasics = function(req, res, next){
    var userName = req.session.userName;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(err){res.send("-1");return;}
        var sex = fields.sex;
        var age = fields.age;
        var birthday = fields.birthday;
        var constellation = fields.constellation;
        var job = fields.job;
        var company = fields.company;
        myDb._updateMany(
            "shoushou", 
            "users", 
            { "userName": userName}, 
            {$set:{
                "sex":sex,
                "age":age,
                "birthday":birthday,
                "constellation":constellation,
                "job":job,
                "company":company
            }},
            function(err, result){
                if(err){res.send("-1");return;}
                res.send("1");
            }
        );
    });
}


