const express = require("express");
const app = express();
const appController = require("./controller/appController.js");
const session = require('express-session');

app.set("view engine", "ejs");
app.use(express.static("./public"));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.get("/", appController.showIndex);
app.get("/register", appController.showRegister);
app.post("/doRegister", appController.doRegister);
app.get("/login", appController.showLogin);
app.post("/doLogin", appController.doLogin);
app.post("/doPostCard", appController.doPostCard);
app.get("/logout", appController.logout);
app.get("/getAllCard", appController.getAllCard);
app.get("/getCount", appController.getCount);
app.get("/myInfo", appController.myInfo);
app.get("/myInfo/setVia", appController.showSetVia);
app.post("/myInfo/doUploadPic", appController.doUploadPic);
app.get("/myInfo/crop", appController.showCrop);
app.post("/myInfo/doCrop", appController.doCrop);
app.post("/myInfo/doSignature", appController.doSignature);
app.get("/myInfo/myCard", appController.myCard);
app.get("/myInfo/record", appController.record);
app.post("/myInfo/doSetBasics", appController.doSetBasics);
app.get("/friendList", appController.friendList);
app.get("/curFirendInfo", appController.curFirendInfo);


app.listen(3000);