'use strict';

const Joi = require('joi');

const PreviewSchema = Joi.object().keys({
  title: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().min(1).max(5000).required(),
  thumbnail_url: Joi.string().required(),
  video_id: Joi.number().required(),
  is_active: Joi.bool()
});

module.exports = PreviewSchema;
