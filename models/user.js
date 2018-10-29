'use strict';

const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  fullname: String,
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true}
});



// Add `createdAt` and `updatedAt` fields
userSchema.set('timestamps', true);

// Transform output during `res.json(data)`, `console.log(data)` etc.
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});

userSchema.methods.validatePassword = function(incomingPassword) {
  const user = this;
  return incomingPassword === user.password;
};

module.exports = mongoose.model('User', userSchema);
