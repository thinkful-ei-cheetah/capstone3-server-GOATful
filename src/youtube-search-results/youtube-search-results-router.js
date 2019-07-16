'use strict';

const express = require('express');
const YoutubeSearchResultsRouter = express.Router({mergeParams: true});
const YoutubeSearchResultService = require('./youtube-search-result-service');
const {requireAuth} = require('../middleware/jwt-auth');
const bodyParser = express.json();
const VideoService = require('../videos/video-service');

YoutubeSearchResultsRouter
  .route('/')
  .get(requireAuth, async (req, res, next) => {
    const { video_id } = req.params;

    try {
      const results = await YoutubeSearchResultService.findByVideoId(req.app.get('db'), video_id);
      if (!results) {
        res.json([]);
      } else {
        res.json(JSON.parse(results.data));
      }
    } catch(err) {
      next({status: 500, message: err.message});
    }
  })
  .post(requireAuth, bodyParser, async (req, res, next) => {
    const { video_id } = req.params;
    try {
      const [video] = await VideoService.getVideoById(req.app.get('db'), video_id);
      if (!video) {
        return next({status: 400, message: 'invalid video id'});
      }

      const data = req.body.data;
      if (!data) {
        return next({status: 400, message: 'data field is required'});
      }

      const newSearchResult = {data, video_id};
      const savedResult = await YoutubeSearchResultService.insert(req.app.get('db'), newSearchResult);
      res
        .status(201)
        .location(`/api/${video_id}/youtube-search-results`)
        .json(savedResult);
    } catch(err) {
      next({status: 500, message: err.message});
    }
  });

module.exports = YoutubeSearchResultsRouter;