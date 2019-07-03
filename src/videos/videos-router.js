'use strict';

const express = require('express');
const videosRouter = express.Router();
const VideoService = require('./video-service');

videosRouter
  .route('/')
  .get(async (req, res, next) => {
    const user_id = 1;
    try {
      const videos = await VideoService.list(req.app.get('db'), user_id);
      return res.json(videos);
    } catch(err) {
      next({status: 500, message: err.message});
    }
  });

module.exports = videosRouter;