'use strict';

const express = require('express');
const User = require('../models/user');
const router = express.Router();

/* ========== POST/INSERT USERS  ========== */

router.post('/', (req, res, next) => {
  let { fullname, username, password } = req.body;
  
  
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if(missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'fullname', 'password'];
  const notAString = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');
  
  if (notAString) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: notAString
    });
  }

  const trimFields = ['username', 'password'];
  const notTrimmedField = trimFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (notTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Please remove whitespace at beginning or end of field',
      location: notTrimmedField
    });
  }

  const maxMinFields = {
    username: {
      min: 3,
      max: 20
    },
    password: {
      min: 8,
      max: 30
    }
  };
  const tooSmallField = Object.keys(maxMinFields).find(
    field =>
      'min' in maxMinFields[field] &&
      req.body[field].trim().length < maxMinFields[field].min
  );
  const tooLargeField = Object.keys(maxMinFields).find(
    field =>
      'max' in maxMinFields[field] &&
      req.body[field].trim().length > maxMinFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${maxMinFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${maxMinFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  

  return User.hashPassword(password)
    .then(digest => {
      const newUser ={
        fullname,
        username,
        password: digest
      };
      return User.create(newUser);
    })
    .then( result => {
      return res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error ('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;
