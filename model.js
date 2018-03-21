'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  id: {type: String, required: true},
  userName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true}
});

/* In regards to the votes Array of Objects... Not sure if this is needed since its not referenced anywhere */
/*votes[{
  user: user_id,
  value: [-1,1]
}]; */

const voteSchema = mongoose.Schema({
  user: {type: ObjectId, ref: 'User', required: true},
  value: {type: Number, required: true}
});

const reviewSchema = mongoose.Schema({
  user: {type: ObjectId, ref: 'User', required: true},
  site: {type: ObjectId, ref: 'Site', required: true},
  description: {type: String, required: true},
  rating: {type: Number, required: true},
  votes: [voteSchema],
  voteTotal: Number
});

const siteSchema = mongoose.Schema({
  url: {type: String, required: true},
  description: {type: String, required: true}
});
