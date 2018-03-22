'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  id: {type: String, required: true},
  userName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true}
});

/* This was an example of the vote schema below. It would be an array of objects referenced in review schema */
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

const vote = mongoose.model('vote', voteSchema);
const review = mongoose.model('review', reviewSchema);
const site = mongoose.model('site', siteSchema);

module.export = {voteSchema review site};
