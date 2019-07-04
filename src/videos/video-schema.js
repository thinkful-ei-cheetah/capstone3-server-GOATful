'use strict';

const Joi = require('joi');

const schema = Joi.object().keys({
  title: Joi.string().min(1).max(30).required(),
  video_length: Joi.string().required(),
  youtube_display_name: Joi.string().min(3).max(50).required(),
  tags: Joi.array().items(Joi.string().alphanum()).required(),
  user_id: Joi.number().required()
});

module.exports = schema;