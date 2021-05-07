const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors");

mongoose.connect('mongodb://localhost:27017/mean-course-ms', {useNewUrlParser:true, useUnifiedTopology: true})
  .then(() => {
    console.log('connected to database...');
  })
  .catch(() => {
    console.log('connection failed...');
  })

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
})

app.use(cors());
app.options('/post/login', cors());

app.use('/api/posts', require('./routes/post'));
app.use('/api/users', require('./routes/user'));

module.exports = app;
