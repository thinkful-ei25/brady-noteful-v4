'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Folder = require('../models/folder');
const Note = require('../models/note');
const User = require('../models/user');

const router = express.Router();

/* ========== POST/INSERT USERS  ========== */

router.post('/', (req, res, next) => {
  const newUser = {
    fullname: req.body.fullname,
    username: req.body.username,
    password: req.body.password
  };
  User.create(newUser).then(result => {
    res
      .location(`${req.originalUrl}/${result.id}`)
      .status(201)
      .json(result);
  });
});

module.exports = router;
