'use strict';
const Joi = require('joi');

module.exports = Joi.object().keys({
  title: Joi.string().min(1).max(30).required(),
  thumbnail_url: Joi.string().required(),
  is_active: Joi.bool().required(),
  description: Joi.string().min(1).max(30).required(),
  video_id: Joi.number(),
  id: Joi.number()
});
