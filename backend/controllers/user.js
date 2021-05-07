require('dotenv').config({path: 'E:/Programming/Angular/mean-course-ms/backend/.env'});
const bcryt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createUser = (req, res) => {
  bcryt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => {
          res.status(201).json({
            message: 'user created ...'
          })
        })
        .catch(() => {
          res.status(500).json({
            message: 'Invalid authentication credentials!'
          })
        })
    })
}

exports.userSignIn = (req, res) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'Invalid authentication credentials!'
        });
      }
      fetchedUser = user;
      return bcryt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: 'auth failed...'
        });
      }
      const token = jwt.sign(
        {email: fetchedUser.email, userId: fetchedUser._id},
        process.env.JWT_KEY,
        {expiresIn: '1h'}
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(() => {
      return res.status(401).json({
        message: 'auth failed...'
      });
    })
}
