'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const app = express();
const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

const videosRouter = require('./videos/videos-router');
const publicUsersRouter = require('./public-user/public-users-router');
const authRouter = require('./auth/auth-router');
const previewsRouter = require('./previews/previews-router');
const YoutubeSearchResultsRouter = require('./youtube-search-results/youtube-search-results-router');

app.use(morgan(morganOption));
app.use(helmet());
app.use(express.json());

// whitelist allowed origins
const allowedOrigins = ['http://localhost:3000', 'https://laconic.now.sh/', 'https://laconic.now.sh'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin - like mobile apps, curl, postman
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use('/api/auth', authRouter);
app.use('/api/videos', videosRouter);
videosRouter.use('/:video_id/previews', previewsRouter);
videosRouter.use('/:video_id/youtube-search-results', YoutubeSearchResultsRouter);
app.use('/api/public-users', publicUsersRouter);


app.use(errorHandler);

function errorHandler(error, req, res, next) {
  const code = error.status || 500;

  if (NODE_ENV === 'production') {
    error.message = code === 500 ? 'internal server error' : error.message;
  } else {
    console.error(error);
  }

  return res.status(code).json({ message: error.message });
}

module.exports = app;