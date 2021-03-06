/**
 * Module dependencies.
 */
let mongoose = require('mongoose'),
  config = require('../../config/config'),
  Schema = mongoose.Schema;

/**
 * Answer Schema
 */
const AnswerSchema = new Schema({
  id: {
    type: Number
  },
  text: {
    type: String,
    default: '',
    trim: true
  },
  official: {
    type: Boolean
  },
  region: {
    type: String,
    default: '',
    trim: true
  },
  expansion: {
    type: String,
    default: '',
    trim: true
  }
});

/**
 * Statics
 */
AnswerSchema.statics = {
  load(id, cb) {
    this.findOne({
      id
    }).select('-_id').exec(cb);
  }
};

mongoose.model('Answer', AnswerSchema);
