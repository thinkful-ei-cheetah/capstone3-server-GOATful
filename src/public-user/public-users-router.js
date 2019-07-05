'use strict';
const express = require('express');
const publicUsersRouter = express.Router();
const bodyParser = express.json();
const {requireAuth} = require('../middleware/jwt-auth');
const VideoSchema = require('../videos/video-schema');
const VideoService = require('../videos/video-service');
const PreviewSchema = require('../previews/preview-schema');
const PreviewService = require('../previews/preview-service');

publicUsersRouter
  .route('/create-video-and-preview')
  .post(requireAuth, bodyParser, async (req, res, next) => {
    const {preview, video} = req.body;
    if (!preview || !video) {
      return next({status: 400, message: 'preview and video object required'});
    }

    // get user_id from req and add to video
    video.user_id = req.user.id;
    const validVideo = VideoSchema.validate(video);
    if (validVideo.error) {
      return next({status: 400, message: validVideo.error.details[0].message});
    }

    try {
      const savedVideo = await VideoService.insertVideo(req.app.get('db'), validVideo.value);
      preview.video_id = savedVideo.id;

      const validPreview = PreviewSchema.validate(preview);
      if (validPreview.error) {
        return next({status: 400, message: validPreview.error.details[0].message});
      }

      validPreview.value.is_active = true;
      const savedPreview = await PreviewService.insert(req.app.get('db'), validPreview.value);
      res.status(201).json(savedPreview);
    } catch(err) {
      return next({ status: 500, message: err.message });
    }
  });

module.exports = publicUsersRouter;