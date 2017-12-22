/**
 * Module dependencies.
 */
let mongoose = require('mongoose'),
  config = require('../../config/config'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
const ArticleSchema = new Schema({
  id: {
    type: Number
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  content: {
    type: String,
    default: '',
    trim: true
  }
});

/**
 * Statics
 */
ArticleSchema.statics = {
  load(id, cb) {
    this.findOne({
      id
    }).select('-_id').exec(cb);
  }
};

/**
 * validate title and content
 * if empty
 */
ArticleSchema.path('title').validate(title => title.length, 'title cannot be blank');

ArticleSchema.path('content').validate(content => content.length, 'content cannot be blank');

mongoose.model('Article', ArticleSchema);
