var express = require('express');
var app = express();
var hbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
var bodyParser = require("body-parser");
var session = require('express-session')
const mongoose =require('mongoose');
//const uri = "mongodb+srv://duongndtph25724:au5IzvJGFJ92KAVJ@cluster0.pmr47x5.mongodb.net/test";

var fs = require('fs');
var multer = require('multer')

var passport = require('passport');
var config = require('./config/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/api', apiRouter);

mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(passport.initialize());

const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }))


module.exports = app;

const sanPhamModel = require('./ProductModel')
const usersModel = require('./UserModel')

app.use(session({
    secret: 'zuog',
    resave: false,
    saveUninitialized: true
}));

app.engine('.hbs', hbs.engine({
    extname: "hbs",
    defaultLayout: false,
    layoutsDir: "views/layouts/",
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));

app.set('view engine', '.hbs');
app.set('views', './views');

//manager
app.get('/manager', function(req, res){
  res.render('manager')
})
app.post('/manager', function(req,res){
  res.redirect('/manager')
})

//add
app.get('/add', function(req, res){
  res.render('add')
})
app.post('/add', async (req, res) => {
  const { maSP, tenSP, giaSP, mauSP } = req.body
  const newDoc = new sanPhamModel({  maSP, tenSP, giaSP, mauSP })
  await newDoc.save()
  res.redirect('/products')
})
//product
app.get('/products', async (req, res) => {
  const data = await sanPhamModel.find().lean()
  res.render('products', { data })
})
app.post('/products', function(req, res){
  res.redirect('products')
})
//edit
app.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const newData = req.body;
  sanPhamModel.findByIdAndUpdate(id, newData)
    .then(() => {
      res.redirect('/products');
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Internal server error');
    });
})
app.get('/edit/:id', async(req, res)=>{
  const id = req.params.id;
  // Retrieve data from MongoDB based on ID
  sanPhamModel.findById(id)
    .then(data => {
      // Render the edit view template with the retrieved data
      res.render('edit', { data });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Internal server error');
    });
})
app.post('/delete/:id', async (req, res) => {
  const id = req.params.id
  await sanPhamModel.findByIdAndDelete(id)
  res.redirect('/products')
})

//users
app.get('/users', async (req, res) => {
  const user = await usersModel.find().lean()
  res.render('users', { user })
})
app.post('/users', function(req, res){
  res.redirect('users')
})
//edit
app.post('/editUsers/:id', async (req, res) => {
  const id = req.params.id;
  const newData = req.body;
  
  sanPhamModel.findByIdAndUpdate(id, newData)
    .then(() => {
      res.redirect('/users');
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Internal server error');
    });
})
app.get('/editUsers/:id', async(req, res)=>{
  const id = req.params.id;
  usersModel.findById(id)
    .then(user => {
      res.render('editUsers', { user });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Internal server error');
    });
})

//delete
app.post('/deleteUsers/:id', async (req, res) => {
  const id = req.params.id
  await usersModel.findByIdAndDelete(id)
  res.redirect('/users')
})

const port = 8080;

app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
});
