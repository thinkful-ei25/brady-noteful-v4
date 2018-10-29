'use strict';

const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* ========== POST/INSERT USERS  ========== */

router.post('/', (req, res) => {
  let { fullname, username, password } = req.body;
  console.log(`${req.body}`);
  return User
    .find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.create({fullname, username, password});
    })
    .then( result => {
      return res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if(err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal Server Error'});
    });
});

module.exports = router;
