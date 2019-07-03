'use strict';
const express = require('express');
const publicUsersRouter = express.Router();
const bodyParser = express.json();

publicUsersRouter
  .route('create-video-and-preview')
  .post(bodyParser, async (req, res, next) => {
    res.json({});
  });

module.exports = publicUsersRouter;
// request
// {
//   preview: {
//      thumbnail_url,
//      title,
//      description
//   },
//   video: {
//      title,
//      tags,
//      video_length,
//      youtube_display_name
//     }
//   }
// }

// response
// {
//   video_id,
//   preview_id,
//   thumbnail_url,
//   is_active,
//   title,
//   description
// }