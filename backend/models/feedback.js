const mongo = require('mongoose');
const feedback =mongo.Schema({
  rating: {type: Number},
  comment: {type: String},
  category: {type: String},
  date: {type: Date},
  submitterName: {type: String},
  submitterEmail: {type: String},
  submitterRole: {type: String},
});

const Feedback = mongo.model('Feedback', feedback);

module.exports = Feedback;
