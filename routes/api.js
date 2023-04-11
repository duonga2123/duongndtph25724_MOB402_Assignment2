var passport = require("passport");
var config = require("../config/database");
require("../config/Passport")(passport);
var express = require("express");
var jwt = require("jsonwebtoken");
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");

const bodyParser = require("body-parser");

const request = require('request');
var multer = require('multer')

// // parse requests of content-type - application/json
router.use(bodyParser.json());

const parser = bodyParser.urlencoded({ extended: true });

router.use(parser);

// #SIGN UP
const signUpObj = {
  pageTitle: "Sign up",
  task: "Sign up",
  actionTask: "/api/signup",
};



// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },

  filename: function (req, file, cb) {
    let fileName = file.originalname;
    console.log(fileName);

    let arr = fileName.split(".");
    let newFileName = arr[0] + "-" + Date.now() + "-" + arr[1];

    cb(null, newFileName);
  },
});
const maxSize = 1 * 1024 * 1024;
var upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("avatar");


router.get("/signup", async (req, res) => {
  res.render("signup", signUpObj);
});
router.post("/signup", async function (req, res) {
  if (!req.body.email || !req.body.password) {
    // res.json({ success: false, msg: 'Please pass email and password.' });
    signUpObj.notify = "Please pass email and password.";
    return res.render("signup", signUpObj);
  } else {
    // check email available
    let check = await User.findOne({ email: req.body.email })
      .lean()
      .exec();
    console.log("check email available ", check);
    if (check) {
      signUpObj.notify = "email available. Try another email";
      return res.render("signup", signUpObj);
    }

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.send('File lớn hơn 1MB');
      } else if (err) {
        return res.send('File không xác định');
      }
    console.log(req.body.avatar);
    
    })

    var newUser = new User();
    newUser.email = req.body.email;
    newUser.names = req.body.names;
    newUser.password = req.body.password;
    newUser.avatar = req.body.avatar;

    const usernamess = await User.find().lean()
    // save the user
    await newUser.save();

    // res.json({ success: true, msg: 'Successful created new user.' });
    return res.redirect("/api/login");
  }
});

// #SIGN IN
const loginObj = {
  pageTitle: "Sign in",
  task: "Sign in",
  actionTask: "/api/login",
  optionsRegister: true,
};
const homeObj = {
  pageTitle: "Trang chu",
};
router.get("/login", async (req, res) => {
  res.render("login", loginObj);
});
router.post("/login", async function (req, res) {
  console.log(req.body);
  let user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    // res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
    loginObj.notify = "Authentication failed. User not found.";
    return res.render("login", loginObj);
  } else {
    // check if password matches
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (isMatch && !err) {

        return res.redirect("/manager");
      } else {
        // res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
        loginObj.notify = "Authentication failed. Wrong password.";
        return res.render("login", loginObj);
      }
    });
  }
});


module.exports = router;
